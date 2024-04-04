import { Module } from "@nestjs/common";
import { ScrapeController } from "@Controllers";
import { MongooseModule } from "@nestjs/mongoose";
import { Scrape, ScrapeSchema } from "@Database/schema";
import { ScrapeService } from "@Services/Scrape/Scrape.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Scrape.name, schema: ScrapeSchema }])],
  controllers: [ScrapeController],
  providers: [ScrapeService],
  exports: [ScrapeService],
})
export class ScrapeModule {}
