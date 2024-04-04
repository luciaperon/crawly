import {
  Res,
  Get,
  Param,
  Body,
  Post,
  Query,
  Delete,
  HttpCode,
  Controller,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { Scrape } from "@Database/schema";
import { ScrapedData } from "Models/Scraper";
import { HEADERS } from "../Common/NestJS/Headers";
import { BODY_EXAMPLES } from "Common/Docs/BodyExamples";
import { DeleteResponse } from "Models/Shared/DeleteResponse";
import { ScrapeService } from "Services/Scrape/Scrape.service";
import { API_QUERY, API_OPERATION, API_PARAM } from "Common/Docs";
import { CreateScrapeDTO } from "Models/Scrape/DTO/CreateScrapeDTO";
import { CollectionResponse } from "Models/Shared/CollectionResponse";
import { ScrapeMetadata } from "Models/Scrape/Response/ScrapeMetadata";
import { ScapesByURLQuery } from "../Models/Scrape/QueryParams/ScapesByURLParams";
import { ScrapesByIdParams } from "../Models/Scrape/QueryParams/ScrapesByIdParams";
import { ApiTags, ApiBody, ApiParam, ApiQuery, ApiOperation } from "@nestjs/swagger";
import { ScrapeType } from "Common/Types";
import { cleanURL } from "../Common";

@Controller("scrape")
@ApiTags("Scrape Data")
export class ScrapeController {
  constructor(private scrapeService: ScrapeService) {}

  @Get("url")
  @ApiOperation(API_OPERATION.SCRAPE_DATA.GET_SCRAPES_BY_URL)
  @ApiQuery(API_QUERY.SCRAPE_DATA.INCLUDE_DATA)
  @ApiQuery(API_QUERY.GENERIC.AS_CSV)
  @ApiQuery(API_QUERY.GENERIC.URL)
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.NO_CONTENT)
  async getAllByURL(
    @Query() query: ScapesByURLQuery,
    @Res({ passthrough: true }) res
  ): Promise<CollectionResponse<ScrapedData> | CollectionResponse<ScrapeMetadata> | Buffer> {
    try {
      let scrapes: ScrapedData[] = await this.scrapeService.findAllByURL(query.url);

      if (!scrapes || scrapes.length === 0) {
        throw new NotFoundException(`No Scrapes with url: '${query.url}' were found.`);
      }

      if (!query.includeData) {
        return new CollectionResponse<ScrapeMetadata>(
          scrapes
            .sort((x) => x.utcTimestamp)
            .reverse()
            .map((x) => new ScrapeMetadata(x))
        );
      }

      if (query.asCSV) {
        res
          .set(HEADERS.CSV_FILE(`${query.url}_scrape`))
          .end(Buffer.from(scrapes.map((x) => `${x.serializeAsCSV()}\n`).join("\n")));
        return;
      }

      return new CollectionResponse(scrapes);
    } catch (err) {
      if (err.name == "CastError") {
        throw new BadRequestException(
          "Invalid ID format.",
          "Supplied ID has invalid format. Valid format should have numbers and letters and look like this '5fdedb7c25ab1352eef88f60'."
        );
      }

      throw err;
    }
  }

  @Delete("url")
  @ApiOperation(API_OPERATION.SCRAPE_DATA.DELETE_SCRAPE_BY_URL)
  @ApiQuery(API_QUERY.GENERIC.URL)
  @HttpCode(HttpStatus.OK)
  async deleteByURL(@Query("url") url: string): Promise<DeleteResponse> {
    try {
      return new DeleteResponse(await this.scrapeService.deleteByURL(url));
    } catch (err) {
      if (err.name == "CastError") {
        throw new BadRequestException(
          "Invalid ID format.",
          "Supplied ID has invalid format. Valid format should have numbers and letters and look like this '5fdedb7c25ab1352eef88f60'."
        );
      }

      throw err;
    }
  }

  @Get(":id")
  @ApiOperation(API_OPERATION.SCRAPE_DATA.GET_SCRAPE_BY_ID)
  @ApiParam(API_PARAM.GENERIC.ID)
  @ApiQuery(API_QUERY.GENERIC.AS_CSV)
  @ApiQuery(API_QUERY.SCRAPE_DATA.INCLUDE_DATA)
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.NO_CONTENT)
  async getOneById(
    @Param("id") id: string,
    @Query() query: ScrapesByIdParams,
    @Res({ passthrough: true }) res: Response
  ): Promise<ScrapedData | ScrapeMetadata | Buffer> {
    try {
      let scrapeData: ScrapedData = await this.scrapeService.findOneById(id);

      if (!scrapeData) {
        throw new NotFoundException(`Scrape with id: '${id}' not found.`);
      }

      if (!query.includeData) {
        console.log(scrapeData, new ScrapeMetadata(scrapeData));
        return new ScrapeMetadata(scrapeData);
      }

      if (query.asCSV) {
        res.set(HEADERS.CSV_FILE(`${id}_scrape`)).end(Buffer.from(scrapeData.serializeAsCSV()));
        return;
      }

      return scrapeData;
    } catch (err) {
      if (err.name == "CastError") {
        throw new BadRequestException(
          "Invalid ID format.",
          "Supplied ID has invalid format. Valid format should have numbers and letters and look like this '5fdedb7c25ab1352eef88f60'."
        );
      }

      throw err;
    }
  }

  @Delete(":id")
  @ApiOperation(API_OPERATION.SCRAPE_DATA.DELETE_SCRAPE_BY_ID)
  @ApiParam(API_PARAM.GENERIC.ID)
  @HttpCode(HttpStatus.OK)
  async deleteByID(@Param("id") id: string): Promise<DeleteResponse> {
    try {
      return new DeleteResponse(await this.scrapeService.deleteById(id));
    } catch (err) {
      if (err.name == "CastError") {
        throw new BadRequestException(
          "Invalid ID format.",
          "Supplied ID has invalid format. Valid format should have numbers and letters and look like this '5fdedb7c25ab1352eef88f60'."
        );
      }

      throw err;
    }
  }

  @Post()
  @ApiOperation(API_OPERATION.SCRAPE_DATA.CREATE)
  @ApiBody({
    description: "Example Body",
    examples: BODY_EXAMPLES.SCRAPE_CREATE,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateScrapeDTO): Promise<ScrapedData> {
    try {
      let scrapedData: ScrapedData = ScrapedData.fromDTO(dto);

      if ((await this.scrapeService.findAllByURL(cleanURL(dto.url))).length > 0) {
        scrapedData.type = ScrapeType.Refresh;
      } else {
        scrapedData.type = ScrapeType.Initial;
      }

      return await this.scrapeService.create(scrapedData);
    } catch (err) {
      if (err.name == "CastError") {
        throw new BadRequestException(
          "Invalid ID format.",
          "Supplied ID has invalid format. Valid format should have numbers and letters and look like this '5fdedb7c25ab1352eef88f60'."
        );
      }

      throw err;
    }
  }
}
