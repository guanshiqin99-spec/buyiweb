import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../../entities/favorite.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { UserSetting } from '../../entities/user-setting.entity';
import { User } from '../../entities/user.entity';
import { WechatAccount } from '../../entities/wechat-account.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, WechatAccount, UserSetting, Favorite, LearningRecord])],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
