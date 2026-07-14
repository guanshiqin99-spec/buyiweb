import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { MiniappHomeController } from './miniapp-home.controller';

@Module({
  imports: [ContentModule],
  controllers: [MiniappHomeController],
})
export class MiniappHomeModule {}
