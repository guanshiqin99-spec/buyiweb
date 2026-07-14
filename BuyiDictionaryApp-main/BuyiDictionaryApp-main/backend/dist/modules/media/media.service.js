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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const path_1 = require("path");
const typeorm_2 = require("typeorm");
const dictionary_entry_entity_1 = require("../../entities/dictionary-entry.entity");
const media_asset_entity_1 = require("../../entities/media-asset.entity");
const song_entity_1 = require("../../entities/song.entity");
const storage_service_1 = require("./storage.service");
let MediaService = class MediaService {
    constructor(mediaRepository, dictionaryRepository, songRepository, storageService, configService) {
        this.mediaRepository = mediaRepository;
        this.dictionaryRepository = dictionaryRepository;
        this.songRepository = songRepository;
        this.storageService = storageService;
        this.configService = configService;
    }
    async list() {
        return this.mediaRepository.find({ order: { id: 'DESC' } });
    }
    async upload(file, payload) {
        if (!file) {
            throw new common_1.BadRequestException('请选择要上传的文件');
        }
        this.validateUpload(file, payload.kind);
        const uploaded = await this.storageService.upload({
            buffer: file.buffer,
            filename: this.normalizeFilename(payload.filename || file.originalname),
            mimeType: file.mimetype,
        });
        const asset = this.mediaRepository.create({
            kind: payload.kind,
            filename: this.normalizeFilename(payload.filename || file.originalname),
            url: uploaded.url,
            storageKey: uploaded.storageKey,
            mimeType: file.mimetype,
            size: file.size,
        });
        return this.mediaRepository.save(asset);
    }
    async remove(id) {
        const asset = await this.mediaRepository.findOne({ where: { id } });
        if (!asset) {
            throw new common_1.BadRequestException('媒体资源不存在');
        }
        const [dictionaryRefs, songRefs] = await Promise.all([
            this.dictionaryRepository.count({ where: { audioMediaId: id } }),
            this.songRepository.count({
                where: [{ coverMediaId: id }, { audioMediaId: id }],
            }),
        ]);
        if (dictionaryRefs > 0 || songRefs > 0) {
            throw new common_1.BadRequestException('该媒体资源仍被内容引用，不能删除');
        }
        await this.storageService.delete(asset.storageKey);
        await this.mediaRepository.remove(asset);
        return { success: true };
    }
    validateUpload(file, kind) {
        const maxFileSize = this.configService.get('media.maxFileSize', 10 * 1024 * 1024);
        if (file.size > maxFileSize) {
            throw new common_1.BadRequestException(`文件大小不能超过 ${Math.floor(maxFileSize / 1024 / 1024)}MB`);
        }
        const extension = (0, path_1.extname)(file.originalname || '');
        if (!extension) {
            throw new common_1.BadRequestException('上传文件必须包含合法扩展名');
        }
        const mimeWhiteList = kind === 'image'
            ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            : ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/ogg'];
        if (!mimeWhiteList.includes(file.mimetype)) {
            throw new common_1.BadRequestException(kind === 'image' ? '图片文件格式不受支持' : '音频文件格式不受支持');
        }
    }
    normalizeFilename(filename) {
        const value = String(filename || '').trim();
        if (!value) {
            throw new common_1.BadRequestException('文件名不能为空');
        }
        if (!/^[\w.\-()\u4e00-\u9fa5\s]+$/.test(value)) {
            throw new common_1.BadRequestException('文件名包含非法字符');
        }
        if (!(0, path_1.extname)(value)) {
            throw new common_1.BadRequestException('文件名必须包含扩展名');
        }
        return value.replace(/\s+/g, '-');
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_asset_entity_1.MediaAsset)),
    __param(1, (0, typeorm_1.InjectRepository)(dictionary_entry_entity_1.DictionaryEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(song_entity_1.Song)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        storage_service_1.StorageService,
        config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map