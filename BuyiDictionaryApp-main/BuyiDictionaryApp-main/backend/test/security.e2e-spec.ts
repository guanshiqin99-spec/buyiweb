/**
 * 安全与鉴权边界 e2e 测试（P0）
 * 覆盖：无 token 访问、越权、非法 token、登录失败锁定、refresh 轮换、
 *      SSE 接口鉴权、DTO 输入校验。
 *
 * 运行：cd backend && npm test（与现有 app.e2e-spec.ts 一致，sqljs 内存库 + seed）
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

describe('Security & Auth Boundaries (e2e)', () => {
  let app: INestApplication;
  const testDatabase = `buyi-security-test-${process.pid}.sqlite`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_TYPE = 'sqljs';
    process.env.DB_NAME = testDatabase;
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.WECHAT_MOCK_MODE = 'true';
    // 不跑全量 seed（避免 sql.js 内存累积），改由 beforeAll 手动创建 admin
    process.env.SEED_ON_BOOT = 'false';
    process.env.DEFAULT_ADMIN_USERNAME = 'admin';
    process.env.DEFAULT_ADMIN_PASSWORD = 'Admin@123456';
    process.env.JWT_SECRET = 'test-secret';
    process.env.ENABLE_SWAGGER = 'false';
    // 清空 AI key（dotenv 不覆盖已存在的变量），保证 isConfigured() = false
    process.env.DEEPSEEK_API_KEY = '';
    process.env.AI_PROVIDER = 'deepseek';

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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (existsSync(testDatabase)) unlinkSync(testDatabase);
  });

  const protectedGet = (path: string) => request(app.getHttpServer()).get(path);

  describe('未授权访问', () => {
    it('无 token 访问小程序受保护接口应 401', async () => {
      await protectedGet('/api/miniapp/me').expect(401);
      await protectedGet('/api/miniapp/favorites').expect(401);
      await protectedGet('/api/miniapp/learning-records').expect(401);
      await protectedGet('/api/miniapp/settings').expect(401);
    });

    it('无 token 访问后台接口应 401', async () => {
      await protectedGet('/api/admin/dashboard').expect(401);
      await protectedGet('/api/admin/dictionary').expect(401);
      await protectedGet('/api/admin/users').expect(401);
    });

    it('非法/伪造 token 应 401', async () => {
      await protectedGet('/api/miniapp/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
      await protectedGet('/api/admin/dashboard')
        .set('Authorization', 'Bearer garbage.token.here')
        .expect(401);
    });

    it('公开接口无需 token 应可访问', async () => {
      await protectedGet('/api/health').expect(200);
      await protectedGet('/api/miniapp/home').expect(200);
      await protectedGet('/api/miniapp/search').query({ keyword: 'noi' }).expect(200);
    });
  });

  describe('越权与令牌用途隔离', () => {
    it('普通用户 token 访问后台接口应被拒绝（401 或 403）', async () => {
      const login = await request(app.getHttpServer())
        .post('/api/miniapp/auth/wechat-login')
        .send({ code: `unauthorized-${Date.now()}`, nickname: 'NormalUser' })
        .expect(201);
      const userToken = login.body.accessToken;

      const dashboard = await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);
      expect([401, 403]).toContain(dashboard.status);

      const dict = await request(app.getHttpServer())
        .get('/api/admin/dictionary')
        .set('Authorization', `Bearer ${userToken}`);
      expect([401, 403]).toContain(dict.status);
    });

    it('admin token 不能访问小程序受保护接口（401 或 403）', async () => {
      const login = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({ username: 'admin', password: 'Admin@123456' })
        .expect(201);
      const adminToken = login.body.accessToken;

      const me = await request(app.getHttpServer())
        .get('/api/miniapp/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([401, 403]).toContain(me.status);
    });
  });

  describe('refresh token 轮换', () => {
    it('已轮换的旧 refreshToken 再次使用应 401', async () => {
      const login = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({ username: 'admin', password: 'Admin@123456' })
        .expect(201);
      const oldRefresh = login.body.refreshToken;

      // 第一次 refresh 成功并轮换
      const firstRefresh = await request(app.getHttpServer())
        .post('/api/admin/auth/refresh')
        .send({ refreshToken: oldRefresh })
        .expect(201);
      expect(firstRefresh.body.refreshToken).toBeDefined();

      // 旧 refreshToken 已被轮换，再次使用应 401
      await request(app.getHttpServer())
        .post('/api/admin/auth/refresh')
        .send({ refreshToken: oldRefresh })
        .expect(401);
    });

    it('logout 后 accessToken 立即失效', async () => {
      const login = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({ username: 'admin', password: 'Admin@123456' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/admin/auth/logout')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .expect(401);
    });
  });

  describe('AI 助手接口鉴权', () => {
    it('ask 未带 token 应 401', async () => {
      await request(app.getHttpServer())
        .post('/api/miniapp/agent/ask')
        .send({ question: '布依族在哪里？' })
        .expect(401);
    });

    it('generate 免登录可访问，非法 type 应 400', async () => {
      await request(app.getHttpServer())
        .post('/api/miniapp/agent/generate')
        .send({ type: 'not-a-type', word: '你好' })
        .expect(400);
    });

    it('generate 未配置 AI 时返回 SSE error 事件而非 500', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/miniapp/agent/generate')
        .send({ type: 'sentence', word: '布依' })
        .expect(200);

      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('data:');
      expect(res.text).toContain('"type":"error"');
    });

    it('generate quiz 类型可不带 word，但超长 word 应 400', async () => {
      await request(app.getHttpServer())
        .post('/api/miniapp/agent/generate')
        .send({ type: 'quiz' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/miniapp/agent/generate')
        .send({ type: 'sentence', word: 'x'.repeat(101) })
        .expect(400);
    });
  });

  describe('DTO 输入校验', () => {
    it('非法分页参数应 400', async () => {
      await request(app.getHttpServer())
        .get('/api/miniapp/search')
        .query({ page: -1 })
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/miniapp/search')
        .query({ pageSize: 0 })
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/miniapp/search')
        .query({ page: 'abc' })
        .expect(400);
    });

    it('超长 question 应 400，空白 question 应 400', async () => {
      const token = (await request(app.getHttpServer())
        .post('/api/miniapp/auth/wechat-login')
        .send({ code: `dto-${Date.now()}` })
        .expect(201)).body.accessToken;

      await request(app.getHttpServer())
        .post('/api/miniapp/agent/ask')
        .set('Authorization', `Bearer ${token}`)
        .send({ question: 'x'.repeat(501) })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/miniapp/agent/ask')
        .set('Authorization', `Bearer ${token}`)
        .send({ question: '   ' })
        .expect(400);
    });

    it('未知字段应被 forbidNonWhitelisted 拒绝', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({ username: 'admin', password: 'Admin@123456', extraField: 'x' })
        .expect(400);
    });
  });

  // 登录锁定为内存状态且按账号/IP 双维度，放在最后执行避免污染其他用例
  describe('登录失败锁定', () => {
    it('连续失败达到阈值后，正确密码也被锁定拒绝', async () => {
      const server = app.getHttpServer();

      for (let i = 0; i < 5; i++) {
        await request(server)
          .post('/api/admin/auth/login')
          .send({ username: 'admin', password: 'Wrong-Password-123' })
          .expect(401);
      }

      // 第 6 次即使密码正确，也应因账号锁定返回 400
      const locked = await request(server)
        .post('/api/admin/auth/login')
        .send({ username: 'admin', password: 'Admin@123456' });
      expect(locked.status).toBe(400);
      expect(String(locked.body.message)).toContain('锁定');
    });
  });
});
