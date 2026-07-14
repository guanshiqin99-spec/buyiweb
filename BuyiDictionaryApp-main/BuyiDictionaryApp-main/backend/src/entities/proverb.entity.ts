import { Entity } from 'typeorm';
import { BaseContentEntity } from './base-content.entity';

@Entity('proverbs')
export class Proverb extends BaseContentEntity {}
