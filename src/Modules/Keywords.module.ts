import { Module } from "@nestjs/common";
import { KeywordsController } from "../Controllers/Keywords.controller";
import { KeywordsService } from "../Services/Keywords/Keywords.service";

@Module({
  imports: [],
  controllers: [KeywordsController],
  providers: [KeywordsService],
  exports: [KeywordsService],
})
export class KeywordsModule {}
