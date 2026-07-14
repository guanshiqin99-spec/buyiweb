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
exports.CultureExhibit = void 0;
const typeorm_1 = require("typeorm");
let CultureExhibit = class CultureExhibit {
};
exports.CultureExhibit = CultureExhibit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CultureExhibit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 96, unique: true }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, default: '' }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "kicker", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "story", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, default: '' }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "patternLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], CultureExhibit.prototype, "toneIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], CultureExhibit.prototype, "featuredSongId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '' }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "sourceTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, default: '' }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "sourceUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40, default: 'verified' }),
    __metadata("design:type", String)
], CultureExhibit.prototype, "sourceStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CultureExhibit.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CultureExhibit.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CultureExhibit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CultureExhibit.prototype, "updatedAt", void 0);
exports.CultureExhibit = CultureExhibit = __decorate([
    (0, typeorm_1.Entity)('culture_exhibits')
], CultureExhibit);
//# sourceMappingURL=culture-exhibit.entity.js.map