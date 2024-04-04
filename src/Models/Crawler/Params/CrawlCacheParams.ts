import { IsBoolean, IsNotEmpty, IsNumber, IsString, Min, ValidateIf } from "class-validator";
import { ToBoolean } from "../../../Common";

export class CrawlCacheParams {
  @IsNotEmpty()
  url: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  crawlDepth: number;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  outputDirname?: string;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  outputFilename?: string;

  @IsBoolean()
  @ToBoolean()
  override: boolean;
}
