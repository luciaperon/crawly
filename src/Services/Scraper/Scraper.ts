import nlp from "compromise/three";
import _ from "lodash";
import { BoundingBox, Frame, Page } from "puppeteer";
import { URLFilter } from "../../Filters/URLFilter";
import { load as LoadCheerio, CheerioAPI, Element, Cheerio, AnyNode } from "cheerio";
import { v4 as uuidv4 } from "uuid";
import {
  InternalURLContext,
  cleanURL,
  stripURL,
  advertisementSizePoints,
  Constants,
  extractContext as extractSentenceContext,
  cleanText,
  isValidInternalURL,
  isNumeric,
} from "../../Common";
import { IScraper } from "../../Models/interfaces";
import {
  ScrapedData,
  StaticScraperData,
  ScraperBody,
  ScrapedName,
  ScrapedAdvertisement,
  ScrapedNameContext,
  ScrapedHyperlink,
} from "../../Models/Scraper";
import { AdvertisementData } from "../../Models/Scraper/AdvertisementData";
import { URLData } from "../../Models/Scraper/URLData";
import { RawFrame } from "../../Models/Scraper/DTO/RawFrame";
import { isCapitalizedSentence } from "../../Common/Helpers";
import { RawName } from "../../Common/Types";
import { convert } from "html-to-text";
import stringSimilarity from "string-similarity";

export default class Scraper implements IScraper<ScrapedData> {
  url: URL;
  constants: StaticScraperData;
  page: Page;
  $: CheerioAPI;
  rawText: string;
  urlFilter: URLFilter;
  body: ScraperBody;
  template: string;
  internalURLContext: InternalURLContext;

  constructor(url: string, html: string, page: Page) {
    this.url = new URL(cleanURL(url));
    this.$ = LoadCheerio(html);
    this.page = page;

    // const $ = this.$;
    // $("noscript").remove();
    // $("script").remove();
    // $("style").remove();
    // $("header").remove();
    // $("footer").remove();

    // this.rawText = $("body *")
    //   .contents()
    //   .map(function () {
    //     return this.type === "text" ? $(this).text() : "";
    //   })
    //   .get()
    //   .join(" ")
    //   .replace(/ +[\n\r]+/g, "\n")
    //   .replace(/\n{2,}/g, "\n");

    this.rawText = convert(html);

    this.urlFilter = new URLFilter(this.url.hostname);
  }

  withData(data: StaticScraperData, body: ScraperBody): Scraper {
    if (!data) {
      throw new Error("Data argumennt is missing.");
    } else if (!body) {
      throw new Error("Body argument is missing.");
    }

    this.body = body;
    this.internalURLContext = new InternalURLContext(this.url, this.body);
    this.constants = data;

    return this;
  }

  async withBody(body: ScraperBody): Promise<Scraper> {
    this.body = body;

    this.internalURLContext = new InternalURLContext(this.url, this.body);
    this.constants = await new StaticScraperData(body).withDynamicKeywords();

    return this;
  }

  cleanName(raw: string): string {
    return raw
      .trim()
      .replace("’", "'")
      .replace(/[^a-zA-Z0-9\ "]/g, "")
      .replace(/ {2,}/g, "");
  }

  async scrape(): Promise<ScrapedData> {
    // Possible Names
    const nlpResults = nlp(this.rawText);

    let personalNames: RawName[] = _.uniqBy(
      nlpResults
        .people()
        .json()
        .filter((nlpPeople) => nlpPeople.person.firstName && nlpPeople.person.lastName)
        .map((person) => `${_.capitalize(person.person.firstName)} ${_.capitalize(person.person.lastName)}`)
        .filter((name: string) => name)
        .map((name: string) => new RawName(name, this.cleanName(name))),
      (rawName: RawName) => rawName.cleaned
    );

    let otherNames: RawName[] = _.uniqBy(
      nlpResults
        .nouns()
        .json()
        .map((nlpNouns) => nlpNouns.text)
        .filter((name: string) => name)
        .map((name: string) => new RawName(name, this.cleanName(name)))
        .filter(
          (name: RawName) =>
            name &&
            isCapitalizedSentence(name.cleaned) &&
            !isNumeric(name) &&
            !personalNames.some((y) => y.cleaned.includes(name.cleaned)) &&
            !this.constants.fullyBlacklistedKeywords.includes(name.cleaned) &&
            !name.cleaned.containsAny(this.constants.partiallyBlacklistedKeywords)
        ),
      (rawName: RawName) => rawName.cleaned
    );

    let personalNamesWithContext: ScrapedName[] = personalNames
      .map((rawName: RawName) => new ScrapedName(rawName.cleaned, this.getScrapedNameContext(rawName)))
      .filter((x: ScrapedName) => x.context.length !== 0);

    let otherNamesWithConext: ScrapedName[] = otherNames
      .map((rawName: RawName) => new ScrapedName(rawName.cleaned, this.getScrapedNameContext(rawName)))
      .filter((x: ScrapedName) => x.context.length !== 0);

    // Emails
    let emails: string[] = _.uniq(this.rawText.match(this.constants.emailRegex)) || [];

    // All URLs
    let urls: URLData[] = Array.from(this.rawText.matchAll(this.constants.socialMediaRegex) || [])
      .map((x) => {
        return new URLData("url", { url: new URL(cleanURL(x.groups.url)) });
      })
      .concat(
        this.extractAnchors().map((x: URL) => {
          return new URLData("url", { url: x });
        })
      )
      .concat(
        this.extractIframes().map((x: URL) => {
          return new URLData("url", { url: x });
        })
      )
      .filter(
        (x) =>
          !x.data.url.href.containsAny(this.constants.socialMediaShareKeywords) &&
          !x.data.url.href.containsAny(this.constants.forbiddenExternalURLsKeywords)
      );

    // Exclue CDN (potentially)
    if (!this.body.url.includeCDN) {
      urls = urls.filter((x) => !x.data.url.href.includes("cdn"));
    }

    // Advertisements
    let uniqueAdvertisements = (await this.extractAdvertisements())
      .map((x) => new ScrapedAdvertisement(x.src, x.probability, x.parent.href))
      .sort((x) => x.probability);

    urls = urls.filter(
      (x) => !uniqueAdvertisements.some((y) => y.associatedHyperlink == x.data.url.href || y.imgLink == x.data.url.href)
    );

    let partitions = [];

    // Internal URLs
    let internalURLs: string[] = [];

    if (this.body.url.includeInternal) {
      partitions = _.partition(
        urls,
        (x: URLData) =>
          x.source == "url" && isValidInternalURL(x.data.url.href, this.internalURLContext, this.constants)
      );

      internalURLs = _.uniq(partitions[0].map((x: URLData) => x.data.url.href.replace("www.", "")));

      urls = partitions[1];
    } else {
      urls = urls.filter(
        (x) => x.source == "url" && !x.data.url.hostname.containsAny(this.internalURLContext.internalKeywords)
      );
    }

    // Social Networks
    partitions = _.partition(urls, (x: URLData) => x.data.url.hostname.containsAny(this.constants.socialMediaKeywords));

    let socialNetworks: string[] = _.uniq(
      partitions[0]
        .filter((x: URLData) => !x.data.url.hostname.containsAny(this.constants.socialMediaBlacklistKeywords))
        .map((x: URLData) => stripURL(x.data.url.href))
    );
    urls = _.uniq(partitions[1]);

    // Social Posts
    partitions = _.partition(socialNetworks, (x: string) => x.containsAny(this.constants.socialMediaPostKeywords));

    let socialPosts: string[] = partitions[0];
    socialNetworks = partitions[1];

    // External URLS
    let externalUrls = _.uniq(
      urls
        .filter((x: URLData) => !x.data.url.href.containsAny(this.constants.forbiddenExternalURLsKeywords))
        .map((x: URLData) => stripURL(x.data.url.hostname))
    );

    return new ScrapedData.Builder()
      .setUrl(cleanURL(this.url.href))
      .setPersonalNames(personalNamesWithContext)
      .setOtherNames(otherNamesWithConext)
      .setEmails(emails)
      .setSocials(socialNetworks)
      .setPosts(socialPosts)
      .setAdvertisments(uniqueAdvertisements)
      .setExternalURLs(externalUrls)
      .setinternalURLs(internalURLs)
      .build();
  }

  findTextHyperlinks(element: AnyNode, text: string): ScrapedHyperlink[] {
    return Array.from(this.$(element).find("a"))
      .map((a) => new ScrapedHyperlink(cleanText(this.$(a).text()), this.$(a).attr("href")))
      .filter(
        (scrapedHyperlink) =>
          scrapedHyperlink.text !== text &&
          scrapedHyperlink.link[0] !== "/" &&
          isValidInternalURL(scrapedHyperlink.link, this.internalURLContext, this.constants)
      );
  }

  getScrapedNameContext(rawName: RawName): ScrapedNameContext[] {
    const $ = this.$;

    let context: ScrapedNameContext[] = [];
    const contentTags = Constants.SCRAPER.TEXT_TAGS;
    const name = rawName.raw;

    contentTags.forEach((tag) => {
      try {
        $(`${tag}:contains("${rawName.cleaned}")`).each((_, el) => {
          let tagText: string = cleanText($(el).text());

          let sentence: string = extractSentenceContext(tagText, name);

          if (tag == "span" && sentence && sentence.length == 0 && tagText.length <= 30) {
            sentence = tagText;
          }

          if (sentence && stringSimilarity.compareTwoStrings(sentence, name) < 0.8) {
            context.push(
              new ScrapedNameContext(Constants.TAG_MAP[tag], sentence, this.findTextHyperlinks(el, sentence))
            );
          }
        });
      } catch (err) {
        console.log(name, err);
      }
    });

    const headingTags = Constants.SCRAPER.HEADING_TAGS;
    headingTags.forEach((tag) => {
      $(`${tag}:contains("${rawName.cleaned}")`).each((_, el: AnyNode) => {
        try {
          const sentence: string = cleanText($(el).text());

          if (sentence && stringSimilarity.compareTwoStrings(sentence, name) < 0.8) {
            context.push(
              new ScrapedNameContext(Constants.TAG_MAP[tag], sentence, this.findTextHyperlinks(el, sentence))
            );
          }
        } catch (err) {
          console.log(name, err);
        }
      });
    });

    const listTags = Constants.SCRAPER.LIST_TAGS;
    listTags.forEach((tag) => {
      $(`${tag}:contains("${rawName.cleaned}")`).each((_, el) => {
        try {
          let innerAnchor: Cheerio<Element> = $(el).find("a");
          let sentence: string = "";

          if (innerAnchor) {
            sentence = innerAnchor.text();
          } else {
            sentence = $(el).text();
          }

          sentence = cleanText(sentence);

          if (sentence && stringSimilarity.compareTwoStrings(sentence, name) < 0.8) {
            context.push(
              new ScrapedNameContext(Constants.TAG_MAP[tag], sentence, this.findTextHyperlinks(el, sentence))
            );
          }
        } catch (err) {
          console.log(name, err);
        }
      });
    });

    // Anchor
    $(`a:contains("${rawName.cleaned}")`).each((_, el) => {
      try {
        const sentence = cleanText($(el).text());

        if (stringSimilarity.compareTwoStrings($(el).parent().text(), sentence) >= 0.85) {
          return;
        }

        context.push(new ScrapedNameContext(Constants.TAG_MAP["a"], sentence, []));
      } catch (err) {
        console.log(name, err);
      }
    });

    _.orderBy(context, (ctx: ScrapedNameContext) => ctx.sentence.length, "asc").forEach(
      (ctx: ScrapedNameContext, i: number) => {
        context.forEach((x: ScrapedNameContext, j: number) => {
          if (
            i !== j &&
            (x.sentence.includes(ctx.sentence) || stringSimilarity.compareTwoStrings(x.sentence, ctx.sentence) >= 0.8)
          ) {
            context.splice(i, 1);
          }
        });
      }
    );

    return context;
  }

  extractIframes(): URL[] {
    let iframes = [];

    this.$("iframe").each((_, link) => {
      let src: string = cleanURL(this.$(link).attr("src"));

      if (src && src[0] == "/") {
        src = `https://${this.url.hostname}${src}`;
      }

      let url: URL = this.urlFilter.apply(src);
      if (url == null) return;

      iframes.push(url);
    });

    return _.uniqBy(iframes, (x: URL) => x.href);
  }

  extractAnchors(): URL[] {
    const $ = this.$;
    let links = [];

    $("a").each((_, link: Element) => {
      let href: string = cleanURL($(link).attr("href"));

      if (href && href[0] == "/") {
        href = this.url.hostname + href;
      }

      let url: URL = this.urlFilter.apply(href);
      if (url == null) return;

      links.push(url);
    });

    return _.uniqBy(links, (x: URL) => x.href);
  }

  async extractAdvertisements(): Promise<AdvertisementData[]> {
    if (!this.page) {
      return [];
    }

    const rawIframeData: RawFrame[] = await Promise.all(
      this.page.frames().map(async (frame: Frame) => {
        return {
          frame: frame,
          html: await frame.evaluate(() => {
            return document.getElementsByTagName("body")[0].outerHTML;
          }, {}),
        };
      })
    );

    let [gwdGoogleAds, otherIframes]: [RawFrame[], RawFrame[]] = _.partition(rawIframeData, (x) =>
      x.html.includes("<gwd-google-ad")
    );

    let iframesAds: AdvertisementData[] = await this.extractIframeAdvertisements(otherIframes);
    let googleAds: AdvertisementData[] = await this.extractGwdGoogleAdvertisements(gwdGoogleAds);

    return [...iframesAds, ...googleAds];
  }

  async extractGwdGoogleAdvertisements(rawFrames: RawFrame[]): Promise<AdvertisementData[]> {
    return await Promise.all(
      rawFrames.map(async (iframe: RawFrame) => {
        const imageId: string = uuidv4();
        const boundingBox: BoundingBox = await (await iframe.frame.$("html")).boundingBox();

        let src: string = "";

        try {
          let timeout: NodeJS.Timeout = setTimeout(() => {
            throw new Error("Screenshot took too long");
          }, 5000);

          src = `${process.env.ADS_IMAGE_API_URL}/${imageId}.png`;

          await this.page.screenshot({
            path: `${process.env.ADS_IMAGE_PATH}/${imageId}.png`,
            clip: {
              x: boundingBox.x,
              y: boundingBox.y,
              width: boundingBox.width,
              height: boundingBox.height,
            },
          });

          clearTimeout(timeout);
        } catch (err) {
          console.log(err);
          src = "No static image available for this Google AD";
        }

        return new AdvertisementData({
          src: src,
          height: null,
          width: null,
          classList: null,
          probability: 100,
          parent: {
            tag: "gwd-google-ad",
            href: LoadCheerio(iframe.html)("gwd-exit").attr("url"),
            target: "_blank",
          },
        });
      })
    );
  }

  async extractIframeAdvertisements(rawFrames: RawFrame[]): Promise<AdvertisementData[]> {
    let rawData = rawFrames.map(async (iframe: RawFrame) => {
      return await iframe.frame.evaluate(() => {
        return [...document.getElementsByTagName("img")].map((x) => {
          let src = x.getAttribute("src");
          if (!src || !x.parentElement || src.includes(",base64,")) {
            return;
          }

          return {
            src: src,
            height: x.clientHeight,
            width: x.clientWidth,
            classList: x.classList,
            probability: 0,
            parent: {
              tag: x.parentElement.tagName,
              target: x.parentElement.getAttribute("target"),
              href: x.parentElement.getAttribute("href"),
            },
          };
        });
      }, {});
    });

    return _.flatMap(await Promise.all(rawData))
      .map((adData) => {
        if (
          !adData ||
          !adData.src ||
          adData.height == 0 ||
          adData.width == 0 ||
          !adData.parent.href ||
          this.internalURLContext.internalKeywords.some((y) => adData.parent.href.includes(y)) ||
          adData.src.includes("logo") ||
          this.constants.socialMediaKeywords.some((y) => y.includes(adData.src))
        ) {
          return null;
        }

        if (adData.src) {
          // If it's a internal link replace the origin with
          if (adData.src[0] == "/" && adData.src[1] != "/") {
            adData.src = this.url + adData.src.replace("/", "");
          }

          //Replace space with encoded space
          adData.src = adData.src.replace(/ /g, `%20`);
        }

        if (adData.parent.href) {
          // If it's a internal link replace the origin with
          if (adData.parent.href[0] == "/" && adData.src[1] != "/") {
            return null;
          }

          //Replace space with encoded space
          adData.parent.href = adData.parent.href.replace(/ /g, `%20`);
        }

        let probability: number = 0;

        probability += this.constants.advertisersKeywords.filter((y) => adData.src.includes(y)).length * 2;

        probability += advertisementSizePoints(adData.width, adData.height);

        if (adData.parent && adData.parent.href) {
          probability += this.constants.advertisersKeywords.filter((y) => adData.parent.href.includes(y)).length * 2;

          if (adData.parent.target == "_blank") {
            probability += 1;
          }

          if (!this.url.href.includes(adData.parent.href)) {
            probability += adData.parent.target == "_blank" ? 1 : 2;
          } else {
            probability -= 1;
          }
        } else {
          return null;
        }

        if (probability <= 0) {
          return null;
        }

        adData.probability = probability;

        adData.src = cleanURL(adData.src);
        adData.parent.href = cleanURL(adData.parent.href);

        return new AdvertisementData(adData);
      })
      .filter((x) => x);
  }
}
