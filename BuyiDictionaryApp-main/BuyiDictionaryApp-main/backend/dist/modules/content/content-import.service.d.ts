import { ContentType } from '../../common/enums/content-type.enum';
import { UploadedMediaFile } from '../media/media.types';
type ImportRow = Record<string, unknown>;
type ParsedWorkbook = {
    headers: string[];
    rows: ImportRow[];
};
export type ImportMode = 'create' | 'upsert';
export declare class ContentImportService {
    resolveImportMode(mode?: string): ImportMode;
    resolveSkipDuplicates(skipDuplicates?: string | boolean): boolean;
    parseWorkbook(file: UploadedMediaFile | undefined): ParsedWorkbook;
    buildTemplate(type: ContentType): {
        buffer: any;
        filename: string;
    };
    normalizeRows(type: ContentType, workbook: ParsedWorkbook): {
        buyiText: string;
        zhText: string;
        enText: string;
        description: string;
        sortOrder: number;
        isPublished: boolean;
    }[];
    private normalizeRow;
    private validateHeaders;
    private throwIfMissing;
    private getTemplateRows;
}
export {};
