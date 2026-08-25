import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentCache } from '../../entities/agent-cache.entity';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { MiniappAgentController } from './miniapp-agent.controller';
import { MiniappAgentService } from './miniapp-agent.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentCache, DictionaryEntry, Phrase, Proverb, Song])],
  controllers: [MiniappAgentController],
  providers: [MiniappAgentService],
})
export class MiniappAgentModule {}
