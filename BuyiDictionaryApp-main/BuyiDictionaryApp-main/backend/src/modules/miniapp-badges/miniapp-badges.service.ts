import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { Badge } from '../../entities/badge.entity';
import { Favorite } from '../../entities/favorite.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { calculateLearningStats } from '../miniapp-learning-records/learning-stats';

// 徽章定义表：code → 名称/描述/纹样，前端徽章墙展示用
export const BADGE_DEFINITIONS: Record<string, { name: string; description: string; pattern: 'batik' | 'drum' | 'weaving' }> = {
  'first-word': { name: '初识布依', description: '查看了第一个布依语词条', pattern: 'batik' },
  'streak-7': { name: '七日不辍', description: '连续学习 7 天', pattern: 'drum' },
  'streak-30': { name: '月学不辍', description: '连续学习 30 天', pattern: 'drum' },
  'explorer': { name: '文化探索者', description: '浏览全部四类内容', pattern: 'weaving' },
  'collector': { name: '词汇收藏家', description: '收藏 10 个词条', pattern: 'batik' },
  'singer': { name: '天籁之音', description: '聆听 5 首民歌', pattern: 'weaving' },
};

@Injectable()
export class MiniappBadgesService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(LearningRecord)
    private readonly learningRecordRepository: Repository<LearningRecord>,
  ) {}

  async list(userId: number) {
    const badges = await this.syncProgressBadges(userId);
    // 合并定义：已解锁返回 unlockedAt，未解锁返回 locked:true
    const badgeByCode = new Map(badges.map((badge) => [badge.code, badge]));
    const all = Object.entries(BADGE_DEFINITIONS).map(([code, def]) => {
      const unlocked = badgeByCode.get(code);
      const isUnlocked = Boolean(unlocked);
      return {
        id: unlocked?.id ?? code,
        code,
        name: def.name,
        description: def.description,
        pattern: def.pattern,
        locked: !isUnlocked,
        unlocked: isUnlocked,
        isUnlocked,
        unlockedAt: unlocked?.unlockedAt ?? null,
      };
    });
    return {
      items: all,
      total: all.length,
      unlockedCount: badgeByCode.size,
    };
  }

  private async syncProgressBadges(userId: number) {
    const [badges, records, favoriteCount] = await Promise.all([
      this.badgeRepository.find({
        where: { userId },
        order: { unlockedAt: 'DESC' },
      }),
      this.learningRecordRepository.find({ where: { userId } }),
      this.favoriteRepository.count({ where: { userId } }),
    ]);

    const stats = calculateLearningStats(records);
    const contentTypes = new Set(records.map((record) => record.contentType));
    const listenedSongIds = new Set(
      records
        .filter((record) => record.contentType === ContentType.SONG && record.actionType === 'play')
        .map((record) => record.contentId),
    );

    const eligibleCodes = [
      records.some((record) => record.contentType === ContentType.DICTIONARY) && 'first-word',
      stats.streakDays >= 7 && 'streak-7',
      stats.streakDays >= 30 && 'streak-30',
      Object.values(ContentType).every((type) => contentTypes.has(type)) && 'explorer',
      favoriteCount >= 10 && 'collector',
      listenedSongIds.size >= 5 && 'singer',
    ].filter((code): code is string => Boolean(code));

    const unlockedCodes = new Set(badges.map((badge) => badge.code));
    const missingCodes = eligibleCodes.filter((code) => !unlockedCodes.has(code));
    if (!missingCodes.length) return badges;

    const unlocked = await this.badgeRepository.save(
      missingCodes.map((code) => this.badgeRepository.create({ userId, code })),
    );
    return [...unlocked, ...badges];
  }

  async unlock(userId: number, code: string) {
    const exists = await this.badgeRepository.findOne({ where: { userId, code } });
    if (exists) return exists;
    return this.badgeRepository.save(
      this.badgeRepository.create({ userId, code }),
    );
  }
}
