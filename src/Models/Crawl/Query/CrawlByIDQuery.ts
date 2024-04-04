import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ToBoolean } from "@Common";

export class CrawlByIDQuery {
  @ToBoolean()
  @IsBoolean()
  includeScrape: boolean;

  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;
}
