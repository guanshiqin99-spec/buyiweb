import { Response } from 'express';
import { ContentService } from '../content/content.service';
import { BaseAdminContentDto, UpdateBaseAdminContentDto } from '../content/dto/content-admin.dto';
import { SearchQueryDto } from '../content/dto/search-query.dto';
import { UploadedMediaFile } from '../media/media.types';
export declare class AdminProverbsController {
    private readonly contentService;
    constructor(contentService: ContentService);
    list(query: SearchQueryDto): Promise<{
        items: (import("../../entities/dictionary-entry.entity").DictionaryEntry | import("../../entities/phrase.entity").Phrase | import("../../entities/proverb.entity").Proverb | import("../../entities/song.entity").Song)[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    create(payload: BaseAdminContentDto): Promise<import("../../entities/dictionary-entry.entity").DictionaryEntry | import("../../entities/phrase.entity").Phrase | import("../../entities/proverb.entity").Proverb | import("../../entities/song.entity").Song>;
    template(res: Response): void;
    preview(file: UploadedMediaFile | undefined, mode?: string, skipDuplicates?: string): Promise<{
        mode: import("../content/content-import.service").ImportMode;
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
        rows: {
            rowNumber: number;
            status: "create" | "update" | "skip";
            reason: string;
            key: string;
            buyiText?: string;
            zhText?: string;
            title?: string;
            artist?: string | null;
        }[];
    }>;
    import(file: UploadedMediaFile | undefined, mode?: string, skipDuplicates?: string): Promise<{
        mode: import("../content/content-import.service").ImportMode;
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
        rows: {
            rowNumber: number;
            status: "create" | "update" | "skip";
            reason: string;
            key: string;
            buyiText?: string;
            zhText?: string;
            title?: string;
            artist?: string | null;
        }[];
    }>;
    update(id: number, payload: UpdateBaseAdminContentDto): Promise<import("../../entities/dictionary-entry.entity").DictionaryEntry | import("../../entities/phrase.entity").Phrase | import("../../entities/proverb.entity").Proverb | import("../../entities/song.entity").Song>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
