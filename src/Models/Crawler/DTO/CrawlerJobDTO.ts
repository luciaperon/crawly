import { Type } from "class-transformer";
import { ScraperBody } from "../../Scraper/DTO/ScraperDTO";

export class CrawlerJobDTO {
  cache: boolean = false;
  baseURL: string;
  crawlDepth: number;
  body: ScraperBody;
  outputFilename: string;
  includeInternal: boolean = false;

  maxWorkers: number = 1;

  outputDirname: string;

  constructor(
    cache: boolean,
    baseURL: string,
    crawlDepth: number,
    body: ScraperBody,
    outputFilename: string,
    includeInternal: boolean,
    maxWorkers: number
  ) {
    this.cache = cache;
    this.baseURL = baseURL;
    this.crawlDepth = crawlDepth;
    this.body = body;
    this.outputFilename = outputFilename;
    this.includeInternal = includeInternal;
    this.maxWorkers = maxWorkers;
  }

  withCacheParameters(outputDirname: string) {
    this.outputDirname = outputDirname;

    return this;
  }
}
