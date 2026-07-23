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
exports.CreateContentCultureLinkDto = exports.UpdateCultureExhibitDto = exports.CreateCultureExhibitDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const content_type_enum_1 = require("../../../common/enums/content-type.enum");
class CreateCultureExhibitDto {
}
exports.CreateCultureExhibitDto = CreateCultureExhibitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 96),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 120),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 120),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "kicker", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "summary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "story", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 120),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "patternLabel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Object)
], CreateCultureExhibitDto.prototype, "toneIndex", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], CreateCultureExhibitDto.prototype, "featuredSongId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 255),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "sourceTitle", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    (0, class_validator_1.Length)(8, 500),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "sourceUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['verified', 'pending']),
    __metadata("design:type", String)
], CreateCultureExhibitDto.prototype, "sourceStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCultureExhibitDto.prototype, "isPublished", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCultureExhibitDto.prototype, "sortOrder", void 0);
class UpdateCultureExhibitDto extends (0, mapped_types_1.PartialType)(CreateCultureExhibitDto) {
}
exports.UpdateCultureExhibitDto = UpdateCultureExhibitDto;
class CreateContentCultureLinkDto {
}
exports.CreateContentCultureLinkDto = CreateContentCultureLinkDto;
__decorate([
    (0, class_validator_1.IsEnum)(content_type_enum_1.ContentType),
    __metadata("design:type", String)
], CreateContentCultureLinkDto.prototype, "contentType", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateContentCultureLinkDto.prototype, "contentId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateContentCultureLinkDto.prototype, "exhibitId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateContentCultureLinkDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=culture-exhibit.dto.js.map