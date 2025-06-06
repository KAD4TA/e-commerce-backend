import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { Request, Response } from "express";
import { DtoPrefix } from "../enums/validation.message";
import { BaseResponse } from "../../base/base.response";
import { ResponseMessages } from "../enums/response.message";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const prefixList: DtoPrefix[] = Object.values(DtoPrefix);
        const isValidationMessage = prefixList.some(prefix =>
            exception.message && exception.message.startsWith(prefix)
        );

        if (isValidationMessage) {
            return response
                .status(status)
                .json(new BaseResponse(null, exception.message, false));
        }

        let responseMessage: string;

        switch (status) {
            case HttpStatus.BAD_REQUEST:
                responseMessage = ResponseMessages.BAD_REQUEST;
                break;
            case HttpStatus.UNAUTHORIZED:
                responseMessage = ResponseMessages.UNAUTHORIZED;
                break;
            case HttpStatus.FORBIDDEN:
                responseMessage = ResponseMessages.FORBIDDEN;
                break;
            case HttpStatus.NOT_FOUND:
                responseMessage = ResponseMessages.NOT_FOUND;
                break;
            case HttpStatus.INTERNAL_SERVER_ERROR:
                responseMessage = ResponseMessages.INTERNAL_SERVER_ERROR;
                break;
            case HttpStatus.BAD_GATEWAY:
                responseMessage = ResponseMessages.BAD_GATEWAY;
                break;
            default:
                responseMessage = ResponseMessages.BAD_GATEWAY + '|' + exception.message;
                break;
        }

        response
            .status(status)
            .json(new BaseResponse(null, responseMessage, false));
    }
}
