import { ContentType } from '../../common/enums/content-type.enum';
export type CanonicalField = 'buyiText' | 'zhText' | 'enText' | 'description' | 'sortOrder' | 'isPublished' | 'audioUrl' | 'audioMediaId' | 'title' | 'artist' | 'coverUrl' | 'coverMediaId';
export type ImportIdentity = {
    key: string;
    buyiText?: string;
    zhText?: string;
    title?: string;
    artist?: string | null;
};
export type ImportSchema = {
    type: ContentType;
    sheetName: string;
    filename: string;
    orderedFields: CanonicalField[];
    requiredFields: CanonicalField[];
    aliases: Record<CanonicalField, string[]>;
    buildIdentity: (row: Partial<Record<CanonicalField, string | number | boolean | null>>) => ImportIdentity;
    exampleRow: Record<CanonicalField, string | number>;
};
export declare const IMPORT_FIELD_LABELS: Record<CanonicalField, string>;
export declare const CONTENT_IMPORT_SCHEMAS: Record<ContentType, ImportSchema>;
export declare function getContentImportSchema(type: ContentType): ImportSchema;
export declare function normalizeImportHeaderName(value: string): string;
