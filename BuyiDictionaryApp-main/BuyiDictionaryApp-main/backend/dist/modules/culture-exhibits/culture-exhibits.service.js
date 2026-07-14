"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CultureExhibitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_culture_link_entity_1 = require("../../entities/content-culture-link.entity");
const culture_exhibit_entity_1 = require("../../entities/culture-exhibit.entity");
let CultureExhibitsService = class CultureExhibitsService {
    constructor(exhibitRepository, linkRepository) {
        this.exhibitRepository = exhibitRepository;
        this.linkRepository = linkRepository;
    }
    async getPublishedBySlug(slug) {
        const exhibit = await this.exhibitRepository.findOne({ where: { slug, isPublished: true } });
        if (!exhibit)
            throw new common_1.NotFoundException('未找到已发布的文化展项');
        return this.toDetail(exhibit);
    }
    async findRelatedExhibits(contentType, contentId) {
        const links = await this.linkRepository.find({
            where: { contentType, contentId },
            relations: { exhibit: true },
            order: { sortOrder: 'ASC', id: 'ASC' },
        });
        return links.filter((link) => link.exhibit?.isPublished).map((link) => this.toSummary(link.exhibit));
    }
    async create(payload) {
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
    async update(id, payload) {
        const exhibit = await this.exhibitRepository.findOne({ where: { id } });
        if (!exhibit)
            throw new common_1.NotFoundException('文化展项不存在');
        Object.assign(exhibit, payload);
        return this.exhibitRepository.save(exhibit);
    }
    async remove(id) {
        const exhibit = await this.exhibitRepository.findOne({ where: { id } });
        if (!exhibit)
            throw new common_1.NotFoundException('文化展项不存在');
        await this.exhibitRepository.remove(exhibit);
        return { success: true };
    }
    async createLink(payload) {
        const exhibit = await this.exhibitRepository.findOne({ where: { id: payload.exhibitId } });
        if (!exhibit)
            throw new common_1.NotFoundException('关联的文化展项不存在');
        const existing = await this.linkRepository.findOne({
            where: { contentType: payload.contentType, contentId: payload.contentId, exhibitId: payload.exhibitId },
        });
        if (existing)
            return existing;
        return this.linkRepository.save(this.linkRepository.create({ ...payload, sortOrder: payload.sortOrder ?? 0 }));
    }
    async removeLink(id) {
        const link = await this.linkRepository.findOne({ where: { id } });
        if (!link)
            throw new common_1.NotFoundException('文化关联不存在');
        await this.linkRepository.remove(link);
        return { success: true };
    }
    async listLinks(exhibitId) {
        return this.linkRepository.find({
            where: exhibitId ? { exhibitId } : {},
            relations: { exhibit: true },
            order: { sortOrder: 'ASC', id: 'ASC' },
        });
    }
    toSummary(exhibit) {
        return {
            slug: exhibit.slug,
            title: exhibit.title,
            kicker: exhibit.kicker,
            toneIndex: exhibit.toneIndex,
            featuredSongId: exhibit.featuredSongId,
        };
    }
    toDetail(exhibit) {
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
};
exports.CultureExhibitsService = CultureExhibitsService;
exports.CultureExhibitsService = CultureExhibitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(culture_exhibit_entity_1.CultureExhibit)),
    __param(1, (0, typeorm_1.InjectRepository)(content_culture_link_entity_1.ContentCultureLink)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CultureExhibitsService);
//# sourceMappingURL=culture-exhibits.service.js.map