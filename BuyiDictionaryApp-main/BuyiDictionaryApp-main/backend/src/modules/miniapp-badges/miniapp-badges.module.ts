import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from '../../entities/badge.entity';
import { Favorite } from '../../entities/favorite.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { MiniappBadgesController } from './miniapp-badges.controller';
import { MiniappBadgesService } from './miniapp-badges.service';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, Favorite, LearningRecord])],
  controllers: [MiniappBadgesController],
  providers: [MiniappBadgesService],
  exports: [MiniappBadgesService],
})
export class MiniappBadgesModule {}
