import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { MiniappPhrasesController } from './miniapp-phrases.controller';

@Module({
  imports: [ContentModule],
  controllers: [MiniappPhrasesController],
})
export class MiniappPhrasesModule {}
