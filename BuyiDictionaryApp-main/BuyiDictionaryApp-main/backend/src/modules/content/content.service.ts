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

// serialize() 的统一返回类型：各内容类型的可选字段全部置为可选，
// 调用方无需类型收窄即可安全访问（如学习记录里的 title）。
export type SerializedContent = {
  id: number;
  type: ContentType;
  buyiText: string;
  zhText: string;
  enText: string | null;
  description: string | null;
  culturalNote: string | null;
  zhSortKey: string;
  title?: string | null;
  artist?: string | null;
  coverUrl?: string | null;
  audioUrl?: string | null;
  lyrics?: string | null;
  duration?: number | null;
};

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
        throw new NotFoundException('不支持的内容类型');
    }
  }

  private buildKeywordWhere<T extends ContentEntity>(keyword?: string, type?: ContentType): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
    if (!keyword) {
      return {} as FindOptionsWhere<T>;
    }

    const value = `%${keyword}%`;
    // 仅匹配词条本体文本，不把 description（例句/描述）作为搜索条件，
    // 避免例句中的字命中无关词条，与联想接口的匹配范围保持一致
    const base = [
      { buyiText: Like(value) } as FindOptionsWhere<T>,
      { zhText: Like(value) } as FindOptionsWhere<T>,
      { enText: Like(value) } as FindOptionsWhere<T>,
    ];

    // 民歌需额外命中标题与演唱者，否则搜歌名/歌手会空结果
    if (type === ContentType.SONG) {
      return [
        ...base,
        { title: Like(value) } as unknown as FindOptionsWhere<T>,
        { artist: Like(value) } as unknown as FindOptionsWhere<T>,
      ];
    }

    return base;
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
    const keywordWhere = this.buildKeywordWhere(query.keyword, type);

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
      throw new NotFoundException('内容不存在');
    }
    return item;
  }

  async getAdminList(type: ContentType, query: SearchQueryDto) {
    const repository = this.getRepository(type);
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const [items, total] = await repository.findAndCount({
      where: this.buildKeywordWhere(query.keyword, type) as FindOptionsWhere<ContentEntity>,
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
      throw new NotFoundException('词条不存在');
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
      throw new NotFoundException('内容不存在');
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
      throw new NotFoundException('民歌不存在');
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
      throw new NotFoundException('内容不存在');
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
        throw new NotFoundException('不支持的内容类型');
    }

    return this.serializeImportPlan(plan);
  }

  getImportTemplate(type: ContentType) {
    return this.contentImportService.buildTemplate(type);
  }

  async searchAll(query: SearchQueryDto) {
    // 搜索需取全量匹配再做相关性排序，不能用默认分页（否则真正相关的条目可能被截断）
    const searchQuery = { ...query, page: 1, pageSize: 500 };
    const [dictionary, phrases, proverbs, songs] = await Promise.all([
      this.listPublished(ContentType.DICTIONARY, searchQuery),
      this.listPublished(ContentType.PHRASE, searchQuery),
      this.listPublished(ContentType.PROVERB, searchQuery),
      this.listPublished(ContentType.SONG, searchQuery),
    ]);

    const kw = (query.keyword || '').trim();
    const rankedDictionary = this.rankByKeyword(await Promise.all(dictionary.items.map((item) => this.serializeWithRelatedExhibits(item, ContentType.DICTIONARY))), kw);
    const rankedPhrases = this.rankByKeyword(await Promise.all(phrases.items.map((item) => this.serializeWithRelatedExhibits(item, ContentType.PHRASE))), kw);
    const rankedProverbs = this.rankByKeyword(await Promise.all(proverbs.items.map((item) => this.serializeWithRelatedExhibits(item, ContentType.PROVERB))), kw);
    const rankedSongs = this.rankByKeyword(songs.items.map((item) => this.serialize(item, ContentType.SONG)), kw);

    return {
      dictionary: rankedDictionary,
      phrases: rankedPhrases,
      proverbs: rankedProverbs,
      songs: rankedSongs,
      pagination: {
        page: 1,
        pageSize: 500,
        total: rankedDictionary.length + rankedPhrases.length + rankedProverbs.length + rankedSongs.length,
        totalPages: 1,
      },
    };
  }

  // 搜索相关性排序：汉义/标题精确匹配 > 前缀 > 包含 > 布依文 > 英文 > 说明（例句），
  // 避免“例句里碰巧含关键词”的条目排在真正释义之前（如搜“吃”时 xoongh 排在 genl 前）
  private rankByKeyword<T extends { zhText?: string; buyiText?: string; enText?: string | null; description?: string | null; title?: string | null }>(
    items: T[],
    keyword: string,
  ): T[] {
    const kw = keyword.toLowerCase();
    if (!kw) return items;
    const score = (item: T): number => {
      const zh = (item.zhText || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      const buyi = (item.buyiText || '').toLowerCase();
      const en = (item.enText || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      if (zh === kw || (title !== '' && title === kw)) return 0;
      if (zh.startsWith(kw) || (title !== '' && title.startsWith(kw)) || buyi === kw) return 1;
      if (zh.includes(kw) || (title !== '' && title.includes(kw)) || buyi.startsWith(kw)) return 2;
      if (buyi.includes(kw)) return 3;
      if (en.includes(kw)) return 4;
      if (desc.includes(kw)) return 5;
      return 6;
    };
    return [...items].sort((a, b) => score(a) - score(b));
  }

  async suggestAll(keyword: string) {
    if (!keyword || !keyword.trim()) {
      return { dictionary: [], phrases: [], proverbs: [], songs: [] };
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

    // 民歌需额外命中标题与演唱者，否则搜歌名/歌手联想为空
    const querySongRepo = async () => {
      const items = await this.songRepository.createQueryBuilder('item')
        .where('item.isPublished = :isPublished', { isPublished: true })
        .andWhere('(item.zhText LIKE :kw OR item.buyiText LIKE :kw OR item.enText LIKE :kw OR item.title LIKE :kw OR item.artist LIKE :kw)', { kw })
        .orderBy('CASE WHEN item.zhText LIKE :kw THEN 1 ELSE 2 END', 'ASC')
        .addOrderBy('item.sortOrder', 'ASC')
        .take(takeAmount)
        .getMany();
      return items.map((item) => this.serialize(item, ContentType.SONG));
    };

    const [dictionary, phrases, proverbs, songs] = await Promise.all([
      queryRepo(this.dictionaryRepository, ContentType.DICTIONARY),
      queryRepo(this.phraseRepository, ContentType.PHRASE),
      queryRepo(this.proverbRepository, ContentType.PROVERB),
      querySongRepo(),
    ]);

    return { dictionary, phrases, proverbs, songs };
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
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          contentType: ContentType.SONG,
          title: item.title,
          subtitle: item.artist || item.zhText || item.description || '布依语民歌内容',
          image: item.coverUrl,
          buyiText: item.buyiText,
          zhText: item.zhText,
          targetUrl: '/pages/song/index',
        })),
      suggestions: this.buildMiniappSuggestions([...dictionary, ...phrases, ...proverbs, ...songs]),
    };
  }

  serialize(item: ContentEntity, type: ContentType): SerializedContent {
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
        throw new NotFoundException('不支持的内容类型');
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
          reason: '同一文件内存在重复键，已保留首条',
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
          reason: '同一文件内存在重复键，已保留首条',
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
          reason: '同一文件内存在重复键，已保留首条',
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
          reason: '已匹配到现有内容，将覆盖更新',
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
        reason: '数据库中不存在，将新增',
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
        reason: '已检测到重复内容，本次导入已跳过',
      });
      return;
    }

    // create 模式下，无论 skipDuplicates 如何设置，只要已存在就跳过
    // （数据库已有唯一约束，强行插入会报错）
    if (existing) {
      this.pushSkipped(plan, {
        ...row,
        status: 'skip',
        reason: '已检测到重复内容，本次导入已跳过',
      });
      return;
    }

    plan.createdCount += 1;
    plan.rows.push({
      ...row,
      status: 'create',
      reason: '数据库中不存在，将新增',
    });
    plan.operations.push({
      action: 'create',
      payload,
      row: plan.rows[plan.rows.length - 1],
    });
  }

}
