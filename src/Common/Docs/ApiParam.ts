import { ApiParamOptions } from "@nestjs/swagger";

export class API_PARAM {
  static SCRAPE_DATA = class {};
  static GENERIC = class {
    static ID: ApiParamOptions = {
      name: "id",
      required: true,
      description: "ID that is going to get used",
      schema: { type: "string", example: "625b61f8c4d66c8d0e7d8123" },
    };
  };

  static CRAWLER = class {
    static JOB_ID: ApiParamOptions = {
      name: "jobId",
      required: true,
      description: "ID of the job that you want to be stop.",
      schema: { type: "string", example: 97 },
    };
  };
}
