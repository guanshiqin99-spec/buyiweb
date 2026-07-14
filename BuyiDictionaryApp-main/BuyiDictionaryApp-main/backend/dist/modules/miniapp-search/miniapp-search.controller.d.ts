import { Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { LearningRecord } from '../../entities/learning-record.entity';
import { ContentService } from '../content/content.service';
import { SearchQueryDto } from '../content/dto/search-query.dto';
import { MiniappFavoritesService } from '../miniapp-favorites/miniapp-favorites.service';
export declare class MiniappSearchController {
    private readonly contentService;
    private readonly favoritesService;
    private readonly learningRecordRepository;
    constructor(contentService: ContentService, favoritesService: MiniappFavoritesService, learningRecordRepository: Repository<LearningRecord>);
    searchPublic(query: SearchQueryDto): Promise<{
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
    suggestPublic(keyword: string): Promise<{
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
    hot(): Promise<{
        items: ({
            keyword: string;
            contentType: ContentType;
            contentId: number;
            count: number;
        } | null)[];
    }>;
    searchMine(user: {
        sub: number;
    }, query: SearchQueryDto): Promise<{
        dictionary: (({
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
        }) & {
            isFavorited: boolean;
        })[];
        phrases: (({
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
        }) & {
            isFavorited: boolean;
        })[];
        proverbs: (({
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
        }) & {
            isFavorited: boolean;
        })[];
        songs: (({
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
        }) & {
            isFavorited: boolean;
        })[];
    }>;
}
