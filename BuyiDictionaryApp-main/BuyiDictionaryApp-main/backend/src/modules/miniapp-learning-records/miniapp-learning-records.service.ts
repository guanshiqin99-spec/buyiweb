import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { LearningRecord } from '../../entities/learning-record.entity';
import { ContentService } from '../content/content.service';
import { calculateLearningStats } from './learning-stats';

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
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
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
    return calculateLearningStats(records);
  }
}
