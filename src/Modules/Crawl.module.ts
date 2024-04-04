import { Module } from "@nestjs/common";
import { CrawlController } from "@Controllers";
import { MongooseModule } from "@nestjs/mongoose";
import { CrawlDataService } from "@Services/CrawlData/CrawlData.service";
import { CrawlReport, CrawlReportSchema } from "../Database/schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: CrawlReport.name, schema: CrawlReportSchema }])],
  controllers: [CrawlController],
  providers: [CrawlDataService],
  exports: [CrawlDataService],
})
export class CrawlModule {}
