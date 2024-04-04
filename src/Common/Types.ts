export enum ScrapeType {
  Initial = "Initial",
  Refresh = "Refresh",
}

export class UploadedMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export enum SERPVendor {
  Google = "Google",
}
export enum SERPIdentifierType {
  Formula = "formula",
  Query = "query",
}

export enum WorkerEventType {
  internalError = "internalError",
  message = "message",
  termination = "termination",
}
export interface WorkerInternalErrorEvent {
  type: WorkerEventType.internalError;
  error: Error;
}
export interface WorkerMessageEvent<Data> {
  type: WorkerEventType.message;
  data: Data;
}
export interface WorkerTerminationEvent {
  type: WorkerEventType.termination;
}
export class RawName {
  raw: string;
  cleaned: string;

  constructor(raw: string, cleaned: string) {
    this.raw = raw;
    this.cleaned = cleaned;
  }
}
export declare type WorkerEvent = WorkerInternalErrorEvent | WorkerMessageEvent<any> | WorkerTerminationEvent;
export {};
