import { Response } from "express";
import { CrawlReport } from "../Database/schema";
import { HEADERS } from "../Common/NestJS/Headers";
import { serializeCrawlScrapeAsCSV } from "../Common";
import { API_OPERATION, API_QUERY } from "Common/Docs";
import { CrawlByURLQuery } from "../Models/Crawl/Query";
import { DeleteResponse } from "Models/Shared/DeleteResponse";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CrawledData } from "../Models/Crawler/Worker/CrawledData";
import { CrawlDataQuery } from "../Models/Crawl/Query/CrawlDataQuery";
import { CollectionResponse } from "Models/Shared/CollectionResponse";
import { CrawlMetadata } from "../Models/Crawl/Response/CrawlMetadata";
import { CrawlDataService } from "../Services/CrawlData/CrawlData.service";
import { Get, Res, Query, Delete, HttpCode, Controller, HttpStatus, NotFoundException } from "@nestjs/common";

@Controller("crawl")
@ApiTags("Crawl Data")
export class CrawlController {
  constructor(private crawlService: CrawlDataService) {}

  @Get("list")
  @ApiOperation(API_OPERATION.CRAWL_DATA.GET_CRAWL_DATA_FILES)
  @ApiQuery(API_QUERY.GENERIC.SEARCH)
  @HttpCode(HttpStatus.OK)
  async listDirectory(@Query("search") search: string): Promise<any[]> {
    return (await this.crawlService.getList()).filter((x) => !x.includes(search));
  }

  @Get("data")
  @ApiOperation(API_OPERATION.CRAWL_DATA.GET_CRAWL_DATA)
  @ApiQuery(API_QUERY.GENERIC.FIREBASE_STORAGE_PATH)
  @ApiQuery(API_QUERY.GENERIC.AS_CSV)
  @HttpCode(HttpStatus.OK)
  async getCrawlData(@Query() query: CrawlDataQuery, @Res({ passthrough: true }) res: Response): Promise<CrawledData> {
    let crawlData: CrawledData = await this.crawlService.getCrawledData(query.firebaseStoragePath);

    if (!crawlData) {
      throw new NotFoundException(`Crawl Data with filename: '${query.firebaseStoragePath}' not found.`);
    }

    if (query.asCSV) {
      res
        .set(HEADERS.CSV_FILE(query.firebaseStoragePath.replace(".json", ".csv")))
        .end(Buffer.from(serializeCrawlScrapeAsCSV(crawlData)));
      return;
    }

    res.set(HEADERS.JSON);
    return crawlData;
  }

  @Get("url")
  @ApiOperation(API_OPERATION.CRAWL_DATA.GET_CRAWL_BY_URL)
  @ApiQuery(API_QUERY.GENERIC.URL)
  @HttpCode(HttpStatus.OK)
  async getByURL(
    @Query() query: CrawlByURLQuery
  ): Promise<CollectionResponse<CrawlReport> | CollectionResponse<CrawlMetadata>> {
    let crawls: CrawlReport[] = await this.crawlService.findAllBy({ url: query.url });

    if (!crawls) {
      throw new NotFoundException(`No Crawl/s were found with url: '${query.url}'`);
    }

    return new CollectionResponse<CrawlMetadata>(
      crawls.sort((x) => x.utcMilliseconds).map((x) => new CrawlMetadata(x))
    );
  }

  @Delete("url")
  @ApiOperation(API_OPERATION.CRAWL_DATA.DELETE_CRAWL_BY_URL)
  @ApiQuery(API_QUERY.GENERIC.URL)
  @HttpCode(HttpStatus.OK)
  async deleteByURL(@Query("url") url: string): Promise<DeleteResponse> {
    let deleteCount: number = await this.crawlService.deleteMany({ url: url });

    if (deleteCount === 0) {
      throw new NotFoundException(`Crawl with URL '${url}' not found.`);
    }

    return new DeleteResponse(deleteCount);
  }
}
