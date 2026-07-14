import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { AuthSession } from '../../entities/auth-session.entity';

@Injectable()
export class AuthSessionsService {
  constructor(
    @InjectRepository(AuthSession)
    private readonly authSessionRepository: Repository<AuthSession>,
  ) {}

  async createSession(params: {
    sessionId: string;
    userType: 'miniapp' | 'admin';
    userId: number;
    refreshToken: string;
    expiresAt: Date;
  }) {
    const session = this.authSessionRepository.create({
      sessionId: params.sessionId,
      userType: params.userType,
      userId: params.userId,
      refreshTokenHash: this.hashRefreshToken(params.refreshToken),
      expiresAt: params.expiresAt,
      lastUsedAt: null,
      isActive: true,
    });

    return this.authSessionRepository.save(session);
  }

  async findActiveSession(sessionId: string, userType: 'miniapp' | 'admin') {
    return this.authSessionRepository.findOne({
      where: {
        sessionId,
        userType,
        isActive: true,
      },
    });
  }

  async validateAccessSession(params: {
    sessionId: string;
    userType: 'miniapp' | 'admin';
    userId: number;
  }) {
    const session = await this.findActiveSession(params.sessionId, params.userType);
    if (!session || session.userId !== params.userId) {
      return false;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.authSessionRepository.update(session.id, {
        isActive: false,
      });
      return false;
    }

    return true;
  }

  async validateRefreshToken(params: {
    sessionId: string;
    userType: 'miniapp' | 'admin';
    userId: number;
    refreshToken: string;
  }) {
    const session = await this.findActiveSession(params.sessionId, params.userType);
    if (!session || session.userId !== params.userId) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.authSessionRepository.update(session.id, {
        isActive: false,
      });
      return null;
    }

    if (session.refreshTokenHash !== this.hashRefreshToken(params.refreshToken)) {
      return null;
    }

    return session;
  }

  async rotateRefreshToken(sessionId: string, refreshToken: string, expiresAt: Date) {
    await this.authSessionRepository.update(
      { sessionId },
      {
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        expiresAt,
        lastUsedAt: new Date(),
      },
    );
  }

  async deactivateSession(sessionId: string, userType: 'miniapp' | 'admin') {
    await this.authSessionRepository.update(
      {
        sessionId,
        userType,
        isActive: true,
      },
      {
        isActive: false,
      },
    );
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
