import { CultureExhibitsService } from './culture-exhibits.service';
import { CreateContentCultureLinkDto, CreateCultureExhibitDto, UpdateCultureExhibitDto } from './dto/culture-exhibit.dto';
export declare class AdminCultureExhibitsController {
    private readonly cultureExhibitsService;
    constructor(cultureExhibitsService: CultureExhibitsService);
    list(): Promise<import("../../entities/culture-exhibit.entity").CultureExhibit[]>;
    create(payload: CreateCultureExhibitDto): Promise<import("../../entities/culture-exhibit.entity").CultureExhibit>;
    update(id: number, payload: UpdateCultureExhibitDto): Promise<import("../../entities/culture-exhibit.entity").CultureExhibit>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    links(exhibitId?: string): Promise<import("../../entities/content-culture-link.entity").ContentCultureLink[]>;
    createLink(payload: CreateContentCultureLinkDto): Promise<import("../../entities/content-culture-link.entity").ContentCultureLink>;
    removeLink(id: number): Promise<{
        success: boolean;
    }>;
}
