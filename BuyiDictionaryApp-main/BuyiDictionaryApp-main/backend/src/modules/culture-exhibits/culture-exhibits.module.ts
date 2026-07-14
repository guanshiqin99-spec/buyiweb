import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentCultureLink } from '../../entities/content-culture-link.entity';
import { CultureExhibit } from '../../entities/culture-exhibit.entity';
import { AdminCultureExhibitsController } from './admin-culture-exhibits.controller';
import { CultureExhibitsService } from './culture-exhibits.service';
import { MiniappCultureExhibitsController } from './miniapp-culture-exhibits.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CultureExhibit, ContentCultureLink])],
  controllers: [MiniappCultureExhibitsController, AdminCultureExhibitsController],
  providers: [CultureExhibitsService],
  exports: [CultureExhibitsService],
})
export class CultureExhibitsModule {}
