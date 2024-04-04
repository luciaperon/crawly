import { ToBoolean } from "../../../Common";
import { IsBoolean, IsNotEmpty, IsNumber, IsString, Min, ValidateIf } from "class-validator";

export class CrawlGetCacheParams {
  @IsString()
  @IsNotEmpty()
  dirName: string;
}
