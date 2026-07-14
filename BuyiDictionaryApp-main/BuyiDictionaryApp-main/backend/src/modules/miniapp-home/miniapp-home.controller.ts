import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ContentService } from '../content/content.service';

@Controller('miniapp/home')
export class MiniappHomeController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get()
  getHomeData() {
    return this.contentService.getMiniappHomeData();
  }
}
