import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { UploadedMediaFile } from '../media/media.types';
import {
  BaseAdminContentDto,
  DictionaryAdminDto,
  SongAdminDto,
  UpdateBaseAdminContentDto,
  UpdateDictionaryAdminDto,
  UpdateSongAdminDto,
} from './dto/content-admin.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { ContentImportService, ImportMode } from './content-import.service';
import { getContentImportSchema } from './content-import.schema';
import { CultureExhibitsService } from '../culture-exhibits/culture-exhibits.service';
import { ContentSortService } from './content-sort.service';

type ContentEntity = DictionaryEntry | Phrase | Proverb | Song;
type ImportStatus = 'create' | 'update' | 'skip';

type ImportPreviewRow = {
  rowNumber: number;
  status: ImportStatus;
  reason: string;
  key: string;
  buyiText?: string;
  zhText?: string;
  title?: string;
  artist?: string | null;
};

type ImportOperation<TEntity extends ContentEntity> = {
  action: 'create' | 'update';
  payload: DeepPartial<TEntity>;
  existing?: TEntity | null;
  row: ImportPreviewRow;
};

type ImportPlan<TEntity extends ContentEntity> = {
  mode: ImportMode;
  skipDuplicates: boolean;
  totalCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  rows: ImportPreviewRow[];
  operations: Array<ImportOperation<TEntity>>;
};

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(DictionaryEntry)
    private readonly dictionaryRepository: Repository<DictionaryEntry>,
    @InjectRepository(Phrase)
    private readonly phraseRepository: Repository<Phrase>,
    @InjectRepository(Proverb)
    private readonly proverbRepository: Repository<Proverb>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    private readonly contentSortService: ContentSortService,
    private readonly contentImportService: ContentImportService,
    private readonly cultureExhibitsService: CultureExhibitsService,
  ) {}

  private getRepository(type: ContentType): Repository<ContentEntity> {
    switch (type) {
      case ContentType.DICTIONARY:
        return this.dictionaryRepository;
      case ContentType.PHRASE:
        return this.phraseRepository;
      case ContentType.PROVERB:
        return this.proverbRepository;
      case ContentType.SONG:
        return this.songRepository;
      default:
        throw new NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
    }
  }

  private buildKeywordWhere<T extends ContentEntity>(keyword?: string): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
    if (!keyword) {
      return {} as FindOptionsWhere<T>;
    }

    const value = `%${keyword}%`;
    return [
      { buyiText: Like(value) } as FindOptionsWhere<T>,
      { zhText: Like(value) } as FindOptionsWhere<T>,
      { enText: Like(value) } as FindOptionsWhere<T>,
      { description: Like(value) } as FindOptionsWhere<T>,
    ];
  }

  private listOrder() {
    return { sortOrder: 'ASC', zhSortKey: 'ASC', id: 'DESC' } as const;
  }

  private attachSortKey<T extends { zhText: string }>(payload: T) {
    return {
      ...payload,
      zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText),
    };
  }

  private normalizeOptionalText(value: string | null | undefined) {
    const normalized = String(value ?? '').trim();
    return normalized ? normalized : null;
  }

  private normalizeImportedBase(payload: BaseAdminContentDto) {
    return this.attachSortKey({
      ...payload,
      enText: this.normalizeOptionalText(payload.enText),
      description: this.normalizeOptionalText(payload.description),
      isPublished: payload.isPublished ?? true,
      sortOrder: payload.sortOrder ?? 0,
    });
  }

  private normalizeImportedDictionary(payload: DictionaryAdminDto) {
    return {
      ...this.normalizeImportedBase(payload),
      audioUrl: this.normalizeOptionalText(payload.audioUrl),
    };
  }

  private normalizeImportedSong(payload: SongAdminDto) {
    return {
      ...this.normalizeImportedBase(payload),
      title: payload.title.trim(),
      artist: this.normalizeOptionalText(payload.artist),
      coverUrl: this.normalizeOptionalText(payload.coverUrl),
      audioUrl: this.normalizeOptionalText(payload.audioUrl),
    };
  }

  private buildTextImportKey(buyiText: string, zhText: string) {
    return `${String(buyiText || '').trim()}::${String(zhText || '').trim()}`;
  }

  private buildSongImportKey(title: string, artist?: string | null) {
    return `${String(title || '').trim()}::${String(artist || '').trim()}`;
  }

  private async findExistingByTextKey<T extends DictionaryEntry | Phrase | Proverb>(
    repository: Repository<T>,
    items: Array<{ buyiText: string; zhText: string }>,
  ) {
    const uniquePairs = Array.from(
      new Map(
        items.map((item) => [this.buildTextImportKey(item.buyiText, item.zhText), item]),
      ).values(),
    );

    if (!uniquePairs.length) {
      return new Map<string, T>();
    }

    const existingItems = await repository.find({
      where: uniquePairs.map((item) => ({
        buyiText: item.buyiText,
        zhText: item.zhText,
      })) as FindOptionsWhere<T>[],
    });

    return new Map(
      existingItems.map((item) => [this.buildTextImportKey(item.buyiText, item.zhText), item]),
    );
  }

  private async findExistingSongsByKey(items: Array<{ title: string; artist?: string | null }>) {
    const uniqueTitles = Array.from(new Set(items.map((item) => String(item.title || '').trim()).filter(Boolean)));
    if (!uniqueTitles.length) {
      return new Map<string, Song>();
    }

    const existingItems = await this.songRepository.find({
      where: {
        title: In(uniqueTitles),
      },
    });

    const songMap = new Map<string, Song>();
    existingItems.forEach((item) => {
      const key = this.buildSongImportKey(item.title, item.artist);
      if (!songMap.has(key)) {
        songMap.set(key, item);
      }
    });
    return songMap;
  }

  async listPublished(type: ContentType, query: SearchQueryDto) {
    const repository = this.getRepository(type);
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const keywordWhere = this.buildKeywordWhere(query.keyword);

    const [items, total] = await repository.findAndCount({
      where: (
        Array.isArray(keywordWhere)
          ? keywordWhere.map((item) => ({ ...item, isPublished: true }))
          : { ...keywordWhere, isPublished: true }
      ) as FindOptionsWhere<ContentEntity>,
      order: this.listOrder(),
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getPublishedDetail(type: ContentType, id: number): Promise<ContentEntity> {
    const item = await this.getRepository(type).findOne({
      where: { id, isPublished: true } as FindOptionsWhere<ContentEntity>,
    });
    if (!item) {
      throw new NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
    }
    return item;
  }

  async getAdminList(type: ContentType, query: SearchQueryDto) {
    const repository = this.getRepository(type);
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const [items, total] = await repository.findAndCount({
      where: this.buildKeywordWhere(query.keyword) as FindOptionsWhere<ContentEntity>,
      order: this.listOrder(),
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getByIds(type: ContentType, ids: number[]) {
    if (!ids.length) {
      return [];
    }

    return this.getRepository(type).find({
      where: { id: In(ids) } as FindOptionsWhere<ContentEntity>,
      order: this.listOrder(),
    });
  }

  async createDictionary(payload: DictionaryAdminDto) {
    return this.dictionaryRepository.save(this.dictionaryRepository.create(this.attachSortKey(payload)));
  }

  async updateDictionary(id: number, payload: UpdateDictionaryAdminDto) {
    const item = await this.dictionaryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('\u8bcd\u6761\u4e0d\u5b58\u5728');
    }

    Object.assign(item, payload, {
      zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
    });
    return this.dictionaryRepository.save(item);
  }

  async createSimple(type: ContentType.PHRASE | ContentType.PROVERB, payload: BaseAdminContentDto) {
    const repository = this.getRepository(type);
    return repository.save(repository.create(this.attachSortKey(payload)));
  }

  async updateSimple(type: ContentType.PHRASE | ContentType.PROVERB, id: number, payload: UpdateBaseAdminContentDto) {
    const repository = this.getRepository(type);
    const item = await repository.findOne({ where: { id } as FindOptionsWhere<ContentEntity> });
    if (!item) {
      throw new NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
    }

    Object.assign(item, payload, {
      zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
    });
    return repository.save(item);
  }

  async createSong(payload: SongAdminDto) {
    return this.songRepository.save(this.songRepository.create(this.attachSortKey(payload)));
  }

  async updateSong(id: number, payload: UpdateSongAdminDto) {
    const item = await this.songRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('\u6c11\u6b4c\u4e0d\u5b58\u5728');
    }

    Object.assign(item, payload, {
      zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
    });
    return this.songRepository.save(item);
  }

  async delete(type: ContentType, id: number) {
    const repository = this.getRepository(type);
    const item = await repository.findOne({ where: { id } as FindOptionsWhere<ContentEntity> });
    if (!item) {
      throw new NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
    }

    await repository.remove(item);
    return { success: true };
  }

  async previewImport(type: ContentType, file: UploadedMediaFile | undefined, mode?: string, skipDuplicates?: string | boolean) {
    const importMode = this.contentImportService.resolveImportMode(mode);
    const shouldSkipDuplicates = this.contentImportService.resolveSkipDuplicates(skipDuplicates);
    const workbook = this.contentImportService.parseWorkbook(file);
    const normalized = this.contentImportService.normalizeRows(type, workbook);
    const plan = await this.buildImportPlan(type, normalized, importMode, shouldSkipDuplicates);
    return this.serializeImportPlan(plan);
  }

  async importContent(type: ContentType, file: UploadedMediaFile | undefined, mode?: string, skipDuplicates?: string | boolean) {
    const importMode = this.contentImportService.resolveImportMode(mode);
    const shouldSkipDuplicates = this.contentImportService.resolveSkipDuplicates(skipDuplicates);
    const workbook = this.contentImportService.parseWorkbook(file);
    const normalized = this.contentImportService.normalizeRows(type, workbook);
    const plan = await this.buildImportPlan(type, normalized, importMode, shouldSkipDuplicates);

    switch (type) {
      case ContentType.DICTIONARY:
        await this.executePlan(this.dictionaryRepository, plan as ImportPlan<DictionaryEntry>);
        break;
      case ContentType.PHRASE:
        await this.executePlan(this.phraseRepository, plan as ImportPlan<Phrase>);
        break;
      case ContentType.PROVERB:
        await this.executePlan(this.proverbRepository, plan as ImportPlan<Proverb>);
        break;
      case ContentType.SONG:
        await this.executePlan(this.songRepository, plan as ImportPlan<Song>);
        break;
      default:
        throw new NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
    }

    return this.serializeImportPlan(plan);
  }

  getImportTemplate(type: ContentType) {
    return this.contentImportService.buildTemplate(type);
  }

  async searchAll(query: SearchQueryDto) {
    const [dictionary, phrases, proverbs, songs] = await Promise.all([
      this.listPublished(ContentType.DICTIONARY, query),
      this.listPublished(ContentType.PHRASE, query),
      this.listPublished(ContentType.PROVERB, query),
      this.listPublished(ContentType.SONG, query),
    ]);

    return {
      dictionary: await Promise.all(dictionary.items.map((item) => this.serializeWithRelatedExhibits(item, ContentType.DICTIONARY))),
      phrases: await Promise.all(phrases.items.map((item) => this.serializeWithRelatedExhibits(item, ContentType.PHRASE))),
      proverbs: await Promise.all(proverbs.items.map((item) => this.serializeWithRelatedExhibits(item, ContentType.PROVERB))),
      songs: songs.items.map((item) => this.serialize(item, ContentType.SONG)),
      pagination: {
        page: dictionary.page,
        pageSize: dictionary.pageSize,
        total: dictionary.total + phrases.total + proverbs.total + songs.total,
        totalPages: Math.max(dictionary.totalPages, phrases.totalPages, proverbs.totalPages, songs.totalPages),
      },
    };
  }

  async suggestAll(keyword: string) {
    if (!keyword || !keyword.trim()) {
      return { dictionary: [], phrases: [], proverbs: [] };
    }
    
    const kw = `%${keyword.trim()}%`;
    const takeAmount = 5; // Return top 5 suggestions for each category
    
    const queryRepo = async (repo: Repository<any>, type: ContentType) => {
      const items = await repo.createQueryBuilder('item')
        .where('item.isPublished = :isPublished', { isPublished: true })
        .andWhere('(item.zhText LIKE :kw OR item.buyiText LIKE :kw OR item.enText LIKE :kw)', { kw })
        // Prioritize Chinese text matches
        .orderBy('CASE WHEN item.zhText LIKE :kw THEN 1 ELSE 2 END', 'ASC')
        .addOrderBy('item.sortOrder', 'ASC')
        .take(takeAmount)
        .getMany();
      return items.map((item) => this.serialize(item, type));
    };

    const [dictionary, phrases, proverbs] = await Promise.all([
      queryRepo(this.dictionaryRepository, ContentType.DICTIONARY),
      queryRepo(this.phraseRepository, ContentType.PHRASE),
      queryRepo(this.proverbRepository, ContentType.PROVERB),
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
          contentType: ContentType.SONG,
          title: item.title,
          subtitle: item.artist || item.zhText || item.description || '布依语民歌内容',
          image: item.coverUrl,
          buyiText: item.buyiText,
          zhText: item.zhText,
        })),
      suggestions: this.buildMiniappSuggestions([...dictionary, ...phrases, ...proverbs, ...songs]),
    };
  }

  serialize(item: ContentEntity, type: ContentType) {
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

    if (type === ContentType.SONG) {
      const song = item as Song;
      return {
        ...base,
        title: song.title,
        artist: song.artist,
        coverUrl: song.coverUrl,
        audioUrl: song.audioUrl,
        lyrics: song.lyrics,
        duration: song.duration,
      };
    }

    if (type === ContentType.DICTIONARY) {
      const dictionaryEntry = item as DictionaryEntry;
      return {
        ...base,
        audioUrl: dictionaryEntry.audioUrl,
      };
    }

    return base;
  }

  async serializeWithRelatedExhibits(item: ContentEntity, type: ContentType) {
    return {
      ...this.serialize(item, type),
      relatedExhibits: await this.cultureExhibitsService.findRelatedExhibits(type, item.id),
    };
  }

  private serializeImportPlan<TEntity extends ContentEntity>(plan: ImportPlan<TEntity>) {
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

  private buildMiniappSuggestions(items: ContentEntity[], limit = 10) {
    const unique = new Set<string>();
    const suggestions: string[] = [];

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

  private async executePlan<TEntity extends ContentEntity>(repository: Repository<TEntity>, plan: ImportPlan<TEntity>) {
    for (const operation of plan.operations) {
      if (operation.action === 'update' && operation.existing) {
        Object.assign(operation.existing, operation.payload);
        await repository.save(operation.existing);
        continue;
      }

      // INSERT ... ON DUPLICATE KEY UPDATE 防止并发或残留重复导致报错
      try {
        await repository.save(repository.create(operation.payload));
      } catch (error: any) {
        // 重复键错误码 ER_DUP_ENTRY = 1062
        if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
          // 静默跳过：数据库中已存在相同业务键的记录
          continue;
        }
        throw error;
      }
    }
  }

  private async buildImportPlan(
    type: ContentType,
    normalized: Array<BaseAdminContentDto | DictionaryAdminDto | SongAdminDto>,
    mode: ImportMode,
    skipDuplicates: boolean,
  ): Promise<ImportPlan<ContentEntity>> {
    switch (type) {
      case ContentType.DICTIONARY:
        return this.buildDictionaryPlan(normalized as DictionaryAdminDto[], mode, skipDuplicates);
      case ContentType.PHRASE:
        return this.buildSimplePlan(this.phraseRepository, normalized as BaseAdminContentDto[], mode, skipDuplicates);
      case ContentType.PROVERB:
        return this.buildSimplePlan(this.proverbRepository, normalized as BaseAdminContentDto[], mode, skipDuplicates);
      case ContentType.SONG:
        return this.buildSongPlan(normalized as SongAdminDto[], mode, skipDuplicates);
      default:
        throw new NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
    }
  }

  private async buildDictionaryPlan(
    items: DictionaryAdminDto[],
    mode: ImportMode,
    skipDuplicates: boolean,
  ): Promise<ImportPlan<DictionaryEntry>> {
    const plan = this.createImportPlan<DictionaryEntry>(mode, skipDuplicates, items.length);
    const seenKeys = new Set<string>();
    const normalizedItems = items.map((item) => this.normalizeImportedDictionary(item));
    const existingMap = await this.findExistingByTextKey(this.dictionaryRepository, normalizedItems);
    const schema = getContentImportSchema(ContentType.DICTIONARY);

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

  private async buildSimplePlan<T extends Phrase | Proverb>(
    repository: Repository<T>,
    items: BaseAdminContentDto[],
    mode: ImportMode,
    skipDuplicates: boolean,
  ): Promise<ImportPlan<T>> {
    const plan = this.createImportPlan<T>(mode, skipDuplicates, items.length);
    const seenKeys = new Set<string>();
    const normalizedItems = items.map((item) => this.normalizeImportedBase(item) as DeepPartial<T> & { buyiText: string; zhText: string });
    const existingMap = await this.findExistingByTextKey(repository as Repository<Phrase | Proverb>, normalizedItems);
    const schema = getContentImportSchema(repository.metadata.name === 'Phrase' ? ContentType.PHRASE : ContentType.PROVERB);

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

      const existing = existingMap.get(key) as T | undefined;
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

  private async buildSongPlan(items: SongAdminDto[], mode: ImportMode, skipDuplicates: boolean): Promise<ImportPlan<Song>> {
    const plan = this.createImportPlan<Song>(mode, skipDuplicates, items.length);
    const seenKeys = new Set<string>();
    const normalizedItems = items.map((item) => this.normalizeImportedSong(item));
    const existingMap = await this.findExistingSongsByKey(normalizedItems);
    const schema = getContentImportSchema(ContentType.SONG);

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

  private createImportPlan<TEntity extends ContentEntity>(mode: ImportMode, skipDuplicates: boolean, totalCount: number): ImportPlan<TEntity> {
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

  private pushSkipped<TEntity extends ContentEntity>(plan: ImportPlan<TEntity>, row: ImportPreviewRow) {
    plan.skippedCount += 1;
    plan.rows.push(row);
  }

  private pushImportDecision<TEntity extends ContentEntity>(plan: ImportPlan<TEntity>, input: {
    index: number;
    key: string;
    payload: DeepPartial<TEntity> & {
      buyiText?: string;
      zhText?: string;
      title?: string;
      artist?: string | null;
    };
    existing?: TEntity | null;
    mode: ImportMode;
    skipDuplicates: boolean;
  }) {
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

    // create 模式下，无论 skipDuplicates 如何设置，只要已存在就跳过
    // （数据库已有唯一约束，强行插入会报错）
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

}
