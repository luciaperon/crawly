import { CSVParseError } from "./CSVParseErrors";
import { SERPResponse } from "../Response/SERPResponse";
import { ICSVSerializable } from "../../../Common/CSVSerializer/ICSVSerializable";

export class SERPBatchDTO extends ICSVSerializable {
  results: SERPResponse[];
  errors: CSVParseError[];

  constructor(results: SERPResponse[], errors: CSVParseError[]) {
    super();
    this.results = results;
    this.errors = errors;
  }

  serializeAsCSV(): string {
    return this.results.map((x) => x.serializeAsCSV()).join("\n\n");
  }
}
