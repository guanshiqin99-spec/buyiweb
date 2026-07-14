import { Column, Entity } from 'typeorm';
import { BaseContentEntity } from './base-content.entity';

@Entity('dictionary_entries')
export class DictionaryEntry extends BaseContentEntity {
  @Column({ type: 'varchar', length: 500, nullable: true })
  audioUrl!: string | null;

  @Column({ type: 'int', nullable: true })
  audioMediaId!: number | null;
}
