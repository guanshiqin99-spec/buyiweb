import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RefreshTokenDto } from '../../common/dto/refresh-token.dto';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { MiniappAuthService } from './miniapp-auth.service';
import { WebLoginDto, WebRegisterDto } from './dto/web-login.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';

@Controller('miniapp/auth')
export class MiniappAuthController {
  constructor(private readonly miniappAuthService: MiniappAuthService) {}

  @Public()
  @Post('wechat-login')
  wechatLogin(@Body() payload: WechatLoginDto) {
    return this.miniappAuthService.login(payload);
  }

  // Web 端账号密码登录
  @Public()
  @Post('web-login')
  webLogin(@Body() payload: WebLoginDto) {
    return this.miniappAuthService.webLogin(payload);
  }

  // Web 端账号注册
  @Public()
  @Post('web-register')
  webRegister(@Body() payload: WebRegisterDto) {
    return this.miniappAuthService.webRegister(payload);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() payload: RefreshTokenDto) {
    return this.miniappAuthService.refresh(payload.refreshToken);
  }

  @UseGuards(MiniappJwtGuard)
  @Post('logout')
  logout(@CurrentUser() user: { sid: string }) {
    return this.miniappAuthService.logout(user.sid);
  }
}
