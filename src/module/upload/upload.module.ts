import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { JwtService } from '@nestjs/jwt';
import { NestMinioModule } from 'nestjs-minio';

@Module({
  imports: [
    StorageModule,
    // NestMinioModule.register(options: {
    //   isGlobal: true,
    // })
    // NestMinioModule.register('dqd')
  ],
  controllers: [UploadController],
  providers: [UploadService, JwtService],
  exports: [UploadService],
})
export class UploadModule {}
