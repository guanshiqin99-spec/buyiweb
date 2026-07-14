"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentSortService = void 0;
const common_1 = require("@nestjs/common");
const pinyin_pro_1 = require("pinyin-pro");
let ContentSortService = class ContentSortService {
    buildZhSortKey(text) {
        const value = (text || '').trim();
        if (!value) {
            return '';
        }
        const result = (0, pinyin_pro_1.pinyin)(value, {
            toneType: 'none',
            type: 'array',
            nonZh: 'consecutive',
            v: false,
        });
        const normalized = Array.isArray(result) ? result.join(' ') : String(result);
        return normalized.toLowerCase().replace(/\s+/g, ' ').trim();
    }
};
exports.ContentSortService = ContentSortService;
exports.ContentSortService = ContentSortService = __decorate([
    (0, common_1.Injectable)()
], ContentSortService);
//# sourceMappingURL=content-sort.service.js.map