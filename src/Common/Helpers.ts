import fs from "fs";
import _ from "lodash";
import path from "path";
import archiver from "archiver";
import { DateTime } from "luxon";
import { Keywords } from "./Keywords";
import { Constants } from "./Constants";
import { ScraperBody } from "../Models/Scraper";
import { CrawledData } from "../Models/Crawler/Worker/CrawledData";
import { StaticScraperData } from "../Models/Scraper/DTO/StaticScraperData";

export function isNullOrEmpty(param: any[]) {
  return param == null || param.length == 0;
}

declare global {
  interface Array<T> {
    partition(this: T[], predicate: (e: T) => boolean): T[][];
    ensureNotNull(this: T[]): T[];
    remove(this: T[], to: T[]): void;
    listContainsAny(a: T[], b: T[]): boolean;
  }

  interface String {
    containsAny(keywords: string[]): boolean;
  }

  interface Number {
    formatBytes(): string;
  }
}

if (!Array.prototype.partition) {
  Array.prototype.partition = function <T>(this: T[], predicate: (e: T) => boolean): T[][] {
    return this.reduce<T[][]>(
      ([pass, fail], elem) => {
        (predicate(elem) ? pass : fail).push(elem);
        return [pass, fail];
      },
      [[], []]
    );
  };
}

if (!Array.prototype.ensureNotNull) {
  Array.prototype.ensureNotNull = function <T>(this: T[]): T[] {
    return isNullOrEmpty(this) ? [] : this;
  };
}

if (!Number.prototype.formatBytes) {
  Number.prototype.formatBytes = function () {
    var units = ["B", "KB", "MB", "GB", "TB"],
      bytes = this,
      i;

    for (i = 0; bytes >= 1024 && i < 4; i++) {
      bytes /= 1024;
    }

    return `${bytes.toFixed(2)} ${units[i]}`;
  };
}

/**
 * Method used to see if the given string is contained in keywords that are passed as parameter.
 * @param this
 */
if (!String.prototype.containsAny) {
  String.prototype.containsAny = function (this: string, keywords: string[]): boolean {
    return keywords.some((x) => this.includes(x));
  };
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function currentDateTime(): string {
  return DateTime.utc().toFormat("HH:mm:ss");
}

export const advertisementSizePoints = (x: number, y: number): number => {
  let sizes = Constants.ADVERTISEMENTS.imgSizes;

  for (let i = 0; i < sizes.length; ++i) {
    let [xSize, ySize]: [number, number] = [sizes[i][0], sizes[i][1]];

    if (x - 3 <= xSize && xSize <= x + 3 && y - 3 <= ySize && ySize <= y + 3) {
      return 2;
    } else if (x - 10 <= xSize && xSize <= x + 10 && y - 10 <= ySize && ySize <= y + 10) {
      return 1;
    }
  }

  return 0;
};

export function csvJoin(row: string[], separator: string = "|") {
  return row.join(separator);
}

export function isNumeric(value: any): boolean {
  return /^-?\d+$/.test(value);
}

export function serializeCrawlScrapeAsCSV(crawledData: CrawledData): string {
  let csv: string[][] = [];
  csv.push(["\n"]);
  csv.push(["Personal Name", "Context", "Sentences", "Link Text", "Link"]);

  crawledData.personalNames.forEach((pn) => {
    if (!pn.context) {
      csv.push([pn.name, "-", "-", "-", "-"]);
      return;
    }

    pn.context.forEach((ctx) => {
      csv.push([
        pn.name,
        ctx.tag,
        ctx.sentence || "-",
        ctx.hyperlinks.length === 0
          ? "-"
          : ctx.hyperlinks.length === 1
          ? ctx.hyperlinks[0].text
          : ctx.hyperlinks.map((hl) => hl.text).join(", "),
        ctx.hyperlinks.length === 0
          ? "-"
          : ctx.hyperlinks.length === 1
          ? ctx.hyperlinks[0].link
          : ctx.hyperlinks.map((hl) => hl.link).join(", "),
      ]);
    });
  });
  csv.push(["\n"]);

  csv.push(["Other Name", "Context", "Sentences", "Link Text", "Link"]);
  crawledData.otherNames.forEach((on) => {
    if (!on.context) {
      csv.push([on.name, "-", "-", "-", "-"]);
      return;
    }

    on.context.forEach((ctx) => {
      csv.push([
        on.name,
        ctx.tag,
        ctx.sentence || "-",
        ctx.hyperlinks.length === 0
          ? "-"
          : ctx.hyperlinks.length === 1
          ? ctx.hyperlinks[0].text
          : ctx.hyperlinks.map((hl) => hl.text).join(", "),
        ctx.hyperlinks.length === 0
          ? "-"
          : ctx.hyperlinks.length === 1
          ? ctx.hyperlinks[0].link
          : ctx.hyperlinks.map((hl) => hl.link).join(", "),
      ]);
    });
  });

  csv.push(["\n"]);

  csv.push(["Email"]);
  crawledData.emails.forEach((email) => {
    csv.push([email]);
  });

  csv.push(["\n"]);

  csv.push(["Social Link"]);
  crawledData.socials.forEach((social) => {
    csv.push([social]);
  });

  csv.push(["\n"]);

  csv.push(["Posts Link"]);
  crawledData.posts.forEach((post) => {
    csv.push([post]);
  });

  csv.push(["\n"]);

  csv.push(["External URL"]);
  crawledData.externalURLs.forEach((eURL) => {
    csv.push([eURL]);
  });

  csv.push(["\n"]);

  csv.push(["Advertisement Probability", "Ad Image", "Ad Link"]);
  crawledData.advertisements.forEach((ad) => {
    csv.push([ad.probability?.toString() || "0", ad.imgLink, ad.associatedHyperlink]);
  });

  csv.push(["\n"]);
  return csv.map((x) => csvJoin(x.map((y) => y && y.replace(";", ",")))).join("\n");
}

export function extractContext(text: string, keyword: string): string {
  let keywordStart: number = text.indexOf(keyword);

  if (keywordStart == -1) {
    return null;
  }

  let whitespaces = 0;

  let context = "";

  for (let p = keywordStart; p !== 0; --p) {
    context += text[keywordStart - p];

    if (text[p] === " ") {
      ++whitespaces;
    } else {
      whitespaces = 0;
    }

    if (text[p] === "." || text[p] === "\n" || whitespaces === 2) {
      break;
    }
  }

  whitespaces = 0;

  for (let q = keywordStart; q !== text.length; ++q) {
    context += text[q];

    if (text[q] === " ") {
      ++whitespaces;
    } else {
      whitespaces = 0;
    }

    if (text[q] === "." || text[q] === "\n" || whitespaces === 2) {
      break;
    }
  }

  return context;
}

export function cleanURL(str: string) {
  if (!str) return null;

  return str.replace(/^(.+?)\/*?$/, "$1").replace("%2F", "/");
}

export function cleanInternalURL(str: string) {
  if (!str) return null;

  return str
    .replace(/^(.+?)\/*?$/, "$1")
    .replace("%2F", "/")
    .replace(/\?.*/g, "")
    .replace(/\/?#.*/g, "");
}

export function stripURL(url: string) {
  if (!url) return null;

  return url.replace(/https?:\/\/|www./g, "");
}

export class InternalURLContext {
  baseURL: URL;
  body: ScraperBody;
  isInternalWhitelist: boolean = true;
  internalKeywords: string[];
  checkKeywords: (url: URL) => boolean;

  constructor(baseURL: URL, body: ScraperBody) {
    this.baseURL = baseURL;
    this.body = body;
    const { internalKeywordsWhitelist, internalKeywordsBlacklist } = this.body.url;

    // Clean the URL and get the hostname
    const url: string = new URL(this.baseURL).host.replace("https://", "").replace("www.", "");

    // Generate all possiblities of URLS (with prefix) of the BaseURL
    const internalBaseURLs: string[] = [`https://www.${url}`, `https://${url}`, `www.${url}`];

    if (internalKeywordsWhitelist.length !== 0) {
      // If the internalKeywordsWhitelist property is set, take base internal URLs and those who are whitelisted
      this.isInternalWhitelist = true;
      this.internalKeywords = internalKeywordsWhitelist;
    } else if (internalKeywordsBlacklist.length !== 0) {
      // If the internalKeywordsBlacklist property is set, take only those who are blacklisted
      this.isInternalWhitelist = false;
      this.internalKeywords = internalKeywordsBlacklist;
    } else {
      // If this property is not specified, consider internal only those URLs that contain the baseURL
      this.isInternalWhitelist = true;
      this.internalKeywords = [...internalBaseURLs];
    }

    // Assign a function that will check the keywords based on the isInternalWhitelist property

    // Whitelist checks if the keyword is present anywhare in the string while the blacklist also checks if the baseURL is the same as the origin page
    //fix issue with wayback machine https://nesto.com/https://domena

    this.checkKeywords = this.isInternalWhitelist
      ? (url: URL): boolean => url.origin.containsAny(this.internalKeywords)
      : (url: URL): boolean => url.origin.includes(this.baseURL.href) && !url.origin.containsAny(this.internalKeywords);
  }
}

export function expandURL(url: string): string {
  try {
    let href: string;

    if (url.includes("googleads.g.doubleclick.net")) {
      href = cleanURL(new URLSearchParams(url).get("adurl"));
    } else if (url.includes("servedbyadbutler.com")) {
      href = cleanURL(new URLSearchParams(url).get("referrer"));
    }

    return href || url;
  } catch (err) {
    return url;
  }
}

export function isValidURL(url: string): URL {
  try {
    return new URL(url);
  } catch (err) {
    return null;
  }
}

export function getDateTimestamp() {
  return DateTime.now().setZone("America/Los_Angeles").toFormat("yyyy-MM-dd_HH:mm:ss");
}

export function parseInputFileName(fileName: string) {
  return `${process.env.TMP_UPLOADS_DIR}/${fileName.replace(/ /g, "").replace(".csv", `_${simpleID(4)}.csv`)}`;
}

export function parseOutputFileName(identifier: string, fileName: string, timestamp: boolean = true) {
  if (fileName) {
    return fileName.replace(/ /g, "").includes(".csv") ? fileName : `${fileName}.csv`;
  } else {
    if (identifier.includes("https://www.google.com")) {
      const params: URLSearchParams = new URLSearchParams(identifier);
      identifier = params.get("https://www.google.com/search?q") || params.get("q") || params.get("query") || "formula";
    }

    if (timestamp) {
      return `${identifier.replace(/ |_/g, "-")}_${getDateTimestamp()}_result.csv`;
    } else {
      return `${identifier.replace(/ |_|.csv/g, "-")}.csv`;
    }
  }
}

export function isValidInternalURL(
  cleanURL: string,
  internalURLContext: InternalURLContext,
  staticScraperData: StaticScraperData
) {
  try {
    const validURL: URL = isValidURL(cleanURL);

    if (
      cleanURL &&
      validURL &&
      !validURL.pathname.containsAny(staticScraperData.forbiddenExtensions) &&
      !validURL.href.containsAny(Keywords.FORBIDDEN_EXTERNAL_URLS) &&
      internalURLContext.checkKeywords(validURL)
    ) {
      return cleanURL;
    }

    return null;
  } catch (err) {
    return null;
  }
}

export function cleanText(text: string): string {
  return text
    .replace(/\n|\t| {2,}/g, "   ")
    .replace(/"|\'|;|,|“|”$/g, "")
    .replace(/–/g, "-")
    .replace(/’/g, "'")
    .trim();
}

export function encodeUTF8(input: string): string {
  return unescape(encodeURIComponent(input));
}

export function mergeByName<T>(arr: T[], key: string): T[] {
  return (
    _(arr)
      .groupBy((item) => {
        // group the items using the lower case
        return item[key].toLowerCase();
      })
      .map((group) => {
        // map each group
        return _.mergeWith.apply(
          _,
          [{}].concat(group, function (obj, src) {
            // merge all items, and if a property is an array concat the content
            if (Array.isArray(obj)) {
              return obj.concat(src);
            }
          })
        );
      })
      // @ts-ignore
      .values() // get the values from the groupBy object
      .value()
  );
}

export function stringToSerializableJSON(json: string): string {
  return encodeUTF8(JSON.stringify(json).replace(/\\r?\\n|\\r|\\n|( {5,})/g, ""));
}

export function simpleID(length: number) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function cleanName(name: string) {
  return name.replace(/\(|\)|\[|\]|\{|\}/g, "");
}

/**
 * @param {String} sourcePath\: /some/folder/to/compress
 * @param {String} outPath: /path/to/created.zip
 * @returns {Promise<void>}
 */
export function zipFile(sourcePath: string, outPath: string): Promise<void> {
  const inputFileName: string = path.basename(sourcePath);
  const output = fs.createWriteStream(`${outPath}/${inputFileName.replace(path.extname(sourcePath), ".zip")}`);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    archive
      .append(fs.readFileSync(sourcePath).toString(), { name: inputFileName })
      .on("error", (err) => reject(err))
      .pipe(output);

    output.on("close", () => resolve());
    archive.finalize();
  });
}

export function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

export function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export function isCapitalizedWord(word: string): boolean {
  try {
    let split = word.split("");
    if (split.length === 0) return false;
    return split[0] === split[0].toUpperCase();
  } catch (err) {
    return false;
  }
}

export function isCapitalizedSentence(sentence: string): boolean {
  return sentence.split(" ").every((y) => isCapitalizedWord(y));
}
