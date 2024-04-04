import _ from "lodash";
import Scraper from "./Scraper";
import nlp from "compromise/three";
import { Scrape } from "@Database/schema";
import { Injectable } from "@nestjs/common";
import { ScrapeType } from "../../Common/Types";
import { ScraperBody, ScrapedData } from "Models/Scraper";
import { ScrapeService } from "@Services/Scrape/Scrape.service";
import { ApplicationException, PuppeteerInstance } from "@Common";

@Injectable()
export class ScraperService {
  constructor(private scrapeService: ScrapeService) {}

  async scrape(url: string, useProxy: boolean, timeout: number, body: ScraperBody): Promise<ScrapedData> {
    let scrapedData: ScrapedData[] = await this.scrapeService.findAllByURL(url);

    // if (scrapedData.length > 0) {
    //   return await this.scrapeRefresh(url, useProxy, timeout, body, scrapedData);
    // }

    const puppeteer: PuppeteerInstance = new PuppeteerInstance(useProxy);

    try {
      await puppeteer.goto(url, timeout);

      const scraper: Scraper = await new Scraper(
        url,
        await puppeteer.currentPage.content(),
        puppeteer.currentPage
      ).withBody(body);

      const scrapedData: ScrapedData = await scraper.scrape();
      scrapedData.type = ScrapeType.Initial;

      // await this.scrapeService.create(automapper.map(ScrapedData.name, Scrape.name, scrapedData));

      return scrapedData;
    } finally {
      await puppeteer.gracefullyClose();
    }
  }

  async scrapeRefresh(
    url: string,
    useProxy: boolean,
    timeout: number,
    body: ScraperBody,
    previousScrapes?: ScrapedData[]
  ): Promise<ScrapedData> {
    if (!previousScrapes) {
      previousScrapes = await this.scrapeService.findAllByURL(url);

      if (previousScrapes.length <= 0) {
        throw new ApplicationException(
          "Page was never scraped before",
          "You can't refresh this page because it was never scraped before. First go to the '/scrape' route and scrape it, then you can refresh it if you want."
        );
      }
    }

    const puppeteer: PuppeteerInstance = await new PuppeteerInstance(useProxy).initializeBrowser();

    try {
      await puppeteer.goto(url, timeout);

      const scraper: Scraper = await new Scraper(
        url,
        await puppeteer.currentPage.content(),
        puppeteer.currentPage
      ).withBody(body);

      let scrapeData: ScrapedData = await scraper.scrape();
      scrapeData.type = ScrapeType.Refresh;

      previousScrapes.forEach((x) => {
        scrapeData.deduplicate(x);
      });

      if (scrapeData.isEmpty()) {
        return null;
      }

      return await this.scrapeService.create(automapper.map(ScrapedData.name, Scrape.name, scrapeData));
    } finally {
      await puppeteer.gracefullyClose();
    }
  }

  async companyNames(url: string, useProxy: boolean, timeout: number, body: ScraperBody): Promise<any> {
    const puppeteer: PuppeteerInstance = new PuppeteerInstance(useProxy);

    try {
      await puppeteer.goto(url, timeout);

      const scraper: Scraper = await new Scraper(
        url,
        await puppeteer.currentPage.content(),
        puppeteer.currentPage
      ).withBody(body);

      let organizations: string[] = _.uniq(
        nlp(scraper.rawText)
          .organizations()
          .json()
          .map((x) => x.text.replace(/ {2,}/g, ""))
      );

      let nouns: string[] = _.uniq(
        nlp(scraper.rawText)
          .nouns()
          .json()
          .map((x) => x.text.replace(/ {2,}/g, ""))
          .filter((x) => x.split("")[0] === x.split("")[0].toUpperCase())
      );

      return {
        organizations: organizations,
        nouns: nouns,
      };
    } finally {
      await puppeteer.gracefullyClose();
    }
  }
}
