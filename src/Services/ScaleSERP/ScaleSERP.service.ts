import axios from "axios";
import { Injectable } from "@nestjs/common";
import { ApplicationException, Constants } from "../../Common";
import { ScaleSERPResponse } from "../../Models/ScaleSERP/Response";
import { ScaleSERPQueryBody } from "../../Models/ScaleSERP/DTO/ScaleSERP/ScaleSERPQueryBody";
import { ScaleSERPFormulaBody } from "../../Models/ScaleSERP/DTO/ScaleSERP/ScaleSERPFormulaBody";
import { ScaleSERPAccountInfo } from "../../Models/ScaleSERP/DTO/ScaleSERPAccountInfo";

@Injectable()
export class ScaleSERPService {
  constructor() {}

  async searchGoogleByFormula(formula: string, numOfResults: number, location: string): Promise<ScaleSERPResponse> {
    const body: ScaleSERPFormulaBody = new ScaleSERPFormulaBody(formula, numOfResults, location);

    if (!body.url || body.url.length === 0) {
      throw new ApplicationException("URL shouldn't be empty", "URL that defines formula shouldn't be empty");
    } else if (!body.api_key || body.api_key.length === 0) {
      throw new ApplicationException(
        "API Token for ScaleSERP is missing or expired.",
        "ScaleSERP token is missing. Check configuration files or check if you reached your limit."
      );
    }

    let params = { ...body };

    return await axios
      .get(Constants.SCALE_SERP.SEARCH_URL, { params })
      .then((res) => {
        return ScaleSERPResponse.fromJSON(res.data);
      })
      .catch((err) => {
        throw new ApplicationException(
          `An error occured on the ScaleSERP side. Message '${err.message}'`,
          "Check that your link is a valid Google link and that it works"
        );
      });
  }

  async searchGoogleByQuery(query: string, numOfResults: number, location: string): Promise<ScaleSERPResponse> {
    const body = new ScaleSERPQueryBody(query, numOfResults, location);

    if (!body.q || body.q.length === 0) {
      throw new ApplicationException("Error during processing of query", "Query shouldn't be empty");
    } else if (!body.api_key || body.api_key.length === 0) {
      throw new ApplicationException(
        "API Token for ScaleSERP is missing or expired.",
        "ScaleSERP token is missing. Check configuration files or check if you reached your limit."
      );
    }

    let params = { ...body };

    return await axios
      .get(Constants.SCALE_SERP.SEARCH_URL, { params, timeout: 180000 })
      .then((res) => {
        return ScaleSERPResponse.fromJSON(res.data);
      })
      .catch((err) => {
        throw new ApplicationException(
          `An error occured on the ScaleSERP side. Message '${err.message}'`,
          "Check that your link is a valid Google link and that it works or check if you have enough credits left."
        );
      });
  }

  async getAccountInfo(): Promise<ScaleSERPAccountInfo> {
    const params = {
      api_key: process.env.SCALESERP_API_KEY,
    };

    return await axios
      .get(Constants.SCALE_SERP.ACCOUNT_URL, { params, timeout: 180000 })
      .then((res) => new ScaleSERPAccountInfo(res.data))
      .catch((err) => {
        throw new ApplicationException(
          `An error occcured while trying to get ScaleSERP Account info. Message: '${err.message}'`,
          `Check that the service is available or that your API KEY is valid.`
        );
      });
  }
}
