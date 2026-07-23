import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthSessionsService } from '../../modules/auth-sessions/auth-sessions.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionsService: AuthSessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少登录令牌');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = this.jwtService.verify<{
        sub: number;
        sid?: string;
        tokenType?: 'miniapp' | 'admin';
        tokenKind?: string;
      }>(token, {
        // 安全实践：JWT 密钥无默认兜底，未设置时启动失败
        secret: this.configService.get<string>('jwt.secret'),
      });

      if (payload.tokenKind !== 'access') {
        throw new UnauthorizedException('登录令牌类型无效');
      }

      if (!payload.sid || !payload.tokenType) {
        throw new UnauthorizedException('登录会话不存在');
      }

      const sessionIsActive = await this.authSessionsService.validateAccessSession({
        sessionId: payload.sid,
        userType: payload.tokenType,
        userId: payload.sub,
      });
      if (!sessionIsActive) {
        throw new UnauthorizedException('当前会话已失效，请重新登录');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('登录已失效，请重新登录');
    }
  }
}
