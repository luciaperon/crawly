import {
  Queue,
  zipFile,
  simpleID,
  encodeUTF8,
  isValidURL,
  currentDateTime,
  SERPIdentifierType,
  ApplicationException,
} from "../../Common";
import fs from "fs-extra";
import str2ab from "string-to-arraybuffer";
import { SERPService } from "./SERP.service";
import { SERPResponse } from "../../Models/SERP/Response";
import { SERPBatchDTO } from "../../Models/SERP/DTO/SERPBatchDTO";
import { ScaleSERPService } from "../ScaleSERP/ScaleSERP.service";
import { CSVHelpers } from "../../Common/CSVSerializer/CSVHelpers";
import { CSVParseError } from "../../Models/SERP/DTO/CSVParseErrors";
import { RetriableIdentifier } from "../../Models/SERP/DTO/RetriableIdentifier";
import { ScaleSERPAccountInfo } from "../../Models/ScaleSERP/DTO/ScaleSERPAccountInfo";
import { FirebaseStorageAdapter } from "../StorageManager/StorageAdapter/FirebaseStorageAdapter";

export class SERPBatchExtractor {
  scaleSERPService: ScaleSERPService;
  SERPService: SERPService;
  firebaseStorageAdapter: FirebaseStorageAdapter;
  searchFunction: (identifier: string, numOfResults: number, location: string) => Promise<SERPResponse>;

  type: SERPIdentifierType;
  inputFilePath: string;
  columnName: string;
  numOfResults: number;
  location: string;
  outputFilePath: string;
  tmpFilePath: string;
  tmpFileName: string;

  isSuccessfullyParsed: boolean;
  parseErrors: CSVParseError[];

  constructor(
    type: SERPIdentifierType,
    inputFilePath: string,
    columnName: string,
    numOfResults: number,
    location: string,
    outputFilename: string
  ) {
    this.type = type;
    this.inputFilePath = inputFilePath;
    this.columnName = columnName;
    this.numOfResults = numOfResults;
    this.location = location;
    this.outputFilePath = outputFilename;
    this.isSuccessfullyParsed = false;
    this.tmpFileName = `${this.outputFilePath.replace(/ |_|\./g, "-")}_${simpleID(6)}.ndjson`;
    this.tmpFilePath = `${process.env.TMP_DIR}/${this.tmpFileName}`;

    this.scaleSERPService = new ScaleSERPService();
    this.SERPService = new SERPService(this.scaleSERPService);
    this.firebaseStorageAdapter = new FirebaseStorageAdapter(process.env.FS_STORAGE_SERP_DIR);

    this.searchFunction =
      type === SERPIdentifierType.Formula
        ? this.SERPService.searchGoogleByFormula
        : type === SERPIdentifierType.Query
        ? this.SERPService.searchGoogleByQuery
        : null;

    if (!this.searchFunction) {
      throw new Error(`Unknow SERP type ${type}.`);
    }
  }

  async batchSearchGoogle(): Promise<SERPBatchDTO> {
    const results: SERPResponse[] = [];

    try {
      this.logInfo(`Starting SERP BATCH Search by ${this.type}...`);

      this.logInfo("Parsing input file...");
      const csvString: string = fs.readFileSync(this.inputFilePath, "utf-8").toString();
      const parsedData = CSVHelpers.parseCSV(csvString, this.columnName);

      this.logInfo(`Checking available credits...`);
      const serpAccount: ScaleSERPAccountInfo = await this.scaleSERPService.getAccountInfo();

      if (serpAccount.creditsRemaining < parsedData.data.length) {
        throw new ApplicationException(
          `Not enough credits left to perform this search. Credits left: ${serpAccount.creditsRemaining}, expected number of identifiers in file: ${parsedData.data.length}`,
          { account: serpAccount }
        );
      }

      this.parseErrors = parsedData.parseErrors;

      this.logInfo("Validating input data...");
      let queue: Queue<RetriableIdentifier> = new Queue();
      this.validateData(parsedData.data, this.type)
        .reverse()
        .map((x) => new RetriableIdentifier(x))
        .forEach((x) => queue.push(x));

      if (this.parseErrors.length > 0) {
        this.parseErrors.forEach((x) => ++x.row);
        this.logError(`Found ${this.parseErrors.length} errors during parsing. Fix them and try again.`);
        console.log(this.parseErrors);
        return null;
      }

      this.isSuccessfullyParsed = true;
      this.logInfo(`Starting search process for ${queue.size() - this.parseErrors.length} identifiers...`);

      let rowNum = 1;
      while (queue.size()) {
        const identifier: RetriableIdentifier = queue.pop();

        try {
          if (identifier.retry === 0) {
            this.logInfo(
              `[${rowNum}] Requesting ${this.numOfResults} results from Google for identifier: '${identifier.value}'...`
            );
          } else {
            this.logInfo(
              `[${rowNum}] [Retry: ${identifier.retry}] Rerequesting ${this.numOfResults} results from Google for identifier: '${identifier.value}'...`
            );
          }

          const response: SERPResponse = await this.searchFunction(identifier.value, this.numOfResults, this.location);

          results.push(response);
          fs.appendFileSync(this.tmpFilePath, encodeUTF8(JSON.stringify(response)) + "\n", "utf-8");

          this.logInfo(
            `[${rowNum}] Got ${response.searchResults.length} results for identifier: '${identifier.value}'.`
          );
          ++rowNum;
        } catch (err) {
          identifier.fail();

          if (identifier.failed()) {
            this.logError(`Failed to parse data for identifier ${identifier.value} after 3 attempts.`, err);
            this.parseErrors.push(
              new CSVParseError(rowNum, "ResultError", "ProviderError", err.message, identifier.value)
            );
          } else {
            this.logError(`Failed to parse data for identifier ${identifier.value}. Retrying...`, err);
            queue.push(identifier);
          }
        }
      }

      return new SERPBatchDTO(results, this.parseErrors);
    } catch (err) {
      this.logError(`Failed to start the process for file ${this.inputFilePath}`, err);

      throw err;
    }
  }

  async process(): Promise<number> {
    let exitStatus: number = 1;

    try {
      this.logInfo(`Initializing dependencies...`);

      this.logInfo(`Using Temporary backup file: '${this.tmpFileName}' on path '${this.tmpFilePath}.'`);
      fs.ensureFileSync(this.tmpFilePath);

      let response: SERPBatchDTO = await this.batchSearchGoogle();

      if (response != null) {
        await this.uploadToStorage(response, this.outputFilePath);

        this.logInfo(
          `Finished SERP Searching process for file '${this.inputFilePath}'. Output filename: '${this.outputFilePath}'`
        );

        if (response.errors.length > 0) {
          this.logInfo(`Found ${response.errors.length} errors during processing: `);
          console.log(response.errors);
        }

        exitStatus = 0;
      } else if (this.isSuccessfullyParsed) {
        this.logInfo(
          `Unable to get response. You can find backup files or use this directory to generate partial results.`
        );

        this.logInfo("Compressing backup file...");
        await zipFile(this.tmpFilePath, process.env.SERP_BACKUP_DIR);

        this.logInfo(`Temporary Output name: '${this.tmpFileName}' on path: '${this.tmpFilePath}'.`);
      }
    } catch (err) {
      this.logError("An unexpected error has occurred. Details: ");
      this.logError(err.message);
      exitStatus = 1;
    }

    try {
      this.logInfo("Attempting to remove temporary backup file...");
      fs.rmSync(this.tmpFilePath, { recursive: true, force: true });
    } catch (err) {
      this.logError(`Failed to remove Temporary backup file '${this.tmpFilePath}'. Please remove it manually.`, err);
      this.logError("Moving on...");
    }

    try {
      this.logInfo("Attempting to remove input file...");
      fs.rmSync(this.inputFilePath);
    } catch (err) {
      this.logError(`Failed to remove input file '${this.inputFilePath}'. Please remove it manually.`, err);
      this.logError("Moving on...");
    }

    this.logInfo("Exiting...");

    process.exit(exitStatus);
  }

  validateData(data: string[], type: SERPIdentifierType): string[] {
    if (!data) {
      return;
    }

    if (type === SERPIdentifierType.Formula) {
      this.logInfo(`Validating URLs...`);
      return data.filter((url, _) => {
        if (!isValidURL(url)) {
          this.parseErrors.push(
            new CSVParseError(_ + 2, "TypeMismatch", "InvalidURL", `${url} is not a valid URL`, url)
          );
          return false;
        }
        return true;
      });
    } else {
      return data.filter((x) => x && x.length !== 0);
    }
  }

  async uploadToStorage(response: SERPBatchDTO, outputFilename: string): Promise<void> {
    if (response.results.length > 0) {
      await this.firebaseStorageAdapter.uploadFile(outputFilename, str2ab(encodeUTF8(response.serializeAsCSV())), {
        contentType: "text/csv",
      });
    }
  }

  logInfo(message: string): void {
    console.log(`[${currentDateTime()}] [INFO] ${message}`);
  }

  logError(message: string, err?: any): void {
    if (err) {
      console.log(
        `[${currentDateTime()}] [ERROR] ${message}. Message: ${err.message}, Stack: ${
          err.stack ? `${err.stack}.` : "Unknow Stack."
        }`
      );
    } else {
      console.log(`[${currentDateTime()}] [ERROR] ${message}.`);
    }
  }
}

(async () => {
  const myArgs = process.argv.slice(2);

  if (myArgs.length === 6) {
    const exitStatus: number = await new SERPBatchExtractor(
      myArgs[0] as SERPIdentifierType,
      myArgs[1],
      myArgs[2],
      Number(myArgs[3]),
      myArgs[4],
      myArgs[5]
    ).process();

    process.exit(exitStatus);
  }
})();
