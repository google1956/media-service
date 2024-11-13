import { ExceptionFilter, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { TelegramBotService } from 'src/module/shared/service/telegram.service';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly telegramService: TelegramBotService,
  ) {}

  catch(exception: any, host: ExecutionContextHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus: HttpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      status: httpStatus,
      message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
      data: null,
      system_message: (exception as Error).message,
    };
    if (host['contextType'] !== 'rmq') {
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
    //next to do something
  }
}
