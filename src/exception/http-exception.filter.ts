import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TelegramBotService } from 'src/module/shared/service/telegram.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly telegramService: TelegramBotService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status: HttpStatus = exception.getStatus();

    let data = null,
      message = exception.message;
    const system_message = exception.message;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        data = (exception as any)?.response?.message || null;
        break;

      case HttpStatus.INTERNAL_SERVER_ERROR: {
        this.telegramService.sendMessageToDevops({ message: `${exception} \n ${JSON.stringify(exception['stack'])}` });
        message = 'Đã có lỗi xảy ra, vui lòng thử lại sau';
        break;
      }
      default:
        break;
    }

    const responseBody = {
      status: status,
      message,
      data,
      system_message,
    };

    response.status(status).json(responseBody);
    console.log(`🚀 ~ HttpExceptionFilter ~ exception:`, exception);
  }
}
