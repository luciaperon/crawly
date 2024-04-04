import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";
import { FirebaseError } from "firebase/app";

@Catch(FirebaseError)
export class FirebaseExceptionFilter implements ExceptionFilter {
  catch(exception: FirebaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message || exception.code;

    let responseObject = {
      status: 500,
      message: message,
      error: "Firebase Error",
    };

    switch (exception.code) {
      case "storage/object-not-found":
        responseObject.status = 404;
    }

    if (responseObject.status === 500) {
      responseObject["data"] = exception.customData;
    }

    response.status(responseObject.status).json(responseObject);
  }
}
