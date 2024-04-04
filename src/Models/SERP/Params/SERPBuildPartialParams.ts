import { IsNotEmpty, ValidateIf, IsString } from "class-validator";

export class SERPBuildPartialParams {
  @IsString()
  @IsNotEmpty()
  tmpDirName: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  outputFilename: string;
}
