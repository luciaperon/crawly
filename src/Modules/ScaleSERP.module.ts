import { Module } from "@nestjs/common";
import { ScaleSERPService } from "../Services/ScaleSERP/ScaleSERP.service";

@Module({
  imports: [],
  controllers: [],
  providers: [ScaleSERPService],
  exports: [ScaleSERPService],
})
export class ScaleSERPModule {}
