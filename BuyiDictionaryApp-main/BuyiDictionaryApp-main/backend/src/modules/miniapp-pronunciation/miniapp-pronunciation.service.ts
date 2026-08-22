import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { PronunciationScoreResult, scorePronunciation } from './pronunciation-scoring';

// 发音题条目
export interface PronunciationQuestionItem {
  id: number;
  kind: 'dictionary' | 'phrase';
  buyiText: string;
  zhText: string;
  description: string | null;
  audioUrl: string | null;
}

// 每张表预取的候选条目数量上限
const CANDIDATE_TAKE = 500;
// 题目目标文本长度上限（字符数）
const MAX_TEXT_LENGTH = 24;
// 内存过滤允许的最大空格数（对应音节数不超过 4）
const MAX_SPACE_COUNT = 3;
// count 查询参数缺省值与上下限
const DEFAULT_COUNT = 5;
const MIN_COUNT = 1;
const MAX_COUNT = 10;

@Injectable()
export class MiniappPronunciationService {
  constructor(
    @InjectRepository(DictionaryEntry)
    private readonly dictionaryRepository: Repository<DictionaryEntry>,
    @InjectRepository(Phrase)
    private readonly phraseRepository: Repository<Phrase>,
  ) {}

  // 随机抽取发音练习题：两表各取一批已发布短文本，内存过滤音节数后合并洗牌抽样
  async getQuestions(rawCount?: string): Promise<{ items: PronunciationQuestionItem[] }> {
    const count = this.parseCount(rawCount);

    const [dictionaryRows, phraseRows] = await Promise.all([
      this.dictionaryRepository
        .createQueryBuilder('entry')
        .where('entry.isPublished = :isPublished', { isPublished: true })
        .andWhere('LENGTH(entry.buyiText) <= :maxLen', { maxLen: MAX_TEXT_LENGTH })
        .take(CANDIDATE_TAKE)
        .getMany(),
      this.phraseRepository
        .createQueryBuilder('phrase')
        .where('phrase.isPublished = :isPublished', { isPublished: true })
        .andWhere('LENGTH(phrase.buyiText) <= :maxLen', { maxLen: MAX_TEXT_LENGTH })
        .take(CANDIDATE_TAKE)
        .getMany(),
    ]);

    const candidates: PronunciationQuestionItem[] = [
      ...dictionaryRows
        .filter((row) => this.countSpaces(row.buyiText) <= MAX_SPACE_COUNT)
        .map((row) => ({
          id: row.id,
          kind: 'dictionary' as const,
          buyiText: row.buyiText,
          zhText: row.zhText,
          description: row.description,
          audioUrl: row.audioUrl,
        })),
      ...phraseRows
        .filter((row) => this.countSpaces(row.buyiText) <= MAX_SPACE_COUNT)
        .map((row) => ({
          id: row.id,
          kind: 'phrase' as const,
          buyiText: row.buyiText,
          zhText: row.zhText,
          description: row.description,
          // Phrase 实体没有音频字段
          audioUrl: null,
        })),
    ];

    return { items: this.shuffle(candidates).slice(0, count) };
  }

  // 发音相似度评分（纯函数计算，便于单测）
  score(payload: { targetText: string; recognizedText: string }): PronunciationScoreResult {
    return scorePronunciation(payload.targetText, payload.recognizedText);
  }

  // 解析 count 参数：缺省 5，钳制在 1-10
  private parseCount(raw?: string): number {
    const parsed = Number.parseInt(String(raw ?? ''), 10);
    if (Number.isNaN(parsed)) return DEFAULT_COUNT;
    return Math.min(MAX_COUNT, Math.max(MIN_COUNT, parsed));
  }

  // 统计文本中的空格数量
  private countSpaces(text: string): number {
    return text.split(' ').length - 1;
  }

  // Fisher-Yates 洗牌，不修改原数组
  private shuffle<T>(items: T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
