import fse from "fs-extra";
import { expose } from "threads/worker";
import Scraper from "../Scraper/Scraper";
import { cleanInternalURL } from "../../Common/Helpers";
import { FailedCrawlReport } from "../../Models/Crawler";
import { currentDateTime, PuppeteerInstance } from "../../Common";
import { FailedCrawlURL } from "../../Models/Crawler/DTO/FailedCrawlURL";
import { ScraperBody, ScrapedData, StaticScraperData } from "../../Models/Scraper";
import { CrawlerWorkerResponse } from "../../Models/Crawler/Worker/CrawlerWorkerResponse";

expose(async function deepScrape(
  thread: number,
  shouldCache: boolean,
  internalLinks: string[],
  scraperData: StaticScraperData,
  body: ScraperBody,
  outputDirname: string
): Promise<CrawlerWorkerResponse> {
  let tmpInternalURLs: string[] = [];
  let histogram: string[] = [];

  let scrapes: ScrapedData[] = [];
  let failReports: FailedCrawlReport[] = [];
  let retryURLs: FailedCrawlURL[] = [];
  let queue: string[] = [];

  let puppeteer: PuppeteerInstance = await new PuppeteerInstance(false).initializeBrowser();

  try {
    internalLinks.forEach((x) => queue.push(x));

    while (queue.length !== 0) {
      const currentPageURL: string = queue.pop();

      try {
        const res = await Promise.race([puppeteer.goto(currentPageURL, 2500), countdown(25000)]);
        if (res && res === "TIMEOUT") {
          throw new Error("Puppeteer timeout. Retrying...");
        }

        const pageContent: string = await puppeteer.currentPage.content();

        if (shouldCache) {
          await fse.outputFile(
            `data/Cache/${outputDirname}/${Buffer.from(currentPageURL).toString("base64url")}.html`,
            pageContent
          );
        }

        let response: ScrapedData = await new Scraper(
          currentPageURL,
          await puppeteer.currentPage.content(),
          puppeteer.currentPage
        )
          .withData(scraperData, body)
          .scrape();
        histogram.push(currentPageURL);
        response.internalURLs
          .map((x) => cleanInternalURL(x))
          .forEach((x) => !histogram.includes(x) && tmpInternalURLs.push(x));

        scrapes.push(response);

        logScraped(currentPageURL, thread);
      } catch (err) {
        let retriedURL: FailedCrawlURL = retryURLs.find((x) => x.url === currentPageURL);

        if (retriedURL) {
          if (retriedURL.attempts === 2) {
            failReports.push(new FailedCrawlReport(currentPageURL, 3, err.stack.toString()));
            queue = queue.filter((x) => x !== currentPageURL);
            logError(`${currentPageURL}`, err, thread);
          } else {
            ++retriedURL.attempts;
            queue.push(currentPageURL);
          }
        } else {
          retryURLs.push(new FailedCrawlURL(0, currentPageURL));
          queue.push(currentPageURL);
        }
      }
    }
  } catch (err) {
    logError(`[Thread-${thread}]`, err, thread);
  } finally {
    await puppeteer.gracefullyClose();
  }

  return new CrawlerWorkerResponse(scrapes, tmpInternalURLs, failReports);
});

function countdown(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms, "TIMEOUT");
  });
}

function logScraped(message: string, thread: number): void {
  console.log(`[${currentDateTime()}] [SCRAPED] [Thread-${thread}] ${message}`);
}

function logError(message: string, err: any, thread: number): void {
  console.log(
    `[${currentDateTime()}] [ERROR] [Thread-${thread}] ${message} ${err.message}  ${
      err.stack ? `\n${err.stack}` : "Unknow Stack."
    }`
  );
}
