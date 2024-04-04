import { FullMetadata, ListResult } from "firebase/storage";

export interface IStorageAdapter {
  listAll(fileName: string): Promise<ListResult>;
  getFileMetadata(fileName: string): any | Promise<FullMetadata>;
  getFile(path: string): Buffer | Promise<ArrayBuffer>;
  uploadFile(fileName: string, path: ArrayBuffer, metadata?: any): string | Promise<string>;
  getDownloadLink(path: string): string | Promise<string>;
  delete(fileName: string): any;
}
