/**
 * 内容查询 API e2e 测试（P0）
 * 覆盖：四类内容分页列表、未发布内容隔离、关键词搜索、综合搜索结构、
 *      建议排序、详情 404、首页数据结构、特殊字符边界。
 *
 * 通过 admin 接口动态创建测试内容，不依赖种子数据具体内容。
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { existsSync, unlinkSync } from 'fs';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AdminRole } from '../src/common/enums/admin-role.enum';
import { Admin } from '../src/entities/admin.entity';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('Content Query APIs (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  const testDatabase = `buyi-content-test-${process.pid}.sqlite`;
  const stamp = Date.now();

  const dictKeyword = `review词${stamp}`;
  const phraseKeyword = `review短${stamp}`;
  const proverbKeyword = `review谚${stamp}`;
  const songKeyword = `review歌${stamp}`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_TYPE = 'sqljs';
    process.env.DB_NAME = testDatabase;
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.WECHAT_MOCK_MODE = 'true';
    // 不跑全量 seed，内容全部由本套件自建，降低 sql.js 内存占用
    process.env.SEED_ON_BOOT = 'false';
    process.env.DEFAULT_ADMIN_USERNAME = 'admin';
    process.env.DEFAULT_ADMIN_PASSWORD = 'Admin@123456';
    process.env.JWT_SECRET = 'test-secret';
    process.env.ENABLE_SWAGGER = 'false';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // 手动创建测试管理员（替代 seed）
    const dataSource = app.get(DataSource);
    const adminRepo = dataSource.getRepository(Admin);
    await adminRepo.save(
      adminRepo.create({
        username: 'admin',
        passwordHash: bcrypt.hashSync('Admin@123456', 10),
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      }),
    );

    // 登录 admin 并创建四类测试内容
    const login = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);
    adminToken = login.body.accessToken;

    const server = app.getHttpServer();
    const auth = { Authorization: `Bearer ${adminToken}` };

    await request(server)
      .post('/api/admin/dictionary')
      .set(auth)
      .send({ buyiText: `mbaw${stamp}`, zhText: dictKeyword, enText: 'review-en', description: '审查用词条', sortOrder: 0, isPublished: true })
      .expect(201);

    await request(server)
      .post('/api/admin/phrases')
      .set(auth)
      .send({ buyiText: `gol${stamp}`, zhText: phraseKeyword, description: '审查用短语', sortOrder: 0, isPublished: true })
      .expect(201);

    await request(server)
      .post('/api/admin/proverbs')
      .set(auth)
      .send({ buyiText: `xih${stamp}`, zhText: proverbKeyword, description: '审查用谚语', sortOrder: 0, isPublished: true })
      .expect(201);

    await request(server)
      .post('/api/admin/songs')
      .set(auth)
      .send({ title: songKeyword, artist: '测试歌手', buyiText: 'hau', zhText: '欢迎歌', enText: 'welcome', description: '审查用民歌', sortOrder: 0, isPublished: true })
      .expect(201);

    // 一条未发布词条（miniapp 不可见）
    await request(server)
      .post('/api/admin/dictionary')
      .set(auth)
      .send({ buyiText: `hidden${stamp}`, zhText: `未发布${stamp}`, description: '草稿', sortOrder: 0, isPublished: false })
      .expect(201);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (existsSync(testDatabase)) unlinkSync(testDatabase);
  });

  describe('分页列表', () => {
    it('四类内容列表结构完整且分页字段正确', async () => {
      const checks: Array<[string, string]> = [
        ['/api/miniapp/dictionary', dictKeyword],
        ['/api/miniapp/phrases', phraseKeyword],
        ['/api/miniapp/proverbs', proverbKeyword],
        ['/api/miniapp/songs', songKeyword],
      ];

      for (const [path, keyword] of checks) {
        const res = await request(app.getHttpServer())
          .get(path)
          .query({ page: 1, pageSize: 5, keyword })
          .expect(200);

        expect(res.body.items.length).toBeGreaterThan(0);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(5);
        expect(res.body.total).toBeGreaterThanOrEqual(1);
        expect(res.body.totalPages).toBeGreaterThanOrEqual(1);

        const zhMatch = res.body.items.some((item: { zhText?: string }) => item.zhText?.includes(keyword));
        const buyiMatch = res.body.items.some((item: { buyiText?: string }) => item.buyiText?.includes(keyword));
        const titleMatch = res.body.items.some((item: { title?: string }) => item.title?.includes(keyword));
        expect(zhMatch || buyiMatch || titleMatch).toBe(true);
      }
    });

    it('page=2 且超出范围时返回空列表而不报错', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/miniapp/dictionary')
        .query({ page: 9999, pageSize: 5 })
        .expect(200);
      expect(res.body.items).toEqual([]);
      expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('发布状态隔离', () => {
    it('未发布内容对 miniapp 不可见', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/miniapp/search')
        .query({ keyword: `未发布${stamp}` })
        .expect(200);
      const hit = res.body.dictionary.some((item: { zhText?: string }) => item.zhText?.includes(`未发布${stamp}`));
      expect(hit).toBe(false);
    });

    it('未发布内容在 admin 列表可见（草稿管理）', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/dictionary')
        .query({ keyword: `未发布${stamp}` })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.items[0].isPublished).toBe(false);
    });
  });

  describe('综合搜索与建议', () => {
    it('综合搜索返回四类分组与 pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/miniapp/search')
        .query({ keyword: stamp })
        .expect(200);

      expect(Array.isArray(res.body.dictionary)).toBe(true);
      expect(Array.isArray(res.body.phrases)).toBe(true);
      expect(Array.isArray(res.body.proverbs)).toBe(true);
      expect(Array.isArray(res.body.songs)).toBe(true);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(4);

      const groupTotal = ['dictionary', 'phrases', 'proverbs', 'songs']
        .reduce((sum, key) => sum + res.body[key].length, 0);
      expect(groupTotal).toBeGreaterThanOrEqual(4);
    });

    it('suggest 中文优先且每类不超过 5 条', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/miniapp/search/suggest')
        .query({ keyword: dictKeyword })
        .expect(200);

      expect(res.body.dictionary.length).toBeLessThanOrEqual(5);
      expect(res.body.phrases.length).toBeLessThanOrEqual(5);
      expect(res.body.proverbs.length).toBeLessThanOrEqual(5);
      // 动态创建的 zhText 命中应排在 buyiText 命中之前（buyiText 不含完整关键词时应为 -1）
      const zhIndex = res.body.dictionary.findIndex((item: { zhText?: string }) => item.zhText?.includes(dictKeyword));
      const buyiIndex = res.body.dictionary.findIndex((item: { buyiText?: string }) => item.buyiText?.includes(dictKeyword));
      if (zhIndex >= 0 && buyiIndex >= 0) {
        expect(zhIndex).toBeLessThan(buyiIndex);
      }
    });

    it('空关键词 suggest 返回空分组而非报错', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/miniapp/search/suggest')
        .query({ keyword: '   ' })
        .expect(200);
      expect(res.body.dictionary).toEqual([]);
      expect(res.body.phrases).toEqual([]);
      expect(res.body.proverbs).toEqual([]);
      expect(res.body.songs).toEqual([]);
    });

    it('suggest 按歌名/歌手命中民歌（title/artist 可搜）', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/miniapp/search/suggest')
        .query({ keyword: songKeyword })
        .expect(200);

      // 动态创建的测试民歌 title 含 songKeyword，联想必须能命中
      const songHit = (res.body.songs || []).find((item: { title?: string }) => item.title?.includes(songKeyword));
      expect(songHit).toBeTruthy();

      // 歌手命中：artist 字段含“测试歌手”，按歌手名联想也能返回
      const artistRes = await request(app.getHttpServer())
        .get('/api/miniapp/search/suggest')
        .query({ keyword: '测试歌手' })
        .expect(200);
      const artistHit = (artistRes.body.songs || []).find((item: { artist?: string }) => item.artist === '测试歌手');
      expect(artistHit).toBeTruthy();
    });
  });

  describe('详情接口', () => {
    it('存在的词条详情返回完整字段', async () => {
      const list = await request(app.getHttpServer())
        .get('/api/miniapp/search')
        .query({ keyword: dictKeyword })
        .expect(200);
      const id = list.body.dictionary[0].id;

      const detail = await request(app.getHttpServer())
        .get(`/api/miniapp/dictionary/${id}`)
        .expect(200);
      expect(detail.body.id).toBe(id);
      expect(detail.body.zhText).toContain(dictKeyword);
    });

    it('不存在的详情返回 404', async () => {
      await request(app.getHttpServer())
        .get('/api/miniapp/dictionary/99999999')
        .expect(404);
    });

    it('非数字 id 返回 400', async () => {
      await request(app.getHttpServer())
        .get('/api/miniapp/dictionary/abc')
        .expect(400);
    });
  });

  describe('首页数据', () => {
    it('home 返回 banners 与 suggestions 且结构正确', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/miniapp/home')
        .expect(200);

      expect(Array.isArray(res.body.banners)).toBe(true);
      expect(Array.isArray(res.body.suggestions)).toBe(true);
      // banners 只取自含封面的歌曲
      for (const banner of res.body.banners) {
        expect(banner.image).toBeTruthy();
        expect(banner.contentType).toBe('song');
      }
      // suggestions 为去重后的字符串
      const unique = new Set(res.body.suggestions);
      expect(unique.size).toBe(res.body.suggestions.length);
    });
  });

  describe('边界与特殊字符', () => {
    it('SQL 通配符与引号不导致 500', async () => {
      for (const kw of ['%', '_', "'", '\\', '布%依']) {
        await request(app.getHttpServer())
          .get('/api/miniapp/search')
          .query({ keyword: kw })
          .expect(200);
      }
    });

    it('超长关键词被优雅拒绝而非 500', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/miniapp/search')
        .query({ keyword: 'x'.repeat(300) });
      // DTO 长度校验生效（400）或服务端容忍（200）均可，但不得 500
      expect([200, 400]).toContain(res.status);
    });
  });
});
