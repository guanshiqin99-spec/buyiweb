import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppConfig, appConfig } from './config/app.config';
import { typeOrmConfigFactory } from './config/database.config';
import { AdminRole } from './common/enums/admin-role.enum';
import { ContentType } from './common/enums/content-type.enum';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { AuthSessionsModule } from './modules/auth-sessions/auth-sessions.module';
import { AdminContentModule } from './modules/admin-content/admin-content.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { AdminMediaModule } from './modules/admin-media/admin-media.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { ContentModule } from './modules/content/content.module';
import { CultureExhibitsModule } from './modules/culture-exhibits/culture-exhibits.module';
import { MediaModule } from './modules/media/media.module';
import { HealthModule } from './modules/health/health.module';
import { MiniappAuthModule } from './modules/miniapp-auth/miniapp-auth.module';
import { MiniappAgentModule } from './modules/miniapp-agent/miniapp-agent.module';
import { MiniappBadgesModule } from './modules/miniapp-badges/miniapp-badges.module';
import { MiniappDictionaryModule } from './modules/miniapp-dictionary/miniapp-dictionary.module';
import { MiniappFavoritesModule } from './modules/miniapp-favorites/miniapp-favorites.module';
import { MiniappHomeModule } from './modules/miniapp-home/miniapp-home.module';
import { MiniappLearningRecordsModule } from './modules/miniapp-learning-records/miniapp-learning-records.module';
import { MiniappMeModule } from './modules/miniapp-me/miniapp-me.module';
import { MiniappPhrasesModule } from './modules/miniapp-phrases/miniapp-phrases.module';
import { MiniappQuizModule } from './modules/miniapp-quiz/miniapp-quiz.module';
import { MiniappProverbsModule } from './modules/miniapp-proverbs/miniapp-proverbs.module';
import { MiniappSearchModule } from './modules/miniapp-search/miniapp-search.module';
import { MiniappSettingsModule } from './modules/miniapp-settings/miniapp-settings.module';
import { MiniappSongsModule } from './modules/miniapp-songs/miniapp-songs.module';
import { SeedModule } from './modules/seed/seed.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
    }),
    ServeStaticModule.forRoot({
      rootPath: process.env.VERCEL === '1' ? '/tmp/uploads' : join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfigFactory,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        secret: configService.get('jwt.secret', { infer: true }),
      }),
    }),
    UsersModule,
    AuthSessionsModule,
    ContentModule,
    CultureExhibitsModule,
    MediaModule,
    HealthModule,
    SeedModule,
    MiniappAuthModule,
    MiniappAgentModule,
    MiniappHomeModule,
    MiniappMeModule,
    MiniappSettingsModule,
    MiniappSearchModule,
    MiniappDictionaryModule,
    MiniappPhrasesModule,
    MiniappQuizModule,
    MiniappProverbsModule,
    MiniappSongsModule,
    MiniappFavoritesModule,
    MiniappLearningRecordsModule,
    MiniappBadgesModule,
    AdminAuthModule,
    AdminDashboardModule,
    AdminContentModule,
    AdminMediaModule,
    AdminUsersModule,
  ],
  providers: [
    {
      provide: 'APP_METADATA',
      useValue: {
        name: 'Buyi Dictionary API',
        adminRoles: Object.values(AdminRole),
        contentTypes: Object.values(ContentType),
      },
    },
  ],
})
export class AppModule {}
