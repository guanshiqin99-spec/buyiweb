import { Entity } from 'typeorm';
import { BaseContentEntity } from './base-content.entity';

@Entity('phrases')
export class Phrase extends BaseContentEntity {}
