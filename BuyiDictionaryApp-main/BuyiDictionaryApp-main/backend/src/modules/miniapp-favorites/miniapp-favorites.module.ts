import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../../entities/favorite.entity';
import { ContentModule } from '../content/content.module';
import { MiniappFavoritesController } from './miniapp-favorites.controller';
import { MiniappFavoritesService } from './miniapp-favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite]), ContentModule],
  controllers: [MiniappFavoritesController],
  providers: [MiniappFavoritesService],
  exports: [MiniappFavoritesService],
})
export class MiniappFavoritesModule {}
