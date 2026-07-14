import { ContentType } from '../../common/enums/content-type.enum';
import { ContentService } from '../content/content.service';
import { SearchQueryDto } from '../content/dto/search-query.dto';
import { MiniappFavoritesService } from '../miniapp-favorites/miniapp-favorites.service';
export declare class MiniappDictionaryController {
    private readonly contentService;
    private readonly favoritesService;
    constructor(contentService: ContentService, favoritesService: MiniappFavoritesService);
    list(query: SearchQueryDto): Promise<{
        items: ({
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
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    listMine(user: {
        sub: number;
    }, query: SearchQueryDto): Promise<{
        items: (({
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
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    detail(id: number): Promise<{
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
}
