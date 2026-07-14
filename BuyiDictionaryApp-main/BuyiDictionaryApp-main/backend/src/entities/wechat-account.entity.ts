import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('wechat_accounts')
export class WechatAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 128 })
  openid!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  unionid!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  sessionKey!: string | null;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.wechatAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
