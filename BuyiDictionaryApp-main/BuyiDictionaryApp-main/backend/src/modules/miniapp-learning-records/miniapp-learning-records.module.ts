import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningRecord } from '../../entities/learning-record.entity';
import { ContentModule } from '../content/content.module';
import { MiniappLearningRecordsController } from './miniapp-learning-records.controller';
import { MiniappLearningRecordsService } from './miniapp-learning-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([LearningRecord]), ContentModule],
  controllers: [MiniappLearningRecordsController],
  providers: [MiniappLearningRecordsService],
})
export class MiniappLearningRecordsModule {}
