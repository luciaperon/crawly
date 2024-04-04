export class Constants {
  static SCRAPER = class {
    static DEFAULT_TIMEOUT: number = 5000;
    static TEXT_TAGS: string[] = [
      "p",
      // "span",
      "abbr",
      "q",
      "blockquote",
      "cite",
      "code",
      "pre",
      "dfn",
    ];
    static HEADING_TAGS: string[] = ["h1", "h2", "h3", "h4", "h5", "h6", "label", "td"];
    static LIST_TAGS: string[] = ["li"];
  };

  static WEBSHARE = class {
    static URL = "https://proxy.webshare.io/api/proxy/list/?page=1&countries=US-FR";
  };

  static ADVERTISEMENTS = class {
    static imgSizes: number[][] = [
      [300, 200],
      [300, 50],
      [300, 100],
      [250, 250],
      [200, 200],
      [300, 250],
      [336, 280],
      [728, 90],
      [728, 90],
      [970, 90],
      [468, 60],
      [300, 600],
      [160, 600],
      [120, 60],
      [900, 300],
      [1200, 1200],
      [640, 340],
    ];
  };

  static SCALE_SERP = class {
    static SEARCH_URL = process.env.SCALESERP_SEARCH_URL;
    static ACCOUNT_URL = process.env.SCALESERP_ACCOUNT_URL;
  };

  static GOOGLE = class {
    static URL = "https://www.google.com";
  };

  static FULL_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

  static TAG_MAP = {
    p: "Paragraph",
    span: "Span",
    abbr: "Abbreviation",
    q: "Quote",
    blockquote: "Big Quote",
    cite: "Cite",
    code: "Code",
    a: "Anchor",
    pre: "Preformated Text",
    dfn: "Definition",
    h1: "Large Heading (H1)",
    h2: "Big Heading (H2)",
    h3: "Medium Heading (H3)",
    h4: "Small Heading (H4)",
    h5: "Little Heading (H5)",
    h6: "Tiny Heading (H6)",
    li: "List Item",
    td: "Table Column",
    label: "Label For Input Field",
  };

  static KEYWORDS = class {
    static FILE_NAMES = [
      "AmericanCities.txt",
      "AmericanStates.txt",
      "Countries.txt",
      "FullNegativeKeywords.txt",
      "PartialNegativeKeywords.txt",
    ];
  };
}
