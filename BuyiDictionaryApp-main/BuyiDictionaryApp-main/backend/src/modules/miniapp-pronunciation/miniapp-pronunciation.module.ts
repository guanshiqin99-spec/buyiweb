import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { MiniappPronunciationController } from './miniapp-pronunciation.controller';
import { MiniappPronunciationService } from './miniapp-pronunciation.service';

@Module({
  imports: [TypeOrmModule.forFeature([DictionaryEntry, Phrase])],
  controllers: [MiniappPronunciationController],
  providers: [MiniappPronunciationService],
})
export class MiniappPronunciationModule {}
