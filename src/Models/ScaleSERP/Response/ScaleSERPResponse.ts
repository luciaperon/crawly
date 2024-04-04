import { OrganicResult } from "./OrganicResult";

export class ScaleSERPResponse {
  organicResults: OrganicResult[] = [];

  static fromJSON(jsonData: any): ScaleSERPResponse {
    let scaleSERPResponse = new ScaleSERPResponse();

    if (jsonData["organic_results"]) {
      scaleSERPResponse.organicResults = (jsonData["organic_results"] as any[]).map(
        (x) => new OrganicResult(x["position"], x["domain"], x["title"], x["snippet"], x["link"])
      );

      return scaleSERPResponse;
    }

    scaleSERPResponse.organicResults = [];
    return scaleSERPResponse;
  }
}
