import { Injectable } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import { WebshareResponse } from "Models/Webshare";

@Injectable()
export class WebshareService {
  async getCurrentProxies(): Promise<WebshareResponse> {
    let res: AxiosResponse<WebshareResponse> = await axios.get(process.env.WEBSHARE_ROTATE_PRU, {
      headers: {
        Authorization: process.env.WEBSHARE_API_KEY,
      },
    });

    return res.data;
  }
}
