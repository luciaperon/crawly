import { cleanURL } from "../Common";

export class URLFilter {
  origin: string;

  constructor(origin: string) {
    this.origin = origin;
  }

  apply(rawUrl: string): URL {
    try {
      let url = new URL(cleanURL(rawUrl));

      if (url.hostname == "") return null;

      if (url.hostname.includes(".gov")) return null;

      return url;
    } catch (e) {
      return null;
    }
  }
}
