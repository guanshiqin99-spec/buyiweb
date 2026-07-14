import { ContentType } from '../../../common/enums/content-type.enum';
export declare class CreateCultureExhibitDto {
    slug: string;
    title: string;
    kicker?: string;
    summary: string;
    story?: string;
    patternLabel?: string;
    toneIndex?: number | null;
    featuredSongId?: number | null;
    sourceTitle: string;
    sourceUrl: string;
    sourceStatus?: 'verified' | 'pending';
    isPublished?: boolean;
    sortOrder?: number;
}
declare const UpdateCultureExhibitDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCultureExhibitDto>>;
export declare class UpdateCultureExhibitDto extends UpdateCultureExhibitDto_base {
}
export declare class CreateContentCultureLinkDto {
    contentType: ContentType;
    contentId: number;
    exhibitId: number;
    sortOrder?: number;
}
export {};
