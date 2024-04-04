import {
  Res,
  Get,
  Post,
  Query,
  HttpCode,
  Controller,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  Delete,
  BadRequestException,
  Param,
} from "@nestjs/common";
import fs from "fs-extra";
import {
  SERPBatchFormulaParams,
  SERPBatchQueryParams,
  SERPFormulaParams,
  SERPQueryParams,
} from "../Models/SERP/Params";
import { Response } from "express";
import { API_QUERY } from "Common/Docs";
import str2ab from "string-to-arraybuffer";
import { FirebaseError } from "firebase/app";
import { ApiFile } from "../Common/NestJS/ApiBody";
import { HEADERS } from "../Common/NestJS/Headers";
import { SERPResponse } from "../Models/SERP/Response";
import { SERPService } from "@Services/SERP/SERP.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { API_OPERATION } from "../Common/Docs/ApiOperation";
import { GenericResponse } from "../Models/Shared/GenericResponse";
import { SERPListParams } from "../Models/SERP/Params/SERPListParams";
import { SavedFileParams } from "../Models/SERP/Params/CachedFileParams";
import { SERPIdentifierType, UploadedMulterFile } from "../Common/Types";
import { SERPListResponse } from "../Models/SERP/Response/SERPListResponse";
import { ApiTags, ApiQuery, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { SERPBatchLogsParams } from "../Models/SERP/Params/SERPBatchLogsParams";
import { JenkinsJobResponse } from "../Models/Jenkins/Response/JenkinsJobResponse";
import { SERPBuildPartialParams } from "../Models/SERP/Params/SERPBuildPartialParams";
import { parseInputFileName as generateTmpInputFilepath, parseOutputFileName } from "../Common/Helpers";
import { FirebaseStorageAdapter } from "../Services/StorageManager/StorageAdapter/FirebaseStorageAdapter";
import { ValidateCSVFileParams } from "../Models/SERP/Params/ValidateCSVFileParams";
import { CSVParseError } from "../Models/SERP/DTO/CSVParseErrors";

@ApiTags("Search Engine Results Pages")
@Controller("serp")
export class SERPController {
  firebaseStorageAdapter: FirebaseStorageAdapter;

  constructor(private readonly serpService: SERPService) {
    this.firebaseStorageAdapter = new FirebaseStorageAdapter(process.env.FS_STORAGE_SERP_DIR);
  }

  @Get("formula")
  @ApiOperation(API_OPERATION.SERP.SEARCH_GOOGLE_BY_FORMULA)
  @ApiQuery(API_QUERY.SERP.FORMULA)
  @ApiQuery(API_QUERY.GENERIC.AS_CSV)
  @ApiQuery(API_QUERY.SERP.NUM_OF_RESULTS)
  @ApiQuery(API_QUERY.SERP.SAVE_FILE(false))
  @ApiQuery(API_QUERY.SERP.OUTPUT_FILE_NAME)
  @ApiQuery(API_QUERY.SERP.LOCATION)
  @HttpCode(HttpStatus.OK)
  async searchGoogleByFormula(
    @Query() params: SERPFormulaParams,
    @Res({ passthrough: true }) res: Response
  ): Promise<SERPResponse | Buffer> {
    const fileName: string = parseOutputFileName(params.formula, params.outputFilename);

    if (params.asCSV && params.saveFile) {
      if ((await this.firebaseStorageAdapter.fileExists(fileName)) == true) {
        throw new NotFoundException(`File with the name '${fileName}' already exists.`);
      }
    }

    let serpResponse: SERPResponse = await this.serpService.searchGoogleByFormula(
      params.formula,
      params.numOfResults,
      params.location
    );
    const serializedData: string = serpResponse.serializeAsCSV();

    if (params.asCSV) {
      if (params.saveFile) {
        await this.firebaseStorageAdapter.uploadFile(fileName, str2ab(serializedData), {
          contentType: "text/csv",
        });
      }

      res.set(HEADERS.CSV_FILE(fileName)).end(Buffer.from(serializedData));
      return;
    }

    res.set(HEADERS.JSON);
    return serpResponse;
  }

  @Get("query")
  @ApiOperation(API_OPERATION.SERP.SEARCH_GOOGLE_BY_QUERY)
  @ApiQuery(API_QUERY.GENERIC.AS_CSV)
  @ApiQuery(API_QUERY.SERP.SEARCH_QUERY)
  @ApiQuery(API_QUERY.SERP.NUM_OF_RESULTS)
  @ApiQuery(API_QUERY.SERP.LOCATION)
  @ApiQuery(API_QUERY.SERP.SAVE_FILE(false))
  @ApiQuery(API_QUERY.SERP.OUTPUT_FILE_NAME)
  @HttpCode(HttpStatus.OK)
  async searchGoogleByQuery(
    @Query() params: SERPQueryParams,
    @Res({ passthrough: true }) res: Response
  ): Promise<SERPResponse | Buffer> {
    const fileName: string = parseOutputFileName(params.searchQuery, params.outputFilename);

    if (params.asCSV && params.saveFile) {
      if ((await this.firebaseStorageAdapter.fileExists(fileName)) == true) {
        throw new NotFoundException(`File with the name '${fileName}' already exists.`);
      }
    }

    let serpResponse: SERPResponse = await this.serpService.searchGoogleByQuery(
      params.searchQuery,
      params.numOfResults,
      params.location
    );
    const serializedData: string = serpResponse.serializeAsCSV();

    if (params.asCSV) {
      if (params.saveFile) {
        await this.firebaseStorageAdapter.uploadFile(fileName, str2ab(serializedData), {
          contentType: "text/csv",
        });
      }

      res.set(HEADERS.CSV_FILE(fileName)).end(Buffer.from(serializedData));
      return;
    }

    res.set(HEADERS.JSON);
    return serpResponse;
  }

  @Post("batch/validate")
  @ApiOperation(API_OPERATION.SERP.VALIDATE_CSV_FILE)
  @ApiQuery(API_QUERY.SERP.TYPE)
  @ApiQuery(API_QUERY.SERP.COLUMN_NAME)
  @ApiConsumes("multipart/form-data")
  @ApiFile()
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(HttpStatus.OK)
  async validateCSVFile(
    @Query() params: ValidateCSVFileParams,
    @UploadedFile("file") file: UploadedMulterFile
  ): Promise<GenericResponse | CSVParseError[]> {
    let results: string[] | CSVParseError[] = await this.serpService.validateCSVFile(
      file,
      params.type as SERPIdentifierType,
      params.columnName
    );

    if (results === null || results.length === 0) {
      return new GenericResponse("CSV File is either empty or no data could be extracted from column.");
    } else if (results[0] instanceof CSVParseError) {
      return new GenericResponse("Failed to parse CSV File. Found following errors: ", null, results);
    } else {
      return new GenericResponse(
        `CSV File is valid! Found following data for type '${params.type}' in column '${params.columnName}'.`,
        null,
        results
      );
    }
  }

  @Post("batch/formula")
  @ApiOperation(API_OPERATION.SERP.SEARCH_GOOGLE_BY_FORMULA_BATCH)
  @ApiQuery(API_QUERY.SERP.NUM_OF_RESULTS)
  @ApiQuery(API_QUERY.SERP.FORMULA_COLUMN_NAME)
  @ApiQuery(API_QUERY.SERP.OUTPUT_FILE_NAME_BATCH)
  @ApiQuery(API_QUERY.SERP.LOCATION)
  @ApiConsumes("multipart/form-data")
  @ApiFile()
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(HttpStatus.OK)
  async batchSearchGoogleByFormula(
    @Query() params: SERPBatchFormulaParams,
    @UploadedFile("file") file: UploadedMulterFile
  ): Promise<JenkinsJobResponse<any>> {
    const fileName: string = parseOutputFileName(file.originalname.replace(".csv", ""), params.outputFilename);
    const inputFilepath: string = generateTmpInputFilepath(file.originalname);

    fs.writeFileSync(inputFilepath, file.buffer);

    return await this.serpService.batchSearchGoogle(
      SERPIdentifierType.Formula,
      inputFilepath,
      params.formulaColumnName,
      params.numOfResults,
      params.location,
      fileName,
      file.buffer.toString().split("\n").length
    );
  }

  @Post("batch/query")
  @ApiOperation(API_OPERATION.SERP.SEARCH_GOOGLE_BY_QUERY_BATCH)
  @ApiQuery(API_QUERY.SERP.NUM_OF_RESULTS)
  @ApiQuery(API_QUERY.SERP.QUERY_COLUMN_NAME)
  @ApiQuery(API_QUERY.SERP.OUTPUT_FILE_NAME_BATCH)
  @ApiQuery(API_QUERY.SERP.LOCATION)
  @ApiConsumes("multipart/form-data")
  @ApiFile()
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(HttpStatus.OK)
  async batchSearchGoogleByQuery(
    @Query() params: SERPBatchQueryParams,
    @UploadedFile("file") file: UploadedMulterFile
  ): Promise<JenkinsJobResponse<any>> {
    const fileName: string = parseOutputFileName(file.originalname.replace(".csv", ""), params.outputFilename);
    const inputFilepath: string = generateTmpInputFilepath(file.originalname);

    fs.writeFileSync(inputFilepath, file.buffer);

    return await this.serpService.batchSearchGoogle(
      SERPIdentifierType.Query,
      inputFilepath,
      params.queryColumnName,
      params.numOfResults,
      params.location,
      fileName,
      file.buffer.toString().split("\n").length
    );
  }

  @Delete("batch/stop")
  @ApiOperation(API_OPERATION.SERP.STOP_BATCH_SEARCH_BUILD)
  @ApiQuery(API_QUERY.SERP.STOP_BUILD_ID)
  @HttpCode(HttpStatus.OK)
  async stopBatchSearch(@Query("buildId") buildId: number): Promise<GenericResponse> {
    try {
      await this.serpService.stopBatchSearch(buildId);

      return new GenericResponse(`Sucessfully stopped execution of build with ID: '${buildId}'.`);
    } catch (err) {
      throw new BadRequestException(err, `An error occurred while trying to stop the build with ID ${buildId}`);
    }
  }

  @Post("batch/partial")
  @ApiOperation(API_OPERATION.SERP.BUILD_PARTIAL)
  @ApiQuery(API_QUERY.SERP.TMP_DIR_PATH)
  @ApiQuery(API_QUERY.SERP.PARTIAL_OUTPUT_FILENAME)
  @HttpCode(HttpStatus.OK)
  async buildPartial(
    @Query() query: SERPBuildPartialParams,
    @Res({ passthrough: true }) res: Response
  ): Promise<string> {
    const fileName = parseOutputFileName(
      query.tmpDirName.slice(0, query.tmpDirName.length - 7),
      query.outputFilename,
      false
    );

    if ((await this.firebaseStorageAdapter.fileExists(fileName)) == true) {
      throw new BadRequestException(`File with the name '${fileName}' already exists.`);
    }

    let backupContent: string = await this.serpService.buildBackup(query.tmpDirName);

    await this.firebaseStorageAdapter.uploadFile(fileName, str2ab(backupContent), {
      contentType: "text/csv",
    });

    res.set(HEADERS.CSV_FILE(fileName)).end(Buffer.from(backupContent));
    return;
  }

  @Get("logs")
  @ApiOperation(API_OPERATION.SERP.GET_LOGS)
  @ApiQuery(API_QUERY.SERP.BUILD_ID)
  @ApiQuery(API_QUERY.SERP.LAST_N_LINES)
  @HttpCode(HttpStatus.OK)
  async getLogs(@Query() query: SERPBatchLogsParams, @Res({ passthrough: true }) res: Response): Promise<string> {
    const content: string = await this.serpService.getLogs(query.buildId, query.lastNLines);

    if (content.length > 5000) {
      res.set(HEADERS.TEXT_FILE(`${query.buildId}_last_${query.lastNLines}_lines.txt`)).end(Buffer.from(content));
    } else {
      return content;
    }
    return;
  }

  @Get("firestore/list")
  @ApiOperation(API_OPERATION.SERP.LIST_FILES)
  @ApiQuery(API_QUERY.SERP.NAME)
  @ApiQuery(API_QUERY.SERP.START_DATE)
  @ApiQuery(API_QUERY.SERP.END_DATE)
  @HttpCode(HttpStatus.OK)
  async listDirectory(@Query() query: SERPListParams): Promise<SERPListResponse[]> {
    return await this.serpService.listFiles(query.name, query.startDate, query.endDate);
  }

  @Get("firestore/file")
  @ApiOperation(API_OPERATION.SERP.GET_FILE)
  @ApiQuery(API_QUERY.SERP.FILE_NAME)
  @HttpCode(HttpStatus.OK)
  async getFile(
    @Query() params: SavedFileParams,
    @Res({ passthrough: true }) res: Response
  ): Promise<Buffer | GenericResponse> {
    const inputFileName = params.fileName.includes(".csv") ? params.fileName : `${params.fileName}.csv`;
    try {
      const file = await this.firebaseStorageAdapter.getFile(inputFileName);
      res.set(HEADERS.CSV_FILE(inputFileName)).end(Buffer.from(file));
      return;
    } catch (err) {
      console.log(err);
      if (err instanceof FirebaseError) {
        if (err.code === "storage/object-not-found") {
          throw new NotFoundException(`File with the name '${inputFileName}' not found.`);
        }
      }

      throw err;
    }
  }

  @Delete("firestore/file")
  @ApiOperation(API_OPERATION.SERP.DELETE_FILE)
  @ApiQuery(API_QUERY.SERP.FILE_NAME)
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Query() params: SavedFileParams): Promise<GenericResponse> {
    const inputFileName = params.fileName.includes(".csv") ? params.fileName : `${params.fileName}.csv`;

    try {
      await this.firebaseStorageAdapter.delete(inputFileName);
      return new GenericResponse(`Successfully deleted file ${inputFileName}`);
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "storage/object-not-found") {
          throw new NotFoundException(`File with the name '${inputFileName}' not found.`);
        }
      }

      throw err;
    }
  }
}
