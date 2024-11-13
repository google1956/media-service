import { Global, Module } from '@nestjs/common';
import { TelegramBotService } from './service/telegram.service';
import { StorageModule } from '../storage/storage.module';

@Global()
@Module({
  imports: [StorageModule],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class SharedModule {}
