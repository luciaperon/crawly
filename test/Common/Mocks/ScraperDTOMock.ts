import { ScraperBody } from "../../../src/Models/Scraper/DTO/ScraperDTO";

export class ScraperDTOMock {
  dto: ScraperBody;

  constructor() {
    this.dto = new ScraperBody();
    this.dto.name.fullNegativeKeywords = [];
    this.dto.name.partialNegativeKeywords = [];

    this.dto.socialMedia.keywords = [];
    this.dto.socialMedia.postKeywords = [];
    this.dto.socialMedia.shareKeywords = [];
  }
}
