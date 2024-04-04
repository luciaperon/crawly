import { IsString, IsNotEmpty, IsInt, Min, IsBoolean, ValidateIf } from "class-validator";
import { ToBoolean } from "../../../Common";

export class SERPQueryParams {
  @IsString()
  @IsNotEmpty()
  searchQuery: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  numOfResults: number;

  @ToBoolean()
  @IsBoolean()
  asCSV: boolean = true;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  outputFilename?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @ToBoolean()
  @IsBoolean()
  saveFile: boolean = true;
}
