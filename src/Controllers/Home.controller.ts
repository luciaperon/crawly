import fs from "fs";
import { Controller, Get } from "@nestjs/common";

@Controller("")
export class HomeController {
  constructor() {}

  @Get("")
  get() {
    return fs
      .readFileSync(`data/Static/index.html`, "utf8")
      .replace("{BASE_API_URL}", process.env.BASE_URL)
      .replace("{FS_BUCKET}", process.env.FS_BUCKET);
  }
}
