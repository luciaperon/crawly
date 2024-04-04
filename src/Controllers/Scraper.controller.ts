import { Response } from "express";
import { Scrape } from "../Database/schema";
import Scraper from "../Services/Scraper/Scraper";
import { HEADERS } from "../Common/NestJS/Headers";
import { BODY_EXAMPLES } from "../Common/Docs/BodyExamples";
import { ScraperBody, ScrapedData } from "Models/Scraper";
import { ScraperService } from "../Services/Scraper/Scraper.service";
import { ScraperQuery } from "../Models/Scraper/Params/ScraperQuery";
import { ApiTags, ApiQuery, ApiBody, ApiOperation } from "@nestjs/swagger";
import { API_OPERATION, API_QUERY, cleanURL, PuppeteerInstance } from "../Common";
import { Body, Controller, HttpCode, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { GenericResponse } from "../Models/Shared/GenericResponse";

@ApiTags("Scraper")
@Controller("scraper")
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post()
  @ApiOperation(API_OPERATION.SCRAPER.SCRAPE)
  @ApiQuery(API_QUERY.SCRAPER.TIMEOUT)
  @ApiQuery(API_QUERY.GENERIC.AS_CSV)
  @ApiQuery(API_QUERY.GENERIC.USE_PROXY)
  @ApiQuery(API_QUERY.GENERIC.URL)
  @ApiBody({
    description: "Default (empty) body",
    examples: BODY_EXAMPLES.SCRAPE_BODY,
  })
  @HttpCode(HttpStatus.OK)
  async scrape(
    @Query() query: ScraperQuery,
    @Body() body: ScraperBody,
    @Res({ passthrough: true }) res: Response
  ): Promise<ScrapedData | Buffer> {
    let scrapedData: ScrapedData = await this.scraperService.scrape(
      cleanURL(query.url),
      query.useProxy,
      query.timeout,
      body
    );

    if (query.asCSV) {
      res.set(HEADERS.CSV_FILE(`${query.url}_scrape`)).end(Buffer.from(scrapedData.serializeAsCSV()));
      return;
    }

    res.set(HEADERS.JSON);
    return scrapedData;
  }

  @Post("refresh")
  @ApiOperation(API_OPERATION.SCRAPER.SCRAPE_REFRESH)
  @ApiQuery(API_QUERY.SCRAPER.TIMEOUT)
  @ApiQuery(API_QUERY.GENERIC.AS_CSV)
  @ApiQuery(API_QUERY.GENERIC.USE_PROXY)
  @ApiQuery(API_QUERY.GENERIC.URL)
  @ApiBody({
    description: "Default (empty) body",
    examples: BODY_EXAMPLES.SCRAPE_BODY,
  })
  @HttpCode(HttpStatus.OK)
  async scrapeRefresh(
    @Query() query: ScraperQuery,
    @Body() body: ScraperBody,
    @Res({ passthrough: true }) res: Response
  ): Promise<ScrapedData | GenericResponse | Buffer> {
    let scrapedData: ScrapedData = await this.scraperService.scrapeRefresh(
      cleanURL(query.url),
      query.useProxy,
      query.timeout,
      body
    );

    if (scrapedData === null) {
      return new GenericResponse(`Nothing to do. No new data for URL: '${query.url}'`);
    }

    if (query.asCSV) {
      res.set(HEADERS.CSV_FILE(`${query.url}_scrape`)).end(Buffer.from(scrapedData.serializeAsCSV()));
      return;
    }

    res.set(HEADERS.JSON);
    return scrapedData;
  }

  @Post("nlp")
  @ApiOperation(API_OPERATION.SCRAPER.NLP)
  @ApiQuery(API_QUERY.SCRAPER.TIMEOUT)
  @ApiQuery(API_QUERY.GENERIC.URL)
  @HttpCode(HttpStatus.OK)
  async nlp(@Query() query: ScraperQuery): Promise<any> {
    return await this.scraperService.companyNames(
      cleanURL(query.url),
      query.useProxy,
      query.timeout,
      BODY_EXAMPLES.SCRAPE_BODY.Empty.value
    );
  }

  @Post("testPage")
  @ApiOperation(API_OPERATION.SCRAPER.TEST_PAGE)
  @ApiQuery(API_QUERY.GENERIC.AS_CSV)
  @ApiQuery(API_QUERY.GENERIC.USE_PROXY)
  @ApiQuery(API_QUERY.GENERIC.URL)
  @ApiBody({
    description: "Default body",
    examples: BODY_EXAMPLES.SCRAPE_BODY,
  })
  @HttpCode(HttpStatus.OK)
  async scrapeTest(@Req() req, @Query() query, @Res() res: Response): Promise<ScrapedData> {
    let body: ScraperBody = req.body;

    const puppeteer: PuppeteerInstance = new PuppeteerInstance(false);

    await puppeteer.goto("file:///Users/admin/Desktop/projects/crawly/output/index.html", 0);

    let resp = await (
      await new Scraper(
        "https://cannabisretailer.ca/",
        await puppeteer.currentPage.content(),
        puppeteer.currentPage
      ).withBody(body)
    ).scrape();

    if (query.asCSV === "true") {
      res.send(resp.serializeAsCSV());
    } else {
      res.json(resp);
    }

    return resp;
  }
}
