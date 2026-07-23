import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MiniappJwtGuard } from '../../common/guards/miniapp-jwt.guard';
import { MiniappAgentService } from './miniapp-agent.service';

class ChatMessageDto {
  @IsString()
  role!: string;

  @IsString()
  content!: string;
}

class AskDto {
  @IsString()
  @MaxLength(500)
  question!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}

type GenerateType = 'sentence' | 'quiz' | 'related';

class GenerateDto {
  @IsString()
  type!: GenerateType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  word?: string;
}

@Controller('miniapp/agent')
export class MiniappAgentController {
  private readonly logger = new Logger(MiniappAgentController.name);

  constructor(private readonly agentService: MiniappAgentService) {}

  /**
   * 智能体问答（SSE 流式）
   * 需登录，硬约束关键词预检 + DeepSeek 流式转发
   */
  @Post('ask')
  @HttpCode(200)
  @UseGuards(MiniappJwtGuard)
  async ask(
    @Body() dto: AskDto,
    @CurrentUser() _user: { sub: number },
    @Res() res: Response,
  ): Promise<void> {
    const question = (dto?.question || '').trim();
    if (!question) {
      throw new BadRequestException('问题不能为空');
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let closed = false;
    const send = (payload: unknown): void => {
      if (closed) return;
      try {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch {
        closed = true;
      }
    };
    const finish = (): void => {
      if (closed) return;
      closed = true;
      try {
        res.end();
      } catch {
        /* noop */
      }
    };

    // 硬约束：关键词预检，不命中直接拒绝（不消耗 token）
    if (!this.agentService.isProjectRelated(question)) {
      send({
        type: 'delta',
        content:
          '抱歉，我是布依文化导览员，只能回答与布依族文化相关的问题（如布依语词汇、声调、民歌、谚语、蜡染、铜鼓、民俗节日等）。请尝试向我提问布依文化相关的内容。',
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

    await this.agentService.streamChat(
      question,
      (dto.history ?? []) as Array<{ role: 'user' | 'assistant'; content: string }>,
      (chunk) => send({ type: 'delta', content: chunk }),
      () => {
        send({ type: 'done' });
        finish();
      },
      (err) => {
        this.logger.error(err.message);
        send({ type: 'error', message: '智能体响应失败，请稍后重试' });
        finish();
      },
    );
  }

  /**
   * AI 内容生成（SSE 流式）
   * 免登录，开放造句、五题挑战和关联词推荐三类任务；已登录则带上身份用于风控审计。
   */
  @Post('generate')
  @HttpCode(200)
  async generate(
    @Body() dto: GenerateDto,
    @Res() res: Response,
  ): Promise<void> {
    const supportedTypes: GenerateType[] = ['sentence', 'quiz', 'related'];
    const type = dto?.type;
    const word = (dto?.word || '').trim();
    if (!supportedTypes.includes(type)) {
      throw new BadRequestException('不支持的生成类型');
    }
    if (type !== 'quiz' && !word) {
      throw new BadRequestException('词语不能为空');
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let closed = false;
    const send = (payload: unknown): void => {
      if (closed) return;
      try {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch {
        closed = true;
      }
    };
    const finish = (): void => {
      if (closed) return;
      closed = true;
      try {
        res.end();
      } catch {
        /* noop */
      }
    };

    if (!this.agentService.isConfigured()) {
      send({ type: 'error', message: '智能体服务暂未配置，请联系管理员' });
      finish();
      return;
    }

    await this.agentService.streamGenerate(
      type,
      word,
      (chunk) => send({ type: 'delta', content: chunk }),
      () => {
        send({ type: 'done' });
        finish();
      },
      (err) => {
        this.logger.error(err.message);
        send({ type: 'error', message: '智能体生成失败，请稍后重试' });
        finish();
      },
    );
  }
}
