import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ToBoolean } from "../../../Common";

export class CachedParams {
  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;

  @IsString()
  @IsNotEmpty()
  identifier: string;
}
