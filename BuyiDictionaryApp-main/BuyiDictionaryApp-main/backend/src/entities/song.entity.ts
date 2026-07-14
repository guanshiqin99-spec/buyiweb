import { Column, Entity } from 'typeorm';
import { BaseContentEntity } from './base-content.entity';

@Entity('songs')
export class Song extends BaseContentEntity {
  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  artist!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverUrl!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  audioUrl!: string | null;

  // 歌词全文：用于情绪型民歌页沉浸式歌词展示
  @Column({ type: 'text', nullable: true })
  lyrics!: string | null;

  @Column({ type: 'int', nullable: true })
  coverMediaId!: number | null;

  @Column({ type: 'int', nullable: true })
  audioMediaId!: number | null;
}
