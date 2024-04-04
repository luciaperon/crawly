import fs from "fs";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./Modules/App.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from "@nestjs/swagger";
import { FirebaseExceptionFilter } from "./Common/Filters/FirebaseExceptionFilter";
import { ApplicatedExceptionFilter } from "./Common/Filters/ApplicationExceptionFilter";

async function bootstrap(): Promise<void> {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Crawly")
    .setDescription("The API for scraping URLs and extracting valuable informations")
    .setVersion("2.0")
    .build();

  let swaggerOptionsOrder = {
    get: "0",
    post: "1",
    put: "2",
    delete: "3",
  };

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    customSiteTitle: "Crawly API",
    customCss: fs.readFileSync("data/Static/index.css").toString(),
    customJs: `/static/default/index.js`,
    swaggerOptions: (a, b) => {
      return swaggerOptionsOrder[a.method].localeCompare(swaggerOptionsOrder[b.method]);
    },
  });

  // Validator Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // Middlewares & Interceptors
  app.useGlobalFilters(new ApplicatedExceptionFilter());
  app.useGlobalFilters(new FirebaseExceptionFilter());

  // Remove later
  app.useStaticAssets("/home/mula/Desktop/Projects/crawly/test/crawler/views", { index: false });

  await app.listen(process.env.PORT);
  process.on("warning", (e) => console.warn(e.stack));
  console.log("Listening on port: " + process.env.PORT);
}

bootstrap();
