import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { AdminDictionaryController } from './admin-dictionary.controller';
import { AdminPhrasesController } from './admin-phrases.controller';
import { AdminProverbsController } from './admin-proverbs.controller';
import { AdminSongsController } from './admin-songs.controller';

@Module({
  imports: [ContentModule],
  controllers: [AdminDictionaryController, AdminPhrasesController, AdminProverbsController, AdminSongsController],
})
export class AdminContentModule {}
