"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentImportService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = require("xlsx");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const content_import_schema_1 = require("./content-import.schema");
let ContentImportService = class ContentImportService {
    resolveImportMode(mode) {
        if (!mode || mode === 'create') {
            return 'create';
        }
        if (mode === 'upsert') {
            return 'upsert';
        }
        throw new common_1.BadRequestException('不支持的导入模式');
    }
    resolveSkipDuplicates(skipDuplicates) {
        if (typeof skipDuplicates === 'boolean') {
            return skipDuplicates;
        }
        if (skipDuplicates === undefined || skipDuplicates === null || skipDuplicates === '') {
            return true;
        }
        return ['true', '1', 'yes', 'y', 'on'].includes(String(skipDuplicates).toLowerCase());
    }
    parseWorkbook(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('请选择 Excel 文件');
        }
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new common_1.BadRequestException('Excel 文件中没有可用工作表');
        }
        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: '',
        });
        const headerRow = rawRows[0] ?? [];
        const headers = headerRow
            .map((item) => String(item ?? '').replace(/^\uFEFF/, '').trim())
            .filter((item) => item.length > 0);
        const rows = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: false,
        });
        if (!rows.length) {
            throw new common_1.BadRequestException('Excel 文件中没有可导入的数据');
        }
        return { headers, rows };
    }
    buildTemplate(type) {
        const schema = (0, content_import_schema_1.getContentImportSchema)(type);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(this.getTemplateRows(type), {
            header: schema.orderedFields.map((field) => content_import_schema_1.IMPORT_FIELD_LABELS[field]),
        });
        XLSX.utils.book_append_sheet(workbook, worksheet, schema.sheetName);
        return {
            buffer: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
            filename: schema.filename,
        };
    }
    normalizeRows(type, workbook) {
        const schema = (0, content_import_schema_1.getContentImportSchema)(type);
        this.validateHeaders(schema.requiredFields, schema.aliases, workbook.headers);
        const normalized = workbook.rows
            .map((row, index) => this.normalizeRow(type, row, index))
            .filter((row) => row !== null);
        if (!normalized.length) {
            throw new common_1.BadRequestException('没有识别到可导入的有效数据');
        }
        return normalized;
    }
    normalizeRow(type, row, index) {
        const schema = (0, content_import_schema_1.getContentImportSchema)(type);
        const normalizedRow = new Map();
        Object.entries(row || {}).forEach(([key, value]) => {
            normalizedRow.set((0, content_import_schema_1.normalizeImportHeaderName)(key), String(value ?? '').trim());
        });
        const read = (field) => {
            for (const key of schema.aliases[field] || []) {
                const value = normalizedRow.get((0, content_import_schema_1.normalizeImportHeaderName)(key));
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    return String(value).trim();
                }
            }
            return '';
        };
        const rowNumber = index + 2;
        const toBoolean = (value, defaultValue = true) => {
            if (!value) {
                return defaultValue;
            }
            return ['true', '1', 'yes', 'y', '是', '已发布'].includes(value.toLowerCase());
        };
        const toNumber = (value, defaultValue = 0) => {
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
        if (type === content_type_enum_1.ContentType.SONG) {
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
        if (type === content_type_enum_1.ContentType.DICTIONARY) {
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
    validateHeaders(requiredFields, aliases, headers) {
        const normalizedHeaders = new Set(headers.map((header) => (0, content_import_schema_1.normalizeImportHeaderName)(header)));
        const missingFields = requiredFields.filter((field) => !(aliases[field] || []).some((alias) => normalizedHeaders.has((0, content_import_schema_1.normalizeImportHeaderName)(alias))));
        if (missingFields.length) {
            throw new common_1.BadRequestException(`导入文件缺少必填列：${missingFields.map((field) => content_import_schema_1.IMPORT_FIELD_LABELS[field]).join('、')}`);
        }
    }
    throwIfMissing(rowNumber, values, requiredFields) {
        const missingFields = requiredFields.filter((field) => {
            const value = values[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missingFields.length) {
            throw new common_1.BadRequestException(`第 ${rowNumber} 行缺少必填字段：${missingFields.map((field) => content_import_schema_1.IMPORT_FIELD_LABELS[field]).join('、')}`);
        }
    }
    getTemplateRows(type) {
        const schema = (0, content_import_schema_1.getContentImportSchema)(type);
        const row = {};
        schema.orderedFields.forEach((field) => {
            row[content_import_schema_1.IMPORT_FIELD_LABELS[field]] = schema.exampleRow[field] ?? '';
        });
        return [row];
    }
};
exports.ContentImportService = ContentImportService;
exports.ContentImportService = ContentImportService = __decorate([
    (0, common_1.Injectable)()
], ContentImportService);
//# sourceMappingURL=content-import.service.js.map