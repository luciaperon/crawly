import { ScraperBody } from "Models/Scraper";
import { ScrapedData } from "@Models/Scraper";

export class BODY_EXAMPLES {
  static SCRAPE_BODY = {
    Empty: {
      summary: "Empty Body",
      description: "Use this for default settings",
      value: {
        name: {
          fullNegativeKeywords: [],
          partialNegativeKeywords: [],
        },
        socialMedia: {
          keywords: [],
          shareKeywords: [],
          postKeywords: [],
        },
        url: {
          internalKeywordsWhitelist: [],
          internalKeywordsBlacklist: [],
          includeCDN: true,
          includeInternal: false,
        },
        advertisement: {
          keywords: [],
        },
        externalURLs: {
          keywords: [],
        },
      } as ScraperBody,
    },
    ExcludeNames: {
      summary: "Names",
      description: `
    [fullNameBlacklist] is a list that is used to filter out names. It gets combined with the full name negative keywords list. In this case if any of these three word combinations appear in any name result they will be filtered. 
    [partialNameBlacklist] is a list that is used to filter out names. It gets combined with partial name negative keywords list. In this case if any string contains the word 'Skip' it will be filtered out.

    Use this list to filter out specific values. For example, if the name result contain ["Cannabis Shop", "Canada Now, "The Newspaper", "Search Now", "Skip Button"], this route will return ["Cannabis Shop", "Canada Now"].`,
      value: {
        name: {
          fullNegativeKeywords: ["The Newspaper", "Read Me", "Search Now"],
          partialNegativeKeywords: ["Skip"],
        },
        socialMedia: {
          keywords: [],
          shareKeywords: [],
          postKeywords: [],
        },
        url: {
          internalKeywordsWhitelist: [],
          internalKeywordsBlacklist: [],
          includeCDN: true,
          includeInternal: false,
        },
        advertisement: {
          keywords: [],
        },
        externalURLs: {
          keywords: [],
        },
      } as ScraperBody,
    },
    SocialMedias: {
      summary: "Social Media Section",
      description: `
    [keywords] are keywords that you should use if you want to include a new social media for one scrape (like pinterest) you add it to keywords. In this case, every link that contains "/pinterest" would get categorised as social media link. 

    [shareKeywords] are keywords that are used to detect if social media link is a share link. There is a default list that will work in 90% of the cases (mentioned below) but if you see that in one scrape response there are share links with unique things you can enter them here to have them filtered out. In this case, every social media link with "/sharePage.php" would be considered as a share link and would be filtered out.
    
    [postKeywords] are keywords that are used to detect if social media link is a share link. There is a default list that will work in 90% of the cases (mentioned below) but if you see that in one scrape response there are share links with unique things you can enter them here to have them filtered out. In this case, every social media link with "/userPost.php" would be considered as a post link and would be moved to post section.`,
      value: {
        name: {
          fullNegativeKeywords: [],
          partialNegativeKeywords: [],
        },
        socialMedia: {
          keywords: ["Pinterest"],
          shareKeywords: ["/sharePage.php"],
          postKeywords: ["/userPost/"],
        },
        url: {
          internalKeywordsWhitelist: [],
          internalKeywordsBlacklist: [],
          includeCDN: true,
          includeInternal: false,
        },
        advertisement: {
          keywords: [],
        },
        externalURLs: {
          keywords: [],
        },
      } as ScraperBody,
    },
    Urls: {
      summary: "URL Section",
      description: `
    [internalURLKeywords] are used to determin if the keyword describes link that is associated with the scraped page. Use this if you want to define an alternative link that is considered to be from the same site but lexically has a completley different name than the base URL. 

    [includeCDN] is an option that can either be true or false. If set false, every link that contains "cdn" inside will be filtered out, otherwise it will leave them. CDN's are used to deploy images/videos/content to the main website and in most cases don't share the base url of the site. In most cases CDN images are useless (contain logos, images, etc) but in some cases advertisements are served through them and there might be times when you need them. 
    
    [includeInternal] is used to see what other internal URL's does a page have. By default, internal urls are ignored but they are internally (on the server) needed for crawling. This will filter out every response except "images" and "advertisers".`,
      value: {
        name: {
          fullNegativeKeywords: [],
          partialNegativeKeywords: [],
        },
        socialMedia: {
          keywords: ["Pinterest"],
          shareKeywords: ["/sharePage.php"],
          postKeywords: ["/userPost/"],
        },
        url: {
          internalKeywordsWhitelist: [],
          internalKeywordsBlacklist: [],
          includeCDN: true,
          includeInternal: false,
        },
        advertisement: {
          keywords: [],
        },
        externalURLs: {
          keywords: [],
        },
      } as ScraperBody,
    },
    Ads: {
      summary: "Ads Section",
      description: `
    [keywords] is used to extend the list of known advertisers or parts of advertisers that are used to give probability points for ads. You can read more about that in the "Advertisements section" below.
    `,
      value: {
        name: {
          fullNegativeKeywords: [],
          partialNegativeKeywords: [],
        },
        socialMedia: {
          keywords: [],
          shareKeywords: [],
          postKeywords: [],
        },
        url: {
          internalKeywordsWhitelist: [],
          internalKeywordsBlacklist: [],
          includeCDN: true,
          includeInternal: false,
        },
        advertisement: {
          keywords: ["somewebsite.com"],
        },
        externalURLs: {
          keywords: [],
        },
      } as ScraperBody,
    },
  };

  static SCRAPE_CREATE = {
    Example: {
      summary: "Example Body",
      description: "Example body. Use this only for reference.",
      value: {
        url: "https://cannabisretailer.cs",
        personalNames: [
          {
            name: "Allan Tester",
            context: [
              {
                tag: "Paragraph",
                sentence: "Allan Tester tested the app",
                hyperlinks: [
                  {
                    text: "tested",
                    link: "https://test.com",
                  },
                ],
              },
            ],
          },
        ],
        otherNames: [
          {
            name: "Cannabis Retailers",
            context: [
              {
                tag: "Medium Heading",
                sentence: "The firm Cannabis Retailers made 1 million in revenue last year.",
                hyperlinks: [
                  {
                    text: "last year",
                    link: "https://link.com",
                  },
                ],
              },
            ],
          },
        ],
        emails: ["allan@tester.com"],
        socials: ["https://facebook.com/allantester"],
        posts: ["https://facebook.com/posts/allantester"],
        externalURLs: ["https://someurl.com"],
        advertisements: [
          {
            imgLink: "https://imagelink.com",
            probability: 4,
            associatedHyperlink: "https://somelink.com",
          },
        ],
      } as ScrapedData,
    },
  };
}
