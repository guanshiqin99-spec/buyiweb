import { Injectable } from '@nestjs/common';
import { pinyin } from 'pinyin-pro';

@Injectable()
export class ContentSortService {
  buildZhSortKey(text?: string | null): string {
    const value = (text || '').trim();
    if (!value) {
      return '';
    }

    const result = pinyin(value, {
      toneType: 'none',
      type: 'array',
      nonZh: 'consecutive',
      v: false,
    });

    const normalized = Array.isArray(result) ? result.join(' ') : String(result);
    return normalized.toLowerCase().replace(/\s+/g, ' ').trim();
  }
}
