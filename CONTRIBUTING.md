# 贡献指南

> 欢迎为布依族词典项目贡献代码。请阅读本文档了解开发约定与提交流程。
>
> 最后更新：2026-07-21

---

## 一、开发环境

详见 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)。摘要：

- Node.js 20.x LTS
- 后端：NestJS 11 + TypeORM + TypeScript 5.8
- 前端：Vue 3.4 + Vite 5 + Pinia 2
- 数据库：开发用 SQLite，生产用 MySQL 8

---

## 二、分支策略

### 2.1 分支命名

```text
main                  # 生产分支，始终可发布
develop               # 开发主分支，集成最新功能
feature/<name>        # 新功能分支，如 feature/quiz-module
bugfix/<name>         # 缺陷修复分支
hotfix/<name>         # 紧急修复（直接基于 main）
release/<version>     # 发布准备分支
```

### 2.2 工作流

1. 从 `develop` 切出新分支：
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature
   ```
2. 完成开发后提交 PR/MR 到 `develop`
3. 至少一名成员 code review 通过后合并
4. 周期性从 `develop` 合并到 `main` 发布

---

## 三、代码规范

### 3.1 通用约定

- **语言**：所有代码注释、文案、commit message、issue 与 PR 描述使用中文
- **缩进**：2 空格（不使用 Tab）
- **换行**：LF（Unix 风格）
- **文件编码**：UTF-8（无 BOM）
- **文件结尾**：保留一个空行

### 3.2 前端规范

- 优先使用 `<script setup>` + Composition API
- 单文件组件按 `template` → `script` → `style` 顺序组织
- 命名：
  - 组件文件名：PascalCase（如 `AudioPlayer.vue`）
  - JS 文件名：camelCase（如 `agentStream.js`）
  - CSS 类名：kebab-case（如 `liquid-glass`）
  - 常量：UPPER_SNAKE_CASE
- 样式：
  - 使用 CSS 变量令牌，不硬编码颜色值
  - 深色模式通过 `[data-theme="dark"]` 覆盖
  - hover 状态用 `@media (hover: hover)` 限定（避免触屏粘性）
- 无障碍：
  - 交互元素需键盘可达（`role` / `tabindex` / `keydown`）
  - 装饰性 SVG 加 `aria-hidden="true"`
  - 图标按钮加 `aria-label`
  - `<img>` 显式 `width` / `height`
  - below-fold 图片用 `loading="lazy"`
- 动画：
  - 遵循 `prefers-reduced-motion`
  - 仅动画 `transform` / `opacity`

### 3.3 后端规范

- 遵循 NestJS 模块化约定，每个业务域独立目录
- 文件命名：kebab-case（如 `miniapp-auth.controller.ts`）
- 类命名：PascalCase
- DTO 使用 `class-validator` 装饰器声明校验规则
- 实体使用 TypeORM 装饰器，避免业务逻辑混入实体
- 服务层无状态，依赖注入通过构造函数
- 控制器只做参数转发，业务逻辑放在 service

### 3.4 TypeScript 规范

- 启用严格模式（`strict: true`）
- 优先使用 `interface` 而非 `type`，除非需要联合类型
- 避免使用 `any`，必要时使用 `unknown` + 类型守卫
- 公共 API 的请求/响应类型必须显式声明

---

## 四、提交规范

### 4.1 Commit Message 格式

```text
<type>(<scope>): <subject>

<body>

<footer>
```

**type** 取值：

| type | 说明 |
|------|------|
| feat | 新功能 |
| fix | 缺陷修复 |
| docs | 文档变更 |
| style | 代码格式（不影响功能） |
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具/依赖 |
| ci | CI 配置 |
| revert | 回滚提交 |

**scope**：可选，受影响的模块，如 `auth`、`dictionary`、`player`

**示例**：

```text
feat(miniapp-auth): 增加 Web 端账号密码登录

- 新增 /miniapp/auth/web-login 接口
- 支持用户名 + 密码登录
- 自动签发 access token 与 refresh token

Closes #123
```

### 4.2 提交粒度

- 一个提交只做一件事
- 提交前确保通过 lint 与 test
- 避免一个 PR 包含多个不相关功能

---

## 五、Pull Request 流程

### 5.1 提交前检查清单

- [ ] 代码通过 `npm run lint`
- [ ] 单元测试通过 `npm test`
- [ ] 新增功能附带测试用例
- [ ] 不引入新的依赖（除非必要）
- [ ] commit message 符合规范
- [ ] PR 描述清晰，包含变更说明

### 5.2 PR 描述模板

```markdown
## 变更说明

(简述本 PR 解决的问题与方案)

## 变更类型

- [ ] 新功能
- [ ] 缺陷修复
- [ ] 重构
- [ ] 文档
- [ ] 其他

## 测试

- [ ] 已添加单元测试
- [ ] 本地手动测试通过
- [ ] 不影响已有功能

## 关联 Issue

Closes #xxx
```

### 5.3 Code Review 要点

- 业务逻辑是否正确
- 是否符合架构约定
- 是否有性能问题
- 是否处理了边界情况
- 是否考虑了无障碍
- 是否引入安全隐患（SQL 注入、XSS、CSRF 等）

---

## 六、测试要求

详见 [docs/TESTING.md](docs/TESTING.md)。

- **后端**：每个 service 方法至少一个单元测试；复杂业务逻辑需集成测试
- **前端**：utils 中的纯函数必须有测试；store 的 action 推荐测试
- **测试覆盖率**：后端关键模块不低于 70%，前端不低于 50%

---

## 七、版本管理

### 7.1 版本号约定

遵循 [SemVer](https://semver.org/lang/zh-CN/)：

```text
MAJOR.MINOR.PATCH
   1     0     0
```

- MAJOR：不兼容的 API 修改
- MINOR：向后兼容的新功能
- PATCH：向后兼容的缺陷修复

### 7.2 发版流程

1. 从 `develop` 切出 `release/vX.Y.Z` 分支
2. 更新版本号、CHANGELOG.md
3. 提交 PR 到 `main`
4. 合并后打 tag：`git tag vX.Y.Z`
5. 推送 tag 触发自动部署

---

## 八、问题反馈

- **Bug 报告**：使用 GitHub Issue，附复现步骤与环境信息
- **功能建议**：先在 Issue 中讨论方案，确认后再开发
- **安全漏洞**：详见 [SECURITY.md](SECURITY.md)，请勿在公开 Issue 中讨论

---

## 九、行为准则

- 尊重每位贡献者
- 接受建设性批评
- 关注项目目标，避免无谓争论
- 不当行为可联系维护者
