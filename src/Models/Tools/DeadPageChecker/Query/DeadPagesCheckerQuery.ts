import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ToBoolean } from "../../../../Common";

export class DeadPagesCheckerQuery {
  @IsString()
  @IsNotEmpty()
  websiteColumnName: string;

  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;
}
