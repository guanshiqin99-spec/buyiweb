import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 64 })
  kind!: string;

  @Column({ length: 255 })
  filename!: string;

  @Column({ length: 500 })
  url!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  storageKey!: string | null;

  @Column({ length: 128 })
  mimeType!: string;

  @Column({ type: 'int', default: 0 })
  size!: number;

  @Column({ type: 'int', nullable: true })
  duration!: number | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
