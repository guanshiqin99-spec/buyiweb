import { Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { Favorite } from '../../entities/favorite.entity';
import { ContentService } from '../content/content.service';
export declare class MiniappFavoritesService {
    private readonly favoriteRepository;
    private readonly contentService;
    constructor(favoriteRepository: Repository<Favorite>, contentService: ContentService);
    getFavoriteMap(userId: number): Promise<Set<string>>;
    list(userId: number): Promise<{
        dictionary: ({
            isFavorited: boolean;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            isFavorited: boolean;
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
            isFavorited: boolean;
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
            isFavorited: boolean;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            isFavorited: boolean;
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
            isFavorited: boolean;
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
            isFavorited: boolean;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            isFavorited: boolean;
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
            isFavorited: boolean;
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
            isFavorited: boolean;
            id: number;
            type: ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        } | {
            isFavorited: boolean;
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
            isFavorited: boolean;
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
    toggle(userId: number, contentType: ContentType, contentId: number): Promise<{
        isFavorited: boolean;
    }>;
    clear(userId: number): Promise<{
        success: boolean;
        deletedCount: number;
        message: string;
    }>;
    annotate<T extends {
        id: number;
    }>(userId: number, contentType: ContentType, items: T[]): Promise<(T & {
        isFavorited: boolean;
    })[]>;
}
