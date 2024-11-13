import { Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as moment from 'moment-timezone';
import { HCM_TIMEZONE } from 'src/commons/constants/constant';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ExecuteTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContextHost, next: CallHandler): Observable<any> {
    if (isRabbitContext(context)) {
      return this.rmq(context, next);
    }

    return this.http(context, next);
  }

  http(context: ExecutionContextHost, next: CallHandler): Observable<any> {
    const start_time = moment();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const api_name = `|${request.method}|${request.originalUrl || request.url}`;

    return next.handle().pipe(
      tap(() => {
        const { statusCode, statusMessage } = response;

        console.log(
          `🚀 ~ ExecuteTimeInterceptor | ${api_name} | START AT: ${start_time.tz(HCM_TIMEZONE).format('hh:mm:ss DD/MM/YYYY Z')} | EXECUTE IN: ${Date.now() - start_time.toDate().getTime()}ms | STATUS: ${statusCode} ${statusMessage} ~
HEADERS: ${JSON.stringify(request.headers, null, 2)}
PARAMS: ${JSON.stringify(request.params, null, 2)}
QUERY: ${JSON.stringify(request.query, null, 2)} 
BODY: ${JSON.stringify(request.body, null, 2)}
            `,
        );
      }),
    );
  }

  rmq(context: ExecutionContextHost, next: CallHandler): Observable<any> {
    const start_time = moment();
    const api_name = `|${context.getClass().name}|${context.getHandler().name}`;
    return next.handle().pipe(
      tap(() =>
        console.log(
          `🚀 ~ ExecuteTimeInterceptor | ${api_name} | START AT: ${start_time.tz(HCM_TIMEZONE).format('hh:mm:ss DD/MM/YYYY Z')} | EXECUTE IN: ${Date.now() - start_time.toDate().getTime()}ms ~
PAYLOAD: ${JSON.stringify(context.getArgs()[0], null, 2)}
            `,
        ),
      ),
    );
  }
}
