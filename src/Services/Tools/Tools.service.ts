import { Injectable } from "@nestjs/common";
import fs from "fs";
import { load as CheerioLoad } from "cheerio";
import { Keywords, PuppeteerInstance } from "Common";
import { DeadPageResponse } from "Models/Tools";
import { CSVHelpers } from "../../Common/CSVSerializer/CSVHelpers";
import { UploadedMulterFile } from "../../Common/Types";
import { DeadPagesResponse } from "../../Models/Tools/DeadPageChecker/Response/DeadPagesResponse";

@Injectable()
export class ToolsService {
  constructor() {}

  async checkDeadPage(url: string): Promise<DeadPageResponse> {
    const puppeteer: PuppeteerInstance = new PuppeteerInstance(true);
    const isUnsecure = !url.includes("https");

    try {
      await puppeteer.goto(url, 0);

      const $ = CheerioLoad(await puppeteer.currentPage.content());
      const text = $($("body").html().replace(/>/g, "> "))
        .text()
        .replace(/(  | ?\n| ?\t)+/g, "  ");

      const isForSale = Keywords.FOR_SALE_PAGES_KEYWORDS.some((x) => text.includes(x));

      return new DeadPageResponse(url, false, isForSale, isUnsecure);
    } catch (err) {
      return new DeadPageResponse(url, true, false, isUnsecure);
    } finally {
      await puppeteer.gracefullyClose();
    }
  }

  async checkDeadPages(file: UploadedMulterFile, websiteColumnName: string): Promise<DeadPagesResponse> {
    const csvString = file.buffer.toString();

    // const columnIndex = CSVHelpers.getColumnIndex(csvString, websiteColumnName);

    // const { data, parseErrors } = CSVHelpers.parseCSV(csvString, columnIndex);

    // let results: DeadPageResponse[] = [];
    // let errors = [...parseErrors];
    // for (let i = 0; i < data.length; ++i) {
    //   try {
    //     results.push(await this.checkDeadPage(data[i]));
    //   } catch (err) {
    //     errors.push(err);
    //   }
    // }

    // return new DeadPagesResponse(results, parseErrors);
    return;
  }

  getAdImage(imagePath: string): Buffer {
    return fs.readFileSync(`${process.env.ADS_IMAGE_PATH}/${imagePath}`);
  }
}
