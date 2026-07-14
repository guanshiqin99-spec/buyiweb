import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from '../../entities/badge.entity';
import { MiniappBadgesController } from './miniapp-badges.controller';
import { MiniappBadgesService } from './miniapp-badges.service';

@Module({
  imports: [TypeOrmModule.forFeature([Badge])],
  controllers: [MiniappBadgesController],
  providers: [MiniappBadgesService],
  exports: [MiniappBadgesService],
})
export class MiniappBadgesModule {}
