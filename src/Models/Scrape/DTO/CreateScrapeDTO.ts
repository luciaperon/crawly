import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CreateScrapeDTO {
  @IsString()
  url: string;

  @IsArray()
  @ValidateNested()
  @Type(() => ScrapedNameDTO)
  personalNames: ScrapedNameDTO[];

  @IsArray()
  @ValidateNested()
  @Type(() => ScrapedNameDTO)
  otherNames: ScrapedNameDTO[];

  @IsArray()
  @IsString({ each: true })
  emails: string[];

  @IsArray()
  @IsString({ each: true })
  socials: string[];

  @IsArray()
  @IsString({ each: true })
  posts: string[];

  @IsArray()
  @IsString({ each: true })
  externalURLs: string[];

  @IsArray()
  @ValidateNested()
  @Type(() => ScrapedAdvertisementDTO)
  advertisements: ScrapedAdvertisementDTO[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  internalURLs: string[];
}

export class ScrapedHyperlinkDTO {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  link: string;
}

export class ScrapedNameContextDTO {
  @IsString()
  @IsNotEmpty()
  tag: string;

  @IsString()
  sentence: string;

  @IsArray()
  @ValidateNested()
  @Type(() => ScrapedHyperlinkDTO)
  hyperlinks: ScrapedHyperlinkDTO[];
}

export class ScrapedNameDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested()
  @Type(() => ScrapedNameContextDTO)
  context: ScrapedNameContextDTO[];
}

export class ScrapedAdvertisementDTO {
  @IsString()
  imgLink: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  probability: number;

  @IsString()
  associatedHyperlink: string;
}
