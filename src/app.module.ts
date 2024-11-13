import { MiddlewareConsumer, Module, NestModule, OnModuleInit, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { configuration, ConfigurationType } from './commons/configs/configuration';
import { UploadModule } from './module/upload/upload.module';
import * as mongoose from 'mongoose';
import { seconds, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { SERVICE_NAME } from './commons/constants/constant';
import Redis from 'ioredis';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { SharedModule } from './module/shared/shared.module';

@Module({
  imports: [
    /* ENV SETUP */
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),

    /* DB Master Module */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigurationType>) => {
        const config: MongooseModuleFactoryOptions = {
          retryDelay: 15,
          retryAttempts: 20,
          uri: configService.get<ConfigurationType['MONGO_DSN']>('MONGO_DSN'),
          authMechanism: 'SCRAM-SHA-1',
          compressors: ['zstd', 'zlib'],
          zlibCompressionLevel: 9,
        };
        return config;
      },
    }),

    /* Throttler Module */
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigurationType>) => {
        const redisConfig = configService.get<ConfigurationType['redis']>('redis');
        const config: ThrottlerModuleOptions = {
          // storage: new ThrottlerStorageRedisService(configService.get<ConfigurationType['host_redis']>('host_redis')),
          storage: new ThrottlerStorageRedisService(
            new Redis({
              host: redisConfig?.host,
              port: redisConfig?.port,
              password: redisConfig?.password,
              keyPrefix: `${SERVICE_NAME}-Throttler:`,
            }),
          ),

          throttlers: [
            {
              ttl: seconds(60),
              limit: 100,
            },
          ],
          errorMessage: 'Số lượng request đạt giới hạn, vui lòng gửi lại sau!!!',
        };
        return config;
      },
    }),
    /* Upload Module */
    UploadModule,
    /* Shared Module */
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit, NestModule {
  onModuleInit() {
    mongoose.set('runValidators', true);
    mongoose.set('strictQuery', true);
    // mongoose.set('debug', true);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
