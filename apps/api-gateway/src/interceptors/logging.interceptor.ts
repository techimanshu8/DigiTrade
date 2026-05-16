import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    
    const { method, originalUrl } = req;
    const correlationId = req.headers['x-correlation-id'];
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = res;
          const contentLength = res.get('content-length') || 0;
          this.logger.log(
            `[${correlationId}] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${Date.now() - startTime}ms`
          );
        },
        error: (error) => {
          const statusCode = error.status || 500;
          this.logger.error(
            `[${correlationId}] ${method} ${originalUrl} ${statusCode} - ${userAgent} ${ip} - ${Date.now() - startTime}ms`,
            error.stack
          );
        }
      }),
    );
  }
}
