import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { ScrapedData } from "Models/Scraper";
import { InjectModel } from "@nestjs/mongoose";
import { Scrape, ScrapeDocument } from "@Database/schema";

@Injectable()
export class ScrapeService {
  constructor(@InjectModel(Scrape.name) private scrapeModel: Model<ScrapeDocument>) {}

  async findAllByURL(url: string): Promise<ScrapedData[]> {
    return (await this.scrapeModel.find({ url: url })).map((x) => ScrapedData.fromScrape(x));
  }

  async findOneById(id: string): Promise<ScrapedData> {
    return ScrapedData.fromScrape(await this.scrapeModel.findById(id));
  }

  async findOneByURL(url: string): Promise<ScrapedData> {
    return ScrapedData.fromScrape(await this.scrapeModel.findOne({ url: url }));
  }

  async create(scrape: ScrapedData): Promise<ScrapedData> {
    return ScrapedData.fromScrape(await this.scrapeModel.create(scrape));
  }

  async deleteById(id: string): Promise<number> {
    return (await this.scrapeModel.deleteOne({ _id: id })).deletedCount;
  }

  async deleteByURL(url: string): Promise<number> {
    return (await this.scrapeModel.deleteMany({ url: url })).deletedCount;
  }
}
