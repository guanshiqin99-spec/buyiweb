import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Badge } from './badge.entity';
import { Favorite } from './favorite.entity';
import { LearningRecord } from './learning-record.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { UserSetting } from './user-setting.entity';
import { WechatAccount } from './wechat-account.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  nickname!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string | null;

  // Web 端账号密码登录字段（微信用户这两列为 null）
  @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
  username!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phoneNumber!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLoginTime!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => WechatAccount, (wechatAccount) => wechatAccount.user)
  wechatAccounts!: WechatAccount[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];

  @OneToMany(() => LearningRecord, (record) => record.user)
  learningRecords!: LearningRecord[];

  @OneToMany(() => QuizAttempt, (attempt) => attempt.user)
  quizAttempts!: QuizAttempt[];

  @OneToMany(() => Badge, (badge) => badge.user)
  badges!: Badge[];

  @OneToMany(() => UserSetting, (setting) => setting.user)
  settings!: UserSetting[];
}
