import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ContentType } from '../../common/enums/content-type.enum';
import { ContentService } from '../content/content.service';
import { SearchQueryDto } from '../content/dto/search-query.dto';

@Controller('miniapp/phrases')
export class MiniappPhrasesController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get()
  list(@Query() query: SearchQueryDto) {
    return this.contentService.listPublished(ContentType.PHRASE, query);
  }

  @Public()
  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const item = await this.contentService.getPublishedDetail(ContentType.PHRASE, id);
    return this.contentService.serialize(item, ContentType.PHRASE);
  }
}
