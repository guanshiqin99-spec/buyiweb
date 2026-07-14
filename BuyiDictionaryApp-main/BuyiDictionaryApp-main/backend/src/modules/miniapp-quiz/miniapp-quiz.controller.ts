import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { MiniappQuizService } from './miniapp-quiz.service';

@Controller('miniapp/quiz-attempts')
@UseGuards(MiniappJwtGuard)
export class MiniappQuizController {
  constructor(private readonly quizService: MiniappQuizService) {}

  @Post()
  create(@CurrentUser() user: { sub: number }, @Body() payload: CreateQuizAttemptDto) {
    return this.quizService.create(user.sub, payload);
  }

  @Get()
  list(@CurrentUser() user: { sub: number }, @Query() query: PaginationQueryDto) {
    return this.quizService.list(user.sub, Number(query.page ?? 1), Number(query.pageSize ?? 10));
  }
}
