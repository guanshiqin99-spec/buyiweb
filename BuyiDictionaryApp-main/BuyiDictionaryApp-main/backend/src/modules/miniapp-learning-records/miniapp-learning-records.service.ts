import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { LearningRecord } from '../../entities/learning-record.entity';
import { ContentService } from '../content/content.service';

@Injectable()
export class MiniappLearningRecordsService {
  constructor(
    @InjectRepository(LearningRecord)
    private readonly learningRecordRepository: Repository<LearningRecord>,
    private readonly contentService: ContentService,
  ) {}

  async create(userId: number, payload: { contentType: ContentType; contentId: number; actionType: 'view' | 'play' }) {
    return this.learningRecordRepository.save(
      this.learningRecordRepository.create({
        userId,
        contentType: payload.contentType,
        contentId: payload.contentId,
        actionType: payload.actionType,
      }),
    );
  }

  async list(userId: number, page: number, pageSize: number) {
    const [items, total] = await this.learningRecordRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const records = await Promise.all(
      items.map(async (item) => {
        try {
          const content = await this.contentService.getPublishedDetail(item.contentType, item.contentId);
          return {
            id: item.id,
            actionType: item.actionType,
            createdAt: item.createdAt,
            content: this.contentService.serialize(content, item.contentType),
          };
        } catch {
          return {
            id: item.id,
            actionType: item.actionType,
            createdAt: item.createdAt,
            content: null,
          };
        }
      }),
    );

    return {
      items: records,
      total,
      page,
      pageSize,
      stats: await this.getStats(userId),
    };
  }

  async clear(userId: number) {
    const result = await this.learningRecordRepository.delete({ userId });
    return {
      success: true,
      deletedCount: result.affected ?? 0,
      message: '\u5df2\u6e05\u7a7a\u5b66\u4e60\u8bb0\u5f55',
    };
  }

  async getStats(userId: number) {
    const records = await this.learningRecordRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const total = records.length;

    // 各类型计数：用于仪表盘进度条
    const typeCounts = {
      dictionary: records.filter((r) => r.contentType === ContentType.DICTIONARY).length,
      phrase: records.filter((r) => r.contentType === ContentType.PHRASE).length,
      proverb: records.filter((r) => r.contentType === ContentType.PROVERB).length,
      song: records.filter((r) => r.contentType === ContentType.SONG).length,
    };

    // 获取北京时间今天零点的时间戳（北京时间 = UTC+8）
    const nowBeijing = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const todayMidnightBeijing = new Date(nowBeijing.getFullYear(), nowBeijing.getMonth(), nowBeijing.getDate());
    const todayStartMs = todayMidnightBeijing.getTime();

    const today = records.filter((record) => {
      const recordMs = new Date(record.createdAt).getTime();
      return recordMs >= todayStartMs;
    }).length;

    // 计算连续学习天数
    const distinctDayMs = Array.from(
      new Set(
        records.map((record) => {
          const d = new Date(new Date(record.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
          return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        }),
      ),
    ).sort((a, b) => b - a);

    let streak = 0;
    let cursor = todayMidnightBeijing.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    for (const day of distinctDayMs) {
      if (day === cursor) {
        streak += 1;
        cursor -= oneDay;
        continue;
      }
      if (day === cursor - oneDay && streak === 0) {
        streak += 1;
        cursor = day - oneDay;
        continue;
      }
      break;
    }

    return {
      today,
      total,
      streak,
      typeCounts,
    };
  }
}
