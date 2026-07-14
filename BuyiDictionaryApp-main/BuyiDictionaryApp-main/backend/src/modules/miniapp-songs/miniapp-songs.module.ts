import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { MiniappSongsController } from './miniapp-songs.controller';

@Module({
  imports: [ContentModule],
  controllers: [MiniappSongsController],
})
export class MiniappSongsModule {}
