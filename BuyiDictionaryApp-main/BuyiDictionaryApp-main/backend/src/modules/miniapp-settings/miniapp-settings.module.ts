import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSetting } from '../../entities/user-setting.entity';
import { WechatAccount } from '../../entities/wechat-account.entity';
import { UsersModule } from '../users/users.module';
import { MiniappSettingsController } from './miniapp-settings.controller';
import { LearningReminderService } from './learning-reminder.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([UserSetting, WechatAccount])],
  controllers: [MiniappSettingsController],
  providers: [LearningReminderService],
})
export class MiniappSettingsModule {}
