import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { ContentCultureLink } from '../../entities/content-culture-link.entity';
import { CultureExhibit } from '../../entities/culture-exhibit.entity';
import { CreateContentCultureLinkDto, CreateCultureExhibitDto, UpdateCultureExhibitDto } from './dto/culture-exhibit.dto';

@Injectable()
export class CultureExhibitsService {
  constructor(
    @InjectRepository(CultureExhibit)
    private readonly exhibitRepository: Repository<CultureExhibit>,
    @InjectRepository(ContentCultureLink)
    private readonly linkRepository: Repository<ContentCultureLink>,
  ) {}

  async getPublishedBySlug(slug: string) {
    const exhibit = await this.exhibitRepository.findOne({ where: { slug, isPublished: true } });
    if (!exhibit) throw new NotFoundException('未找到已发布的文化展项');
    return this.toDetail(exhibit);
  }

  async findRelatedExhibits(contentType: ContentType, contentId: number) {
    const links = await this.linkRepository.find({
      where: { contentType, contentId },
      relations: { exhibit: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return links.filter((link) => link.exhibit?.isPublished).map((link) => this.toSummary(link.exhibit));
  }

  async create(payload: CreateCultureExhibitDto) {
    return this.exhibitRepository.save(this.exhibitRepository.create({
      ...payload,
      kicker: payload.kicker?.trim() ?? '',
      story: payload.story?.trim() ?? '',
      patternLabel: payload.patternLabel?.trim() ?? '',
      sourceStatus: payload.sourceStatus ?? 'verified',
      isPublished: payload.isPublished ?? true,
      sortOrder: payload.sortOrder ?? 0,
    }));
  }

  async listAdmin() {
    return this.exhibitRepository.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async update(id: number, payload: UpdateCultureExhibitDto) {
    const exhibit = await this.exhibitRepository.findOne({ where: { id } });
    if (!exhibit) throw new NotFoundException('文化展项不存在');
    Object.assign(exhibit, payload);
    return this.exhibitRepository.save(exhibit);
  }

  async remove(id: number) {
    const exhibit = await this.exhibitRepository.findOne({ where: { id } });
    if (!exhibit) throw new NotFoundException('文化展项不存在');
    await this.exhibitRepository.remove(exhibit);
    return { success: true };
  }

  async createLink(payload: CreateContentCultureLinkDto) {
    const exhibit = await this.exhibitRepository.findOne({ where: { id: payload.exhibitId } });
    if (!exhibit) throw new NotFoundException('关联的文化展项不存在');
    const existing = await this.linkRepository.findOne({
      where: { contentType: payload.contentType, contentId: payload.contentId, exhibitId: payload.exhibitId },
    });
    if (existing) return existing;
    return this.linkRepository.save(this.linkRepository.create({ ...payload, sortOrder: payload.sortOrder ?? 0 }));
  }

  async removeLink(id: number) {
    const link = await this.linkRepository.findOne({ where: { id } });
    if (!link) throw new NotFoundException('文化关联不存在');
    await this.linkRepository.remove(link);
    return { success: true };
  }

  async listLinks(exhibitId?: number) {
    return this.linkRepository.find({
      where: exhibitId ? { exhibitId } : {},
      relations: { exhibit: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  toSummary(exhibit: CultureExhibit) {
    return {
      slug: exhibit.slug,
      title: exhibit.title,
      kicker: exhibit.kicker,
      toneIndex: exhibit.toneIndex,
      featuredSongId: exhibit.featuredSongId,
    };
  }

  toDetail(exhibit: CultureExhibit) {
    return {
      ...this.toSummary(exhibit),
      summary: exhibit.summary,
      story: exhibit.story,
      patternLabel: exhibit.patternLabel,
      sourceTitle: exhibit.sourceTitle,
      sourceUrl: exhibit.sourceUrl,
      sourceStatus: exhibit.sourceStatus,
      updatedAt: exhibit.updatedAt,
    };
  }
}
