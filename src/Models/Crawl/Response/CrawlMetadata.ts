import { DateTime } from "luxon";
import { Constants } from "Common";
import { ObjectId } from "mongoose";
import { CrawlReport } from "Database/schema";

export class CrawlMetadata {
  crawlId: ObjectId;
  crawlDataBuckerRef: String;
  url: string;
  runDate: string;
  finishedOn: string;
  jobId: number;
  processedPages: number;
  successCount: number;
  histogram: string[];

  constructor(crawl: CrawlReport) {
    this.crawlId = crawl._id;
    this.crawlDataBuckerRef = crawl.dataBucketRef;
    this.url = crawl.url;
    this.runDate = crawl.runDate;
    if (crawl.utcMilliseconds) {
      this.finishedOn = DateTime.fromMillis(crawl.utcMilliseconds).toFormat(Constants.FULL_DATE_TIME_FORMAT);
    } else {
      this.finishedOn = DateTime.now().toFormat(Constants.FULL_DATE_TIME_FORMAT);
    }
    this.processedPages = crawl.processedPage;
    this.successCount = crawl.successCount;
    this.histogram = crawl.histogram;
  }
}
