# 测试指南

> 本文档说明项目的测试策略、运行方式与编写规范。
>
> 最后更新：2026-07-21

---

## 一、测试策略

项目采用 **分层测试** 策略，按优先级分为：

| 层级 | 范围 | 工具 | 占比目标 |
|------|------|------|----------|
| 单元测试 | 纯函数、utils、service 方法 | Jest | 70% |
| 集成测试 | 模块协作、数据库读写 | Jest + supertest | 20% |
| 端到端测试 | 完整 API 流程 | supertest | 10% |

测试覆盖率目标：

- **后端关键模块**：不低于 70%
- **前端 utils**：不低于 80%
- **前端 store action**：不低于 50%

---

## 二、后端测试

### 2.1 测试框架

- **Jest 29** + **ts-jest**
- **supertest**：HTTP 集成测试
- **@nestjs/testing**：NestJS 测试工具

配置文件：[`backend/jest.config.js`](../BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/jest.config.js)

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*(\\.spec|\\.e2e-spec)\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
}
```

### 2.2 运行测试

```bash
cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend

# 运行所有测试
npm test

# watch 模式
npm run test:watch

# 带覆盖率
npm test -- --coverage
```

### 2.3 测试文件命名

| 类型 | 后缀 | 位置 |
|------|------|------|
| 单元测试 | `*.spec.ts` | 与源文件同目录 |
| 集成测试 | `*.e2e-spec.ts` | 与源文件同目录 |

示例：

```text
backend/src/modules/miniapp-learning-records/
├── learning-stats.ts
├── learning-stats.spec.ts           # 单元测试
├── miniapp-learning-records.controller.ts
├── miniapp-learning-records.service.ts
└── miniapp-learning-records.module.ts
```

### 2.4 单元测试示例

```typescript
// learning-stats.spec.ts
import { LearningStats } from './learning-stats'

describe('LearningStats', () => {
  let stats: LearningStats

  beforeEach(() => {
    stats = new LearningStats()
  })

  describe('aggregate', () => {
    it('应正确聚合每日学习时长', () => {
      const records = [
        { date: '2026-07-01', duration: 30 },
        { date: '2026-07-01', duration: 20 },
        { date: '2026-07-02', duration: 45 },
      ]
      const result = stats.aggregate(records)
      expect(result).toEqual([
        { date: '2026-07-01', totalDuration: 50 },
        { date: '2026-07-02', totalDuration: 45 },
      ])
    })
  })
})
```

### 2.5 集成测试示例

```typescript
// auth.e2e-spec.ts
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../app.module'

describe('Auth (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('POST /api/admin/auth/login 应返回 token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' })
      .expect(200)

    expect(res.body.accessToken).toBeDefined()
    expect(res.body.refreshToken).toBeDefined()
  })
})
```

---

## 三、前端测试

### 3.1 测试框架

- **Node.js 原生 test runner**（`node:test`）
- 通过 `--import=./tests/setup.mjs` 加载 Vite shim，提供 `import.meta.env`
- 不依赖浏览器环境，纯逻辑测试

### 3.2 运行测试

```bash
cd buyi-dictionary-vue

# 运行所有测试
npm test

# 单独运行某个测试
node --import=./tests/setup.mjs --test tests/player.test.js
```

### 3.3 测试文件结构

现有测试位于 [`buyi-dictionary-vue/tests/`](../buyi-dictionary-vue/tests)：

| 文件 | 测试对象 |
|------|---------|
| `api.test.js` | API 封装（axios 拦截、错误处理） |
| `auth.test.js` | 认证 store（token 持久化、登录流程） |
| `contentTypes.test.js` | 内容类型常量 |
| `navTonePolicy.test.js` | 导航栏背景采样策略（P0 不变量） |
| `playableSongs.test.js` | 可播放歌曲数据 |
| `player.test.js` | 播放器 store（play/seek/expand） |
| `quiz.test.js` | 答题数据与判定 |
| `tones.test.js` | 声调数据 |
| `setup.mjs` | 全局设置（Vite shim） |
| `vite-shims.mjs` | 模拟 Vite 环境 |

### 3.4 测试示例

```javascript
// tests/player.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { usePlayerStore } from '../src/stores/player.js'

test('playSong 应设置当前歌曲并开始播放', () => {
  const store = usePlayerStore()
  const song = { id: 1, title: '测试歌曲', duration: 180 }
  store.playSong(song)
  assert.equal(store.currentSong.id, 1)
  assert.equal(store.isPlaying, true)
})

test('seekTo 应更新当前时间', () => {
  const store = usePlayerStore()
  store.playSong({ id: 1, title: '测试', duration: 180 })
  store.seekTo(60)
  assert.equal(store.currentTime, 60)
})
```

### 3.5 P0 不变量测试

某些行为是 **P0 不变量**，任何修改都不得破坏，详见 [`buyi-dictionary-vue/docs/navigation-contrast-policy.md`](../buyi-dictionary-vue/docs/navigation-contrast-policy.md)。

`tests/navTonePolicy.test.js` 精确校验：

- 三点采样位置：`[0.14, 0.5, 0.86]`
- 通过票数：`2`
- 切换延迟：`96ms`
- 探测线偏移：`8px`

修改这些参数会导致测试失败，并被视为 P0 回归。

---

## 四、测试编写规范

### 4.1 命名

- 测试文件：`<module-name>.spec.ts` 或 `<module-name>.test.js`
- 测试用例：使用中文描述，明确预期行为

```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('正确密码应返回 token', async () => { ... })
    it('错误密码应抛出 UnauthorizedException', async () => { ... })
    it('账号锁定后应拒绝登录', async () => { ... })
  })
})
```

### 4.2 AAA 模式

- **Arrange**：准备测试数据
- **Act**：执行被测代码
- **Assert**：断言结果

```typescript
it('应正确计算总时长', () => {
  // Arrange
  const records = [
    { date: '2026-07-01', duration: 30 },
    { date: '2026-07-02', duration: 45 },
  ]

  // Act
  const total = stats.sumDuration(records)

  // Assert
  expect(total).toBe(75)
})
```

### 4.3 测试隔离

- 每个 `it` 应独立，不依赖其他测试
- 使用 `beforeEach` / `afterEach` 重置状态
- 避免共享可变状态

### 4.4 Mock 原则

- 优先测试真实逻辑，不 mock 一切
- 仅 mock 外部依赖（数据库、HTTP、文件系统）
- Mock 对象应明确反映真实接口

```typescript
const mockRepo = {
  find: async () => [{ id: 1, name: 'test' }],
  save: async (entity) => ({ ...entity, id: 1 }),
}
```

---

## 五、CI 集成

### 5.1 GitHub Actions 示例

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend && npm ci
      - run: cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend && npm test

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd buyi-dictionary-vue && npm ci
      - run: cd buyi-dictionary-vue && npm test
```

### 5.2 提交前钩子（Husky）

可选用 husky + lint-staged 在 commit 前自动检查：

```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

`package.json`：

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 六、性能测试（可选）

使用 [autocannon](https://github.com/mcollina/autocannon) 进行接口压测：

```bash
npm install -g autocannon

# 测试健康检查
autocannon -c 100 -d 10 http://127.0.0.1:3000/api/health

# 测试搜索接口
autocannon -c 50 -d 10 'http://127.0.0.1:3000/api/miniapp/search?q=你好'
```

关键指标：

- **QPS**：每秒请求数
- **P95 延迟**：95% 请求的响应时间
- **错误率**：失败请求比例

---

## 七、测试用例补充建议

项目当前测试覆盖情况：

| 模块 | 已覆盖 | 待补充 |
|------|--------|--------|
| 后端 `learning-stats` | ✅ | — |
| 前端 API 封装 | ✅ | — |
| 前端 auth store | ✅ | — |
| 前端 player store | ✅ | — |
| 前端 navTonePolicy | ✅ | — |
| 后端 miniapp-auth | ❌ | 完整登录流程测试 |
| 后端 content-import | ❌ | Excel 导入边界用例 |
| 后端 media service | ❌ | 上传校验、storage 切换 |
| 后端 favorites toggle | ❌ | 并发收藏冲突 |
| 前端 liquidGlass | ❌ | 视口位置自适应 |
| 前端 agentStream | ❌ | SSE 流式解析 |

详见 [CONTRIBUTING.md](../CONTRIBUTING.md) 的 PR 检查清单。
