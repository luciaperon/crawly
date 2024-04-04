import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ToBoolean } from "../../../../Common";

export class DeadPageCheckerQuery {
  @IsString()
  @IsNotEmpty()
  url: string;

  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;
}
