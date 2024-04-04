import { ToBoolean } from "../../../Common/NestJS/ToBoolean";
import { IsArray, IsBoolean, IsString, ValidateNested } from "class-validator";

class NameOptions {
  @IsArray()
  @IsString({ each: true })
  fullNegativeKeywords: string[] = [];

  @IsArray()
  @IsString({ each: true })
  partialNegativeKeywords: string[] = [];
}

class SocialMediaOptions {
  @IsArray()
  @IsString({ each: true })
  keywords: string[] = [];

  @IsArray()
  @IsString({ each: true })
  shareKeywords: string[] = [];

  @IsArray()
  @IsString({ each: true })
  postKeywords: string[] = [];
}

class URLOptions {
  @IsArray()
  @IsString({ each: true })
  internalKeywordsWhitelist: string[];

  @IsArray()
  @IsString({ each: true })
  internalKeywordsBlacklist: string[];

  @ToBoolean()
  @IsBoolean()
  includeCDN: boolean = true;

  @ToBoolean()
  @IsBoolean()
  includeInternal: boolean = false;
}

class AdvertisementsOptions {
  @IsArray()
  @IsString({ each: true })
  keywords: string[] = [];
}

class ImageOptions {
  @ToBoolean()
  @IsBoolean()
  includeInternal: boolean = false;
}

class ExternalURLOptions {
  @IsArray()
  @IsString({ each: true })
  keywords: string[] = [];
}

export class ScraperBody {
  @ValidateNested()
  name: NameOptions = new NameOptions();

  @ValidateNested()
  socialMedia: SocialMediaOptions = new SocialMediaOptions();

  @ValidateNested()
  url: URLOptions = new URLOptions();

  @ValidateNested()
  image: ImageOptions = new ImageOptions();

  @ValidateNested()
  advertisement: AdvertisementsOptions = new AdvertisementsOptions();

  @ValidateNested()
  externalURLs: ExternalURLOptions = new ExternalURLOptions();
}
