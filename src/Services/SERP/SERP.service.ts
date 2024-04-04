import fs from "fs";
import _ from "lodash";
import { DateTime } from "luxon";
import { Constants, isValidURL } from "../../Common";
import { Injectable } from "@nestjs/common";
import { JenkinsAPI } from "../JenkinsAPI/JenkinsAPI";
import { SERPIdentifierType, UploadedMulterFile } from "../../Common/Types";
import { SERPResponse } from "../../Models/SERP/Response";
import { ScaleSERPService } from "../ScaleSERP/ScaleSERP.service";
import { SERPListResponse } from "../../Models/SERP/Response/SERPListResponse";
import { ApplicationException } from "../../Common/Errors/ApplicationException";
import { ScaleSERPAccountInfo } from "../../Models/ScaleSERP/DTO/ScaleSERPAccountInfo";
import { JenkinsJobResponse } from "../../Models/Jenkins/Response/JenkinsJobResponse";
import { FirebaseStorageAdapter } from "../StorageManager/StorageAdapter/FirebaseStorageAdapter";
import { CSVParseError } from "../../Models/SERP/DTO/CSVParseErrors";
import { CSVHelpers } from "../../Common/CSVSerializer/CSVHelpers";

@Injectable()
export class SERPService {
  private firebaseStorageAdapter: FirebaseStorageAdapter;
  private jenkins: JenkinsAPI;

  constructor(private scaleSERPService: ScaleSERPService) {
    this.firebaseStorageAdapter = new FirebaseStorageAdapter(process.env.FS_STORAGE_SERP_DIR);
    this.jenkins = new JenkinsAPI(process.env.JK_SERP_API_KEY);
  }

  async searchGoogleByFormula(formula: string, numOfResults: number, location: string): Promise<SERPResponse> {
    return new SERPResponse(
      formula,
      SERPIdentifierType.Formula,
      await this.scaleSERPService.searchGoogleByFormula(formula, numOfResults, location)
    );
  }

  async searchGoogleByQuery(query: string, numOfResults: number, location: string): Promise<SERPResponse> {
    return new SERPResponse(
      query,
      SERPIdentifierType.Query,
      await this.scaleSERPService.searchGoogleByQuery(query, numOfResults, location)
    );
  }

  async validateCSVFile(
    file: UploadedMulterFile,
    type: SERPIdentifierType,
    columnName: string
  ): Promise<string[] | CSVParseError[]> {
    const parsedData = CSVHelpers.parseCSV(file.buffer.toString(), columnName);
    const parseErrors: CSVParseError[] = parsedData.parseErrors;

    if (!parsedData.data || parsedData.data.length === 0) {
      return parseErrors.length !== 0 ? parseErrors : null;
    }

    let identifiers: string[] = [];

    if (type === SERPIdentifierType.Formula) {
      identifiers = parsedData.data.filter((url, _) => {
        if (!isValidURL(url)) {
          parseErrors.push(new CSVParseError(_ + 2, "TypeMismatch", "InvalidURL", `${url} is not a valid URL`, url));
          return false;
        }
        return true;
      });
    } else {
      identifiers = parsedData.data;
    }

    return parseErrors.length !== 0 ? parseErrors : identifiers;
  }

  async batchSearchGoogle(
    type: SERPIdentifierType,
    inputFilepath: string,
    columnName: string,
    numOfResults: number,
    location: string,
    outputFilename: string,
    numOfLines: number
  ): Promise<JenkinsJobResponse<any>> {
    const { JK_SERP_BUILD_URL, JK_SERP_JOB_NAME } = process.env;

    const serpAccount: ScaleSERPAccountInfo = await this.scaleSERPService.getAccountInfo();

    numOfLines = numOfLines - 1;
    if (serpAccount.creditsRemaining < numOfLines) {
      throw new ApplicationException(
        `Not enough credits left to perform this search. Credits left: ${serpAccount.creditsRemaining}, expected number of identifiers in file: ${numOfLines}`,
        { account: serpAccount }
      );
    }

    await this.jenkins.asureNoRunningVitalJobs();
    await this.firebaseStorageAdapter.assureUniqueFile(outputFilename);

    let job = await this.jenkins.getJob(JK_SERP_JOB_NAME);
    let latestBuild = await this.jenkins.getBuild(JK_SERP_JOB_NAME, job.lastBuild.number);
    const isQueueEmpty: boolean = !job.queueItem && !latestBuild.building && !latestBuild.inProgress;

    let parameters = {
      type: type.valueOf(),
      inputFilepath: inputFilepath,
      columnName: columnName,
      numberOfResults: numOfResults,
      location: location,
      outputFilename: outputFilename,
    };

    await this.jenkins.build(JK_SERP_JOB_NAME, parameters);

    return new JenkinsJobResponse(`Successfully ${!isQueueEmpty ? "started" : "queued"} SERP Search job.`, true, {
      buildURL: isQueueEmpty
        ? JK_SERP_BUILD_URL
        : "This build is added to the queue, it's build URL will be added when it begins to execute.",
      expectedNumberOfSearches: numOfLines,
      expectedId: isQueueEmpty ? job.nextBuildNumber : "This build is currently in queue and has no assigned ID.",
      location: location,
      parameters: parameters,
      serpAccount: serpAccount,
    });
  }

  async stopBatchSearch(buildId: number): Promise<void> {
    const build = await this.jenkins.getBuild(process.env.JK_SERP_JOB_NAME, buildId);

    console.log(build);
    if (!build) {
      throw new ApplicationException(`Build with ID: '${buildId}' not found.`, { buildId: buildId });
    } else if (!build.inProgress) {
      throw new ApplicationException(`Build with ID: '${buildId}' is not running.`, {
        buildId: buildId,
        result: build.result,
      });
    }

    await this.jenkins.stopBuild(process.env.JK_SERP_JOB_NAME, buildId);
  }

  async buildBackup(backupName: string): Promise<string> {
    const backupPath: string = `${process.env.TMP_DIR}/${backupName}`;

    if (!fs.existsSync(backupPath)) {
      throw new ApplicationException(
        `Backup folder with name '${backupName}' on path '${backupPath}' doesn't exist.`,
        null
      );
    }

    let output: string = "";
    let currentFile: string = "";

    try {
      const backupFiles: string[] = fs.readdirSync(backupPath);

      for (const file of backupFiles) {
        currentFile = file;
        let filePath: string = `${backupPath}/${file}`;

        output += SERPResponse.fromBackupJSON(fs.readFileSync(filePath).toString()).serializeAsCSV();
        output += "\n\n";
      }
    } catch (err) {
      throw new ApplicationException("Unable to process backedup data.", {
        backupFileName: currentFile,
        message: err.message,
      });
    }

    fs.rmSync(backupPath, { recursive: true, force: true });

    return output;
  }

  async getLogs(buildId: number, lastNLines: number): Promise<string> {
    let build: number = buildId;

    if (!buildId) {
      build = (await this.jenkins.getJob(process.env.JK_SERP_JOB_NAME)).lastBuild.number;
    }

    const logs: string[] = (await this.jenkins.getLogs(process.env.JK_SERP_JOB_NAME, build)).split("\n");
    return logs.slice(logs.length - lastNLines, logs.length).join("\n");
  }

  async listFiles(name: string, startDate: string, endDate: string): Promise<SERPListResponse[]> {
    let validPaths: string[] = (await this.firebaseStorageAdapter.listAll()).items.map((x) => x.name);

    if (name) {
      validPaths = validPaths.filter((x) => x.includes(name));
    }

    let files: SERPListResponse[] = [];
    for (let path of validPaths) {
      let metadata = await this.firebaseStorageAdapter.getFileMetadata(path);
      files.push(new SERPListResponse(metadata.fullPath, metadata.size, metadata.timeCreated));
    }

    if (startDate) {
      const startMillis = DateTime.fromFormat(startDate, Constants.FULL_DATE_TIME_FORMAT).toMillis();
      files = files.filter((x) => x.dateMilliseconds > startMillis);
    }

    if (endDate) {
      const endMillis = DateTime.fromFormat(endDate, Constants.FULL_DATE_TIME_FORMAT).toMillis();
      files = files.filter((x) => x.dateMilliseconds < endMillis);
    }

    return files.sort((x) => x.dateMilliseconds).reverse();
  }
}
