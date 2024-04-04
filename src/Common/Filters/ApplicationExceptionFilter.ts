import { Response } from "express";
import { FirebaseError } from "firebase/app";
import { ApplicationException } from "@Common";
import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";

@Catch(ApplicationException)
export class ApplicatedExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.status).json({
      description: exception.description,
      data: exception.data,
    });
  }
}
