import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QuizAttempt } from '../../entities/quiz-attempt.entity';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { MiniappQuizService } from './miniapp-quiz.service';

describe('MiniappQuizService', () => {
  let service: MiniappQuizService;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;

  beforeEach(() => {
    // mock repository:create 透传实体,save 模拟数据库补齐 id/createdAt 后返回
    createMock = jest.fn((entity: Partial<QuizAttempt>) => ({ ...entity }));
    saveMock = jest.fn(async (entity: Partial<QuizAttempt>) => ({
      id: 1,
      createdAt: new Date('2026-08-22T00:00:00.000Z'),
      ...entity,
    }));
    const repository = { create: createMock, save: saveMock };
    service = new MiniappQuizService(repository as unknown as Repository<QuizAttempt>);
  });

  // 旧客户端的文化知识答题请求(不带 mode)
  const buildCulturePayload = (overrides: Partial<CreateQuizAttemptDto> = {}): CreateQuizAttemptDto => ({
    score: 20,
    correctCount: 2,
    totalQuestions: 3,
    answers: [
      { id: 'q1', selected: 'A', answer: 'B', correct: false },
      { id: 'q2', selected: 'C', answer: 'C', correct: true },
      { id: 'q3', selected: 'D', answer: 'D', correct: true },
    ],
    ...overrides,
  });

  // 发音闯关请求:三题得分 8/5/6,总分 19,过线(>=6)题数 2
  const buildPronunciationPayload = (overrides: Partial<CreateQuizAttemptDto> = {}): CreateQuizAttemptDto => ({
    score: 19,
    correctCount: 2,
    totalQuestions: 3,
    mode: 'pronunciation',
    answers: [
      { id: 'p1', selected: 'nac', answer: 'naz', correct: true, points: 8, similarity: 0.856, recognizedText: 'naz', type: 'word' },
      { id: 'p2', selected: 'x', answer: 'y', correct: false, points: 5, similarity: 0.42, recognizedText: 'wrong-text'.repeat(40) },
      { id: 'p3', selected: 'm', answer: 'm', correct: true, points: 6, similarity: 1.2 },
    ],
    ...overrides,
  });

  it('旧客户端不带 mode 的请求走原有校验并保存 mode=culture', async () => {
    const result = await service.create(7, buildCulturePayload());

    expect(saveMock).toHaveBeenCalledTimes(1);
    const savedEntity = createMock.mock.calls[0][0] as Partial<QuizAttempt>;
    // mode 缺省时落库为 culture
    expect(savedEntity.mode).toBe('culture');
    expect(result.mode).toBe('culture');
    expect(result.score).toBe(20);
    expect(result.correctCount).toBe(2);
    // 旧请求的明细清洗保持原有四字段,不携带新字段
    const answers = JSON.parse(savedEntity.answersJson || '[]') as Array<Record<string, unknown>>;
    expect(answers).toHaveLength(3);
    expect(Object.keys(answers[0]).sort()).toEqual(['answer', 'correct', 'id', 'selected']);
  });

  it('旧模式校验不符(score 与 correctCount*10 不一致)仍抛 400', async () => {
    await expect(
      service.create(7, buildCulturePayload({ score: 30 })),
    ).rejects.toThrow(BadRequestException);
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('pronunciation 模式合法提交保存成功且 mode 落库', async () => {
    const result = await service.create(7, buildPronunciationPayload());

    expect(saveMock).toHaveBeenCalledTimes(1);
    const savedEntity = createMock.mock.calls[0][0] as Partial<QuizAttempt>;
    expect(savedEntity.mode).toBe('pronunciation');
    expect(savedEntity.score).toBe(19);
    expect(savedEntity.correctCount).toBe(2);
    expect(result.mode).toBe('pronunciation');

    // 明细清洗:可选字段保留并钳制(similarity 0.856→0.86、1.2→1),recognizedText 截断 255
    const answers = JSON.parse(savedEntity.answersJson || '[]') as Array<Record<string, unknown>>;
    expect(answers[0].points).toBe(8);
    expect(answers[0].similarity).toBe(0.86);
    expect(answers[0].type).toBe('word');
    expect(answers[1].recognizedText).toBe('wrong-text'.repeat(40).slice(0, 255));
    expect(answers[2].similarity).toBe(1);
  });

  it('pronunciation 模式 score 与 Σpoints 不符抛 400', async () => {
    await expect(
      service.create(7, buildPronunciationPayload({ score: 18 })),
    ).rejects.toThrow(BadRequestException);
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('pronunciation 模式 correctCount 与过线题数不符抛 400', async () => {
    await expect(
      service.create(7, buildPronunciationPayload({ correctCount: 3 })),
    ).rejects.toThrow(BadRequestException);
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('pronunciation 模式答案缺少 points 或 points 非法抛 400', async () => {
    await expect(
      service.create(7, buildPronunciationPayload({
        score: 13,
        correctCount: 2,
        answers: [
          { id: 'p1', selected: 'a', answer: 'a', correct: true },
          { id: 'p2', selected: 'b', answer: 'b', correct: false, points: 5 },
          { id: 'p3', selected: 'c', answer: 'c', correct: true, points: 6 },
        ],
      })),
    ).rejects.toThrow(BadRequestException);
    expect(saveMock).not.toHaveBeenCalled();

    // points 超出 0-10 同样视为明细不一致
    await expect(
      service.create(7, buildPronunciationPayload({
        score: 16,
        correctCount: 2,
        answers: [
          { id: 'p1', selected: 'a', answer: 'a', correct: true, points: 11 },
          { id: 'p2', selected: 'b', answer: 'b', correct: false, points: 5 },
          { id: 'p3', selected: 'c', answer: 'c', correct: true, points: 6 },
        ],
      })),
    ).rejects.toThrow(BadRequestException);
    expect(saveMock).not.toHaveBeenCalled();
  });
});
