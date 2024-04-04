import { ListResult } from "firebase/storage";
import fs from "fs";
import { IStorageAdapter } from "../IStorageAdapter";

export class LocalStorageAdapter implements IStorageAdapter {
  basePath: string;

  constructor(path?: string) {
    this.basePath = path || process.env.BASE_STORAGE_PATH;
  }
  listAll(fileName: string): Promise<ListResult> {
    throw new Error("Method not implemented.");
  }
  getFileMetadata(fileName: string): unknown {
    throw new Error("Method not implemented.");
  }

  getFile(filePath: string): Buffer {
    fs.readFileSync(`${this.basePath}/${filePath}`, "utf-8");
    return null;
  }

  uploadFile(fileName: string, path: ArrayBuffer): string {
    throw new Error("Method not implemented.");
  }

  getDownloadLink(path: string): string {
    throw new Error("Method not implemented.");
  }

  delete(fileName: string) {
    throw new Error("Method not implemented.");
  }
}
