import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentCache } from '../../entities/agent-cache.entity';
import { MiniappAgentController } from './miniapp-agent.controller';
import { MiniappAgentService } from './miniapp-agent.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentCache])],
  controllers: [MiniappAgentController],
  providers: [MiniappAgentService],
})
export class MiniappAgentModule {}
