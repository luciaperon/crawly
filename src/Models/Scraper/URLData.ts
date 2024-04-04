export class IURLData {
  url: URL;
}

export class URLData {
  source: string;
  data: IURLData;

  constructor(url: string, data: IURLData) {
    this.source = url;
    this.data = data;
  }
}
