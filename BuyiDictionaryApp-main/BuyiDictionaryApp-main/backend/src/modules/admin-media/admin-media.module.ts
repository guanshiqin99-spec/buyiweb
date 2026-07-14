import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { AdminMediaController } from './admin-media.controller';

@Module({
  imports: [MediaModule],
  controllers: [AdminMediaController],
})
export class AdminMediaModule {}
