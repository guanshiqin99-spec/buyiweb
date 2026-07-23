import { CultureExhibit } from './culture-exhibit.entity';
export declare class ContentCultureLink {
    id: number;
    contentType: string;
    contentId: number;
    exhibitId: number;
    sortOrder: number;
    exhibit: CultureExhibit;
}
