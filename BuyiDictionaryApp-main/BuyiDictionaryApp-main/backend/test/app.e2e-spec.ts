import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { existsSync, unlinkSync } from 'fs';
import * as request from 'supertest';
import * as XLSX from 'xlsx';
import { AppModule } from '../src/app.module';

jest.setTimeout(20000);

const excelHeaders = {
  buyiText: '\u5e03\u4f9d\u8bed',
  zhText: '\u4e2d\u6587\u91ca\u4e49',
  enText: '\u82f1\u6587\u91ca\u4e49',
  description: '\u8bf4\u660e',
  sortOrder: '\u6392\u5e8f\u503c',
  isPublished: '\u53d1\u5e03\u72b6\u6001',
} as const;

const songEnglishHeaders = {
  title: 'title',
  artist: 'artist',
  buyiText: 'buyiText',
  zhText: 'zhText',
  enText: 'enText',
  coverUrl: 'coverUrl',
  audioUrl: 'audioUrl',
  description: 'description',
  sortOrder: 'sortOrder',
  isPublished: 'isPublished',
} as const;

describe('Buyi Dictionary Backend (e2e)', () => {
  let app: INestApplication;
  const testDatabase = `buyi-test-${process.pid}.sqlite`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_TYPE = 'sqljs';
    process.env.DB_NAME = testDatabase;
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.WECHAT_MOCK_MODE = 'true';
    process.env.SEED_ON_BOOT = 'true';
    process.env.DEFAULT_ADMIN_USERNAME = 'admin';
    process.env.DEFAULT_ADMIN_PASSWORD = 'Admin@123456';
    process.env.JWT_SECRET = 'test-secret';
    process.env.MEDIA_MAX_FILE_SIZE = '1024';
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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (existsSync(testDatabase)) unlinkSync(testDatabase);
  });

  it('logs in admin and loads dashboard', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);

    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.refreshToken).toBeDefined();

    const dashboardResponse = await request(app.getHttpServer())
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(dashboardResponse.body.users).toBeDefined();
    expect(dashboardResponse.body.content.dictionary).toBeGreaterThan(0);
  });

  it('exposes health and readiness endpoints', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);

    const readyResponse = await request(app.getHttpServer()).get('/api/ready').expect(200);
    expect(readyResponse.body.status).toBe('ready');
    expect(readyResponse.body.checks.database).toBe(true);
  });

  it('supports admin refresh and logout flows', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken })
      .expect(201);

    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();

    await request(app.getHttpServer())
      .post('/api/admin/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/admin/auth/refresh')
      .send({ refreshToken: refreshResponse.body.refreshToken })
      .expect(401);
  });

  it('supports miniapp login, search, favorite, and learning record flows', async () => {
    const code = `demo-code-${Date.now()}`;
    const loginResponse = await request(app.getHttpServer())
      .post('/api/miniapp/auth/wechat-login')
      .send({ code, nickname: 'Tester' })
      .expect(201);

    const token = loginResponse.body.accessToken;
    const refreshToken = loginResponse.body.refreshToken;
    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/miniapp/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();

    const settingsResponse = await request(app.getHttpServer())
      .put('/api/miniapp/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'auto', fontSize: '中', notifications: true, autoplay: true, language: 'zh-CN' })
      .expect(200);

    expect(settingsResponse.body.notifications).toBe(true);
    expect(settingsResponse.body.autoplay).toBe(true);
    expect(settingsResponse.body.theme).toBe('auto');

    const reminderConfigResponse = await request(app.getHttpServer())
      .get('/api/miniapp/settings/reminder-config')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(reminderConfigResponse.body.enabled).toBe(false);

    const quizAttemptResponse = await request(app.getHttpServer())
      .post('/api/miniapp/quiz-attempts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        score: 10,
        correctCount: 1,
        totalQuestions: 2,
        answers: [
          { id: 'q1', selected: 'A', answer: 'A', correct: true },
          { id: 'q2', selected: 'B', answer: 'C', correct: false },
        ],
      })
      .expect(201);

    expect(quizAttemptResponse.body.score).toBe(10);

    const quizListResponse = await request(app.getHttpServer())
      .get('/api/miniapp/quiz-attempts')
      .query({ page: 1, pageSize: 10 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(quizListResponse.body.items).toHaveLength(1);
    expect(quizListResponse.body.totalPages).toBe(1);

    const searchResponse = await request(app.getHttpServer())
      .get('/api/miniapp/search')
      .query({ keyword: 'noi' })
      .expect(200);

    expect(searchResponse.body.dictionary.length).toBeGreaterThan(0);
    expect(searchResponse.body.pagination.page).toBe(1);
    expect(searchResponse.body.pagination.totalPages).toBeGreaterThanOrEqual(1);

    const dictionaryId = searchResponse.body.dictionary[0].id;

    await request(app.getHttpServer())
      .post('/api/miniapp/favorites/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'dictionary', contentId: dictionaryId })
      .expect(201);

    const favoritesResponse = await request(app.getHttpServer())
      .get('/api/miniapp/favorites')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(favoritesResponse.body.dictionary.length).toBeGreaterThan(0);

    await request(app.getHttpServer())
      .post('/api/miniapp/learning-records')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'dictionary', contentId: dictionaryId, actionType: 'view' })
      .expect(201);

    const recordsResponse = await request(app.getHttpServer())
      .get('/api/miniapp/learning-records')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(recordsResponse.body.items.length).toBeGreaterThan(0);
    expect(recordsResponse.body.totalPages).toBe(1);
    expect(recordsResponse.body.stats.total).toBeGreaterThan(0);

    const clearFavoritesResponse = await request(app.getHttpServer())
      .delete('/api/miniapp/favorites')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(clearFavoritesResponse.body.success).toBe(true);

    const emptyFavoritesResponse = await request(app.getHttpServer())
      .get('/api/miniapp/favorites')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(emptyFavoritesResponse.body.dictionary).toHaveLength(0);
    expect(emptyFavoritesResponse.body.phrases).toHaveLength(0);
    expect(emptyFavoritesResponse.body.proverbs).toHaveLength(0);
    expect(emptyFavoritesResponse.body.songs).toHaveLength(0);

    const clearRecordsResponse = await request(app.getHttpServer())
      .delete('/api/miniapp/learning-records')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(clearRecordsResponse.body.success).toBe(true);

    const emptyRecordsResponse = await request(app.getHttpServer())
      .get('/api/miniapp/learning-records')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(emptyRecordsResponse.body.items).toHaveLength(0);
    expect(emptyRecordsResponse.body.stats.total).toBe(0);
    expect(emptyRecordsResponse.body.stats.today).toBe(0);
    expect(emptyRecordsResponse.body.stats.streak).toBe(0);

    await request(app.getHttpServer())
      .post('/api/miniapp/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/miniapp/favorites')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/miniapp/auth/refresh')
      .send({ refreshToken: refreshResponse.body.refreshToken })
      .expect(401);
  });

  it('supports excel import and sorts Chinese text by pinyin', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);
    const importKeyword = `\u5bfc\u5165\u6392\u5e8f\u6d4b\u8bd5-${Date.now()}`;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        [excelHeaders.buyiText]: 'alpha',
        [excelHeaders.zhText]: '\u4e0a\u6d77',
        [excelHeaders.enText]: 'Shanghai',
        [excelHeaders.description]: importKeyword,
        [excelHeaders.sortOrder]: 0,
        [excelHeaders.isPublished]: '\u5df2\u53d1\u5e03',
      },
      {
        [excelHeaders.buyiText]: 'beta',
        [excelHeaders.zhText]: '\u5317\u4eac',
        [excelHeaders.enText]: 'Beijing',
        [excelHeaders.description]: importKeyword,
        [excelHeaders.sortOrder]: 0,
        [excelHeaders.isPublished]: '\u5df2\u53d1\u5e03',
      },
      {
        [excelHeaders.buyiText]: 'gamma',
        [excelHeaders.zhText]: '\u5e7f\u5dde',
        [excelHeaders.enText]: 'Guangzhou',
        [excelHeaders.description]: importKeyword,
        [excelHeaders.sortOrder]: 0,
        [excelHeaders.isPublished]: '\u5df2\u53d1\u5e03',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dictionary');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const importResponse = await request(app.getHttpServer())
      .post('/api/admin/dictionary/import')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', buffer, 'dictionary-import.xlsx')
      .expect(201);

    expect(importResponse.body.importedCount).toBe(3);
    expect(importResponse.body.createdCount).toBe(3);
    expect(importResponse.body.updatedCount).toBe(0);

    const listResponse = await request(app.getHttpServer())
      .get('/api/admin/dictionary')
      .query({ keyword: importKeyword })
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    const orderedZh = listResponse.body.items.map((item: { zhText: string }) => item.zhText);
    expect(orderedZh).toEqual(['\u5317\u4eac', '\u5e7f\u5dde', '\u4e0a\u6d77']);
  });

  it('downloads import templates and supports upsert mode', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);
    const importKeyword = `upsert-target-${Date.now()}`;

    await request(app.getHttpServer())
      .get('/api/admin/dictionary/template')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200)
      .expect('Content-Type', /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/)
      .expect('Content-Disposition', /dictionary-import-template\.xlsx/);

    const workbook = XLSX.utils.book_new();
    const firstSheet = XLSX.utils.json_to_sheet([
      {
        [excelHeaders.buyiText]: importKeyword,
        [excelHeaders.zhText]: '\u957f\u6c99',
        [excelHeaders.enText]: 'Changsha old',
        [excelHeaders.description]: '\u5bfc\u5165\u66f4\u65b0\u6d4b\u8bd5',
        [excelHeaders.sortOrder]: 1,
        [excelHeaders.isPublished]: '\u5df2\u53d1\u5e03',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, firstSheet, 'Dictionary');
    const firstBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const createResponse = await request(app.getHttpServer())
      .post('/api/admin/dictionary/import')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('mode', 'upsert')
      .attach('file', firstBuffer, 'dictionary-upsert-create.xlsx')
      .expect(201);

    expect(createResponse.body.createdCount).toBe(1);
    expect(createResponse.body.updatedCount).toBe(0);

    const nextWorkbook = XLSX.utils.book_new();
    const nextSheet = XLSX.utils.json_to_sheet([
      {
        [excelHeaders.buyiText]: importKeyword,
        [excelHeaders.zhText]: '\u957f\u6c99',
        [excelHeaders.enText]: 'Changsha new',
        [excelHeaders.description]: '\u5bfc\u5165\u66f4\u65b0\u6d4b\u8bd5',
        [excelHeaders.sortOrder]: 1,
        [excelHeaders.isPublished]: '\u5df2\u53d1\u5e03',
      },
    ]);
    XLSX.utils.book_append_sheet(nextWorkbook, nextSheet, 'Dictionary');
    const nextBuffer = XLSX.write(nextWorkbook, { type: 'buffer', bookType: 'xlsx' });

    const updateResponse = await request(app.getHttpServer())
      .post('/api/admin/dictionary/import')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('mode', 'upsert')
      .attach('file', nextBuffer, 'dictionary-upsert-update.xlsx')
      .expect(201);

    expect(updateResponse.body.createdCount).toBe(0);
    expect(updateResponse.body.updatedCount).toBe(1);

    const listResponse = await request(app.getHttpServer())
      .get('/api/admin/dictionary')
      .query({ keyword: importKeyword })
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(listResponse.body.total).toBe(1);
    expect(listResponse.body.items[0].enText).toBe('Changsha new');
  });

  it('supports song import preview and english header aliases', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);
    const songKeyword = `song-import-${Date.now()}`;

    await request(app.getHttpServer())
      .get('/api/admin/songs/template')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200)
      .expect('Content-Disposition', /songs-import-template\.xlsx/);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        [songEnglishHeaders.title]: `标题-${songKeyword}`,
        [songEnglishHeaders.artist]: '测试歌手',
        [songEnglishHeaders.buyiText]: 'hau mbou',
        [songEnglishHeaders.zhText]: `中文-${songKeyword}`,
        [songEnglishHeaders.enText]: 'Welcome song',
        [songEnglishHeaders.coverUrl]: 'https://example.com/cover.jpg',
        [songEnglishHeaders.audioUrl]: 'https://example.com/song.mp3',
        [songEnglishHeaders.description]: songKeyword,
        [songEnglishHeaders.sortOrder]: 2,
        [songEnglishHeaders.isPublished]: 'true',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Songs');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const previewResponse = await request(app.getHttpServer())
      .post('/api/admin/songs/import-preview')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('mode', 'upsert')
      .attach('file', buffer, 'songs-preview.xlsx')
      .expect(201);

    expect(previewResponse.body.createdCount).toBe(1);
    expect(previewResponse.body.updatedCount).toBe(0);
    expect(previewResponse.body.rows[0].title).toContain(songKeyword);
    expect(previewResponse.body.summary.created).toBe(1);

    const importResponse = await request(app.getHttpServer())
      .post('/api/admin/songs/import')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('mode', 'upsert')
      .attach('file', buffer, 'songs-import.xlsx')
      .expect(201);

    expect(importResponse.body.createdCount).toBe(1);
    expect(importResponse.body.updatedCount).toBe(0);

    const listResponse = await request(app.getHttpServer())
      .get('/api/admin/songs')
      .query({ keyword: songKeyword })
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(listResponse.body.total).toBe(1);
    expect(listResponse.body.items[0].title).toContain(songKeyword);
    expect(listResponse.body.items[0].artist).toBe('测试歌手');
  });

  it('previews imports and skips duplicates when requested', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);
    const duplicateKey = `preview-target-${Date.now()}`;

    await request(app.getHttpServer())
      .post('/api/admin/dictionary')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({
        buyiText: duplicateKey,
        zhText: '\u6606\u660e',
        enText: 'Kunming',
        description: '\u73b0\u6709\u8bcd\u6761',
        sortOrder: 0,
        isPublished: true,
      })
      .expect(201);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        [excelHeaders.buyiText]: duplicateKey,
        [excelHeaders.zhText]: '\u6606\u660e',
        [excelHeaders.enText]: 'Kunming duplicate',
        [excelHeaders.description]: '\u9884\u89c8\u91cd\u590d\u8df3\u8fc7',
        [excelHeaders.sortOrder]: 0,
        [excelHeaders.isPublished]: '\u5df2\u53d1\u5e03',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dictionary');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const previewResponse = await request(app.getHttpServer())
      .post('/api/admin/dictionary/import-preview')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('mode', 'create')
      .field('skipDuplicates', 'true')
      .attach('file', buffer, 'dictionary-preview.xlsx')
      .expect(201);

    expect(previewResponse.body.importedCount).toBe(0);
    expect(previewResponse.body.skippedCount).toBe(1);
    expect(previewResponse.body.rows[0].status).toBe('skip');

    const importResponse = await request(app.getHttpServer())
      .post('/api/admin/dictionary/import')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('mode', 'create')
      .field('skipDuplicates', 'true')
      .attach('file', buffer, 'dictionary-preview-import.xlsx')
      .expect(201);

    expect(importResponse.body.importedCount).toBe(0);
    expect(importResponse.body.skippedCount).toBe(1);

    const listResponse = await request(app.getHttpServer())
      .get('/api/admin/dictionary')
      .query({ keyword: duplicateKey })
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(listResponse.body.total).toBe(1);
  });

  it('reports missing required columns and fields during import', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);

    const missingColumnWorkbook = XLSX.utils.book_new();
    const missingColumnSheet = XLSX.utils.json_to_sheet([
      {
        [excelHeaders.zhText]: '\u8bcd\u5217\u7f3a\u5931',
        [excelHeaders.enText]: 'column missing',
      },
    ]);
    XLSX.utils.book_append_sheet(missingColumnWorkbook, missingColumnSheet, 'Dictionary');
    const missingColumnBuffer = XLSX.write(missingColumnWorkbook, { type: 'buffer', bookType: 'xlsx' });

    const missingColumnResponse = await request(app.getHttpServer())
      .post('/api/admin/dictionary/import-preview')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', missingColumnBuffer, 'dictionary-missing-column.xlsx')
      .expect(400);

    expect(String(missingColumnResponse.body.message)).toContain('\u5e03\u4f9d\u8bed');

    const missingFieldWorkbook = XLSX.utils.book_new();
    const missingFieldSheet = XLSX.utils.json_to_sheet([
      {
        [excelHeaders.buyiText]: 'row-missing-field',
        [excelHeaders.zhText]: '',
        [excelHeaders.enText]: 'field missing',
      },
    ]);
    XLSX.utils.book_append_sheet(missingFieldWorkbook, missingFieldSheet, 'Dictionary');
    const missingFieldBuffer = XLSX.write(missingFieldWorkbook, { type: 'buffer', bookType: 'xlsx' });

    const missingFieldResponse = await request(app.getHttpServer())
      .post('/api/admin/dictionary/import-preview')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .attach('file', missingFieldBuffer, 'dictionary-missing-field.xlsx')
      .expect(400);

    expect(String(missingFieldResponse.body.message)).toContain('\u4e2d\u6587\u91ca\u4e49');
    expect(String(missingFieldResponse.body.message)).toContain('\u7b2c 2 \u884c');
  });

  it('validates media upload size and mime type', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('kind', 'image')
      .attach('file', Buffer.from('small-image'), {
        filename: 'poster.png',
        contentType: 'image/png',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('kind', 'image')
      .attach('file', Buffer.from('audio-content'), {
        filename: 'voice.mp3',
        contentType: 'audio/mpeg',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .field('kind', 'audio')
      .attach('file', Buffer.alloc(2048, 1), {
        filename: 'large.mp3',
        contentType: 'audio/mpeg',
      })
      .expect(400);
  });
});
