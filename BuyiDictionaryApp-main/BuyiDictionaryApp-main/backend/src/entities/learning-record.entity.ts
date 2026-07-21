import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ContentType } from '../common/enums/content-type.enum';
import { User } from './user.entity';

@Entity('learning_records')
export class LearningRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.learningRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 32 })
  contentType!: ContentType;

  @Column()
  contentId!: number;

  @Column({ type: 'varchar', length: 16 })
  actionType!: 'view' | 'play' | 'review';

  @CreateDateColumn()
  createdAt!: Date;
}
