import { DeadPageResponse } from "./DeadPageResponse";
import { CSVParseError } from "../../../SERP/DTO/CSVParseErrors";
import { ICSVSerializable } from "../../../../Common/CSVSerializer/ICSVSerializable";

export class DeadPagesResponse implements ICSVSerializable {
  response: DeadPageResponse[];
  errors: CSVParseError[];

  constructor(response: DeadPageResponse[], errors: CSVParseError[]) {
    this.response = response;
    this.errors = errors;
  }

  serializeAsCSV(): string {
    let csv: string[] = [];

    this.response.forEach((x) => {
      csv.push(x.serializeAsCSV() + "\n");
    });

    return csv.join("\n");
  }
}
