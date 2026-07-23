import { ContentService } from '../content/content.service';
export declare class MiniappHomeController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getHomeData(): Promise<{
        banners: {
            id: number;
            contentType: import("../../common/enums/content-type.enum").ContentType;
            title: string;
            subtitle: string;
            image: string | null;
            buyiText: string;
            zhText: string;
        }[];
        suggestions: string[];
    }>;
}
