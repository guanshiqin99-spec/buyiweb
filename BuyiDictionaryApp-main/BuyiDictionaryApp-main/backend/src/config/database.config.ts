import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import initSqlJs from 'sql.js';
import { Admin } from '../entities/admin.entity';
import { AgentCache } from '../entities/agent-cache.entity';
import { AuthSession } from '../entities/auth-session.entity';
import { Badge } from '../entities/badge.entity';
import { ContentCultureLink } from '../entities/content-culture-link.entity';
import { CultureExhibit } from '../entities/culture-exhibit.entity';
import { DictionaryEntry } from '../entities/dictionary-entry.entity';
import { Favorite } from '../entities/favorite.entity';
import { LearningRecord } from '../entities/learning-record.entity';
import { MediaAsset } from '../entities/media-asset.entity';
import { Phrase } from '../entities/phrase.entity';
import { Proverb } from '../entities/proverb.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { Song } from '../entities/song.entity';
import { UserSetting } from '../entities/user-setting.entity';
import { User } from '../entities/user.entity';
import { WechatAccount } from '../entities/wechat-account.entity';
import { BaselineSchema1710000000000 } from '../migrations/1710000000000-baseline-schema';
import { AddCultureExhibits1721000000000 } from '../migrations/1721000000000-add-culture-exhibits';
import { AddQuizAttempts1722000000000 } from '../migrations/1722000000000-add-quiz-attempts';

export const entities = [
  Admin,
  AgentCache,
  AuthSession,
  User,
  WechatAccount,
  UserSetting,
  MediaAsset,
  DictionaryEntry,
  Phrase,
  Proverb,
  Song,
  Favorite,
  LearningRecord,
  QuizAttempt,
  Badge,
  CultureExhibit,
  ContentCultureLink,
];

export const migrations = [BaselineSchema1710000000000, AddCultureExhibits1721000000000, AddQuizAttempts1722000000000];

export function buildTypeOrmOptions(config: {
  db: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };
}): DataSourceOptions {
  const { db } = config;
  const synchronize = db.synchronize;
  const logging = db.logging;

  if (db.type === 'mysql') {
    return {
      type: 'mysql',
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.database,
      entities,
      migrations,
      migrationsTableName: 'migrations',
      synchronize,
      logging,
      charset: 'utf8mb4',
      connectTimeout: 30000,
      timezone: '+08:00',
    };
  }

  // Vercel serverless 环境只有 /tmp 可写
  const isVercel = process.env.VERCEL === '1';
  const dbLocation = isVercel ? `/tmp/${db.database}` : db.database;

  return {
    type: 'sqljs',
    location: dbLocation,
    autoSave: true,
    driver: initSqlJs,
    entities,
    migrations,
    migrationsTableName: 'migrations',
    synchronize,
    logging,
  };
}

export function typeOrmConfigFactory(configService: ConfigService): TypeOrmModuleOptions {
  return buildTypeOrmOptions({
    db: {
      type: configService.get<string>('db.type', 'sqljs'),
      host: configService.get<string>('db.host', '127.0.0.1'),
      port: configService.get<number>('db.port', 3306),
      username: configService.get<string>('db.username', 'root'),
      password: configService.get<string>('db.password', ''),
      database: configService.get<string>('db.database', 'buyi_dictionary'),
      synchronize: configService.get<boolean>('db.synchronize', true),
      logging: configService.get<boolean>('db.logging', false),
    },
  });
}
