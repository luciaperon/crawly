import { IsInt, ValidateIf, IsNotEmpty, IsString, Min, IsBoolean } from "class-validator";
import { ToBoolean } from "../../../Common";

export class SERPBatchQueryParams {
  @IsString()
  @IsNotEmpty()
  queryColumnName: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  numOfResults: number;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  outputFilename?: string;

  @IsString()
  @IsNotEmpty()
  location?: string;

  @ToBoolean()
  @IsBoolean()
  saveFile: boolean = true;
}
