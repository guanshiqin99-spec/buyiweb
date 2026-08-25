import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../../config/app.config';
import { AgentCache } from '../../entities/agent-cache.entity';
import { ContentType } from '../../common/enums/content-type.enum';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';

const PROJECT_KEYWORDS = [
  '布依', '布依族', '布依语', '词典', '方言', '声调', '舒声', '促声',
  '民歌', '谚语', '短语', '词汇', '例句', '语法', '音节', '元音', '辅音', '拼音', '汉字',
  '蜡染', '铜鼓', '纹样', '织锦', '刺绣', '非遗', '遗产', '工艺',
  '三月三', '六月六', '四月八', '节日', '祭祀', '民俗', '习俗', '节庆',
  '贵州', '黔南', '黔西南', '黔东南', '少数民族', '民族',
  '分手调', '雨水情', '会友歌', '导览员', '文化', '族群', '聚居',
];

const SYSTEM_PROMPT = [
  '你是「布依文化导览员」，服务于「布依词典」文化平台。你的核心职责是讲解布依族文化，并尽力满足用户与布依文化相关的求知需求。',
  '',
  '核心话题范围（优先深入作答）：',
  '1. 布依语：词汇、声调（6 个舒声调 + 2 个促声调）、语法、短语、例句、拼音、汉字对照；',
  '2. 布依族民歌、谚语、口传文学、民间故事；',
  '3. 布依族民俗：节日（三月三、六月六、四月八等）、祭祀、铜鼓礼仪、婚俗、饮食；',
  '4. 布依族传统工艺：蜡染、织锦、刺绣、纹样（非遗）；',
  '5. 布依族分布与历史：主要聚居于贵州黔南、黔西南，使用人口约 200 万。',
  '',
  '可适度延伸的话题（为帮助理解布依文化而展开，回答时应明确回到布依文化本身）：',
  '- 与周边民族（壮、苗、侗、瑶、水、汉等）在语言、服饰、习俗上的比较与渊源；',
  '- 壮侗语族/侗台语系的语言学背景、汉语借词、文字演变；',
  '- 贵州、西南地区少数民族共同的历史地理与族群迁徙背景；',
  '- 非遗保护、民族学、人类学中涉及布依族的一般性知识；',
  '- 用户对某词、某纹样、某首民歌的延伸追问（文化象征、流传地域、变体等）。',
  '',
  '回答原则：',
  '- 以布依文化为立足点，对有文化关联的延伸问题尽量给出有帮助的解答，而非机械拒绝；',
  '- 仅当问题与布依文化完全无关（如纯编程、实时天气、当日新闻、股市行情、纯闲聊寒暄、违法违规内容）时，才简短说明并礼貌引导回布依文化话题；',
  '- 不要编造无法确认的事实或权威来源，不确定时坦诚说明，可建议用户查阅更专业的资料；',
  '- 使用简体中文回答，语气亲切、专业；',
  '- 回答控制在 800 字以内，信息量较大时用“1. 2. 3.”或“•”分点列出；不要使用 Markdown 星号（*）作为项目符号；分点与段落之间不要输出空行，排版紧凑。',
].join('\n');

/** RAG 检索命中后下发给前端的引用条目 */
export interface CitationItem {
  ref: number;
  id: number;
  type: ContentType;
  buyiText: string;
  zhText: string;
  title: string | null;
  brief: string;
}

// 2-gram 切分后无检索价值的停用片段（疑问词、语气词、高频动词等）
const STOP_WORDS = new Set([
  '什么', '怎么', '怎样', '如何', '为何', '为什', '哪些', '哪个', '是谁', '多少',
  '请问', '一下', '可以', '没有', '是不', '不是', '关于', '介绍', '讲解', '讲讲',
  '告诉', '解释', '意思', '含义', '区别', '特点', '这个', '那个', '这些', '那些',
  '他们', '我们', '你们', '自己', '还有', '以及', '就是', '还是', '表示', '象征',
  '由来', '起源', '来历', '相关', '有关', '属于', '包含', '举例', '说说', '看看',
  '一样', '一些', '非常', '特别', '真的', '需要', '应该', '可能', '已经', '或者',
]);

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
    @InjectRepository(DictionaryEntry)
    private readonly dictionaryRepo: Repository<DictionaryEntry>,
    @InjectRepository(Phrase)
    private readonly phraseRepo: Repository<Phrase>,
    @InjectRepository(Proverb)
    private readonly proverbRepo: Repository<Proverb>,
    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,
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
    onCitations?: (items: CitationItem[]) => void,
  ): Promise<void> {
    // 0. RAG 检索增强：命中则注入参考资料并下发引用；失败降级为纯 API 直调
    // 与布依文化完全无关的问题直接跳过检索，避免无关词条混入引用
    let ragItems: CitationItem[] = [];
    const ragEnabled = this.configService.get('ai.ragEnabled', { infer: true });
    if (ragEnabled && this.isProjectRelated(question)) {
      try {
        ragItems = await this.retrieveContext(question);
      } catch (err) {
        this.logger.warn(`RAG 检索失败，已降级为直连 API: ${err instanceof Error ? err.message : String(err)}`);
        ragItems = [];
      }
    }
    const useRag = ragItems.length > 0;
    if (useRag && onCitations) {
      onCitations(ragItems);
    }

    // 1. 先查缓存（RAG 命中时绕过缓存，保证引用与数据库实时一致）
    const useCache = !useRag && (!history || history.length === 0);
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
      { role: 'system', content: useRag ? this.buildRagPrompt(ragItems) : SYSTEM_PROMPT },
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
          max_tokens: 2048,
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
            if (!useRag) {
              await this.saveCache(question, fullAnswer);
            }
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
      if (!useRag) {
        await this.saveCache(question, fullAnswer);
      }
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
      sentence: `请用布依语"${normalizedWord}"造一个日常例句，给出中文翻译和简要语法说明，150字以内。直接输出纯文本，逐行给出例句、翻译与语法说明，禁止返回 JSON、代码围栏或任何 Markdown 格式。`,
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

  /** 从问题中提取 2-gram 关键词（去标点、滤停用词、去重，上限 12 个） */
  private extractKeywords(question: string): string[] {
    const clean = (question || '').replace(/[\s\?\?!？!。，、；：""''（）\[\]{}·~,.!?;:'"()]/g, '');
    if (clean.length < 2) {
      return [];
    }
    const grams = new Set<string>();
    for (let i = 0; i < clean.length - 1; i += 1) {
      const gram = clean.slice(i, i + 2);
      if (!STOP_WORDS.has(gram)) {
        grams.add(gram);
      }
    }
    return Array.from(grams).slice(0, 12);
  }

  /** 检索 4 张内容表（仅已发布），加权评分取 top 6 作为 RAG 参考资料 */
  private async retrieveContext(question: string): Promise<CitationItem[]> {
    const keywords = this.extractKeywords(question);
    if (!keywords.length) {
      return [];
    }

    const textFields = ['zhText', 'buyiText', 'description', 'culturalNote'];
    const sources = [
      { repo: this.dictionaryRepo as unknown as Repository<Record<string, unknown>>, type: ContentType.DICTIONARY, extraFields: [] as string[] },
      { repo: this.phraseRepo as unknown as Repository<Record<string, unknown>>, type: ContentType.PHRASE, extraFields: [] as string[] },
      { repo: this.proverbRepo as unknown as Repository<Record<string, unknown>>, type: ContentType.PROVERB, extraFields: [] as string[] },
      { repo: this.songRepo as unknown as Repository<Record<string, unknown>>, type: ContentType.SONG, extraFields: ['title', 'artist'] },
    ];

    const scored: Array<{ item: Record<string, unknown>; type: ContentType; score: number }> = [];

    for (const source of sources) {
      const fields = [...textFields, ...source.extraFields];
      const conditions: string[] = [];
      const params: Record<string, unknown> = { isPublished: true };
      keywords.forEach((kw, ki) => {
        fields.forEach((field, fi) => {
          const param = `kw${ki}_${fi}`;
          conditions.push(`item.${field} LIKE :${param}`);
          params[param] = `%${kw}%`;
        });
      });

      const items = await (source.repo as Repository<Record<string, unknown>>)
        .createQueryBuilder('item')
        .where('item.isPublished = :isPublished', { isPublished: true })
        .andWhere(`(${conditions.join(' OR ')})`, params)
        .take(50)
        .getMany();

      for (const item of items) {
        let score = 0;
        for (const kw of keywords) {
          if (String(item.zhText ?? '').includes(kw)) score += 3;
          if (String(item.buyiText ?? '').includes(kw)) score += 3;
          if (String(item.title ?? '').includes(kw)) score += 2;
          if (String(item.artist ?? '').includes(kw)) score += 1;
          if (String(item.description ?? '').includes(kw)) score += 1;
          if (String(item.culturalNote ?? '').includes(kw)) score += 1;
        }
        scored.push({ item, type: source.type, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    // 仅保留强相关命中（正文/布依文/标题命中），过滤仅简介沾边的弱相关条目；最多下发 3 条
    return scored.filter((entry) => entry.score >= 2).slice(0, 3).map((entry, index) => ({
      ref: index + 1,
      id: Number(entry.item.id ?? 0),
      type: entry.type,
      buyiText: String(entry.item.buyiText ?? ''),
      zhText: String(entry.item.zhText ?? ''),
      title: entry.item.title ? String(entry.item.title) : null,
      brief: this.buildBrief(entry.item),
    }));
  }

  /** 组装引用摘要：优先 description/culturalNote，兜底中文释义 */
  private buildBrief(item: Record<string, unknown>): string {
    const parts = [item.description, item.culturalNote]
      .filter(Boolean)
      .map(String)
      .filter((s) => s.trim());
    const text = parts.length ? parts.join(' ') : String(item.zhText ?? item.buyiText ?? '');
    return text.replace(/\s+/g, ' ').slice(0, 80);
  }

  /** 把 SYSTEM_PROMPT 与检索到的参考资料拼成 RAG 增强版 system prompt */
  private buildRagPrompt(items: CitationItem[]): string {
    const typeLabels: Record<string, string> = {
      [ContentType.DICTIONARY]: '词条',
      [ContentType.PHRASE]: '短语',
      [ContentType.PROVERB]: '谚语',
      [ContentType.SONG]: '民歌',
    };
    const lines = items.map((item) => {
      const label = item.title ? `${item.title}（${item.zhText}）` : `${item.buyiText} — ${item.zhText}`;
      return `[${item.ref}] 类型：${typeLabels[item.type] ?? '内容'} | ${label} | 摘要：${item.brief}`;
    });
    return [
      SYSTEM_PROMPT,
      '',
      '【参考资料】以下是从「布依词典」数据库检索到的真实条目，回答时优先采用：',
      ...lines,
      '',
      '【使用规则】',
      '1. 回答优先采用上述资料中的真实内容，保证与词典库一致；',
      '2. 若资料不足以完整回答：先基于资料作答，再以"以下为词典库之外的补充说明"引出通用知识；',
      '3. 资料与问题无关时可忽略资料，正常作答；',
      '4. 回答中不要出现"[1]"这类编号角标，相关内容会由界面以"相关内容"形式自动展示。',
    ].join('\n');
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
