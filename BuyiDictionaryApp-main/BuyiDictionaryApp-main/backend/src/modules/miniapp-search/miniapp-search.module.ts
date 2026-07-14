import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningRecord } from '../../entities/learning-record.entity';
import { ContentModule } from '../content/content.module';
import { MiniappFavoritesModule } from '../miniapp-favorites/miniapp-favorites.module';
import { MiniappSearchController } from './miniapp-search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LearningRecord]), ContentModule, MiniappFavoritesModule],
  controllers: [MiniappSearchController],
})
export class MiniappSearchModule {}
