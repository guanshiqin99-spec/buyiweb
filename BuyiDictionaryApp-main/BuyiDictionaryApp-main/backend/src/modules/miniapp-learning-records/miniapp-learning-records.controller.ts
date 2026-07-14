import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLearningRecordDto } from './dto/create-learning-record.dto';
import { MiniappLearningRecordsService } from './miniapp-learning-records.service';

@Controller('miniapp/learning-records')
@UseGuards(MiniappJwtGuard)
export class MiniappLearningRecordsController {
  constructor(private readonly learningRecordsService: MiniappLearningRecordsService) {}

  @Get()
  list(@CurrentUser() user: { sub: number }, @Query() query: PaginationQueryDto) {
    return this.learningRecordsService.list(user.sub, Number(query.page ?? 1), Number(query.pageSize ?? 10));
  }

  @Get('stats')
  stats(@CurrentUser() user: { sub: number }) {
    return this.learningRecordsService.getStats(user.sub);
  }

  @Post()
  create(@CurrentUser() user: { sub: number }, @Body() payload: CreateLearningRecordDto) {
    return this.learningRecordsService.create(user.sub, payload);
  }

  @Delete()
  clear(@CurrentUser() user: { sub: number }) {
    return this.learningRecordsService.clear(user.sub);
  }
}
