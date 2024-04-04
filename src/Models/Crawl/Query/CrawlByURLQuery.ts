import { ToBoolean } from "../../../Common";
import { IsNotEmpty, IsString } from "class-validator";

export class CrawlByURLQuery {
  @IsString()
  @IsNotEmpty()
  url: string;

  @ToBoolean()
  _: string;
}
