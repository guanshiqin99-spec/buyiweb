import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { MediaAsset } from '../../entities/media-asset.entity';
import { Song } from '../../entities/song.entity';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaAsset, DictionaryEntry, Song])],
  providers: [StorageService, MediaService],
  exports: [StorageService, MediaService, TypeOrmModule],
})
export class MediaModule {}
