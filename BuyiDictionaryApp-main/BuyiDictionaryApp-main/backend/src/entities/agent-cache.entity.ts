import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// 智能体高频问答缓存：相同问题命中后直接返回，不再调用 DeepSeek API
@Entity('agent_cache')
@Index(['questionKey'], { unique: true })
export class AgentCache {
  @PrimaryGeneratedColumn()
  id!: number;

  // 归一化后的问题文本（去首尾空格 + 小写），用于精确匹配
  @Column({ type: 'varchar', length: 500 })
  questionKey!: string;

  // 用户原始问题文本
  @Column({ type: 'varchar', length: 500 })
  question!: string;

  // 模型返回的完整答案
  @Column({ type: 'text' })
  answer!: string;

  // 命中次数，体现"高频"程度
  @Column({ type: 'int', default: 0 })
  hitCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
