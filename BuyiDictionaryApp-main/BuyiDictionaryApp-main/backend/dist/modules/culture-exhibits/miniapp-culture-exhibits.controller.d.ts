import { CultureExhibitsService } from './culture-exhibits.service';
export declare class MiniappCultureExhibitsController {
    private readonly cultureExhibitsService;
    constructor(cultureExhibitsService: CultureExhibitsService);
    detail(slug: string): Promise<{
        summary: string;
        story: string;
        patternLabel: string;
        sourceTitle: string;
        sourceUrl: string;
        sourceStatus: "verified" | "pending";
        updatedAt: Date;
        slug: string;
        title: string;
        kicker: string;
        toneIndex: number | null;
        featuredSongId: number | null;
    }>;
}
