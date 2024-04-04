import fs from "fs";
import {
  Queue,
  cleanURL,
  Constants,
  currentDateTime,
  cleanInternalURL,
  PuppeteerInstance,
  InternalURLContext,
  isValidInternalURL,
  stringToSerializableJSON,
} from "../../Common";
import _ from "lodash";
import { load } from "cheerio";
import { DateTime } from "luxon";
import str2ab from "string-to-arraybuffer";
import { Pool, Worker, spawn } from "threads";
import mongoose, { Mongoose, Model } from "mongoose";
import { StaticScraperData, ScraperBody } from "../../Models/Scraper";
import { CrawledData } from "../../Models/Crawler/Worker/CrawledData";
import { CrawlReport, CrawlReportSchema } from "../../Database/schema";
import { FirebaseStorageAdapter } from "../StorageManager/StorageAdapter/FirebaseStorageAdapter";
import { CrawlReportDTO, FailedCrawlReport, CrawlerJobDTO, CrawlerWorkerResponse } from "../../Models/Crawler";
var SegfaultHandler = require("segfault-handler");

export class Crawler {
  puppeteer: PuppeteerInstance;
  histogram: string[];
  crawlReport: CrawlReportDTO;
  runDate: string;
  maxWorkers: number;
  pool: Pool<any>;
  queue: Queue<string>;
  failedReports: FailedCrawlReport[];
  baseUrl: string;
  crawlDepth: number;
  keywords: StaticScraperData;
  keepInternals: boolean;
  includeInternal: boolean;
  internalURLContext: InternalURLContext;
  body: ScraperBody;
  jobData: CrawlerJobDTO;
  mongoConn: Mongoose;
  isInterrupted: boolean;
  crawlDocument: Model<CrawlReport>;
  urlExtractionFailsCount: number;
  outputFilename: string;
  shouldCache: boolean;
  outputDirname?: string;
  firebaseStorageAdapter: FirebaseStorageAdapter;

  async initialize(params: CrawlerJobDTO): Promise<Crawler> {
    try {
      this.baseUrl = cleanURL(params.baseURL);
      this.crawlDepth = params.crawlDepth;
      this.body = params.body;
      this.outputFilename = params.outputFilename.includes(".json")
        ? params.outputFilename
        : `${params.outputFilename}.json`;
      this.keepInternals = params.includeInternal;
      this.shouldCache = params.cache;
      this.outputDirname = params.outputDirname;

      if (!this.baseUrl || this.crawlDepth < 0) {
        throw new Error("Insufficient or invalid arguments provided for Crawler.");
      }
      SegfaultHandler.registerHandler("crash.log");

      const URLComponent: URL = new URL(this.baseUrl);
      this.internalURLContext = new InternalURLContext(URLComponent, this.body);
      this.runDate = DateTime.now().toFormat(Constants.FULL_DATE_TIME_FORMAT);
      this.keywords = await new StaticScraperData(params.body).withDynamicKeywords();
      this.queue = new Queue();
      this.histogram = [];
      this.failedReports = [];
      this.jobData = params;
      this.isInterrupted = false;
      this.body.url.includeInternal = true;
      this.maxWorkers = params.maxWorkers;
      this.urlExtractionFailsCount = 0;
      this.firebaseStorageAdapter = new FirebaseStorageAdapter(process.env.FS_STORAGE_CRAWL_DATA_DIR);

      this.logInfo(`Initialized Crawler.`);

      await this.initializeDependencies();

      return this;
    } catch (err) {
      this.logError(err.message, err);
      throw err;
    }
  }

  async crawl(): Promise<CrawlReportDTO> {
    try {
      await this.extractInitialURLs();

      let reachedCrawlLayer: number = 1;

      let tmpinternalURLs: string[] = [];
      let crawledData = new CrawledData.Builder();

      while (reachedCrawlLayer <= this.crawlDepth) {
        try {
          this.logInfo(`Scraping layer ${reachedCrawlLayer}/${this.crawlDepth}.`);

          try {
            const crawlThreads = [];
            this.pool = Pool(() => spawn(new Worker("./CrawlerWorker")), this.maxWorkers);

            // Equally distribute load on all Threads (max = this.maxWorkers)
            const urlsPerThread: number = Math.ceil(this.queue.size() / this.maxWorkers);
            const chunks: string[][] = _.chunk(this.queue.raw(), urlsPerThread > 1 ? urlsPerThread : 1);

            // Enqueue Threads
            for (let i = 0; i < chunks.length; ++i) {
              if (!chunks[i]) {
                break;
              }

              this.logInfo(`Started worker process for the next ${chunks[i].length} URLs on thread ${i}.`);
              crawlThreads.push(
                this.pool.queue((batchScrape) =>
                  batchScrape(i, this.shouldCache, chunks[i], this.keywords, this.body, this.outputDirname)
                )
              );
            }

            // Await all Threads
            let crawlWorkerResponses: CrawlerWorkerResponse[] = await Promise.all(crawlThreads);

            this.logInfo("All Threads Completed.");
            this.logInfo("Concating results from threads...");

            // Merge all Threads reponse
            crawlWorkerResponses.forEach((csr: CrawlerWorkerResponse) => {
              this.failedReports.push(...csr.failedReports);
              tmpinternalURLs.push(...csr.internalURLs);
              crawledData.concat(csr.allScrapedData);
            });

            this.logInfo("Merging results...");
            crawledData.merge();

            this.logInfo("Deduplicating...");
            crawledData.deduplicate();

            await this.pool.terminate(true);
          } catch (err) {
            this.logError(`An error occurred on layer ${reachedCrawlLayer}`, err);
            await this.pool.terminate(true);
          }

          // Add Successful URLs to histogram
          this.histogram.push(...this.queue.raw());
          this.queue.clear();

          // Enqueue only new internal URLs
          _.uniq(tmpinternalURLs)
            .map((x) => cleanInternalURL(x))
            .filter((x) => !this.histogram.includes(x))
            .forEach((x) => this.queue.pushURL(x));
          tmpinternalURLs = [];

          if (this.queue.size() === 0) {
            this.logInfo(`No more new URLs found. Last layer ${reachedCrawlLayer}.`);
            break;
          }

          this.logInfo(`Found ${this.queue.size()} new URLs for the next layer.`);
        } catch (err) {
          this.logError(`An error occurred on layer ${reachedCrawlLayer}`, err);
          await this.pool.terminate(true);
        } finally {
          reachedCrawlLayer += 1;
        }
      }

      this.logInfo(`Saving Crawl Scrape to File System...`);
      let crawlDataBuckerRef: string = await this.saveCrawledData(crawledData.build());

      if (crawlDataBuckerRef === null) {
        throw new Error("Unable to save data to File System. Aborting...");
      }

      this.logInfo(`Generating report...`);
      this.crawlReport = new CrawlReportDTO(
        this.baseUrl,
        reachedCrawlLayer,
        this.runDate,
        this.histogram.length + this.failedReports.length,
        this.histogram.length,
        this.histogram,
        this.failedReports,
        crawlDataBuckerRef,
        DateTime.utc().toMillis()
      );

      this.logInfo(`Saving Crawl Report to database...`);
      let crawlReportId: string = await this.saveReport(this.crawlReport);

      this.crawlReport.setId(crawlReportId);

      return this.crawlReport;
    } catch (err) {
      this.logError("Error occured during the crawling process.", err);
      await this.shutdown();
      throw err;
    } finally {
      await this.shutdown();
    }
  }

  async initializeDependencies(): Promise<void> {
    await this.initializePuppeteer();
    await this.initializeMongoose();
  }

  async initializeMongoose(): Promise<void> {
    try {
      this.mongoConn = await mongoose.connect(process.env.MONGO_URL);
      this.crawlDocument = this.mongoConn.model("CrawlReport", CrawlReportSchema);
      this.logInfo(`Initialized Dependencies [MongoDB, Puppeteer].`);
    } catch (err) {
      this.logError("Failed to initialize MongoDB", err);
    }
  }

  async initializePuppeteer(): Promise<Crawler> {
    this.puppeteer = await new PuppeteerInstance(false).initializeBrowser();
    this.logInfo(`Initialized Puppeteer.`);
    return this;
  }

  async extractInitialURLs(): Promise<void> {
    try {
      if (!this.puppeteer) {
        throw new Error(`Puppeteer not initialized.`);
      }

      this.logInfo(`Extracting initial URLs from website: ${this.baseUrl}.`);
      await this.puppeteer.goto(this.baseUrl, Constants.SCRAPER.DEFAULT_TIMEOUT);

      this.logInfo(`Loading HTML in Cheerio.`);
      const $ = load(await this.puppeteer.currentPage.content());

      this.queue.pushURL(this.baseUrl);

      this.logInfo(
        `Scraping links that ${this.internalURLContext.isInternalWhitelist ? "include" : "exclude"} keywords [${
          this.internalURLContext.internalKeywords
        }].`
      );

      $("a").each((_, link) => {
        const cleanedURL: string = cleanURL($(link).attr("href"));

        if (!this.queue.includes(cleanedURL)) {
          if (isValidInternalURL(cleanedURL, this.internalURLContext, this.keywords)) {
            this.queue.pushURL(cleanedURL);
          }
        }
      });

      this.logInfo(`Extracted ${this.queue.size()} initial links.`);
    } catch (err) {
      ++this.urlExtractionFailsCount;

      if (this.urlExtractionFailsCount < 2) {
        this.logInfo(`An error occurred during URL extraction. Retrying...`);
        await this.extractInitialURLs();
      } else {
        this.logError(`URL Extraction failed. Retries made: ${this.urlExtractionFailsCount}`, err);
        throw err;
      }
    } finally {
      await this.puppeteer.gracefullyClose();
    }
  }

  async saveCrawledData(crawlData: any): Promise<string> {
    try {
      const rawData: string = stringToSerializableJSON(crawlData);

      fs.writeFileSync(`data/Tmp/${this.outputFilename}`, rawData, "utf-8");

      // await this.firebaseStorageAdapter.uploadFile(this.outputFilename, str2ab(rawData), {
      //   contentType: "application/json",
      // });

      // if (fs.existsSync(`data/Tmp/${this.outputFilename}`)) {
      //   fs.rmSync(`data/Tmp/${this.outputFilename}`);
      // }

      this.logInfo("Successfully saved Crawl Scrape to File System.");

      return `${process.env.FS_STORAGE_CRAWL_DATA_DIR}/${this.outputFilename}`;
    } catch (err) {
      this.logError("Failed to save Crawl Scrape to File System.", err);
      return null;
    }
  }

  async saveReport(crawlReport: CrawlReportDTO): Promise<string> {
    try {
      const id = await (await this.crawlDocument.create(crawlReport)).id;

      if (id == null || id == undefined) throw new Error("ID null or undefined.");

      this.logInfo("Successfully saved Crawl Report to database.");
      return id;
    } catch (err) {
      this.logError("Failed to save Crawl Report to database.", err);
      return null;
    }
  }

  async shutdown(): Promise<void> {
    try {
      this.logInfo("Attempting to shutdown dependencies...");

      if (this.puppeteer) {
        await this.puppeteer.browser.close();
        this.logInfo(`[Puppeteer] Closed browser.`);
      }

      if (this.pool) {
        await this.pool.terminate(true);
        this.logInfo(`[Threads] Terminated Pool.`);
      }

      if (this.mongoConn && this.mongoConn.connection) {
        await this.mongoConn.connection.close();
        this.logInfo(`[Mongoose] Closed connection.`);
      }
    } catch (err) {
      this.logError("Failed to shutodwn crawler.", err);
    }
  }

  logInfo(message: string): void {
    console.log(`[${currentDateTime()}] [INFO] ${message}`);
  }

  logError(message: string, err: any): void {
    console.log(
      `[${currentDateTime()}] [ERROR] ${message} ${err.message}  ${err.stack ? `\n${err.stack}` : "Unknow Stack."}`
    );
  }
}

(async () => {
  async function process_nocache(
    baseURL: string,
    crawlDepth: number,
    outputFilename: string,
    includeInternal: boolean,
    body: ScraperBody
  ) {
    let crawlerResponse = await (
      await new Crawler().initialize(
        new CrawlerJobDTO(
          false,
          baseURL,
          crawlDepth,
          body,
          outputFilename,
          includeInternal,
          Number(process.env.MAX_WORKERS)
        )
      )
    ).crawl();

    console.log(crawlerResponse);
    console.log("Exiting...\n");

    process.exit(0);
  }

  async function process_cache(
    baseURL: string,
    crawlDepth: number,
    outputFilename: string,
    includeInternal: boolean,
    body: ScraperBody,
    outputDirname: string
  ) {
    let crawlerResponse = await (
      await new Crawler().initialize(
        new CrawlerJobDTO(
          true,
          baseURL,
          crawlDepth,
          body,
          outputFilename,
          includeInternal,
          Number(process.env.MAX_WORKERS)
        ).withCacheParameters(outputDirname)
      )
    ).crawl();

    console.log(crawlerResponse);
    console.log("Exiting...\n");

    process.exit(0);
  }

  const myArgs = process.argv.slice(2);

  if (myArgs.length === 5) {
    await process_nocache(
      myArgs[0],
      Number(myArgs[1]),
      myArgs[2],
      myArgs[3] === "true",
      JSON.parse(myArgs[4]) as ScraperBody
    );
  } else if (myArgs.length === 6) {
    await process_cache(
      myArgs[0],
      Number(myArgs[1]),
      myArgs[2],
      myArgs[3] === "true",
      JSON.parse(myArgs[4]) as ScraperBody,
      myArgs[5]
    );
  }
})();
