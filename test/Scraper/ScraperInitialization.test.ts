import { describe, it, expect } from "vitest";
import { ScraperBody, StaticScraperData } from "../../src/Models/Scraper";
import Scraper from "../../src/Services/Scraper/Scraper";

describe("Test Scraper Constructor", () => {
  it("Should Throw Exception when Invalid URL is passed to constructor", () => {
    expect(() => new Scraper(null, "nista", null)).toThrowErrorMatchingInlineSnapshot('"Invalid URL"');
    expect(() => new Scraper(undefined, "nista", null)).toThrowErrorMatchingInlineSnapshot('"Invalid URL"');
    expect(() => new Scraper("url", "nista", null)).toThrowErrorMatchingInlineSnapshot('"Invalid URL"');
    expect(() => new Scraper("", "nista", null)).toThrowErrorMatchingInlineSnapshot('"Invalid URL"');
  });

  it("Should Initialize URL if URL is valid", () => {
    const scraper = new Scraper("http://url.com", "<body><a>link</a><div>div</div><p>paragraph</p></body>", null);

    expect(scraper.url).toBeDefined();
    expect(scraper.url).toBeInstanceOf(URL);
    expect(scraper.url.hostname).toEqual("url.com");
  });

  it("Should Throw Exception exception when Invalid HTML is passed to constructor", () => {
    expect(() => new Scraper("http://url.com", null, null)).toThrowErrorMatchingInlineSnapshot(
      '"cheerio.load() expects a string"'
    );
    expect(() => new Scraper("http://url.com", undefined, null)).toThrowErrorMatchingInlineSnapshot(
      '"cheerio.load() expects a string"'
    );
  });

  it("Should remove noscript, script and style tags from HTML", () => {
    const scraper = new Scraper(
      "http://url.com",
      "<body><a>link</a><noscript>noscript</noscript><div>div</div><script>script</script><p>paragraph</p><style>style</style></body>",
      null
    );

    expect(scraper.rawText).toEqual("link div paragraph");
    expect(scraper.rawText).not.contains(["noscript", "script", "style"]);
  });

  it("Should initialize cheerio $", () => {
    const scraper = new Scraper("http://url.com", "<body><a>link</a><div>div</div><p>paragraph</p></body>", null);

    expect(scraper.$).toBeDefined();
  });

  it("Should remove noscript, script and style tags from HTML", () => {
    const scraper = new Scraper(
      "http://url.com",
      "<body><a>link</a><noscript>noscript</noscript><div>div</div><script>script</script><p>paragraph</p><style>style</style></body>",
      null
    );

    expect(scraper.rawText).toEqual("link div paragraph");
  });

  it("Should initialize URL Filter", () => {
    const scraper = new Scraper("http://url.com", "<body><a>link</a><div>div</div><p>paragraph</p></body>", null);

    expect(scraper.urlFilter).toBeDefined();
    expect(scraper.urlFilter.origin).toEqual("url.com");
  });
});

// describe("Test Scraper When Initialized With Data (withData)", () => {
//   it("Should Throw Exception When Data Is Missing", () => {
//     expect(() =>
//       new Scraper("https://url.com", "", null).withData(null, null)
//     ).toThrowErrorMatchingInlineSnapshot('"Data argument is missing"');
//   });

//   it("Should Throw Exception When Body Is Missing", () => {
//     expect(() =>
//       new Scraper("https://url.com", "", null).withData(new StaticScraperData(null), null)
//     ).toThrowErrorMatchingInlineSnapshot('"Body argument is missing"');
//   });

//   it("Should Initialize Whitelist Keyword List If Present In Body", () => {
//     const scrapeBody = new ScraperDTO();
//     scrapeBody.url.includeInternal = true;
//     scrapeBody.url.internalKeywordsWhitelist = ["keyword1", "keyword2", "keyword3"];
//     scrapeBody.url.internalKeywordsBlacklist = ["keyword4", "keyword5", "keyword6"];

//     const scraper = new Scraper("https://url.com", "", null).withData(new StaticScraperData(null), null);

//     expect(scraper.isInternalWhitelist).toBeTruthy();
//     expect(scraper.internalKeywords).toEqual(["keyword1", "keyword2", "keyword3"]);
//     expect(scraper.internalKeywords).not.toEqual(["keyword4", "keyword5", "keyword6"]);
//   });
// });

describe("Test Scraper When Initialized With Body (withBody)", () => {
  it("Should Throw Exception When Data Is Missing", () => {
    // let scraperBody = new ScraperDTO();
    // expect(() => new Scraper("https://url.com", "", null).withBody(null)).toThrowErrorMatchingInlineSnapshot(
    //   '"Data argument is missing"'
    // );
  });

  // it("Should Throw Exception When Body Is Missing", () => {
  //   expect(() =>
  //     new Scraper("https://url.com", "", null).withBody(new StaticScraperData(null), )
  //   ).toThrowErrorMatchingInlineSnapshot('"Body argument is missing"');
  // });

  // it("Should Initialize Whitelist Keyword List If Present In Body", () => {
  //   const scrapeBody = new ScraperDTO();
  //   scrapeBody.url.includeInternal = true;
  //   scrapeBody.url.internalKeywordsWhitelist = ["keyword1", "keyword2", "keyword3"];
  //   scrapeBody.url.internalKeywordsBlacklist = ["keyword4", "keyword5", "keyword6"];

  //   const scraper = new Scraper("https://url.com", "", null).withBody(new StaticScraperData(null), );

  //   expect(scraper.isInternalWhitelist).toBeTruthy();
  //   expect(scraper.internalKeywords).toEqual(["keyword1", "keyword2", "keyword3"]);
  //   expect(scraper.internalKeywords).not.toEqual(["keyword4", "keyword5", "keyword6"]);
  // });
});
