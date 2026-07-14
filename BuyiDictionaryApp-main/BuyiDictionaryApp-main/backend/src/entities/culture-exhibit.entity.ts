import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('culture_exhibits')
export class CultureExhibit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 96, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  kicker!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text', default: '' })
  story!: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  patternLabel!: string;

  @Column({ type: 'int', nullable: true })
  toneIndex!: number | null;

  @Column({ type: 'int', nullable: true })
  featuredSongId!: number | null;

  @Column({ type: 'varchar', length: 255, default: '' })
  sourceTitle!: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  sourceUrl!: string;

  @Column({ type: 'varchar', length: 40, default: 'verified' })
  sourceStatus!: 'verified' | 'pending';

  @Column({ default: true })
  isPublished!: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
