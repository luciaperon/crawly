export class CSVParseError {
  row: number;
  type: string;
  code: string;
  message: string;
  content?: string;

  constructor(row: number, type: string, code: string, message: string, content?: string) {
    this.row = row;
    this.type = type;
    this.code = code;
    this.message = message;
    this.content = content || "";
  }
}
