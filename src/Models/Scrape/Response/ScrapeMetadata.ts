import { DateTime } from "luxon";
import { Constants } from "Common";
import { ScrapeType } from "Common/Types";
import { ScrapedData } from "../../Scraper";

export class ScrapeMetadata {
  id: string;
  type: ScrapeType;
  runDate: string;

  constructor(scrape: ScrapedData) {
    this.id = scrape.id.toString();
    this.type = scrape.type;

    if (scrape.utcTimestamp) {
      this.runDate = DateTime.fromMillis(scrape.utcTimestamp).toFormat(Constants.FULL_DATE_TIME_FORMAT);
    } else {
      this.runDate = DateTime.now().toFormat(Constants.FULL_DATE_TIME_FORMAT);
    }
  }
}
