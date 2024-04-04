import { Module } from "@nestjs/common";
import { ScrapeModule } from "./Scrape.module";
import { ScraperController } from "@Controllers";
import { WebshareModule } from "./Webshare.module";
import { ScraperService } from "@Services/Scraper/Scraper.service";

@Module({
  imports: [WebshareModule, ScrapeModule],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
