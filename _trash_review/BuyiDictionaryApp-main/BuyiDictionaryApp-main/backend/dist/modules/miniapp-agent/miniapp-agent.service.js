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
var MiniappAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappAgentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_cache_entity_1 = require("../../entities/agent-cache.entity");
const PROJECT_KEYWORDS = [
    '布依', '布依族', '布依语', '词典', '方言', '声调', '舒声', '促声',
    '民歌', '谚语', '短语', '词汇', '例句', '语法', '音节', '元音', '辅音', '拼音', '汉字',
    '蜡染', '铜鼓', '纹样', '织锦', '刺绣', '非遗', '遗产', '工艺',
    '三月三', '六月六', '四月八', '节日', '祭祀', '民俗', '习俗', '节庆',
    '贵州', '黔南', '黔西南', '黔东南', '少数民族', '民族',
    '分手调', '雨水情', '会友歌', '导览员', '文化', '族群', '聚居',
];
const SYSTEM_PROMPT = [
    '你是「布依文化导览员」，服务于「布依词典」文化平台。你只能回答与布依族文化相关的问题，话题范围包括：',
    '1. 布依语：词汇、声调（6 个舒声调 + 2 个促声调）、语法、短语、例句、拼音；',
    '2. 布依族民歌、谚语、口传文学；',
    '3. 布依族民俗：节日（三月三、六月六、四月八等）、祭祀、铜鼓礼仪；',
    '4. 布依族传统工艺：蜡染、织锦、刺绣、纹样（非遗）；',
    '5. 布依族分布与历史：主要聚居于贵州黔南、黔西南，使用人口约 200 万。',
    '',
    '硬性规则：',
    '- 若用户提问与布依族文化无关（如编程、天气、新闻、股市、其他民族无关内容、闲聊等），必须礼貌拒绝，并引导用户回到布依文化话题；',
    '- 不要编造不确定的事实，不确定时坦诚说明；',
    '- 使用简体中文回答，语气亲切、专业、简洁；',
    '- 回答控制在 300 字以内，必要时用分点列出。',
].join('\n');
let MiniappAgentService = MiniappAgentService_1 = class MiniappAgentService {
    constructor(configService, cacheRepo) {
        this.configService = configService;
        this.cacheRepo = cacheRepo;
        this.logger = new common_1.Logger(MiniappAgentService_1.name);
    }
    isProjectRelated(question) {
        const q = (question || '').toLowerCase();
        return PROJECT_KEYWORDS.some((kw) => q.includes(kw.toLowerCase()));
    }
    isConfigured() {
        const apiKey = this.configService.get('ai.apiKey', { infer: true });
        return Boolean(apiKey && apiKey.trim());
    }
    normalizeKey(question) {
        return (question || '').trim().toLowerCase().slice(0, 500);
    }
    async streamChat(question, history, onDelta, onDone, onError) {
        const useCache = !history || history.length === 0;
        if (useCache) {
            const key = this.normalizeKey(question);
            try {
                const cached = await this.cacheRepo.findOne({ where: { questionKey: key } });
                if (cached && cached.answer) {
                    await this.cacheRepo.increment({ id: cached.id }, 'hitCount', 1);
                    this.logger.log(`缓存命中: "${question.slice(0, 30)}..." (hitCount=${cached.hitCount + 1})`);
                    const chunks = this.splitToChunks(cached.answer, 12);
                    for (const chunk of chunks) {
                        onDelta(chunk);
                        await this.sleep(20);
                    }
                    onDone();
                    return;
                }
            }
            catch (err) {
                this.logger.warn(`缓存查询失败，降级为直接调用 API: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        const apiKey = this.configService.get('ai.apiKey', { infer: true });
        const baseURL = this.configService.get('ai.baseURL', { infer: true });
        const model = this.configService.get('ai.model', { infer: true });
        if (!apiKey) {
            onError(new common_1.ServiceUnavailableException('智能体服务未配置 API Key'));
            return;
        }
        const recentHistory = (history ?? []).slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
        }));
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...recentHistory,
            { role: 'user', content: question },
        ];
        let fullAnswer = '';
        try {
            const resp = await fetch(`${baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    stream: true,
                    temperature: 0.6,
                    max_tokens: 1024,
                }),
            });
            if (!resp.ok || !resp.body) {
                const errText = await resp.text().catch(() => '');
                throw new Error(`DeepSeek 接口错误 ${resp.status}: ${errText.slice(0, 200)}`);
            }
            const reader = resp.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data:'))
                        continue;
                    const data = trimmed.slice(5).trim();
                    if (data === '[DONE]') {
                        await this.saveCache(question, fullAnswer);
                        onDone();
                        return;
                    }
                    try {
                        const json = JSON.parse(data);
                        const delta = json?.choices?.[0]?.delta?.content;
                        if (typeof delta === 'string' && delta) {
                            fullAnswer += delta;
                            onDelta(delta);
                        }
                    }
                    catch {
                    }
                }
            }
            await this.saveCache(question, fullAnswer);
            onDone();
        }
        catch (err) {
            this.logger.error(`DeepSeek 流式调用失败: ${err instanceof Error ? err.message : String(err)}`);
            onError(err instanceof Error ? err : new Error(String(err)));
        }
    }
    async saveCache(question, answer) {
        const trimmedAnswer = (answer || '').trim();
        if (!trimmedAnswer)
            return;
        const key = this.normalizeKey(question);
        if (!key)
            return;
        try {
            const existing = await this.cacheRepo.findOne({ where: { questionKey: key } });
            if (existing) {
                return;
            }
            const cache = this.cacheRepo.create({
                questionKey: key,
                question: question.trim().slice(0, 500),
                answer: trimmedAnswer,
                hitCount: 0,
            });
            await this.cacheRepo.save(cache);
            this.logger.log(`缓存已写入: "${question.slice(0, 30)}..."`);
        }
        catch (err) {
            this.logger.warn(`缓存写入失败: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    splitToChunks(text, size) {
        if (!text)
            return [];
        const chunks = [];
        let i = 0;
        while (i < text.length) {
            let end = Math.min(i + size, text.length);
            if (end < text.length) {
                const punct = '，。；！？、,.!?; \n';
                let next = end;
                for (let j = end; j < Math.min(end + 8, text.length); j++) {
                    if (punct.includes(text[j])) {
                        next = j + 1;
                        break;
                    }
                }
                end = next;
            }
            chunks.push(text.slice(i, end));
            i = end;
        }
        return chunks;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.MiniappAgentService = MiniappAgentService;
exports.MiniappAgentService = MiniappAgentService = MiniappAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(agent_cache_entity_1.AgentCache)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], MiniappAgentService);
//# sourceMappingURL=miniapp-agent.service.js.map