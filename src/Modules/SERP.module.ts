import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SERPService } from "@Services/SERP/SERP.service";
import { SERPController } from "../Controllers/SERP.controller";
import { SERPResult, SERPResultSchema } from "../Database/schema/SERPResult";
import { ScaleSERPModule } from "./ScaleSERP.module";

@Module({
  imports: [ScaleSERPModule, MongooseModule.forFeature([{ name: SERPResult.name, schema: SERPResultSchema }])],
  controllers: [SERPController],
  providers: [SERPService],
})
export class SERPModule {}
