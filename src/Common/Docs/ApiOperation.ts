import { ApiOperationOptions } from "@nestjs/swagger";

export class API_OPERATION {
  static formatSwaggerDescription(rawHtml: string): string {
    return rawHtml.replace(/( ){2,}/g, " ");
  }

  static SCRAPER = class {
    static SCRAPE: ApiOperationOptions = {
      summary: "Scrapes one URL and returns it's data.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Scraper is used to scrape a single website. </li>
            <li> One 'Scrape' represents scraped data of one scraped website. </li>
            <li> Every Scrape is getting saved to the database so you can retrieve it afterward. </li>
            <li> You can't Scrape the same website twice but you can refresh existing Scrape data. This was done to prevent unnecessary duplication of data. </li>
            <li> This process is instant and the data will be available after the loading time. </li>
            <li> If you already scraped this URL the tool will return saved results for the URL. </li>
            <li> If you want to refresh and take only new data, please use <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scraper/ScraperController_scrapeRefresh">Scrape Refresh</a> tool.</li>
            <li> Don't change 'asCSV' field to 'false' if you expect that the scraped data will be big. </li>
          </ul>
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/5i50w9xhzlsqq-scraper",
      },
    };

    static SCRAPE_REFRESH: ApiOperationOptions = {
      summary: "Refreshes scrape data of an already scraped URL and returns it's data.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> This tool is used to scrape already scraped URLs to get new data. </li>
            <li> This tool keeps only the differences between the scrapes. </li>
            <li> This tool is same as <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scraper/ScraperController_scrapeRefresh">Scraper</a>. </li>
            <li> Only requirement is that you already scraped the URL. </li>
            <li> Every Scrape is getting saved to the database so you can revisit it afterward. </li>
            <li> You can run this tool multiple times. </li>
            <li> This process is instant and the data will be available after the loading time. </li>
            <li> Don't change 'asCSV' field to 'false' if you expect that the scraped data will be big. </li>
          </ul>
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/5i50w9xhzlsqq-scraper#refresh-scrape",
      },
    };

    static NLP: ApiOperationOptions = {
      summary: "Testing for company names.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
          </ul>
        </div>
      `),
    };

    static TEST_PAGE: ApiOperationOptions = {
      summary: "Ignore this.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Ignore this tool. </li>
          </ul>
        </div>
      `),
    };
  };

  static SCRAPE_DATA = class {
    static GET_SCRAPES_BY_URL: ApiOperationOptions = {
      summary: "Retrieves ALL 'Scrape Data' for one URL.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> If you don't know the ID or if you want to get 'Scrape Data' for one URL you can use this tool. </li>
            <li> One 'Scrape' represents all data that was collected during one scrape request. </li>
            <li> You can set the 'includeData' property to 'false' if you want to see what IDs you have for a single URL. </li>
            <li> If you have the ID you can look it up with <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scrape%20Data/ScrapeController_getOneById">this</a> tool. </li>
            <li> This URL must be exactly the same as the one that you used for scraping so make sure to try multiple versions of the same URL if one is not working (check trailing slash or 'https://' prefix). </li>
            <li> This tool will return all 'Scrape Data' for that URL (initial and refresh included). </li>
            <li> Don't change 'asCSV' field to 'false' if you expect that the scraped data will be big. </li>
          </ul>
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/5i50w9xhzlsqq-scraper#by-url",
      },
    };

    static DELETE_SCRAPE_BY_URL: ApiOperationOptions = {
      summary: "Delete ALL 'Scrape Data' for one URL (including refresh).",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> If you don't know the ID or if you want to delete 'Scrape Data' for one URL you can use this tool. </li>
            <li> If you have the ID you can delete it with <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scrape%20Data/ScrapeController_deleteByID">this</a> tool. </li>
            <li> This tool will delete EVERY 'Scrape Data' that has the same URL (initial and refresh data). </li>
            <li> This URL must be exactly the same as the one that you used for scraping so make sure to try multiple versions of the same URL if one is not working (check trailing slash or 'https://' prefix). </li>
          </ul>
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/5i50w9xhzlsqq-scraper#by-url-1",
      },
    };

    static GET_SCRAPE_BY_ID: ApiOperationOptions = {
      summary: "Retrieves 'Scrape Data' for ONE ID.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> You can use this tool if you want to get single 'Scrape' for given ID. </li>
            <li> One 'Scrape' represents all data that was collected during one scrape request. </li>
            <li> This tool gets only one 'Scrape', which means that you will need multiple requests to get initial and refresh data. </li>
            <li> If you want to get all data at once, you can use <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scrape%20Data/ScrapeController_getByURL">this</a> tool, which searches by URL. </li>
            <li> This ID can be acquired with this tool. Make sure to set the property 'includeData' to false, so you can easily see the IDs</li>
            <li> If you have the ID you can look it up with <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scrape%20Data/ScrapeController_getOneById">this</a> tool. </li>
            <li> This URL must be exactly the same as the one that you used for scraping so make sure to try multiple versions of the same URL if one is not working (check trailing slash or 'https://' prefix). </li>
          </ul>
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/5i50w9xhzlsqq-scraper#by-id",
      },
    };

    static DELETE_SCRAPE_BY_ID: ApiOperationOptions = {
      summary: "Deletes 'Scrape Data' for ONE ID.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> You can use this tool if you want to delete a single 'Scrape'. </li>
            <li> This tool gets deletes one 'Scrape', which means that you will need multiple requests to delete initial and refresh data. </li>
            <li> If you want to get delete all data at once, you can use <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scrape%20Data/ScrapeController_deleteByURL">this</a> tool, which searches by URL. </li>
            <li> This ID can be acquired with <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scrape%20Data/ScrapeController_getOneById">this</a> tool. Make sure to set the property 'includeData' to false, so you can easily see the IDs</li>
            <li> If you have the ID you can look it up with <a target="_blank" href="${process.env.BASE_API_URL}/api/#/Scrape%20Data/ScrapeController_getOneById">this</a> tool. </li>
            <li> This URL must be exactly the same as the one that you used for scraping so make sure to try multiple versions of the same URL if one is not working (check trailing slash or 'https://' prefix). </li>
          </ul>
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/5i50w9xhzlsqq-scraper#by-id-1",
      },
    };

    static CREATE: ApiOperationOptions = {
      summary: "Manually add 'Scrape Data'.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> You can use this tool if you want to manually add Scrape Data. </li>
            <li> Format that you use has to be JSON and the data has to have exactly the same format as the one that tool generates. </li>
            <li> After creation, this data is treated the same as tool-generated data. </li>
           </ul>
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/5i50w9xhzlsqq-scraper#manually-add-scrape-data",
      },
    };
  };

  static CRAWLER = class {
    static getUsefulURLSection(): string {
      return `
      <div id="useful-urls">
        <p id='hdng'>Useful URLs</p>
        <ul>
          <li>
            <a id="description-href" target="_blank" href=${process.env.JK_CRAWLER_BUILD_URL.replace(
              "/lastBuild/console",
              ""
            )}> Jenkins Job </a>
          </li>
          <li>
            <a id="description-href" target="_blank" href=${process.env.JK_CRAWLER_BUILD_URL}> Latest Jenkins Job </a>
          </li>
          <li>
            <a id="description-href" target="_blank" href=${
              process.env.FS_BUCKET_URL
            }CrawlData>Firebase 'Crawl Data' Folder</a>
          </li>
        </ul>
      </div>
    `;
    }

    static PREVIEW: ApiOperationOptions = {
      summary: "Generates a list of URLs that would get scraped based on the input configuration.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> This tool is used to preview which URLs will get crawled/scraped with a given input configuration. </li>
            <li> This tool is useful if you want to check if your whitelist/blacklist is properly working. </li>
            <li> This will only get the first layer URLs which means it will just go through the input URL once and then report the findings. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler#preview-crawl-urls",
      },
    };

    static CRAWL: ApiOperationOptions = {
      summary: "Crawls through internal URLs and scrapes every page.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Crawler is used to scrape a single website and every internal link that it finds N levels deep. </li>
            <li> One 'Crawl Report' represents the metadata of one crawl request, while the data is stored on the remote storage. </li>
            <li> Every 'Crawl Report' is getting saved to the database so you can revisit it afterward. </li>
            <li> Actual content (data) of the crawling request is saved to remote storage and can be accessed with the file name. </li>
            <li> You can Crawl the same website multiple times but you can only run ONE crawling job at the same time. </li>
            <li> This process isn't instant and will take some time. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler",
      },
    };

    static CRAWL_CACHE: ApiOperationOptions = {
      summary: "Crawls through internal URLs and saves/caches the pages.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> This tool works like the crawler tool but instead of saving the 'Scrape Data' it saves the file 'index.html' file. </li>
            <li> These files can be accessed at a later time and processed with newer/better versions of the Scraper tool. </li>
            <li> For example, if you add more keywords and want to see the difference you would need to rerun the 'Crawler' tool. </li>
            <li> That would take time and would be inefficient. This tool solves that problem by saving the 'index.html' files on the remote storage. </li>            <li> You can Crawl the same website multiple times but you can only run ONE crawling job at the same time. </li>
            <li> This process isn't instant and will take some time. </li>
            <li> You can Crawl the same website multiple times but you can only run ONE crawling job at the same time. </li>
            <li> You can rerun this tool to save newer versions of the website later on. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler#crawl-scrape-result",
      },
    };

    static PROCESS_CACHED_DATA: ApiOperationOptions = {
      summary: "Processed saved/cached data.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Uses the latest version of the Scraper tool to generate new 'Crawl Data' from cached files. </li>
            <li> This tool is useful if you want to apply new scraper changes to old data. For example, if you added new keywords or logic.</li>
            <li> This tool will go through all saved/cached html files associated with the given URL and will generate a new report. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler#crawl-scrape-result",
      },
    };

    static STOP: ApiOperationOptions = {
      summary: "Stops the crawling process for one process.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li>This tool is used to stop a crawling job </li>
            <li>This tool requires you to know the job ID. </li>
            <li>Use this tool if you entered the wrong parameters or if the job is taking too long to finish. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler#stop-crawling",
      },
    };
  };

  static CRAWL_DATA = class {
    static getUsefulURLSection(): string {
      return `
      <div id="useful-urls">
        <p id='hdng'>Useful URLs</p>
        <ul>
          <li>
            <a id="description-href" target="_blank" href=${process.env.JK_CRAWLER_BUILD_URL.replace(
              "/lastBuild/console",
              ""
            )}> Jenkins Job </a>
          </li>
          <li>
            <a id="description-href" target="_blank" href=${process.env.JK_CRAWLER_BUILD_URL}> Latest Jenkins Job </a>
          </li>
          <li>
            <a id="description-href" target="_blank" href=${
              process.env.FS_BUCKET_URL
            }CrawlData>Firebase CrawlData Folder</a>
          </li>
        </ul>
      </div>
    `;
    }

    static GET_CRAWL_DATA_FILES: ApiOperationOptions = {
      summary: "Returns names of all Crawl Data files.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Returns list (names) of all files that are currently on the server. </li>
            <li> Can be searched/filtered with search parameter. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler#crawl-scrape-result",
      },
    };

    static GET_CRAWL_DATA: ApiOperationOptions = {
      summary: "Returns Crawl Data from one file.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> You can use this tool if you want to get just the 'Crawl Data' from a single crawl request. </li>
            <li> One 'Crawl Data' represents all data that was collected during one crawl request (the combined result of individually scraped websites). </li>
            <li> Don't change 'asCSV' field to 'false' if you expect that the scraped data will be big. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler#crawl-scrape-result",
      },
    };

    static GET_CRAWL_BY_URL: ApiOperationOptions = {
      summary: "Retrieves Latest 'Crawl Data' by URL.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Each successful crawling request will result in a 'Crawl Report'. </li>
            <li> 'Crawl Report' contains metadata about the actual report (visited sites, success count, date) and storage path to data. </li>
            <li> You can use this tool to search for CrawlReports for a specific URL which should narrow down your search to only a few reports. </li>
            <li> Then you can use the 'dataBucketRef' name to get the actual data on <a target="_blank" href="${
              process.env.BASE_API_URL
            }/#/Crawl%20Data/CrawlController_getCrawlData">this</a> tool. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler#by-url",
      },
    };

    static DELETE_CRAWL_BY_URL: ApiOperationOptions = {
      summary: "Delete ALL 'Crawl Data' for one URL.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Each successful crawling request will result in a Crawl Report. </li>
            <li> 'Crawl Report' contains metadata about the actual report (visited sites, success count, date) and storage path to data. </li>
            <li> Use this tool to delete one 'Crawl Report' and 'Crawl Data' associated with it. </li>
          </ul>
        </div>
        <div id='custom-description-list-warning'>
          <span>ATTENTION!!!</span>
          <div> This tool will also delete the 'Crawl Data' associated with the Crawl. </div>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "https://crawly.stoplight.io/docs/crawly/nhdk504pp74mv-crawler#by-url-1",
      },
    };
  };

  static KEYWORDS = class {
    static getUsefulURLSection(): string {
      return `
      <div id="useful-urls">
        <p id='hdng'>Useful URLs</p>
        <ul>
          <li>
            <a id="description-href" target="_blank" href=${process.env.FS_BUCKET_URL}/~2FKeywords>Firebase Keywords Folder</a>
          </li>
          <li>
            <a id="description-href" target="_blank" href=${process.env.FS_BUCKET_URL}/~2FKeywords/Full>Full Blacklisted Keywords</a>
          </li>
          <li>
            <a id="description-href" target="_blank" href=${process.env.FS_BUCKET_URL}/~2FKeywords/Partial>Partially Blacklisted Keywords</a>
          </li>
        </ul>
      </div>
    `;
    }

    static LIST_FILES: ApiOperationOptions = {
      summary: "Returns a list of files from storage.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Returns a list of files from storage. </li>
            <li> Make sure to add the folder prefix if you want to get a file from a folder. For example 'Full/fileName.txt'. </li>
           </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static GET_FILE: ApiOperationOptions = {
      summary: "Retrieves content of a keyword file.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Retrieves content of a keyword file in .txt format. </li>
            <li> Make sure to add the folder prefix if you want to get a file from a folder. For example 'Full/fileName.txt'. </li>
            <li> Example would be Full/AmericanCities.txt or Partial/Keywords.txt, without Full or Partial Prefix it won't work! </li>
            <li> You can use this tool to ONLY preview files. </li>
            <li> Keep in mind that these keywords are sorted by date, appended words will alwayssssss be last. </li>
            <li> You can use the search property to filter out the content of the file. </li>
            <li> If you only want to see the last N lines, for example, if you want to check if they got appended, you can specify the number. </li>
           </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static GET_FILE_URL: ApiOperationOptions = {
      summary: "Retrieves Firebase file URL.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Retrived firebase file URL </li>
            <li> Make sure to add the folder prefix if you want to get a file from a folder. For example 'Full/fileName.txt'. </li>
            <li> Returns firebase file URL. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static UPLOAD_FILE: ApiOperationOptions = {
      summary: "Uploads a file.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Uploads a new file to the firestore. </li>
            <li> Make sure to add the folder prefix if you want to store the file in the folder. For example 'Full/fileName.txt'. </li>
            <li> File name must be unique, if it's not, it will rewrite the existing file. </li>
            <li> MAKE SURE THAT EVERY LINE ENDS WITH A NEW LINE AS IN EXAMPLE. </li>
            <li> Also, try to remove any unnecessary whitespaces that you can. </li>
            <li> Don't leave empty lines at the end. </li>
           </ul>
        </div>
        ${this.getUsefulURLSection()}  
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static APPEND_TO_FILE: ApiOperationOptions = {
      summary: "Appends text to the end of the file.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Appends N lines of text to the end of the file. </li>
            <li> Make sure to add the folder prefix if you want to edit a file from a folder. For example 'Full/fileName.txt'. </li>
            <li> MAKE SURE THAT EVERY LINE ENDS WITH A NEW LINE AS IN EXAMPLE. </li>
            <li> Also, try to remove any unnecessary whitespaces that you can. </li>
            <li> Don't leave empty lines at the end. </li>
           </ul>
        </div>
        ${this.getUsefulURLSection()}  
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static RESTORE_BACKUP: ApiOperationOptions = {
      summary: "Restores version of keyword file that was saved before last append action.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Works with deleted files too. </li>            
            <li> Make sure to add the folder prefix if you want to restore a file from a folder. For example 'Full/fileName.txt'. </li>
            <li> Before every append keyword file (and on file creation) gets saved with '_backup' suffix and represents the state of the file before action. </li>
            <li> If you enter something wrong in the append file, you can use this tool as an UNDO action. </li>
            <li> Currently, there is only one backed-pe version kept on the server. </li>
            <li> <span style='color:red'>ATTENTION</span> Only files that are added/modified with this tool can be restored! </li>
           </ul>
        </div>
        ${this.getUsefulURLSection()}  
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static DEDUPLICATE: ApiOperationOptions = {
      summary: "Removes duplicates from a file.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
          <li> Removes duplicates from a file. </li>
          <li> Make sure to add the folder prefix if you want to restore a file from a folder. For example 'Full/fileName.txt'. </li>
           </ul>
        </div>
        ${this.getUsefulURLSection()}  
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static DELETE_FILE: ApiOperationOptions = {
      summary: "Deletes a file.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Deletes a file. </li>
            <li> Make sure to add the folder prefix if you want to restore a file from a folder. For example 'Full/fileName.txt'. </li>
         </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static DELETE_FROM_FILE: ApiOperationOptions = {
      summary: "Deletes EVERY specified keyword from the file.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>        
            <li> You can use this tool if you want to delete keywords from the file. </li>
            <li> Make sure to add the folder prefix if you want to restore a file from a folder. For example 'Full/fileName.txt'. </li>
            <li> This tool will delete EVERY occurrence of the given keyword, which means that it will delete duplicates. </li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}  
    `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };
  };

  static SERP = class {
    static getUsefulURLSection(): string {
      return `
      <div id="useful-urls">
        <p id='hdng'>Useful URLs</p>
        <ul>
          <li> <a id="description-href" target="_blank" href="${process.env.FB_BUCKET_URL}${process.env.FS_STORAGE_SERP_DIR}">Firebase Folder</a> </li>
          <li> <a id="description-href" target="_blank" href="https://www.scaleserp.com/">Scale SERP</a> </li>
          <li> <a id="description-href" target="_blank" href="https://thecrawly.com/jenkins/job/serp_prod">Jenkins Job</a> </li>
        </ul>
      </div>
    `;
    }

    static SEARCH_GOOGLE_BY_FORMULA = {
      summary: "Searches Google by provided formula.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Performs google search with provided formula and returns N number of results. </li>
            <li> Make sure not to leave or refresh the page until the process finishes. </li>
            <li> Output file name SHOULD be unique. </li>
          </ul>
        </div>

        <div id='custom-description-list-warning'>
          <span>ATTENTION!!!</span>
          <div>After you start this process, you cannot stop it and if you didn't specify a good URL your ScaleSERP credits will be wasted.</div>
        </div>

        ${this.getUsefulURLSection()} 
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static VALIDATE_CSV_FILE = {
      summary: "Validates CSV File.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Use this tool to validate CSV File. </li>
            <li> This tool will either return a list of errors or extracted data. </li>
          </ul>
        ${this.getUsefulURLSection()} 
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static SEARCH_GOOGLE_BY_FORMULA_BATCH = {
      summary: "Searches Google by provided CSV file with formula column.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> File must contain only one kind of separator, the best results would be with the comma(,) separator. </li>
            <li> Double-check that every column has a valid URL. </li>
            <li> Make sure not to leave or refresh the page until the process finishes. </li>
          </ul>

        ${this.getUsefulURLSection()} 
        </div>

        <div id='custom-description-list-warning'>
          <span>ATTENTION!!!</span>
          <div>After you start this process, you cannot stop it and if you didn't specify a good URL your ScaleSERP credits will be wasted.</div>
        </div>
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static SEARCH_GOOGLE_BY_QUERY = {
      summary: "Searches Google by provided search query.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Performs google search with provided query and returns N number of results. </li>
            <li> Make sure not to leave or refresh the page until the process finishes. </li>
            <li> Output file name SHOULD be unique. </li>
          </ul>
        </div>

        ${this.getUsefulURLSection()} 

        <div id='custom-description-list-warning'>
          <span>ATTENTION!!!</span>
          <div>After you start this process, you cannot stop it and if you didn't specify a good URL your ScaleSERP credits will be wasted.</div>
        </div> 
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static SEARCH_GOOGLE_BY_QUERY_BATCH = {
      summary: "Searches Google by provided CSV file with query column.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> File must contain only one kind of separator, the best results would be with the comma(,) separator. </li>
            <li> Double-check that every column has a valid URL. </li>
            <li> Make sure not to leave or refresh the page until the process finishes. </li>
          </ul>
        </div>

        ${this.getUsefulURLSection()} 

        <div id='custom-description-list-warning'>
          <span>ATTENTION!!!</span>
          <div>After you start this process, you cannot stop it and if you didn't specify a good URL your ScaleSERP credits will be wasted.</div>
        </div> 
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static STOP_BATCH_SEARCH_BUILD = {
      summary: "Stops one build with given ID.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Stops a build with given ID. </li>
            <li> Backed up files will still be available for recovery while other temporary files won't. </li>
          </ul>
        </div>

        ${this.getUsefulURLSection()} 
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static BUILD_PARTIAL = {
      summary: "Builds partially collected data from failed build.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Every SERP batch request is designed to backup downloaded files so that the credits don't get used. </li>
            <li> Use this tool if you want to recover data that was collected before the error occured. </li>
            <li> This tool will generate and upload a .csv file to storage, and delete temporary files. </li>
           </ul>
        </div>

        ${this.getUsefulURLSection()} 
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static GET_LOGS = {
      summary: "Returns logs for SERP build.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Returns last N lines of the logs from the specified search build. </li>
           </ul>
        </div>

        ${this.getUsefulURLSection()} 
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static LIST_FILES: ApiOperationOptions = {
      summary: "Returns a list of files from storage.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Returns a list of files from storage. </li>
            <li> Returns name/path, size and date of creation.</li>
            <li> Can be filtered by name.</li>
          </ul>
        </div>
        ${this.getUsefulURLSection()}
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static GET_FILE = {
      summary: "Returns file from 'GoogleSearches' remote storage folder.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Returns CSV file from 'GoogleSearches' remote storage folder. </li>
           </ul>
        </div>

        ${this.getUsefulURLSection()} 
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };

    static DELETE_FILE = {
      summary: "Deletes file from 'GoogleSearches' remote storage folder.",
      description: API_OPERATION.formatSwaggerDescription(`
        <div>
          <p id='hdng'>Description</p>
          <ul id='custom-description-list'>
            <li> Deletes CSV file from 'GoogleSearches' remote storage folder. </li>
          </ul>
        </div>

        ${this.getUsefulURLSection()} 
      `),
      externalDocs: {
        description: "Documentation",
        url: "",
      },
    };
  };
}
