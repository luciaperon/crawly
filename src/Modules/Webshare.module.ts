import { Module } from "@nestjs/common";
import { WebshareService } from "@Services/Webshare/Webshare.service";
// import { WebshareController } from "@Controllers";

@Module({
  imports: [],
  // controllers: [WebshareController],
  providers: [WebshareService],
  exports: [WebshareService],
})
export class WebshareModule {}
