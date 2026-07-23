import { Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { ContentCultureLink } from '../../entities/content-culture-link.entity';
import { CultureExhibit } from '../../entities/culture-exhibit.entity';
import { CreateContentCultureLinkDto, CreateCultureExhibitDto, UpdateCultureExhibitDto } from './dto/culture-exhibit.dto';
export declare class CultureExhibitsService {
    private readonly exhibitRepository;
    private readonly linkRepository;
    constructor(exhibitRepository: Repository<CultureExhibit>, linkRepository: Repository<ContentCultureLink>);
    getPublishedBySlug(slug: string): Promise<{
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
    findRelatedExhibits(contentType: ContentType, contentId: number): Promise<{
        slug: string;
        title: string;
        kicker: string;
        toneIndex: number | null;
        featuredSongId: number | null;
    }[]>;
    create(payload: CreateCultureExhibitDto): Promise<CultureExhibit>;
    listAdmin(): Promise<CultureExhibit[]>;
    update(id: number, payload: UpdateCultureExhibitDto): Promise<CultureExhibit>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    createLink(payload: CreateContentCultureLinkDto): Promise<ContentCultureLink>;
    removeLink(id: number): Promise<{
        success: boolean;
    }>;
    listLinks(exhibitId?: number): Promise<ContentCultureLink[]>;
    toSummary(exhibit: CultureExhibit): {
        slug: string;
        title: string;
        kicker: string;
        toneIndex: number | null;
        featuredSongId: number | null;
    };
    toDetail(exhibit: CultureExhibit): {
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
    };
}
