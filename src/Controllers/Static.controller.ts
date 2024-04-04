import fs from "fs";
import { ApiTags, ApiParam } from "@nestjs/swagger";
import { Controller, HttpCode, HttpStatus, Param, Get } from "@nestjs/common";

@ApiTags("Static")
@Controller("static")
export class StaticControllerr {
  constructor() {}

  @Get("default/:fileName")
  @ApiParam({
    name: "fileName",
    required: true,
    description: "Static file to get",
    schema: { type: "string" },
  })
  @HttpCode(HttpStatus.OK)
  async getStaticFile(@Param("fileName") fileName: string) {
    try {
      if (fileName.includes("..")) {
        return;
      }

      return fs.readFileSync(`data/Static/${fileName}`, "utf8");
    } catch (err) {}
  }

  @Get("test/:fileName")
  @ApiParam({
    name: "fileName",
    required: true,
    description: "Static file to get",
    schema: { type: "string" },
  })
  @HttpCode(HttpStatus.OK)
  async getViews(@Param("fileName") fileName: string) {
    try {
      if (fileName.includes("..")) {
        return;
      }

      return fs.readFileSync(`test/crawler/views/${fileName}.html`, "utf8");
    } catch (err) {}
  }
}
