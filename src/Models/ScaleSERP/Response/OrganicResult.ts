export class Sitelink {
  title: string;
  link: string;

  constructor(title: string, link: string) {
    this.title = title ? title : "-";
    this.link = link ? link : "-";
  }
}

export class OrganicResult {
  position: number;
  title: string;
  link: string;
  domnain: string;
  // displayedLink: string;
  snippet: string;
  // sitelinks: Sitelink[];

  constructor(position: number, domain: string, title: string, snippet: string, link: string) {
    this.position = position ? position : 0;
    this.domnain = domain ? domain.replace("www.", "") : "-";
    this.title = title ? title : "-";
    this.snippet = snippet ? snippet : "-";
    this.link = link ? link.replace("www.", "") : "-";

    this.domnain = this.cleanString(this.domnain);
    this.title = this.cleanString(this.title);
    this.snippet = this.cleanString(this.snippet);
    this.link = this.cleanString(this.link);

    // this.displayedLink = displayLink ? displayLink : "-";

    // let tmpSitelinks = [];
    // if (sitelinks) {
    //   let inline = sitelinks["inline"];
    //   if (inline) {
    //     tmpSitelinks = tmpSitelinks.concat((inline as any[]).map((x) => new Sitelink(x["title"], x["link"])));
    //   }

    //   let external = sitelinks["expanded"];
    //   if (external) {
    //     tmpSitelinks = tmpSitelinks.concat(
    //       (external as any[]).map((x) => new Sitelink(x["title"], x["link"]))
    //     );
    //   }
    // }
    // this.sitelinks = tmpSitelinks;
  }

  cleanString(string: string): string {
    return string.replace(/\||\n+|\n|\t| {2,}|"|'/g, " ");
  }
}
