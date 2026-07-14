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
exports.DictionaryEntry = void 0;
const typeorm_1 = require("typeorm");
const base_content_entity_1 = require("./base-content.entity");
let DictionaryEntry = class DictionaryEntry extends base_content_entity_1.BaseContentEntity {
};
exports.DictionaryEntry = DictionaryEntry;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], DictionaryEntry.prototype, "audioUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], DictionaryEntry.prototype, "audioMediaId", void 0);
exports.DictionaryEntry = DictionaryEntry = __decorate([
    (0, typeorm_1.Entity)('dictionary_entries')
], DictionaryEntry);
//# sourceMappingURL=dictionary-entry.entity.js.map