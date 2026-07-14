import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.badges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // 徽章代码：first-word / streak-7 / explorer 等可识别标识
  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @CreateDateColumn()
  unlockedAt!: Date;
}
