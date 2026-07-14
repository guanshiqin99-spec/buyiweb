import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { MiniappBadgesService } from './miniapp-badges.service';

@Controller('miniapp/badges')
@UseGuards(MiniappJwtGuard)
export class MiniappBadgesController {
  constructor(private readonly badgesService: MiniappBadgesService) {}

  @Get()
  list(@CurrentUser() user: { sub: number }) {
    return this.badgesService.list(user.sub);
  }
}
