import { RefreshTokenDto } from '../../common/dto/refresh-token.dto';
import { MiniappAuthService } from './miniapp-auth.service';
import { WebLoginDto, WebRegisterDto } from './dto/web-login.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';
export declare class MiniappAuthController {
    private readonly miniappAuthService;
    constructor(miniappAuthService: MiniappAuthService);
    wechatLogin(payload: WechatLoginDto): Promise<{
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
        };
        settings: Record<string, string>;
        accessToken: string;
        refreshToken: string;
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
    refresh(payload: RefreshTokenDto): Promise<{
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
        };
        settings: Record<string, string>;
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
