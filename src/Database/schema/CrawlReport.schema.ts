import { FailedCrawlReport } from "../../Models/Crawler";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type CrawlReportDocument = CrawlReport & Document;

@Schema()
export class CrawlReport {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String })
  url: string;

  @Prop({ type: Number })
  reachedDepth: number;

  @Prop({ type: String })
  runDate: string;

  @Prop({ type: Number })
  utcMilliseconds: number;

  @Prop({ type: Number })
  processedPage: number;

  @Prop({ type: Number })
  successCount: number;

  @Prop({ type: Array })
  histogram: string[];

  @Prop({ type: Array })
  fails: FailedCrawlReport[];

  @Prop({ type: String })
  dataBucketRef: string;
}

export const CrawlReportSchema = SchemaFactory.createForClass(CrawlReport);
