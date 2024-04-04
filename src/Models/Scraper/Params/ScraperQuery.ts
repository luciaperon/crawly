import { Constants } from "Common";
import { ToBoolean } from "../../../Common/NestJS/ToBoolean";
import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class ScraperQuery {
  @IsString()
  @IsNotEmpty()
  url: string;

  @ToBoolean()
  @IsBoolean()
  useProxy: boolean = true;

  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;

  @IsInt()
  @Min(0)
  timeout: number = Constants.SCRAPER.DEFAULT_TIMEOUT;
}
