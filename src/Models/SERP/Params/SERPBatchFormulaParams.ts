import { IsInt, ValidateIf, IsNotEmpty, IsString, Min } from "class-validator";

export class SERPBatchFormulaParams {
  @IsString()
  @IsNotEmpty()
  formulaColumnName: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  numOfResults: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  outputFilename?: string;
}
