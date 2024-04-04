import { IsNotEmpty, IsString } from "class-validator";

export class SavedFileParams {
  @IsString()
  @IsNotEmpty()
  fileName: string;
}
