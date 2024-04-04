import { IsInt, IsNotEmpty, Min, ValidateIf } from "class-validator";

export class SERPBatchLogsParams {
  @IsInt()
  @Min(0)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  buildId?: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  lastNLines?: number;
}
