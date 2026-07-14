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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcryptjs");
const typeorm_2 = require("typeorm");
const admin_role_enum_1 = require("../../common/enums/admin-role.enum");
const runtime_validation_1 = require("../../config/runtime-validation");
const admin_entity_1 = require("../../entities/admin.entity");
const dictionary_entry_entity_1 = require("../../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../../entities/phrase.entity");
const proverb_entity_1 = require("../../entities/proverb.entity");
const song_entity_1 = require("../../entities/song.entity");
const culture_exhibit_entity_1 = require("../../entities/culture-exhibit.entity");
const content_culture_link_entity_1 = require("../../entities/content-culture-link.entity");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
let SeedService = SeedService_1 = class SeedService {
    constructor(configService, adminRepository, dictionaryRepository, phraseRepository, proverbRepository, songRepository, cultureExhibitRepository, cultureLinkRepository) {
        this.configService = configService;
        this.adminRepository = adminRepository;
        this.dictionaryRepository = dictionaryRepository;
        this.phraseRepository = phraseRepository;
        this.proverbRepository = proverbRepository;
        this.songRepository = songRepository;
        this.cultureExhibitRepository = cultureExhibitRepository;
        this.cultureLinkRepository = cultureLinkRepository;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onApplicationBootstrap() {
        const enabled = this.configService.get('seed.onBoot', true);
        if (!enabled) {
            return;
        }
        await this.seedAdmin();
        await this.seedContent();
        await this.seedCultureExhibits();
    }
    async seedAdmin() {
        if ((0, runtime_validation_1.isProductionEnvironment)(process.env)) {
            return;
        }
        const username = this.configService.get('seed.adminUsername', 'admin');
        const password = this.configService.get('seed.adminPassword', 'Admin@123456');
        const existing = await this.adminRepository.findOne({ where: { username } });
        if (existing) {
            return;
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await this.adminRepository.save(this.adminRepository.create({
            username,
            passwordHash,
            role: admin_role_enum_1.AdminRole.SUPER_ADMIN,
        }));
        this.logger.log(`Seeded default admin account: ${username}`);
    }
    async seedContent() {
        if ((0, runtime_validation_1.isProductionEnvironment)(process.env)) {
            return;
        }
        if ((await this.dictionaryRepository.count()) === 0) {
            await this.dictionaryRepository.save([
                this.dictionaryRepository.create({
                    buyiText: 'noi',
                    zhText: '\u4f60\u597d',
                    zhSortKey: 'ni hao',
                    enText: 'Hello',
                    description: '\u57fa\u7840\u95ee\u5019\u8bed',
                    isPublished: true,
                    sortOrder: 1,
                }),
                this.dictionaryRepository.create({
                    buyiText: 'do',
                    zhText: '\u7238\u7238',
                    zhSortKey: 'ba ba',
                    enText: 'Father',
                    description: '\u4eb2\u5c5e\u79f0\u8c13',
                    isPublished: true,
                    sortOrder: 2,
                }),
                this.dictionaryRepository.create({
                    buyiText: 'mo',
                    zhText: '\u5988\u5988',
                    zhSortKey: 'ma ma',
                    enText: 'Mother',
                    description: '\u4eb2\u5c5e\u79f0\u8c13',
                    isPublished: true,
                    sortOrder: 3,
                }),
            ]);
        }
        if ((await this.phraseRepository.count()) === 0) {
            await this.phraseRepository.save([
                this.phraseRepository.create({
                    buyiText: 'nang bux',
                    zhText: '\u4f60\u597d\u5417\uff1f',
                    zhSortKey: 'ni hao ma',
                    enText: 'How are you?',
                    description: '\u65e5\u5e38\u95ee\u5019',
                    isPublished: true,
                    sortOrder: 1,
                }),
                this.phraseRepository.create({
                    buyiText: 'yo bux',
                    zhText: '\u6211\u5f88\u597d',
                    zhSortKey: 'wo hen hao',
                    enText: "I'm fine",
                    description: '\u56de\u5e94\u95ee\u5019',
                    isPublished: true,
                    sortOrder: 2,
                }),
            ]);
        }
        if ((await this.proverbRepository.count()) === 0) {
            await this.proverbRepository.save([
                this.proverbRepository.create({
                    buyiText: 'nga zi ni ma',
                    zhText: '\u8bf4\u8bdd\u50cf\u5531\u6b4c',
                    zhSortKey: 'shuo hua xiang chang ge',
                    enText: 'Speak like singing',
                    description: '\u5e03\u4f9d\u8bed\u6587\u5316\u8868\u8fbe',
                    isPublished: true,
                    sortOrder: 1,
                }),
            ]);
        }
        const songSeeds = [
            {
                title: '\u5e03\u4f9d\u8fce\u5ba2\u6b4c',
                artist: '\u5e03\u4f9d\u6587\u5316\u91c7\u96c6',
                buyiText: 'hau mbou',
                zhText: '\u6b22\u8fce\u8fdc\u65b9\u5ba2\u4eba\u7684\u6c11\u6b4c',
                zhSortKey: 'huan ying yuan fang ke ren de min ge',
                enText: 'Welcome song of Buyi people',
                description: '\u9996\u9875\u8f6e\u64ad\u4e0e\u6c11\u6b4c\u5217\u8868\u793a\u4f8b\u6570\u636e',
                coverUrl: '/assets/images/banner1.jpg',
                isPublished: true,
                sortOrder: 1,
            },
            {
                title: '\u5c71\u8c37\u5bf9\u5531',
                artist: '\u9ed4\u5357\u5c71\u6b4c\u961f',
                buyiText: 'gaen hau',
                zhText: '\u5c71\u8c37\u4e4b\u95f4\u7684\u5bf9\u5531',
                zhSortKey: 'shan gu zhi jian de dui chang',
                enText: 'Valley antiphonal singing',
                description: '\u7528\u4e8e\u9996\u9875\u5c55\u793a\u5e03\u4f9d\u8bed\u97f5\u5f8b\u4e0e\u6587\u5316\u6c14\u8d28',
                coverUrl: '/assets/images/banner2.jpg',
                isPublished: true,
                sortOrder: 2,
            },
            {
                title: '\u7530\u57c2\u8282\u594f',
                artist: '\u5e03\u4f9d\u9752\u5e74\u5408\u5531',
                buyiText: 'mbou ra',
                zhText: '\u7530\u95f4\u52b3\u4f5c\u65f6\u7684\u8282\u594f\u6c11\u6b4c',
                zhSortKey: 'tian jian lao zuo shi de jie zou min ge',
                enText: 'Rhythm of farming folk song',
                description: '\u4f5c\u4e3a\u5c0f\u7a0b\u5e8f\u9996\u9875\u7cbe\u9009\u6c11\u6b4c\u793a\u4f8b',
                coverUrl: '/assets/images/banner1.jpg',
                isPublished: true,
                sortOrder: 3,
            },
        ];
        for (const seed of songSeeds) {
            const existing = await this.songRepository.findOne({
                where: {
                    title: seed.title,
                    artist: seed.artist,
                },
            });
            if (!existing) {
                await this.songRepository.save(this.songRepository.create(seed));
                continue;
            }
            let shouldUpdate = false;
            if (!existing.coverUrl && seed.coverUrl) {
                existing.coverUrl = seed.coverUrl;
                shouldUpdate = true;
            }
            if (!existing.description && seed.description) {
                existing.description = seed.description;
                shouldUpdate = true;
            }
            if (!existing.isPublished) {
                existing.isPublished = true;
                shouldUpdate = true;
            }
            if (shouldUpdate) {
                await this.songRepository.save(existing);
            }
        }
    }
    async seedCultureExhibits() {
        if ((0, runtime_validation_1.isProductionEnvironment)(process.env)) {
            return;
        }
        let exhibit = await this.cultureExhibitRepository.findOne({ where: { slug: 'buyi-folk-song' } });
        if (!exhibit) {
            exhibit = await this.cultureExhibitRepository.save(this.cultureExhibitRepository.create({
                slug: 'buyi-folk-song',
                title: '从“说话像唱歌”走进民歌声场',
                kicker: '由词入馆 · 声音展项',
                summary: '从一条带有歌唱意象的谚语出发，观察布依民歌的唱法与使用场景，并继续进入可播放的民歌声场。',
                story: '中国非物质文化遗产网介绍，布依族民歌有古歌、叙事歌、情歌、酒歌和劳动歌等类型，也有独唱、对唱、齐唱、重唱等演唱形式。本页的琴键只展示合成调值轮廓，不将其当作真实例词录音。',
                patternLabel: '声音与礼俗的线索',
                toneIndex: 1,
                featuredSongId: 1,
                sourceTitle: '中国非物质文化遗产网 · 布依族民歌（好花红调）',
                sourceUrl: 'https://www.ihchina.cn/art/detail/id/12668.html',
                sourceStatus: 'verified',
                isPublished: true,
                sortOrder: 1,
            }));
        }
        const proverb = await this.proverbRepository.findOne({ where: { buyiText: 'nga zi ni ma' } });
        if (!proverb)
            return;
        const existingLink = await this.cultureLinkRepository.findOne({
            where: { contentType: content_type_enum_1.ContentType.PROVERB, contentId: proverb.id, exhibitId: exhibit.id },
        });
        if (!existingLink) {
            await this.cultureLinkRepository.save(this.cultureLinkRepository.create({
                contentType: content_type_enum_1.ContentType.PROVERB,
                contentId: proverb.id,
                exhibitId: exhibit.id,
                sortOrder: 1,
            }));
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __param(2, (0, typeorm_1.InjectRepository)(dictionary_entry_entity_1.DictionaryEntry)),
    __param(3, (0, typeorm_1.InjectRepository)(phrase_entity_1.Phrase)),
    __param(4, (0, typeorm_1.InjectRepository)(proverb_entity_1.Proverb)),
    __param(5, (0, typeorm_1.InjectRepository)(song_entity_1.Song)),
    __param(6, (0, typeorm_1.InjectRepository)(culture_exhibit_entity_1.CultureExhibit)),
    __param(7, (0, typeorm_1.InjectRepository)(content_culture_link_entity_1.ContentCultureLink)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map