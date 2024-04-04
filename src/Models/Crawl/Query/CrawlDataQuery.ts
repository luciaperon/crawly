import { ToBoolean } from "../../../Common";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CrawlDataQuery {
  @IsString()
  @IsNotEmpty()
  firebaseStoragePath: string;

  @IsBoolean()
  @ToBoolean()
  asCSV: boolean;
}
