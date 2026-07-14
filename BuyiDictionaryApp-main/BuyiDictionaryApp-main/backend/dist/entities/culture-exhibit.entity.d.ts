export declare class CultureExhibit {
    id: number;
    slug: string;
    title: string;
    kicker: string;
    summary: string;
    story: string;
    patternLabel: string;
    toneIndex: number | null;
    featuredSongId: number | null;
    sourceTitle: string;
    sourceUrl: string;
    sourceStatus: 'verified' | 'pending';
    isPublished: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
