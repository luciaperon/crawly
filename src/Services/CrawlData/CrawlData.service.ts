import fs from "fs";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CrawlReport, CrawlReportDocument } from "@Database/schema";
import { CrawlReportDTO } from "Models/Crawler/Response";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CrawledData } from "../../Models/Crawler/Worker/CrawledData";
import { FirebaseStorageAdapter } from "../StorageManager/StorageAdapter/FirebaseStorageAdapter";
import ab2str from "arraybuffer-to-string";

@Injectable()
export class CrawlDataService {
  private firebaseStorageAdapter: FirebaseStorageAdapter;

  constructor(@InjectModel(CrawlReport.name) private CrawlReport: Model<CrawlReportDocument>) {
    this.firebaseStorageAdapter = new FirebaseStorageAdapter(process.env.FS_STORAGE_CRAWL_DATA_DIR);
  }

  async getList(): Promise<string[]> {
    return (await this.firebaseStorageAdapter.listAll()).items.map((x) =>
      x.fullPath.replace(`${process.env.FS_STORAGE_CRAWL_DATA_DIR}/`, "")
    );
  }

  async getCrawledData(fileName: string): Promise<CrawledData> {
    return JSON.parse(ab2str(await this.firebaseStorageAdapter.getFile(fileName))) as CrawledData;
  }

  async findAllBy(options: object): Promise<CrawlReport[]> {
    try {
      let crawls: CrawlReport[] = await this.CrawlReport.find(options);

      return crawls;
    } catch (err) {
      if (err.name == "CastError") {
        err.message = "Invalid Crawl Options";
      }

      throw err;
    }
  }

  async create(crawlReport: CrawlReportDTO): Promise<CrawlReport> {
    try {
      return await this.CrawlReport.create(crawlReport);
    } catch (err) {
      if (err.name == "CastError") {
        err.message = "Invalid Crawl Options";
      }

      throw err;
    }
  }

  async delete(payload: any | CrawlReport): Promise<number> {
    try {
      let crawlReport: CrawlReport;

      if (payload instanceof CrawlReport) {
        crawlReport = payload;
      } else {
        crawlReport = await this.CrawlReport.findOne(payload);
      }

      if (!crawlReport) {
        return 0;
      }

      if (await this.firebaseStorageAdapter.getFileMetadata(crawlReport.dataBucketRef)) {
        this.firebaseStorageAdapter.delete(crawlReport.dataBucketRef);
      }

      await this.CrawlReport.deleteOne({ _id: crawlReport._id });

      return 1;
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

  async deleteMany(option: object): Promise<number> {
    try {
      let deleteCount: number = 0;

      const candidates: CrawlReport[] = await this.CrawlReport.find(option);

      for (const candidate of candidates) {
        await this.delete(candidate);
        deleteCount += 1;
      }

      return deleteCount;
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
