import { Response } from 'express';
import { MiniappAgentService } from './miniapp-agent.service';
declare class ChatMessageDto {
    role: string;
    content: string;
}
declare class AskDto {
    question: string;
    history?: ChatMessageDto[];
}
export declare class MiniappAgentController {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: MiniappAgentService);
    ask(dto: AskDto, _user: {
        sub: number;
    }, res: Response): Promise<void>;
}
export {};
