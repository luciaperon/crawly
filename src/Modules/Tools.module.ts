import { Module } from "@nestjs/common";
import { ToolsService } from "../Services/Tools/Tools.service";
import { ToolsControllerr } from "../Controllers/Tools.controller";

@Module({
  imports: [],
  controllers: [ToolsControllerr],
  providers: [ToolsService],
})
export class ToolsModule {}
