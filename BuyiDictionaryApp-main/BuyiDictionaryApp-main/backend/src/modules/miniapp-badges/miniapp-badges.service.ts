import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '../../entities/badge.entity';

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
  ) {}

  async list(userId: number) {
    const badges = await this.badgeRepository.find({
      where: { userId },
      order: { unlockedAt: 'DESC' },
    });
    // 合并定义：已解锁返回 unlockedAt，未解锁返回 locked:true
    const unlockedCodes = new Set(badges.map((b) => b.code));
    const all = Object.entries(BADGE_DEFINITIONS).map(([code, def]) => {
      const unlocked = badges.find((b) => b.code === code);
      return {
        code,
        name: def.name,
        description: def.description,
        pattern: def.pattern,
        locked: !unlockedCodes.has(code),
        unlockedAt: unlocked ? unlocked.unlockedAt : null,
      };
    });
    return {
      items: all,
      total: all.length,
      unlockedCount: badges.length,
    };
  }

  async unlock(userId: number, code: string) {
    const exists = await this.badgeRepository.findOne({ where: { userId, code } });
    if (exists) return exists;
    return this.badgeRepository.save(
      this.badgeRepository.create({ userId, code }),
    );
  }
}
