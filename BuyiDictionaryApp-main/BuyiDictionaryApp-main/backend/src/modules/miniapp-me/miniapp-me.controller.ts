import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { UsersService } from '../users/users.service';

// 安全：PII 脱敏工具，手机号保留前 3 后 4，中间用 **** 替换
// 不足 7 位时全部脱敏为 ******，避免短号被完整还原
function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return phone ?? null;
  const trimmed = String(phone).trim();
  if (trimmed.length < 7) return '******';
  return `${trimmed.slice(0, 3)}****${trimmed.slice(-4)}`;
}

@Controller('miniapp/me')
@UseGuards(MiniappJwtGuard)
export class MiniappMeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async me(@CurrentUser() user: { sub: number }) {
    const currentUser = await this.usersService.findById(user.sub);
    const [settings, stats] = await Promise.all([
      this.usersService.getSettings(user.sub),
      this.usersService.getProfileStats(user.sub),
    ]);
    return {
      user: {
        id: currentUser.id,
        nickname: currentUser.nickname,
        avatarUrl: currentUser.avatarUrl,
        phoneNumber: maskPhone(currentUser.phoneNumber),
      },
      settings,
      stats,
    };
  }
}
