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
    // 答题模式:旧客户端不传 mode 时缺省为 culture,保持完全向后兼容
    const mode = payload.mode ?? 'culture';

    if (mode === 'pronunciation') {
      // 发音闯关模式:每题须携带 0-10 的整数 points,score 与 correctCount 须与明细一致
      const pointsList = payload.answers.map((answer) => {
        const points = answer.points;
        return typeof points === 'number' && Number.isInteger(points) && points >= 0 && points <= 10 ? points : null;
      });
      const totalPoints = pointsList.reduce<number>((sum, points) => (points === null ? sum : sum + points), 0);
      const passedCount = pointsList.filter((points) => points !== null && points >= 6).length;
      if (
        pointsList.some((points) => points === null)
        || payload.answers.length !== payload.totalQuestions
        || payload.score !== totalPoints
        || payload.correctCount !== passedCount
      ) {
        throw new BadRequestException('答题成绩与答案明细不一致');
      }
    } else {
      // 文化知识模式:保持原有校验逻辑
      const computedCorrectCount = payload.answers.filter((answer) => answer.correct === true).length;
      if (
        payload.answers.length !== payload.totalQuestions
        || payload.correctCount !== computedCorrectCount
        || payload.score !== computedCorrectCount * 10
      ) {
        throw new BadRequestException('答题成绩与答案明细不一致');
      }
    }

    const sanitizedAnswers = payload.answers.map((answer) => this.sanitizeAnswer(answer));

    const saved = await this.quizAttemptsRepository.save(
      this.quizAttemptsRepository.create({
        userId,
        mode,
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

  // 统一的答案明细清洗:两种模式共用,可选字段缺失时直接跳过
  private sanitizeAnswer(answer: Record<string, unknown>): Record<string, unknown> {
    const item: Record<string, unknown> = {
      id: String(answer.id || '').slice(0, 96),
      selected: String(answer.selected || '').slice(0, 255),
      answer: String(answer.answer || '').slice(0, 255),
      correct: answer.correct === true,
    };

    if (answer.type !== undefined) {
      item.type = String(answer.type).slice(0, 32);
    }

    if (answer.points !== undefined) {
      // 钳制到 0-10 的整数
      const points = Math.trunc(Number(answer.points));
      item.points = Number.isFinite(points) ? Math.min(10, Math.max(0, points)) : 0;
    }

    if (answer.similarity !== undefined) {
      // 钳制到 0-1 并保留两位小数
      const similarity = Number(answer.similarity);
      item.similarity = Number.isFinite(similarity)
        ? Math.round(Math.min(1, Math.max(0, similarity)) * 100) / 100
        : 0;
    }

    if (answer.recognizedText !== undefined) {
      item.recognizedText = String(answer.recognizedText || '').slice(0, 255);
    }

    // 发音题明细附带跟读的布依语原文与中文释义,便于学习记录回看
    if (answer.buyiText !== undefined) {
      item.buyiText = String(answer.buyiText || '').slice(0, 96);
    }

    if (answer.zhText !== undefined) {
      item.zhText = String(answer.zhText || '').slice(0, 255);
    }

    return item;
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
      mode: attempt.mode || 'culture',
      answers,
      createdAt: attempt.createdAt,
    };
  }
}
