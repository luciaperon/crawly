import { REGEX } from "../../../Common";
import { ScraperBody } from "./ScraperDTO";
import { Keywords } from "../../../Common/Keywords";

export class StaticScraperData {
  fullyBlacklistedKeywords: string[];
  partiallyBlacklistedKeywords: string[];
  namesRegex: RegExp;

  emailRegex: RegExp;

  socialMediaRegex: RegExp;
  socialMediaKeywords: string[];
  socialMediaBlacklistKeywords: string[];
  socialMediaShareKeywords: string[];
  socialMediaPostKeywords: string[];

  forbiddenExtensions: string[];

  advertisersKeywords: string[];

  forbiddenExternalURLsKeywords: string[];

  constructor(body: ScraperBody) {
    this.fullyBlacklistedKeywords = body.name.fullNegativeKeywords;
    this.partiallyBlacklistedKeywords = body.name.partialNegativeKeywords;
    this.namesRegex = new RegExp(REGEX.name);

    this.emailRegex = new RegExp(REGEX.email);

    this.socialMediaRegex = new RegExp(REGEX.socialMedia);
    this.socialMediaKeywords = Keywords.SOCIAL_MEDIA_KEYWORDS.concat(body.socialMedia.keywords);
    this.socialMediaBlacklistKeywords = Keywords.SOCIAL_MEDIA_KEYWORDS_BLACKLIST;
    this.socialMediaPostKeywords = Keywords.SOCIAL_MEDIA_POSTS_KEYWORDS.concat(body.socialMedia.shareKeywords);
    this.socialMediaShareKeywords = Keywords.SOCIAL_MEDIA_SHARE_KEYWORDS.concat(body.socialMedia.postKeywords);

    this.advertisersKeywords = Keywords.ADS_KEYWORDS.concat(body.advertisement.keywords);

    this.forbiddenExternalURLsKeywords = Keywords.FORBIDDEN_EXTERNAL_URLS.concat(body.externalURLs.keywords);
  }

  async withDynamicKeywords(): Promise<StaticScraperData> {
    const dynamicKeywords: Keywords = await new Keywords().withDynamicContent();

    this.fullyBlacklistedKeywords = dynamicKeywords.FULLY_BLACKLISTED_KEYWORDS.concat(this.fullyBlacklistedKeywords);
    this.partiallyBlacklistedKeywords = dynamicKeywords.PARTIALLY_BLAKLISTED_KEYWORDS.concat(
      this.partiallyBlacklistedKeywords
    );
    this.forbiddenExtensions = dynamicKeywords.FORBIDDEN_EXTENSIONS;

    return this;
  }
}
