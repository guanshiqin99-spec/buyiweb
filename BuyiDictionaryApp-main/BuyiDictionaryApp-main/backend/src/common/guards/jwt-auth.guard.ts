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
      throw new UnauthorizedException('\u7f3a\u5c11\u767b\u5f55\u4ee4\u724c');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const payload = this.jwtService.verify<{
        sub: number;
        sid?: string;
        tokenType?: 'miniapp' | 'admin';
        tokenKind?: string;
      }>(token, {
        secret: this.configService.get<string>('jwt.secret', 'change-me'),
      });

      if (payload.tokenKind !== 'access') {
        throw new UnauthorizedException('\u767b\u5f55\u4ee4\u724c\u7c7b\u578b\u65e0\u6548');
      }

      if (!payload.sid || !payload.tokenType) {
        throw new UnauthorizedException('\u767b\u5f55\u4f1a\u8bdd\u4e0d\u5b58\u5728');
      }

      const sessionIsActive = await this.authSessionsService.validateAccessSession({
        sessionId: payload.sid,
        userType: payload.tokenType,
        userId: payload.sub,
      });
      if (!sessionIsActive) {
        throw new UnauthorizedException('\u5f53\u524d\u4f1a\u8bdd\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('\u767b\u5f55\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
    }
  }
}
