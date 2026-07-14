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
exports.MiniappLearningRecordsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const miniapp_jwt_guard_1 = require("../../common/guards/miniapp-jwt.guard");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const create_learning_record_dto_1 = require("./dto/create-learning-record.dto");
const miniapp_learning_records_service_1 = require("./miniapp-learning-records.service");
let MiniappLearningRecordsController = class MiniappLearningRecordsController {
    constructor(learningRecordsService) {
        this.learningRecordsService = learningRecordsService;
    }
    list(user, query) {
        return this.learningRecordsService.list(user.sub, Number(query.page ?? 1), Number(query.pageSize ?? 10));
    }
    stats(user) {
        return this.learningRecordsService.getStats(user.sub);
    }
    create(user, payload) {
        return this.learningRecordsService.create(user.sub, payload);
    }
    clear(user) {
        return this.learningRecordsService.clear(user.sub);
    }
};
exports.MiniappLearningRecordsController = MiniappLearningRecordsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], MiniappLearningRecordsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MiniappLearningRecordsController.prototype, "stats", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_learning_record_dto_1.CreateLearningRecordDto]),
    __metadata("design:returntype", void 0)
], MiniappLearningRecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MiniappLearningRecordsController.prototype, "clear", null);
exports.MiniappLearningRecordsController = MiniappLearningRecordsController = __decorate([
    (0, common_1.Controller)('miniapp/learning-records'),
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    __metadata("design:paramtypes", [miniapp_learning_records_service_1.MiniappLearningRecordsService])
], MiniappLearningRecordsController);
//# sourceMappingURL=miniapp-learning-records.controller.js.map