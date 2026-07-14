import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { ContentType } from '../../common/enums/content-type.enum';
import { ContentService } from '../content/content.service';
import { SearchQueryDto } from '../content/dto/search-query.dto';
import { MiniappFavoritesService } from '../miniapp-favorites/miniapp-favorites.service';

@Controller('miniapp/dictionary')
export class MiniappDictionaryController {
  constructor(
    private readonly contentService: ContentService,
    private readonly favoritesService: MiniappFavoritesService,
  ) {}

  @Public()
  @Get()
  async list(@Query() query: SearchQueryDto) {
    const result = await this.contentService.listPublished(ContentType.DICTIONARY, query);
    return {
      ...result,
      items: await Promise.all(result.items.map((item) => this.contentService.serializeWithRelatedExhibits(item, ContentType.DICTIONARY))),
    };
  }

  @UseGuards(MiniappJwtGuard)
  @Get('mine')
  async listMine(@CurrentUser() user: { sub: number }, @Query() query: SearchQueryDto) {
    const result = await this.contentService.listPublished(ContentType.DICTIONARY, query);
    return {
      ...result,
      items: await this.favoritesService.annotate(
        user.sub,
        ContentType.DICTIONARY,
        result.items.map((item) => this.contentService.serialize(item, ContentType.DICTIONARY)),
      ),
    };
  }

  @Public()
  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const item = await this.contentService.getPublishedDetail(ContentType.DICTIONARY, id);
    return this.contentService.serializeWithRelatedExhibits(item, ContentType.DICTIONARY);
  }
}
