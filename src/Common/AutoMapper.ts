import "automapper-ts";
import { Scrape } from "../Database/schema";
import { ScrapedData } from "../Models/Scraper";
import { CreateScrapeDTO } from "../Models/Scrape/DTO/CreateScrapeDTO";

automapper
  .createMap(ScrapedData.name, Scrape.name)
  .forMember("_id", (opts) => opts.ignore())
  .forMember("__v", (opts) => opts.ignore());

automapper
  .createMap(CreateScrapeDTO.name, Scrape.name)
  .forMember("_id", (opts) => opts.ignore())
  .forMember("__v", (opts) => opts.ignore());
