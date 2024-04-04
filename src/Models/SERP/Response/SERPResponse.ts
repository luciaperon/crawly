import { csvJoin } from "../../../Common";
import { ICSVSerializable } from "../../../Common/CSVSerializer/ICSVSerializable";
import { ScaleSERPResponse } from "@Models/ScaleSERP/Response";
import { OrganicResult } from "../../ScaleSERP/Response/OrganicResult";
import { SERPIdentifierType } from "../../../Common/Types";

export class SERPResponse extends ICSVSerializable {
  identifier: string;
  identifierType: SERPIdentifierType;
  searchResults: OrganicResult[] = [];

  constructor(identifier: string, identifierType: SERPIdentifierType, res: ScaleSERPResponse) {
    super();
    this.identifier = identifier;
    this.identifierType = identifierType;
    this.searchResults = res.organicResults;
  }

  override serializeAsCSV(): string {
    let csv: string[][] = [];

    if (this.identifierType === SERPIdentifierType.Query) {
      csv.push(["Query", "Position", "Domain", "Title", "Snippet", "Link"]);
      this.searchResults.forEach((x) => {
        csv.push([this.identifier, x.position.toString(), x.domnain, x.title, x.snippet, x.link]);
      });
    } else {
      csv.push(["Position", "Domain", "Title", "Snippet", "Link", "Formula"]);
      this.searchResults.forEach((x) => {
        csv.push([x.position.toString(), x.domnain, x.title, x.snippet, x.link, this.identifier]);
      });
    }

    return csv.map((x) => csvJoin(x)).join("\n");
  }

  static fromBackupJSON(json: string): SERPResponse {
    let parsed = JSON.parse(json);
    return new SERPResponse(parsed["identifier"], parsed["identifierType"], {
      organicResults: parsed["searchResults"],
    });
  }
}
