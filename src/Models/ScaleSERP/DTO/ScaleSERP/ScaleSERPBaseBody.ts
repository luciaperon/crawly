export abstract class ScaleSERPBaseBody {
  api_key: string = process.env.SCALESERP_API_KEY;
  include_answer_box: string = "false";
  include_advertiser_info: string = "false";
  include_html: string = "false";
  flatten_results: string = "false";
  gl: string = "us";
  hl: string = "en";
  location: string = "San Francisco Bay Area,United States";
  google_domain: string = "google.com";
  device: string = "desktop";
  num: string;
  page: string = "1";

  constructor(numOfRequests: string, location: string) {
    this.num = numOfRequests;
    this.location = location || "San Francisco Bay Area,United States";
  }
}
