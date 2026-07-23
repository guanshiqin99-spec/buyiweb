import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RefreshTokenDto } from '../../common/dto/refresh-token.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Public()
  @Post('login')
  login(@Body() payload: AdminLoginDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = req.ip || (typeof forwarded === 'string' ? forwarded : forwarded?.[0]) || '';
    return this.adminAuthService.login(payload, ip);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() payload: RefreshTokenDto) {
    return this.adminAuthService.refresh(payload.refreshToken);
  }

  @UseGuards(AdminJwtGuard)
  @Post('logout')
  logout(@CurrentUser() user: { sid: string }) {
    return this.adminAuthService.logout(user.sid);
  }
}
