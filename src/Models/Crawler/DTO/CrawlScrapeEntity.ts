import { ScrapedAdvertisement, ScrapedName } from "../../Scraper";

export interface CrawlScrapeEntity<T> {
  url: string;
  data: T;
}

export class CrawlScrapedName implements CrawlScrapeEntity<ScrapedName[]> {
  url: string;
  data: ScrapedName[];

  constructor(url: string, data: ScrapedName[]) {
    this.url = url;
    this.data = data;
  }

  contains(obj: ScrapedName) {
    return this.data.some((x) => x.name === obj.name);
  }
}

export class CrawlScrapedString implements CrawlScrapeEntity<string[]> {
  url: string;
  data: string[];

  constructor(url: string, data: string[]) {
    this.url = url;
    this.data = data;
  }

  contains(obj: string) {
    return this.data.includes(obj);
  }
}

export class CrawlScrapedAdvertisement implements CrawlScrapeEntity<ScrapedAdvertisement[]> {
  url: string;
  data: ScrapedAdvertisement[];

  constructor(url: string, data: ScrapedAdvertisement[]) {
    this.url = url;
    this.data = data;
  }

  contains(obj: ScrapedAdvertisement) {
    return this.data.some((x) => x.associatedHyperlink === obj.associatedHyperlink);
  }
}
