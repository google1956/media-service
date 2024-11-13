import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment-timezone';
import { HCM_TIMEZONE } from 'src/commons/constants/constant';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const start_time = moment();
    const api_name = `|${request.method}|${request.originalUrl || request.url}`;

    response.on('finish', () => {
      const { statusCode, statusMessage } = response;
      console.log(
        `🚀 ~ LoggerMiddleware | ${api_name} | START AT: ${start_time.tz(HCM_TIMEZONE).format('hh:mm:ss DD/MM/YYYY Z')} | EXECUTE IN: ${Date.now() - start_time.toDate().getTime()}ms | STATUS: ${statusCode} ${statusMessage} ~
HEADERS: ${JSON.stringify(request.headers, null, 2)}
PARAMS: ${JSON.stringify(request.params, null, 2)}
QUERY: ${JSON.stringify(request.query, null, 2)} 
BODY: ${JSON.stringify(request.body, null, 2)}
        `,
      );
    });

    next();
  }
}
