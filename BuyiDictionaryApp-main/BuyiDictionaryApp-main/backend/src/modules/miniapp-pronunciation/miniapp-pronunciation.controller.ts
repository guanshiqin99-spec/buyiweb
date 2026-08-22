import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ScoreDto } from './dto/score.dto';
import { MiniappPronunciationService } from './miniapp-pronunciation.service';

// 发音评测模块：无需登录即可访问
@Controller('miniapp/pronunciation')
export class MiniappPronunciationController {
  constructor(private readonly pronunciationService: MiniappPronunciationService) {}

  // 随机获取发音题
  @Public()
  @Get('questions')
  questions(@Query('count') count?: string) {
    return this.pronunciationService.getQuestions(count);
  }

  // 发音相似度评分
  @Public()
  @Post('score')
  score(@Body() payload: ScoreDto) {
    return this.pronunciationService.score(payload);
  }
}
