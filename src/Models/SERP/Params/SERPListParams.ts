import { IsString, ValidateIf } from "class-validator";

export class SERPListParams {
  @IsString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  name?: string;

  @IsString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  startDate?: string;

  @IsString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  endDate?: string;
}
