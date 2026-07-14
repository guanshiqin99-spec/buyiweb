import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CultureExhibit } from './culture-exhibit.entity';

@Entity('content_culture_links')
@Index(['contentType', 'contentId', 'exhibitId'], { unique: true })
export class ContentCultureLink {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 32 })
  contentType!: string;

  @Column({ type: 'int' })
  contentId!: number;

  @Column({ type: 'int' })
  exhibitId!: number;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @ManyToOne(() => CultureExhibit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exhibitId' })
  exhibit!: CultureExhibit;
}
