import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogService } from '../../auth/service/log.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body } = request;
    const start = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => {
          const duration = Date.now() - start;
          const status = response.statusCode;

          const logBody = { ...body };
          if (logBody.password) {
            logBody.password = '****';
          }
          if (logBody.creditCardNumber) {
            logBody.creditCardNumber = '**** **** **** ****';
          }

          // Registrar el log de forma asíncrona
          this.logService.create({
            method,
            url,
            duration,
            status,
            body: logBody,
          }).catch(error => {
            console.error('Error logging request:', error);
          });
        }),
      );
  }
}
