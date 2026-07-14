import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isProductionEnvironment } from '../../config/runtime-validation';

@Injectable()
export class WechatService {
  constructor(private readonly configService: ConfigService) {}

  async code2Session(code: string): Promise<{ openid: string; unionid?: string; session_key: string }> {
    if (!code) {
      throw new UnauthorizedException('缺少微信登录 code');
    }

    const mockMode = this.configService.get<boolean>('wechat.mockMode', true);
    if (mockMode) {
      if (isProductionEnvironment(process.env)) {
        throw new UnauthorizedException('生产环境禁止使用微信 Mock 登录');
      }

      return {
        openid: `mock-openid-${code}`,
        unionid: `mock-unionid-${code}`,
        session_key: `mock-session-${code}`,
      };
    }

    const appId = this.configService.get<string>('wechat.appId', '');
    const appSecret = this.configService.get<string>('wechat.appSecret', '');
    if (!appId || !appSecret) {
      throw new UnauthorizedException('微信登录配置不完整');
    }

    const url =
      `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(appId)}` +
      `&secret=${encodeURIComponent(appSecret)}` +
      `&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;

    const response = await fetch(url);
    const payload = (await response.json()) as {
      errcode?: number;
      errmsg?: string;
      openid?: string;
      unionid?: string;
      session_key?: string;
    };

    if (!response.ok || payload.errcode || !payload.openid || !payload.session_key) {
      throw new UnauthorizedException(payload.errmsg || '微信登录失败');
    }

    return {
      openid: payload.openid,
      unionid: payload.unionid,
      session_key: payload.session_key,
    };
  }
}
