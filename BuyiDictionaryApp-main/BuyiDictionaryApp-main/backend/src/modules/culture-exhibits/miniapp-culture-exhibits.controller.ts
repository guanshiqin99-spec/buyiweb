import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CultureExhibitsService } from './culture-exhibits.service';

@Controller('miniapp/culture-exhibits')
export class MiniappCultureExhibitsController {
  constructor(private readonly cultureExhibitsService: CultureExhibitsService) {}

  @Public()
  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.cultureExhibitsService.getPublishedBySlug(slug);
  }
}
