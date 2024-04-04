import { IsBoolean } from "class-validator";
import { ToBoolean } from "../../../Common";

export class ScrapesByIdParams {
  @ToBoolean()
  @IsBoolean()
  includeData: boolean = false;

  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;
}
