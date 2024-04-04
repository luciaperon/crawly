import fs from "fs";
import {
  ref,
  listAll,
  getBytes,
  getStorage,
  ListResult,
  getMetadata,
  uploadBytes,
  deleteObject,
  FullMetadata,
  getDownloadURL,
  FirebaseStorage,
} from "firebase/storage";
import { IStorageAdapter } from "../IStorageAdapter";
import { ApplicationException } from "../../../Common";
import { FirebaseError, initializeApp } from "firebase/app";

export class FirebaseStorageAdapter implements IStorageAdapter {
  storage: FirebaseStorage;
  ref: string;

  constructor(ref?: string) {
    this.storage = getStorage(
      initializeApp(JSON.parse(fs.readFileSync("firebase-credentials.json").toString("utf-8")))
    );
    this.ref = `${ref}/` || "";
  }

  async listAll(path?: string): Promise<ListResult> {
    return await listAll(ref(this.storage, `${this.ref}${path || ""}`));
  }

  async getFile(path: string): Promise<ArrayBuffer> {
    return await getBytes(ref(this.storage, `${this.ref}${path}`));
  }

  async getFileMetadata(path: string): Promise<FullMetadata> {
    return await getMetadata(ref(this.storage, `${this.ref}${path}`));
  }

  async uploadFile(path: string, content: ArrayBuffer, metadata: any): Promise<string> {
    let snapshot = await uploadBytes(ref(this.storage, `${this.ref}${path}`), content, metadata);
    return "";
  }

  async getDownloadLink(path: string): Promise<string> {
    return await getDownloadURL(ref(this.storage, `${this.ref}${path}`));
  }

  async delete(path: string): Promise<boolean> {
    await deleteObject(ref(this.storage, `${this.ref}${path}`));

    return true;
  }

  async assureUniqueFile(fileName: string): Promise<any> {
    try {
      const fileMetadata: FullMetadata = await this.getFileMetadata(fileName);

      throw new ApplicationException("File with that name already exist. Please choose something unique.", {
        url: `${process.env.FS_BUCKET_URL}/${this.ref}`,
        bucket: fileMetadata.bucket,
        dir: this.ref,
        fullPath: fileMetadata.fullPath,
      });
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "storage/object-not-found") {
          return true;
        }
      }

      throw err;
    }
  }

  async assureUniqueDir(directoryName: string): Promise<any> {
    try {
      const files: ListResult = await this.listAll(directoryName);

      if (files.items.length !== 0) {
        throw new ApplicationException(
          "Directory with that name already exist. Please choose something unique or choose the override option.",
          {
            url: `${process.env.FS_BUCKET_URL}/${this.ref}`,
            dir: this.ref,
          }
        );
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "storage/object-not-found") {
          return true;
        }
      }

      throw err;
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.getFileMetadata(fileName);
      return true;
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "storage/object-not-found") {
          return false;
        }
      }

      return true;
    }
  }
}
