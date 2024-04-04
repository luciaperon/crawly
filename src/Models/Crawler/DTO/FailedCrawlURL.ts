export class FailedCrawlURL {
  attempts: number;
  url: string;

  constructor(attempts: number, url: string) {
    this.attempts = attempts;
    this.url = url;
  }
}
