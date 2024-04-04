import { csvJoin } from "../../Common";
import { ScrapedData } from "Models/Scraper";
import { ScrapeType } from "../../Common/Types";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ScrapedName, ScrapedAdvertisement } from "Models/Scraper/Response/Entities";

export type ScrapeDocument = Scrape & Document;

@Schema()
export class Scrape {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  url: string;

  @Prop({ type: Number })
  utcTimestamp: number;

  @Prop({ type: String })
  type: ScrapeType;

  @Prop({ type: Array })
  personalNames: ScrapedName[];

  @Prop({ type: Array })
  otherNames: ScrapedName[];

  @Prop({ type: Array })
  emails: string[];

  @Prop({ type: Array })
  socials: string[];

  @Prop({ type: Array })
  posts: string[];

  @Prop({ type: Array })
  internalURLs: string[];

  @Prop({ type: Array })
  externalURLs: string[];

  @Prop({ type: Array })
  advertisements: ScrapedAdvertisement[];
}

export const ScrapeSchema = SchemaFactory.createForClass(Scrape);
