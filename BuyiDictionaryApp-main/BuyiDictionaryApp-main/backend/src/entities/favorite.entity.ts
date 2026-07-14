import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ContentType } from '../common/enums/content-type.enum';
import { User } from './user.entity';

@Entity('favorites')
@Index(['userId', 'contentType', 'contentId'], { unique: true })
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 32 })
  contentType!: ContentType;

  @Column()
  contentId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
