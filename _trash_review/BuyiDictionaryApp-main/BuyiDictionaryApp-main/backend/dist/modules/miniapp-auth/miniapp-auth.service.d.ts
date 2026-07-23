import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { WechatService } from '../../common/services/wechat.service';
import { AuthSessionsService } from '../auth-sessions/auth-sessions.service';
import { UsersService } from '../users/users.service';
import { WebLoginDto, WebRegisterDto } from './dto/web-login.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';
export declare class MiniappAuthService {
    private readonly usersRepository;
    private readonly usersService;
    private readonly wechatService;
    private readonly jwtService;
    private readonly configService;
    private readonly authSessionsService;
    constructor(usersRepository: Repository<User>, usersService: UsersService, wechatService: WechatService, jwtService: JwtService, configService: ConfigService, authSessionsService: AuthSessionsService);
    login(payload: WechatLoginDto): Promise<{
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
        };
        settings: Record<string, string>;
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
        };
        settings: Record<string, string>;
        accessToken: string;
        refreshToken: string;
    }>;
    logout(sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    webLogin(payload: WebLoginDto): Promise<{
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
            username: string | null;
        };
        settings: Record<string, string>;
        accessToken: string;
        refreshToken: string;
    }>;
    webRegister(payload: WebRegisterDto): Promise<{
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
            username: string | null;
        };
        settings: Record<string, string>;
        accessToken: string;
        refreshToken: string;
    }>;
    private issueTokens;
    private verifyRefreshToken;
    private getTokenExpiry;
}
