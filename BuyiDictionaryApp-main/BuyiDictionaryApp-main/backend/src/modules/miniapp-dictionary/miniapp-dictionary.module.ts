import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { MiniappFavoritesModule } from '../miniapp-favorites/miniapp-favorites.module';
import { MiniappDictionaryController } from './miniapp-dictionary.controller';

@Module({
  imports: [ContentModule, MiniappFavoritesModule],
  controllers: [MiniappDictionaryController],
})
export class MiniappDictionaryModule {}
