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
exports.ContentCultureLink = void 0;
const typeorm_1 = require("typeorm");
const culture_exhibit_entity_1 = require("./culture-exhibit.entity");
let ContentCultureLink = class ContentCultureLink {
};
exports.ContentCultureLink = ContentCultureLink;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ContentCultureLink.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], ContentCultureLink.prototype, "contentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ContentCultureLink.prototype, "contentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ContentCultureLink.prototype, "exhibitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ContentCultureLink.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => culture_exhibit_entity_1.CultureExhibit, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'exhibitId' }),
    __metadata("design:type", culture_exhibit_entity_1.CultureExhibit)
], ContentCultureLink.prototype, "exhibit", void 0);
exports.ContentCultureLink = ContentCultureLink = __decorate([
    (0, typeorm_1.Entity)('content_culture_links'),
    (0, typeorm_1.Index)(['contentType', 'contentId', 'exhibitId'], { unique: true })
], ContentCultureLink);
//# sourceMappingURL=content-culture-link.entity.js.map