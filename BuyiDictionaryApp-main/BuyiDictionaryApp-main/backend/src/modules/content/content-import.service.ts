import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ContentType } from '../../common/enums/content-type.enum';
import { UploadedMediaFile } from '../media/media.types';
import {
  CanonicalField,
  getContentImportSchema,
  IMPORT_FIELD_LABELS,
  normalizeImportHeaderName,
} from './content-import.schema';

type ImportRow = Record<string, unknown>;
type ParsedWorkbook = { headers: string[]; rows: ImportRow[] };

export type ImportMode = 'create' | 'upsert';

@Injectable()
export class ContentImportService {
  resolveImportMode(mode?: string): ImportMode {
    if (!mode || mode === 'create') {
      return 'create';
    }

    if (mode === 'upsert') {
      return 'upsert';
    }

    throw new BadRequestException('不支持的导入模式');
  }

  resolveSkipDuplicates(skipDuplicates?: string | boolean) {
    if (typeof skipDuplicates === 'boolean') {
      return skipDuplicates;
    }

    // 默认跳过重复（去重），防止同一数据被多次导入
    if (skipDuplicates === undefined || skipDuplicates === null || skipDuplicates === '') {
      return true;
    }

    return ['true', '1', 'yes', 'y', 'on'].includes(String(skipDuplicates).toLowerCase());
  }

  parseWorkbook(file: UploadedMediaFile | undefined): ParsedWorkbook {
    if (!file?.buffer?.length) {
      throw new BadRequestException('请选择 Excel 文件');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('Excel 文件中没有可用工作表');
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      raw: false,
      defval: '',
    });
    const headerRow = rawRows[0] ?? [];
    const headers = headerRow
      .map((item) => String(item ?? '').replace(/^\uFEFF/, '').trim())
      .filter((item) => item.length > 0);

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: '',
      raw: false,
    });

    if (!rows.length) {
      throw new BadRequestException('Excel 文件中没有可导入的数据');
    }

    return { headers, rows };
  }

  buildTemplate(type: ContentType) {
    const schema = getContentImportSchema(type);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(this.getTemplateRows(type), {
      header: schema.orderedFields.map((field) => IMPORT_FIELD_LABELS[field]),
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, schema.sheetName);

    return {
      buffer: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
      filename: schema.filename,
    };
  }

  normalizeRows(type: ContentType, workbook: ParsedWorkbook) {
    const schema = getContentImportSchema(type);
    this.validateHeaders(schema.requiredFields, schema.aliases, workbook.headers);

    const normalized = workbook.rows
      .map((row, index) => this.normalizeRow(type, row, index))
      .filter((row) => row !== null);

    if (!normalized.length) {
      throw new BadRequestException('没有识别到可导入的有效数据');
    }

    return normalized;
  }

  private normalizeRow(type: ContentType, row: ImportRow, index: number) {
    const schema = getContentImportSchema(type);
    const normalizedRow = new Map<string, string>();

    Object.entries(row || {}).forEach(([key, value]) => {
      normalizedRow.set(normalizeImportHeaderName(key), String(value ?? '').trim());
    });

    const read = (field: CanonicalField) => {
      for (const key of schema.aliases[field] || []) {
        const value = normalizedRow.get(normalizeImportHeaderName(key));
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          return String(value).trim();
        }
      }
      return '';
    };

    const rowNumber = index + 2;
    const toBoolean = (value: string, defaultValue = true) => {
      if (!value) {
        return defaultValue;
      }
      return ['true', '1', 'yes', 'y', '是', '已发布'].includes(value.toLowerCase());
    };

    const toNumber = (value: string, defaultValue = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : defaultValue;
    };

    const isEmptyRow = [...normalizedRow.values()].every((value) => String(value ?? '').trim() === '');
    if (isEmptyRow) {
      return null;
    }

    const base = {
      buyiText: read('buyiText'),
      zhText: read('zhText'),
      enText: read('enText'),
      description: read('description'),
      sortOrder: toNumber(read('sortOrder'), 0),
      isPublished: toBoolean(read('isPublished'), true),
    };

    if (type === ContentType.SONG) {
      const item = {
        ...base,
        title: read('title'),
        artist: read('artist'),
        coverUrl: read('coverUrl'),
        audioUrl: read('audioUrl'),
      };
      this.throwIfMissing(rowNumber, item, schema.requiredFields);
      return item;
    }

    if (type === ContentType.DICTIONARY) {
      const item = {
        ...base,
        audioUrl: read('audioUrl'),
      };
      this.throwIfMissing(rowNumber, item, schema.requiredFields);
      return item;
    }

    this.throwIfMissing(rowNumber, base, schema.requiredFields);
    return base;
  }

  private validateHeaders(
    requiredFields: CanonicalField[],
    aliases: Record<CanonicalField, string[]>,
    headers: string[],
  ) {
    const normalizedHeaders = new Set(headers.map((header) => normalizeImportHeaderName(header)));
    const missingFields = requiredFields.filter(
      (field) => !(aliases[field] || []).some((alias) => normalizedHeaders.has(normalizeImportHeaderName(alias))),
    );

    if (missingFields.length) {
      throw new BadRequestException(
        `导入文件缺少必填列：${missingFields.map((field) => IMPORT_FIELD_LABELS[field]).join('、')}`,
      );
    }
  }

  private throwIfMissing(
    rowNumber: number,
    values: Partial<Record<CanonicalField, string | number | boolean>>,
    requiredFields: CanonicalField[],
  ) {
    const missingFields = requiredFields.filter((field) => {
      const value = values[field];
      return value === undefined || value === null || String(value).trim() === '';
    });
    if (missingFields.length) {
      throw new BadRequestException(
        `第 ${rowNumber} 行缺少必填字段：${missingFields.map((field) => IMPORT_FIELD_LABELS[field]).join('、')}`,
      );
    }
  }

  private getTemplateRows(type: ContentType) {
    const schema = getContentImportSchema(type);
    const row: Record<string, string | number> = {};

    schema.orderedFields.forEach((field) => {
      row[IMPORT_FIELD_LABELS[field]] = schema.exampleRow[field] ?? '';
    });

    return [row];
  }
}
