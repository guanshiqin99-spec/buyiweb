import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { UsersService } from '../users/users.service';

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
        phoneNumber: currentUser.phoneNumber,
      },
      settings,
      stats,
    };
  }
}
