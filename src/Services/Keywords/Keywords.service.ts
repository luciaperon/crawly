import _ from "lodash";
import mime from "mime-types";
import ab2str from "arraybuffer-to-string";
import str2ab from "string-to-arraybuffer";
import { Injectable } from "@nestjs/common";
import { UploadedMulterFile } from "../../Common";
import { FirebaseStorageAdapter } from "../StorageManager/StorageAdapter/FirebaseStorageAdapter";

@Injectable()
export class KeywordsService {
  private firebaseStorageAdapter: FirebaseStorageAdapter;

  constructor() {
    this.firebaseStorageAdapter = new FirebaseStorageAdapter(process.env.FS_KEYWORDS_DIR);
  }

  async listDirectories(subdirectory: string): Promise<string[]> {
    return (await this.firebaseStorageAdapter.listAll(subdirectory)).items.map((x) =>
      x.fullPath.replace(`${process.env.KEYWORDS_BUCKET}/`, "")
    );
  }

  async getFile(fileName: string, search: string, lastNWords: number): Promise<string> {
    let content: string = ab2str(await this.firebaseStorageAdapter.getFile(fileName));

    if (search) {
      content = content
        .split("\n")
        .filter((x) => x.includes(search))
        .join("\n");
    }

    return content.split("\n").slice(-lastNWords).join("\n");
  }

  async getFileDownloadURL(fileName: string): Promise<string> {
    return await this.firebaseStorageAdapter.getDownloadLink(fileName);
  }

  async uploadFile(subdirectory: string, file: UploadedMulterFile): Promise<void> {
    const bucketRefName = `${subdirectory}${file.originalname}`;
    const metadata = {
      contentType: file.mimetype,
    };

    await this.firebaseStorageAdapter.uploadFile(bucketRefName, new Uint8Array(file.buffer).buffer, metadata);
    await this.firebaseStorageAdapter.uploadFile(
      this.getBackupName(bucketRefName),
      new Uint8Array(file.buffer).buffer,
      metadata
    );
  }

  async appendToFile(fileName: string, body: string): Promise<void> {
    const buffer: ArrayBuffer = await this.firebaseStorageAdapter.getFile(fileName);

    const metadata = {
      contentType: mime.lookup(fileName),
    };

    let content: string = ab2str(buffer);

    await this.firebaseStorageAdapter.uploadFile(this.getBackupName(fileName), str2ab(content), metadata);

    content += `\n${body
      .replace("(\n)+", "\n")
      .replace("  +", " ")
      .split("\n")
      .filter((x) => x.length !== 0)
      .join("\n")}`;

    await this.firebaseStorageAdapter.uploadFile(fileName, str2ab(content), metadata);
  }

  async restoreBackup(fileName: string): Promise<void> {
    const buffer: ArrayBuffer = await this.firebaseStorageAdapter.getFile(fileName);

    const metadata = {
      contentType: mime.lookup(fileName),
    };

    let content: string = ab2str(buffer);
    let bckpContent: string = ab2str(await this.firebaseStorageAdapter.getFile(this.getBackupName(fileName)));

    await this.firebaseStorageAdapter.uploadFile(this.getBackupName(fileName), str2ab(content), metadata);
    await this.firebaseStorageAdapter.uploadFile(fileName, str2ab(bckpContent), metadata);
  }

  async deduplicate(fileName: string): Promise<void> {
    const buffer: ArrayBuffer = await this.firebaseStorageAdapter.getFile(fileName);
    const metadata = {
      contentType: mime.lookup(fileName),
    };

    let rawContent: string = ab2str(buffer);

    await this.firebaseStorageAdapter.uploadFile(this.getBackupName(fileName), str2ab(rawContent), metadata);

    let content: string[] = rawContent.split("\n");
    await this.firebaseStorageAdapter.uploadFile(fileName, str2ab(_.uniq(content).join("\n")), metadata);
  }

  async delete(fileName: string): Promise<void> {
    await this.firebaseStorageAdapter.delete(fileName);
    await this.firebaseStorageAdapter.delete(this.getBackupName(fileName));
  }

  async deleteFromFile(fileName: string, body: string): Promise<number> {
    const buffer: ArrayBuffer = await this.firebaseStorageAdapter.getFile(fileName);
    const metadata = {
      contentType: mime.lookup(fileName),
    };

    let rawContent: string = ab2str(buffer);

    await this.firebaseStorageAdapter.uploadFile(this.getBackupName(fileName), str2ab(rawContent), metadata);

    let content: string[] = rawContent.split("\n");

    let keywordsToDelete: string[] = body
      .replace("(\n)+", "\n")
      .replace("  +", " ")
      .split("\n")
      .filter((x) => x.length !== 0);

    let filteredContent: string[] = content.filter((x) => !keywordsToDelete.includes(x));

    await this.firebaseStorageAdapter.uploadFile(fileName, str2ab(filteredContent.join("\n")), metadata);

    return content.length - filteredContent.length;
  }

  private getBackupName = (fileName: string) => fileName.replace(".txt", "_bckp.txt");
}
