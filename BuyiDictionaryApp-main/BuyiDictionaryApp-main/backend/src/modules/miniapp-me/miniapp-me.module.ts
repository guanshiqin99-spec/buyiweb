import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MiniappMeController } from './miniapp-me.controller';

@Module({
  imports: [UsersModule],
  controllers: [MiniappMeController],
})
export class MiniappMeModule {}
