import { ConfigService } from '@nestjs/config';
export declare class WechatService {
    private readonly configService;
    constructor(configService: ConfigService);
    code2Session(code: string): Promise<{
        openid: string;
        unionid?: string;
        session_key: string;
    }>;
}
