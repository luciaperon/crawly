import {
  Get,
  Res,
  Post,
  Query,
  Delete,
  HttpCode,
  Controller,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import _ from "lodash";
import { Response } from "express";
import { UploadedMulterFile } from "../Common";
import { API_BODY } from "../Common/Docs/ApiBody";
import { ApiFile } from "../Common/NestJS/ApiBody";
import { HEADERS } from "../Common/NestJS/Headers";
import { PlainBody } from "../Common/NestJS/PlainBody";
import { API_OPERATION, API_QUERY } from "Common/Docs";
import { FileInterceptor } from "@nestjs/platform-express";
import { GenericResponse } from "../Models/Shared/GenericResponse";
import { ListKeywordsParams } from "../Models/Keywords/QueryParams";
import { KeywordsService } from "../Services/Keywords/Keywords.service";
import { IStorageAdapter } from "../Services/StorageManager/IStorageAdapter";
import { GetFileParams } from "../Models/Keywords/QueryParams/GetFileParams";
import { ApiTags, ApiQuery, ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { FirebaseStorageAdapter } from "../Services/StorageManager/StorageAdapter/FirebaseStorageAdapter";

@ApiTags("Keywords")
@Controller("keywords")
export class KeywordsController {
  firebaseStorageAdapter: IStorageAdapter;
  getBackupName: (fileName: string) => string;
  keywords: string[];

  constructor(private keywordsService: KeywordsService) {
    this.firebaseStorageAdapter = new FirebaseStorageAdapter(process.env.FB_STORAGE_KEYWORDS_DIR);
  }

  @Get("list")
  @ApiOperation(API_OPERATION.KEYWORDS.LIST_FILES)
  @ApiQuery(API_QUERY.KEYWORDS.SUBDIRECTORY)
  @HttpCode(HttpStatus.OK)
  async listDirectory(@Query() query: ListKeywordsParams): Promise<any[]> {
    return await this.keywordsService.listDirectories(query.subdirectory ? "/" + query.subdirectory : "");
  }

  @Get("file")
  @ApiOperation(API_OPERATION.KEYWORDS.GET_FILE)
  @ApiQuery(API_QUERY.KEYWORDS.KEYWORD_FILE_NAME)
  @ApiQuery(API_QUERY.GENERIC.SEARCH)
  @ApiQuery(API_QUERY.KEYWORDS.LAST_N_WORDS)
  @HttpCode(HttpStatus.OK)
  async getFile(@Query() query: GetFileParams, @Res({ passthrough: true }) res: Response): Promise<string | Buffer> {
    let content: string = await this.keywordsService.getFile(query.fileName, query.search, query.lastNWords);

    if (query.lastNWords) {
      if (content.length > 1000) {
        res.set(HEADERS.TEXT_FILE(`${query.fileName}_last_${query.lastNWords}_words.txt`)).end(Buffer.from(content));
      } else {
        return content;
      }
    }

    res.set(HEADERS.TEXT_FILE(query.fileName)).end(Buffer.from(content));
    return;
  }

  @Get("url")
  @ApiOperation(API_OPERATION.KEYWORDS.GET_FILE_URL)
  @ApiQuery(API_QUERY.KEYWORDS.KEYWORD_FILE_NAME)
  @HttpCode(HttpStatus.OK)
  async getFileDownloadURL(@Query("fileName") fileName: string): Promise<GenericResponse> {
    return new GenericResponse(await this.keywordsService.getFileDownloadURL(fileName));
  }

  @Post("file")
  @ApiOperation(API_OPERATION.KEYWORDS.UPLOAD_FILE)
  @ApiQuery(API_QUERY.KEYWORDS.SUBDIRECTORY)
  @ApiConsumes("multipart/form-data")
  @ApiFile()
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(HttpStatus.OK)
  async uploadFile(
    @Query("subdirectory") subdirectory: string,
    @UploadedFile("file") file: UploadedMulterFile
  ): Promise<GenericResponse | Buffer> {
    await this.keywordsService.uploadFile(subdirectory ? subdirectory + "/" : "", file);
    return new GenericResponse(`Successfully uploaded '${file.originalname}'.`);
  }

  @Post("")
  @ApiOperation(API_OPERATION.KEYWORDS.APPEND_TO_FILE)
  @ApiQuery(API_QUERY.KEYWORDS.KEYWORD_FILE_NAME)
  @ApiBody(API_BODY.KEYWORDS.APPEND_TO_FILE)
  @ApiConsumes("text/plain")
  @HttpCode(HttpStatus.OK)
  async appendToFile(
    @Query("fileName") fileName: string,
    @PlainBody() body: string
  ): Promise<GenericResponse | Buffer> {
    if (!body || body.length === 0) {
      throw new BadRequestException("Body must be defined and not empty");
    }

    await this.keywordsService.appendToFile(fileName, body);
    return new GenericResponse(`Successfully appended keywords to '${fileName}'.`);
  }

  @Post("undo")
  @ApiOperation(API_OPERATION.KEYWORDS.RESTORE_BACKUP)
  @ApiQuery(API_QUERY.KEYWORDS.KEYWORD_FILE_NAME)
  @HttpCode(HttpStatus.OK)
  async restoreBackup(@Query("fileName") fileName: string): Promise<GenericResponse> {
    await this.keywordsService.restoreBackup(fileName);
    return new GenericResponse(`Successfully reverted last change from '${fileName}'.`, "");
  }

  @Post("deduplicate")
  @ApiOperation(API_OPERATION.KEYWORDS.DEDUPLICATE)
  @ApiQuery(API_QUERY.KEYWORDS.KEYWORD_FILE_NAME)
  @HttpCode(HttpStatus.OK)
  async deduplicate(@Query("fileName") fileName: string): Promise<GenericResponse> {
    await this.keywordsService.deduplicate(fileName);
    return new GenericResponse(`Successfully deduplicated '${fileName}'.`, "");
  }

  @Delete("file")
  @ApiOperation(API_OPERATION.KEYWORDS.DELETE_FILE)
  @ApiQuery(API_QUERY.KEYWORDS.KEYWORD_FILE_NAME)
  @ApiConsumes("text/plain")
  @HttpCode(HttpStatus.OK)
  async delete(@Query("fileName") fileName: string): Promise<GenericResponse> {
    await this.keywordsService.delete(fileName);
    //#FIX RESPONSE
    return new GenericResponse(`Successfully deleted '${fileName}'.`);
  }

  @Delete("")
  @ApiOperation(API_OPERATION.KEYWORDS.DELETE_FROM_FILE)
  @ApiQuery(API_QUERY.KEYWORDS.KEYWORD_FILE_NAME)
  @ApiBody(API_BODY.KEYWORDS.DELETE_FROM_FILE)
  @ApiConsumes("text/plain")
  @HttpCode(HttpStatus.OK)
  async deleteFromFile(@Query("fileName") fileName: string, @PlainBody() body: string): Promise<GenericResponse> {
    if (!body || body.length === 0) {
      throw new BadRequestException("Body must be defined and not empty");
    }

    let change: number = await this.keywordsService.deleteFromFile(fileName, body);

    return new GenericResponse(
      change === 0
        ? "Keywords not found, file remains unchanged."
        : `Successfully deleted ${change} keyword/s from file ${fileName}`,
      ""
    );
  }
}
