import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseContentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  buyiText!: string;

  @Column({ length: 255 })
  zhText!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  enText!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // 文化注释：词条/短语/谚语/民歌的民族文化背景说明
  @Column({ type: 'text', nullable: true })
  culturalNote!: string | null;

  @Column({ default: true })
  isPublished!: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  zhSortKey!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
