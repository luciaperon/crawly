import { Module } from "@nestjs/common";
import { StaticControllerr } from "../Controllers/Static.controller";

@Module({
  imports: [],
  controllers: [StaticControllerr],
  providers: [],
})
export class StaticModule {}
