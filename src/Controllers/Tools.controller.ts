import { ApiTags, ApiQuery, ApiConsumes, ApiParam } from "@nestjs/swagger";
import { ToolsService } from "../Services/Tools/Tools.service";
import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  Post,
  Res,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { DeadPageResponse } from "../Models/Tools/DeadPageChecker/Response/DeadPageResponse";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiFile } from "../Common/NestJS/ApiBody";
import { UploadedMulterFile } from "../Common/Types";
import { DeadPagesResponse } from "../Models/Tools/DeadPageChecker/Response/DeadPagesResponse";
import { DeadPagesCheckerQuery } from "../Models/Tools/DeadPageChecker/Query/DeadPagesCheckerQuery";
import { DeadPageCheckerQuery } from "../Models/Tools/DeadPageChecker/Query/DeadPageCheckerQuery";
import { Response } from "express";
import { PuppeteerInstance } from "Common";

@ApiTags("Tools")
@Controller("tools")
export class ToolsControllerr {
  constructor(private readonly toolsService: ToolsService) {}

  @Get("checkDead/website")
  @ApiQuery({
    name: "url",
    required: true,
    description: "URL of web page to validate.",
    schema: { type: "string" },
  })
  @ApiQuery({
    name: "asCSV",
    required: true,
    description: "Get result as CSV",
    schema: { type: "boolean", example: true },
  })
  @HttpCode(HttpStatus.OK)
  async checkDeadWebsite(
    @Query() query: DeadPageCheckerQuery,
    @Res({ passthrough: true }) res: Response
  ): Promise<DeadPageResponse | Buffer> {
    let checkerResponse: DeadPageResponse = await this.toolsService.checkDeadPage(query.url);

    if (query.asCSV) {
      res.set({
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${query.url}_deadpagechecker.csv`,
      });

      res.end(Buffer.from(checkerResponse.serializeAsCSV()));
      return;
    }

    res.set({
      "Content-Type": "application/json",
    });
    return checkerResponse;
  }

  @Post("checkDead/websites")
  @ApiQuery({
    name: "websiteColumnName",
    required: true,
    description: "Name of the column that contains formula.",
    schema: { type: "string" },
  })
  @ApiQuery({
    name: "asCSV",
    required: true,
    description: "Get result as CSV",
    schema: { type: "boolean", example: true },
  })
  @ApiConsumes("multipart/form-data")
  @ApiFile()
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(HttpStatus.OK)
  async checkDeadWebsites(
    @Query() query: DeadPagesCheckerQuery,
    @UploadedFile("file") file: UploadedMulterFile,
    @Res({ passthrough: true }) res: Response
  ): Promise<DeadPagesResponse> {
    let checkerResponse: DeadPagesResponse = await this.toolsService.checkDeadPages(file, query.websiteColumnName);

    if (query.asCSV) {
      res.set({
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${file.originalname}_deadpagechecker.csv`,
      });

      res.end(Buffer.from(checkerResponse.serializeAsCSV()));
      return;
    }

    res.set({
      "Content-Type": "application/json",
    });
    return checkerResponse;
  }

  @Get("images/ads/:id")
  @ApiParam({
    name: "id",
    required: true,
    description: "ID of the image. Extension IS IMPORTANT.",
    schema: { type: "string", example: "537bae98-8c21-4dfb-92a2-b46ab4f49532.png" },
  })
  @HttpCode(HttpStatus.OK)
  async getImage(@Param("id") id: string, @Res({ passthrough: true }) res: Response): Promise<DeadPagesResponse> {
    try {
      res.end(this.toolsService.getAdImage(id));
      return;
    } catch (err) {
      throw new NotFoundException(`Image with id ${id} not found.`);
    }
  }
}
