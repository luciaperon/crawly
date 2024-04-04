export class ScrapedHyperlink {
  text: string;
  link: string;

  constructor(text: string, link: string) {
    this.text = text.trim();
    this.link = link.trim();
  }
}

export class ScrapedNameContext {
  id?: number;
  tag: string;
  sentence: string;
  hyperlinks: ScrapedHyperlink[];

  constructor(tag: string, sentence: string, hyperlinks: ScrapedHyperlink[]) {
    this.tag = tag;
    this.sentence = sentence;
    this.hyperlinks = hyperlinks;
  }
}

export class ScrapedName {
  name: string;
  context: ScrapedNameContext[];

  constructor(name: string, context: ScrapedNameContext[]) {
    this.name = name;
    this.context = context ? context : null;
  }
}
