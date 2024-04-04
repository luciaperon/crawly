import { ApiBodyOptions } from "@nestjs/swagger";

export class API_BODY {
  static KEYWORDS = class {
    static APPEND_TO_FILE: ApiBodyOptions = {
      description:
        "Separated by new line. Remove any extra whitespace and newline charachters. Don't include newline at the end.",
      examples: {
        MultipleKeywords: {
          description: "Multiple Keywords",
          value: "keyword1\nkeyword2\nkeyword3",
        },
        SingleKeyword: { description: "Single Keyword", value: "keyword1" },
      },
    };

    static DELETE_FROM_FILE: ApiBodyOptions = {
      description:
        "Keywords that will be deleted from the seleted file. Separated by new line. Remove any extra whitespace and newline charachters. Don't include newline at the end.",
      examples: {
        MultipleKeywords: {
          description: "Multiple Keywords",
          value: "keyword1\nkeyword2\nkeyword3",
        },
        SingleKeyword: { description: "Single Keyword", value: "keyword1" },
      },
    };
  };
}
