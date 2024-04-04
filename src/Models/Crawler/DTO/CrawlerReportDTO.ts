import { FailedCrawlReport } from "./FailedCrawlReport";

export class CrawlReportDTO {
  id: string;
  url: string;
  runDate: string;
  reachedDepth: number;
  processedPage: number;
  successCount: number;
  histogram: string[];
  fails: FailedCrawlReport[];
  crawlDataBuckerRef: string;
  utcMilliseconds: number;

  constructor(
    url: string,
    reachedDepth: number,
    runDate: string,
    processedPage: number,
    successCount: number,
    historgram: string[],
    fails: FailedCrawlReport[],
    crawlDataBuckerRef: string,
    utcMilliseconds: number
  ) {
    this.url = url;
    this.reachedDepth = reachedDepth;
    this.runDate = runDate;
    this.processedPage = processedPage;
    this.successCount = successCount;
    this.histogram = historgram;
    fails.forEach((x) => {
      if (x) x.reason = x.reason.trim().replace(/\n/g, "   ").replace(/\t/g, "  ");
    });
    this.fails = fails;
    this.crawlDataBuckerRef = crawlDataBuckerRef;
    this.utcMilliseconds = utcMilliseconds;
  }

  setId(id: string) {
    this.id = id;
  }
}
