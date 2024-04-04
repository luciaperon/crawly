import { IsNotEmpty, IsNumber, IsString, Min, ValidateIf } from "class-validator";

export class CrawlParams {
  @IsNotEmpty()
  url: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  crawlDepth: number;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  outputFilename?: string;
}
