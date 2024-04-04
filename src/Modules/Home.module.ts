import { Module } from "@nestjs/common";
import { HomeController } from "../Controllers/Home.controller";

@Module({
  imports: [],
  controllers: [HomeController],
  providers: [],
})
export class HomeModule {}
