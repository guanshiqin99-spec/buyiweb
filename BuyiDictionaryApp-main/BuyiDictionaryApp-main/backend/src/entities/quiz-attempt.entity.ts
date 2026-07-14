import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('quiz_attempts')
@Index(['userId', 'createdAt'])
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.quizAttempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'integer' })
  score!: number;

  @Column({ type: 'integer' })
  correctCount!: number;

  @Column({ type: 'integer' })
  totalQuestions!: number;

  @Column({ type: 'text' })
  answersJson!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
