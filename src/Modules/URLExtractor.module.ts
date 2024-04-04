import { Module } from "@nestjs/common";
import { GoogleParserService } from "@Services/GoogleParser/GoogleParser.service";

@Module({
  imports: [],
  controllers: [],
  providers: [GoogleParserService],
})
export class URLExtractorModule {}
