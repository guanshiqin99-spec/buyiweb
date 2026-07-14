import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttempt } from '../../entities/quiz-attempt.entity';
import { MiniappQuizController } from './miniapp-quiz.controller';
import { MiniappQuizService } from './miniapp-quiz.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAttempt])],
  controllers: [MiniappQuizController],
  providers: [MiniappQuizService],
})
export class MiniappQuizModule {}
