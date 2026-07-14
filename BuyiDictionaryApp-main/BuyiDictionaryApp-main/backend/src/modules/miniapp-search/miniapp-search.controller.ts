import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { ContentType } from '../../common/enums/content-type.enum';
import { LearningRecord } from '../../entities/learning-record.entity';
import { ContentService } from '../content/content.service';
import { SearchQueryDto } from '../content/dto/search-query.dto';
import { MiniappFavoritesService } from '../miniapp-favorites/miniapp-favorites.service';

@Controller('miniapp/search')
export class MiniappSearchController {
  constructor(
    private readonly contentService: ContentService,
    private readonly favoritesService: MiniappFavoritesService,
    @InjectRepository(LearningRecord)
    private readonly learningRecordRepository: Repository<LearningRecord>,
  ) {}

  @Public()
  @Get()
  searchPublic(@Query() query: SearchQueryDto) {
    return this.contentService.searchAll(query);
  }

  @Public()
  @Get('suggest')
  suggestPublic(@Query('keyword') keyword: string) {
    return this.contentService.suggestAll(keyword);
  }

  // 热门搜索词：基于全体学习记录聚合，取浏览量最高的 8 条内容的中文文本
  @Public()
  @Get('hot')
  async hot() {
    const rows = await this.learningRecordRepository
      .createQueryBuilder('r')
      .select(['r.contentId AS contentId', 'r.contentType AS contentType', 'COUNT(*) AS cnt'])
      .where('r.actionType = :action', { action: 'view' })
      .groupBy('r.contentId, r.contentType')
      .orderBy('cnt', 'DESC')
      .limit(8)
      .getRawMany<{ contentId: number; contentType: ContentType; cnt: string }>();

    const items = await Promise.all(
      rows.map(async (row) => {
        try {
          const content = await this.contentService.getPublishedDetail(row.contentType, row.contentId);
          const serialized = this.contentService.serialize(content, row.contentType);
          return {
            keyword: serialized.zhText || serialized.buyiText || '',
            contentType: row.contentType,
            contentId: row.contentId,
            count: Number(row.cnt),
          };
        } catch {
          return null;
        }
      }),
    );

    return { items: items.filter((item) => item && item.keyword) };
  }

  @UseGuards(MiniappJwtGuard)
  @Get('mine')
  async searchMine(@CurrentUser() user: { sub: number }, @Query() query: SearchQueryDto) {
    const result = await this.contentService.searchAll(query);
    return {
      dictionary: await this.favoritesService.annotate(user.sub, ContentType.DICTIONARY, result.dictionary),
      phrases: await this.favoritesService.annotate(user.sub, ContentType.PHRASE, result.phrases),
      proverbs: await this.favoritesService.annotate(user.sub, ContentType.PROVERB, result.proverbs),
      songs: await this.favoritesService.annotate(user.sub, ContentType.SONG, result.songs),
      pagination: result.pagination,
    };
  }
}
