import { Repository } from 'typeorm';
import { AuthSession } from '../../entities/auth-session.entity';
export declare class AuthSessionsService {
    private readonly authSessionRepository;
    constructor(authSessionRepository: Repository<AuthSession>);
    createSession(params: {
        sessionId: string;
        userType: 'miniapp' | 'admin';
        userId: number;
        refreshToken: string;
        expiresAt: Date;
    }): Promise<AuthSession>;
    findActiveSession(sessionId: string, userType: 'miniapp' | 'admin'): Promise<AuthSession | null>;
    validateAccessSession(params: {
        sessionId: string;
        userType: 'miniapp' | 'admin';
        userId: number;
    }): Promise<boolean>;
    validateRefreshToken(params: {
        sessionId: string;
        userType: 'miniapp' | 'admin';
        userId: number;
        refreshToken: string;
    }): Promise<AuthSession | null>;
    rotateRefreshToken(sessionId: string, refreshToken: string, expiresAt: Date): Promise<void>;
    deactivateSession(sessionId: string, userType: 'miniapp' | 'admin'): Promise<void>;
    private hashRefreshToken;
}
