import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ToBoolean } from "../../../Common";

export class ScapesByURLQuery {
  @IsString()
  @IsNotEmpty()
  url: string;

  @ToBoolean()
  @IsBoolean()
  includeData: boolean = false;

  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;
}
