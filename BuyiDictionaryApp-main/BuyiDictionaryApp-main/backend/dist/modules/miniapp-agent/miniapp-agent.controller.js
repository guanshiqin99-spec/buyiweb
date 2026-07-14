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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MiniappAgentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappAgentController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const miniapp_jwt_guard_1 = require("../../common/guards/miniapp-jwt.guard");
const miniapp_agent_service_1 = require("./miniapp-agent.service");
class ChatMessageDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "content", void 0);
class AskDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AskDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChatMessageDto),
    __metadata("design:type", Array)
], AskDto.prototype, "history", void 0);
let MiniappAgentController = MiniappAgentController_1 = class MiniappAgentController {
    constructor(agentService) {
        this.agentService = agentService;
        this.logger = new common_1.Logger(MiniappAgentController_1.name);
    }
    async ask(dto, _user, res) {
        const question = (dto?.question || '').trim();
        if (!question) {
            throw new common_1.BadRequestException('问题不能为空');
        }
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();
        let closed = false;
        const send = (payload) => {
            if (closed)
                return;
            try {
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
            }
            catch {
                closed = true;
            }
        };
        const finish = () => {
            if (closed)
                return;
            closed = true;
            try {
                res.end();
            }
            catch {
            }
        };
        if (!this.agentService.isProjectRelated(question)) {
            send({
                type: 'delta',
                content: '抱歉，我是布依文化导览员，只能回答与布依族文化相关的问题（如布依语词汇、声调、民歌、谚语、蜡染、铜鼓、民俗节日等）。请尝试向我提问布依文化相关的内容。',
            });
            send({ type: 'done' });
            finish();
            return;
        }
        if (!this.agentService.isConfigured()) {
            send({ type: 'error', message: '智能体服务暂未配置，请联系管理员' });
            finish();
            return;
        }
        await this.agentService.streamChat(question, (dto.history ?? []), (chunk) => send({ type: 'delta', content: chunk }), () => {
            send({ type: 'done' });
            finish();
        }, (err) => {
            this.logger.error(err.message);
            send({ type: 'error', message: '智能体响应失败，请稍后重试' });
            finish();
        });
    }
};
exports.MiniappAgentController = MiniappAgentController;
__decorate([
    (0, common_1.Post)('ask'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AskDto, Object, Object]),
    __metadata("design:returntype", Promise)
], MiniappAgentController.prototype, "ask", null);
exports.MiniappAgentController = MiniappAgentController = MiniappAgentController_1 = __decorate([
    (0, common_1.Controller)('miniapp/agent'),
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    __metadata("design:paramtypes", [miniapp_agent_service_1.MiniappAgentService])
], MiniappAgentController);
//# sourceMappingURL=miniapp-agent.controller.js.map