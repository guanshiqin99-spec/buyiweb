import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { UsersService } from '../users/users.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('miniapp/settings')
@UseGuards(MiniappJwtGuard)
export class MiniappSettingsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getSettings(@CurrentUser() user: { sub: number }) {
    return this.usersService.getSettings(user.sub);
  }

  @Put()
  updateSettings(@CurrentUser() user: { sub: number }, @Body() payload: UpdateSettingsDto) {
    const updates: Record<string, string> = {};
    if (payload.theme) {
      updates.theme = payload.theme;
    }
    if (payload.fontSize) {
      updates.fontSize = payload.fontSize;
    }
    return this.usersService.updateSettings(user.sub, updates);
  }
}
