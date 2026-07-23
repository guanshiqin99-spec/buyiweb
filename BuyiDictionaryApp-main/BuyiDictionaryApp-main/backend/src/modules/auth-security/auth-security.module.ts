import { Module } from '@nestjs/common';
import { LoginLockoutService } from './login-lockout.service';

@Module({
  providers: [
    {
      provide: LoginLockoutService,
      useFactory: () => new LoginLockoutService(5, 15), // 阈值5次，锁定15分钟
    },
  ],
  exports: [LoginLockoutService],
})
export class AuthSecurityModule {}
