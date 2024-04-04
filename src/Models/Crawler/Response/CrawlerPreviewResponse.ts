export class CrawlerPreviewResponse {
  numberOfLinks: number;
  urls: string[];

  constructor(initialURLs: string[]) {
    this.numberOfLinks = initialURLs.length;
    this.urls = initialURLs;
  }
}
