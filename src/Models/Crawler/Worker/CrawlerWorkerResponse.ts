import { FailedCrawlReport } from "..";
import { ScrapedData } from "../../Scraper";

export class CrawlerWorkerResponse {
  allScrapedData: ScrapedData[];
  internalURLs: string[];
  failedReports: FailedCrawlReport[];

  constructor(crawlScrapeBuilder: ScrapedData[], internalURLs: string[], failedReports: FailedCrawlReport[]) {
    this.allScrapedData = crawlScrapeBuilder;
    this.internalURLs = internalURLs;
    this.failedReports = failedReports;
  }
}
