"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const serve_static_1 = require("@nestjs/serve-static");
const typeorm_1 = require("@nestjs/typeorm");
const path_1 = require("path");
const app_config_1 = require("./config/app.config");
const database_config_1 = require("./config/database.config");
const admin_role_enum_1 = require("./common/enums/admin-role.enum");
const content_type_enum_1 = require("./common/enums/content-type.enum");
const admin_auth_module_1 = require("./modules/admin-auth/admin-auth.module");
const auth_sessions_module_1 = require("./modules/auth-sessions/auth-sessions.module");
const admin_content_module_1 = require("./modules/admin-content/admin-content.module");
const admin_dashboard_module_1 = require("./modules/admin-dashboard/admin-dashboard.module");
const admin_media_module_1 = require("./modules/admin-media/admin-media.module");
const admin_users_module_1 = require("./modules/admin-users/admin-users.module");
const content_module_1 = require("./modules/content/content.module");
const culture_exhibits_module_1 = require("./modules/culture-exhibits/culture-exhibits.module");
const media_module_1 = require("./modules/media/media.module");
const health_module_1 = require("./modules/health/health.module");
const miniapp_auth_module_1 = require("./modules/miniapp-auth/miniapp-auth.module");
const miniapp_agent_module_1 = require("./modules/miniapp-agent/miniapp-agent.module");
const miniapp_badges_module_1 = require("./modules/miniapp-badges/miniapp-badges.module");
const miniapp_dictionary_module_1 = require("./modules/miniapp-dictionary/miniapp-dictionary.module");
const miniapp_favorites_module_1 = require("./modules/miniapp-favorites/miniapp-favorites.module");
const miniapp_home_module_1 = require("./modules/miniapp-home/miniapp-home.module");
const miniapp_learning_records_module_1 = require("./modules/miniapp-learning-records/miniapp-learning-records.module");
const miniapp_me_module_1 = require("./modules/miniapp-me/miniapp-me.module");
const miniapp_phrases_module_1 = require("./modules/miniapp-phrases/miniapp-phrases.module");
const miniapp_quiz_module_1 = require("./modules/miniapp-quiz/miniapp-quiz.module");
const miniapp_proverbs_module_1 = require("./modules/miniapp-proverbs/miniapp-proverbs.module");
const miniapp_search_module_1 = require("./modules/miniapp-search/miniapp-search.module");
const miniapp_settings_module_1 = require("./modules/miniapp-settings/miniapp-settings.module");
const miniapp_songs_module_1 = require("./modules/miniapp-songs/miniapp-songs.module");
const seed_module_1 = require("./modules/seed/seed.module");
const users_module_1 = require("./modules/users/users.module");
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
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), '..', 'admin-web'),
                serveRoot: '/admin-web',
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
//# sourceMappingURL=app.module.js.map