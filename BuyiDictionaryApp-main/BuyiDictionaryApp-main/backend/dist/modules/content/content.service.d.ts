import { Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { DictionaryEntry } from '../../entities/dictionary-entry.entity';
import { Phrase } from '../../entities/phrase.entity';
import { Proverb } from '../../entities/proverb.entity';
import { Song } from '../../entities/song.entity';
import { UploadedMediaFile } from '../media/media.types';
import { BaseAdminContentDto, DictionaryAdminDto, SongAdminDto, UpdateBaseAdminContentDto, UpdateDictionaryAdminDto, UpdateSongAdminDto } from './dto/content-admin.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { ContentImportService, ImportMode } from './content-import.service';
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
export declare class ContentService {
    private readonly dictionaryRepository;
    private readonly phraseRepository;
    private readonly proverbRepository;
    private readonly songRepository;
    private readonly contentSortService;
    private readonly contentImportService;
    private readonly cultureExhibitsService;
    constructor(dictionaryRepository: Repository<DictionaryEntry>, phraseRepository: Repository<Phrase>, proverbRepository: Repository<Proverb>, songRepository: Repository<Song>, contentSortService: ContentSortService, contentImportService: ContentImportService, cultureExhibitsService: CultureExhibitsService);
    private getRepository;
    private buildKeywordWhere;
    private listOrder;
    private attachSortKey;
    private normalizeOptionalText;
    private normalizeImportedBase;
    private normalizeImportedDictionary;
    private normalizeImportedSong;
    private buildTextImportKey;
    private buildSongImportKey;
    private findExistingByTextKey;
    private findExistingSongsByKey;
    listPublished(type: ContentType, query: SearchQueryDto): Promise<{
        items: ContentEntity[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getPublishedDetail(type: ContentType, id: number): Promise<ContentEntity>;
    getAdminList(type: ContentType, query: SearchQueryDto): Promise<{
        items: ContentEntity[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getByIds(type: ContentType, ids: number[]): Promise<ContentEntity[]>;
    createDictionary(payload: DictionaryAdminDto): Promise<DictionaryEntry>;
    updateDictionary(id: number, payload: UpdateDictionaryAdminDto): Promise<DictionaryEntry>;
    createSimple(type: ContentType.PHRASE | ContentType.PROVERB, payload: BaseAdminContentDto): Promise<ContentEntity>;
    updateSimple(type: ContentType.PHRASE | ContentType.PROVERB, id: number, payload: UpdateBaseAdminContentDto): Promise<ContentEntity>;
    createSong(payload: SongAdminDto): Promise<Song>;
    updateSong(id: number, payload: UpdateSongAdminDto): Promise<Song>;
    delete(type: ContentType, id: number): Promise<{
        success: boolean;
    }>;
    previewImport(type: ContentType, file: UploadedMediaFile | undefined, mode?: string, skipDuplicates?: string | boolean): Promise<{
        mode: ImportMode;
        skipDuplicates: boolean;
        totalCount: number;
        importedCount: number;
        createdCount: number;
        updatedCount: number;
        skippedCount: number;
        summary: {
            total: number;
            imported: number;
            created: number;
            updated: number;
            skipped: number;
        };
        rows: ImportPreviewRow[];
    }>;
    importContent(type: ContentType, file: UploadedMediaFile | undefined, mode?: string, skipDuplicates?: string | boolean): Promise<{
        mode: ImportMode;
        skipDuplicates: boolean;
        totalCount: number;
        importedCount: number;
        createdCount: number;
        updatedCount: number;
        skippedCount: number;
        summary: {
            total: number;
            imported: number;
            created: number;
            updated: number;
            skipped: number;
        };
        rows: ImportPreviewRow[];
    }>;
    getImportTemplate(type: ContentType): {
        buffer: any;
        filename: string;
    };
    searchAll(query: SearchQueryDto): Promise<{
        dictionary: ({
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            title: string;
            artist: string | null;
            coverUrl: string | null;
            audioUrl: string | null;
            lyrics: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            audioUrl: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        })[];
        phrases: ({
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            title: string;
            artist: string | null;
            coverUrl: string | null;
            audioUrl: string | null;
            lyrics: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            audioUrl: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        })[];
        proverbs: ({
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            title: string;
            artist: string | null;
            coverUrl: string | null;
            audioUrl: string | null;
            lyrics: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            relatedExhibits: {
                slug: string;
                title: string;
                kicker: string;
                toneIndex: number | null;
                featuredSongId: number | null;
            }[];
            audioUrl: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        })[];
        songs: ({
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            title: string;
            artist: string | null;
            coverUrl: string | null;
            audioUrl: string | null;
            lyrics: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            audioUrl: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        })[];
    }>;
    suggestAll(keyword: string): Promise<{
        dictionary: ({
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            title: string;
            artist: string | null;
            coverUrl: string | null;
            audioUrl: string | null;
            lyrics: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            audioUrl: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        })[];
        phrases: ({
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            title: string;
            artist: string | null;
            coverUrl: string | null;
            audioUrl: string | null;
            lyrics: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            audioUrl: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        })[];
        proverbs: ({
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            title: string;
            artist: string | null;
            coverUrl: string | null;
            audioUrl: string | null;
            lyrics: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            audioUrl: string | null;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        })[];
    }>;
    getMiniappHomeData(): Promise<{
        banners: {
            id: number;
            contentType: ContentType;
            title: string;
            subtitle: string;
            image: string | null;
            buyiText: string;
            zhText: string;
        }[];
        suggestions: string[];
    }>;
    serialize(item: ContentEntity, type: ContentType): {
        id: number;
        type: ContentType;
        buyiText: string;
        zhText: string;
        enText: string | null;
        description: string | null;
        culturalNote: string | null;
        zhSortKey: string;
    } | {
        title: string;
        artist: string | null;
        coverUrl: string | null;
        audioUrl: string | null;
        lyrics: string | null;
        id: number;
        type: ContentType;
        buyiText: string;
        zhText: string;
        enText: string | null;
        description: string | null;
        culturalNote: string | null;
        zhSortKey: string;
    } | {
        audioUrl: string | null;
        id: number;
        type: ContentType;
        buyiText: string;
        zhText: string;
        enText: string | null;
        description: string | null;
        culturalNote: string | null;
        zhSortKey: string;
    };
    serializeWithRelatedExhibits(item: ContentEntity, type: ContentType): Promise<{
        relatedExhibits: {
            slug: string;
            title: string;
            kicker: string;
            toneIndex: number | null;
            featuredSongId: number | null;
        }[];
        id: number;
        type: ContentType;
        buyiText: string;
        zhText: string;
        enText: string | null;
        description: string | null;
        culturalNote: string | null;
        zhSortKey: string;
    } | {
        relatedExhibits: {
            slug: string;
            title: string;
            kicker: string;
            toneIndex: number | null;
            featuredSongId: number | null;
        }[];
        title: string;
        artist: string | null;
        coverUrl: string | null;
        audioUrl: string | null;
        lyrics: string | null;
        id: number;
        type: ContentType;
        buyiText: string;
        zhText: string;
        enText: string | null;
        description: string | null;
        culturalNote: string | null;
        zhSortKey: string;
    } | {
        relatedExhibits: {
            slug: string;
            title: string;
            kicker: string;
            toneIndex: number | null;
            featuredSongId: number | null;
        }[];
        audioUrl: string | null;
        id: number;
        type: ContentType;
        buyiText: string;
        zhText: string;
        enText: string | null;
        description: string | null;
        culturalNote: string | null;
        zhSortKey: string;
    }>;
    private serializeImportPlan;
    private buildMiniappSuggestions;
    private executePlan;
    private buildImportPlan;
    private buildDictionaryPlan;
    private buildSimplePlan;
    private buildSongPlan;
    private createImportPlan;
    private pushSkipped;
    private pushImportDecision;
}
export {};
