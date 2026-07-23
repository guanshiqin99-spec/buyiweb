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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const cos_nodejs_sdk_v5_1 = require("cos-nodejs-sdk-v5");
let StorageService = class StorageService {
    constructor(configService) {
        this.configService = configService;
    }
    async upload(params) {
        const driver = this.configService.get('media.driver', 'local');
        if (driver === 'cos') {
            const bucket = this.configService.get('media.cosBucket', '');
            const secretId = this.configService.get('media.cosSecretId', '');
            if (!bucket || !secretId) {
                return this.uploadToLocal(params);
            }
            return this.uploadToCos(params);
        }
        return this.uploadToLocal(params);
    }
    async delete(storageKey) {
        if (!storageKey) {
            return;
        }
        const driver = this.configService.get('media.driver', 'local');
        if (driver === 'cos') {
            await this.deleteFromCos(storageKey);
            return;
        }
        await this.deleteFromLocal(storageKey);
    }
    async uploadToLocal(params) {
        const uploadDir = this.configService.get('media.localUploadDir', 'uploads');
        const safeName = `${Date.now()}-${params.filename.replace(/[^\w.\-()\u4e00-\u9fa5]/g, '-')}`;
        const storageKey = safeName;
        const absoluteDir = uploadDir.startsWith('/') ? uploadDir : (0, path_1.join)(process.cwd(), uploadDir);
        await (0, promises_1.mkdir)(absoluteDir, { recursive: true });
        await (0, promises_1.writeFile)((0, path_1.join)(absoluteDir, storageKey), params.buffer);
        const baseUrl = this.configService.get('media.publicBaseUrl', 'http://localhost:3000/uploads');
        return {
            storageKey,
            url: `${baseUrl.replace(/\/$/, '')}/${storageKey}`,
        };
    }
    async deleteFromLocal(storageKey) {
        const uploadDir = this.configService.get('media.localUploadDir', 'uploads');
        const absolutePath = uploadDir.startsWith('/') ? (0, path_1.join)(uploadDir, storageKey) : (0, path_1.join)(process.cwd(), uploadDir, storageKey);
        try {
            await (0, promises_1.unlink)(absolutePath);
        }
        catch {
            return;
        }
    }
    async uploadToCos(params) {
        const cos = new cos_nodejs_sdk_v5_1.default({
            SecretId: this.configService.get('media.cosSecretId', ''),
            SecretKey: this.configService.get('media.cosSecretKey', ''),
        });
        const storageKey = `${Date.now()}-${params.filename.replace(/[^\w.\-()\u4e00-\u9fa5]/g, '-')}`;
        await new Promise((resolve, reject) => {
            cos.putObject({
                Bucket: this.configService.get('media.cosBucket', ''),
                Region: this.configService.get('media.cosRegion', ''),
                Key: storageKey,
                Body: params.buffer,
                ContentType: params.mimeType,
            }, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        }).catch(() => {
            throw new common_1.InternalServerErrorException('上传到对象存储失败');
        });
        const publicBaseUrl = this.configService.get('media.cosPublicBaseUrl', '');
        const fallbackUrl = `https://${this.configService.get('media.cosBucket', '')}.cos.${this.configService.get('media.cosRegion', '')}.myqcloud.com/${storageKey}`;
        return {
            storageKey,
            url: publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/${storageKey}` : fallbackUrl,
        };
    }
    async deleteFromCos(storageKey) {
        const cos = new cos_nodejs_sdk_v5_1.default({
            SecretId: this.configService.get('media.cosSecretId', ''),
            SecretKey: this.configService.get('media.cosSecretKey', ''),
        });
        await new Promise((resolve, reject) => {
            cos.deleteObject({
                Bucket: this.configService.get('media.cosBucket', ''),
                Region: this.configService.get('media.cosRegion', ''),
                Key: storageKey,
            }, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        }).catch(() => {
            throw new common_1.InternalServerErrorException('从对象存储删除文件失败');
        });
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map