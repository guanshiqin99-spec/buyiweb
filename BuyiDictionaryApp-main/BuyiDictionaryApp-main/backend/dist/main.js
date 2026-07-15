/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.module.ts"
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const serve_static_1 = __webpack_require__(/*! @nestjs/serve-static */ "@nestjs/serve-static");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const path_1 = __webpack_require__(/*! path */ "path");
const app_config_1 = __webpack_require__(/*! ./config/app.config */ "./src/config/app.config.ts");
const database_config_1 = __webpack_require__(/*! ./config/database.config */ "./src/config/database.config.ts");
const admin_role_enum_1 = __webpack_require__(/*! ./common/enums/admin-role.enum */ "./src/common/enums/admin-role.enum.ts");
const content_type_enum_1 = __webpack_require__(/*! ./common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const admin_auth_module_1 = __webpack_require__(/*! ./modules/admin-auth/admin-auth.module */ "./src/modules/admin-auth/admin-auth.module.ts");
const auth_sessions_module_1 = __webpack_require__(/*! ./modules/auth-sessions/auth-sessions.module */ "./src/modules/auth-sessions/auth-sessions.module.ts");
const admin_content_module_1 = __webpack_require__(/*! ./modules/admin-content/admin-content.module */ "./src/modules/admin-content/admin-content.module.ts");
const admin_dashboard_module_1 = __webpack_require__(/*! ./modules/admin-dashboard/admin-dashboard.module */ "./src/modules/admin-dashboard/admin-dashboard.module.ts");
const admin_media_module_1 = __webpack_require__(/*! ./modules/admin-media/admin-media.module */ "./src/modules/admin-media/admin-media.module.ts");
const admin_users_module_1 = __webpack_require__(/*! ./modules/admin-users/admin-users.module */ "./src/modules/admin-users/admin-users.module.ts");
const content_module_1 = __webpack_require__(/*! ./modules/content/content.module */ "./src/modules/content/content.module.ts");
const culture_exhibits_module_1 = __webpack_require__(/*! ./modules/culture-exhibits/culture-exhibits.module */ "./src/modules/culture-exhibits/culture-exhibits.module.ts");
const media_module_1 = __webpack_require__(/*! ./modules/media/media.module */ "./src/modules/media/media.module.ts");
const health_module_1 = __webpack_require__(/*! ./modules/health/health.module */ "./src/modules/health/health.module.ts");
const miniapp_auth_module_1 = __webpack_require__(/*! ./modules/miniapp-auth/miniapp-auth.module */ "./src/modules/miniapp-auth/miniapp-auth.module.ts");
const miniapp_agent_module_1 = __webpack_require__(/*! ./modules/miniapp-agent/miniapp-agent.module */ "./src/modules/miniapp-agent/miniapp-agent.module.ts");
const miniapp_badges_module_1 = __webpack_require__(/*! ./modules/miniapp-badges/miniapp-badges.module */ "./src/modules/miniapp-badges/miniapp-badges.module.ts");
const miniapp_dictionary_module_1 = __webpack_require__(/*! ./modules/miniapp-dictionary/miniapp-dictionary.module */ "./src/modules/miniapp-dictionary/miniapp-dictionary.module.ts");
const miniapp_favorites_module_1 = __webpack_require__(/*! ./modules/miniapp-favorites/miniapp-favorites.module */ "./src/modules/miniapp-favorites/miniapp-favorites.module.ts");
const miniapp_home_module_1 = __webpack_require__(/*! ./modules/miniapp-home/miniapp-home.module */ "./src/modules/miniapp-home/miniapp-home.module.ts");
const miniapp_learning_records_module_1 = __webpack_require__(/*! ./modules/miniapp-learning-records/miniapp-learning-records.module */ "./src/modules/miniapp-learning-records/miniapp-learning-records.module.ts");
const miniapp_me_module_1 = __webpack_require__(/*! ./modules/miniapp-me/miniapp-me.module */ "./src/modules/miniapp-me/miniapp-me.module.ts");
const miniapp_phrases_module_1 = __webpack_require__(/*! ./modules/miniapp-phrases/miniapp-phrases.module */ "./src/modules/miniapp-phrases/miniapp-phrases.module.ts");
const miniapp_quiz_module_1 = __webpack_require__(/*! ./modules/miniapp-quiz/miniapp-quiz.module */ "./src/modules/miniapp-quiz/miniapp-quiz.module.ts");
const miniapp_proverbs_module_1 = __webpack_require__(/*! ./modules/miniapp-proverbs/miniapp-proverbs.module */ "./src/modules/miniapp-proverbs/miniapp-proverbs.module.ts");
const miniapp_search_module_1 = __webpack_require__(/*! ./modules/miniapp-search/miniapp-search.module */ "./src/modules/miniapp-search/miniapp-search.module.ts");
const miniapp_settings_module_1 = __webpack_require__(/*! ./modules/miniapp-settings/miniapp-settings.module */ "./src/modules/miniapp-settings/miniapp-settings.module.ts");
const miniapp_songs_module_1 = __webpack_require__(/*! ./modules/miniapp-songs/miniapp-songs.module */ "./src/modules/miniapp-songs/miniapp-songs.module.ts");
const seed_module_1 = __webpack_require__(/*! ./modules/seed/seed.module */ "./src/modules/seed/seed.module.ts");
const users_module_1 = __webpack_require__(/*! ./modules/users/users.module */ "./src/modules/users/users.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                load: [app_config_1.appConfig],
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: process.env.VERCEL === '1' ? '/tmp/uploads' : (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: database_config_1.typeOrmConfigFactory,
            }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('jwt.secret', { infer: true }),
                }),
            }),
            users_module_1.UsersModule,
            auth_sessions_module_1.AuthSessionsModule,
            content_module_1.ContentModule,
            culture_exhibits_module_1.CultureExhibitsModule,
            media_module_1.MediaModule,
            health_module_1.HealthModule,
            seed_module_1.SeedModule,
            miniapp_auth_module_1.MiniappAuthModule,
            miniapp_agent_module_1.MiniappAgentModule,
            miniapp_home_module_1.MiniappHomeModule,
            miniapp_me_module_1.MiniappMeModule,
            miniapp_settings_module_1.MiniappSettingsModule,
            miniapp_search_module_1.MiniappSearchModule,
            miniapp_dictionary_module_1.MiniappDictionaryModule,
            miniapp_phrases_module_1.MiniappPhrasesModule,
            miniapp_quiz_module_1.MiniappQuizModule,
            miniapp_proverbs_module_1.MiniappProverbsModule,
            miniapp_songs_module_1.MiniappSongsModule,
            miniapp_favorites_module_1.MiniappFavoritesModule,
            miniapp_learning_records_module_1.MiniappLearningRecordsModule,
            miniapp_badges_module_1.MiniappBadgesModule,
            admin_auth_module_1.AdminAuthModule,
            admin_dashboard_module_1.AdminDashboardModule,
            admin_content_module_1.AdminContentModule,
            admin_media_module_1.AdminMediaModule,
            admin_users_module_1.AdminUsersModule,
        ],
        providers: [
            {
                provide: 'APP_METADATA',
                useValue: {
                    name: 'Buyi Dictionary API',
                    adminRoles: Object.values(admin_role_enum_1.AdminRole),
                    contentTypes: Object.values(content_type_enum_1.ContentType),
                },
            },
        ],
    })
], AppModule);


/***/ },

/***/ "./src/common/decorators/current-user.decorator.ts"
/*!*********************************************************!*\
  !*** ./src/common/decorators/current-user.decorator.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((_, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});


/***/ },

/***/ "./src/common/decorators/public.decorator.ts"
/*!***************************************************!*\
  !*** ./src/common/decorators/public.decorator.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ },

/***/ "./src/common/decorators/roles.decorator.ts"
/*!**************************************************!*\
  !*** ./src/common/decorators/roles.decorator.ts ***!
  \**************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ },

/***/ "./src/common/dto/pagination-query.dto.ts"
/*!************************************************!*\
  !*** ./src/common/dto/pagination-query.dto.ts ***!
  \************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationQueryDto = void 0;
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class PaginationQueryDto {
    constructor() {
        this.page = 1;
        this.pageSize = 10;
    }
}
exports.PaginationQueryDto = PaginationQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], PaginationQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Object)
], PaginationQueryDto.prototype, "pageSize", void 0);


/***/ },

/***/ "./src/common/dto/refresh-token.dto.ts"
/*!*********************************************!*\
  !*** ./src/common/dto/refresh-token.dto.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4096),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);


/***/ },

/***/ "./src/common/enums/admin-role.enum.ts"
/*!*********************************************!*\
  !*** ./src/common/enums/admin-role.enum.ts ***!
  \*********************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminRole = void 0;
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "super_admin";
    AdminRole["EDITOR"] = "editor";
})(AdminRole || (exports.AdminRole = AdminRole = {}));


/***/ },

/***/ "./src/common/enums/content-type.enum.ts"
/*!***********************************************!*\
  !*** ./src/common/enums/content-type.enum.ts ***!
  \***********************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentType = void 0;
var ContentType;
(function (ContentType) {
    ContentType["DICTIONARY"] = "dictionary";
    ContentType["PHRASE"] = "phrase";
    ContentType["PROVERB"] = "proverb";
    ContentType["SONG"] = "song";
})(ContentType || (exports.ContentType = ContentType = {}));


/***/ },

/***/ "./src/common/filters/http-exception.filter.ts"
/*!*****************************************************!*\
  !*** ./src/common/filters/http-exception.filter.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpExceptionFilter = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const context = host.switchToHttp();
        const request = context.getRequest();
        const response = context.getResponse();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : '服务器内部错误，请稍后重试';
        this.logger.error(JSON.stringify({
            requestId: request.requestId,
            method: request.method,
            path: request.originalUrl,
            status,
            error: exception instanceof Error ? exception.message : String(exception),
        }));
        response.status(status).json({
            statusCode: status,
            message,
            path: request.originalUrl,
            requestId: request.requestId,
            timestamp: Date.now(),
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);


/***/ },

/***/ "./src/common/guards/admin-jwt.guard.ts"
/*!**********************************************!*\
  !*** ./src/common/guards/admin-jwt.guard.ts ***!
  \**********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminJwtGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_auth_guard_1 = __webpack_require__(/*! ./jwt-auth.guard */ "./src/common/guards/jwt-auth.guard.ts");
let AdminJwtGuard = class AdminJwtGuard extends jwt_auth_guard_1.JwtAuthGuard {
    async canActivate(context) {
        const allowed = await super.canActivate(context);
        const request = context.switchToHttp().getRequest();
        if (request.user?.tokenType !== 'admin') {
            throw new common_1.UnauthorizedException('\u9700\u8981\u7ba1\u7406\u5458\u8eab\u4efd');
        }
        return allowed;
    }
};
exports.AdminJwtGuard = AdminJwtGuard;
exports.AdminJwtGuard = AdminJwtGuard = __decorate([
    (0, common_1.Injectable)()
], AdminJwtGuard);


/***/ },

/***/ "./src/common/guards/jwt-auth.guard.ts"
/*!*********************************************!*\
  !*** ./src/common/guards/jwt-auth.guard.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const public_decorator_1 = __webpack_require__(/*! ../decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const auth_sessions_service_1 = __webpack_require__(/*! ../../modules/auth-sessions/auth-sessions.service */ "./src/modules/auth-sessions/auth-sessions.service.ts");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(reflector, jwtService, configService, authSessionsService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.configService = configService;
        this.authSessionsService = authSessionsService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('\u7f3a\u5c11\u767b\u5f55\u4ee4\u724c');
        }
        const token = authHeader.slice('Bearer '.length);
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });
            if (payload.tokenKind !== 'access') {
                throw new common_1.UnauthorizedException('\u767b\u5f55\u4ee4\u724c\u7c7b\u578b\u65e0\u6548');
            }
            if (!payload.sid || !payload.tokenType) {
                throw new common_1.UnauthorizedException('\u767b\u5f55\u4f1a\u8bdd\u4e0d\u5b58\u5728');
            }
            const sessionIsActive = await this.authSessionsService.validateAccessSession({
                sessionId: payload.sid,
                userType: payload.tokenType,
                userId: payload.sub,
            });
            if (!sessionIsActive) {
                throw new common_1.UnauthorizedException('\u5f53\u524d\u4f1a\u8bdd\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
            }
            request.user = payload;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('\u767b\u5f55\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object, typeof (_d = typeof auth_sessions_service_1.AuthSessionsService !== "undefined" && auth_sessions_service_1.AuthSessionsService) === "function" ? _d : Object])
], JwtAuthGuard);


/***/ },

/***/ "./src/common/guards/miniapp-jwt.guard.ts"
/*!************************************************!*\
  !*** ./src/common/guards/miniapp-jwt.guard.ts ***!
  \************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappJwtGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_auth_guard_1 = __webpack_require__(/*! ./jwt-auth.guard */ "./src/common/guards/jwt-auth.guard.ts");
let MiniappJwtGuard = class MiniappJwtGuard extends jwt_auth_guard_1.JwtAuthGuard {
    async canActivate(context) {
        const allowed = await super.canActivate(context);
        const request = context.switchToHttp().getRequest();
        if (request.user?.tokenType !== 'miniapp') {
            throw new common_1.UnauthorizedException('\u9700\u8981\u5c0f\u7a0b\u5e8f\u7528\u6237\u8eab\u4efd');
        }
        return allowed;
    }
};
exports.MiniappJwtGuard = MiniappJwtGuard;
exports.MiniappJwtGuard = MiniappJwtGuard = __decorate([
    (0, common_1.Injectable)()
], MiniappJwtGuard);


/***/ },

/***/ "./src/common/guards/roles.guard.ts"
/*!******************************************!*\
  !*** ./src/common/guards/roles.guard.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const roles_decorator_1 = __webpack_require__(/*! ../decorators/roles.decorator */ "./src/common/decorators/roles.decorator.ts");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles?.length) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        return !!request.user?.role && requiredRoles.includes(request.user.role);
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ },

/***/ "./src/common/http/rate-limit.ts"
/*!***************************************!*\
  !*** ./src/common/http/rate-limit.ts ***!
  \***************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createRateLimitMiddleware = createRateLimitMiddleware;
function createRateLimitMiddleware(options) {
    const buckets = new Map();
    return (req, res, next) => {
        const now = Date.now();
        const key = `${req.ip || req.socket.remoteAddress || 'unknown'}:${req.path}`;
        const bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            buckets.set(key, {
                count: 1,
                resetAt: now + options.windowMs,
            });
            next();
            return;
        }
        bucket.count += 1;
        if (bucket.count > options.limit) {
            res.status(429).json({
                statusCode: 429,
                message: options.message,
                requestId: req.requestId,
            });
            return;
        }
        next();
    };
}


/***/ },

/***/ "./src/common/services/wechat.service.ts"
/*!***********************************************!*\
  !*** ./src/common/services/wechat.service.ts ***!
  \***********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WechatService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const runtime_validation_1 = __webpack_require__(/*! ../../config/runtime-validation */ "./src/config/runtime-validation.ts");
let WechatService = class WechatService {
    constructor(configService) {
        this.configService = configService;
    }
    async code2Session(code) {
        if (!code) {
            throw new common_1.UnauthorizedException('缺少微信登录 code');
        }
        const mockMode = this.configService.get('wechat.mockMode', true);
        if (mockMode) {
            if ((0, runtime_validation_1.isProductionEnvironment)(process.env)) {
                throw new common_1.UnauthorizedException('生产环境禁止使用微信 Mock 登录');
            }
            return {
                openid: `mock-openid-${code}`,
                unionid: `mock-unionid-${code}`,
                session_key: `mock-session-${code}`,
            };
        }
        const appId = this.configService.get('wechat.appId', '');
        const appSecret = this.configService.get('wechat.appSecret', '');
        if (!appId || !appSecret) {
            throw new common_1.UnauthorizedException('微信登录配置不完整');
        }
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(appId)}` +
            `&secret=${encodeURIComponent(appSecret)}` +
            `&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
        const response = await fetch(url);
        const payload = (await response.json());
        if (!response.ok || payload.errcode || !payload.openid || !payload.session_key) {
            throw new common_1.UnauthorizedException(payload.errmsg || '微信登录失败');
        }
        return {
            openid: payload.openid,
            unionid: payload.unionid,
            session_key: payload.session_key,
        };
    }
};
exports.WechatService = WechatService;
exports.WechatService = WechatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], WechatService);


/***/ },

/***/ "./src/config/app.config.ts"
/*!**********************************!*\
  !*** ./src/config/app.config.ts ***!
  \**********************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.appConfig = void 0;
const appConfig = () => ({
    app: {
        name: process.env.APP_NAME ?? 'Buyi Dictionary API',
        port: Number(process.env.PORT ?? 3000),
        publicBaseUrl: process.env.APP_PUBLIC_BASE_URL ?? 'http://127.0.0.1:3000',
        env: process.env.NODE_ENV ?? 'development',
        corsOrigins: String(process.env.CORS_ORIGIN ?? 'http://localhost:3000')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        docsEnabled: (process.env.ENABLE_SWAGGER ?? 'false') === 'true',
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '30m',
        adminExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN ?? '1d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
        adminRefreshExpiresIn: process.env.ADMIN_JWT_REFRESH_EXPIRES_IN ?? '14d',
    },
    db: {
        type: process.env.DB_TYPE ?? 'sqljs',
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: Number(process.env.DB_PORT ?? 3306),
        username: process.env.DB_USERNAME ?? 'root',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? 'buyi_dictionary',
        synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
        logging: (process.env.DB_LOGGING ?? 'false') === 'true',
    },
    wechat: {
        appId: process.env.WECHAT_APP_ID ?? '',
        appSecret: process.env.WECHAT_APP_SECRET ?? '',
        mockMode: (process.env.WECHAT_MOCK_MODE ?? 'true') === 'true',
        reminderTemplateId: process.env.WECHAT_REMINDER_TEMPLATE_ID ?? '',
        reminderTemplateDataJson: process.env.WECHAT_REMINDER_TEMPLATE_DATA_JSON ?? '',
        reminderHour: Number(process.env.WECHAT_REMINDER_HOUR ?? 20),
    },
    media: {
        driver: process.env.MEDIA_DRIVER ?? 'local',
        publicBaseUrl: process.env.MEDIA_PUBLIC_BASE_URL ?? 'http://localhost:3000/uploads',
        localUploadDir: process.env.VERCEL === '1' ? '/tmp/uploads' : (process.env.MEDIA_LOCAL_UPLOAD_DIR ?? 'uploads'),
        maxFileSize: Number(process.env.MEDIA_MAX_FILE_SIZE ?? 10 * 1024 * 1024),
        cosSecretId: process.env.COS_SECRET_ID ?? '',
        cosSecretKey: process.env.COS_SECRET_KEY ?? '',
        cosBucket: process.env.COS_BUCKET ?? '',
        cosRegion: process.env.COS_REGION ?? '',
        cosPublicBaseUrl: process.env.COS_PUBLIC_BASE_URL ?? '',
    },
    seed: {
        onBoot: (process.env.SEED_ON_BOOT ?? 'true') === 'true',
        adminUsername: process.env.DEFAULT_ADMIN_USERNAME ?? 'admin',
        adminPassword: process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin@123456',
    },
    ai: {
        provider: process.env.AI_PROVIDER ?? 'deepseek',
        apiKey: process.env.DEEPSEEK_API_KEY ?? '',
        baseURL: process.env.AI_BASE_URL ?? 'https://api.deepseek.com',
        model: process.env.AI_MODEL ?? 'deepseek-chat',
    },
});
exports.appConfig = appConfig;


/***/ },

/***/ "./src/config/database.config.ts"
/*!***************************************!*\
  !*** ./src/config/database.config.ts ***!
  \***************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.migrations = exports.entities = void 0;
exports.buildTypeOrmOptions = buildTypeOrmOptions;
exports.typeOrmConfigFactory = typeOrmConfigFactory;
const sql_js_1 = __webpack_require__(/*! sql.js */ "sql.js");
const admin_entity_1 = __webpack_require__(/*! ../entities/admin.entity */ "./src/entities/admin.entity.ts");
const agent_cache_entity_1 = __webpack_require__(/*! ../entities/agent-cache.entity */ "./src/entities/agent-cache.entity.ts");
const auth_session_entity_1 = __webpack_require__(/*! ../entities/auth-session.entity */ "./src/entities/auth-session.entity.ts");
const badge_entity_1 = __webpack_require__(/*! ../entities/badge.entity */ "./src/entities/badge.entity.ts");
const content_culture_link_entity_1 = __webpack_require__(/*! ../entities/content-culture-link.entity */ "./src/entities/content-culture-link.entity.ts");
const culture_exhibit_entity_1 = __webpack_require__(/*! ../entities/culture-exhibit.entity */ "./src/entities/culture-exhibit.entity.ts");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const favorite_entity_1 = __webpack_require__(/*! ../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const learning_record_entity_1 = __webpack_require__(/*! ../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const media_asset_entity_1 = __webpack_require__(/*! ../entities/media-asset.entity */ "./src/entities/media-asset.entity.ts");
const phrase_entity_1 = __webpack_require__(/*! ../entities/phrase.entity */ "./src/entities/phrase.entity.ts");
const proverb_entity_1 = __webpack_require__(/*! ../entities/proverb.entity */ "./src/entities/proverb.entity.ts");
const quiz_attempt_entity_1 = __webpack_require__(/*! ../entities/quiz-attempt.entity */ "./src/entities/quiz-attempt.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../entities/song.entity */ "./src/entities/song.entity.ts");
const user_setting_entity_1 = __webpack_require__(/*! ../entities/user-setting.entity */ "./src/entities/user-setting.entity.ts");
const user_entity_1 = __webpack_require__(/*! ../entities/user.entity */ "./src/entities/user.entity.ts");
const wechat_account_entity_1 = __webpack_require__(/*! ../entities/wechat-account.entity */ "./src/entities/wechat-account.entity.ts");
const _1710000000000_baseline_schema_1 = __webpack_require__(/*! ../migrations/1710000000000-baseline-schema */ "./src/migrations/1710000000000-baseline-schema.ts");
const _1721000000000_add_culture_exhibits_1 = __webpack_require__(/*! ../migrations/1721000000000-add-culture-exhibits */ "./src/migrations/1721000000000-add-culture-exhibits.ts");
const _1722000000000_add_quiz_attempts_1 = __webpack_require__(/*! ../migrations/1722000000000-add-quiz-attempts */ "./src/migrations/1722000000000-add-quiz-attempts.ts");
exports.entities = [
    admin_entity_1.Admin,
    agent_cache_entity_1.AgentCache,
    auth_session_entity_1.AuthSession,
    user_entity_1.User,
    wechat_account_entity_1.WechatAccount,
    user_setting_entity_1.UserSetting,
    media_asset_entity_1.MediaAsset,
    dictionary_entry_entity_1.DictionaryEntry,
    phrase_entity_1.Phrase,
    proverb_entity_1.Proverb,
    song_entity_1.Song,
    favorite_entity_1.Favorite,
    learning_record_entity_1.LearningRecord,
    quiz_attempt_entity_1.QuizAttempt,
    badge_entity_1.Badge,
    culture_exhibit_entity_1.CultureExhibit,
    content_culture_link_entity_1.ContentCultureLink,
];
exports.migrations = [_1710000000000_baseline_schema_1.BaselineSchema1710000000000, _1721000000000_add_culture_exhibits_1.AddCultureExhibits1721000000000, _1722000000000_add_quiz_attempts_1.AddQuizAttempts1722000000000];
function buildTypeOrmOptions(config) {
    const { db } = config;
    const synchronize = db.synchronize;
    const logging = db.logging;
    if (db.type === 'mysql') {
        return {
            type: 'mysql',
            host: db.host,
            port: db.port,
            username: db.username,
            password: db.password,
            database: db.database,
            entities: exports.entities,
            migrations: exports.migrations,
            migrationsTableName: 'migrations',
            synchronize,
            logging,
            charset: 'utf8mb4',
            connectTimeout: 30000,
            timezone: '+08:00',
        };
    }
    const isVercel = process.env.VERCEL === '1';
    const dbLocation = isVercel ? `/tmp/${db.database}` : db.database;
    return {
        type: 'sqljs',
        location: dbLocation,
        autoSave: true,
        driver: sql_js_1.default,
        entities: exports.entities,
        migrations: exports.migrations,
        migrationsTableName: 'migrations',
        synchronize,
        logging,
    };
}
function typeOrmConfigFactory(configService) {
    return buildTypeOrmOptions({
        db: {
            type: configService.get('db.type', 'sqljs'),
            host: configService.get('db.host', '127.0.0.1'),
            port: configService.get('db.port', 3306),
            username: configService.get('db.username', 'root'),
            password: configService.get('db.password', ''),
            database: configService.get('db.database', 'buyi_dictionary'),
            synchronize: configService.get('db.synchronize', true),
            logging: configService.get('db.logging', false),
        },
    });
}


/***/ },

/***/ "./src/config/runtime-validation.ts"
/*!******************************************!*\
  !*** ./src/config/runtime-validation.ts ***!
  \******************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isProductionEnvironment = isProductionEnvironment;
exports.validateEnvironmentOrThrow = validateEnvironmentOrThrow;
exports.getReadinessReport = getReadinessReport;
function isTruthy(value, defaultValue = false) {
    if (value === undefined) {
        return defaultValue;
    }
    return value === 'true';
}
function isProductionEnvironment(env = process.env) {
    return ['production', 'prod'].includes(String(env.NODE_ENV || '').toLowerCase());
}
function requireValue(errors, key, value) {
    if (!String(value || '').trim()) {
        errors.push(`缺少必要环境变量 ${key}`);
    }
}
function validateEnvironmentOrThrow(env = process.env) {
    if (!isProductionEnvironment(env)) {
        return;
    }
    const errors = [];
    if (env.ENABLE_SWAGGER === 'true') {
        console.warn('⚠️ 生产环境开启了 Swagger，建议关闭');
    }
    const jwtSecret = String(env.JWT_SECRET || '').trim();
    const dbType = String(env.DB_TYPE || '').trim();
    const mediaDriver = String(env.MEDIA_DRIVER || '').trim() || 'local';
    if (!jwtSecret || jwtSecret === 'change-me') {
        errors.push('生产环境必须设置安全的 JWT_SECRET');
    }
    if (dbType !== 'mysql') {
        errors.push('生产环境只允许使用 MySQL');
    }
    if (isTruthy(env.DB_SYNCHRONIZE, true)) {
        errors.push('生产环境必须关闭 DB_SYNCHRONIZE');
    }
    if (isTruthy(env.WECHAT_MOCK_MODE, true)) {
        errors.push('生产环境必须关闭 WECHAT_MOCK_MODE');
    }
    if (isTruthy(env.SEED_ON_BOOT, true)) {
        errors.push('生产环境必须关闭 SEED_ON_BOOT');
    }
    if (mediaDriver === 'local') {
        errors.push('生产环境不允许使用本地媒体存储');
    }
    requireValue(errors, 'DB_HOST', env.DB_HOST);
    requireValue(errors, 'DB_PORT', env.DB_PORT);
    requireValue(errors, 'DB_USERNAME', env.DB_USERNAME);
    requireValue(errors, 'DB_NAME', env.DB_NAME);
    requireValue(errors, 'WECHAT_APP_ID', env.WECHAT_APP_ID);
    requireValue(errors, 'WECHAT_APP_SECRET', env.WECHAT_APP_SECRET);
    requireValue(errors, 'WECHAT_REMINDER_TEMPLATE_ID', env.WECHAT_REMINDER_TEMPLATE_ID);
    requireValue(errors, 'WECHAT_REMINDER_TEMPLATE_DATA_JSON', env.WECHAT_REMINDER_TEMPLATE_DATA_JSON);
    requireValue(errors, 'CORS_ORIGIN', env.CORS_ORIGIN);
    if (mediaDriver === 'cos') {
        requireValue(errors, 'COS_SECRET_ID', env.COS_SECRET_ID);
        requireValue(errors, 'COS_SECRET_KEY', env.COS_SECRET_KEY);
        requireValue(errors, 'COS_BUCKET', env.COS_BUCKET);
        requireValue(errors, 'COS_REGION', env.COS_REGION);
        requireValue(errors, 'COS_PUBLIC_BASE_URL', env.COS_PUBLIC_BASE_URL);
    }
    if (errors.length) {
        throw new Error(`生产环境配置校验失败：${errors.join('；')}`);
    }
}
function getReadinessReport(configService) {
    const issues = [];
    const driver = configService.get('media.driver', 'local');
    if (isProductionEnvironment(process.env)) {
        try {
            validateEnvironmentOrThrow(process.env);
        }
        catch (error) {
            issues.push(error instanceof Error ? error.message : '生产环境配置校验失败');
        }
    }
    if (driver === 'cos') {
        const requiredKeys = [
            ['COS_SECRET_ID', configService.get('media.cosSecretId', '')],
            ['COS_SECRET_KEY', configService.get('media.cosSecretKey', '')],
            ['COS_BUCKET', configService.get('media.cosBucket', '')],
            ['COS_REGION', configService.get('media.cosRegion', '')],
            ['COS_PUBLIC_BASE_URL', configService.get('media.cosPublicBaseUrl', '')],
        ];
        requiredKeys.forEach(([key, value]) => {
            if (!String(value || '').trim()) {
                issues.push(`对象存储配置缺少 ${key}`);
            }
        });
    }
    return {
        ok: issues.length === 0,
        issues,
    };
}


/***/ },

/***/ "./src/entities/admin.entity.ts"
/*!**************************************!*\
  !*** ./src/entities/admin.entity.ts ***!
  \**************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Admin = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const admin_role_enum_1 = __webpack_require__(/*! ../common/enums/admin-role.enum */ "./src/common/enums/admin-role.enum.ts");
let Admin = class Admin {
};
exports.Admin = Admin;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Admin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 64 }),
    __metadata("design:type", String)
], Admin.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Admin.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: admin_role_enum_1.AdminRole.EDITOR }),
    __metadata("design:type", typeof (_a = typeof admin_role_enum_1.AdminRole !== "undefined" && admin_role_enum_1.AdminRole) === "function" ? _a : Object)
], Admin.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Admin.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Admin.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Admin.prototype, "updatedAt", void 0);
exports.Admin = Admin = __decorate([
    (0, typeorm_1.Entity)('admins')
], Admin);


/***/ },

/***/ "./src/entities/agent-cache.entity.ts"
/*!********************************************!*\
  !*** ./src/entities/agent-cache.entity.ts ***!
  \********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AgentCache = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let AgentCache = class AgentCache {
};
exports.AgentCache = AgentCache;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AgentCache.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], AgentCache.prototype, "questionKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], AgentCache.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AgentCache.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AgentCache.prototype, "hitCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], AgentCache.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], AgentCache.prototype, "updatedAt", void 0);
exports.AgentCache = AgentCache = __decorate([
    (0, typeorm_1.Entity)('agent_cache'),
    (0, typeorm_1.Index)(['questionKey'], { unique: true })
], AgentCache);


/***/ },

/***/ "./src/entities/auth-session.entity.ts"
/*!*********************************************!*\
  !*** ./src/entities/auth-session.entity.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthSession = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let AuthSession = class AuthSession {
};
exports.AuthSession = AuthSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AuthSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], AuthSession.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 16 }),
    __metadata("design:type", String)
], AuthSession.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AuthSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128 }),
    __metadata("design:type", String)
], AuthSession.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AuthSession.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], AuthSession.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], AuthSession.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], AuthSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], AuthSession.prototype, "updatedAt", void 0);
exports.AuthSession = AuthSession = __decorate([
    (0, typeorm_1.Entity)('auth_sessions'),
    (0, typeorm_1.Index)(['sessionId'], { unique: true })
], AuthSession);


/***/ },

/***/ "./src/entities/badge.entity.ts"
/*!**************************************!*\
  !*** ./src/entities/badge.entity.ts ***!
  \**************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Badge = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ./user.entity */ "./src/entities/user.entity.ts");
let Badge = class Badge {
};
exports.Badge = Badge;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Badge.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Badge.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.badges, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], Badge.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], Badge.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Badge.prototype, "unlockedAt", void 0);
exports.Badge = Badge = __decorate([
    (0, typeorm_1.Entity)('badges')
], Badge);


/***/ },

/***/ "./src/entities/base-content.entity.ts"
/*!*********************************************!*\
  !*** ./src/entities/base-content.entity.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseContentEntity = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
class BaseContentEntity extends typeorm_1.BaseEntity {
}
exports.BaseContentEntity = BaseContentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BaseContentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], BaseContentEntity.prototype, "buyiText", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], BaseContentEntity.prototype, "zhText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], BaseContentEntity.prototype, "enText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BaseContentEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BaseContentEntity.prototype, "culturalNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], BaseContentEntity.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BaseContentEntity.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: '' }),
    __metadata("design:type", String)
], BaseContentEntity.prototype, "zhSortKey", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BaseContentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], BaseContentEntity.prototype, "updatedAt", void 0);


/***/ },

/***/ "./src/entities/content-culture-link.entity.ts"
/*!*****************************************************!*\
  !*** ./src/entities/content-culture-link.entity.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentCultureLink = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const culture_exhibit_entity_1 = __webpack_require__(/*! ./culture-exhibit.entity */ "./src/entities/culture-exhibit.entity.ts");
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
    __metadata("design:type", typeof (_a = typeof culture_exhibit_entity_1.CultureExhibit !== "undefined" && culture_exhibit_entity_1.CultureExhibit) === "function" ? _a : Object)
], ContentCultureLink.prototype, "exhibit", void 0);
exports.ContentCultureLink = ContentCultureLink = __decorate([
    (0, typeorm_1.Entity)('content_culture_links'),
    (0, typeorm_1.Index)(['contentType', 'contentId', 'exhibitId'], { unique: true })
], ContentCultureLink);


/***/ },

/***/ "./src/entities/culture-exhibit.entity.ts"
/*!************************************************!*\
  !*** ./src/entities/culture-exhibit.entity.ts ***!
  \************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CultureExhibit = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
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
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], CultureExhibit.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], CultureExhibit.prototype, "updatedAt", void 0);
exports.CultureExhibit = CultureExhibit = __decorate([
    (0, typeorm_1.Entity)('culture_exhibits')
], CultureExhibit);


/***/ },

/***/ "./src/entities/dictionary-entry.entity.ts"
/*!*************************************************!*\
  !*** ./src/entities/dictionary-entry.entity.ts ***!
  \*************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DictionaryEntry = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_content_entity_1 = __webpack_require__(/*! ./base-content.entity */ "./src/entities/base-content.entity.ts");
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


/***/ },

/***/ "./src/entities/favorite.entity.ts"
/*!*****************************************!*\
  !*** ./src/entities/favorite.entity.ts ***!
  \*****************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Favorite = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const content_type_enum_1 = __webpack_require__(/*! ../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const user_entity_1 = __webpack_require__(/*! ./user.entity */ "./src/entities/user.entity.ts");
let Favorite = class Favorite {
};
exports.Favorite = Favorite;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Favorite.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Favorite.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.favorites, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], Favorite.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32 }),
    __metadata("design:type", typeof (_b = typeof content_type_enum_1.ContentType !== "undefined" && content_type_enum_1.ContentType) === "function" ? _b : Object)
], Favorite.prototype, "contentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Favorite.prototype, "contentId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Favorite.prototype, "createdAt", void 0);
exports.Favorite = Favorite = __decorate([
    (0, typeorm_1.Entity)('favorites'),
    (0, typeorm_1.Index)(['userId', 'contentType', 'contentId'], { unique: true })
], Favorite);


/***/ },

/***/ "./src/entities/learning-record.entity.ts"
/*!************************************************!*\
  !*** ./src/entities/learning-record.entity.ts ***!
  \************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LearningRecord = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const content_type_enum_1 = __webpack_require__(/*! ../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const user_entity_1 = __webpack_require__(/*! ./user.entity */ "./src/entities/user.entity.ts");
let LearningRecord = class LearningRecord {
};
exports.LearningRecord = LearningRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LearningRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LearningRecord.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.learningRecords, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], LearningRecord.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32 }),
    __metadata("design:type", typeof (_b = typeof content_type_enum_1.ContentType !== "undefined" && content_type_enum_1.ContentType) === "function" ? _b : Object)
], LearningRecord.prototype, "contentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LearningRecord.prototype, "contentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 16 }),
    __metadata("design:type", String)
], LearningRecord.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], LearningRecord.prototype, "createdAt", void 0);
exports.LearningRecord = LearningRecord = __decorate([
    (0, typeorm_1.Entity)('learning_records')
], LearningRecord);


/***/ },

/***/ "./src/entities/media-asset.entity.ts"
/*!********************************************!*\
  !*** ./src/entities/media-asset.entity.ts ***!
  \********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaAsset = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
let MediaAsset = class MediaAsset {
};
exports.MediaAsset = MediaAsset;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MediaAsset.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], MediaAsset.prototype, "kind", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], MediaAsset.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], MediaAsset.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], MediaAsset.prototype, "storageKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], MediaAsset.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MediaAsset.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], MediaAsset.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MediaAsset.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], MediaAsset.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], MediaAsset.prototype, "updatedAt", void 0);
exports.MediaAsset = MediaAsset = __decorate([
    (0, typeorm_1.Entity)('media_assets')
], MediaAsset);


/***/ },

/***/ "./src/entities/phrase.entity.ts"
/*!***************************************!*\
  !*** ./src/entities/phrase.entity.ts ***!
  \***************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Phrase = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_content_entity_1 = __webpack_require__(/*! ./base-content.entity */ "./src/entities/base-content.entity.ts");
let Phrase = class Phrase extends base_content_entity_1.BaseContentEntity {
};
exports.Phrase = Phrase;
exports.Phrase = Phrase = __decorate([
    (0, typeorm_1.Entity)('phrases')
], Phrase);


/***/ },

/***/ "./src/entities/proverb.entity.ts"
/*!****************************************!*\
  !*** ./src/entities/proverb.entity.ts ***!
  \****************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Proverb = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_content_entity_1 = __webpack_require__(/*! ./base-content.entity */ "./src/entities/base-content.entity.ts");
let Proverb = class Proverb extends base_content_entity_1.BaseContentEntity {
};
exports.Proverb = Proverb;
exports.Proverb = Proverb = __decorate([
    (0, typeorm_1.Entity)('proverbs')
], Proverb);


/***/ },

/***/ "./src/entities/quiz-attempt.entity.ts"
/*!*********************************************!*\
  !*** ./src/entities/quiz-attempt.entity.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuizAttempt = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ./user.entity */ "./src/entities/user.entity.ts");
let QuizAttempt = class QuizAttempt {
};
exports.QuizAttempt = QuizAttempt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.quizAttempts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], QuizAttempt.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "correctCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "totalQuestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "answersJson", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], QuizAttempt.prototype, "createdAt", void 0);
exports.QuizAttempt = QuizAttempt = __decorate([
    (0, typeorm_1.Entity)('quiz_attempts'),
    (0, typeorm_1.Index)(['userId', 'createdAt'])
], QuizAttempt);


/***/ },

/***/ "./src/entities/song.entity.ts"
/*!*************************************!*\
  !*** ./src/entities/song.entity.ts ***!
  \*************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Song = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_content_entity_1 = __webpack_require__(/*! ./base-content.entity */ "./src/entities/base-content.entity.ts");
let Song = class Song extends base_content_entity_1.BaseContentEntity {
};
exports.Song = Song;
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Song.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Song.prototype, "artist", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], Song.prototype, "coverUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], Song.prototype, "audioUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Song.prototype, "lyrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Song.prototype, "coverMediaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Song.prototype, "audioMediaId", void 0);
exports.Song = Song = __decorate([
    (0, typeorm_1.Entity)('songs')
], Song);


/***/ },

/***/ "./src/entities/user-setting.entity.ts"
/*!*********************************************!*\
  !*** ./src/entities/user-setting.entity.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserSetting = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ./user.entity */ "./src/entities/user.entity.ts");
let UserSetting = class UserSetting {
};
exports.UserSetting = UserSetting;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserSetting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserSetting.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.settings, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], UserSetting.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 32 }),
    __metadata("design:type", String)
], UserSetting.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], UserSetting.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], UserSetting.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], UserSetting.prototype, "updatedAt", void 0);
exports.UserSetting = UserSetting = __decorate([
    (0, typeorm_1.Entity)('user_settings'),
    (0, typeorm_1.Index)(['userId', 'key'], { unique: true })
], UserSetting);


/***/ },

/***/ "./src/entities/user.entity.ts"
/*!*************************************!*\
  !*** ./src/entities/user.entity.ts ***!
  \*************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const badge_entity_1 = __webpack_require__(/*! ./badge.entity */ "./src/entities/badge.entity.ts");
const favorite_entity_1 = __webpack_require__(/*! ./favorite.entity */ "./src/entities/favorite.entity.ts");
const learning_record_entity_1 = __webpack_require__(/*! ./learning-record.entity */ "./src/entities/learning-record.entity.ts");
const quiz_attempt_entity_1 = __webpack_require__(/*! ./quiz-attempt.entity */ "./src/entities/quiz-attempt.entity.ts");
const user_setting_entity_1 = __webpack_require__(/*! ./user-setting.entity */ "./src/entities/user-setting.entity.ts");
const wechat_account_entity_1 = __webpack_require__(/*! ./wechat-account.entity */ "./src/entities/wechat-account.entity.ts");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true, unique: true }),
    __metadata("design:type", Object)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "lastLoginTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => wechat_account_entity_1.WechatAccount, (wechatAccount) => wechatAccount.user),
    __metadata("design:type", Array)
], User.prototype, "wechatAccounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => favorite_entity_1.Favorite, (favorite) => favorite.user),
    __metadata("design:type", Array)
], User.prototype, "favorites", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => learning_record_entity_1.LearningRecord, (record) => record.user),
    __metadata("design:type", Array)
], User.prototype, "learningRecords", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quiz_attempt_entity_1.QuizAttempt, (attempt) => attempt.user),
    __metadata("design:type", Array)
], User.prototype, "quizAttempts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => badge_entity_1.Badge, (badge) => badge.user),
    __metadata("design:type", Array)
], User.prototype, "badges", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_setting_entity_1.UserSetting, (setting) => setting.user),
    __metadata("design:type", Array)
], User.prototype, "settings", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);


/***/ },

/***/ "./src/entities/wechat-account.entity.ts"
/*!***********************************************!*\
  !*** ./src/entities/wechat-account.entity.ts ***!
  \***********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WechatAccount = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ./user.entity */ "./src/entities/user.entity.ts");
let WechatAccount = class WechatAccount {
};
exports.WechatAccount = WechatAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WechatAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], WechatAccount.prototype, "openid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", Object)
], WechatAccount.prototype, "unionid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", Object)
], WechatAccount.prototype, "sessionKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WechatAccount.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.wechatAccounts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], WechatAccount.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], WechatAccount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], WechatAccount.prototype, "updatedAt", void 0);
exports.WechatAccount = WechatAccount = __decorate([
    (0, typeorm_1.Entity)('wechat_accounts')
], WechatAccount);


/***/ },

/***/ "./src/migrations/1710000000000-baseline-schema.ts"
/*!*********************************************************!*\
  !*** ./src/migrations/1710000000000-baseline-schema.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaselineSchema1710000000000 = void 0;
class BaselineSchema1710000000000 {
    constructor() {
        this.name = 'BaselineSchema1710000000000';
    }
    async up(queryRunner) {
        await queryRunner.connection.synchronize(false);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS learning_records');
        await queryRunner.query('DROP TABLE IF EXISTS favorites');
        await queryRunner.query('DROP TABLE IF EXISTS songs');
        await queryRunner.query('DROP TABLE IF EXISTS proverbs');
        await queryRunner.query('DROP TABLE IF EXISTS phrases');
        await queryRunner.query('DROP TABLE IF EXISTS dictionary_entries');
        await queryRunner.query('DROP TABLE IF EXISTS media_assets');
        await queryRunner.query('DROP TABLE IF EXISTS user_settings');
        await queryRunner.query('DROP TABLE IF EXISTS wechat_accounts');
        await queryRunner.query('DROP TABLE IF EXISTS users');
        await queryRunner.query('DROP TABLE IF EXISTS auth_sessions');
        await queryRunner.query('DROP TABLE IF EXISTS admins');
    }
}
exports.BaselineSchema1710000000000 = BaselineSchema1710000000000;


/***/ },

/***/ "./src/migrations/1721000000000-add-culture-exhibits.ts"
/*!**************************************************************!*\
  !*** ./src/migrations/1721000000000-add-culture-exhibits.ts ***!
  \**************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddCultureExhibits1721000000000 = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
class AddCultureExhibits1721000000000 {
    constructor() {
        this.name = 'AddCultureExhibits1721000000000';
    }
    async up(queryRunner) {
        if (!await queryRunner.hasTable('culture_exhibits')) {
            await queryRunner.createTable(new typeorm_1.Table({
                name: 'culture_exhibits',
                columns: [
                    { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'slug', type: 'varchar', length: '96', isUnique: true },
                    { name: 'title', type: 'varchar', length: '120' },
                    { name: 'kicker', type: 'varchar', length: '120', default: "''" },
                    { name: 'summary', type: 'text' },
                    { name: 'story', type: 'text', default: "''" },
                    { name: 'patternLabel', type: 'varchar', length: '120', default: "''" },
                    { name: 'toneIndex', type: 'integer', isNullable: true },
                    { name: 'featuredSongId', type: 'integer', isNullable: true },
                    { name: 'sourceTitle', type: 'varchar', length: '255', default: "''" },
                    { name: 'sourceUrl', type: 'varchar', length: '500', default: "''" },
                    { name: 'sourceStatus', type: 'varchar', length: '40', default: "'verified'" },
                    { name: 'isPublished', type: 'boolean', default: '1' },
                    { name: 'sortOrder', type: 'integer', default: '0' },
                    { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }));
        }
        if (!await queryRunner.hasTable('content_culture_links')) {
            await queryRunner.createTable(new typeorm_1.Table({
                name: 'content_culture_links',
                columns: [
                    { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'contentType', type: 'varchar', length: '32' },
                    { name: 'contentId', type: 'integer' },
                    { name: 'exhibitId', type: 'integer' },
                    { name: 'sortOrder', type: 'integer', default: '0' },
                ],
            }));
            await queryRunner.createForeignKey('content_culture_links', new typeorm_1.TableForeignKey({
                columnNames: ['exhibitId'],
                referencedTableName: 'culture_exhibits',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }));
            await queryRunner.createIndex('content_culture_links', new typeorm_1.TableIndex({
                name: 'IDX_content_culture_link_unique',
                columnNames: ['contentType', 'contentId', 'exhibitId'],
                isUnique: true,
            }));
        }
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS content_culture_links');
        await queryRunner.query('DROP TABLE IF EXISTS culture_exhibits');
    }
}
exports.AddCultureExhibits1721000000000 = AddCultureExhibits1721000000000;


/***/ },

/***/ "./src/migrations/1722000000000-add-quiz-attempts.ts"
/*!***********************************************************!*\
  !*** ./src/migrations/1722000000000-add-quiz-attempts.ts ***!
  \***********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddQuizAttempts1722000000000 = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
class AddQuizAttempts1722000000000 {
    constructor() {
        this.name = 'AddQuizAttempts1722000000000';
    }
    async up(queryRunner) {
        if (await queryRunner.hasTable('quiz_attempts'))
            return;
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'quiz_attempts',
            columns: [
                { name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                { name: 'userId', type: 'integer' },
                { name: 'score', type: 'integer' },
                { name: 'correctCount', type: 'integer' },
                { name: 'totalQuestions', type: 'integer' },
                { name: 'answersJson', type: 'text' },
                { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
            ],
        }));
        await queryRunner.createForeignKey('quiz_attempts', new typeorm_1.TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
        }));
        await queryRunner.createIndex('quiz_attempts', new typeorm_1.TableIndex({
            name: 'IDX_quiz_attempt_user_created',
            columnNames: ['userId', 'createdAt'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS quiz_attempts');
    }
}
exports.AddQuizAttempts1722000000000 = AddQuizAttempts1722000000000;


/***/ },

/***/ "./src/modules/admin-auth/admin-auth.controller.ts"
/*!*********************************************************!*\
  !*** ./src/modules/admin-auth/admin-auth.controller.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminAuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const refresh_token_dto_1 = __webpack_require__(/*! ../../common/dto/refresh-token.dto */ "./src/common/dto/refresh-token.dto.ts");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const admin_auth_service_1 = __webpack_require__(/*! ./admin-auth.service */ "./src/modules/admin-auth/admin-auth.service.ts");
const admin_login_dto_1 = __webpack_require__(/*! ./dto/admin-login.dto */ "./src/modules/admin-auth/dto/admin-login.dto.ts");
let AdminAuthController = class AdminAuthController {
    constructor(adminAuthService) {
        this.adminAuthService = adminAuthService;
    }
    login(payload) {
        return this.adminAuthService.login(payload);
    }
    refresh(payload) {
        return this.adminAuthService.refresh(payload.refreshToken);
    }
    logout(user) {
        return this.adminAuthService.logout(user.sid);
    }
};
exports.AdminAuthController = AdminAuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof admin_login_dto_1.AdminLoginDto !== "undefined" && admin_login_dto_1.AdminLoginDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AdminAuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof refresh_token_dto_1.RefreshTokenDto !== "undefined" && refresh_token_dto_1.RefreshTokenDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AdminAuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminAuthController.prototype, "logout", null);
exports.AdminAuthController = AdminAuthController = __decorate([
    (0, common_1.Controller)('admin/auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof admin_auth_service_1.AdminAuthService !== "undefined" && admin_auth_service_1.AdminAuthService) === "function" ? _a : Object])
], AdminAuthController);


/***/ },

/***/ "./src/modules/admin-auth/admin-auth.module.ts"
/*!*****************************************************!*\
  !*** ./src/modules/admin-auth/admin-auth.module.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminAuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const admin_entity_1 = __webpack_require__(/*! ../../entities/admin.entity */ "./src/entities/admin.entity.ts");
const auth_sessions_module_1 = __webpack_require__(/*! ../auth-sessions/auth-sessions.module */ "./src/modules/auth-sessions/auth-sessions.module.ts");
const admin_auth_controller_1 = __webpack_require__(/*! ./admin-auth.controller */ "./src/modules/admin-auth/admin-auth.controller.ts");
const admin_auth_service_1 = __webpack_require__(/*! ./admin-auth.service */ "./src/modules/admin-auth/admin-auth.service.ts");
let AdminAuthModule = class AdminAuthModule {
};
exports.AdminAuthModule = AdminAuthModule;
exports.AdminAuthModule = AdminAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([admin_entity_1.Admin]), auth_sessions_module_1.AuthSessionsModule],
        controllers: [admin_auth_controller_1.AdminAuthController],
        providers: [admin_auth_service_1.AdminAuthService],
        exports: [admin_auth_service_1.AdminAuthService],
    })
], AdminAuthModule);


/***/ },

/***/ "./src/modules/admin-auth/admin-auth.service.ts"
/*!******************************************************!*\
  !*** ./src/modules/admin-auth/admin-auth.service.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminAuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const bcrypt = __webpack_require__(/*! bcryptjs */ "bcryptjs");
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const admin_entity_1 = __webpack_require__(/*! ../../entities/admin.entity */ "./src/entities/admin.entity.ts");
const auth_sessions_service_1 = __webpack_require__(/*! ../auth-sessions/auth-sessions.service */ "./src/modules/auth-sessions/auth-sessions.service.ts");
let AdminAuthService = class AdminAuthService {
    constructor(adminRepository, jwtService, configService, authSessionsService) {
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.authSessionsService = authSessionsService;
    }
    async login(payload) {
        const admin = await this.adminRepository.findOne({ where: { username: payload.username } });
        if (!admin?.isActive) {
            throw new common_1.UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef');
        }
        const isValid = await bcrypt.compare(payload.password, admin.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef');
        }
        const tokens = await this.issueTokens(admin);
        return {
            ...tokens,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role,
            },
        };
    }
    async refresh(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        const session = await this.authSessionsService.validateRefreshToken({
            sessionId: payload.sid,
            userType: 'admin',
            userId: payload.sub,
            refreshToken,
        });
        if (!session) {
            throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
        const admin = await this.adminRepository.findOne({
            where: { id: payload.sub, isActive: true },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u4e0d\u53ef\u7528');
        }
        const tokens = await this.issueTokens(admin, session.sessionId, false);
        await this.authSessionsService.rotateRefreshToken(session.sessionId, tokens.refreshToken, this.getTokenExpiry(tokens.refreshToken));
        return {
            ...tokens,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role,
            },
        };
    }
    async logout(sessionId) {
        await this.authSessionsService.deactivateSession(sessionId, 'admin');
        return {
            success: true,
            message: '\u5df2\u9000\u51fa\u767b\u5f55',
        };
    }
    async issueTokens(admin, sessionId, persistSession = true) {
        const resolvedSessionId = sessionId ?? (0, crypto_1.randomUUID)();
        const accessToken = await this.jwtService.signAsync({
            sub: admin.id,
            sid: resolvedSessionId,
            username: admin.username,
            role: admin.role,
            tokenType: 'admin',
            tokenKind: 'access',
        }, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.adminExpiresIn', '1d'),
        });
        const refreshToken = await this.jwtService.signAsync({
            sub: admin.id,
            sid: resolvedSessionId,
            tokenType: 'admin',
            tokenKind: 'refresh',
        }, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.adminRefreshExpiresIn', '14d'),
        });
        if (persistSession) {
            await this.authSessionsService.createSession({
                sessionId: resolvedSessionId,
                userType: 'admin',
                userId: admin.id,
                refreshToken,
                expiresAt: this.getTokenExpiry(refreshToken),
            });
        }
        return {
            accessToken,
            refreshToken,
        };
    }
    verifyRefreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.secret'),
            });
            if (payload.tokenType !== 'admin' || payload.tokenKind !== 'refresh') {
                throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u4e0d\u53ef\u7528');
            }
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
    }
    getTokenExpiry(token) {
        const payload = this.jwtService.decode(token);
        if (!payload?.exp) {
            throw new common_1.UnauthorizedException('\u65e0\u6cd5\u89e3\u6790\u5237\u65b0\u4ee4\u724c\u8fc7\u671f\u65f6\u95f4');
        }
        return new Date(payload.exp * 1000);
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object, typeof (_d = typeof auth_sessions_service_1.AuthSessionsService !== "undefined" && auth_sessions_service_1.AuthSessionsService) === "function" ? _d : Object])
], AdminAuthService);


/***/ },

/***/ "./src/modules/admin-auth/dto/admin-login.dto.ts"
/*!*******************************************************!*\
  !*** ./src/modules/admin-auth/dto/admin-login.dto.ts ***!
  \*******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminLoginDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class AdminLoginDto {
}
exports.AdminLoginDto = AdminLoginDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AdminLoginDto.prototype, "password", void 0);


/***/ },

/***/ "./src/modules/admin-content/admin-content.module.ts"
/*!***********************************************************!*\
  !*** ./src/modules/admin-content/admin-content.module.ts ***!
  \***********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminContentModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const admin_dictionary_controller_1 = __webpack_require__(/*! ./admin-dictionary.controller */ "./src/modules/admin-content/admin-dictionary.controller.ts");
const admin_phrases_controller_1 = __webpack_require__(/*! ./admin-phrases.controller */ "./src/modules/admin-content/admin-phrases.controller.ts");
const admin_proverbs_controller_1 = __webpack_require__(/*! ./admin-proverbs.controller */ "./src/modules/admin-content/admin-proverbs.controller.ts");
const admin_songs_controller_1 = __webpack_require__(/*! ./admin-songs.controller */ "./src/modules/admin-content/admin-songs.controller.ts");
let AdminContentModule = class AdminContentModule {
};
exports.AdminContentModule = AdminContentModule;
exports.AdminContentModule = AdminContentModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule],
        controllers: [admin_dictionary_controller_1.AdminDictionaryController, admin_phrases_controller_1.AdminPhrasesController, admin_proverbs_controller_1.AdminProverbsController, admin_songs_controller_1.AdminSongsController],
    })
], AdminContentModule);


/***/ },

/***/ "./src/modules/admin-content/admin-dictionary.controller.ts"
/*!******************************************************************!*\
  !*** ./src/modules/admin-content/admin-dictionary.controller.ts ***!
  \******************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminDictionaryController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const express_1 = __webpack_require__(/*! express */ "express");
const multer_1 = __webpack_require__(/*! multer */ "multer");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const content_admin_dto_1 = __webpack_require__(/*! ../content/dto/content-admin.dto */ "./src/modules/content/dto/content-admin.dto.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
let AdminDictionaryController = class AdminDictionaryController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.getAdminList(content_type_enum_1.ContentType.DICTIONARY, query);
    }
    create(payload) {
        return this.contentService.createDictionary(payload);
    }
    template(res) {
        const template = this.contentService.getImportTemplate(content_type_enum_1.ContentType.DICTIONARY);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
        res.send(template.buffer);
    }
    preview(file, mode, skipDuplicates) {
        return this.contentService.previewImport(content_type_enum_1.ContentType.DICTIONARY, file, mode, skipDuplicates);
    }
    import(file, mode, skipDuplicates) {
        return this.contentService.importContent(content_type_enum_1.ContentType.DICTIONARY, file, mode, skipDuplicates);
    }
    update(id, payload) {
        return this.contentService.updateDictionary(id, payload);
    }
    remove(id) {
        return this.contentService.delete(content_type_enum_1.ContentType.DICTIONARY, id);
    }
};
exports.AdminDictionaryController = AdminDictionaryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof content_admin_dto_1.DictionaryAdminDto !== "undefined" && content_admin_dto_1.DictionaryAdminDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "template", null);
__decorate([
    (0, common_1.Post)('import-preview'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "import", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof content_admin_dto_1.UpdateDictionaryAdminDto !== "undefined" && content_admin_dto_1.UpdateDictionaryAdminDto) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "remove", null);
exports.AdminDictionaryController = AdminDictionaryController = __decorate([
    (0, common_1.Controller)('admin/dictionary'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object])
], AdminDictionaryController);


/***/ },

/***/ "./src/modules/admin-content/admin-phrases.controller.ts"
/*!***************************************************************!*\
  !*** ./src/modules/admin-content/admin-phrases.controller.ts ***!
  \***************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminPhrasesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const express_1 = __webpack_require__(/*! express */ "express");
const multer_1 = __webpack_require__(/*! multer */ "multer");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const content_admin_dto_1 = __webpack_require__(/*! ../content/dto/content-admin.dto */ "./src/modules/content/dto/content-admin.dto.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
let AdminPhrasesController = class AdminPhrasesController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.getAdminList(content_type_enum_1.ContentType.PHRASE, query);
    }
    create(payload) {
        return this.contentService.createSimple(content_type_enum_1.ContentType.PHRASE, payload);
    }
    template(res) {
        const template = this.contentService.getImportTemplate(content_type_enum_1.ContentType.PHRASE);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
        res.send(template.buffer);
    }
    preview(file, mode, skipDuplicates) {
        return this.contentService.previewImport(content_type_enum_1.ContentType.PHRASE, file, mode, skipDuplicates);
    }
    import(file, mode, skipDuplicates) {
        return this.contentService.importContent(content_type_enum_1.ContentType.PHRASE, file, mode, skipDuplicates);
    }
    update(id, payload) {
        return this.contentService.updateSimple(content_type_enum_1.ContentType.PHRASE, id, payload);
    }
    remove(id) {
        return this.contentService.delete(content_type_enum_1.ContentType.PHRASE, id);
    }
};
exports.AdminPhrasesController = AdminPhrasesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AdminPhrasesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof content_admin_dto_1.BaseAdminContentDto !== "undefined" && content_admin_dto_1.BaseAdminContentDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AdminPhrasesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], AdminPhrasesController.prototype, "template", null);
__decorate([
    (0, common_1.Post)('import-preview'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminPhrasesController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminPhrasesController.prototype, "import", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof content_admin_dto_1.UpdateBaseAdminContentDto !== "undefined" && content_admin_dto_1.UpdateBaseAdminContentDto) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AdminPhrasesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminPhrasesController.prototype, "remove", null);
exports.AdminPhrasesController = AdminPhrasesController = __decorate([
    (0, common_1.Controller)('admin/phrases'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object])
], AdminPhrasesController);


/***/ },

/***/ "./src/modules/admin-content/admin-proverbs.controller.ts"
/*!****************************************************************!*\
  !*** ./src/modules/admin-content/admin-proverbs.controller.ts ***!
  \****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminProverbsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const express_1 = __webpack_require__(/*! express */ "express");
const multer_1 = __webpack_require__(/*! multer */ "multer");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const content_admin_dto_1 = __webpack_require__(/*! ../content/dto/content-admin.dto */ "./src/modules/content/dto/content-admin.dto.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
let AdminProverbsController = class AdminProverbsController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.getAdminList(content_type_enum_1.ContentType.PROVERB, query);
    }
    create(payload) {
        return this.contentService.createSimple(content_type_enum_1.ContentType.PROVERB, payload);
    }
    template(res) {
        const template = this.contentService.getImportTemplate(content_type_enum_1.ContentType.PROVERB);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
        res.send(template.buffer);
    }
    preview(file, mode, skipDuplicates) {
        return this.contentService.previewImport(content_type_enum_1.ContentType.PROVERB, file, mode, skipDuplicates);
    }
    import(file, mode, skipDuplicates) {
        return this.contentService.importContent(content_type_enum_1.ContentType.PROVERB, file, mode, skipDuplicates);
    }
    update(id, payload) {
        return this.contentService.updateSimple(content_type_enum_1.ContentType.PROVERB, id, payload);
    }
    remove(id) {
        return this.contentService.delete(content_type_enum_1.ContentType.PROVERB, id);
    }
};
exports.AdminProverbsController = AdminProverbsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AdminProverbsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof content_admin_dto_1.BaseAdminContentDto !== "undefined" && content_admin_dto_1.BaseAdminContentDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AdminProverbsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], AdminProverbsController.prototype, "template", null);
__decorate([
    (0, common_1.Post)('import-preview'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminProverbsController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminProverbsController.prototype, "import", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof content_admin_dto_1.UpdateBaseAdminContentDto !== "undefined" && content_admin_dto_1.UpdateBaseAdminContentDto) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AdminProverbsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminProverbsController.prototype, "remove", null);
exports.AdminProverbsController = AdminProverbsController = __decorate([
    (0, common_1.Controller)('admin/proverbs'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object])
], AdminProverbsController);


/***/ },

/***/ "./src/modules/admin-content/admin-songs.controller.ts"
/*!*************************************************************!*\
  !*** ./src/modules/admin-content/admin-songs.controller.ts ***!
  \*************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminSongsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const express_1 = __webpack_require__(/*! express */ "express");
const multer_1 = __webpack_require__(/*! multer */ "multer");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
const content_admin_dto_1 = __webpack_require__(/*! ../content/dto/content-admin.dto */ "./src/modules/content/dto/content-admin.dto.ts");
let AdminSongsController = class AdminSongsController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.getAdminList(content_type_enum_1.ContentType.SONG, query);
    }
    create(payload) {
        return this.contentService.createSong(payload);
    }
    template(res) {
        const template = this.contentService.getImportTemplate(content_type_enum_1.ContentType.SONG);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
        res.send(template.buffer);
    }
    preview(file, mode, skipDuplicates) {
        return this.contentService.previewImport(content_type_enum_1.ContentType.SONG, file, mode, skipDuplicates);
    }
    import(file, mode, skipDuplicates) {
        return this.contentService.importContent(content_type_enum_1.ContentType.SONG, file, mode, skipDuplicates);
    }
    update(id, payload) {
        return this.contentService.updateSong(id, payload);
    }
    remove(id) {
        return this.contentService.delete(content_type_enum_1.ContentType.SONG, id);
    }
};
exports.AdminSongsController = AdminSongsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AdminSongsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof content_admin_dto_1.SongAdminDto !== "undefined" && content_admin_dto_1.SongAdminDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AdminSongsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], AdminSongsController.prototype, "template", null);
__decorate([
    (0, common_1.Post)('import-preview'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminSongsController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminSongsController.prototype, "import", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof content_admin_dto_1.UpdateSongAdminDto !== "undefined" && content_admin_dto_1.UpdateSongAdminDto) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], AdminSongsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminSongsController.prototype, "remove", null);
exports.AdminSongsController = AdminSongsController = __decorate([
    (0, common_1.Controller)('admin/songs'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object])
], AdminSongsController);


/***/ },

/***/ "./src/modules/admin-dashboard/admin-dashboard.controller.ts"
/*!*******************************************************************!*\
  !*** ./src/modules/admin-dashboard/admin-dashboard.controller.ts ***!
  \*******************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminDashboardController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const admin_dashboard_service_1 = __webpack_require__(/*! ./admin-dashboard.service */ "./src/modules/admin-dashboard/admin-dashboard.service.ts");
let AdminDashboardController = class AdminDashboardController {
    constructor(adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }
    summary() {
        return this.adminDashboardService.getSummary();
    }
    batchPublish() {
        return this.adminDashboardService.batchPublishAll();
    }
};
exports.AdminDashboardController = AdminDashboardController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminDashboardController.prototype, "summary", null);
__decorate([
    (0, common_1.Post)('batch-publish'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminDashboardController.prototype, "batchPublish", null);
exports.AdminDashboardController = AdminDashboardController = __decorate([
    (0, common_1.Controller)('admin/dashboard'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof admin_dashboard_service_1.AdminDashboardService !== "undefined" && admin_dashboard_service_1.AdminDashboardService) === "function" ? _a : Object])
], AdminDashboardController);


/***/ },

/***/ "./src/modules/admin-dashboard/admin-dashboard.module.ts"
/*!***************************************************************!*\
  !*** ./src/modules/admin-dashboard/admin-dashboard.module.ts ***!
  \***************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminDashboardModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const favorite_entity_1 = __webpack_require__(/*! ../../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const phrase_entity_1 = __webpack_require__(/*! ../../entities/phrase.entity */ "./src/entities/phrase.entity.ts");
const proverb_entity_1 = __webpack_require__(/*! ../../entities/proverb.entity */ "./src/entities/proverb.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../../entities/song.entity */ "./src/entities/song.entity.ts");
const user_entity_1 = __webpack_require__(/*! ../../entities/user.entity */ "./src/entities/user.entity.ts");
const admin_dashboard_controller_1 = __webpack_require__(/*! ./admin-dashboard.controller */ "./src/modules/admin-dashboard/admin-dashboard.controller.ts");
const admin_dashboard_service_1 = __webpack_require__(/*! ./admin-dashboard.service */ "./src/modules/admin-dashboard/admin-dashboard.service.ts");
let AdminDashboardModule = class AdminDashboardModule {
};
exports.AdminDashboardModule = AdminDashboardModule;
exports.AdminDashboardModule = AdminDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, dictionary_entry_entity_1.DictionaryEntry, phrase_entity_1.Phrase, proverb_entity_1.Proverb, song_entity_1.Song, favorite_entity_1.Favorite, learning_record_entity_1.LearningRecord])],
        controllers: [admin_dashboard_controller_1.AdminDashboardController],
        providers: [admin_dashboard_service_1.AdminDashboardService],
    })
], AdminDashboardModule);


/***/ },

/***/ "./src/modules/admin-dashboard/admin-dashboard.service.ts"
/*!****************************************************************!*\
  !*** ./src/modules/admin-dashboard/admin-dashboard.service.ts ***!
  \****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminDashboardService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const favorite_entity_1 = __webpack_require__(/*! ../../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const phrase_entity_1 = __webpack_require__(/*! ../../entities/phrase.entity */ "./src/entities/phrase.entity.ts");
const proverb_entity_1 = __webpack_require__(/*! ../../entities/proverb.entity */ "./src/entities/proverb.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../../entities/song.entity */ "./src/entities/song.entity.ts");
const user_entity_1 = __webpack_require__(/*! ../../entities/user.entity */ "./src/entities/user.entity.ts");
let AdminDashboardService = class AdminDashboardService {
    constructor(userRepository, dictionaryRepository, phraseRepository, proverbRepository, songRepository, favoriteRepository, learningRecordRepository) {
        this.userRepository = userRepository;
        this.dictionaryRepository = dictionaryRepository;
        this.phraseRepository = phraseRepository;
        this.proverbRepository = proverbRepository;
        this.songRepository = songRepository;
        this.favoriteRepository = favoriteRepository;
        this.learningRecordRepository = learningRecordRepository;
    }
    async getSummary() {
        const [users, dictionary, phrases, proverbs, songs, favorites, learningRecords] = await Promise.all([
            this.userRepository.count(),
            this.dictionaryRepository.count(),
            this.phraseRepository.count(),
            this.proverbRepository.count(),
            this.songRepository.count(),
            this.favoriteRepository.count(),
            this.learningRecordRepository.count(),
        ]);
        const [dictionaryUnpublished, phrasesUnpublished, proverbsUnpublished, songsUnpublished,] = await Promise.all([
            this.dictionaryRepository.count({ where: { isPublished: false } }),
            this.phraseRepository.count({ where: { isPublished: false } }),
            this.proverbRepository.count({ where: { isPublished: false } }),
            this.songRepository.count({ where: { isPublished: false } }),
        ]);
        const totalUnpublished = dictionaryUnpublished + phrasesUnpublished + proverbsUnpublished + songsUnpublished;
        return {
            users,
            content: {
                dictionary,
                phrases,
                proverbs,
                songs,
                total: dictionary + phrases + proverbs + songs,
            },
            unpublished: {
                dictionary: dictionaryUnpublished,
                phrases: phrasesUnpublished,
                proverbs: proverbsUnpublished,
                songs: songsUnpublished,
                total: totalUnpublished,
            },
            favorites,
            learningRecords,
        };
    }
    async batchPublishAll() {
        const results = await Promise.all([
            this.dictionaryRepository
                .createQueryBuilder()
                .update()
                .set({ isPublished: true })
                .where('isPublished = :val', { val: false })
                .execute(),
            this.phraseRepository
                .createQueryBuilder()
                .update()
                .set({ isPublished: true })
                .where('isPublished = :val', { val: false })
                .execute(),
            this.proverbRepository
                .createQueryBuilder()
                .update()
                .set({ isPublished: true })
                .where('isPublished = :val', { val: false })
                .execute(),
            this.songRepository
                .createQueryBuilder()
                .update()
                .set({ isPublished: true })
                .where('isPublished = :val', { val: false })
                .execute(),
        ]);
        const affected = {
            dictionary: results[0].affected ?? 0,
            phrases: results[1].affected ?? 0,
            proverbs: results[2].affected ?? 0,
            songs: results[3].affected ?? 0,
            total: results.reduce((sum, r) => sum + (r.affected ?? 0), 0),
        };
        return { success: true, affected };
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(dictionary_entry_entity_1.DictionaryEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(phrase_entity_1.Phrase)),
    __param(3, (0, typeorm_1.InjectRepository)(proverb_entity_1.Proverb)),
    __param(4, (0, typeorm_1.InjectRepository)(song_entity_1.Song)),
    __param(5, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __param(6, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _g : Object])
], AdminDashboardService);


/***/ },

/***/ "./src/modules/admin-media/admin-media.controller.ts"
/*!***********************************************************!*\
  !*** ./src/modules/admin-media/admin-media.controller.ts ***!
  \***********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminMediaController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const media_service_1 = __webpack_require__(/*! ../media/media.service */ "./src/modules/media/media.service.ts");
const upload_media_dto_1 = __webpack_require__(/*! ../media/dto/upload-media.dto */ "./src/modules/media/dto/upload-media.dto.ts");
const media_types_1 = __webpack_require__(/*! ../media/media.types */ "./src/modules/media/media.types.ts");
let AdminMediaController = class AdminMediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    list() {
        return this.mediaService.list();
    }
    upload(file, payload) {
        return this.mediaService.upload(file, payload);
    }
    remove(id) {
        return this.mediaService.remove(id);
    }
};
exports.AdminMediaController = AdminMediaController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: Number(process.env.MEDIA_MAX_FILE_SIZE ?? 10 * 1024 * 1024),
        },
    })),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .build({
        fileIsRequired: true,
        errorHttpStatusCode: 400,
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof media_types_1.UploadedMediaFile !== "undefined" && media_types_1.UploadedMediaFile) === "function" ? _b : Object, typeof (_c = typeof upload_media_dto_1.UploadMediaDto !== "undefined" && upload_media_dto_1.UploadMediaDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "remove", null);
exports.AdminMediaController = AdminMediaController = __decorate([
    (0, common_1.Controller)('admin/media'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof media_service_1.MediaService !== "undefined" && media_service_1.MediaService) === "function" ? _a : Object])
], AdminMediaController);


/***/ },

/***/ "./src/modules/admin-media/admin-media.module.ts"
/*!*******************************************************!*\
  !*** ./src/modules/admin-media/admin-media.module.ts ***!
  \*******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminMediaModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const media_module_1 = __webpack_require__(/*! ../media/media.module */ "./src/modules/media/media.module.ts");
const admin_media_controller_1 = __webpack_require__(/*! ./admin-media.controller */ "./src/modules/admin-media/admin-media.controller.ts");
let AdminMediaModule = class AdminMediaModule {
};
exports.AdminMediaModule = AdminMediaModule;
exports.AdminMediaModule = AdminMediaModule = __decorate([
    (0, common_1.Module)({
        imports: [media_module_1.MediaModule],
        controllers: [admin_media_controller_1.AdminMediaController],
    })
], AdminMediaModule);


/***/ },

/***/ "./src/modules/admin-users/admin-users.controller.ts"
/*!***********************************************************!*\
  !*** ./src/modules/admin-users/admin-users.controller.ts ***!
  \***********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminUsersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const roles_decorator_1 = __webpack_require__(/*! ../../common/decorators/roles.decorator */ "./src/common/decorators/roles.decorator.ts");
const admin_role_enum_1 = __webpack_require__(/*! ../../common/enums/admin-role.enum */ "./src/common/enums/admin-role.enum.ts");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const pagination_query_dto_1 = __webpack_require__(/*! ../../common/dto/pagination-query.dto */ "./src/common/dto/pagination-query.dto.ts");
const roles_guard_1 = __webpack_require__(/*! ../../common/guards/roles.guard */ "./src/common/guards/roles.guard.ts");
const user_entity_1 = __webpack_require__(/*! ../../entities/user.entity */ "./src/entities/user.entity.ts");
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
    __metadata("design:paramtypes", [typeof (_b = typeof pagination_query_dto_1.PaginationQueryDto !== "undefined" && pagination_query_dto_1.PaginationQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "list", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(admin_role_enum_1.AdminRole.SUPER_ADMIN),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AdminUsersController);


/***/ },

/***/ "./src/modules/admin-users/admin-users.module.ts"
/*!*******************************************************!*\
  !*** ./src/modules/admin-users/admin-users.module.ts ***!
  \*******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminUsersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const user_entity_1 = __webpack_require__(/*! ../../entities/user.entity */ "./src/entities/user.entity.ts");
const admin_users_controller_1 = __webpack_require__(/*! ./admin-users.controller */ "./src/modules/admin-users/admin-users.controller.ts");
let AdminUsersModule = class AdminUsersModule {
};
exports.AdminUsersModule = AdminUsersModule;
exports.AdminUsersModule = AdminUsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User])],
        controllers: [admin_users_controller_1.AdminUsersController],
    })
], AdminUsersModule);


/***/ },

/***/ "./src/modules/auth-sessions/auth-sessions.module.ts"
/*!***********************************************************!*\
  !*** ./src/modules/auth-sessions/auth-sessions.module.ts ***!
  \***********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthSessionsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const auth_session_entity_1 = __webpack_require__(/*! ../../entities/auth-session.entity */ "./src/entities/auth-session.entity.ts");
const auth_sessions_service_1 = __webpack_require__(/*! ./auth-sessions.service */ "./src/modules/auth-sessions/auth-sessions.service.ts");
let AuthSessionsModule = class AuthSessionsModule {
};
exports.AuthSessionsModule = AuthSessionsModule;
exports.AuthSessionsModule = AuthSessionsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([auth_session_entity_1.AuthSession])],
        providers: [auth_sessions_service_1.AuthSessionsService],
        exports: [auth_sessions_service_1.AuthSessionsService],
    })
], AuthSessionsModule);


/***/ },

/***/ "./src/modules/auth-sessions/auth-sessions.service.ts"
/*!************************************************************!*\
  !*** ./src/modules/auth-sessions/auth-sessions.service.ts ***!
  \************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthSessionsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const auth_session_entity_1 = __webpack_require__(/*! ../../entities/auth-session.entity */ "./src/entities/auth-session.entity.ts");
let AuthSessionsService = class AuthSessionsService {
    constructor(authSessionRepository) {
        this.authSessionRepository = authSessionRepository;
    }
    async createSession(params) {
        const session = this.authSessionRepository.create({
            sessionId: params.sessionId,
            userType: params.userType,
            userId: params.userId,
            refreshTokenHash: this.hashRefreshToken(params.refreshToken),
            expiresAt: params.expiresAt,
            lastUsedAt: null,
            isActive: true,
        });
        return this.authSessionRepository.save(session);
    }
    async findActiveSession(sessionId, userType) {
        return this.authSessionRepository.findOne({
            where: {
                sessionId,
                userType,
                isActive: true,
            },
        });
    }
    async validateAccessSession(params) {
        const session = await this.findActiveSession(params.sessionId, params.userType);
        if (!session || session.userId !== params.userId) {
            return false;
        }
        if (session.expiresAt.getTime() <= Date.now()) {
            await this.authSessionRepository.update(session.id, {
                isActive: false,
            });
            return false;
        }
        return true;
    }
    async validateRefreshToken(params) {
        const session = await this.findActiveSession(params.sessionId, params.userType);
        if (!session || session.userId !== params.userId) {
            return null;
        }
        if (session.expiresAt.getTime() <= Date.now()) {
            await this.authSessionRepository.update(session.id, {
                isActive: false,
            });
            return null;
        }
        if (session.refreshTokenHash !== this.hashRefreshToken(params.refreshToken)) {
            return null;
        }
        return session;
    }
    async rotateRefreshToken(sessionId, refreshToken, expiresAt) {
        await this.authSessionRepository.update({ sessionId }, {
            refreshTokenHash: this.hashRefreshToken(refreshToken),
            expiresAt,
            lastUsedAt: new Date(),
        });
    }
    async deactivateSession(sessionId, userType) {
        await this.authSessionRepository.update({
            sessionId,
            userType,
            isActive: true,
        }, {
            isActive: false,
        });
    }
    hashRefreshToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.AuthSessionsService = AuthSessionsService;
exports.AuthSessionsService = AuthSessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_session_entity_1.AuthSession)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AuthSessionsService);


/***/ },

/***/ "./src/modules/content/content-import.schema.ts"
/*!******************************************************!*\
  !*** ./src/modules/content/content-import.schema.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CONTENT_IMPORT_SCHEMAS = exports.IMPORT_FIELD_LABELS = void 0;
exports.getContentImportSchema = getContentImportSchema;
exports.normalizeImportHeaderName = normalizeImportHeaderName;
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
exports.IMPORT_FIELD_LABELS = {
    buyiText: '布依语',
    zhText: '中文释义',
    enText: '英文释义',
    description: '说明',
    sortOrder: '排序值',
    isPublished: '发布状态',
    audioUrl: '音频地址',
    audioMediaId: '音频媒体ID',
    title: '标题',
    artist: '歌手/来源',
    coverUrl: '封面地址',
    coverMediaId: '封面媒体ID',
};
const COMMON_ALIASES = {
    buyiText: ['布依语', 'buyiText', '布依文', '词目'],
    zhText: ['中文', '中文释义', 'zhText', '汉语'],
    enText: ['英文', '英文释义', 'enText'],
    description: ['说明', '备注', 'description'],
    sortOrder: ['排序值', 'sortOrder'],
    isPublished: ['发布状态', 'isPublished', '是否发布'],
};
function buildTextKey(parts) {
    return parts.map((part) => String(part || '').trim()).join('::');
}
exports.CONTENT_IMPORT_SCHEMAS = {
    [content_type_enum_1.ContentType.DICTIONARY]: {
        type: content_type_enum_1.ContentType.DICTIONARY,
        sheetName: 'Dictionary',
        filename: 'dictionary-import-template.xlsx',
        orderedFields: ['buyiText', 'zhText', 'enText', 'audioUrl', 'description', 'sortOrder', 'isPublished'],
        requiredFields: ['buyiText', 'zhText'],
        aliases: {
            ...COMMON_ALIASES,
            audioUrl: ['音频地址', 'audioUrl', '发音地址', '歌曲地址'],
            audioMediaId: ['音频媒体ID', 'audioMediaId'],
            title: ['标题', 'title'],
            artist: ['歌手/来源', 'artist', '歌手', '来源'],
            coverUrl: ['封面地址', 'coverUrl', '封面'],
            coverMediaId: ['封面媒体ID', 'coverMediaId'],
        },
        buildIdentity: (row) => ({
            key: buildTextKey([row.buyiText, row.zhText]),
            buyiText: String(row.buyiText || ''),
            zhText: String(row.zhText || ''),
        }),
        exampleRow: {
            buyiText: 'noi',
            zhText: '你好',
            enText: 'hello',
            audioUrl: 'https://example.com/noi.mp3',
            description: '基础词条',
            sortOrder: 0,
            isPublished: '已发布',
            audioMediaId: '',
            title: '',
            artist: '',
            coverUrl: '',
            coverMediaId: '',
        },
    },
    [content_type_enum_1.ContentType.PHRASE]: {
        type: content_type_enum_1.ContentType.PHRASE,
        sheetName: 'Phrases',
        filename: 'phrases-import-template.xlsx',
        orderedFields: ['buyiText', 'zhText', 'enText', 'description', 'sortOrder', 'isPublished'],
        requiredFields: ['buyiText', 'zhText'],
        aliases: {
            ...COMMON_ALIASES,
            audioUrl: ['音频地址', 'audioUrl'],
            audioMediaId: ['音频媒体ID', 'audioMediaId'],
            title: ['标题', 'title'],
            artist: ['歌手/来源', 'artist', '歌手', '来源'],
            coverUrl: ['封面地址', 'coverUrl', '封面'],
            coverMediaId: ['封面媒体ID', 'coverMediaId'],
        },
        buildIdentity: (row) => ({
            key: buildTextKey([row.buyiText, row.zhText]),
            buyiText: String(row.buyiText || ''),
            zhText: String(row.zhText || ''),
        }),
        exampleRow: {
            buyiText: 'mbou xong',
            zhText: '一起去',
            enText: 'go together',
            description: '常用短语',
            sortOrder: 0,
            isPublished: '已发布',
            audioUrl: '',
            audioMediaId: '',
            title: '',
            artist: '',
            coverUrl: '',
            coverMediaId: '',
        },
    },
    [content_type_enum_1.ContentType.PROVERB]: {
        type: content_type_enum_1.ContentType.PROVERB,
        sheetName: 'Proverbs',
        filename: 'proverbs-import-template.xlsx',
        orderedFields: ['buyiText', 'zhText', 'enText', 'description', 'sortOrder', 'isPublished'],
        requiredFields: ['buyiText', 'zhText'],
        aliases: {
            ...COMMON_ALIASES,
            audioUrl: ['音频地址', 'audioUrl'],
            audioMediaId: ['音频媒体ID', 'audioMediaId'],
            title: ['标题', 'title'],
            artist: ['歌手/来源', 'artist', '歌手', '来源'],
            coverUrl: ['封面地址', 'coverUrl', '封面'],
            coverMediaId: ['封面媒体ID', 'coverMediaId'],
        },
        buildIdentity: (row) => ({
            key: buildTextKey([row.buyiText, row.zhText]),
            buyiText: String(row.buyiText || ''),
            zhText: String(row.zhText || ''),
        }),
        exampleRow: {
            buyiText: 'gaen nax',
            zhText: '勤劳有收获',
            enText: 'diligence pays',
            description: '示例谚语',
            sortOrder: 0,
            isPublished: '已发布',
            audioUrl: '',
            audioMediaId: '',
            title: '',
            artist: '',
            coverUrl: '',
            coverMediaId: '',
        },
    },
    [content_type_enum_1.ContentType.SONG]: {
        type: content_type_enum_1.ContentType.SONG,
        sheetName: 'Songs',
        filename: 'songs-import-template.xlsx',
        orderedFields: ['title', 'artist', 'buyiText', 'zhText', 'enText', 'coverUrl', 'audioUrl', 'description', 'sortOrder', 'isPublished'],
        requiredFields: ['title', 'buyiText', 'zhText'],
        aliases: {
            ...COMMON_ALIASES,
            audioUrl: ['音频地址', 'audioUrl', '歌曲地址'],
            audioMediaId: ['音频媒体ID', 'audioMediaId'],
            title: ['标题', 'title', '歌曲标题'],
            artist: ['歌手/来源', 'artist', '歌手', '来源'],
            coverUrl: ['封面地址', 'coverUrl', '封面'],
            coverMediaId: ['封面媒体ID', 'coverMediaId'],
        },
        buildIdentity: (row) => {
            const title = String(row.title || '').trim();
            const artist = String(row.artist || '').trim();
            return {
                key: buildTextKey([title, artist]),
                title,
                artist: artist || null,
                buyiText: String(row.buyiText || ''),
                zhText: String(row.zhText || ''),
            };
        },
        exampleRow: {
            title: '布依迎客歌',
            artist: '布依山歌集',
            buyiText: 'hau mbou',
            zhText: '欢迎的民歌',
            enText: 'Welcome folk song',
            coverUrl: 'https://example.com/cover.jpg',
            audioUrl: 'https://example.com/song.mp3',
            description: '示例歌曲',
            sortOrder: 0,
            isPublished: '已发布',
            audioMediaId: '',
            coverMediaId: '',
        },
    },
};
function getContentImportSchema(type) {
    return exports.CONTENT_IMPORT_SCHEMAS[type];
}
function normalizeImportHeaderName(value) {
    return String(value || '')
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[：:]/g, '');
}


/***/ },

/***/ "./src/modules/content/content-import.service.ts"
/*!*******************************************************!*\
  !*** ./src/modules/content/content-import.service.ts ***!
  \*******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentImportService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const XLSX = __webpack_require__(/*! xlsx */ "xlsx");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_import_schema_1 = __webpack_require__(/*! ./content-import.schema */ "./src/modules/content/content-import.schema.ts");
let ContentImportService = class ContentImportService {
    resolveImportMode(mode) {
        if (!mode || mode === 'create') {
            return 'create';
        }
        if (mode === 'upsert') {
            return 'upsert';
        }
        throw new common_1.BadRequestException('不支持的导入模式');
    }
    resolveSkipDuplicates(skipDuplicates) {
        if (typeof skipDuplicates === 'boolean') {
            return skipDuplicates;
        }
        if (skipDuplicates === undefined || skipDuplicates === null || skipDuplicates === '') {
            return true;
        }
        return ['true', '1', 'yes', 'y', 'on'].includes(String(skipDuplicates).toLowerCase());
    }
    parseWorkbook(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('请选择 Excel 文件');
        }
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new common_1.BadRequestException('Excel 文件中没有可用工作表');
        }
        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: '',
        });
        const headerRow = rawRows[0] ?? [];
        const headers = headerRow
            .map((item) => String(item ?? '').replace(/^\uFEFF/, '').trim())
            .filter((item) => item.length > 0);
        const rows = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: false,
        });
        if (!rows.length) {
            throw new common_1.BadRequestException('Excel 文件中没有可导入的数据');
        }
        return { headers, rows };
    }
    buildTemplate(type) {
        const schema = (0, content_import_schema_1.getContentImportSchema)(type);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(this.getTemplateRows(type), {
            header: schema.orderedFields.map((field) => content_import_schema_1.IMPORT_FIELD_LABELS[field]),
        });
        XLSX.utils.book_append_sheet(workbook, worksheet, schema.sheetName);
        return {
            buffer: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
            filename: schema.filename,
        };
    }
    normalizeRows(type, workbook) {
        const schema = (0, content_import_schema_1.getContentImportSchema)(type);
        this.validateHeaders(schema.requiredFields, schema.aliases, workbook.headers);
        const normalized = workbook.rows
            .map((row, index) => this.normalizeRow(type, row, index))
            .filter((row) => row !== null);
        if (!normalized.length) {
            throw new common_1.BadRequestException('没有识别到可导入的有效数据');
        }
        return normalized;
    }
    normalizeRow(type, row, index) {
        const schema = (0, content_import_schema_1.getContentImportSchema)(type);
        const normalizedRow = new Map();
        Object.entries(row || {}).forEach(([key, value]) => {
            normalizedRow.set((0, content_import_schema_1.normalizeImportHeaderName)(key), String(value ?? '').trim());
        });
        const read = (field) => {
            for (const key of schema.aliases[field] || []) {
                const value = normalizedRow.get((0, content_import_schema_1.normalizeImportHeaderName)(key));
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    return String(value).trim();
                }
            }
            return '';
        };
        const rowNumber = index + 2;
        const toBoolean = (value, defaultValue = true) => {
            if (!value) {
                return defaultValue;
            }
            return ['true', '1', 'yes', 'y', '是', '已发布'].includes(value.toLowerCase());
        };
        const toNumber = (value, defaultValue = 0) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : defaultValue;
        };
        const isEmptyRow = [...normalizedRow.values()].every((value) => String(value ?? '').trim() === '');
        if (isEmptyRow) {
            return null;
        }
        const base = {
            buyiText: read('buyiText'),
            zhText: read('zhText'),
            enText: read('enText'),
            description: read('description'),
            sortOrder: toNumber(read('sortOrder'), 0),
            isPublished: toBoolean(read('isPublished'), true),
        };
        if (type === content_type_enum_1.ContentType.SONG) {
            const item = {
                ...base,
                title: read('title'),
                artist: read('artist'),
                coverUrl: read('coverUrl'),
                audioUrl: read('audioUrl'),
            };
            this.throwIfMissing(rowNumber, item, schema.requiredFields);
            return item;
        }
        if (type === content_type_enum_1.ContentType.DICTIONARY) {
            const item = {
                ...base,
                audioUrl: read('audioUrl'),
            };
            this.throwIfMissing(rowNumber, item, schema.requiredFields);
            return item;
        }
        this.throwIfMissing(rowNumber, base, schema.requiredFields);
        return base;
    }
    validateHeaders(requiredFields, aliases, headers) {
        const normalizedHeaders = new Set(headers.map((header) => (0, content_import_schema_1.normalizeImportHeaderName)(header)));
        const missingFields = requiredFields.filter((field) => !(aliases[field] || []).some((alias) => normalizedHeaders.has((0, content_import_schema_1.normalizeImportHeaderName)(alias))));
        if (missingFields.length) {
            throw new common_1.BadRequestException(`导入文件缺少必填列：${missingFields.map((field) => content_import_schema_1.IMPORT_FIELD_LABELS[field]).join('、')}`);
        }
    }
    throwIfMissing(rowNumber, values, requiredFields) {
        const missingFields = requiredFields.filter((field) => {
            const value = values[field];
            return value === undefined || value === null || String(value).trim() === '';
        });
        if (missingFields.length) {
            throw new common_1.BadRequestException(`第 ${rowNumber} 行缺少必填字段：${missingFields.map((field) => content_import_schema_1.IMPORT_FIELD_LABELS[field]).join('、')}`);
        }
    }
    getTemplateRows(type) {
        const schema = (0, content_import_schema_1.getContentImportSchema)(type);
        const row = {};
        schema.orderedFields.forEach((field) => {
            row[content_import_schema_1.IMPORT_FIELD_LABELS[field]] = schema.exampleRow[field] ?? '';
        });
        return [row];
    }
};
exports.ContentImportService = ContentImportService;
exports.ContentImportService = ContentImportService = __decorate([
    (0, common_1.Injectable)()
], ContentImportService);


/***/ },

/***/ "./src/modules/content/content-sort.service.ts"
/*!*****************************************************!*\
  !*** ./src/modules/content/content-sort.service.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentSortService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const pinyin_pro_1 = __webpack_require__(/*! pinyin-pro */ "pinyin-pro");
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


/***/ },

/***/ "./src/modules/content/content.module.ts"
/*!***********************************************!*\
  !*** ./src/modules/content/content.module.ts ***!
  \***********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const phrase_entity_1 = __webpack_require__(/*! ../../entities/phrase.entity */ "./src/entities/phrase.entity.ts");
const proverb_entity_1 = __webpack_require__(/*! ../../entities/proverb.entity */ "./src/entities/proverb.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../../entities/song.entity */ "./src/entities/song.entity.ts");
const culture_exhibits_module_1 = __webpack_require__(/*! ../culture-exhibits/culture-exhibits.module */ "./src/modules/culture-exhibits/culture-exhibits.module.ts");
const content_import_service_1 = __webpack_require__(/*! ./content-import.service */ "./src/modules/content/content-import.service.ts");
const content_sort_service_1 = __webpack_require__(/*! ./content-sort.service */ "./src/modules/content/content-sort.service.ts");
const content_service_1 = __webpack_require__(/*! ./content.service */ "./src/modules/content/content.service.ts");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([dictionary_entry_entity_1.DictionaryEntry, phrase_entity_1.Phrase, proverb_entity_1.Proverb, song_entity_1.Song]), culture_exhibits_module_1.CultureExhibitsModule],
        providers: [content_service_1.ContentService, content_sort_service_1.ContentSortService, content_import_service_1.ContentImportService],
        exports: [content_service_1.ContentService, typeorm_1.TypeOrmModule],
    })
], ContentModule);


/***/ },

/***/ "./src/modules/content/content.service.ts"
/*!************************************************!*\
  !*** ./src/modules/content/content.service.ts ***!
  \************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const phrase_entity_1 = __webpack_require__(/*! ../../entities/phrase.entity */ "./src/entities/phrase.entity.ts");
const proverb_entity_1 = __webpack_require__(/*! ../../entities/proverb.entity */ "./src/entities/proverb.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../../entities/song.entity */ "./src/entities/song.entity.ts");
const content_import_service_1 = __webpack_require__(/*! ./content-import.service */ "./src/modules/content/content-import.service.ts");
const content_import_schema_1 = __webpack_require__(/*! ./content-import.schema */ "./src/modules/content/content-import.schema.ts");
const culture_exhibits_service_1 = __webpack_require__(/*! ../culture-exhibits/culture-exhibits.service */ "./src/modules/culture-exhibits/culture-exhibits.service.ts");
const content_sort_service_1 = __webpack_require__(/*! ./content-sort.service */ "./src/modules/content/content-sort.service.ts");
let ContentService = class ContentService {
    constructor(dictionaryRepository, phraseRepository, proverbRepository, songRepository, contentSortService, contentImportService, cultureExhibitsService) {
        this.dictionaryRepository = dictionaryRepository;
        this.phraseRepository = phraseRepository;
        this.proverbRepository = proverbRepository;
        this.songRepository = songRepository;
        this.contentSortService = contentSortService;
        this.contentImportService = contentImportService;
        this.cultureExhibitsService = cultureExhibitsService;
    }
    getRepository(type) {
        switch (type) {
            case content_type_enum_1.ContentType.DICTIONARY:
                return this.dictionaryRepository;
            case content_type_enum_1.ContentType.PHRASE:
                return this.phraseRepository;
            case content_type_enum_1.ContentType.PROVERB:
                return this.proverbRepository;
            case content_type_enum_1.ContentType.SONG:
                return this.songRepository;
            default:
                throw new common_1.NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
        }
    }
    buildKeywordWhere(keyword) {
        if (!keyword) {
            return {};
        }
        const value = `%${keyword}%`;
        return [
            { buyiText: (0, typeorm_2.Like)(value) },
            { zhText: (0, typeorm_2.Like)(value) },
            { enText: (0, typeorm_2.Like)(value) },
            { description: (0, typeorm_2.Like)(value) },
        ];
    }
    listOrder() {
        return { sortOrder: 'ASC', zhSortKey: 'ASC', id: 'DESC' };
    }
    attachSortKey(payload) {
        return {
            ...payload,
            zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText),
        };
    }
    normalizeOptionalText(value) {
        const normalized = String(value ?? '').trim();
        return normalized ? normalized : null;
    }
    normalizeImportedBase(payload) {
        return this.attachSortKey({
            ...payload,
            enText: this.normalizeOptionalText(payload.enText),
            description: this.normalizeOptionalText(payload.description),
            isPublished: payload.isPublished ?? true,
            sortOrder: payload.sortOrder ?? 0,
        });
    }
    normalizeImportedDictionary(payload) {
        return {
            ...this.normalizeImportedBase(payload),
            audioUrl: this.normalizeOptionalText(payload.audioUrl),
        };
    }
    normalizeImportedSong(payload) {
        return {
            ...this.normalizeImportedBase(payload),
            title: payload.title.trim(),
            artist: this.normalizeOptionalText(payload.artist),
            coverUrl: this.normalizeOptionalText(payload.coverUrl),
            audioUrl: this.normalizeOptionalText(payload.audioUrl),
        };
    }
    buildTextImportKey(buyiText, zhText) {
        return `${String(buyiText || '').trim()}::${String(zhText || '').trim()}`;
    }
    buildSongImportKey(title, artist) {
        return `${String(title || '').trim()}::${String(artist || '').trim()}`;
    }
    async findExistingByTextKey(repository, items) {
        const uniquePairs = Array.from(new Map(items.map((item) => [this.buildTextImportKey(item.buyiText, item.zhText), item])).values());
        if (!uniquePairs.length) {
            return new Map();
        }
        const existingItems = await repository.find({
            where: uniquePairs.map((item) => ({
                buyiText: item.buyiText,
                zhText: item.zhText,
            })),
        });
        return new Map(existingItems.map((item) => [this.buildTextImportKey(item.buyiText, item.zhText), item]));
    }
    async findExistingSongsByKey(items) {
        const uniqueTitles = Array.from(new Set(items.map((item) => String(item.title || '').trim()).filter(Boolean)));
        if (!uniqueTitles.length) {
            return new Map();
        }
        const existingItems = await this.songRepository.find({
            where: {
                title: (0, typeorm_2.In)(uniqueTitles),
            },
        });
        const songMap = new Map();
        existingItems.forEach((item) => {
            const key = this.buildSongImportKey(item.title, item.artist);
            if (!songMap.has(key)) {
                songMap.set(key, item);
            }
        });
        return songMap;
    }
    async listPublished(type, query) {
        const repository = this.getRepository(type);
        const page = Number(query.page ?? 1);
        const pageSize = Number(query.pageSize ?? 10);
        const keywordWhere = this.buildKeywordWhere(query.keyword);
        const [items, total] = await repository.findAndCount({
            where: (Array.isArray(keywordWhere)
                ? keywordWhere.map((item) => ({ ...item, isPublished: true }))
                : { ...keywordWhere, isPublished: true }),
            order: this.listOrder(),
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }
    async getPublishedDetail(type, id) {
        const item = await this.getRepository(type).findOne({
            where: { id, isPublished: true },
        });
        if (!item) {
            throw new common_1.NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
        }
        return item;
    }
    async getAdminList(type, query) {
        const repository = this.getRepository(type);
        const page = Number(query.page ?? 1);
        const pageSize = Number(query.pageSize ?? 10);
        const [items, total] = await repository.findAndCount({
            where: this.buildKeywordWhere(query.keyword),
            order: this.listOrder(),
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }
    async getByIds(type, ids) {
        if (!ids.length) {
            return [];
        }
        return this.getRepository(type).find({
            where: { id: (0, typeorm_2.In)(ids) },
            order: this.listOrder(),
        });
    }
    async createDictionary(payload) {
        return this.dictionaryRepository.save(this.dictionaryRepository.create(this.attachSortKey(payload)));
    }
    async updateDictionary(id, payload) {
        const item = await this.dictionaryRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('\u8bcd\u6761\u4e0d\u5b58\u5728');
        }
        Object.assign(item, payload, {
            zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
        });
        return this.dictionaryRepository.save(item);
    }
    async createSimple(type, payload) {
        const repository = this.getRepository(type);
        return repository.save(repository.create(this.attachSortKey(payload)));
    }
    async updateSimple(type, id, payload) {
        const repository = this.getRepository(type);
        const item = await repository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
        }
        Object.assign(item, payload, {
            zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
        });
        return repository.save(item);
    }
    async createSong(payload) {
        return this.songRepository.save(this.songRepository.create(this.attachSortKey(payload)));
    }
    async updateSong(id, payload) {
        const item = await this.songRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('\u6c11\u6b4c\u4e0d\u5b58\u5728');
        }
        Object.assign(item, payload, {
            zhSortKey: this.contentSortService.buildZhSortKey(payload.zhText ?? item.zhText),
        });
        return this.songRepository.save(item);
    }
    async delete(type, id) {
        const repository = this.getRepository(type);
        const item = await repository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('\u5185\u5bb9\u4e0d\u5b58\u5728');
        }
        await repository.remove(item);
        return { success: true };
    }
    async previewImport(type, file, mode, skipDuplicates) {
        const importMode = this.contentImportService.resolveImportMode(mode);
        const shouldSkipDuplicates = this.contentImportService.resolveSkipDuplicates(skipDuplicates);
        const workbook = this.contentImportService.parseWorkbook(file);
        const normalized = this.contentImportService.normalizeRows(type, workbook);
        const plan = await this.buildImportPlan(type, normalized, importMode, shouldSkipDuplicates);
        return this.serializeImportPlan(plan);
    }
    async importContent(type, file, mode, skipDuplicates) {
        const importMode = this.contentImportService.resolveImportMode(mode);
        const shouldSkipDuplicates = this.contentImportService.resolveSkipDuplicates(skipDuplicates);
        const workbook = this.contentImportService.parseWorkbook(file);
        const normalized = this.contentImportService.normalizeRows(type, workbook);
        const plan = await this.buildImportPlan(type, normalized, importMode, shouldSkipDuplicates);
        switch (type) {
            case content_type_enum_1.ContentType.DICTIONARY:
                await this.executePlan(this.dictionaryRepository, plan);
                break;
            case content_type_enum_1.ContentType.PHRASE:
                await this.executePlan(this.phraseRepository, plan);
                break;
            case content_type_enum_1.ContentType.PROVERB:
                await this.executePlan(this.proverbRepository, plan);
                break;
            case content_type_enum_1.ContentType.SONG:
                await this.executePlan(this.songRepository, plan);
                break;
            default:
                throw new common_1.NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
        }
        return this.serializeImportPlan(plan);
    }
    getImportTemplate(type) {
        return this.contentImportService.buildTemplate(type);
    }
    async searchAll(query) {
        const [dictionary, phrases, proverbs, songs] = await Promise.all([
            this.listPublished(content_type_enum_1.ContentType.DICTIONARY, query),
            this.listPublished(content_type_enum_1.ContentType.PHRASE, query),
            this.listPublished(content_type_enum_1.ContentType.PROVERB, query),
            this.listPublished(content_type_enum_1.ContentType.SONG, query),
        ]);
        return {
            dictionary: await Promise.all(dictionary.items.map((item) => this.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.DICTIONARY))),
            phrases: await Promise.all(phrases.items.map((item) => this.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.PHRASE))),
            proverbs: await Promise.all(proverbs.items.map((item) => this.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.PROVERB))),
            songs: songs.items.map((item) => this.serialize(item, content_type_enum_1.ContentType.SONG)),
            pagination: {
                page: dictionary.page,
                pageSize: dictionary.pageSize,
                total: dictionary.total + phrases.total + proverbs.total + songs.total,
                totalPages: Math.max(dictionary.totalPages, phrases.totalPages, proverbs.totalPages, songs.totalPages),
            },
        };
    }
    async suggestAll(keyword) {
        if (!keyword || !keyword.trim()) {
            return { dictionary: [], phrases: [], proverbs: [] };
        }
        const kw = `%${keyword.trim()}%`;
        const takeAmount = 5;
        const queryRepo = async (repo, type) => {
            const items = await repo.createQueryBuilder('item')
                .where('item.isPublished = :isPublished', { isPublished: true })
                .andWhere('(item.zhText LIKE :kw OR item.buyiText LIKE :kw OR item.enText LIKE :kw)', { kw })
                .orderBy('CASE WHEN item.zhText LIKE :kw THEN 1 ELSE 2 END', 'ASC')
                .addOrderBy('item.sortOrder', 'ASC')
                .take(takeAmount)
                .getMany();
            return items.map((item) => this.serialize(item, type));
        };
        const [dictionary, phrases, proverbs] = await Promise.all([
            queryRepo(this.dictionaryRepository, content_type_enum_1.ContentType.DICTIONARY),
            queryRepo(this.phraseRepository, content_type_enum_1.ContentType.PHRASE),
            queryRepo(this.proverbRepository, content_type_enum_1.ContentType.PROVERB),
        ]);
        return { dictionary, phrases, proverbs };
    }
    async getMiniappHomeData() {
        const [dictionary, phrases, proverbs, songs] = await Promise.all([
            this.dictionaryRepository.find({
                where: { isPublished: true },
                order: this.listOrder(),
                take: 8,
            }),
            this.phraseRepository.find({
                where: { isPublished: true },
                order: this.listOrder(),
                take: 8,
            }),
            this.proverbRepository.find({
                where: { isPublished: true },
                order: this.listOrder(),
                take: 8,
            }),
            this.songRepository.find({
                where: { isPublished: true },
                order: this.listOrder(),
                take: 12,
            }),
        ]);
        return {
            banners: songs
                .filter((item) => !!item.coverUrl)
                .slice(0, 5)
                .map((item) => ({
                id: item.id,
                contentType: content_type_enum_1.ContentType.SONG,
                title: item.title,
                subtitle: item.artist || item.zhText || item.description || '布依语民歌内容',
                image: item.coverUrl,
                buyiText: item.buyiText,
                zhText: item.zhText,
            })),
            suggestions: this.buildMiniappSuggestions([...dictionary, ...phrases, ...proverbs, ...songs]),
        };
    }
    serialize(item, type) {
        const base = {
            id: item.id,
            type,
            buyiText: item.buyiText,
            zhText: item.zhText,
            enText: item.enText,
            description: item.description,
            culturalNote: item.culturalNote,
            zhSortKey: item.zhSortKey,
        };
        if (type === content_type_enum_1.ContentType.SONG) {
            const song = item;
            return {
                ...base,
                title: song.title,
                artist: song.artist,
                coverUrl: song.coverUrl,
                audioUrl: song.audioUrl,
                lyrics: song.lyrics,
            };
        }
        if (type === content_type_enum_1.ContentType.DICTIONARY) {
            const dictionaryEntry = item;
            return {
                ...base,
                audioUrl: dictionaryEntry.audioUrl,
            };
        }
        return base;
    }
    async serializeWithRelatedExhibits(item, type) {
        return {
            ...this.serialize(item, type),
            relatedExhibits: await this.cultureExhibitsService.findRelatedExhibits(type, item.id),
        };
    }
    serializeImportPlan(plan) {
        return {
            mode: plan.mode,
            skipDuplicates: plan.skipDuplicates,
            totalCount: plan.totalCount,
            importedCount: plan.createdCount + plan.updatedCount,
            createdCount: plan.createdCount,
            updatedCount: plan.updatedCount,
            skippedCount: plan.skippedCount,
            summary: {
                total: plan.totalCount,
                imported: plan.createdCount + plan.updatedCount,
                created: plan.createdCount,
                updated: plan.updatedCount,
                skipped: plan.skippedCount,
            },
            rows: plan.rows,
        };
    }
    buildMiniappSuggestions(items, limit = 10) {
        const unique = new Set();
        const suggestions = [];
        items.forEach((item) => {
            const candidates = [
                item.buyiText,
                item.zhText,
                item.enText,
                item.description,
                'title' in item ? item.title : '',
                'artist' in item ? item.artist : '',
            ];
            candidates
                .map((value) => String(value ?? '').trim())
                .filter((value) => value.length >= 2)
                .forEach((value) => {
                const key = value.toLowerCase();
                if (unique.has(key) || suggestions.length >= limit) {
                    return;
                }
                unique.add(key);
                suggestions.push(value);
            });
        });
        return suggestions.slice(0, limit);
    }
    async executePlan(repository, plan) {
        for (const operation of plan.operations) {
            if (operation.action === 'update' && operation.existing) {
                Object.assign(operation.existing, operation.payload);
                await repository.save(operation.existing);
                continue;
            }
            try {
                await repository.save(repository.create(operation.payload));
            }
            catch (error) {
                if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
                    continue;
                }
                throw error;
            }
        }
    }
    async buildImportPlan(type, normalized, mode, skipDuplicates) {
        switch (type) {
            case content_type_enum_1.ContentType.DICTIONARY:
                return this.buildDictionaryPlan(normalized, mode, skipDuplicates);
            case content_type_enum_1.ContentType.PHRASE:
                return this.buildSimplePlan(this.phraseRepository, normalized, mode, skipDuplicates);
            case content_type_enum_1.ContentType.PROVERB:
                return this.buildSimplePlan(this.proverbRepository, normalized, mode, skipDuplicates);
            case content_type_enum_1.ContentType.SONG:
                return this.buildSongPlan(normalized, mode, skipDuplicates);
            default:
                throw new common_1.NotFoundException('\u4e0d\u652f\u6301\u7684\u5185\u5bb9\u7c7b\u578b');
        }
    }
    async buildDictionaryPlan(items, mode, skipDuplicates) {
        const plan = this.createImportPlan(mode, skipDuplicates, items.length);
        const seenKeys = new Set();
        const normalizedItems = items.map((item) => this.normalizeImportedDictionary(item));
        const existingMap = await this.findExistingByTextKey(this.dictionaryRepository, normalizedItems);
        const schema = (0, content_import_schema_1.getContentImportSchema)(content_type_enum_1.ContentType.DICTIONARY);
        for (const [index, payload] of normalizedItems.entries()) {
            const preview = schema.buildIdentity(payload);
            const key = preview.key;
            if (seenKeys.has(key)) {
                this.pushSkipped(plan, {
                    rowNumber: index + 2,
                    status: 'skip',
                    reason: '\u540c\u4e00\u6587\u4ef6\u5185\u5b58\u5728\u91cd\u590d\u952e\uff0c\u5df2\u4fdd\u7559\u9996\u6761',
                    ...preview,
                });
                continue;
            }
            seenKeys.add(key);
            const existing = existingMap.get(key);
            this.pushImportDecision(plan, {
                index,
                key,
                payload,
                existing,
                mode,
                skipDuplicates,
            });
        }
        return plan;
    }
    async buildSimplePlan(repository, items, mode, skipDuplicates) {
        const plan = this.createImportPlan(mode, skipDuplicates, items.length);
        const seenKeys = new Set();
        const normalizedItems = items.map((item) => this.normalizeImportedBase(item));
        const existingMap = await this.findExistingByTextKey(repository, normalizedItems);
        const schema = (0, content_import_schema_1.getContentImportSchema)(repository.metadata.name === 'Phrase' ? content_type_enum_1.ContentType.PHRASE : content_type_enum_1.ContentType.PROVERB);
        for (const [index, payload] of normalizedItems.entries()) {
            const preview = schema.buildIdentity(payload);
            const key = preview.key;
            if (seenKeys.has(key)) {
                this.pushSkipped(plan, {
                    rowNumber: index + 2,
                    status: 'skip',
                    reason: '\u540c\u4e00\u6587\u4ef6\u5185\u5b58\u5728\u91cd\u590d\u952e\uff0c\u5df2\u4fdd\u7559\u9996\u6761',
                    ...preview,
                });
                continue;
            }
            seenKeys.add(key);
            const existing = existingMap.get(key);
            this.pushImportDecision(plan, {
                index,
                key,
                payload,
                existing,
                mode,
                skipDuplicates,
            });
        }
        return plan;
    }
    async buildSongPlan(items, mode, skipDuplicates) {
        const plan = this.createImportPlan(mode, skipDuplicates, items.length);
        const seenKeys = new Set();
        const normalizedItems = items.map((item) => this.normalizeImportedSong(item));
        const existingMap = await this.findExistingSongsByKey(normalizedItems);
        const schema = (0, content_import_schema_1.getContentImportSchema)(content_type_enum_1.ContentType.SONG);
        for (const [index, payload] of normalizedItems.entries()) {
            const preview = schema.buildIdentity(payload);
            const key = preview.key;
            if (seenKeys.has(key)) {
                this.pushSkipped(plan, {
                    rowNumber: index + 2,
                    status: 'skip',
                    reason: '\u540c\u4e00\u6587\u4ef6\u5185\u5b58\u5728\u91cd\u590d\u952e\uff0c\u5df2\u4fdd\u7559\u9996\u6761',
                    ...preview,
                });
                continue;
            }
            seenKeys.add(key);
            const existing = existingMap.get(key);
            this.pushImportDecision(plan, {
                index,
                key,
                payload,
                existing,
                mode,
                skipDuplicates,
            });
        }
        return plan;
    }
    createImportPlan(mode, skipDuplicates, totalCount) {
        return {
            mode,
            skipDuplicates,
            totalCount,
            createdCount: 0,
            updatedCount: 0,
            skippedCount: 0,
            rows: [],
            operations: [],
        };
    }
    pushSkipped(plan, row) {
        plan.skippedCount += 1;
        plan.rows.push(row);
    }
    pushImportDecision(plan, input) {
        const { index, key, payload, existing, mode, skipDuplicates } = input;
        const row = {
            rowNumber: index + 2,
            key,
            buyiText: payload.buyiText,
            zhText: payload.zhText,
            title: payload.title,
            artist: payload.artist ?? null,
        };
        if (mode === 'upsert') {
            if (existing) {
                plan.updatedCount += 1;
                plan.rows.push({
                    ...row,
                    status: 'update',
                    reason: '\u5df2\u5339\u914d\u5230\u73b0\u6709\u5185\u5bb9\uff0c\u5c06\u8986\u76d6\u66f4\u65b0',
                });
                plan.operations.push({
                    action: 'update',
                    payload,
                    existing,
                    row: plan.rows[plan.rows.length - 1],
                });
                return;
            }
            plan.createdCount += 1;
            plan.rows.push({
                ...row,
                status: 'create',
                reason: '\u6570\u636e\u5e93\u4e2d\u4e0d\u5b58\u5728\uff0c\u5c06\u65b0\u589e',
            });
            plan.operations.push({
                action: 'create',
                payload,
                row: plan.rows[plan.rows.length - 1],
            });
            return;
        }
        if (existing && skipDuplicates) {
            this.pushSkipped(plan, {
                ...row,
                status: 'skip',
                reason: '\u5df2\u68c0\u6d4b\u5230\u91cd\u590d\u5185\u5bb9\uff0c\u672c\u6b21\u5bfc\u5165\u5df2\u8df3\u8fc7',
            });
            return;
        }
        if (existing) {
            this.pushSkipped(plan, {
                ...row,
                status: 'skip',
                reason: '\u5df2\u68c0\u6d4b\u5230\u91cd\u590d\u5185\u5bb9\uff0c\u672c\u6b21\u5bfc\u5165\u5df2\u8df3\u8fc7',
            });
            return;
        }
        plan.createdCount += 1;
        plan.rows.push({
            ...row,
            status: 'create',
            reason: '\u6570\u636e\u5e93\u4e2d\u4e0d\u5b58\u5728\uff0c\u5c06\u65b0\u589e',
        });
        plan.operations.push({
            action: 'create',
            payload,
            row: plan.rows[plan.rows.length - 1],
        });
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dictionary_entry_entity_1.DictionaryEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(phrase_entity_1.Phrase)),
    __param(2, (0, typeorm_1.InjectRepository)(proverb_entity_1.Proverb)),
    __param(3, (0, typeorm_1.InjectRepository)(song_entity_1.Song)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof content_sort_service_1.ContentSortService !== "undefined" && content_sort_service_1.ContentSortService) === "function" ? _e : Object, typeof (_f = typeof content_import_service_1.ContentImportService !== "undefined" && content_import_service_1.ContentImportService) === "function" ? _f : Object, typeof (_g = typeof culture_exhibits_service_1.CultureExhibitsService !== "undefined" && culture_exhibits_service_1.CultureExhibitsService) === "function" ? _g : Object])
], ContentService);


/***/ },

/***/ "./src/modules/content/dto/content-admin.dto.ts"
/*!******************************************************!*\
  !*** ./src/modules/content/dto/content-admin.dto.ts ***!
  \******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateSongAdminDto = exports.SongAdminDto = exports.UpdateDictionaryAdminDto = exports.DictionaryAdminDto = exports.UpdateBaseAdminContentDto = exports.BaseAdminContentDto = void 0;
const mapped_types_1 = __webpack_require__(/*! @nestjs/mapped-types */ "@nestjs/mapped-types");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class BaseAdminContentDto {
}
exports.BaseAdminContentDto = BaseAdminContentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], BaseAdminContentDto.prototype, "buyiText", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], BaseAdminContentDto.prototype, "zhText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], BaseAdminContentDto.prototype, "enText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseAdminContentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BaseAdminContentDto.prototype, "isPublished", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BaseAdminContentDto.prototype, "sortOrder", void 0);
class UpdateBaseAdminContentDto extends (0, mapped_types_1.PartialType)(BaseAdminContentDto) {
}
exports.UpdateBaseAdminContentDto = UpdateBaseAdminContentDto;
class DictionaryAdminDto extends BaseAdminContentDto {
}
exports.DictionaryAdminDto = DictionaryAdminDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], DictionaryAdminDto.prototype, "audioUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DictionaryAdminDto.prototype, "audioMediaId", void 0);
class UpdateDictionaryAdminDto extends (0, mapped_types_1.PartialType)(DictionaryAdminDto) {
}
exports.UpdateDictionaryAdminDto = UpdateDictionaryAdminDto;
class SongAdminDto extends BaseAdminContentDto {
}
exports.SongAdminDto = SongAdminDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SongAdminDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SongAdminDto.prototype, "artist", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SongAdminDto.prototype, "coverUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SongAdminDto.prototype, "audioUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SongAdminDto.prototype, "coverMediaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SongAdminDto.prototype, "audioMediaId", void 0);
class UpdateSongAdminDto extends (0, mapped_types_1.PartialType)(SongAdminDto) {
}
exports.UpdateSongAdminDto = UpdateSongAdminDto;


/***/ },

/***/ "./src/modules/content/dto/search-query.dto.ts"
/*!*****************************************************!*\
  !*** ./src/modules/content/dto/search-query.dto.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchQueryDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const pagination_query_dto_1 = __webpack_require__(/*! ../../../common/dto/pagination-query.dto */ "./src/common/dto/pagination-query.dto.ts");
class SearchQueryDto extends pagination_query_dto_1.PaginationQueryDto {
}
exports.SearchQueryDto = SearchQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "keyword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['dictionary', 'phrase', 'proverb', 'song']),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "type", void 0);


/***/ },

/***/ "./src/modules/culture-exhibits/admin-culture-exhibits.controller.ts"
/*!***************************************************************************!*\
  !*** ./src/modules/culture-exhibits/admin-culture-exhibits.controller.ts ***!
  \***************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminCultureExhibitsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const admin_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/admin-jwt.guard */ "./src/common/guards/admin-jwt.guard.ts");
const culture_exhibits_service_1 = __webpack_require__(/*! ./culture-exhibits.service */ "./src/modules/culture-exhibits/culture-exhibits.service.ts");
const culture_exhibit_dto_1 = __webpack_require__(/*! ./dto/culture-exhibit.dto */ "./src/modules/culture-exhibits/dto/culture-exhibit.dto.ts");
let AdminCultureExhibitsController = class AdminCultureExhibitsController {
    constructor(cultureExhibitsService) {
        this.cultureExhibitsService = cultureExhibitsService;
    }
    list() { return this.cultureExhibitsService.listAdmin(); }
    create(payload) { return this.cultureExhibitsService.create(payload); }
    update(id, payload) {
        return this.cultureExhibitsService.update(id, payload);
    }
    remove(id) { return this.cultureExhibitsService.remove(id); }
    links(exhibitId) {
        return this.cultureExhibitsService.listLinks(exhibitId ? Number(exhibitId) : undefined);
    }
    createLink(payload) { return this.cultureExhibitsService.createLink(payload); }
    removeLink(id) { return this.cultureExhibitsService.removeLink(id); }
};
exports.AdminCultureExhibitsController = AdminCultureExhibitsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof culture_exhibit_dto_1.CreateCultureExhibitDto !== "undefined" && culture_exhibit_dto_1.CreateCultureExhibitDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof culture_exhibit_dto_1.UpdateCultureExhibitDto !== "undefined" && culture_exhibit_dto_1.UpdateCultureExhibitDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('links/all'),
    __param(0, (0, common_1.Query)('exhibitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "links", null);
__decorate([
    (0, common_1.Post)('links'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof culture_exhibit_dto_1.CreateContentCultureLinkDto !== "undefined" && culture_exhibit_dto_1.CreateContentCultureLinkDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "createLink", null);
__decorate([
    (0, common_1.Delete)('links/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "removeLink", null);
exports.AdminCultureExhibitsController = AdminCultureExhibitsController = __decorate([
    (0, common_1.Controller)('admin/culture-exhibits'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof culture_exhibits_service_1.CultureExhibitsService !== "undefined" && culture_exhibits_service_1.CultureExhibitsService) === "function" ? _a : Object])
], AdminCultureExhibitsController);


/***/ },

/***/ "./src/modules/culture-exhibits/culture-exhibits.module.ts"
/*!*****************************************************************!*\
  !*** ./src/modules/culture-exhibits/culture-exhibits.module.ts ***!
  \*****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CultureExhibitsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const content_culture_link_entity_1 = __webpack_require__(/*! ../../entities/content-culture-link.entity */ "./src/entities/content-culture-link.entity.ts");
const culture_exhibit_entity_1 = __webpack_require__(/*! ../../entities/culture-exhibit.entity */ "./src/entities/culture-exhibit.entity.ts");
const admin_culture_exhibits_controller_1 = __webpack_require__(/*! ./admin-culture-exhibits.controller */ "./src/modules/culture-exhibits/admin-culture-exhibits.controller.ts");
const culture_exhibits_service_1 = __webpack_require__(/*! ./culture-exhibits.service */ "./src/modules/culture-exhibits/culture-exhibits.service.ts");
const miniapp_culture_exhibits_controller_1 = __webpack_require__(/*! ./miniapp-culture-exhibits.controller */ "./src/modules/culture-exhibits/miniapp-culture-exhibits.controller.ts");
let CultureExhibitsModule = class CultureExhibitsModule {
};
exports.CultureExhibitsModule = CultureExhibitsModule;
exports.CultureExhibitsModule = CultureExhibitsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([culture_exhibit_entity_1.CultureExhibit, content_culture_link_entity_1.ContentCultureLink])],
        controllers: [miniapp_culture_exhibits_controller_1.MiniappCultureExhibitsController, admin_culture_exhibits_controller_1.AdminCultureExhibitsController],
        providers: [culture_exhibits_service_1.CultureExhibitsService],
        exports: [culture_exhibits_service_1.CultureExhibitsService],
    })
], CultureExhibitsModule);


/***/ },

/***/ "./src/modules/culture-exhibits/culture-exhibits.service.ts"
/*!******************************************************************!*\
  !*** ./src/modules/culture-exhibits/culture-exhibits.service.ts ***!
  \******************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CultureExhibitsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const content_culture_link_entity_1 = __webpack_require__(/*! ../../entities/content-culture-link.entity */ "./src/entities/content-culture-link.entity.ts");
const culture_exhibit_entity_1 = __webpack_require__(/*! ../../entities/culture-exhibit.entity */ "./src/entities/culture-exhibit.entity.ts");
let CultureExhibitsService = class CultureExhibitsService {
    constructor(exhibitRepository, linkRepository) {
        this.exhibitRepository = exhibitRepository;
        this.linkRepository = linkRepository;
    }
    async getPublishedBySlug(slug) {
        const exhibit = await this.exhibitRepository.findOne({ where: { slug, isPublished: true } });
        if (!exhibit)
            throw new common_1.NotFoundException('未找到已发布的文化展项');
        return this.toDetail(exhibit);
    }
    async findRelatedExhibits(contentType, contentId) {
        const links = await this.linkRepository.find({
            where: { contentType, contentId },
            relations: { exhibit: true },
            order: { sortOrder: 'ASC', id: 'ASC' },
        });
        return links.filter((link) => link.exhibit?.isPublished).map((link) => this.toSummary(link.exhibit));
    }
    async create(payload) {
        return this.exhibitRepository.save(this.exhibitRepository.create({
            ...payload,
            kicker: payload.kicker?.trim() ?? '',
            story: payload.story?.trim() ?? '',
            patternLabel: payload.patternLabel?.trim() ?? '',
            sourceStatus: payload.sourceStatus ?? 'verified',
            isPublished: payload.isPublished ?? true,
            sortOrder: payload.sortOrder ?? 0,
        }));
    }
    async listAdmin() {
        return this.exhibitRepository.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
    }
    async update(id, payload) {
        const exhibit = await this.exhibitRepository.findOne({ where: { id } });
        if (!exhibit)
            throw new common_1.NotFoundException('文化展项不存在');
        Object.assign(exhibit, payload);
        return this.exhibitRepository.save(exhibit);
    }
    async remove(id) {
        const exhibit = await this.exhibitRepository.findOne({ where: { id } });
        if (!exhibit)
            throw new common_1.NotFoundException('文化展项不存在');
        await this.exhibitRepository.remove(exhibit);
        return { success: true };
    }
    async createLink(payload) {
        const exhibit = await this.exhibitRepository.findOne({ where: { id: payload.exhibitId } });
        if (!exhibit)
            throw new common_1.NotFoundException('关联的文化展项不存在');
        const existing = await this.linkRepository.findOne({
            where: { contentType: payload.contentType, contentId: payload.contentId, exhibitId: payload.exhibitId },
        });
        if (existing)
            return existing;
        return this.linkRepository.save(this.linkRepository.create({ ...payload, sortOrder: payload.sortOrder ?? 0 }));
    }
    async removeLink(id) {
        const link = await this.linkRepository.findOne({ where: { id } });
        if (!link)
            throw new common_1.NotFoundException('文化关联不存在');
        await this.linkRepository.remove(link);
        return { success: true };
    }
    async listLinks(exhibitId) {
        return this.linkRepository.find({
            where: exhibitId ? { exhibitId } : {},
            relations: { exhibit: true },
            order: { sortOrder: 'ASC', id: 'ASC' },
        });
    }
    toSummary(exhibit) {
        return {
            slug: exhibit.slug,
            title: exhibit.title,
            kicker: exhibit.kicker,
            toneIndex: exhibit.toneIndex,
            featuredSongId: exhibit.featuredSongId,
        };
    }
    toDetail(exhibit) {
        return {
            ...this.toSummary(exhibit),
            summary: exhibit.summary,
            story: exhibit.story,
            patternLabel: exhibit.patternLabel,
            sourceTitle: exhibit.sourceTitle,
            sourceUrl: exhibit.sourceUrl,
            sourceStatus: exhibit.sourceStatus,
            updatedAt: exhibit.updatedAt,
        };
    }
};
exports.CultureExhibitsService = CultureExhibitsService;
exports.CultureExhibitsService = CultureExhibitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(culture_exhibit_entity_1.CultureExhibit)),
    __param(1, (0, typeorm_1.InjectRepository)(content_culture_link_entity_1.ContentCultureLink)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], CultureExhibitsService);


/***/ },

/***/ "./src/modules/culture-exhibits/dto/culture-exhibit.dto.ts"
/*!*****************************************************************!*\
  !*** ./src/modules/culture-exhibits/dto/culture-exhibit.dto.ts ***!
  \*****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateContentCultureLinkDto = exports.UpdateCultureExhibitDto = exports.CreateCultureExhibitDto = void 0;
const mapped_types_1 = __webpack_require__(/*! @nestjs/mapped-types */ "@nestjs/mapped-types");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const content_type_enum_1 = __webpack_require__(/*! ../../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
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
    __metadata("design:type", typeof (_a = typeof content_type_enum_1.ContentType !== "undefined" && content_type_enum_1.ContentType) === "function" ? _a : Object)
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


/***/ },

/***/ "./src/modules/culture-exhibits/miniapp-culture-exhibits.controller.ts"
/*!*****************************************************************************!*\
  !*** ./src/modules/culture-exhibits/miniapp-culture-exhibits.controller.ts ***!
  \*****************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappCultureExhibitsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const culture_exhibits_service_1 = __webpack_require__(/*! ./culture-exhibits.service */ "./src/modules/culture-exhibits/culture-exhibits.service.ts");
let MiniappCultureExhibitsController = class MiniappCultureExhibitsController {
    constructor(cultureExhibitsService) {
        this.cultureExhibitsService = cultureExhibitsService;
    }
    detail(slug) {
        return this.cultureExhibitsService.getPublishedBySlug(slug);
    }
};
exports.MiniappCultureExhibitsController = MiniappCultureExhibitsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MiniappCultureExhibitsController.prototype, "detail", null);
exports.MiniappCultureExhibitsController = MiniappCultureExhibitsController = __decorate([
    (0, common_1.Controller)('miniapp/culture-exhibits'),
    __metadata("design:paramtypes", [typeof (_a = typeof culture_exhibits_service_1.CultureExhibitsService !== "undefined" && culture_exhibits_service_1.CultureExhibitsService) === "function" ? _a : Object])
], MiniappCultureExhibitsController);


/***/ },

/***/ "./src/modules/health/health.controller.ts"
/*!*************************************************!*\
  !*** ./src/modules/health/health.controller.ts ***!
  \*************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const health_service_1 = __webpack_require__(/*! ./health.service */ "./src/modules/health/health.service.ts");
let HealthController = class HealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    getHealth() {
        return this.healthService.getHealth();
    }
    async getReady() {
        return this.healthService.getReadiness();
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReady", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof health_service_1.HealthService !== "undefined" && health_service_1.HealthService) === "function" ? _a : Object])
], HealthController);


/***/ },

/***/ "./src/modules/health/health.module.ts"
/*!*********************************************!*\
  !*** ./src/modules/health/health.module.ts ***!
  \*********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const health_controller_1 = __webpack_require__(/*! ./health.controller */ "./src/modules/health/health.controller.ts");
const health_service_1 = __webpack_require__(/*! ./health.service */ "./src/modules/health/health.service.ts");
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        providers: [health_service_1.HealthService],
    })
], HealthModule);


/***/ },

/***/ "./src/modules/health/health.service.ts"
/*!**********************************************!*\
  !*** ./src/modules/health/health.service.ts ***!
  \**********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const runtime_validation_1 = __webpack_require__(/*! ../../config/runtime-validation */ "./src/config/runtime-validation.ts");
let HealthService = class HealthService {
    constructor(dataSource, configService) {
        this.dataSource = dataSource;
        this.configService = configService;
    }
    getHealth() {
        return {
            status: 'ok',
            service: this.configService.get('app.name', 'Buyi Dictionary API'),
            environment: process.env.NODE_ENV || 'development',
            timestamp: Date.now(),
        };
    }
    async getReadiness() {
        const readiness = (0, runtime_validation_1.getReadinessReport)(this.configService);
        const checks = {
            database: false,
            mediaConfig: readiness.ok,
        };
        try {
            await this.dataSource.query('SELECT 1 AS ok');
            checks.database = true;
        }
        catch {
            readiness.issues.push('数据库连接不可用');
        }
        if (!checks.database || !checks.mediaConfig) {
            throw new common_1.ServiceUnavailableException({
                status: 'degraded',
                checks,
                issues: readiness.issues,
            });
        }
        return {
            status: 'ready',
            checks,
            timestamp: Date.now(),
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], HealthService);


/***/ },

/***/ "./src/modules/media/dto/upload-media.dto.ts"
/*!***************************************************!*\
  !*** ./src/modules/media/dto/upload-media.dto.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UploadMediaDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class UploadMediaDto {
}
exports.UploadMediaDto = UploadMediaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['image', 'audio']),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadMediaDto.prototype, "filename", void 0);


/***/ },

/***/ "./src/modules/media/media.module.ts"
/*!*******************************************!*\
  !*** ./src/modules/media/media.module.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const media_asset_entity_1 = __webpack_require__(/*! ../../entities/media-asset.entity */ "./src/entities/media-asset.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../../entities/song.entity */ "./src/entities/song.entity.ts");
const media_service_1 = __webpack_require__(/*! ./media.service */ "./src/modules/media/media.service.ts");
const storage_service_1 = __webpack_require__(/*! ./storage.service */ "./src/modules/media/storage.service.ts");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([media_asset_entity_1.MediaAsset, dictionary_entry_entity_1.DictionaryEntry, song_entity_1.Song])],
        providers: [storage_service_1.StorageService, media_service_1.MediaService],
        exports: [storage_service_1.StorageService, media_service_1.MediaService, typeorm_1.TypeOrmModule],
    })
], MediaModule);


/***/ },

/***/ "./src/modules/media/media.service.ts"
/*!********************************************!*\
  !*** ./src/modules/media/media.service.ts ***!
  \********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MediaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const path_1 = __webpack_require__(/*! path */ "path");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const media_asset_entity_1 = __webpack_require__(/*! ../../entities/media-asset.entity */ "./src/entities/media-asset.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../../entities/song.entity */ "./src/entities/song.entity.ts");
const storage_service_1 = __webpack_require__(/*! ./storage.service */ "./src/modules/media/storage.service.ts");
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
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof storage_service_1.StorageService !== "undefined" && storage_service_1.StorageService) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object])
], MediaService);


/***/ },

/***/ "./src/modules/media/media.types.ts"
/*!******************************************!*\
  !*** ./src/modules/media/media.types.ts ***!
  \******************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ },

/***/ "./src/modules/media/storage.service.ts"
/*!**********************************************!*\
  !*** ./src/modules/media/storage.service.ts ***!
  \**********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const promises_1 = __webpack_require__(/*! fs/promises */ "fs/promises");
const path_1 = __webpack_require__(/*! path */ "path");
const cos_nodejs_sdk_v5_1 = __webpack_require__(/*! cos-nodejs-sdk-v5 */ "cos-nodejs-sdk-v5");
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
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], StorageService);


/***/ },

/***/ "./src/modules/miniapp-agent/miniapp-agent.controller.ts"
/*!***************************************************************!*\
  !*** ./src/modules/miniapp-agent/miniapp-agent.controller.ts ***!
  \***************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var MiniappAgentController_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappAgentController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const express_1 = __webpack_require__(/*! express */ "express");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const miniapp_agent_service_1 = __webpack_require__(/*! ./miniapp-agent.service */ "./src/modules/miniapp-agent/miniapp-agent.service.ts");
class ChatMessageDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "content", void 0);
class AskDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], AskDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChatMessageDto),
    __metadata("design:type", Array)
], AskDto.prototype, "history", void 0);
let MiniappAgentController = MiniappAgentController_1 = class MiniappAgentController {
    constructor(agentService) {
        this.agentService = agentService;
        this.logger = new common_1.Logger(MiniappAgentController_1.name);
    }
    async ask(dto, _user, res) {
        const question = (dto?.question || '').trim();
        if (!question) {
            throw new common_1.BadRequestException('问题不能为空');
        }
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();
        let closed = false;
        const send = (payload) => {
            if (closed)
                return;
            try {
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
            }
            catch {
                closed = true;
            }
        };
        const finish = () => {
            if (closed)
                return;
            closed = true;
            try {
                res.end();
            }
            catch {
            }
        };
        if (!this.agentService.isProjectRelated(question)) {
            send({
                type: 'delta',
                content: '抱歉，我是布依文化导览员，只能回答与布依族文化相关的问题（如布依语词汇、声调、民歌、谚语、蜡染、铜鼓、民俗节日等）。请尝试向我提问布依文化相关的内容。',
            });
            send({ type: 'done' });
            finish();
            return;
        }
        if (!this.agentService.isConfigured()) {
            send({ type: 'error', message: '智能体服务暂未配置，请联系管理员' });
            finish();
            return;
        }
        await this.agentService.streamChat(question, (dto.history ?? []), (chunk) => send({ type: 'delta', content: chunk }), () => {
            send({ type: 'done' });
            finish();
        }, (err) => {
            this.logger.error(err.message);
            send({ type: 'error', message: '智能体响应失败，请稍后重试' });
            finish();
        });
    }
};
exports.MiniappAgentController = MiniappAgentController;
__decorate([
    (0, common_1.Post)('ask'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AskDto, Object, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], MiniappAgentController.prototype, "ask", null);
exports.MiniappAgentController = MiniappAgentController = MiniappAgentController_1 = __decorate([
    (0, common_1.Controller)('miniapp/agent'),
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof miniapp_agent_service_1.MiniappAgentService !== "undefined" && miniapp_agent_service_1.MiniappAgentService) === "function" ? _a : Object])
], MiniappAgentController);


/***/ },

/***/ "./src/modules/miniapp-agent/miniapp-agent.module.ts"
/*!***********************************************************!*\
  !*** ./src/modules/miniapp-agent/miniapp-agent.module.ts ***!
  \***********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappAgentModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const agent_cache_entity_1 = __webpack_require__(/*! ../../entities/agent-cache.entity */ "./src/entities/agent-cache.entity.ts");
const miniapp_agent_controller_1 = __webpack_require__(/*! ./miniapp-agent.controller */ "./src/modules/miniapp-agent/miniapp-agent.controller.ts");
const miniapp_agent_service_1 = __webpack_require__(/*! ./miniapp-agent.service */ "./src/modules/miniapp-agent/miniapp-agent.service.ts");
let MiniappAgentModule = class MiniappAgentModule {
};
exports.MiniappAgentModule = MiniappAgentModule;
exports.MiniappAgentModule = MiniappAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_cache_entity_1.AgentCache])],
        controllers: [miniapp_agent_controller_1.MiniappAgentController],
        providers: [miniapp_agent_service_1.MiniappAgentService],
    })
], MiniappAgentModule);


/***/ },

/***/ "./src/modules/miniapp-agent/miniapp-agent.service.ts"
/*!************************************************************!*\
  !*** ./src/modules/miniapp-agent/miniapp-agent.service.ts ***!
  \************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var MiniappAgentService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappAgentService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const agent_cache_entity_1 = __webpack_require__(/*! ../../entities/agent-cache.entity */ "./src/entities/agent-cache.entity.ts");
const PROJECT_KEYWORDS = [
    '布依', '布依族', '布依语', '词典', '方言', '声调', '舒声', '促声',
    '民歌', '谚语', '短语', '词汇', '例句', '语法', '音节', '元音', '辅音', '拼音', '汉字',
    '蜡染', '铜鼓', '纹样', '织锦', '刺绣', '非遗', '遗产', '工艺',
    '三月三', '六月六', '四月八', '节日', '祭祀', '民俗', '习俗', '节庆',
    '贵州', '黔南', '黔西南', '黔东南', '少数民族', '民族',
    '分手调', '雨水情', '会友歌', '导览员', '文化', '族群', '聚居',
];
const SYSTEM_PROMPT = [
    '你是「布依文化导览员」，服务于「布依词典」文化平台。你只能回答与布依族文化相关的问题，话题范围包括：',
    '1. 布依语：词汇、声调（6 个舒声调 + 2 个促声调）、语法、短语、例句、拼音；',
    '2. 布依族民歌、谚语、口传文学；',
    '3. 布依族民俗：节日（三月三、六月六、四月八等）、祭祀、铜鼓礼仪；',
    '4. 布依族传统工艺：蜡染、织锦、刺绣、纹样（非遗）；',
    '5. 布依族分布与历史：主要聚居于贵州黔南、黔西南，使用人口约 200 万。',
    '',
    '硬性规则：',
    '- 若用户提问与布依族文化无关（如编程、天气、新闻、股市、其他民族无关内容、闲聊等），必须礼貌拒绝，并引导用户回到布依文化话题；',
    '- 不要编造不确定的事实，不确定时坦诚说明；',
    '- 使用简体中文回答，语气亲切、专业、简洁；',
    '- 回答控制在 300 字以内，必要时用分点列出。',
].join('\n');
let MiniappAgentService = MiniappAgentService_1 = class MiniappAgentService {
    constructor(configService, cacheRepo) {
        this.configService = configService;
        this.cacheRepo = cacheRepo;
        this.logger = new common_1.Logger(MiniappAgentService_1.name);
    }
    isProjectRelated(question) {
        const q = (question || '').toLowerCase();
        return PROJECT_KEYWORDS.some((kw) => q.includes(kw.toLowerCase()));
    }
    isConfigured() {
        const apiKey = this.configService.get('ai.apiKey', { infer: true });
        return Boolean(apiKey && apiKey.trim());
    }
    normalizeKey(question) {
        return (question || '').trim().toLowerCase().slice(0, 500);
    }
    async streamChat(question, history, onDelta, onDone, onError) {
        const useCache = !history || history.length === 0;
        if (useCache) {
            const key = this.normalizeKey(question);
            try {
                const cached = await this.cacheRepo.findOne({ where: { questionKey: key } });
                if (cached && cached.answer) {
                    await this.cacheRepo.increment({ id: cached.id }, 'hitCount', 1);
                    this.logger.log(`缓存命中: "${question.slice(0, 30)}..." (hitCount=${cached.hitCount + 1})`);
                    const chunks = this.splitToChunks(cached.answer, 12);
                    for (const chunk of chunks) {
                        onDelta(chunk);
                        await this.sleep(20);
                    }
                    onDone();
                    return;
                }
            }
            catch (err) {
                this.logger.warn(`缓存查询失败，降级为直接调用 API: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        const apiKey = this.configService.get('ai.apiKey', { infer: true });
        const baseURL = this.configService.get('ai.baseURL', { infer: true });
        const model = this.configService.get('ai.model', { infer: true });
        if (!apiKey) {
            onError(new common_1.ServiceUnavailableException('智能体服务未配置 API Key'));
            return;
        }
        const recentHistory = (history ?? []).slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
        }));
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...recentHistory,
            { role: 'user', content: question },
        ];
        let fullAnswer = '';
        try {
            const resp = await fetch(`${baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    stream: true,
                    temperature: 0.6,
                    max_tokens: 1024,
                }),
            });
            if (!resp.ok || !resp.body) {
                const errText = await resp.text().catch(() => '');
                throw new Error(`DeepSeek 接口错误 ${resp.status}: ${errText.slice(0, 200)}`);
            }
            const reader = resp.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data:'))
                        continue;
                    const data = trimmed.slice(5).trim();
                    if (data === '[DONE]') {
                        await this.saveCache(question, fullAnswer);
                        onDone();
                        return;
                    }
                    try {
                        const json = JSON.parse(data);
                        const delta = json?.choices?.[0]?.delta?.content;
                        if (typeof delta === 'string' && delta) {
                            fullAnswer += delta;
                            onDelta(delta);
                        }
                    }
                    catch {
                    }
                }
            }
            await this.saveCache(question, fullAnswer);
            onDone();
        }
        catch (err) {
            this.logger.error(`DeepSeek 流式调用失败: ${err instanceof Error ? err.message : String(err)}`);
            onError(err instanceof Error ? err : new Error(String(err)));
        }
    }
    async saveCache(question, answer) {
        const trimmedAnswer = (answer || '').trim();
        if (!trimmedAnswer)
            return;
        const key = this.normalizeKey(question);
        if (!key)
            return;
        try {
            const existing = await this.cacheRepo.findOne({ where: { questionKey: key } });
            if (existing) {
                return;
            }
            const cache = this.cacheRepo.create({
                questionKey: key,
                question: question.trim().slice(0, 500),
                answer: trimmedAnswer,
                hitCount: 0,
            });
            await this.cacheRepo.save(cache);
            this.logger.log(`缓存已写入: "${question.slice(0, 30)}..."`);
        }
        catch (err) {
            this.logger.warn(`缓存写入失败: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    splitToChunks(text, size) {
        if (!text)
            return [];
        const chunks = [];
        let i = 0;
        while (i < text.length) {
            let end = Math.min(i + size, text.length);
            if (end < text.length) {
                const punct = '，。；！？、,.!?; \n';
                let next = end;
                for (let j = end; j < Math.min(end + 8, text.length); j++) {
                    if (punct.includes(text[j])) {
                        next = j + 1;
                        break;
                    }
                }
                end = next;
            }
            chunks.push(text.slice(i, end));
            i = end;
        }
        return chunks;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.MiniappAgentService = MiniappAgentService;
exports.MiniappAgentService = MiniappAgentService = MiniappAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(agent_cache_entity_1.AgentCache)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], MiniappAgentService);


/***/ },

/***/ "./src/modules/miniapp-auth/dto/web-login.dto.ts"
/*!*******************************************************!*\
  !*** ./src/modules/miniapp-auth/dto/web-login.dto.ts ***!
  \*******************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebRegisterDto = exports.WebLoginDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class WebLoginDto {
}
exports.WebLoginDto = WebLoginDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], WebLoginDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], WebLoginDto.prototype, "password", void 0);
class WebRegisterDto {
}
exports.WebRegisterDto = WebRegisterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(64),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' }),
    __metadata("design:type", String)
], WebRegisterDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], WebRegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], WebRegisterDto.prototype, "nickname", void 0);


/***/ },

/***/ "./src/modules/miniapp-auth/dto/wechat-login.dto.ts"
/*!**********************************************************!*\
  !*** ./src/modules/miniapp-auth/dto/wechat-login.dto.ts ***!
  \**********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WechatLoginDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class WechatLoginDto {
}
exports.WechatLoginDto = WechatLoginDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "openid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "nickname", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], WechatLoginDto.prototype, "avatarUrl", void 0);


/***/ },

/***/ "./src/modules/miniapp-auth/miniapp-auth.controller.ts"
/*!*************************************************************!*\
  !*** ./src/modules/miniapp-auth/miniapp-auth.controller.ts ***!
  \*************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappAuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const refresh_token_dto_1 = __webpack_require__(/*! ../../common/dto/refresh-token.dto */ "./src/common/dto/refresh-token.dto.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const miniapp_auth_service_1 = __webpack_require__(/*! ./miniapp-auth.service */ "./src/modules/miniapp-auth/miniapp-auth.service.ts");
const web_login_dto_1 = __webpack_require__(/*! ./dto/web-login.dto */ "./src/modules/miniapp-auth/dto/web-login.dto.ts");
const wechat_login_dto_1 = __webpack_require__(/*! ./dto/wechat-login.dto */ "./src/modules/miniapp-auth/dto/wechat-login.dto.ts");
let MiniappAuthController = class MiniappAuthController {
    constructor(miniappAuthService) {
        this.miniappAuthService = miniappAuthService;
    }
    wechatLogin(payload) {
        return this.miniappAuthService.login(payload);
    }
    webLogin(payload) {
        return this.miniappAuthService.webLogin(payload);
    }
    webRegister(payload) {
        return this.miniappAuthService.webRegister(payload);
    }
    refresh(payload) {
        return this.miniappAuthService.refresh(payload.refreshToken);
    }
    logout(user) {
        return this.miniappAuthService.logout(user.sid);
    }
};
exports.MiniappAuthController = MiniappAuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('wechat-login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof wechat_login_dto_1.WechatLoginDto !== "undefined" && wechat_login_dto_1.WechatLoginDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], MiniappAuthController.prototype, "wechatLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('web-login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof web_login_dto_1.WebLoginDto !== "undefined" && web_login_dto_1.WebLoginDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], MiniappAuthController.prototype, "webLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('web-register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof web_login_dto_1.WebRegisterDto !== "undefined" && web_login_dto_1.WebRegisterDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], MiniappAuthController.prototype, "webRegister", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof refresh_token_dto_1.RefreshTokenDto !== "undefined" && refresh_token_dto_1.RefreshTokenDto) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], MiniappAuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MiniappAuthController.prototype, "logout", null);
exports.MiniappAuthController = MiniappAuthController = __decorate([
    (0, common_1.Controller)('miniapp/auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof miniapp_auth_service_1.MiniappAuthService !== "undefined" && miniapp_auth_service_1.MiniappAuthService) === "function" ? _a : Object])
], MiniappAuthController);


/***/ },

/***/ "./src/modules/miniapp-auth/miniapp-auth.module.ts"
/*!*********************************************************!*\
  !*** ./src/modules/miniapp-auth/miniapp-auth.module.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappAuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const user_entity_1 = __webpack_require__(/*! ../../entities/user.entity */ "./src/entities/user.entity.ts");
const auth_sessions_module_1 = __webpack_require__(/*! ../auth-sessions/auth-sessions.module */ "./src/modules/auth-sessions/auth-sessions.module.ts");
const miniapp_auth_controller_1 = __webpack_require__(/*! ./miniapp-auth.controller */ "./src/modules/miniapp-auth/miniapp-auth.controller.ts");
const miniapp_auth_service_1 = __webpack_require__(/*! ./miniapp-auth.service */ "./src/modules/miniapp-auth/miniapp-auth.service.ts");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./src/modules/users/users.module.ts");
const wechat_service_1 = __webpack_require__(/*! ../../common/services/wechat.service */ "./src/common/services/wechat.service.ts");
let MiniappAuthModule = class MiniappAuthModule {
};
exports.MiniappAuthModule = MiniappAuthModule;
exports.MiniappAuthModule = MiniappAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, auth_sessions_module_1.AuthSessionsModule, typeorm_1.TypeOrmModule.forFeature([user_entity_1.User])],
        controllers: [miniapp_auth_controller_1.MiniappAuthController],
        providers: [miniapp_auth_service_1.MiniappAuthService, wechat_service_1.WechatService],
    })
], MiniappAuthModule);


/***/ },

/***/ "./src/modules/miniapp-auth/miniapp-auth.service.ts"
/*!**********************************************************!*\
  !*** ./src/modules/miniapp-auth/miniapp-auth.service.ts ***!
  \**********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappAuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const bcrypt = __webpack_require__(/*! bcryptjs */ "bcryptjs");
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ../../entities/user.entity */ "./src/entities/user.entity.ts");
const wechat_service_1 = __webpack_require__(/*! ../../common/services/wechat.service */ "./src/common/services/wechat.service.ts");
const auth_sessions_service_1 = __webpack_require__(/*! ../auth-sessions/auth-sessions.service */ "./src/modules/auth-sessions/auth-sessions.service.ts");
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/modules/users/users.service.ts");
let MiniappAuthService = class MiniappAuthService {
    constructor(usersRepository, usersService, wechatService, jwtService, configService, authSessionsService) {
        this.usersRepository = usersRepository;
        this.usersService = usersService;
        this.wechatService = wechatService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.authSessionsService = authSessionsService;
    }
    async login(payload) {
        const session = await this.wechatService.code2Session(payload.code);
        const user = await this.usersService.upsertWechatUser({
            openid: session.openid,
            unionid: session.unionid,
            sessionKey: session.session_key,
            nickname: payload.nickname ?? null,
            avatarUrl: payload.avatarUrl ?? null,
        });
        const tokens = await this.issueTokens({
            userId: user.id,
            nickname: user.nickname,
        });
        const settings = await this.usersService.getSettings(user.id);
        return {
            ...tokens,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
            },
            settings,
        };
    }
    async refresh(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        const session = await this.authSessionsService.validateRefreshToken({
            sessionId: payload.sid,
            userType: 'miniapp',
            userId: payload.sub,
            refreshToken,
        });
        if (!session) {
            throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
        const user = await this.usersService.findById(payload.sub);
        const tokens = await this.issueTokens({
            userId: user.id,
            nickname: user.nickname,
            sessionId: session.sessionId,
            persistSession: false,
        });
        await this.authSessionsService.rotateRefreshToken(session.sessionId, tokens.refreshToken, this.getTokenExpiry(tokens.refreshToken));
        const settings = await this.usersService.getSettings(user.id);
        return {
            ...tokens,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
            },
            settings,
        };
    }
    async logout(sessionId) {
        await this.authSessionsService.deactivateSession(sessionId, 'miniapp');
        return {
            success: true,
            message: '\u5df2\u9000\u51fa\u767b\u5f55',
        };
    }
    async webLogin(payload) {
        const user = await this.usersRepository.findOne({ where: { username: payload.username } });
        if (!user?.isActive || !user.passwordHash) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const isValid = await bcrypt.compare(payload.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        user.lastLoginTime = new Date();
        await this.usersRepository.save(user);
        const tokens = await this.issueTokens({
            userId: user.id,
            nickname: user.nickname,
        });
        const settings = await this.usersService.getSettings(user.id);
        return {
            ...tokens,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                username: user.username,
            },
            settings,
        };
    }
    async webRegister(payload) {
        const existing = await this.usersRepository.findOne({ where: { username: payload.username } });
        if (existing) {
            throw new common_1.ConflictException('用户名已被占用');
        }
        const passwordHash = await bcrypt.hash(payload.password, 10);
        const user = this.usersRepository.create({
            username: payload.username,
            passwordHash,
            nickname: payload.nickname || payload.username,
            lastLoginTime: new Date(),
        });
        const savedUser = await this.usersRepository.save(user);
        const tokens = await this.issueTokens({
            userId: savedUser.id,
            nickname: savedUser.nickname,
        });
        const settings = await this.usersService.getSettings(savedUser.id);
        return {
            ...tokens,
            user: {
                id: savedUser.id,
                nickname: savedUser.nickname,
                avatarUrl: savedUser.avatarUrl,
                username: savedUser.username,
            },
            settings,
        };
    }
    async issueTokens(params) {
        const sessionId = params.sessionId ?? (0, crypto_1.randomUUID)();
        const persistSession = params.persistSession ?? true;
        const accessToken = await this.jwtService.signAsync({
            sub: params.userId,
            sid: sessionId,
            nickname: params.nickname,
            tokenType: 'miniapp',
            tokenKind: 'access',
        }, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.expiresIn', '7d'),
        });
        const refreshToken = await this.jwtService.signAsync({
            sub: params.userId,
            sid: sessionId,
            tokenType: 'miniapp',
            tokenKind: 'refresh',
        }, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.refreshExpiresIn', '30d'),
        });
        if (persistSession) {
            await this.authSessionsService.createSession({
                sessionId,
                userType: 'miniapp',
                userId: params.userId,
                refreshToken,
                expiresAt: this.getTokenExpiry(refreshToken),
            });
        }
        return {
            accessToken,
            refreshToken,
        };
    }
    verifyRefreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.secret'),
            });
            if (payload.tokenType !== 'miniapp' || payload.tokenKind !== 'refresh') {
                throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u4e0d\u53ef\u7528');
            }
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
    }
    getTokenExpiry(token) {
        const payload = this.jwtService.decode(token);
        if (!payload?.exp) {
            throw new common_1.UnauthorizedException('\u65e0\u6cd5\u89e3\u6790\u5237\u65b0\u4ee4\u724c\u8fc7\u671f\u65f6\u95f4');
        }
        return new Date(payload.exp * 1000);
    }
};
exports.MiniappAuthService = MiniappAuthService;
exports.MiniappAuthService = MiniappAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object, typeof (_c = typeof wechat_service_1.WechatService !== "undefined" && wechat_service_1.WechatService) === "function" ? _c : Object, typeof (_d = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object, typeof (_f = typeof auth_sessions_service_1.AuthSessionsService !== "undefined" && auth_sessions_service_1.AuthSessionsService) === "function" ? _f : Object])
], MiniappAuthService);


/***/ },

/***/ "./src/modules/miniapp-badges/miniapp-badges.controller.ts"
/*!*****************************************************************!*\
  !*** ./src/modules/miniapp-badges/miniapp-badges.controller.ts ***!
  \*****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappBadgesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const miniapp_badges_service_1 = __webpack_require__(/*! ./miniapp-badges.service */ "./src/modules/miniapp-badges/miniapp-badges.service.ts");
let MiniappBadgesController = class MiniappBadgesController {
    constructor(badgesService) {
        this.badgesService = badgesService;
    }
    list(user) {
        return this.badgesService.list(user.sub);
    }
};
exports.MiniappBadgesController = MiniappBadgesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MiniappBadgesController.prototype, "list", null);
exports.MiniappBadgesController = MiniappBadgesController = __decorate([
    (0, common_1.Controller)('miniapp/badges'),
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof miniapp_badges_service_1.MiniappBadgesService !== "undefined" && miniapp_badges_service_1.MiniappBadgesService) === "function" ? _a : Object])
], MiniappBadgesController);


/***/ },

/***/ "./src/modules/miniapp-badges/miniapp-badges.module.ts"
/*!*************************************************************!*\
  !*** ./src/modules/miniapp-badges/miniapp-badges.module.ts ***!
  \*************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappBadgesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const badge_entity_1 = __webpack_require__(/*! ../../entities/badge.entity */ "./src/entities/badge.entity.ts");
const favorite_entity_1 = __webpack_require__(/*! ../../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const miniapp_badges_controller_1 = __webpack_require__(/*! ./miniapp-badges.controller */ "./src/modules/miniapp-badges/miniapp-badges.controller.ts");
const miniapp_badges_service_1 = __webpack_require__(/*! ./miniapp-badges.service */ "./src/modules/miniapp-badges/miniapp-badges.service.ts");
let MiniappBadgesModule = class MiniappBadgesModule {
};
exports.MiniappBadgesModule = MiniappBadgesModule;
exports.MiniappBadgesModule = MiniappBadgesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([badge_entity_1.Badge, favorite_entity_1.Favorite, learning_record_entity_1.LearningRecord])],
        controllers: [miniapp_badges_controller_1.MiniappBadgesController],
        providers: [miniapp_badges_service_1.MiniappBadgesService],
        exports: [miniapp_badges_service_1.MiniappBadgesService],
    })
], MiniappBadgesModule);


/***/ },

/***/ "./src/modules/miniapp-badges/miniapp-badges.service.ts"
/*!**************************************************************!*\
  !*** ./src/modules/miniapp-badges/miniapp-badges.service.ts ***!
  \**************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappBadgesService = exports.BADGE_DEFINITIONS = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const badge_entity_1 = __webpack_require__(/*! ../../entities/badge.entity */ "./src/entities/badge.entity.ts");
const favorite_entity_1 = __webpack_require__(/*! ../../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const learning_stats_1 = __webpack_require__(/*! ../miniapp-learning-records/learning-stats */ "./src/modules/miniapp-learning-records/learning-stats.ts");
exports.BADGE_DEFINITIONS = {
    'first-word': { name: '初识布依', description: '查看了第一个布依语词条', pattern: 'batik' },
    'streak-7': { name: '七日不辍', description: '连续学习 7 天', pattern: 'drum' },
    'streak-30': { name: '月学不辍', description: '连续学习 30 天', pattern: 'drum' },
    'explorer': { name: '文化探索者', description: '浏览全部四类内容', pattern: 'weaving' },
    'collector': { name: '词汇收藏家', description: '收藏 10 个词条', pattern: 'batik' },
    'singer': { name: '天籁之音', description: '聆听 5 首民歌', pattern: 'weaving' },
};
let MiniappBadgesService = class MiniappBadgesService {
    constructor(badgeRepository, favoriteRepository, learningRecordRepository) {
        this.badgeRepository = badgeRepository;
        this.favoriteRepository = favoriteRepository;
        this.learningRecordRepository = learningRecordRepository;
    }
    async list(userId) {
        const badges = await this.syncProgressBadges(userId);
        const badgeByCode = new Map(badges.map((badge) => [badge.code, badge]));
        const all = Object.entries(exports.BADGE_DEFINITIONS).map(([code, def]) => {
            const unlocked = badgeByCode.get(code);
            const isUnlocked = Boolean(unlocked);
            return {
                id: unlocked?.id ?? code,
                code,
                name: def.name,
                description: def.description,
                pattern: def.pattern,
                locked: !isUnlocked,
                unlocked: isUnlocked,
                isUnlocked,
                unlockedAt: unlocked?.unlockedAt ?? null,
            };
        });
        return {
            items: all,
            total: all.length,
            unlockedCount: badgeByCode.size,
        };
    }
    async syncProgressBadges(userId) {
        const [badges, records, favoriteCount] = await Promise.all([
            this.badgeRepository.find({
                where: { userId },
                order: { unlockedAt: 'DESC' },
            }),
            this.learningRecordRepository.find({ where: { userId } }),
            this.favoriteRepository.count({ where: { userId } }),
        ]);
        const stats = (0, learning_stats_1.calculateLearningStats)(records);
        const contentTypes = new Set(records.map((record) => record.contentType));
        const listenedSongIds = new Set(records
            .filter((record) => record.contentType === content_type_enum_1.ContentType.SONG && record.actionType === 'play')
            .map((record) => record.contentId));
        const eligibleCodes = [
            records.some((record) => record.contentType === content_type_enum_1.ContentType.DICTIONARY) && 'first-word',
            stats.streakDays >= 7 && 'streak-7',
            stats.streakDays >= 30 && 'streak-30',
            Object.values(content_type_enum_1.ContentType).every((type) => contentTypes.has(type)) && 'explorer',
            favoriteCount >= 10 && 'collector',
            listenedSongIds.size >= 5 && 'singer',
        ].filter((code) => Boolean(code));
        const unlockedCodes = new Set(badges.map((badge) => badge.code));
        const missingCodes = eligibleCodes.filter((code) => !unlockedCodes.has(code));
        if (!missingCodes.length)
            return badges;
        const unlocked = await this.badgeRepository.save(missingCodes.map((code) => this.badgeRepository.create({ userId, code })));
        return [...unlocked, ...badges];
    }
    async unlock(userId, code) {
        const exists = await this.badgeRepository.findOne({ where: { userId, code } });
        if (exists)
            return exists;
        return this.badgeRepository.save(this.badgeRepository.create({ userId, code }));
    }
};
exports.MiniappBadgesService = MiniappBadgesService;
exports.MiniappBadgesService = MiniappBadgesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(badge_entity_1.Badge)),
    __param(1, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __param(2, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], MiniappBadgesService);


/***/ },

/***/ "./src/modules/miniapp-dictionary/miniapp-dictionary.controller.ts"
/*!*************************************************************************!*\
  !*** ./src/modules/miniapp-dictionary/miniapp-dictionary.controller.ts ***!
  \*************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappDictionaryController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
const miniapp_favorites_service_1 = __webpack_require__(/*! ../miniapp-favorites/miniapp-favorites.service */ "./src/modules/miniapp-favorites/miniapp-favorites.service.ts");
let MiniappDictionaryController = class MiniappDictionaryController {
    constructor(contentService, favoritesService) {
        this.contentService = contentService;
        this.favoritesService = favoritesService;
    }
    async list(query) {
        const result = await this.contentService.listPublished(content_type_enum_1.ContentType.DICTIONARY, query);
        return {
            ...result,
            items: await Promise.all(result.items.map((item) => this.contentService.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.DICTIONARY))),
        };
    }
    async listMine(user, query) {
        const result = await this.contentService.listPublished(content_type_enum_1.ContentType.DICTIONARY, query);
        return {
            ...result,
            items: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.DICTIONARY, result.items.map((item) => this.contentService.serialize(item, content_type_enum_1.ContentType.DICTIONARY))),
        };
    }
    async detail(id) {
        const item = await this.contentService.getPublishedDetail(content_type_enum_1.ContentType.DICTIONARY, id);
        return this.contentService.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.DICTIONARY);
    }
};
exports.MiniappDictionaryController = MiniappDictionaryController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], MiniappDictionaryController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    (0, common_1.Get)('mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], MiniappDictionaryController.prototype, "listMine", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MiniappDictionaryController.prototype, "detail", null);
exports.MiniappDictionaryController = MiniappDictionaryController = __decorate([
    (0, common_1.Controller)('miniapp/dictionary'),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object, typeof (_b = typeof miniapp_favorites_service_1.MiniappFavoritesService !== "undefined" && miniapp_favorites_service_1.MiniappFavoritesService) === "function" ? _b : Object])
], MiniappDictionaryController);


/***/ },

/***/ "./src/modules/miniapp-dictionary/miniapp-dictionary.module.ts"
/*!*********************************************************************!*\
  !*** ./src/modules/miniapp-dictionary/miniapp-dictionary.module.ts ***!
  \*********************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappDictionaryModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const miniapp_favorites_module_1 = __webpack_require__(/*! ../miniapp-favorites/miniapp-favorites.module */ "./src/modules/miniapp-favorites/miniapp-favorites.module.ts");
const miniapp_dictionary_controller_1 = __webpack_require__(/*! ./miniapp-dictionary.controller */ "./src/modules/miniapp-dictionary/miniapp-dictionary.controller.ts");
let MiniappDictionaryModule = class MiniappDictionaryModule {
};
exports.MiniappDictionaryModule = MiniappDictionaryModule;
exports.MiniappDictionaryModule = MiniappDictionaryModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule, miniapp_favorites_module_1.MiniappFavoritesModule],
        controllers: [miniapp_dictionary_controller_1.MiniappDictionaryController],
    })
], MiniappDictionaryModule);


/***/ },

/***/ "./src/modules/miniapp-favorites/dto/toggle-favorite.dto.ts"
/*!******************************************************************!*\
  !*** ./src/modules/miniapp-favorites/dto/toggle-favorite.dto.ts ***!
  \******************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ToggleFavoriteDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const content_type_enum_1 = __webpack_require__(/*! ../../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
class ToggleFavoriteDto {
}
exports.ToggleFavoriteDto = ToggleFavoriteDto;
__decorate([
    (0, class_validator_1.IsEnum)(content_type_enum_1.ContentType),
    __metadata("design:type", typeof (_a = typeof content_type_enum_1.ContentType !== "undefined" && content_type_enum_1.ContentType) === "function" ? _a : Object)
], ToggleFavoriteDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ToggleFavoriteDto.prototype, "contentId", void 0);


/***/ },

/***/ "./src/modules/miniapp-favorites/miniapp-favorites.controller.ts"
/*!***********************************************************************!*\
  !*** ./src/modules/miniapp-favorites/miniapp-favorites.controller.ts ***!
  \***********************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappFavoritesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const toggle_favorite_dto_1 = __webpack_require__(/*! ./dto/toggle-favorite.dto */ "./src/modules/miniapp-favorites/dto/toggle-favorite.dto.ts");
const miniapp_favorites_service_1 = __webpack_require__(/*! ./miniapp-favorites.service */ "./src/modules/miniapp-favorites/miniapp-favorites.service.ts");
let MiniappFavoritesController = class MiniappFavoritesController {
    constructor(favoritesService) {
        this.favoritesService = favoritesService;
    }
    list(user) {
        return this.favoritesService.list(user.sub);
    }
    toggle(user, payload) {
        return this.favoritesService.toggle(user.sub, payload.contentType, payload.contentId);
    }
    clear(user) {
        return this.favoritesService.clear(user.sub);
    }
};
exports.MiniappFavoritesController = MiniappFavoritesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MiniappFavoritesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('toggle'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof toggle_favorite_dto_1.ToggleFavoriteDto !== "undefined" && toggle_favorite_dto_1.ToggleFavoriteDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], MiniappFavoritesController.prototype, "toggle", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MiniappFavoritesController.prototype, "clear", null);
exports.MiniappFavoritesController = MiniappFavoritesController = __decorate([
    (0, common_1.Controller)('miniapp/favorites'),
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof miniapp_favorites_service_1.MiniappFavoritesService !== "undefined" && miniapp_favorites_service_1.MiniappFavoritesService) === "function" ? _a : Object])
], MiniappFavoritesController);


/***/ },

/***/ "./src/modules/miniapp-favorites/miniapp-favorites.module.ts"
/*!*******************************************************************!*\
  !*** ./src/modules/miniapp-favorites/miniapp-favorites.module.ts ***!
  \*******************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappFavoritesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const favorite_entity_1 = __webpack_require__(/*! ../../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const miniapp_favorites_controller_1 = __webpack_require__(/*! ./miniapp-favorites.controller */ "./src/modules/miniapp-favorites/miniapp-favorites.controller.ts");
const miniapp_favorites_service_1 = __webpack_require__(/*! ./miniapp-favorites.service */ "./src/modules/miniapp-favorites/miniapp-favorites.service.ts");
let MiniappFavoritesModule = class MiniappFavoritesModule {
};
exports.MiniappFavoritesModule = MiniappFavoritesModule;
exports.MiniappFavoritesModule = MiniappFavoritesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([favorite_entity_1.Favorite]), content_module_1.ContentModule],
        controllers: [miniapp_favorites_controller_1.MiniappFavoritesController],
        providers: [miniapp_favorites_service_1.MiniappFavoritesService],
        exports: [miniapp_favorites_service_1.MiniappFavoritesService],
    })
], MiniappFavoritesModule);


/***/ },

/***/ "./src/modules/miniapp-favorites/miniapp-favorites.service.ts"
/*!********************************************************************!*\
  !*** ./src/modules/miniapp-favorites/miniapp-favorites.service.ts ***!
  \********************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappFavoritesService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const favorite_entity_1 = __webpack_require__(/*! ../../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
let MiniappFavoritesService = class MiniappFavoritesService {
    constructor(favoriteRepository, contentService) {
        this.favoriteRepository = favoriteRepository;
        this.contentService = contentService;
    }
    async getFavoriteMap(userId) {
        const favorites = await this.favoriteRepository.find({ where: { userId } });
        return new Set(favorites.map((item) => `${item.contentType}:${item.contentId}`));
    }
    async list(userId) {
        const favorites = await this.favoriteRepository.find({
            where: { userId },
            order: { id: 'DESC' },
        });
        const grouped = favorites.reduce((acc, current) => {
            acc[current.contentType] = acc[current.contentType] || [];
            acc[current.contentType].push(current.contentId);
            return acc;
        }, {});
        const [dictionary, phrases, proverbs, songs] = await Promise.all([
            this.contentService.getByIds(content_type_enum_1.ContentType.DICTIONARY, grouped[content_type_enum_1.ContentType.DICTIONARY] ?? []),
            this.contentService.getByIds(content_type_enum_1.ContentType.PHRASE, grouped[content_type_enum_1.ContentType.PHRASE] ?? []),
            this.contentService.getByIds(content_type_enum_1.ContentType.PROVERB, grouped[content_type_enum_1.ContentType.PROVERB] ?? []),
            this.contentService.getByIds(content_type_enum_1.ContentType.SONG, grouped[content_type_enum_1.ContentType.SONG] ?? []),
        ]);
        return {
            dictionary: dictionary.map((item) => ({ ...this.contentService.serialize(item, content_type_enum_1.ContentType.DICTIONARY), isFavorited: true })),
            phrases: phrases.map((item) => ({ ...this.contentService.serialize(item, content_type_enum_1.ContentType.PHRASE), isFavorited: true })),
            proverbs: proverbs.map((item) => ({ ...this.contentService.serialize(item, content_type_enum_1.ContentType.PROVERB), isFavorited: true })),
            songs: songs.map((item) => ({ ...this.contentService.serialize(item, content_type_enum_1.ContentType.SONG), isFavorited: true })),
        };
    }
    async toggle(userId, contentType, contentId) {
        const existing = await this.favoriteRepository.findOne({
            where: { userId, contentType, contentId },
        });
        if (existing) {
            await this.favoriteRepository.remove(existing);
            return { isFavorited: false };
        }
        await this.favoriteRepository.save(this.favoriteRepository.create({
            userId,
            contentType,
            contentId,
        }));
        return { isFavorited: true };
    }
    async clear(userId) {
        const result = await this.favoriteRepository.delete({ userId });
        return {
            success: true,
            deletedCount: result.affected ?? 0,
            message: '\u5df2\u6e05\u7a7a\u6536\u85cf',
        };
    }
    async annotate(userId, contentType, items) {
        if (!items.length) {
            return [];
        }
        const favorites = await this.favoriteRepository.find({
            where: {
                userId,
                contentType,
                contentId: (0, typeorm_2.In)(items.map((item) => item.id)),
            },
        });
        const favoriteIds = new Set(favorites.map((item) => item.contentId));
        return items.map((item) => ({ ...item, isFavorited: favoriteIds.has(item.id) }));
    }
};
exports.MiniappFavoritesService = MiniappFavoritesService;
exports.MiniappFavoritesService = MiniappFavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _b : Object])
], MiniappFavoritesService);


/***/ },

/***/ "./src/modules/miniapp-home/miniapp-home.controller.ts"
/*!*************************************************************!*\
  !*** ./src/modules/miniapp-home/miniapp-home.controller.ts ***!
  \*************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappHomeController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
let MiniappHomeController = class MiniappHomeController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    getHomeData() {
        return this.contentService.getMiniappHomeData();
    }
};
exports.MiniappHomeController = MiniappHomeController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MiniappHomeController.prototype, "getHomeData", null);
exports.MiniappHomeController = MiniappHomeController = __decorate([
    (0, common_1.Controller)('miniapp/home'),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object])
], MiniappHomeController);


/***/ },

/***/ "./src/modules/miniapp-home/miniapp-home.module.ts"
/*!*********************************************************!*\
  !*** ./src/modules/miniapp-home/miniapp-home.module.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappHomeModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const miniapp_home_controller_1 = __webpack_require__(/*! ./miniapp-home.controller */ "./src/modules/miniapp-home/miniapp-home.controller.ts");
let MiniappHomeModule = class MiniappHomeModule {
};
exports.MiniappHomeModule = MiniappHomeModule;
exports.MiniappHomeModule = MiniappHomeModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule],
        controllers: [miniapp_home_controller_1.MiniappHomeController],
    })
], MiniappHomeModule);


/***/ },

/***/ "./src/modules/miniapp-learning-records/dto/create-learning-record.dto.ts"
/*!********************************************************************************!*\
  !*** ./src/modules/miniapp-learning-records/dto/create-learning-record.dto.ts ***!
  \********************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateLearningRecordDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const content_type_enum_1 = __webpack_require__(/*! ../../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
class CreateLearningRecordDto {
}
exports.CreateLearningRecordDto = CreateLearningRecordDto;
__decorate([
    (0, class_validator_1.IsEnum)(content_type_enum_1.ContentType),
    __metadata("design:type", typeof (_a = typeof content_type_enum_1.ContentType !== "undefined" && content_type_enum_1.ContentType) === "function" ? _a : Object)
], CreateLearningRecordDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateLearningRecordDto.prototype, "contentId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['view', 'play']),
    __metadata("design:type", String)
], CreateLearningRecordDto.prototype, "actionType", void 0);


/***/ },

/***/ "./src/modules/miniapp-learning-records/learning-stats.ts"
/*!****************************************************************!*\
  !*** ./src/modules/miniapp-learning-records/learning-stats.ts ***!
  \****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calculateLearningStats = calculateLearningStats;
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const DAY_MS = 24 * 60 * 60 * 1000;
const SHANGHAI_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
function shanghaiDayOrdinal(value) {
    const parts = SHANGHAI_DATE_FORMATTER.formatToParts(new Date(value));
    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    const day = Number(parts.find((part) => part.type === 'day')?.value);
    return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}
function calculateLearningStats(records, now = new Date()) {
    const typeCounts = {
        [content_type_enum_1.ContentType.DICTIONARY]: 0,
        [content_type_enum_1.ContentType.PHRASE]: 0,
        [content_type_enum_1.ContentType.PROVERB]: 0,
        [content_type_enum_1.ContentType.SONG]: 0,
    };
    const todayOrdinal = shanghaiDayOrdinal(now);
    const learnedDays = new Set();
    let todayCount = 0;
    for (const record of records) {
        if (record.contentType in typeCounts)
            typeCounts[record.contentType] += 1;
        const dayOrdinal = shanghaiDayOrdinal(record.createdAt);
        learnedDays.add(dayOrdinal);
        if (dayOrdinal === todayOrdinal)
            todayCount += 1;
    }
    let cursor = learnedDays.has(todayOrdinal) ? todayOrdinal : todayOrdinal - 1;
    let streakDays = 0;
    while (learnedDays.has(cursor)) {
        streakDays += 1;
        cursor -= 1;
    }
    const totalCount = records.length;
    return {
        todayCount,
        totalCount,
        streakDays,
        typeCounts,
        today: todayCount,
        total: totalCount,
        streak: streakDays,
    };
}


/***/ },

/***/ "./src/modules/miniapp-learning-records/miniapp-learning-records.controller.ts"
/*!*************************************************************************************!*\
  !*** ./src/modules/miniapp-learning-records/miniapp-learning-records.controller.ts ***!
  \*************************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappLearningRecordsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const pagination_query_dto_1 = __webpack_require__(/*! ../../common/dto/pagination-query.dto */ "./src/common/dto/pagination-query.dto.ts");
const create_learning_record_dto_1 = __webpack_require__(/*! ./dto/create-learning-record.dto */ "./src/modules/miniapp-learning-records/dto/create-learning-record.dto.ts");
const miniapp_learning_records_service_1 = __webpack_require__(/*! ./miniapp-learning-records.service */ "./src/modules/miniapp-learning-records/miniapp-learning-records.service.ts");
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
    __metadata("design:paramtypes", [Object, typeof (_b = typeof pagination_query_dto_1.PaginationQueryDto !== "undefined" && pagination_query_dto_1.PaginationQueryDto) === "function" ? _b : Object]),
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
    __metadata("design:paramtypes", [Object, typeof (_c = typeof create_learning_record_dto_1.CreateLearningRecordDto !== "undefined" && create_learning_record_dto_1.CreateLearningRecordDto) === "function" ? _c : Object]),
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
    __metadata("design:paramtypes", [typeof (_a = typeof miniapp_learning_records_service_1.MiniappLearningRecordsService !== "undefined" && miniapp_learning_records_service_1.MiniappLearningRecordsService) === "function" ? _a : Object])
], MiniappLearningRecordsController);


/***/ },

/***/ "./src/modules/miniapp-learning-records/miniapp-learning-records.module.ts"
/*!*********************************************************************************!*\
  !*** ./src/modules/miniapp-learning-records/miniapp-learning-records.module.ts ***!
  \*********************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappLearningRecordsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const miniapp_learning_records_controller_1 = __webpack_require__(/*! ./miniapp-learning-records.controller */ "./src/modules/miniapp-learning-records/miniapp-learning-records.controller.ts");
const miniapp_learning_records_service_1 = __webpack_require__(/*! ./miniapp-learning-records.service */ "./src/modules/miniapp-learning-records/miniapp-learning-records.service.ts");
let MiniappLearningRecordsModule = class MiniappLearningRecordsModule {
};
exports.MiniappLearningRecordsModule = MiniappLearningRecordsModule;
exports.MiniappLearningRecordsModule = MiniappLearningRecordsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([learning_record_entity_1.LearningRecord]), content_module_1.ContentModule],
        controllers: [miniapp_learning_records_controller_1.MiniappLearningRecordsController],
        providers: [miniapp_learning_records_service_1.MiniappLearningRecordsService],
    })
], MiniappLearningRecordsModule);


/***/ },

/***/ "./src/modules/miniapp-learning-records/miniapp-learning-records.service.ts"
/*!**********************************************************************************!*\
  !*** ./src/modules/miniapp-learning-records/miniapp-learning-records.service.ts ***!
  \**********************************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappLearningRecordsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const learning_stats_1 = __webpack_require__(/*! ./learning-stats */ "./src/modules/miniapp-learning-records/learning-stats.ts");
let MiniappLearningRecordsService = class MiniappLearningRecordsService {
    constructor(learningRecordRepository, contentService) {
        this.learningRecordRepository = learningRecordRepository;
        this.contentService = contentService;
    }
    async create(userId, payload) {
        return this.learningRecordRepository.save(this.learningRecordRepository.create({
            userId,
            contentType: payload.contentType,
            contentId: payload.contentId,
            actionType: payload.actionType,
        }));
    }
    async list(userId, page, pageSize) {
        const [items, total] = await this.learningRecordRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        const records = await Promise.all(items.map(async (item) => {
            try {
                const content = await this.contentService.getPublishedDetail(item.contentType, item.contentId);
                return {
                    id: item.id,
                    actionType: item.actionType,
                    createdAt: item.createdAt,
                    content: this.contentService.serialize(content, item.contentType),
                };
            }
            catch {
                return {
                    id: item.id,
                    actionType: item.actionType,
                    createdAt: item.createdAt,
                    content: null,
                };
            }
        }));
        return {
            items: records,
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
            stats: await this.getStats(userId),
        };
    }
    async clear(userId) {
        const result = await this.learningRecordRepository.delete({ userId });
        return {
            success: true,
            deletedCount: result.affected ?? 0,
            message: '\u5df2\u6e05\u7a7a\u5b66\u4e60\u8bb0\u5f55',
        };
    }
    async getStats(userId) {
        const records = await this.learningRecordRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return (0, learning_stats_1.calculateLearningStats)(records);
    }
};
exports.MiniappLearningRecordsService = MiniappLearningRecordsService;
exports.MiniappLearningRecordsService = MiniappLearningRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _b : Object])
], MiniappLearningRecordsService);


/***/ },

/***/ "./src/modules/miniapp-me/miniapp-me.controller.ts"
/*!*********************************************************!*\
  !*** ./src/modules/miniapp-me/miniapp-me.controller.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappMeController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/modules/users/users.service.ts");
let MiniappMeController = class MiniappMeController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async me(user) {
        const currentUser = await this.usersService.findById(user.sub);
        const [settings, stats] = await Promise.all([
            this.usersService.getSettings(user.sub),
            this.usersService.getProfileStats(user.sub),
        ]);
        return {
            user: {
                id: currentUser.id,
                nickname: currentUser.nickname,
                avatarUrl: currentUser.avatarUrl,
                phoneNumber: currentUser.phoneNumber,
            },
            settings,
            stats,
        };
    }
};
exports.MiniappMeController = MiniappMeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiniappMeController.prototype, "me", null);
exports.MiniappMeController = MiniappMeController = __decorate([
    (0, common_1.Controller)('miniapp/me'),
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], MiniappMeController);


/***/ },

/***/ "./src/modules/miniapp-me/miniapp-me.module.ts"
/*!*****************************************************!*\
  !*** ./src/modules/miniapp-me/miniapp-me.module.ts ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappMeModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./src/modules/users/users.module.ts");
const miniapp_me_controller_1 = __webpack_require__(/*! ./miniapp-me.controller */ "./src/modules/miniapp-me/miniapp-me.controller.ts");
let MiniappMeModule = class MiniappMeModule {
};
exports.MiniappMeModule = MiniappMeModule;
exports.MiniappMeModule = MiniappMeModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [miniapp_me_controller_1.MiniappMeController],
    })
], MiniappMeModule);


/***/ },

/***/ "./src/modules/miniapp-phrases/miniapp-phrases.controller.ts"
/*!*******************************************************************!*\
  !*** ./src/modules/miniapp-phrases/miniapp-phrases.controller.ts ***!
  \*******************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappPhrasesController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
let MiniappPhrasesController = class MiniappPhrasesController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.listPublished(content_type_enum_1.ContentType.PHRASE, query);
    }
    async detail(id) {
        const item = await this.contentService.getPublishedDetail(content_type_enum_1.ContentType.PHRASE, id);
        return this.contentService.serialize(item, content_type_enum_1.ContentType.PHRASE);
    }
};
exports.MiniappPhrasesController = MiniappPhrasesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], MiniappPhrasesController.prototype, "list", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MiniappPhrasesController.prototype, "detail", null);
exports.MiniappPhrasesController = MiniappPhrasesController = __decorate([
    (0, common_1.Controller)('miniapp/phrases'),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object])
], MiniappPhrasesController);


/***/ },

/***/ "./src/modules/miniapp-phrases/miniapp-phrases.module.ts"
/*!***************************************************************!*\
  !*** ./src/modules/miniapp-phrases/miniapp-phrases.module.ts ***!
  \***************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappPhrasesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const miniapp_phrases_controller_1 = __webpack_require__(/*! ./miniapp-phrases.controller */ "./src/modules/miniapp-phrases/miniapp-phrases.controller.ts");
let MiniappPhrasesModule = class MiniappPhrasesModule {
};
exports.MiniappPhrasesModule = MiniappPhrasesModule;
exports.MiniappPhrasesModule = MiniappPhrasesModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule],
        controllers: [miniapp_phrases_controller_1.MiniappPhrasesController],
    })
], MiniappPhrasesModule);


/***/ },

/***/ "./src/modules/miniapp-proverbs/miniapp-proverbs.controller.ts"
/*!*********************************************************************!*\
  !*** ./src/modules/miniapp-proverbs/miniapp-proverbs.controller.ts ***!
  \*********************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappProverbsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
let MiniappProverbsController = class MiniappProverbsController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.listPublished(content_type_enum_1.ContentType.PROVERB, query);
    }
    async detail(id) {
        const item = await this.contentService.getPublishedDetail(content_type_enum_1.ContentType.PROVERB, id);
        return this.contentService.serialize(item, content_type_enum_1.ContentType.PROVERB);
    }
};
exports.MiniappProverbsController = MiniappProverbsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], MiniappProverbsController.prototype, "list", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MiniappProverbsController.prototype, "detail", null);
exports.MiniappProverbsController = MiniappProverbsController = __decorate([
    (0, common_1.Controller)('miniapp/proverbs'),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object])
], MiniappProverbsController);


/***/ },

/***/ "./src/modules/miniapp-proverbs/miniapp-proverbs.module.ts"
/*!*****************************************************************!*\
  !*** ./src/modules/miniapp-proverbs/miniapp-proverbs.module.ts ***!
  \*****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappProverbsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const miniapp_proverbs_controller_1 = __webpack_require__(/*! ./miniapp-proverbs.controller */ "./src/modules/miniapp-proverbs/miniapp-proverbs.controller.ts");
let MiniappProverbsModule = class MiniappProverbsModule {
};
exports.MiniappProverbsModule = MiniappProverbsModule;
exports.MiniappProverbsModule = MiniappProverbsModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule],
        controllers: [miniapp_proverbs_controller_1.MiniappProverbsController],
    })
], MiniappProverbsModule);


/***/ },

/***/ "./src/modules/miniapp-quiz/dto/create-quiz-attempt.dto.ts"
/*!*****************************************************************!*\
  !*** ./src/modules/miniapp-quiz/dto/create-quiz-attempt.dto.ts ***!
  \*****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateQuizAttemptDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class CreateQuizAttemptDto {
}
exports.CreateQuizAttemptDto = CreateQuizAttemptDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], CreateQuizAttemptDto.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], CreateQuizAttemptDto.prototype, "correctCount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], CreateQuizAttemptDto.prototype, "totalQuestions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(1000),
    (0, class_validator_1.IsObject)({ each: true }),
    __metadata("design:type", typeof (_a = typeof Array !== "undefined" && Array) === "function" ? _a : Object)
], CreateQuizAttemptDto.prototype, "answers", void 0);


/***/ },

/***/ "./src/modules/miniapp-quiz/miniapp-quiz.controller.ts"
/*!*************************************************************!*\
  !*** ./src/modules/miniapp-quiz/miniapp-quiz.controller.ts ***!
  \*************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappQuizController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const pagination_query_dto_1 = __webpack_require__(/*! ../../common/dto/pagination-query.dto */ "./src/common/dto/pagination-query.dto.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const create_quiz_attempt_dto_1 = __webpack_require__(/*! ./dto/create-quiz-attempt.dto */ "./src/modules/miniapp-quiz/dto/create-quiz-attempt.dto.ts");
const miniapp_quiz_service_1 = __webpack_require__(/*! ./miniapp-quiz.service */ "./src/modules/miniapp-quiz/miniapp-quiz.service.ts");
let MiniappQuizController = class MiniappQuizController {
    constructor(quizService) {
        this.quizService = quizService;
    }
    create(user, payload) {
        return this.quizService.create(user.sub, payload);
    }
    list(user, query) {
        return this.quizService.list(user.sub, Number(query.page ?? 1), Number(query.pageSize ?? 10));
    }
};
exports.MiniappQuizController = MiniappQuizController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof create_quiz_attempt_dto_1.CreateQuizAttemptDto !== "undefined" && create_quiz_attempt_dto_1.CreateQuizAttemptDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], MiniappQuizController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof pagination_query_dto_1.PaginationQueryDto !== "undefined" && pagination_query_dto_1.PaginationQueryDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], MiniappQuizController.prototype, "list", null);
exports.MiniappQuizController = MiniappQuizController = __decorate([
    (0, common_1.Controller)('miniapp/quiz-attempts'),
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof miniapp_quiz_service_1.MiniappQuizService !== "undefined" && miniapp_quiz_service_1.MiniappQuizService) === "function" ? _a : Object])
], MiniappQuizController);


/***/ },

/***/ "./src/modules/miniapp-quiz/miniapp-quiz.module.ts"
/*!*********************************************************!*\
  !*** ./src/modules/miniapp-quiz/miniapp-quiz.module.ts ***!
  \*********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappQuizModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const quiz_attempt_entity_1 = __webpack_require__(/*! ../../entities/quiz-attempt.entity */ "./src/entities/quiz-attempt.entity.ts");
const miniapp_quiz_controller_1 = __webpack_require__(/*! ./miniapp-quiz.controller */ "./src/modules/miniapp-quiz/miniapp-quiz.controller.ts");
const miniapp_quiz_service_1 = __webpack_require__(/*! ./miniapp-quiz.service */ "./src/modules/miniapp-quiz/miniapp-quiz.service.ts");
let MiniappQuizModule = class MiniappQuizModule {
};
exports.MiniappQuizModule = MiniappQuizModule;
exports.MiniappQuizModule = MiniappQuizModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([quiz_attempt_entity_1.QuizAttempt])],
        controllers: [miniapp_quiz_controller_1.MiniappQuizController],
        providers: [miniapp_quiz_service_1.MiniappQuizService],
    })
], MiniappQuizModule);


/***/ },

/***/ "./src/modules/miniapp-quiz/miniapp-quiz.service.ts"
/*!**********************************************************!*\
  !*** ./src/modules/miniapp-quiz/miniapp-quiz.service.ts ***!
  \**********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappQuizService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const quiz_attempt_entity_1 = __webpack_require__(/*! ../../entities/quiz-attempt.entity */ "./src/entities/quiz-attempt.entity.ts");
let MiniappQuizService = class MiniappQuizService {
    constructor(quizAttemptsRepository) {
        this.quizAttemptsRepository = quizAttemptsRepository;
    }
    async create(userId, payload) {
        const computedCorrectCount = payload.answers.filter((answer) => answer.correct === true).length;
        if (payload.answers.length !== payload.totalQuestions
            || payload.correctCount !== computedCorrectCount
            || payload.score !== computedCorrectCount * 10) {
            throw new common_1.BadRequestException('答题成绩与答案明细不一致');
        }
        const sanitizedAnswers = payload.answers.map((answer) => ({
            id: String(answer.id || '').slice(0, 96),
            selected: String(answer.selected || '').slice(0, 255),
            answer: String(answer.answer || '').slice(0, 255),
            correct: answer.correct === true,
        }));
        const saved = await this.quizAttemptsRepository.save(this.quizAttemptsRepository.create({
            userId,
            score: payload.score,
            correctCount: payload.correctCount,
            totalQuestions: payload.totalQuestions,
            answersJson: JSON.stringify(sanitizedAnswers),
        }));
        return this.serialize(saved);
    }
    async list(userId, page, pageSize) {
        const [items, total] = await this.quizAttemptsRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return {
            items: items.map((item) => this.serialize(item)),
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
    }
    serialize(attempt) {
        let answers = [];
        try {
            answers = JSON.parse(attempt.answersJson || '[]');
        }
        catch { }
        return {
            id: attempt.id,
            score: attempt.score,
            correctCount: attempt.correctCount,
            totalQuestions: attempt.totalQuestions,
            answers,
            createdAt: attempt.createdAt,
        };
    }
};
exports.MiniappQuizService = MiniappQuizService;
exports.MiniappQuizService = MiniappQuizService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quiz_attempt_entity_1.QuizAttempt)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], MiniappQuizService);


/***/ },

/***/ "./src/modules/miniapp-search/miniapp-search.controller.ts"
/*!*****************************************************************!*\
  !*** ./src/modules/miniapp-search/miniapp-search.controller.ts ***!
  \*****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappSearchController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
const miniapp_favorites_service_1 = __webpack_require__(/*! ../miniapp-favorites/miniapp-favorites.service */ "./src/modules/miniapp-favorites/miniapp-favorites.service.ts");
let MiniappSearchController = class MiniappSearchController {
    constructor(contentService, favoritesService, learningRecordRepository) {
        this.contentService = contentService;
        this.favoritesService = favoritesService;
        this.learningRecordRepository = learningRecordRepository;
    }
    searchPublic(query) {
        return this.contentService.searchAll(query);
    }
    suggestPublic(keyword) {
        return this.contentService.suggestAll(keyword);
    }
    async hot() {
        const rows = await this.learningRecordRepository
            .createQueryBuilder('r')
            .select(['r.contentId AS contentId', 'r.contentType AS contentType', 'COUNT(*) AS cnt'])
            .where('r.actionType = :action', { action: 'view' })
            .groupBy('r.contentId, r.contentType')
            .orderBy('cnt', 'DESC')
            .limit(8)
            .getRawMany();
        const items = await Promise.all(rows.map(async (row) => {
            try {
                const content = await this.contentService.getPublishedDetail(row.contentType, row.contentId);
                const serialized = this.contentService.serialize(content, row.contentType);
                return {
                    keyword: serialized.zhText || serialized.buyiText || '',
                    contentType: row.contentType,
                    contentId: row.contentId,
                    count: Number(row.cnt),
                };
            }
            catch {
                return null;
            }
        }));
        return { items: items.filter((item) => item && item.keyword) };
    }
    async searchMine(user, query) {
        const result = await this.contentService.searchAll(query);
        return {
            dictionary: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.DICTIONARY, result.dictionary),
            phrases: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.PHRASE, result.phrases),
            proverbs: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.PROVERB, result.proverbs),
            songs: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.SONG, result.songs),
            pagination: result.pagination,
        };
    }
};
exports.MiniappSearchController = MiniappSearchController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], MiniappSearchController.prototype, "searchPublic", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('suggest'),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MiniappSearchController.prototype, "suggestPublic", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('hot'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MiniappSearchController.prototype, "hot", null);
__decorate([
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    (0, common_1.Get)('mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], MiniappSearchController.prototype, "searchMine", null);
exports.MiniappSearchController = MiniappSearchController = __decorate([
    (0, common_1.Controller)('miniapp/search'),
    __param(2, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object, typeof (_b = typeof miniapp_favorites_service_1.MiniappFavoritesService !== "undefined" && miniapp_favorites_service_1.MiniappFavoritesService) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], MiniappSearchController);


/***/ },

/***/ "./src/modules/miniapp-search/miniapp-search.module.ts"
/*!*************************************************************!*\
  !*** ./src/modules/miniapp-search/miniapp-search.module.ts ***!
  \*************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappSearchModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const miniapp_favorites_module_1 = __webpack_require__(/*! ../miniapp-favorites/miniapp-favorites.module */ "./src/modules/miniapp-favorites/miniapp-favorites.module.ts");
const miniapp_search_controller_1 = __webpack_require__(/*! ./miniapp-search.controller */ "./src/modules/miniapp-search/miniapp-search.controller.ts");
let MiniappSearchModule = class MiniappSearchModule {
};
exports.MiniappSearchModule = MiniappSearchModule;
exports.MiniappSearchModule = MiniappSearchModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([learning_record_entity_1.LearningRecord]), content_module_1.ContentModule, miniapp_favorites_module_1.MiniappFavoritesModule],
        controllers: [miniapp_search_controller_1.MiniappSearchController],
    })
], MiniappSearchModule);


/***/ },

/***/ "./src/modules/miniapp-settings/dto/update-settings.dto.ts"
/*!*****************************************************************!*\
  !*** ./src/modules/miniapp-settings/dto/update-settings.dto.ts ***!
  \*****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateSettingsDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class UpdateSettingsDto {
}
exports.UpdateSettingsDto = UpdateSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['light', 'dark', 'auto']),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['small', 'medium', 'large', '小', '中', '大']),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "fontSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "notifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "autoplay", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['zh-CN', 'en-US']),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "language", void 0);


/***/ },

/***/ "./src/modules/miniapp-settings/learning-reminder.service.ts"
/*!*******************************************************************!*\
  !*** ./src/modules/miniapp-settings/learning-reminder.service.ts ***!
  \*******************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var LearningReminderService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LearningReminderService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const axios_1 = __webpack_require__(/*! axios */ "axios");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const user_setting_entity_1 = __webpack_require__(/*! ../../entities/user-setting.entity */ "./src/entities/user-setting.entity.ts");
const wechat_account_entity_1 = __webpack_require__(/*! ../../entities/wechat-account.entity */ "./src/entities/wechat-account.entity.ts");
let LearningReminderService = LearningReminderService_1 = class LearningReminderService {
    constructor(configService, settingsRepository, wechatAccountsRepository) {
        this.configService = configService;
        this.settingsRepository = settingsRepository;
        this.wechatAccountsRepository = wechatAccountsRepository;
        this.logger = new common_1.Logger(LearningReminderService_1.name);
        this.sending = false;
        this.accessToken = '';
        this.accessTokenExpiresAt = 0;
    }
    onModuleInit() {
        if (!this.isConfigured())
            return;
        this.timer = setInterval(() => this.deliverDueReminders().catch((error) => {
            this.logger.error(`学习提醒投递失败: ${error instanceof Error ? error.message : String(error)}`);
        }), 60_000);
        this.timer.unref?.();
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
    getClientConfig() {
        const templateId = this.configService.get('wechat.reminderTemplateId', { infer: true });
        return { enabled: Boolean(templateId), templateId };
    }
    isConfigured() {
        return Boolean(!this.configService.get('wechat.mockMode', { infer: true })
            && this.configService.get('wechat.appId', { infer: true })
            && this.configService.get('wechat.appSecret', { infer: true })
            && this.configService.get('wechat.reminderTemplateId', { infer: true })
            && this.configService.get('wechat.reminderTemplateDataJson', { infer: true }));
    }
    beijingNow() {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(new Date());
        const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        return {
            date: `${values.year}-${values.month}-${values.day}`,
            hour: Number(values.hour),
            minute: Number(values.minute),
        };
    }
    parseTemplateData(date) {
        const source = this.configService.get('wechat.reminderTemplateDataJson', { infer: true });
        const parsed = JSON.parse(source || '{}');
        return Object.fromEntries(Object.entries(parsed).map(([key, entry]) => [
            key,
            { value: String(entry?.value || '').replaceAll('{{date}}', date).slice(0, 200) },
        ]));
    }
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.accessTokenExpiresAt)
            return this.accessToken;
        const appId = this.configService.get('wechat.appId', { infer: true });
        const appSecret = this.configService.get('wechat.appSecret', { infer: true });
        const response = await axios_1.default.get('https://api.weixin.qq.com/cgi-bin/token', {
            params: { grant_type: 'client_credential', appid: appId, secret: appSecret },
            timeout: 10_000,
        });
        if (!response.data?.access_token)
            throw new Error(response.data?.errmsg || '无法获取微信 access_token');
        this.accessToken = response.data.access_token;
        this.accessTokenExpiresAt = Date.now() + Math.max(60, Number(response.data.expires_in || 7200) - 300) * 1000;
        return this.accessToken;
    }
    async deliverDueReminders() {
        if (this.sending || !this.isConfigured())
            return;
        const now = this.beijingNow();
        const reminderHour = this.configService.get('wechat.reminderHour', { infer: true });
        if (now.hour !== reminderHour || now.minute > 4)
            return;
        this.sending = true;
        try {
            const enabledSettings = await this.settingsRepository.find({ where: { key: 'notifications', value: 'true' } });
            if (!enabledSettings.length)
                return;
            const userIds = enabledSettings.map((setting) => setting.userId);
            const [accounts, lastSent] = await Promise.all([
                this.wechatAccountsRepository.find({ where: { userId: (0, typeorm_2.In)(userIds) } }),
                this.settingsRepository.find({ where: { userId: (0, typeorm_2.In)(userIds), key: 'lastLearningReminderDate' } }),
            ]);
            const lastSentMap = new Map(lastSent.map((setting) => [setting.userId, setting]));
            const enabledMap = new Map(enabledSettings.map((setting) => [setting.userId, setting]));
            const token = await this.getAccessToken();
            const templateId = this.configService.get('wechat.reminderTemplateId', { infer: true });
            const data = this.parseTemplateData(now.date);
            for (const account of accounts) {
                if (lastSentMap.get(account.userId)?.value === now.date)
                    continue;
                try {
                    const response = await axios_1.default.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${encodeURIComponent(token)}`, { touser: account.openid, template_id: templateId, page: 'pages/app/index', data }, { timeout: 10_000 });
                    if (response.data?.errcode) {
                        if (Number(response.data.errcode) === 43101) {
                            const notificationSetting = enabledMap.get(account.userId);
                            if (notificationSetting) {
                                notificationSetting.value = 'false';
                                await this.settingsRepository.save(notificationSetting);
                            }
                        }
                        throw new Error(response.data.errmsg || `微信错误 ${response.data.errcode}`);
                    }
                    const existing = lastSentMap.get(account.userId);
                    const setting = existing || this.settingsRepository.create({ userId: account.userId, key: 'lastLearningReminderDate', value: now.date });
                    setting.value = now.date;
                    await this.settingsRepository.save(setting);
                    lastSentMap.set(account.userId, setting);
                }
                catch (error) {
                    this.logger.warn(`用户 ${account.userId} 的学习提醒未送达: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }
        finally {
            this.sending = false;
        }
    }
};
exports.LearningReminderService = LearningReminderService;
exports.LearningReminderService = LearningReminderService = LearningReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_setting_entity_1.UserSetting)),
    __param(2, (0, typeorm_1.InjectRepository)(wechat_account_entity_1.WechatAccount)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], LearningReminderService);


/***/ },

/***/ "./src/modules/miniapp-settings/miniapp-settings.controller.ts"
/*!*********************************************************************!*\
  !*** ./src/modules/miniapp-settings/miniapp-settings.controller.ts ***!
  \*********************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappSettingsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const current_user_decorator_1 = __webpack_require__(/*! ../../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const miniapp_jwt_guard_1 = __webpack_require__(/*! ../../common/guards/miniapp-jwt.guard */ "./src/common/guards/miniapp-jwt.guard.ts");
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/modules/users/users.service.ts");
const update_settings_dto_1 = __webpack_require__(/*! ./dto/update-settings.dto */ "./src/modules/miniapp-settings/dto/update-settings.dto.ts");
const learning_reminder_service_1 = __webpack_require__(/*! ./learning-reminder.service */ "./src/modules/miniapp-settings/learning-reminder.service.ts");
let MiniappSettingsController = class MiniappSettingsController {
    constructor(usersService, learningReminderService) {
        this.usersService = usersService;
        this.learningReminderService = learningReminderService;
    }
    getReminderConfig() {
        return this.learningReminderService.getClientConfig();
    }
    normalize(settings) {
        return {
            theme: settings.theme || 'light',
            fontSize: settings.fontSize || '中',
            notifications: settings.notifications === 'true',
            autoplay: settings.autoplay === 'true',
            language: settings.language || 'zh-CN',
        };
    }
    async getSettings(user) {
        return this.normalize(await this.usersService.getSettings(user.sub));
    }
    async updateSettings(user, payload) {
        const updates = {};
        if (payload.theme) {
            updates.theme = payload.theme;
        }
        if (payload.fontSize) {
            updates.fontSize = payload.fontSize;
        }
        if (payload.notifications !== undefined) {
            updates.notifications = String(payload.notifications);
        }
        if (payload.autoplay !== undefined) {
            updates.autoplay = String(payload.autoplay);
        }
        if (payload.language) {
            updates.language = payload.language;
        }
        return this.normalize(await this.usersService.updateSettings(user.sub, updates));
    }
};
exports.MiniappSettingsController = MiniappSettingsController;
__decorate([
    (0, common_1.Get)('reminder-config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MiniappSettingsController.prototype, "getReminderConfig", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiniappSettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof update_settings_dto_1.UpdateSettingsDto !== "undefined" && update_settings_dto_1.UpdateSettingsDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], MiniappSettingsController.prototype, "updateSettings", null);
exports.MiniappSettingsController = MiniappSettingsController = __decorate([
    (0, common_1.Controller)('miniapp/settings'),
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof learning_reminder_service_1.LearningReminderService !== "undefined" && learning_reminder_service_1.LearningReminderService) === "function" ? _b : Object])
], MiniappSettingsController);


/***/ },

/***/ "./src/modules/miniapp-settings/miniapp-settings.module.ts"
/*!*****************************************************************!*\
  !*** ./src/modules/miniapp-settings/miniapp-settings.module.ts ***!
  \*****************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappSettingsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const user_setting_entity_1 = __webpack_require__(/*! ../../entities/user-setting.entity */ "./src/entities/user-setting.entity.ts");
const wechat_account_entity_1 = __webpack_require__(/*! ../../entities/wechat-account.entity */ "./src/entities/wechat-account.entity.ts");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./src/modules/users/users.module.ts");
const miniapp_settings_controller_1 = __webpack_require__(/*! ./miniapp-settings.controller */ "./src/modules/miniapp-settings/miniapp-settings.controller.ts");
const learning_reminder_service_1 = __webpack_require__(/*! ./learning-reminder.service */ "./src/modules/miniapp-settings/learning-reminder.service.ts");
let MiniappSettingsModule = class MiniappSettingsModule {
};
exports.MiniappSettingsModule = MiniappSettingsModule;
exports.MiniappSettingsModule = MiniappSettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, typeorm_1.TypeOrmModule.forFeature([user_setting_entity_1.UserSetting, wechat_account_entity_1.WechatAccount])],
        controllers: [miniapp_settings_controller_1.MiniappSettingsController],
        providers: [learning_reminder_service_1.LearningReminderService],
    })
], MiniappSettingsModule);


/***/ },

/***/ "./src/modules/miniapp-songs/miniapp-songs.controller.ts"
/*!***************************************************************!*\
  !*** ./src/modules/miniapp-songs/miniapp-songs.controller.ts ***!
  \***************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappSongsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const public_decorator_1 = __webpack_require__(/*! ../../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
const content_service_1 = __webpack_require__(/*! ../content/content.service */ "./src/modules/content/content.service.ts");
const search_query_dto_1 = __webpack_require__(/*! ../content/dto/search-query.dto */ "./src/modules/content/dto/search-query.dto.ts");
let MiniappSongsController = class MiniappSongsController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.listPublished(content_type_enum_1.ContentType.SONG, query);
    }
    async detail(id) {
        const item = await this.contentService.getPublishedDetail(content_type_enum_1.ContentType.SONG, id);
        return this.contentService.serialize(item, content_type_enum_1.ContentType.SONG);
    }
};
exports.MiniappSongsController = MiniappSongsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof search_query_dto_1.SearchQueryDto !== "undefined" && search_query_dto_1.SearchQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], MiniappSongsController.prototype, "list", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MiniappSongsController.prototype, "detail", null);
exports.MiniappSongsController = MiniappSongsController = __decorate([
    (0, common_1.Controller)('miniapp/songs'),
    __metadata("design:paramtypes", [typeof (_a = typeof content_service_1.ContentService !== "undefined" && content_service_1.ContentService) === "function" ? _a : Object])
], MiniappSongsController);


/***/ },

/***/ "./src/modules/miniapp-songs/miniapp-songs.module.ts"
/*!***********************************************************!*\
  !*** ./src/modules/miniapp-songs/miniapp-songs.module.ts ***!
  \***********************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiniappSongsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const content_module_1 = __webpack_require__(/*! ../content/content.module */ "./src/modules/content/content.module.ts");
const miniapp_songs_controller_1 = __webpack_require__(/*! ./miniapp-songs.controller */ "./src/modules/miniapp-songs/miniapp-songs.controller.ts");
let MiniappSongsModule = class MiniappSongsModule {
};
exports.MiniappSongsModule = MiniappSongsModule;
exports.MiniappSongsModule = MiniappSongsModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule],
        controllers: [miniapp_songs_controller_1.MiniappSongsController],
    })
], MiniappSongsModule);


/***/ },

/***/ "./src/modules/seed/seed.module.ts"
/*!*****************************************!*\
  !*** ./src/modules/seed/seed.module.ts ***!
  \*****************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SeedModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const admin_entity_1 = __webpack_require__(/*! ../../entities/admin.entity */ "./src/entities/admin.entity.ts");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const phrase_entity_1 = __webpack_require__(/*! ../../entities/phrase.entity */ "./src/entities/phrase.entity.ts");
const proverb_entity_1 = __webpack_require__(/*! ../../entities/proverb.entity */ "./src/entities/proverb.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../../entities/song.entity */ "./src/entities/song.entity.ts");
const culture_exhibit_entity_1 = __webpack_require__(/*! ../../entities/culture-exhibit.entity */ "./src/entities/culture-exhibit.entity.ts");
const content_culture_link_entity_1 = __webpack_require__(/*! ../../entities/content-culture-link.entity */ "./src/entities/content-culture-link.entity.ts");
const seed_service_1 = __webpack_require__(/*! ./seed.service */ "./src/modules/seed/seed.service.ts");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([admin_entity_1.Admin, dictionary_entry_entity_1.DictionaryEntry, phrase_entity_1.Phrase, proverb_entity_1.Proverb, song_entity_1.Song, culture_exhibit_entity_1.CultureExhibit, content_culture_link_entity_1.ContentCultureLink])],
        providers: [seed_service_1.SeedService],
    })
], SeedModule);


/***/ },

/***/ "./src/modules/seed/seed.service.ts"
/*!******************************************!*\
  !*** ./src/modules/seed/seed.service.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SeedService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const bcrypt = __webpack_require__(/*! bcryptjs */ "bcryptjs");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const admin_role_enum_1 = __webpack_require__(/*! ../../common/enums/admin-role.enum */ "./src/common/enums/admin-role.enum.ts");
const runtime_validation_1 = __webpack_require__(/*! ../../config/runtime-validation */ "./src/config/runtime-validation.ts");
const admin_entity_1 = __webpack_require__(/*! ../../entities/admin.entity */ "./src/entities/admin.entity.ts");
const dictionary_entry_entity_1 = __webpack_require__(/*! ../../entities/dictionary-entry.entity */ "./src/entities/dictionary-entry.entity.ts");
const phrase_entity_1 = __webpack_require__(/*! ../../entities/phrase.entity */ "./src/entities/phrase.entity.ts");
const proverb_entity_1 = __webpack_require__(/*! ../../entities/proverb.entity */ "./src/entities/proverb.entity.ts");
const song_entity_1 = __webpack_require__(/*! ../../entities/song.entity */ "./src/entities/song.entity.ts");
const culture_exhibit_entity_1 = __webpack_require__(/*! ../../entities/culture-exhibit.entity */ "./src/entities/culture-exhibit.entity.ts");
const content_culture_link_entity_1 = __webpack_require__(/*! ../../entities/content-culture-link.entity */ "./src/entities/content-culture-link.entity.ts");
const content_type_enum_1 = __webpack_require__(/*! ../../common/enums/content-type.enum */ "./src/common/enums/content-type.enum.ts");
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
    onApplicationBootstrap() {
        const enabled = this.configService.get('seed.onBoot', true);
        if (!enabled) {
            return;
        }
        this.seedAsync().catch(err => {
            this.logger.error('Seed failed:', err);
        });
    }
    async seedAsync() {
        await this.seedAdmin();
        const hasContent = await Promise.all([
            this.dictionaryRepository.count(),
            this.phraseRepository.count(),
            this.proverbRepository.count(),
        ]).then(([d, p, pr]) => d > 0 || p > 0 || pr > 0);
        if (!hasContent) {
            await this.seedContent();
        }
        const hasExhibit = await this.cultureExhibitRepository.count();
        if (!hasExhibit) {
            await this.seedCultureExhibits();
        }
    }
    async seedAdmin() {
        if ((0, runtime_validation_1.isProductionEnvironment)(process.env)) {
            return;
        }
        const username = this.configService.get('seed.adminUsername', 'admin');
        const existing = await this.adminRepository.findOne({ where: { username } });
        if (existing) {
            return;
        }
        const password = this.configService.get('seed.adminPassword', 'Admin@123456');
        const passwordHash = await bcrypt.hash(password, 6);
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
        const dictionaries = [
            { buyiText: 'noi', zhText: '你好', zhSortKey: 'ni hao', enText: 'Hello', description: '基础问候语', isPublished: true, sortOrder: 1 },
            { buyiText: 'do', zhText: '爸爸', zhSortKey: 'ba ba', enText: 'Father', description: '亲属称呼', isPublished: true, sortOrder: 2 },
            { buyiText: 'mo', zhText: '妈妈', zhSortKey: 'ma ma', enText: 'Mother', description: '亲属称呼', isPublished: true, sortOrder: 3 },
        ];
        const phrases = [
            { buyiText: 'nang bux', zhText: '你好吗？', zhSortKey: 'ni hao ma', enText: 'How are you?', description: '日常问候', isPublished: true, sortOrder: 1 },
            { buyiText: 'yo bux', zhText: '我很好', zhSortKey: 'wo hen hao', enText: "I'm fine", description: '回答问候', isPublished: true, sortOrder: 2 },
        ];
        const proverbs = [
            { buyiText: 'nga zi ni ma', zhText: '说话像唱歌', zhSortKey: 'shuo hua xiang chang ge', enText: 'Speak like singing', description: '布依族文化表达', isPublished: true, sortOrder: 1 },
        ];
        await Promise.all([
            this.dictionaryRepository.save(dictionaries.map(d => this.dictionaryRepository.create(d))),
            this.phraseRepository.save(phrases.map(p => this.phraseRepository.create(p))),
            this.proverbRepository.save(proverbs.map(p => this.proverbRepository.create(p))),
        ]);
    }
    async seedCultureExhibits() {
        if ((0, runtime_validation_1.isProductionEnvironment)(process.env)) {
            return;
        }
        const exhibit = await this.cultureExhibitRepository.save(this.cultureExhibitRepository.create({
            slug: 'buyi-folk-song',
            title: '从“说话像唱歌”走进民歌声场',
            kicker: '由词入馆 · 声音展项',
            summary: '从一条带有歌唱意象的谚语出发，观察布依民歌的唱法与使用场景，并继续进入可播放的民歌声场。',
            story: '中国非物质文化遗产网介绍，布依族民歌有古歌、叙事歌、情歌、酒歌和劳动歌等类型，也有独唱、对唱、齐唱、重唱等演唱形式。本页的琴键只展示合成调值轮廓，不将其当作真实例词录音。',
            patternLabel: '声音与礼俗的线索',
            toneIndex: 1,
            isPublished: true,
            sortOrder: 1,
        }));
        const songs = [
            { title: '布依迎客歌', artist: '布依文化采集', buyiText: 'hau mbou', zhText: '欢迎远方客人的民歌', zhSortKey: 'huan ying yuan fang ke ren de min ge', enText: 'Welcome song of Buyi people', description: '首页轮播与民歌列表示例数据', isPublished: true, sortOrder: 1 },
            { title: '山歌对唱', artist: '黔南山歌队', buyiText: 'gaen hau', zhText: '山谷之间的对唱', zhSortKey: 'shan gu zhi jian de dui chang', enText: 'Valley antiphonal singing', description: '用于首页展示布依语韵律与文化气质', isPublished: true, sortOrder: 2 },
            { title: '田间节奏', artist: '布依青年合唱', buyiText: 'mbou ra', zhText: '田间劳作时的节奏民歌', zhSortKey: 'tian jian lao zuo shi de jie zou min ge', enText: 'Rhythm of farming folk song', description: '作为小程序首页精选民歌示例', isPublished: true, sortOrder: 3 },
        ];
        await this.songRepository.save(songs.map(s => this.songRepository.create(s)));
        const proverb = await this.proverbRepository.findOne({ where: { buyiText: 'nga zi ni ma' } });
        if (proverb) {
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
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _g : Object, typeof (_h = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _h : Object])
], SeedService);


/***/ },

/***/ "./src/modules/users/users.module.ts"
/*!*******************************************!*\
  !*** ./src/modules/users/users.module.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const favorite_entity_1 = __webpack_require__(/*! ../../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const user_setting_entity_1 = __webpack_require__(/*! ../../entities/user-setting.entity */ "./src/entities/user-setting.entity.ts");
const user_entity_1 = __webpack_require__(/*! ../../entities/user.entity */ "./src/entities/user.entity.ts");
const wechat_account_entity_1 = __webpack_require__(/*! ../../entities/wechat-account.entity */ "./src/entities/wechat-account.entity.ts");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./src/modules/users/users.service.ts");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, wechat_account_entity_1.WechatAccount, user_setting_entity_1.UserSetting, favorite_entity_1.Favorite, learning_record_entity_1.LearningRecord])],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService, typeorm_1.TypeOrmModule],
    })
], UsersModule);


/***/ },

/***/ "./src/modules/users/users.service.ts"
/*!********************************************!*\
  !*** ./src/modules/users/users.service.ts ***!
  \********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const favorite_entity_1 = __webpack_require__(/*! ../../entities/favorite.entity */ "./src/entities/favorite.entity.ts");
const learning_record_entity_1 = __webpack_require__(/*! ../../entities/learning-record.entity */ "./src/entities/learning-record.entity.ts");
const user_setting_entity_1 = __webpack_require__(/*! ../../entities/user-setting.entity */ "./src/entities/user-setting.entity.ts");
const user_entity_1 = __webpack_require__(/*! ../../entities/user.entity */ "./src/entities/user.entity.ts");
const wechat_account_entity_1 = __webpack_require__(/*! ../../entities/wechat-account.entity */ "./src/entities/wechat-account.entity.ts");
let UsersService = class UsersService {
    constructor(usersRepository, wechatAccountsRepository, userSettingsRepository, favoritesRepository, learningRecordsRepository) {
        this.usersRepository = usersRepository;
        this.wechatAccountsRepository = wechatAccountsRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.favoritesRepository = favoritesRepository;
        this.learningRecordsRepository = learningRecordsRepository;
    }
    async findById(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return user;
    }
    async findWechatAccount(openid) {
        return this.wechatAccountsRepository.findOne({
            where: { openid },
            relations: ['user'],
        });
    }
    async upsertWechatUser(params) {
        const now = new Date();
        const existing = await this.findWechatAccount(params.openid);
        if (existing) {
            if (params.sessionKey) {
                existing.sessionKey = params.sessionKey;
            }
            if (params.unionid) {
                existing.unionid = params.unionid;
            }
            await this.wechatAccountsRepository.save(existing);
            const user = existing.user;
            user.nickname = params.nickname ?? user.nickname;
            user.avatarUrl = params.avatarUrl ?? user.avatarUrl;
            user.lastLoginTime = now;
            return this.usersRepository.save(user);
        }
        const user = this.usersRepository.create({
            nickname: params.nickname || '微信用户',
            avatarUrl: params.avatarUrl || null,
            lastLoginTime: now,
        });
        const savedUser = await this.usersRepository.save(user);
        const wechatAccount = this.wechatAccountsRepository.create({
            openid: params.openid,
            unionid: params.unionid ?? null,
            sessionKey: params.sessionKey ?? null,
            userId: savedUser.id,
        });
        await this.wechatAccountsRepository.save(wechatAccount);
        return savedUser;
    }
    async getSettings(userId) {
        const settings = await this.userSettingsRepository.find({ where: { userId } });
        return settings.reduce((acc, current) => {
            acc[current.key] = current.value;
            return acc;
        }, {});
    }
    async updateSettings(userId, updates) {
        const keys = Object.keys(updates);
        const existing = keys.length
            ? await this.userSettingsRepository.find({
                where: keys.map((key) => ({ userId, key })),
            })
            : [];
        const existingMap = new Map(existing.map((item) => [item.key, item]));
        for (const [key, value] of Object.entries(updates)) {
            const item = existingMap.get(key);
            if (item) {
                item.value = value;
                await this.userSettingsRepository.save(item);
                continue;
            }
            await this.userSettingsRepository.save(this.userSettingsRepository.create({
                userId,
                key,
                value,
            }));
        }
        return this.getSettings(userId);
    }
    async getProfileStats(userId) {
        const [favoriteCount, learningRecordCount, lastRecord] = await Promise.all([
            this.favoritesRepository.count({ where: { userId } }),
            this.learningRecordsRepository.count({ where: { userId } }),
            this.learningRecordsRepository.findOne({
                where: { userId },
                order: { createdAt: 'DESC' },
            }),
        ]);
        return {
            favoriteCount,
            learningRecordCount,
            lastActiveAt: lastRecord?.createdAt ?? null,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(wechat_account_entity_1.WechatAccount)),
    __param(2, (0, typeorm_1.InjectRepository)(user_setting_entity_1.UserSetting)),
    __param(3, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __param(4, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object])
], UsersService);


/***/ },

/***/ "@nestjs/common"
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
(module) {

module.exports = require("@nestjs/common");

/***/ },

/***/ "@nestjs/config"
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
(module) {

module.exports = require("@nestjs/config");

/***/ },

/***/ "@nestjs/core"
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
(module) {

module.exports = require("@nestjs/core");

/***/ },

/***/ "@nestjs/jwt"
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
(module) {

module.exports = require("@nestjs/jwt");

/***/ },

/***/ "@nestjs/mapped-types"
/*!***************************************!*\
  !*** external "@nestjs/mapped-types" ***!
  \***************************************/
(module) {

module.exports = require("@nestjs/mapped-types");

/***/ },

/***/ "@nestjs/platform-express"
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
(module) {

module.exports = require("@nestjs/platform-express");

/***/ },

/***/ "@nestjs/serve-static"
/*!***************************************!*\
  !*** external "@nestjs/serve-static" ***!
  \***************************************/
(module) {

module.exports = require("@nestjs/serve-static");

/***/ },

/***/ "@nestjs/typeorm"
/*!**********************************!*\
  !*** external "@nestjs/typeorm" ***!
  \**********************************/
(module) {

module.exports = require("@nestjs/typeorm");

/***/ },

/***/ "axios"
/*!************************!*\
  !*** external "axios" ***!
  \************************/
(module) {

module.exports = require("axios");

/***/ },

/***/ "bcryptjs"
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
(module) {

module.exports = require("bcryptjs");

/***/ },

/***/ "class-transformer"
/*!************************************!*\
  !*** external "class-transformer" ***!
  \************************************/
(module) {

module.exports = require("class-transformer");

/***/ },

/***/ "class-validator"
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
(module) {

module.exports = require("class-validator");

/***/ },

/***/ "cos-nodejs-sdk-v5"
/*!************************************!*\
  !*** external "cos-nodejs-sdk-v5" ***!
  \************************************/
(module) {

module.exports = require("cos-nodejs-sdk-v5");

/***/ },

/***/ "crypto"
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
(module) {

module.exports = require("crypto");

/***/ },

/***/ "express"
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
(module) {

module.exports = require("express");

/***/ },

/***/ "fs/promises"
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
(module) {

module.exports = require("fs/promises");

/***/ },

/***/ "helmet"
/*!*************************!*\
  !*** external "helmet" ***!
  \*************************/
(module) {

module.exports = require("helmet");

/***/ },

/***/ "multer"
/*!*************************!*\
  !*** external "multer" ***!
  \*************************/
(module) {

module.exports = require("multer");

/***/ },

/***/ "path"
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
(module) {

module.exports = require("path");

/***/ },

/***/ "pinyin-pro"
/*!*****************************!*\
  !*** external "pinyin-pro" ***!
  \*****************************/
(module) {

module.exports = require("pinyin-pro");

/***/ },

/***/ "sql.js"
/*!*************************!*\
  !*** external "sql.js" ***!
  \*************************/
(module) {

module.exports = require("sql.js");

/***/ },

/***/ "typeorm"
/*!**************************!*\
  !*** external "typeorm" ***!
  \**************************/
(module) {

module.exports = require("typeorm");

/***/ },

/***/ "xlsx"
/*!***********************!*\
  !*** external "xlsx" ***!
  \***********************/
(module) {

module.exports = require("xlsx");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const crypto_1 = __webpack_require__(/*! crypto */ "crypto");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const helmet_1 = __webpack_require__(/*! helmet */ "helmet");
const http_exception_filter_1 = __webpack_require__(/*! ./common/filters/http-exception.filter */ "./src/common/filters/http-exception.filter.ts");
const rate_limit_1 = __webpack_require__(/*! ./common/http/rate-limit */ "./src/common/http/rate-limit.ts");
const runtime_validation_1 = __webpack_require__(/*! ./config/runtime-validation */ "./src/config/runtime-validation.ts");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
async function bootstrap() {
    (0, runtime_validation_1.validateEnvironmentOrThrow)(process.env);
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: false,
        logger: ['error', 'warn'],
    });
    app.setGlobalPrefix('api');
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: false,
    }));
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',').map((item) => item.trim()).filter(Boolean) ?? false,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.use((req, res, next) => {
        const requestId = req.header('x-request-id') || (0, crypto_1.randomUUID)();
        req.requestId = requestId;
        res.setHeader('x-request-id', requestId);
        next();
    });
    app.use(['/api/admin/auth/login', '/api/admin/auth/refresh', '/api/miniapp/auth/wechat-login', '/api/miniapp/auth/web-login', '/api/miniapp/auth/web-register', '/api/miniapp/auth/refresh'], (0, rate_limit_1.createRateLimitMiddleware)({
        limit: 20,
        windowMs: 60 * 1000,
        message: '请求过于频繁，请稍后再试',
    }));
    app.use(['/api/admin/media/upload'], (0, rate_limit_1.createRateLimitMiddleware)({
        limit: 10,
        windowMs: 60 * 1000,
        message: '上传过于频繁，请稍后再试',
    }));
    app.use(['/api/miniapp/agent/ask'], (0, rate_limit_1.createRateLimitMiddleware)({
        limit: 10,
        windowMs: 60 * 1000,
        message: '提问过于频繁，请稍后再试',
    }));
    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? '0.0.0.0';
    await app.listen(port, host);
    logger.log(`HTTP server listening on ${host}:${port}`);
}
void bootstrap();

})();

/******/ })()
;