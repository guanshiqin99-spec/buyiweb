"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const runtime_validation_1 = require("../../config/runtime-validation");
let WechatService = class WechatService {
    constructor(configService) {
        this.configService = configService;
    }
    async code2Session(code) {
        if (!code) {
            throw new common_1.UnauthorizedException('缺少微信登录 code');
        }
        const mockMode = this.configService.get('wechat.mockMode', true);
        if (mockMode) {
            if ((0, runtime_validation_1.isProductionEnvironment)(process.env)) {
                throw new common_1.UnauthorizedException('生产环境禁止使用微信 Mock 登录');
            }
            return {
                openid: `mock-openid-${code}`,
                unionid: `mock-unionid-${code}`,
                session_key: `mock-session-${code}`,
            };
        }
        const appId = this.configService.get('wechat.appId', '');
        const appSecret = this.configService.get('wechat.appSecret', '');
        if (!appId || !appSecret) {
            throw new common_1.UnauthorizedException('微信登录配置不完整');
        }
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(appId)}` +
            `&secret=${encodeURIComponent(appSecret)}` +
            `&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
        const response = await fetch(url);
        const payload = (await response.json());
        if (!response.ok || payload.errcode || !payload.openid || !payload.session_key) {
            throw new common_1.UnauthorizedException(payload.errmsg || '微信登录失败');
        }
        return {
            openid: payload.openid,
            unionid: payload.unionid,
            session_key: payload.session_key,
        };
    }
};
exports.WechatService = WechatService;
exports.WechatService = WechatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WechatService);
//# sourceMappingURL=wechat.service.js.map