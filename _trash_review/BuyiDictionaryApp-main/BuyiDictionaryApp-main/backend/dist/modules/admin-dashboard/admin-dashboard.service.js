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
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dictionary_entry_entity_1 = require("../../entities/dictionary-entry.entity");
const favorite_entity_1 = require("../../entities/favorite.entity");
const learning_record_entity_1 = require("../../entities/learning-record.entity");
const phrase_entity_1 = require("../../entities/phrase.entity");
const proverb_entity_1 = require("../../entities/proverb.entity");
const song_entity_1 = require("../../entities/song.entity");
const user_entity_1 = require("../../entities/user.entity");
let AdminDashboardService = class AdminDashboardService {
    constructor(userRepository, dictionaryRepository, phraseRepository, proverbRepository, songRepository, favoriteRepository, learningRecordRepository) {
        this.userRepository = userRepository;
        this.dictionaryRepository = dictionaryRepository;
        this.phraseRepository = phraseRepository;
        this.proverbRepository = proverbRepository;
        this.songRepository = songRepository;
        this.favoriteRepository = favoriteRepository;
        this.learningRecordRepository = learningRecordRepository;
    }
    async getSummary() {
        const [users, dictionary, phrases, proverbs, songs, favorites, learningRecords] = await Promise.all([
            this.userRepository.count(),
            this.dictionaryRepository.count(),
            this.phraseRepository.count(),
            this.proverbRepository.count(),
            this.songRepository.count(),
            this.favoriteRepository.count(),
            this.learningRecordRepository.count(),
        ]);
        const [dictionaryUnpublished, phrasesUnpublished, proverbsUnpublished, songsUnpublished,] = await Promise.all([
            this.dictionaryRepository.count({ where: { isPublished: false } }),
            this.phraseRepository.count({ where: { isPublished: false } }),
            this.proverbRepository.count({ where: { isPublished: false } }),
            this.songRepository.count({ where: { isPublished: false } }),
        ]);
        const totalUnpublished = dictionaryUnpublished + phrasesUnpublished + proverbsUnpublished + songsUnpublished;
        return {
            users,
            content: {
                dictionary,
                phrases,
                proverbs,
                songs,
                total: dictionary + phrases + proverbs + songs,
            },
            unpublished: {
                dictionary: dictionaryUnpublished,
                phrases: phrasesUnpublished,
                proverbs: proverbsUnpublished,
                songs: songsUnpublished,
                total: totalUnpublished,
            },
            favorites,
            learningRecords,
        };
    }
    async batchPublishAll() {
        const results = await Promise.all([
            this.dictionaryRepository
                .createQueryBuilder()
                .update()
                .set({ isPublished: true })
                .where('isPublished = :val', { val: false })
                .execute(),
            this.phraseRepository
                .createQueryBuilder()
                .update()
                .set({ isPublished: true })
                .where('isPublished = :val', { val: false })
                .execute(),
            this.proverbRepository
                .createQueryBuilder()
                .update()
                .set({ isPublished: true })
                .where('isPublished = :val', { val: false })
                .execute(),
            this.songRepository
                .createQueryBuilder()
                .update()
                .set({ isPublished: true })
                .where('isPublished = :val', { val: false })
                .execute(),
        ]);
        const affected = {
            dictionary: results[0].affected ?? 0,
            phrases: results[1].affected ?? 0,
            proverbs: results[2].affected ?? 0,
            songs: results[3].affected ?? 0,
            total: results.reduce((sum, r) => sum + (r.affected ?? 0), 0),
        };
        return { success: true, affected };
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(dictionary_entry_entity_1.DictionaryEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(phrase_entity_1.Phrase)),
    __param(3, (0, typeorm_1.InjectRepository)(proverb_entity_1.Proverb)),
    __param(4, (0, typeorm_1.InjectRepository)(song_entity_1.Song)),
    __param(5, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __param(6, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminDashboardService);
//# sourceMappingURL=admin-dashboard.service.js.map