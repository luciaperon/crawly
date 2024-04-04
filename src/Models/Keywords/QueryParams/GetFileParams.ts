import { IsNotEmpty, IsNumber, IsString, ValidateIf } from "class-validator";

export class GetFileParams {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  search: string;

  @IsNumber()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  lastNWords: number;
}
