import { IsString, ValidateIf } from "class-validator";

export class ListKeywordsParams {
  @IsString()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  subdirectory: string;
}
