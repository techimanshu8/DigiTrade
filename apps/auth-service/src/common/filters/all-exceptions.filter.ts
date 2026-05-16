import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
  timestamp: string;
  path?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();
    const request = ctx.getRequest<ExpressRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;
        code = (responseObj.code as string) || this.getCodeFromStatus(status);
        details = (responseObj.details as Record<string, unknown>) || undefined;
      } else {
        message = exceptionResponse as string;
        code = this.getCodeFromStatus(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    } else {
      this.logger.error('Unknown error:', exception);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        statusCode: status,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    response.status(status).json(errorResponse);
  }

  private getCodeFromStatus(status: number): string {
    const statusMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
    };

    return statusMap[status] || 'INTERNAL_SERVER_ERROR';
  }
}
