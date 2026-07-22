import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { MaskingUtil } from '../security/masking.util';

/**
 * PII 自动脱敏响应拦截器
 * 规范依据：安全项5「手机号、身份证、银行卡等隐私数据接口返回自动脱敏」
 *
 * 扫描响应 data 中的字符串字段，对命中手机号/身份证/银行卡/邮箱格式的自动掩码。
 * 与存储加密独立：存储为密文，读取解密后由本拦截器统一脱敏再返回。
 */
@Injectable()
export class PiiMaskInterceptor implements NestInterceptor {
  private readonly patterns: { test: RegExp; mask: (s: string) => string }[] = [
    { test: /^1[3-9]\d{9}$/, mask: (s) => MaskingUtil.phone(s) || s },
    { test: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, mask: (s) => MaskingUtil.idCard(s) || s },
    { test: /^\d{16,19}$/, mask: (s) => MaskingUtil.bankCard(s) || s },
    { test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, mask: (s) => MaskingUtil.email(s) || s },
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.maskDeep(data)));
  }

  private maskDeep(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return this.maskString(value);
    if (Array.isArray(value)) return value.map((v) => this.maskDeep(v));
    if (typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        // 已显式脱敏字段名约定：phone/idCard/bankCard/email 走字段名强制掩码
        const lower = k.toLowerCase();
        if (typeof v === 'string') {
          if (lower.includes('phone') || lower.includes('mobile')) out[k] = MaskingUtil.phone(v);
          else if (lower.includes('idcard') || lower.includes('idcardno') || lower === 'idno') out[k] = MaskingUtil.idCard(v);
          else if (lower.includes('bankcard') || lower.includes('bankno')) out[k] = MaskingUtil.bankCard(v);
          else if (lower === 'email') out[k] = MaskingUtil.email(v);
          else if (lower.includes('realname') || lower === 'truename') out[k] = MaskingUtil.realName(v);
          else out[k] = this.maskString(v);
        } else {
          out[k] = this.maskDeep(v);
        }
      }
      return out;
    }
    return value;
  }

  private maskString(s: string): string {
    for (const p of this.patterns) {
      if (p.test.test(s)) return p.mask(s);
    }
    return s;
  }
}
