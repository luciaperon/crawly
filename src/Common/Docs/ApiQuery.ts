import { ApiQueryOptions } from "@nestjs/swagger";

export class API_QUERY {
  static GENERIC = class {
    static URL: ApiQueryOptions = {
      name: "url",
      required: true,
      description:
        "URL that will be used for the given tool. Must contain 'https://'. Doesen't need 'www.' Remove trailing backlashes if not needed.",
      schema: { type: "string", example: "https://cannabisretailer.ca" },
    };

    static USE_PROXY: ApiQueryOptions = {
      name: "useProxy",
      required: true,
      description: "Dermines if the scraper should use proxy.",
      schema: { type: "boolean", example: false },
    };

    static AS_CSV: ApiQueryOptions = {
      name: "asCSV",
      required: true,
      description: "Dermines if the result should be returned as CSV.",
      schema: { type: "boolean", example: true },
    };

    static FILE_NAME: ApiQueryOptions = {
      name: "fileName",
      required: false,
      description: "Name of the file that will be used. Needs to have subdirectory included if firestore path is used.",
      schema: { type: "string" },
    };

    static FIREBASE_STORAGE_PATH: ApiQueryOptions = {
      name: "firebaseStoragePath",
      required: true,
      description:
        "Full firebase storage path to the file. Example 'CrawlData/cannabisretailer.ca_2022-10-09_12:20:37_result.json'",
      schema: { type: "string" },
    };

    static OUTPUT_FILENAME: ApiQueryOptions = {
      name: "outputFilename",
      required: false,
      description:
        "Name of the file that will be generated. Avoid using spaces, extension (.csv) is NOT needed. If not provided, identifier will be used.",
      schema: { type: "string" },
    };

    static SEARCH: ApiQueryOptions = {
      name: "search",
      required: false,
      description: "If present, filters out content by search value.",
      schema: {
        type: "string",
      },
    };
  };

  static SCRAPER = class {
    static TIMEOUT: ApiQueryOptions = {
      name: "timeout",
      required: true,
      description:
        "Change this value if to give the script more time to load ads. Value is in milliseconds. Default is 5seconds (5000ms)",
      schema: { type: "number", default: 5000 },
    };
  };

  static SCRAPE_DATA = class {
    static INCLUDE_DATA: ApiQueryOptions = {
      name: "includeData",
      required: true,
      description:
        "Determins if the request will return scrape data. Use false if you only want to see ID's. Default is false.",
      schema: { type: "boolean", example: false },
    };
  };

  static CRAWLER = class {
    static URL: ApiQueryOptions = {
      name: "url",
      required: true,
      description:
        "URL to be deeply scraped. Must contain 'https://'. Doesen't need 'www.' Remove trailing backlashes if not needed.",
      schema: { type: "string", example: "https://cannabisretailer.ca" },
    };

    static CRAWL_DEPTH: ApiQueryOptions = {
      name: "crawlDepth",
      required: true,
      description:
        "How many layers to scrape (1 layer = scrape all links from one page, 2 layers = scrape all links from all pages from layer 1, etc..)",
      schema: { type: "number", example: 1 },
    };

    static OUTPUT_FILE_NAME: ApiQueryOptions = {
      name: "outputFilename",
      required: false,
      description:
        "Name that will be used to name the output file. If empty, format that will be used is `{hostname}_{date}_result.json`.",
      schema: { type: "string" },
    };

    static OUTPUT_DIR_NAME: ApiQueryOptions = {
      name: "outputDirname",
      required: false,
      description:
        "Name that will be used for a directory that will contain all files from this URL. Default value is `{hostname}`.",
      schema: { type: "string" },
    };

    static OVERRIDE: ApiQueryOptions = {
      name: "override",
      required: false,
      description: "Determins if the job will overwrite contents of a existing directory. Default is false.",
      schema: { type: "boolean", example: false },
    };
  };

  static CRAWL_DATA = class {
    static INCLUDE_SCRAPE: ApiQueryOptions = {
      name: "includeScrape",
      required: true,
      description: "Wether to include scraped data from a specific crawl. Default is true.",
      schema: { type: "boolean", example: true },
    };
  };

  static KEYWORDS = class {
    static KEYWORD_FILE_NAME: ApiQueryOptions = {
      name: "fileName",
      required: true,
      description: "Name of the file that contains keywords. Must contain full path, for example 'Full/Keywords.txt'",
      schema: {
        type: "string",
        example: "Full/Keywords.txt",
      },
    };

    static LAST_N_WORDS: ApiQueryOptions = {
      name: "lastNWords",
      required: false,
      description:
        "If present, returns only last N words for the file. Useful if you want to check newly appended lines.",
      schema: {
        type: "number",
      },
    };

    static SUBDIRECTORY: ApiQueryOptions = {
      name: "subdirectory",
      required: false,
      description:
        "If present, adds the subdirectory prefix. For example 'Full' would add the subdirectory prefix 'Full' to file 'AmericanCities.txt'.",
      schema: {
        type: "string",
      },
    };
  };

  static SERP = class {
    static FORMULA: ApiQueryOptions = {
      name: "formula",
      required: true,
      description: "Full URL of the formula that you generated.",
      schema: {
        type: "string",
        example:
          "https://www.google.com/search?q=marijuana+OR+cannabis+site%3Adenverpost.com&client=firefox-b-1-d&source=lnt&tbs=cdr%3A1%2Ccd_min%3A1%2F1%2F1999%2Ccd_max%3A12%2F31%2F1999&tbm=",
      },
    };

    static SEARCH_QUERY: ApiQueryOptions = {
      name: "searchQuery",
      required: true,
      description: "Search term/query that is used to search google.",
      schema: { type: "string", example: "Marijuana Health Benefits" },
    };

    static LOCATION: ApiQueryOptions = {
      name: "location",
      required: true,
      description:
        "Location that is going to be used for google searches. Use 'locations' search on this website to get the correct name: https://app.scaleserp.com/playground.",
      schema: { type: "string", example: "San Francisco Bay Area,United States" },
    };

    static NUM_OF_RESULTS: ApiQueryOptions = {
      name: "numOfResults",
      required: true,
      description: "Number of results to get (Maximum is 100. One typical Google result page contains 8-10 results).",
      schema: { type: "number", example: 5 },
    };

    static TYPE: ApiQueryOptions = {
      name: "type",
      required: true,
      description: "Type of the search.",
      schema: { type: "string", enum: ["Formula", "Query"] },
    };

    static COLUMN_NAME: ApiQueryOptions = {
      name: "columnName",
      required: true,
      description: "Name of the column that contains search identifiers.",
      schema: { type: "string", example: "formula" },
    };

    static FORMULA_COLUMN_NAME: ApiQueryOptions = {
      name: "formulaColumnName",
      required: true,
      description: "Name of the column that contains formula.",
      schema: { type: "string", example: "formula" },
    };

    static QUERY_COLUMN_NAME: ApiQueryOptions = {
      name: "queryColumnName",
      required: true,
      description: "Name of the column that contains quer.",
      schema: { type: "string", example: "query" },
    };

    static FILE_NAME: ApiQueryOptions = {
      name: "fileName",
      required: true,
      description: "File name used to search google.",
      schema: { type: "string" },
    };

    static IDENTIFIER: ApiQueryOptions = {
      name: "identifier",
      required: true,
      description: "Identifier used to search google, either query or formula.",
      schema: { type: "string" },
    };

    static OUTPUT_FILE_NAME: ApiQueryOptions = {
      name: "outputFilename",
      required: false,
      description:
        "Name that will be used to name the output file. If empty, format that will be used is `{identifier}_{date}_result.csv`",
      schema: { type: "string" },
    };

    static OUTPUT_FILE_NAME_BATCH: ApiQueryOptions = {
      name: "outputFilename",
      required: false,
      description:
        "Name that will be used to name the output file. If empty, format that will be used is `{inputFileName}_result.csv`",
      schema: { type: "string" },
    };

    static SAVE_FILE: (isDefaultTrue: boolean) => ApiQueryOptions = (isDefaultTrue: boolean) => {
      return {
        name: "saveFile",
        required: false,
        description: `Determins if the file should be stored in the Firebase Cloud Storage. Defaults to ${isDefaultTrue}.`,
        schema: { type: "boolean", example: isDefaultTrue },
      };
    };

    static BUILD_ID: ApiQueryOptions = {
      name: "buildId",
      required: false,
      description:
        "ID of the build that can be located on the Jenkins dashboard. If empty retrieves logs from last build.",
      schema: { type: "number" },
    };

    static STOP_BUILD_ID: ApiQueryOptions = {
      name: "buildId",
      required: false,
      description: "ID of the build that should be terminated.",
      schema: { type: "number" },
    };

    static TMP_DIR_PATH: ApiQueryOptions = {
      name: "tmpDirName",
      required: true,
      description: "Name of the temporary dir that can be obtained in the logs. Example format 'outputfilename_s9dik'",
      schema: { type: "string" },
    };

    static PARTIAL_OUTPUT_FILENAME: ApiQueryOptions = {
      name: "outputFilename",
      required: false,
      description:
        "Filename that will be used for output file. If empty, the original output filename will be used (everything before the last '_') of the tmp path.",
      schema: { type: "string" },
    };

    static LAST_N_LINES: ApiQueryOptions = {
      name: "lastNLines",
      required: true,
      description: "Last N lines of the log file. Defaults to 10.",
      schema: { type: "number", example: 100 },
    };

    static NAME: ApiQueryOptions = {
      name: "name",
      required: false,
      description: "Full or partial name of the file that will be used for filtering.",
      schema: { type: "string" },
    };

    static START_DATE: ApiQueryOptions = {
      name: "startDate",
      required: false,
      description: "Start date that will be used for filtering. Format: yyyy-MM-dd HH:mm:ss",
      schema: { type: "string", example: "2020-10-24 15:54:00" },
    };

    static END_DATE: ApiQueryOptions = {
      name: "endDate",
      required: false,
      description: "End date that will be used for filtering. Format: yyyy-MM-dd HH:mm:ss",
      schema: { type: "string", example: "2050-10-24 15:54:00" },
    };
  };
}
