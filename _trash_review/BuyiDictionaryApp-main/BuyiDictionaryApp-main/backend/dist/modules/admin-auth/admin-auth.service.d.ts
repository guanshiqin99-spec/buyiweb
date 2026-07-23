import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Admin } from '../../entities/admin.entity';
import { AuthSessionsService } from '../auth-sessions/auth-sessions.service';
import { AdminLoginDto } from './dto/admin-login.dto';
export declare class AdminAuthService {
    private readonly adminRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly authSessionsService;
    constructor(adminRepository: Repository<Admin>, jwtService: JwtService, configService: ConfigService, authSessionsService: AuthSessionsService);
    login(payload: AdminLoginDto): Promise<{
        admin: {
            id: number;
            username: string;
            role: import("../../common/enums/admin-role.enum").AdminRole;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        admin: {
            id: number;
            username: string;
            role: import("../../common/enums/admin-role.enum").AdminRole;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private issueTokens;
    private verifyRefreshToken;
    private getTokenExpiry;
}
