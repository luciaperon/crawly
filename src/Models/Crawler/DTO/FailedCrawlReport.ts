export class FailedCrawlReport {
  url: string;
  count: number;
  reason: string;

  constructor(url: string, count: number, message: string) {
    this.url = url;
    this.count = count;
    this.reason = message;
  }
}
