import _ from "lodash";
import { DateTime } from "luxon";
import deepEqual from "deep-equal";
import { Scrape } from "../../../Database/schema";
import { ScrapeType } from "../../../Common/Types";
import { ScrapedName } from "./Entities/ScrapedName";
import { csvJoin, isNullOrEmpty } from "../../../Common";
import { ScrapedAdvertisement } from "./Entities/ScrapedAdvertisement";
import { ICSVSerializable } from "../../../Common/CSVSerializer/ICSVSerializable";
import { CreateScrapeDTO } from "Models/Scrape/DTO/CreateScrapeDTO";

export class ScrapedData extends ICSVSerializable {
  id: string;
  url: string;
  type: ScrapeType;
  personalNames: ScrapedName[];
  otherNames: ScrapedName[];
  emails: string[];
  socials: string[];
  posts: string[];
  externalURLs: string[];
  advertisements: ScrapedAdvertisement[];
  internalURLs: string[];
  utcTimestamp: number;

  constructor(
    url: string,
    type: ScrapeType,
    personalNames: ScrapedName[],
    otherNames: ScrapedName[],
    emails: string[],
    socials: string[],
    posts: string[],
    externalURLs: string[],
    advertisements: ScrapedAdvertisement[],
    internalURLs: string[],
    utcTimestamp?: number
  ) {
    super();
    this.url = url;
    this.type = type;
    this.personalNames = personalNames || [];
    this.otherNames = otherNames || [];
    this.emails = emails || [];
    this.socials = socials || [];
    this.posts = posts;
    this.externalURLs = externalURLs || [];
    this.advertisements = advertisements || [];
    this.internalURLs = internalURLs || [];
    this.utcTimestamp = utcTimestamp || DateTime.utc().toMillis();
  }

  static fromScrape(scrape: Scrape): ScrapedData {
    if (!scrape) {
      return null;
    }

    const scrapedData = new ScrapedData(
      scrape.url,
      scrape.type,
      scrape.personalNames,
      scrape.otherNames,
      scrape.emails,
      scrape.socials,
      scrape.posts,
      scrape.externalURLs,
      scrape.advertisements,
      scrape.internalURLs,
      scrape.utcTimestamp
    );
    scrapedData.id = scrape._id.toString();

    return scrapedData;
  }

  static fromDTO(dto: CreateScrapeDTO): ScrapedData {
    if (!dto) {
      return null;
    }

    const scrapedData = new ScrapedData(
      dto.url,
      ScrapeType.Initial,
      dto.personalNames.map((x) => new ScrapedName(x.name, x.context)),
      dto.otherNames.map((x) => new ScrapedName(x.name, x.context)),
      dto.emails,
      dto.socials,
      dto.posts,
      dto.externalURLs,
      dto.advertisements,
      dto.internalURLs
    );

    return scrapedData;
  }

  setId(id: string): void {
    this.id = id;
  }

  deduplicate(scrape: ScrapedData): void {
    this.personalNames = this.personalNames.filter((x) => !scrape.personalNames.some((y) => deepEqual(x, y)));
    // this.otherNames = this.otherNames.filter((x) => !scrape.otherNames.some((y) => x.name === y.name));
    this.emails = this.emails.filter((x) => !scrape.emails.some((y) => x === y));
    this.socials = this.socials.filter((x) => !scrape.socials.some((y) => x === y));
    this.posts = this.posts.filter((x) => !scrape.posts.some((y) => x === y));
    this.externalURLs = this.externalURLs.filter((x) => !scrape.externalURLs.includes(x));
    this.advertisements = this.advertisements.filter((x) => !scrape.advertisements.some((y) => deepEqual(x, y)));
  }

  isEmpty(): boolean {
    return (
      this.personalNames.length === 0 &&
      this.otherNames.length === 0 &&
      this.emails.length === 0 &&
      this.socials.length === 0 &&
      this.posts.length === 0 &&
      this.externalURLs.length === 0 &&
      this.advertisements.length === 0
    );
  }

  override serializeAsCSV(): string {
    let csv: string[][] = [];
    csv.push(["Scrape Result For", this.url]);
    csv.push(["NAME", "CONTEXT", "SENTENCES", "HYPERLINKS (text :: link)"]);

    this.personalNames.forEach((sn: ScrapedName) => {
      sn.context.forEach((ctx) => {
        csv.push([
          // sn.name,
          ctx.tag,
          ctx.sentence || "-",
          ctx.hyperlinks.map((hl) => `${hl.text} :: ${hl.link}`).join(", ") || "-",
        ]);
      });
    });

    csv.push(["\n"]);

    csv.push(["NAME", "CONTEXT", "SENTENCES", "HYPERLINKS (text :: link)"]);

    this.otherNames.forEach((sn: ScrapedName) => {
      sn.context.forEach((ctx) => {
        csv.push([
          // sn.name,
          ctx.tag,
          ctx.sentence || "-",
          ctx.hyperlinks.map((hl) => `${hl.text} :: ${hl.link}`).join(", ") || "-",
        ]);
      });
    });

    csv.push(["\n"]);

    csv.push(["EMAIL"]);
    this.emails.forEach((email: string) => {
      csv.push([email]);
    });

    csv.push(["\n"]);

    csv.push(["SOCIAL LINK"]);
    this.socials.forEach((social: string) => {
      csv.push([social]);
    });

    csv.push(["\n"]);

    csv.push(["POST LINK"]);
    this.posts.forEach((posts: string) => {
      csv.push([posts]);
    });

    csv.push(["\n"]);

    csv.push(["EXTERNAL URLs"]);
    this.externalURLs.forEach((url: string) => {
      csv.push([url]);
    });

    csv.push(["\n"]);

    csv.push(["AD IMAGE", "PROBABILITY", "AD LINK"]);
    this.advertisements.forEach((ad: ScrapedAdvertisement) => {
      csv.push([ad.probability.toString(), ad.imgLink, ad.associatedHyperlink]);
    });

    csv.push(["\n"]);

    let formatted = csv.map((x) => csvJoin(x));

    return formatted.join("\n");
  }

  static Builder = class {
    url: string;
    type: ScrapeType;
    personalNames: ScrapedName[];
    otherNames: ScrapedName[];
    emails: string[];
    socials: string[];
    posts: string[];
    externalURLs: string[];
    advertisements: ScrapedAdvertisement[];
    images: string[];
    internalURLs: string[];

    constructor() {
      this.type = ScrapeType.Refresh;
      this.personalNames = [];
      this.otherNames = [];
      this.emails = [];
      this.socials = [];
      this.posts = [];
      this.externalURLs = [];
      this.advertisements = [];
      this.images = [];
    }

    setUrl(url: string) {
      this.url = url;
      return this;
    }

    setType(type: ScrapeType) {
      this.type = type;
      return this;
    }

    setEmails(emails: string[]) {
      if (isNullOrEmpty(emails)) return this;

      this.emails = emails;
      return this;
    }

    setSocials(socials: string[]) {
      if (isNullOrEmpty(socials)) return this;

      this.socials = socials;
      return this;
    }

    setPosts(posts: string[]) {
      if (isNullOrEmpty(posts)) return this;

      this.posts = posts;
      return this;
    }

    setPersonalNames(names: ScrapedName[]) {
      if (isNullOrEmpty(names)) return this;

      this.personalNames = names;
      return this;
    }

    setOtherNames(names: ScrapedName[]) {
      if (isNullOrEmpty(names)) return this;

      this.otherNames = names;
      return this;
    }

    setExternalURLs(urls: string[]) {
      if (isNullOrEmpty(urls)) return this;

      this.externalURLs = urls;
      return this;
    }

    setAdvertisments(advertisements: ScrapedAdvertisement[]) {
      if (isNullOrEmpty(advertisements)) return this;

      this.advertisements = _.orderBy(advertisements, (x) => x.probability, ["desc"]);
      return this;
    }

    setinternalURLs(urls: string[]) {
      if (isNullOrEmpty(urls)) return this;

      this.internalURLs = urls;
      return this;
    }

    build(): ScrapedData {
      return new ScrapedData(
        this.url,
        this.type,
        this.personalNames,
        this.otherNames,
        this.emails,
        this.socials,
        this.posts,
        this.externalURLs,
        this.advertisements,
        // this.images,
        this.internalURLs
      );
    }
  };
}
