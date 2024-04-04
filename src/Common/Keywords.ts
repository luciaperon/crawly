import ab2str from "arraybuffer-to-string";
import { FirebaseStorageAdapter } from "../Services/StorageManager/StorageAdapter/FirebaseStorageAdapter";

export class Keywords {
  private storageAdapter: FirebaseStorageAdapter;

  FULLY_BLACKLISTED_KEYWORDS: string[] = [];
  PARTIALLY_BLAKLISTED_KEYWORDS: string[] = [];
  FORBIDDEN_EXTENSIONS: string[] = [];

  constructor() {
    this.storageAdapter = new FirebaseStorageAdapter(process.env.FS_KEYWORDS_DIR);
  }

  async withDynamicContent(): Promise<Keywords> {
    // Get all full keywords file names and add them to the keywords
    const fullNegativeKeywordsFilePaths: string[] = (await this.storageAdapter.listAll("Full")).items
      .map((x) => x.fullPath.replace(process.env.FS_KEYWORDS_DIR, ""))
      .filter((x) => !x.includes("_bckp"));

    for (const filePath of fullNegativeKeywordsFilePaths) {
      this.FULLY_BLACKLISTED_KEYWORDS = this.FULLY_BLACKLISTED_KEYWORDS.concat(
        ab2str(await this.storageAdapter.getFile(filePath))
          .split("\n")
          .filter((x) => x)
      );
    }

    // Get all partial keywords file names and add them to the keywords
    const partialNegativeKeywordsFileList: string[] = (await this.storageAdapter.listAll("Partial")).items
      .map((x) => x.fullPath.replace(process.env.FS_KEYWORDS_DIR, ""))
      .filter((x) => !x.includes("_bckp"));

    for (const filePath of partialNegativeKeywordsFileList) {
      this.PARTIALLY_BLAKLISTED_KEYWORDS = this.PARTIALLY_BLAKLISTED_KEYWORDS.concat(
        ab2str(await this.storageAdapter.getFile(filePath))
          .split("\n")
          .filter((x) => x)
      );
    }

    this.FORBIDDEN_EXTENSIONS = ab2str(await this.storageAdapter.getFile("Extensions.txt"))
      .split("\n")
      .filter((x) => x);

    return this;
  }

  static SOCIAL_MEDIA_KEYWORDS: string[] = [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "linkedin.com",
    "soundcloud.com",
  ];
  static SOCIAL_MEDIA_KEYWORDS_BLACKLIST: string[] = ["lm.facebook.com"];
  static SOCIAL_MEDIA_SHARE_KEYWORDS: string[] = ["/share", "mailto", "/sharer.php", "/shareArticle", "/intent/tweet"];
  static SOCIAL_MEDIA_POSTS_KEYWORDS: string[] = ["/post.php", "/p/", "/status/", "/embed/"];
  static ADS_KEYWORDS: string[] = [
    "googleads.g.doubleclick.net",
    "adsrvr",
    "adsnetwork",
    "-ad-",
    "-Ad-",
    "-AD-",
    "-ads-",
    "/ads/",
    "advertisement",
    "adId",
  ];
  static FORBIDDEN_EXTERNAL_URLS: string[] = [
    "safeframe.googlesyndication.com",
    "static.addtoany.com",
    "servedbyadbutler.com",
  ];

  static FOR_SALE_PAGES_KEYWORDS: string[] = [
    "this domain is for sale",
    "this domain is for sale!",
    "domain for sale",
    "under construction",
  ];
}
