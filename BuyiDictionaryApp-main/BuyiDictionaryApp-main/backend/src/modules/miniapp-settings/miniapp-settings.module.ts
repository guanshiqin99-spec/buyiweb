import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MiniappSettingsController } from './miniapp-settings.controller';

@Module({
  imports: [UsersModule],
  controllers: [MiniappSettingsController],
})
export class MiniappSettingsModule {}
