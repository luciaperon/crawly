import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ScrapeModule,
  CrawlModule,
  ScraperModule,
  CrawlerModule,
  StaticModule,
  ToolsModule,
  SERPModule,
  ScaleSERPModule,
  KeywordsModule,
  HomeModule,
} from "@Modules";
import { Crawler } from "../Services/Crawler/Crawler";

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL),
    ScraperModule,
    ScrapeModule,
    CrawlerModule,
    CrawlModule,
    KeywordsModule,
    SERPModule,
    ToolsModule,
    StaticModule,
    ScaleSERPModule,
    HomeModule,
  ],
  providers: [Crawler],
})
export class AppModule {}
