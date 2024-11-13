import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType, configuration } from './commons/configs/configuration';
import { AllExceptionsFilter } from './exception/all-exception.filter';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { TelegramBotService } from './module/shared/service/telegram.service';
import { SwaggerConfiguration } from './commons/configs/swagger.config';

console.log(`🚀 ~ configuration:`, configuration());
const logger = new Logger('Cdn Upload Social Media Service');
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});

  const configService = app.get(ConfigService<ConfigurationType>);
  const telegramBotService = app.get(TelegramBotService);

  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost), telegramBotService),
    new HttpExceptionFilter(telegramBotService),
  );

  app.set('trust proxy', true);

  /* Handle CORS */
  app.enableCors({
    origin: '*',
    allowedHeaders: ['cdnreset', 'recaptcha', 'content-type', 'authorization', 'X-Shop-Id'],
    maxAge: 3600,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  SwaggerConfiguration({ app, configService });

  const port = configService.get<ConfigurationType['gateway_port']>('gateway_port') || 1321;

  /* Start Service */
  await Promise.all([app.listen(port)]);

  /* Logging start state */
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
