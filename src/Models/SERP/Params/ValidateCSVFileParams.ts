import { IsNotEmpty, IsString } from "class-validator";

export class ValidateCSVFileParams {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  columnName: string;
}
