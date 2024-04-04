import { Module } from "@nestjs/common";
import { CrawlerController } from "@Controllers";
import { MongooseModule } from "@nestjs/mongoose";
import { CrawlModule } from "@Modules";
import { CrawlerService } from "@Services/Crawler/Crawler.service";
import { Scrape, ScrapeSchema } from "@Database/schema/Scrape.schema";

@Module({
  imports: [CrawlModule, MongooseModule.forFeature([{ name: Scrape.name, schema: ScrapeSchema }])],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}
