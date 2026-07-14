import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { MiniappProverbsController } from './miniapp-proverbs.controller';

@Module({
  imports: [ContentModule],
  controllers: [MiniappProverbsController],
})
export class MiniappProverbsModule {}
