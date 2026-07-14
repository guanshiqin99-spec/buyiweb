import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Admin } from '../../entities/admin.entity';
import { AuthSessionsService } from '../auth-sessions/auth-sessions.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionsService: AuthSessionsService,
  ) {}

  async login(payload: AdminLoginDto) {
    const admin = await this.adminRepository.findOne({ where: { username: payload.username } });
    if (!admin?.isActive) {
      throw new UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef');
    }

    const isValid = await bcrypt.compare(payload.password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef');
    }

    const tokens = await this.issueTokens(admin);

    return {
      ...tokens,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const session = await this.authSessionsService.validateRefreshToken({
      sessionId: payload.sid,
      userType: 'admin',
      userId: payload.sub,
      refreshToken,
    });

    if (!session) {
      throw new UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
    }

    const admin = await this.adminRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });
    if (!admin) {
      throw new UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u4e0d\u53ef\u7528');
    }

    const tokens = await this.issueTokens(admin, session.sessionId, false);
    await this.authSessionsService.rotateRefreshToken(
      session.sessionId,
      tokens.refreshToken,
      this.getTokenExpiry(tokens.refreshToken),
    );

    return {
      ...tokens,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    };
  }

  async logout(sessionId: string) {
    await this.authSessionsService.deactivateSession(sessionId, 'admin');
    return {
      success: true,
      message: '\u5df2\u9000\u51fa\u767b\u5f55',
    };
  }

  private async issueTokens(admin: Admin, sessionId?: string, persistSession = true) {
    const resolvedSessionId = sessionId ?? randomUUID();
    const accessToken = await this.jwtService.signAsync(
      {
        sub: admin.id,
        sid: resolvedSessionId,
        username: admin.username,
        role: admin.role,
        tokenType: 'admin',
        tokenKind: 'access',
      },
      {
        // 安全实践：JWT 密钥无默认兜底，未设置时启动失败
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.adminExpiresIn', '1d') as never,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: admin.id,
        sid: resolvedSessionId,
        tokenType: 'admin',
        tokenKind: 'refresh',
      },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.adminRefreshExpiresIn', '14d') as never,
      },
    );

    if (persistSession) {
      await this.authSessionsService.createSession({
        sessionId: resolvedSessionId,
        userType: 'admin',
        userId: admin.id,
        refreshToken,
        expiresAt: this.getTokenExpiry(refreshToken),
      });
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  private verifyRefreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{
        sub: number;
        sid: string;
        tokenType: string;
        tokenKind: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      if (payload.tokenType !== 'admin' || payload.tokenKind !== 'refresh') {
        throw new UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u4e0d\u53ef\u7528');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
    }
  }

  private getTokenExpiry(token: string) {
    const payload = this.jwtService.decode(token) as { exp?: number } | null;
    if (!payload?.exp) {
      throw new UnauthorizedException('\u65e0\u6cd5\u89e3\u6790\u5237\u65b0\u4ee4\u724c\u8fc7\u671f\u65f6\u95f4');
    }
    return new Date(payload.exp * 1000);
  }
}
