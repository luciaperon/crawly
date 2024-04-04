import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ToBoolean } from "Common";

export class SERPSearchParams {
  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;

  @IsString()
  @IsNotEmpty()
  identifier: string;
}
