import { load as loadCheerio, Cheerio, Element } from "cheerio";

export class GoogleSearchResult {
  url: string | undefined;
  title: string;
  description: string | undefined;

  constructor(el: Cheerio<Element>) {
    let $ = loadCheerio(el.parent().parent().parent().parent().html()!);
    this.url = `https:${$("a").attr("href").split("https")[1]}`;
    this.title = $("h3").text();
    this.description = $("div:nth-child(2)").text();
  }
}
