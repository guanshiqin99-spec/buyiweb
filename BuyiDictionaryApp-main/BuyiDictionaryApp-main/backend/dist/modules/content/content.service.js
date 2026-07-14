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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const dictionary_entry_entity_1 = require("../../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../../entities/phrase.entity");
const proverb_entity_1 = require("../../entities/proverb.entity");
const song_entity_1 = require("../../entities/song.entity");
const content_import_service_1 = require("./content-import.service");
const content_import_schema_1 = require("./content-import.schema");
const culture_exhibits_service_1 = require("../culture-exhibits/culture-exhibits.service");
const content_sort_service_1 = require("./content-sort.service");
let ContentService = class ContentService {
    constructor(dictionaryRepository, phraseRepository, proverbRepository, songRepository, contentSortService, contentImportService, cultureExhibitsService) {
        this.dictionaryRepository = dictionaryRepository;
        this.phraseRepository = phraseRepository;
        this.proverbRepository = proverbRepository;
        this.songRepository = songRepository;
        this.contentSortService = contentSortService;
        this.contentImportService = contentImportService;
        this.cultureExhibitsService = cultureExhibitsService;
    }
    getRepository(type) {
        switch (type) {
            case content_type_enum_1.ContentType.DICTIONARY:
                return this.dictionaryRepository;
            case content_type_enum_1.ContentType.PHRASE:
                return this.phraseRepository;
            case content_type_enum_1.ContentType.PROVERB:
                return this.proverbRepository;
            case content_type_enum_1.ContentType.SONG:
                return this.songRepository;
            default:
                throw new common_1.NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
        }
    }
    buildKeywordWhere(keyword) {
        if (!keyword) {
            return {};
        }
        const value = `%${keyword}%`;
        return [
            { buyiText: (0, typeorm_2.Like)(value) },
            { zhText: (0, typeorm_2.Like)(value) },
            { enText: (0, typeorm_2.Like)(value) },
            { description: (0, typeorm_2.Like)(value) },
        ];
    }
    listOrder() {
        return { sortOrder: 'ASC', zhSortKey: 'ASC', id: 'DESC' };
    }
    attachSortKey(payload) {
        return {
            ...payload,
            zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText),
        };
    }
    normalizeOptionalText(value) {
        const normalized = String(value ?? '').trim();
        return normalized ? normalized : null;
    }
    normalizeImportedBase(payload) {
        return this.attachSortKey({
            ...payload,
            enText: this.normalizeOptionalText(payload.enText),
            description: this.normalizeOptionalText(payload.description),
            isPublished: payload.isPublished ?? true,
            sortOrder: payload.sortOrder ?? 0,
        });
    }
    normalizeImportedDictionary(payload) {
        return {
            ...this.normalizeImportedBase(payload),
            audioUrl: this.normalizeOptionalText(payload.audioUrl),
        };
    }
    normalizeImportedSong(payload) {
        return {
            ...this.normalizeImportedBase(payload),
            title: payload.title.trim(),
            artist: this.normalizeOptionalText(payload.artist),
            coverUrl: this.normalizeOptionalText(payload.coverUrl),
            audioUrl: this.normalizeOptionalText(payload.audioUrl),
        };
    }
    buildTextImportKey(buyiText, zhText) {
        return `${String(buyiText || '').trim()}::${String(zhText || '').trim()}`;
    }
    buildSongImportKey(title, artist) {
        return `${String(title || '').trim()}::${String(artist || '').trim()}`;
    }
    async findExistingByTextKey(repository, items) {
        const uniquePairs = Array.from(new Map(items.map((item) => [this.buildTextImportKey(item.buyiText, item.zhText), item])).values());
        if (!uniquePairs.length) {
            return new Map();
        }
        const existingItems = await repository.find({
            where: uniquePairs.map((item) => ({
                buyiText: item.buyiText,
                zhText: item.zhText,
            })),
        });
        return new Map(existingItems.map((item) => [this.buildTextImportKey(item.buyiText, item.zhText), item]));
    }
    async findExistingSongsByKey(items) {
        const uniqueTitles = Array.from(new Set(items.map((item) => String(item.title || '').trim()).filter(Boolean)));
        if (!uniqueTitles.length) {
            return new Map();
        }
        const existingItems = await this.songRepository.find({
            where: {
                title: (0, typeorm_2.In)(uniqueTitles),
            },
        });
        const songMap = new Map();
        existingItems.forEach((item) => {
            const key = this.buildSongImportKey(item.title, item.artist);
            if (!songMap.has(key)) {
                songMap.set(key, item);
            }
        });
        return songMap;
    }
    async listPublished(type, query) {
        const repository = this.getRepository(type);
        const page = Number(query.page ?? 1);
        const pageSize = Number(query.pageSize ?? 10);
        const keywordWhere = this.buildKeywordWhere(query.keyword);
        const [items, total] = await repository.findAndCount({
            where: (Array.isArray(keywordWhere)
                ? keywordWhere.map((item) => ({ ...item, isPublished: true }))
                : { ...keywordWhere, isPublished: true }),
            order: this.listOrder(),
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }
    async getPublishedDetail(type, id) {
        const item = await this.getRepository(type).findOne({
            where: { id, isPublished: true },
        });
        if (!item) {
            throw new common_1.NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
        }
        return item;
    }
    async getAdminList(type, query) {
        const repository = this.getRepository(type);
        const page = Number(query.page ?? 1);
        const pageSize = Number(query.pageSize ?? 10);
        const [items, total] = await repository.findAndCount({
            where: this.buildKeywordWhere(query.keyword),
            order: this.listOrder(),
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }
    async getByIds(type, ids) {
        if (!ids.length) {
            return [];
        }
        return this.getRepository(type).find({
            where: { id: (0, typeorm_2.In)(ids) },
            order: this.listOrder(),
        });
    }
    async createDictionary(payload) {
        return this.dictionaryRepository.save(this.dictionaryRepository.create(this.attachSortKey(payload)));
    }
    async updateDictionary(id, payload) {
        const item = await this.dictionaryRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('\u8bcd\u6761\u4e0d\u5b58\u5728');
        }
        Object.assign(item, payload, {
            zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
        });
        return this.dictionaryRepository.save(item);
    }
    async createSimple(type, payload) {
        const repository = this.getRepository(type);
        return repository.save(repository.create(this.attachSortKey(payload)));
    }
    async updateSimple(type, id, payload) {
        const repository = this.getRepository(type);
        const item = await repository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
        }
        Object.assign(item, payload, {
            zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
        });
        return repository.save(item);
    }
    async createSong(payload) {
        return this.songRepository.save(this.songRepository.create(this.attachSortKey(payload)));
    }
    async updateSong(id, payload) {
        const item = await this.songRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('\u6c11\u6b4c\u4e0d\u5b58\u5728');
        }
        Object.assign(item, payload, {
            zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
        });
        return this.songRepository.save(item);
    }
    async delete(type, id) {
        const repository = this.getRepository(type);
        const item = await repository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
        }
        await repository.remove(item);
        return { success: true };
    }
    async previewImport(type, file, mode, skipDuplicates) {
        const importMode = this.contentImportService.resolveImportMode(mode);
        const shouldSkipDuplicates = this.contentImportService.resolveSkipDuplicates(skipDuplicates);
        const workbook = this.contentImportService.parseWorkbook(file);
        const normalized = this.contentImportService.normalizeRows(type, workbook);
        const plan = await this.buildImportPlan(type, normalized, importMode, shouldSkipDuplicates);
        return this.serializeImportPlan(plan);
    }
    async importContent(type, file, mode, skipDuplicates) {
        const importMode = this.contentImportService.resolveImportMode(mode);
        const shouldSkipDuplicates = this.contentImportService.resolveSkipDuplicates(skipDuplicates);
        const workbook = this.contentImportService.parseWorkbook(file);
        const normalized = this.contentImportService.normalizeRows(type, workbook);
        const plan = await this.buildImportPlan(type, normalized, importMode, shouldSkipDuplicates);
        switch (type) {
            case content_type_enum_1.ContentType.DICTIONARY:
                await this.executePlan(this.dictionaryRepository, plan);
                break;
            case content_type_enum_1.ContentType.PHRASE:
                await this.executePlan(this.phraseRepository, plan);
                break;
            case content_type_enum_1.ContentType.PROVERB:
                await this.executePlan(this.proverbRepository, plan);
                break;
            case content_type_enum_1.ContentType.SONG:
                await this.executePlan(this.songRepository, plan);
                break;
            default:
                throw new common_1.NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
        }
        return this.serializeImportPlan(plan);
    }
    getImportTemplate(type) {
        return this.contentImportService.buildTemplate(type);
    }
    async searchAll(query) {
        const [dictionary, phrases, proverbs, songs] = await Promise.all([
            this.listPublished(content_type_enum_1.ContentType.DICTIONARY, query),
            this.listPublished(content_type_enum_1.ContentType.PHRASE, query),
            this.listPublished(content_type_enum_1.ContentType.PROVERB, query),
            this.listPublished(content_type_enum_1.ContentType.SONG, query),
        ]);
        return {
            dictionary: await Promise.all(dictionary.items.map((item) => this.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.DICTIONARY))),
            phrases: await Promise.all(phrases.items.map((item) => this.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.PHRASE))),
            proverbs: await Promise.all(proverbs.items.map((item) => this.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.PROVERB))),
            songs: songs.items.map((item) => this.serialize(item, content_type_enum_1.ContentType.SONG)),
        };
    }
    async suggestAll(keyword) {
        if (!keyword || !keyword.trim()) {
            return { dictionary: [], phrases: [], proverbs: [] };
        }
        const kw = `%${keyword.trim()}%`;
        const takeAmount = 5;
        const queryRepo = async (repo, type) => {
            const items = await repo.createQueryBuilder('item')
                .where('item.isPublished = :isPublished', { isPublished: true })
                .andWhere('(item.zhText LIKE :kw OR item.buyiText LIKE :kw OR item.enText LIKE :kw)', { kw })
                .orderBy('CASE WHEN item.zhText LIKE :kw THEN 1 ELSE 2 END', 'ASC')
                .addOrderBy('item.sortOrder', 'ASC')
                .take(takeAmount)
                .getMany();
            return items.map((item) => this.serialize(item, type));
        };
        const [dictionary, phrases, proverbs] = await Promise.all([
            queryRepo(this.dictionaryRepository, content_type_enum_1.ContentType.DICTIONARY),
            queryRepo(this.phraseRepository, content_type_enum_1.ContentType.PHRASE),
            queryRepo(this.proverbRepository, content_type_enum_1.ContentType.PROVERB),
        ]);
        return { dictionary, phrases, proverbs };
    }
    async getMiniappHomeData() {
        const [dictionary, phrases, proverbs, songs] = await Promise.all([
            this.dictionaryRepository.find({
                where: { isPublished: true },
                order: this.listOrder(),
                take: 8,
            }),
            this.phraseRepository.find({
                where: { isPublished: true },
                order: this.listOrder(),
                take: 8,
            }),
            this.proverbRepository.find({
                where: { isPublished: true },
                order: this.listOrder(),
                take: 8,
            }),
            this.songRepository.find({
                where: { isPublished: true },
                order: this.listOrder(),
                take: 12,
            }),
        ]);
        return {
            banners: songs
                .filter((item) => !!item.coverUrl)
                .slice(0, 5)
                .map((item) => ({
                id: item.id,
                contentType: content_type_enum_1.ContentType.SONG,
                title: item.title,
                subtitle: item.artist || item.zhText || item.description || '布依语民歌内容',
                image: item.coverUrl,
                buyiText: item.buyiText,
                zhText: item.zhText,
            })),
            suggestions: this.buildMiniappSuggestions([...dictionary, ...phrases, ...proverbs, ...songs]),
        };
    }
    serialize(item, type) {
        const base = {
            id: item.id,
            type,
            buyiText: item.buyiText,
            zhText: item.zhText,
            enText: item.enText,
            description: item.description,
            culturalNote: item.culturalNote,
            zhSortKey: item.zhSortKey,
        };
        if (type === content_type_enum_1.ContentType.SONG) {
            const song = item;
            return {
                ...base,
                title: song.title,
                artist: song.artist,
                coverUrl: song.coverUrl,
                audioUrl: song.audioUrl,
                lyrics: song.lyrics,
            };
        }
        if (type === content_type_enum_1.ContentType.DICTIONARY) {
            const dictionaryEntry = item;
            return {
                ...base,
                audioUrl: dictionaryEntry.audioUrl,
            };
        }
        return base;
    }
    async serializeWithRelatedExhibits(item, type) {
        return {
            ...this.serialize(item, type),
            relatedExhibits: await this.cultureExhibitsService.findRelatedExhibits(type, item.id),
        };
    }
    serializeImportPlan(plan) {
        return {
            mode: plan.mode,
            skipDuplicates: plan.skipDuplicates,
            totalCount: plan.totalCount,
            importedCount: plan.createdCount + plan.updatedCount,
            createdCount: plan.createdCount,
            updatedCount: plan.updatedCount,
            skippedCount: plan.skippedCount,
            summary: {
                total: plan.totalCount,
                imported: plan.createdCount + plan.updatedCount,
                created: plan.createdCount,
                updated: plan.updatedCount,
                skipped: plan.skippedCount,
            },
            rows: plan.rows,
        };
    }
    buildMiniappSuggestions(items, limit = 10) {
        const unique = new Set();
        const suggestions = [];
        items.forEach((item) => {
            const candidates = [
                item.buyiText,
                item.zhText,
                item.enText,
                item.description,
                'title' in item ? item.title : '',
                'artist' in item ? item.artist : '',
            ];
            candidates
                .map((value) => String(value ?? '').trim())
                .filter((value) => value.length >= 2)
                .forEach((value) => {
                const key = value.toLowerCase();
                if (unique.has(key) || suggestions.length >= limit) {
                    return;
                }
                unique.add(key);
                suggestions.push(value);
            });
        });
        return suggestions.slice(0, limit);
    }
    async executePlan(repository, plan) {
        for (const operation of plan.operations) {
            if (operation.action === 'update' && operation.existing) {
                Object.assign(operation.existing, operation.payload);
                await repository.save(operation.existing);
                continue;
            }
            try {
                await repository.save(repository.create(operation.payload));
            }
            catch (error) {
                if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
                    continue;
                }
                throw error;
            }
        }
    }
    async buildImportPlan(type, normalized, mode, skipDuplicates) {
        switch (type) {
            case content_type_enum_1.ContentType.DICTIONARY:
                return this.buildDictionaryPlan(normalized, mode, skipDuplicates);
            case content_type_enum_1.ContentType.PHRASE:
                return this.buildSimplePlan(this.phraseRepository, normalized, mode, skipDuplicates);
            case content_type_enum_1.ContentType.PROVERB:
                return this.buildSimplePlan(this.proverbRepository, normalized, mode, skipDuplicates);
            case content_type_enum_1.ContentType.SONG:
                return this.buildSongPlan(normalized, mode, skipDuplicates);
            default:
                throw new common_1.NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
        }
    }
    async buildDictionaryPlan(items, mode, skipDuplicates) {
        const plan = this.createImportPlan(mode, skipDuplicates, items.length);
        const seenKeys = new Set();
        const normalizedItems = items.map((item) => this.normalizeImportedDictionary(item));
        const existingMap = await this.findExistingByTextKey(this.dictionaryRepository, normalizedItems);
        const schema = (0, content_import_schema_1.getContentImportSchema)(content_type_enum_1.ContentType.DICTIONARY);
        for (const [index, payload] of normalizedItems.entries()) {
            const preview = schema.buildIdentity(payload);
            const key = preview.key;
            if (seenKeys.has(key)) {
                this.pushSkipped(plan, {
                    rowNumber: index + 2,
                    status: 'skip',
                    reason: '\u540c\u4e00\u6587\u4ef6\u5185\u5b58\u5728\u91cd\u590d\u952e\uff0c\u5df2\u4fdd\u7559\u9996\u6761',
                    ...preview,
                });
                continue;
            }
            seenKeys.add(key);
            const existing = existingMap.get(key);
            this.pushImportDecision(plan, {
                index,
                key,
                payload,
                existing,
                mode,
                skipDuplicates,
            });
        }
        return plan;
    }
    async buildSimplePlan(repository, items, mode, skipDuplicates) {
        const plan = this.createImportPlan(mode, skipDuplicates, items.length);
        const seenKeys = new Set();
        const normalizedItems = items.map((item) => this.normalizeImportedBase(item));
        const existingMap = await this.findExistingByTextKey(repository, normalizedItems);
        const schema = (0, content_import_schema_1.getContentImportSchema)(repository.metadata.name === 'Phrase' ? content_type_enum_1.ContentType.PHRASE : content_type_enum_1.ContentType.PROVERB);
        for (const [index, payload] of normalizedItems.entries()) {
            const preview = schema.buildIdentity(payload);
            const key = preview.key;
            if (seenKeys.has(key)) {
                this.pushSkipped(plan, {
                    rowNumber: index + 2,
                    status: 'skip',
                    reason: '\u540c\u4e00\u6587\u4ef6\u5185\u5b58\u5728\u91cd\u590d\u952e\uff0c\u5df2\u4fdd\u7559\u9996\u6761',
                    ...preview,
                });
                continue;
            }
            seenKeys.add(key);
            const existing = existingMap.get(key);
            this.pushImportDecision(plan, {
                index,
                key,
                payload,
                existing,
                mode,
                skipDuplicates,
            });
        }
        return plan;
    }
    async buildSongPlan(items, mode, skipDuplicates) {
        const plan = this.createImportPlan(mode, skipDuplicates, items.length);
        const seenKeys = new Set();
        const normalizedItems = items.map((item) => this.normalizeImportedSong(item));
        const existingMap = await this.findExistingSongsByKey(normalizedItems);
        const schema = (0, content_import_schema_1.getContentImportSchema)(content_type_enum_1.ContentType.SONG);
        for (const [index, payload] of normalizedItems.entries()) {
            const preview = schema.buildIdentity(payload);
            const key = preview.key;
            if (seenKeys.has(key)) {
                this.pushSkipped(plan, {
                    rowNumber: index + 2,
                    status: 'skip',
                    reason: '\u540c\u4e00\u6587\u4ef6\u5185\u5b58\u5728\u91cd\u590d\u952e\uff0c\u5df2\u4fdd\u7559\u9996\u6761',
                    ...preview,
                });
                continue;
            }
            seenKeys.add(key);
            const existing = existingMap.get(key);
            this.pushImportDecision(plan, {
                index,
                key,
                payload,
                existing,
                mode,
                skipDuplicates,
            });
        }
        return plan;
    }
    createImportPlan(mode, skipDuplicates, totalCount) {
        return {
            mode,
            skipDuplicates,
            totalCount,
            createdCount: 0,
            updatedCount: 0,
            skippedCount: 0,
            rows: [],
            operations: [],
        };
    }
    pushSkipped(plan, row) {
        plan.skippedCount += 1;
        plan.rows.push(row);
    }
    pushImportDecision(plan, input) {
        const { index, key, payload, existing, mode, skipDuplicates } = input;
        const row = {
            rowNumber: index + 2,
            key,
            buyiText: payload.buyiText,
            zhText: payload.zhText,
            title: payload.title,
            artist: payload.artist ?? null,
        };
        if (mode === 'upsert') {
            if (existing) {
                plan.updatedCount += 1;
                plan.rows.push({
                    ...row,
                    status: 'update',
                    reason: '\u5df2\u5339\u914d\u5230\u73b0\u6709\u5185\u5bb9\uff0c\u5c06\u8986\u76d6\u66f4\u65b0',
                });
                plan.operations.push({
                    action: 'update',
                    payload,
                    existing,
                    row: plan.rows[plan.rows.length - 1],
                });
                return;
            }
            plan.createdCount += 1;
            plan.rows.push({
                ...row,
                status: 'create',
                reason: '\u6570\u636e\u5e93\u4e2d\u4e0d\u5b58\u5728\uff0c\u5c06\u65b0\u589e',
            });
            plan.operations.push({
                action: 'create',
                payload,
                row: plan.rows[plan.rows.length - 1],
            });
            return;
        }
        if (existing && skipDuplicates) {
            this.pushSkipped(plan, {
                ...row,
                status: 'skip',
                reason: '\u5df2\u68c0\u6d4b\u5230\u91cd\u590d\u5185\u5bb9\uff0c\u672c\u6b21\u5bfc\u5165\u5df2\u8df3\u8fc7',
            });
            return;
        }
        if (existing) {
            this.pushSkipped(plan, {
                ...row,
                status: 'skip',
                reason: '\u5df2\u68c0\u6d4b\u5230\u91cd\u590d\u5185\u5bb9\uff0c\u672c\u6b21\u5bfc\u5165\u5df2\u8df3\u8fc7',
            });
            return;
        }
        plan.createdCount += 1;
        plan.rows.push({
            ...row,
            status: 'create',
            reason: '\u6570\u636e\u5e93\u4e2d\u4e0d\u5b58\u5728\uff0c\u5c06\u65b0\u589e',
        });
        plan.operations.push({
            action: 'create',
            payload,
            row: plan.rows[plan.rows.length - 1],
        });
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dictionary_entry_entity_1.DictionaryEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(phrase_entity_1.Phrase)),
    __param(2, (0, typeorm_1.InjectRepository)(proverb_entity_1.Proverb)),
    __param(3, (0, typeorm_1.InjectRepository)(song_entity_1.Song)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        content_sort_service_1.ContentSortService,
        content_import_service_1.ContentImportService,
        culture_exhibits_service_1.CultureExhibitsService])
], ContentService);
//# sourceMappingURL=content.service.js.map