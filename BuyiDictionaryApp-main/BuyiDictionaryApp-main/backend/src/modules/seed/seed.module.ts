import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../../entities/admin.entity';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { CultureExhibit } from '../../entities/culture-exhibit.entity';
import { ContentCultureLink } from '../../entities/content-culture-link.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, DictionaryEntry, Phrase, Proverb, Song, CultureExhibit, ContentCultureLink])],
  providers: [SeedService],
})
export class SeedModule {}
