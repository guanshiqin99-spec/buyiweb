import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from '../../entities/quiz-attempt.entity';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';

@Injectable()
export class MiniappQuizService {
  constructor(
    @InjectRepository(QuizAttempt)
    private readonly quizAttemptsRepository: Repository<QuizAttempt>,
  ) {}

  async create(userId: number, payload: CreateQuizAttemptDto) {
    const computedCorrectCount = payload.answers.filter((answer) => answer.correct === true).length;
    if (
      payload.answers.length !== payload.totalQuestions
      || payload.correctCount !== computedCorrectCount
      || payload.score !== computedCorrectCount * 10
    ) {
      throw new BadRequestException('答题成绩与答案明细不一致');
    }

    const sanitizedAnswers = payload.answers.map((answer) => ({
      id: String(answer.id || '').slice(0, 96),
      selected: String(answer.selected || '').slice(0, 255),
      answer: String(answer.answer || '').slice(0, 255),
      correct: answer.correct === true,
    }));

    const saved = await this.quizAttemptsRepository.save(
      this.quizAttemptsRepository.create({
        userId,
        score: payload.score,
        correctCount: payload.correctCount,
        totalQuestions: payload.totalQuestions,
        answersJson: JSON.stringify(sanitizedAnswers),
      }),
    );

    return this.serialize(saved);
  }

  async list(userId: number, page: number, pageSize: number) {
    const [items, total] = await this.quizAttemptsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items: items.map((item) => this.serialize(item)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  private serialize(attempt: QuizAttempt) {
    let answers: Array<Record<string, unknown>> = [];
    try {
      answers = JSON.parse(attempt.answersJson || '[]');
    } catch {}
    return {
      id: attempt.id,
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      answers,
      createdAt: attempt.createdAt,
    };
  }
}
