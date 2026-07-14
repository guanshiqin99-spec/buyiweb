import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { CultureExhibitsModule } from '../culture-exhibits/culture-exhibits.module';
import { ContentImportService } from './content-import.service';
import { ContentSortService } from './content-sort.service';
import { ContentService } from './content.service';

@Module({
  imports: [TypeOrmModule.forFeature([DictionaryEntry, Phrase, Proverb, Song]), CultureExhibitsModule],
  providers: [ContentService, ContentSortService, ContentImportService],
  exports: [ContentService, TypeOrmModule],
})
export class ContentModule {}
