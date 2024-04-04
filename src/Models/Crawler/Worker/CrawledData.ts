import _ from "lodash";
import { isNullOrEmpty, mergeByName } from "../../../Common";
import { ScrapedAdvertisement, ScrapedData, ScrapedName } from "../../Scraper";

export class CrawledData {
  url: string;
  personalNames: ScrapedName[];
  otherNames: ScrapedName[];
  emails: string[];
  socials: string[];
  posts: string[];
  externalURLs: string[];
  advertisements: ScrapedAdvertisement[];

  constructor(
    personalNames?: ScrapedName[],
    otherNames?: ScrapedName[],
    emails?: string[],
    socials?: string[],
    posts?: string[],
    externalURLs?: string[],
    advertisements?: ScrapedAdvertisement[]
  ) {
    this.personalNames = personalNames || [];
    this.otherNames = otherNames || [];
    this.emails = emails || [];
    this.socials = socials || [];
    this.posts = posts || [];
    this.externalURLs = externalURLs || [];
    this.advertisements = advertisements || [];
  }

  public static Builder = class {
    url: string;
    personalNames?: ScrapedName[];
    otherNames?: ScrapedName[];
    emails?: string[];
    socials?: string[];
    posts?: string[];
    externalURLs?: string[];
    advertisements?: ScrapedAdvertisement[];

    constructor() {
      this.personalNames = [];
      this.otherNames = [];
      this.emails = [];
      this.socials = [];
      this.posts = [];
      this.externalURLs = [];
      this.advertisements = [];
    }

    concat(scrpedData: ScrapedData[]) {
      this.personalNames = this.personalNames.concat(_.flatMap(scrpedData.map((x) => x.personalNames)));
      this.otherNames = this.otherNames.concat(_.flatMap(scrpedData.map((x) => x.otherNames)));
      this.emails = this.emails.concat(_.flatMap(scrpedData.map((x) => x.emails)));
      this.socials = this.socials.concat(_.flatMap(scrpedData.map((x) => x.socials)));
      this.posts = this.posts.concat(_.flatMap(scrpedData.map((x) => x.posts)));
      this.externalURLs = this.externalURLs.concat(_.flatMap(scrpedData.map((x) => x.externalURLs)));
      this.advertisements = this.advertisements.concat(_.flatMap(scrpedData.map((x) => x.advertisements)));

      return this;
    }

    merge() {
      this.personalNames = mergeByName(this.personalNames, "name");
      this.otherNames = mergeByName(this.otherNames, "name");
      this.advertisements = mergeByName(this.advertisements, "associatedHyperlink");

      return this;
    }

    deduplicate() {
      this.personalNames.forEach((personalName) => {
        personalName.context = _.uniqBy(personalName.context, "sentence");
      });
      this.otherNames.forEach((otherName) => {
        otherName.context = _.uniqBy(otherName.context, "sentence");
      });
      this.emails = _.uniq(this.emails);
      this.socials = _.uniq(this.socials);
      this.posts = _.uniq(this.posts);
      this.externalURLs = _.uniq(this.externalURLs);
      this.advertisements = _.uniqBy(this.advertisements, "associatedHyperlink");

      return this;
    }

    build(): CrawledData {
      return new CrawledData(
        this.personalNames,
        this.otherNames,
        this.emails,
        this.socials,
        this.posts,
        this.externalURLs,
        this.advertisements
      );
    }
  };
}
