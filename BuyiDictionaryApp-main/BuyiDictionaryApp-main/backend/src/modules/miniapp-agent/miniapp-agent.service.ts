import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../../config/app.config';
import { AgentCache } from '../../entities/agent-cache.entity';

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class MiniappAgentService {
  private readonly logger = new Logger(MiniappAgentService.name);

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    @InjectRepository(AgentCache)
    private readonly cacheRepo: Repository<AgentCache>,
  ) {}

  isProjectRelated(question: string): boolean {
    const q = (question || '').toLowerCase();
    return PROJECT_KEYWORDS.some((kw) => q.includes(kw.toLowerCase()));
  }

  /** 是否已配置 API Key */
  isConfigured(): boolean {
    const apiKey = this.configService.get('ai.apiKey', { infer: true });
    return Boolean(apiKey && apiKey.trim());
  }

  /** 问题归一化：去首尾空格 + 小写 */
  private normalizeKey(question: string): string {
    return (question || '').trim().toLowerCase().slice(0, 500);
  }

  async streamChat(
    question: string,
    history: ChatMessage[],
    onDelta: (chunk: string) => void,
    onDone: () => void,
    onError: (err: Error) => void,
  ): Promise<void> {
    // 1. 先查缓存
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
      } catch (err) {
        this.logger.warn(`缓存查询失败，降级为直接调用 API: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 2. 未命中，调用 DeepSeek
    const apiKey = this.configService.get('ai.apiKey', { infer: true });
    const baseURL = this.configService.get('ai.baseURL', { infer: true });
    const model = this.configService.get('ai.model', { infer: true });

    if (!apiKey) {
      onError(new ServiceUnavailableException('智能体服务未配置 API Key'));
      return;
    }

    // 仅保留最近 6 条历史，避免 token 膨胀
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
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            await this.saveCache(question, fullAnswer);
            onDone();
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta: unknown = json?.choices?.[0]?.delta?.content;
            if (typeof delta === 'string' && delta) {
              fullAnswer += delta;
              onDelta(delta);
            }
          } catch {
            // 忽略无法解析的分片
          }
        }
      }
      await this.saveCache(question, fullAnswer);
      onDone();
    } catch (err) {
      this.logger.error(`DeepSeek 流式调用失败: ${err instanceof Error ? err.message : String(err)}`);
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /** 生成布依语例句、五题文化挑战或关联词推荐。 */
  async streamGenerate(
    type: 'sentence' | 'quiz' | 'related',
    word: string,
    onDelta: (chunk: string) => void,
    onDone: () => void,
    onError: (err: Error) => void,
  ): Promise<void> {
    const normalizedWord = (word || '').trim().slice(0, 100);
    const prompts: Record<'sentence' | 'quiz' | 'related', string> = {
      sentence: `请用布依语"${normalizedWord}"造一个日常例句，给出中文翻译和简要语法说明，150字以内。`,
      quiz: '基于布依族文化一次生成5道四选一选择题，严格返回JSON数组。每题格式：{"prompt":"题目","answer":"正确选项的完整文本","options":["选项一完整文本","选项二完整文本","选项三完整文本","选项四完整文本"],"explanation":"解析","source":"AI生成"}。要求：数组恰好5项；options 必须是4个不重复的完整选项文本（不要用单字母 A/B/C/D，要写完整内容如"传统音乐"）；answer 必须与 options 中某一项的文本完全一致。只返回 JSON 数组，不要代码围栏或其他文字。',
      related: `基于布依语"${normalizedWord}"，推荐3个相关词汇，严格返回JSON：{"words":["词1","词2","词3"]}。不要返回其他内容。`,
    };
    const prompt = prompts[type];

    if (!prompt || !this.isProjectRelated(prompt)) {
      onError(new Error('生成任务不在布依文化范围内'));
      return;
    }

    const apiKey = this.configService.get('ai.apiKey', { infer: true });
    const baseURL = this.configService.get('ai.baseURL', { infer: true });
    const model = this.configService.get('ai.model', { infer: true });
    if (!apiKey) {
      onError(new ServiceUnavailableException('智能体服务未配置 API Key'));
      return;
    }

    const generationSystemPrompt = [
      '你是「布依文化导览员」的内容生成模块，只生成与布依语和布依族文化有关的学习内容。',
      '不得编造无法确认的权威来源；题目与推荐中的 source 固定写为"AI生成"。',
      '用户要求 JSON 时必须只输出合法 JSON，不要使用 Markdown 代码围栏或补充说明。',
      '使用简体中文，布依语内容应简洁并明确标注其为学习辅助内容。',
    ].join('\n');

    try {
      const resp = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: generationSystemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: true,
          temperature: type === 'quiz' ? 0.5 : 0.6,
          max_tokens: type === 'quiz' ? 2048 : 768,
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
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta: unknown = json?.choices?.[0]?.delta?.content;
            if (typeof delta === 'string' && delta) onDelta(delta);
          } catch {
            // 忽略无法解析的上游分片，继续读取后续 SSE。
          }
        }
      }
      onDone();
    } catch (err) {
      this.logger.error(`DeepSeek 生成调用失败: ${err instanceof Error ? err.message : String(err)}`);
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private async saveCache(question: string, answer: string): Promise<void> {
    const trimmedAnswer = (answer || '').trim();
    if (!trimmedAnswer) return;
    const key = this.normalizeKey(question);
    if (!key) return;
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
    } catch (err) {
      this.logger.warn(`缓存写入失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /** 把完整答案切成小块，模拟流式打字效果 */
  private splitToChunks(text: string, size: number): string[] {
    if (!text) return [];
    const chunks: string[] = [];
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
