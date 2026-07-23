import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { AuthSessionsModule } from '../auth-sessions/auth-sessions.module';
import { AuthSecurityModule } from '../auth-security/auth-security.module';
import { MiniappAuthController } from './miniapp-auth.controller';
import { MiniappAuthService } from './miniapp-auth.service';
import { UsersModule } from '../users/users.module';
import { WechatService } from '../../common/services/wechat.service';

@Module({
  imports: [UsersModule, AuthSessionsModule, AuthSecurityModule, TypeOrmModule.forFeature([User])],
  controllers: [MiniappAuthController],
  providers: [MiniappAuthService, WechatService],
})
export class MiniappAuthModule {}
