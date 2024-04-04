import { Injectable } from "@nestjs/common";
import { load as loadCheerio, Element } from "cheerio";
import { Constants, PuppeteerInstance } from "Common";
import { GoogleSearchResult } from "Models/URLScraper/Google/GoogleSearchResult";

@Injectable()
export class GoogleParserService {
  constructor() {}

  async parse(searchQuery: string): Promise<GoogleSearchResult[]> {
    const puppeteer: PuppeteerInstance = new PuppeteerInstance(true);

    try {
      let retries = 0;
      let results = [];

      while (retries != 3) {
        await puppeteer.goto(searchQuery, Constants.SCRAPER.DEFAULT_TIMEOUT, {
          waituntil: "networkidle0",
        });

        let $ = loadCheerio(await puppeteer.currentPage.content());

        $("h3").each((i: number, el: Element) => {
          results.push(new GoogleSearchResult($(el)));
        });

        if (results.length != 0) break;

        ++retries;
      }

      return results;
    } catch (err) {
      console.log(err);
    } finally {
      await puppeteer.gracefullyClose();
    }
  }
}
