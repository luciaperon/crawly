import { IsNotEmpty } from "class-validator";

export class CrawlPreviewParams {
  @IsNotEmpty()
  url: string;
}
