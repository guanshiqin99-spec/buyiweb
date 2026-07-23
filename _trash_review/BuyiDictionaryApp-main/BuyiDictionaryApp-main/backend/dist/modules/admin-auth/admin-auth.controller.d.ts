import { RefreshTokenDto } from '../../common/dto/refresh-token.dto';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
export declare class AdminAuthController {
    private readonly adminAuthService;
    constructor(adminAuthService: AdminAuthService);
    login(payload: AdminLoginDto): Promise<{
        admin: {
            id: number;
            username: string;
            role: import("../../common/enums/admin-role.enum").AdminRole;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(payload: RefreshTokenDto): Promise<{
        admin: {
            id: number;
            username: string;
            role: import("../../common/enums/admin-role.enum").AdminRole;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: {
        sid: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
