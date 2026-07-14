import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../entities/favorite.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { UserSetting } from '../../entities/user-setting.entity';
import { User } from '../../entities/user.entity';
import { WechatAccount } from '../../entities/wechat-account.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(WechatAccount)
    private readonly wechatAccountsRepository: Repository<WechatAccount>,
    @InjectRepository(UserSetting)
    private readonly userSettingsRepository: Repository<UserSetting>,
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(LearningRecord)
    private readonly learningRecordsRepository: Repository<LearningRecord>,
  ) {}

  async findById(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findWechatAccount(openid: string): Promise<WechatAccount | null> {
    return this.wechatAccountsRepository.findOne({
      where: { openid },
      relations: ['user'],
    });
  }

  async upsertWechatUser(params: {
    openid: string;
    unionid?: string | null;
    sessionKey?: string | null;
    nickname?: string | null;
    avatarUrl?: string | null;
  }): Promise<User> {
    const now = new Date();
    const existing = await this.findWechatAccount(params.openid);
    if (existing) {
      if (params.sessionKey) {
        existing.sessionKey = params.sessionKey;
      }
      if (params.unionid) {
        existing.unionid = params.unionid;
      }
      await this.wechatAccountsRepository.save(existing);

      const user = existing.user;
      user.nickname = params.nickname ?? user.nickname;
      user.avatarUrl = params.avatarUrl ?? user.avatarUrl;
      user.lastLoginTime = now;
      return this.usersRepository.save(user);
    }

    const user = this.usersRepository.create({
      nickname: params.nickname || '微信用户',
      avatarUrl: params.avatarUrl || null,
      lastLoginTime: now,
    });
    const savedUser = await this.usersRepository.save(user);
    const wechatAccount = this.wechatAccountsRepository.create({
      openid: params.openid,
      unionid: params.unionid ?? null,
      sessionKey: params.sessionKey ?? null,
      userId: savedUser.id,
    });
    await this.wechatAccountsRepository.save(wechatAccount);
    return savedUser;
  }

  async getSettings(userId: number): Promise<Record<string, string>> {
    const settings = await this.userSettingsRepository.find({ where: { userId } });
    return settings.reduce<Record<string, string>>((acc, current) => {
      acc[current.key] = current.value;
      return acc;
    }, {});
  }

  async updateSettings(userId: number, updates: Record<string, string>): Promise<Record<string, string>> {
    const keys = Object.keys(updates);
    const existing = keys.length
      ? await this.userSettingsRepository.find({
          where: keys.map((key) => ({ userId, key })),
        })
      : [];

    const existingMap = new Map(existing.map((item) => [item.key, item]));

    for (const [key, value] of Object.entries(updates)) {
      const item = existingMap.get(key);
      if (item) {
        item.value = value;
        await this.userSettingsRepository.save(item);
        continue;
      }
      await this.userSettingsRepository.save(
        this.userSettingsRepository.create({
          userId,
          key,
          value,
        }),
      );
    }

    return this.getSettings(userId);
  }

  async getProfileStats(userId: number) {
    const [favoriteCount, learningRecordCount, lastRecord] = await Promise.all([
      this.favoritesRepository.count({ where: { userId } }),
      this.learningRecordsRepository.count({ where: { userId } }),
      this.learningRecordsRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      favoriteCount,
      learningRecordCount,
      lastActiveAt: lastRecord?.createdAt ?? null,
    };
  }
}
