import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { MiniappFavoritesService } from './miniapp-favorites.service';
export declare class MiniappFavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: MiniappFavoritesService);
    list(user: {
        sub: number;
    }): Promise<{
        dictionary: ({
            isFavorited: boolean;
            id: number;
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
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
            type: import("../../common/enums/content-type.enum").ContentType;
            buyiText: string;
            zhText: string;
            enText: string | null;
            description: string | null;
            culturalNote: string | null;
            zhSortKey: string;
        })[];
    }>;
    toggle(user: {
        sub: number;
    }, payload: ToggleFavoriteDto): Promise<{
        isFavorited: boolean;
    }>;
    clear(user: {
        sub: number;
    }): Promise<{
        success: boolean;
        deletedCount: number;
        message: string;
    }>;
}
