import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { UsersService } from '../users/users.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { LearningReminderService } from './learning-reminder.service';

@Controller('miniapp/settings')
@UseGuards(MiniappJwtGuard)
export class MiniappSettingsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly learningReminderService: LearningReminderService,
  ) {}

  @Get('reminder-config')
  getReminderConfig() {
    return this.learningReminderService.getClientConfig();
  }

  private normalize(settings: Record<string, string>) {
    return {
      theme: settings.theme || 'light',
      fontSize: settings.fontSize || '中',
      notifications: settings.notifications === 'true',
      autoplay: settings.autoplay === 'true',
      language: settings.language || 'zh-CN',
    };
  }

  @Get()
  async getSettings(@CurrentUser() user: { sub: number }) {
    return this.normalize(await this.usersService.getSettings(user.sub));
  }

  @Put()
  async updateSettings(@CurrentUser() user: { sub: number }, @Body() payload: UpdateSettingsDto) {
    const updates: Record<string, string> = {};
    if (payload.theme) {
      updates.theme = payload.theme;
    }
    if (payload.fontSize) {
      updates.fontSize = payload.fontSize;
    }
    if (payload.notifications !== undefined) {
      updates.notifications = String(payload.notifications);
    }
    if (payload.autoplay !== undefined) {
      updates.autoplay = String(payload.autoplay);
    }
    if (payload.language) {
      updates.language = payload.language;
    }
    return this.normalize(await this.usersService.updateSettings(user.sub, updates));
  }
}
