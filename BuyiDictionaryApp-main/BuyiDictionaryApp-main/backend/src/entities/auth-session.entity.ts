import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('auth_sessions')
@Index(['sessionId'], { unique: true })
export class AuthSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 64 })
  sessionId!: string;

  @Column({ type: 'varchar', length: 16 })
  userType!: 'miniapp' | 'admin';

  @Column()
  userId!: number;

  @Column({ type: 'varchar', length: 128 })
  refreshTokenHash!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  lastUsedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
