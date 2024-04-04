import fs from "fs";
import {
  cleanURL,
  Constants,
  getDateTimestamp,
  PuppeteerInstance,
  InternalURLContext,
  isValidInternalURL,
} from "../../Common";
import { load } from "cheerio";
import Scraper from "../Scraper/Scraper";
import { Injectable } from "@nestjs/common";
import { ScraperBody } from "Models/Scraper/DTO";
import { ScrapedData } from "../../Models/Scraper";
import { JenkinsAPI } from "../JenkinsAPI/JenkinsAPI";
import { ApplicationException, currentDateTime } from "../../Common";
import { CrawledData } from "../../Models/Crawler/Worker/CrawledData";
import { CrawlerPreviewResponse } from "../../Models/Crawler/Response/CrawlerPreviewResponse";
import { FirebaseStorageAdapter } from "../StorageManager/StorageAdapter/FirebaseStorageAdapter";
import { JenkinsJobResponse } from "../../Models/Jenkins/Response/JenkinsJobResponse";
import { StaticScraperData } from "../../Models/Scraper/DTO/StaticScraperData";

@Injectable()
export class CrawlerService {
  private firebaseStorageAdapter: FirebaseStorageAdapter;

  constructor() {
    this.firebaseStorageAdapter = new FirebaseStorageAdapter(process.env.FS_STORAGE_CRAWL_DATA_DIR);
  }

  async crawl(
    baseURL: string,
    crawlDepth: number,
    outputFilename: string,
    body: ScraperBody
  ): Promise<JenkinsJobResponse<any>> {
    try {
      const { JK_CRAWLER_BUILD_URL, JK_CRAWLER_API_KEY, JK_CRAWLER_JOB_NAME } = process.env;
      const fileName: string = outputFilename
        ? outputFilename.replace(".json", "").replace(".csv", "") + ".json"
        : `${new URL(baseURL).hostname}_${getDateTimestamp()}_result.json`;

      const jenkins = new JenkinsAPI(JK_CRAWLER_API_KEY);

      await jenkins.asureNoRunningVitalJobs();
      await this.firebaseStorageAdapter.assureUniqueFile(fileName);

      let parameters = {
        url: cleanURL(baseURL),
        crawlDepth: crawlDepth,
        body: JSON.stringify(body),
        includeInternal: body.url.includeInternal,
        outputFilename: fileName,
        cache: false,
      };

      await jenkins.build(JK_CRAWLER_JOB_NAME, parameters);

      parameters.body = null;
      return new JenkinsJobResponse(`Successfully started crawling job.`, true, {
        buildURL: JK_CRAWLER_BUILD_URL,
        parameters: parameters,
      });
    } catch (err) {
      if (err.message && err.message?.includes("jenkins:")) {
        throw new ApplicationException(err.message.split("jenkins:")[1], err);
      }

      throw err;
    }
  }

  async cachePages(
    baseURL: string,
    crawlDepth: number,
    outputFilename: string,
    body: ScraperBody,
    outputDirname: string,
    override: boolean
  ): Promise<JenkinsJobResponse<any>> {
    try {
      const { JK_CRAWLER_BUILD_URL, JK_CRAWLER_API_KEY, JK_CRAWLER_JOB_NAME } = process.env;
      const dirname: string = outputDirname || new URL(baseURL).hostname.replace(/\./g, "-");
      const fileName: string = outputFilename
        ? outputFilename.replace(".json", "").replace(".csv", "") + ".json"
        : `${new URL(baseURL).hostname}_${getDateTimestamp()}_result.json`;

      const jenkins: JenkinsAPI = new JenkinsAPI(JK_CRAWLER_API_KEY);

      await jenkins.asureNoRunningVitalJobs();

      if (!override) {
        await this.firebaseStorageAdapter.assureUniqueDir(dirname);
      }

      let parameters = {
        url: cleanURL(baseURL),
        crawlDepth: crawlDepth,
        body: JSON.stringify(body),
        outputDirname: dirname,
        includeInternal: body.url.includeInternal,
        outputFilename: fileName,
        cache: true,
      };

      await jenkins.build(JK_CRAWLER_JOB_NAME, parameters);

      return new JenkinsJobResponse(`Successfully started crawling cache job.`, true, {
        buildURL: JK_CRAWLER_BUILD_URL,
        parameters: parameters,
      });
    } catch (err) {
      if (err.message && err.message?.includes("jenkins:")) {
        throw new ApplicationException(err.message.split("jenkins:")[1], err);
      }

      throw err;
    }
  }

  async previewCrawl(baseURL: string, body: ScraperBody): Promise<CrawlerPreviewResponse> {
    let urls: string[] = [];
    let internalURLContext: InternalURLContext = new InternalURLContext(new URL(baseURL), body);
    let staticScrapeData: StaticScraperData = await new StaticScraperData(body).withDynamicKeywords();

    const puppeteer: PuppeteerInstance = new PuppeteerInstance(false);
    await puppeteer.goto(baseURL, Constants.SCRAPER.DEFAULT_TIMEOUT);

    const $ = load(await puppeteer.currentPage.content());

    urls.push(cleanURL(baseURL));

    $("a").each((_, link) => {
      const cleanedURL: string = cleanURL($(link).attr("href"));

      if (!urls.includes(cleanedURL)) {
        if (isValidInternalURL(cleanedURL, internalURLContext, staticScrapeData)) {
          urls.push(cleanedURL);
        }
      }
    });

    await puppeteer.gracefullyClose();

    return new CrawlerPreviewResponse(urls);
  }

  async processCachedData(dirName: string, body: ScraperBody): Promise<CrawledData> {
    const puppeteer: PuppeteerInstance = new PuppeteerInstance(false);
    const keywords = await new StaticScraperData(body).withDynamicKeywords();

    try {
      let dir = fs.readdirSync(`data/Cache/${dirName}`);

      const scrapedData: ScrapedData[] = [];

      for (const file of dir) {
        const fileName = Buffer.from(file.replace(".html", ""), "base64url").toString("ascii");
        console.log(`[${currentDateTime()}] Scraping ${fileName}`);
        await puppeteer.goto(`file://${process.env.PWD}/data/Cache/${dirName}/${file}`, 0, {
          waitUntil: "load",
        });

        const scraper: Scraper = await new Scraper(
          fileName,
          await puppeteer.currentPage.content(),
          puppeteer.currentPage
        ).withData(keywords, body);

        scrapedData.push(await scraper.scrape());
        console.log(`[${currentDateTime()}] Scraped`);
      }

      console.log(`[${currentDateTime()}] Generating data`);
      return new CrawledData.Builder().concat(scrapedData).merge().deduplicate().build();
    } catch (err) {
      console.log(err);
    } finally {
      await puppeteer.gracefullyClose();
    }
  }

  async stopCrawl(buildId: number): Promise<JenkinsJobResponse<any>> {
    try {
      const { JK_CRAWLER_API_KEY, JK_CRAWLER_JOB_NAME } = process.env;
      const jenkins = new JenkinsAPI(JK_CRAWLER_API_KEY);

      const build = await jenkins.getBuild(JK_CRAWLER_JOB_NAME, buildId);

      if (build && build.building === false && build.inProgress === false) {
        throw new ApplicationException("Job already stopped.", { buildId: buildId });
      }

      await jenkins.stopBuild(JK_CRAWLER_JOB_NAME, buildId);

      return new JenkinsJobResponse(`Successfully stopped crawl`, true, buildId);
    } catch (err) {
      if (err.message.includes("jenkins:")) {
        return new JenkinsJobResponse(err.message.split("jenkins:")[1], false, null);
      }

      return new JenkinsJobResponse(`Unexpected error occured. Please try again after a few minutes`, false, null);
    }
  }
}
