import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { WechatService } from '../../common/services/wechat.service';
import { AuthSessionsService } from '../auth-sessions/auth-sessions.service';
import { UsersService } from '../users/users.service';
import { WebLoginDto, WebRegisterDto } from './dto/web-login.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';

@Injectable()
export class MiniappAuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly wechatService: WechatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionsService: AuthSessionsService,
  ) {}

  async login(payload: WechatLoginDto) {
    const session = await this.wechatService.code2Session(payload.code);
    const user = await this.usersService.upsertWechatUser({
      openid: session.openid,
      unionid: session.unionid,
      sessionKey: session.session_key,
      nickname: payload.nickname ?? null,
      avatarUrl: payload.avatarUrl ?? null,
    });

    const tokens = await this.issueTokens({
      userId: user.id,
      nickname: user.nickname,
    });
    const settings = await this.usersService.getSettings(user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      settings,
    };
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const session = await this.authSessionsService.validateRefreshToken({
      sessionId: payload.sid,
      userType: 'miniapp',
      userId: payload.sub,
      refreshToken,
    });

    if (!session) {
      throw new UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
    }

    const user = await this.usersService.findById(payload.sub);
    const tokens = await this.issueTokens({
      userId: user.id,
      nickname: user.nickname,
      sessionId: session.sessionId,
      persistSession: false,
    });

    await this.authSessionsService.rotateRefreshToken(
      session.sessionId,
      tokens.refreshToken,
      this.getTokenExpiry(tokens.refreshToken),
    );

    const settings = await this.usersService.getSettings(user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      settings,
    };
  }

  async logout(sessionId: string) {
    await this.authSessionsService.deactivateSession(sessionId, 'miniapp');
    return {
      success: true,
      message: '\u5df2\u9000\u51fa\u767b\u5f55',
    };
  }

  // Web 端账号密码登录：校验通过后签发与小程序同类型（miniapp）的 token，
  // 这样 Web 端可直接复用所有 /miniapp/* 业务接口
  async webLogin(payload: WebLoginDto) {
    const user = await this.usersRepository.findOne({ where: { username: payload.username } });
    if (!user?.isActive || !user.passwordHash) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    user.lastLoginTime = new Date();
    await this.usersRepository.save(user);

    const tokens = await this.issueTokens({
      userId: user.id,
      nickname: user.nickname,
    });
    const settings = await this.usersService.getSettings(user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        username: user.username,
      },
      settings,
    };
  }

  async webRegister(payload: WebRegisterDto) {
    const existing = await this.usersRepository.findOne({ where: { username: payload.username } });
    if (existing) {
      throw new ConflictException('用户名已被占用');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = this.usersRepository.create({
      username: payload.username,
      passwordHash,
      nickname: payload.nickname || payload.username,
      lastLoginTime: new Date(),
    });
    const savedUser = await this.usersRepository.save(user);

    const tokens = await this.issueTokens({
      userId: savedUser.id,
      nickname: savedUser.nickname,
    });
    const settings = await this.usersService.getSettings(savedUser.id);

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        nickname: savedUser.nickname,
        avatarUrl: savedUser.avatarUrl,
        username: savedUser.username,
      },
      settings,
    };
  }

  private async issueTokens(params: {
    userId: number;
    nickname: string | null;
    sessionId?: string;
    persistSession?: boolean;
  }) {
    const sessionId: string = params.sessionId ?? randomUUID();
    const persistSession = params.persistSession ?? true;
    const accessToken = await this.jwtService.signAsync(
      {
        sub: params.userId,
        sid: sessionId,
        nickname: params.nickname,
        tokenType: 'miniapp',
        tokenKind: 'access',
      },
      {
        secret: this.configService.get<string>('jwt.secret', 'change-me'),
        expiresIn: this.configService.get<string>('jwt.expiresIn', '7d') as never,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: params.userId,
        sid: sessionId,
        tokenType: 'miniapp',
        tokenKind: 'refresh',
      },
      {
        secret: this.configService.get<string>('jwt.secret', 'change-me'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '30d') as never,
      },
    );

    if (persistSession) {
      await this.authSessionsService.createSession({
        sessionId,
        userType: 'miniapp',
        userId: params.userId,
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
        secret: this.configService.get<string>('jwt.secret', 'change-me'),
      });

      if (payload.tokenType !== 'miniapp' || payload.tokenKind !== 'refresh') {
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
