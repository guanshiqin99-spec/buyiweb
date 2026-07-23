import { ContentType } from '../../common/enums/content-type.enum';
import { ContentService } from '../content/content.service';
import { SearchQueryDto } from '../content/dto/search-query.dto';
export declare class MiniappProverbsController {
    private readonly contentService;
    constructor(contentService: ContentService);
    list(query: SearchQueryDto): Promise<{
        items: (import("../../entities/dictionary-entry.entity").DictionaryEntry | import("../../entities/phrase.entity").Phrase | import("../../entities/proverb.entity").Proverb | import("../../entities/song.entity").Song)[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    detail(id: number): Promise<{
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
    }>;
}
