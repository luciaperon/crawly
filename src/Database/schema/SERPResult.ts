import { DateTime } from "luxon";
import { csvJoin } from "../../Common";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ScaleSERPResponse } from "@Models/ScaleSERP/Response";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SERPVendor, SERPIdentifierType } from "../../Common/Types";

export type SERPResultDocument = SERPResult & Document;

@Schema()
export class SERPResult {
  _id: MongooseSchema.Types.ObjectId;

  @Prop()
  createdAt: number;

  @Prop()
  batchFileName: string;

  @Prop()
  identifier: string;

  @Prop()
  identiferType: SERPIdentifierType;

  @Prop()
  vendor: SERPVendor;

  @Prop()
  searchResult: ScaleSERPResponse;
}

export function toSERPResult(
  identifier: string,
  identifierType: SERPIdentifierType,
  vendor: SERPVendor,
  searchResult: ScaleSERPResponse,
  fileName?: string
) {
  let serpResult = new SERPResult();

  serpResult.createdAt = DateTime.now().toMillis();
  serpResult.identifier = identifier;
  serpResult.identiferType = identifierType;
  serpResult.vendor = vendor;
  serpResult.searchResult = searchResult;
  serpResult.batchFileName = fileName ? fileName : "";

  return serpResult;
}

export function serializeOneAsCSV(result: SERPResult): string {
  let csv: string[][] = [];

  if (!result || !result.searchResult) {
    return "";
  }

  let identifier: string = result.identifier;

  if (result.identiferType === SERPIdentifierType.Query) {
    csv.push(["Query", "Position", "Domain", "Title", "Snippet", "Link"]);
    result.searchResult.organicResults.forEach((x) => {
      csv.push([identifier, x.position.toString(), x.domnain, x.title, x.snippet, x.link]);
    });
  } else {
    csv.push(["Position", "Domain", "Title", "Snippet", "Link", "Formula"]);
    result.searchResult.organicResults.forEach((x) => {
      csv.push([x.position.toString(), x.domnain, x.title, x.snippet, x.link, identifier]);
    });
  }

  let formatted = csv.map((x) => csvJoin(x.map((y) => y.replace(";", ","))));

  return formatted.join("\n");
}

export function serializeManyAsCSV(results: SERPResult[]): string {
  let csv: string[][] = [];

  if (results.length === 0 || !results[0].searchResult) {
    return "";
  }

  if (results[0].identiferType === SERPIdentifierType.Query) {
    results.forEach((result) => {
      csv.push(["Query", "Position", "Domain", "Title", "Snippet", "Link"]);
      result.searchResult.organicResults.forEach((x) => {
        csv.push([result.identifier, x.position.toString(), x.domnain, x.title, x.snippet, x.link]);
      });
      csv.push(["\n"]);
    });
  } else {
    results.forEach((result) => {
      csv.push(["Position", "Domain", "Title", "Snippet", "Link", "Formula"]);
      result.searchResult.organicResults.forEach((x) => {
        csv.push([x.position.toString(), x.domnain, x.title, x.snippet, x.link, result.identifier]);
      });
      csv.push(["\n"]);
    });
  }

  let formatted = csv.map((x) => csvJoin(x.map((y) => y.replace(";", ","))));

  return formatted.join("\n");
}

export const SERPResultSchema = SchemaFactory.createForClass(SERPResult);
