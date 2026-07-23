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
exports.MiniappLearningRecordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const learning_record_entity_1 = require("../../entities/learning-record.entity");
const content_service_1 = require("../content/content.service");
const learning_stats_1 = require("./learning-stats");
let MiniappLearningRecordsService = class MiniappLearningRecordsService {
    constructor(learningRecordRepository, contentService) {
        this.learningRecordRepository = learningRecordRepository;
        this.contentService = contentService;
    }
    async create(userId, payload) {
        return this.learningRecordRepository.save(this.learningRecordRepository.create({
            userId,
            contentType: payload.contentType,
            contentId: payload.contentId,
            actionType: payload.actionType,
        }));
    }
    async list(userId, page, pageSize) {
        const [items, total] = await this.learningRecordRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        const records = await Promise.all(items.map(async (item) => {
            try {
                const content = await this.contentService.getPublishedDetail(item.contentType, item.contentId);
                return {
                    id: item.id,
                    actionType: item.actionType,
                    createdAt: item.createdAt,
                    content: this.contentService.serialize(content, item.contentType),
                };
            }
            catch {
                return {
                    id: item.id,
                    actionType: item.actionType,
                    createdAt: item.createdAt,
                    content: null,
                };
            }
        }));
        return {
            items: records,
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
            stats: await this.getStats(userId),
        };
    }
    async clear(userId) {
        const result = await this.learningRecordRepository.delete({ userId });
        return {
            success: true,
            deletedCount: result.affected ?? 0,
            message: '\u5df2\u6e05\u7a7a\u5b66\u4e60\u8bb0\u5f55',
        };
    }
    async getStats(userId) {
        const records = await this.learningRecordRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return (0, learning_stats_1.calculateLearningStats)(records);
    }
};
exports.MiniappLearningRecordsService = MiniappLearningRecordsService;
exports.MiniappLearningRecordsService = MiniappLearningRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        content_service_1.ContentService])
], MiniappLearningRecordsService);
//# sourceMappingURL=miniapp-learning-records.service.js.map