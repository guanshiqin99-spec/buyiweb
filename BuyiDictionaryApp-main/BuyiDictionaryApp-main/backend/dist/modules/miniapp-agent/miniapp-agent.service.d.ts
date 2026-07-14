import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AppConfig } from '../../config/app.config';
import { AgentCache } from '../../entities/agent-cache.entity';
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export declare class MiniappAgentService {
    private readonly configService;
    private readonly cacheRepo;
    private readonly logger;
    constructor(configService: ConfigService<AppConfig, true>, cacheRepo: Repository<AgentCache>);
    isProjectRelated(question: string): boolean;
    isConfigured(): boolean;
    private normalizeKey;
    streamChat(question: string, history: ChatMessage[], onDelta: (chunk: string) => void, onDone: () => void, onError: (err: Error) => void): Promise<void>;
    private saveCache;
    private splitToChunks;
    private sleep;
}
export {};
