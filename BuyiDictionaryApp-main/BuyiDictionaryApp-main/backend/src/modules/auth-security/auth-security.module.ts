import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfaFactor } from '../../entities/auth/mfa-factor.entity';
import { MfaService } from './mfa.service';
import { LoginLockoutService } from './login-lockout.service';
import { MfaController } from './mfa.controller';
import { AppConfig } from '../../config/app.config';

/**
 * 鉴权安全模块
 * 规范依据：安全项1「账号登录安全」—— 密码复杂度 + 失败锁定 + MFA
 */
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MfaFactor])],
  controllers: [MfaController],
  providers: [
    MfaService,
    {
      provide: LoginLockoutService,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const rl = config.get('ratelimit', { infer: true })!;
        return new LoginLockoutService(rl.loginLockThreshold, rl.loginLockMinutes);
      },
    },
  ],
  exports: [MfaService, LoginLockoutService],
})
export class AuthSecurityModule {}
