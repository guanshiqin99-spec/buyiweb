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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_role_enum_1 = require("../../common/enums/admin-role.enum");
const admin_jwt_guard_1 = require("../../common/guards/admin-jwt.guard");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../../entities/user.entity");
let AdminUsersController = class AdminUsersController {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async list(query) {
        const page = Number(query.page ?? 1);
        const pageSize = Number(query.pageSize ?? 10);
        const [items, total] = await this.userRepository.findAndCount({
            order: { id: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return {
            items,
            total,
            page,
            pageSize,
        };
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "list", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(admin_role_enum_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminUsersController);
//# sourceMappingURL=admin-users.controller.js.map