import { Module } from '@nestjs/common';
import { GGStorageService } from './gg-storage.service';
import { DigitalSpaceService } from './digital-space.service';
import { StorageFactoryService } from './storage-factory.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [GGStorageService, DigitalSpaceService, StorageFactoryService],
  exports: [StorageFactoryService],
})
export class StorageModule {}
