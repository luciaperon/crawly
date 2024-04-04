import { ScraperBody } from "Models/Scraper";
import { CrawlParams } from "Models/Crawler";
import { BODY_EXAMPLES } from "../Common/Docs/BodyExamples";
import { API_QUERY, API_PARAM, API_OPERATION } from "Common/Docs";
import { CrawledData } from "../Models/Crawler/Worker/CrawledData";
import { CrawlerService } from "../Services/Crawler/Crawler.service";
import { CrawlPreviewParams } from "../Models/Crawler/Params/CrawlPreviewParams";
import { ApiTags, ApiQuery, ApiBody, ApiParam, ApiOperation } from "@nestjs/swagger";
import { CrawlerPreviewResponse } from "../Models/Crawler/Response/CrawlerPreviewResponse";
import { CrawlCacheParams } from "../Models/Crawler/Params/CrawlCacheParams";
import { Body, Controller, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { JenkinsJobResponse } from "../Models/Jenkins/Response/JenkinsJobResponse";

@ApiTags("Crawler")
@Controller("crawler")
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post("preview")
  @ApiOperation(API_OPERATION.CRAWLER.PREVIEW)
  @ApiQuery(API_QUERY.CRAWLER.URL)
  @ApiBody({
    description: "Default body",
    examples: BODY_EXAMPLES.SCRAPE_BODY,
  })
  @HttpCode(HttpStatus.OK)
  async previewCrawl(@Query() query: CrawlPreviewParams, @Body() body: ScraperBody): Promise<CrawlerPreviewResponse> {
    return await this.crawlerService.previewCrawl(query.url, body);
  }

  @Post("")
  @ApiOperation(API_OPERATION.CRAWLER.CRAWL)
  @ApiQuery(API_QUERY.CRAWLER.CRAWL_DEPTH)
  @ApiQuery(API_QUERY.CRAWLER.URL)
  @ApiQuery(API_QUERY.CRAWLER.OUTPUT_FILE_NAME)
  @ApiBody({
    description: "Default body",
    examples: BODY_EXAMPLES.SCRAPE_BODY,
  })
  @HttpCode(HttpStatus.OK)
  async crawl(@Query() query: CrawlParams, @Body() body: ScraperBody): Promise<JenkinsJobResponse<any>> {
    return await this.crawlerService.crawl(query.url, query.crawlDepth, query.outputFilename, body);
  }

  @Post("cache")
  @ApiOperation(API_OPERATION.CRAWLER.CRAWL_CACHE)
  @ApiQuery(API_QUERY.CRAWLER.CRAWL_DEPTH)
  @ApiQuery(API_QUERY.CRAWLER.URL)
  @ApiQuery(API_QUERY.CRAWLER.OUTPUT_FILE_NAME)
  @ApiQuery(API_QUERY.CRAWLER.OUTPUT_DIR_NAME)
  @ApiQuery(API_QUERY.CRAWLER.OVERRIDE)
  @ApiBody({
    description: "Default body",
    examples: BODY_EXAMPLES.SCRAPE_BODY,
  })
  @HttpCode(HttpStatus.OK)
  async crawlWithCache(@Query() query: CrawlCacheParams, @Body() body: ScraperBody): Promise<JenkinsJobResponse<any>> {
    return await this.crawlerService.cachePages(
      query.url,
      query.crawlDepth,
      query.outputFilename,
      body,
      query.outputDirname,
      query.override
    );
  }

  @Post("cache/process")
  @ApiOperation(API_OPERATION.CRAWLER.PROCESS_CACHED_DATA)
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: "Default body",
    examples: BODY_EXAMPLES.SCRAPE_BODY,
  })
  async processCachedData(@Query("dirName") dirName: string, @Body() body: ScraperBody): Promise<CrawledData> {
    return await this.crawlerService.processCachedData(dirName, body);
  }

  @Post("stop/:jobId")
  @ApiOperation(API_OPERATION.CRAWLER.STOP)
  @ApiParam(API_PARAM.CRAWLER.JOB_ID)
  @HttpCode(HttpStatus.OK)
  async stopCrawl(@Param("jobId") jobId: number): Promise<JenkinsJobResponse<any>> {
    return await this.crawlerService.stopCrawl(jobId);
  }
}
