# 布依族词典 Web 版 - 必读文档

> **最后更新**: 2026-07-09  
> **版本**: v2.0

---

## ⚠️ 重要：文件编码规范

### 问题说明

本项目所有 HTML 和 CSS 文件必须使用 **UTF-8 编码** 保存。如果使用错误编码（如 GBK、ANSI）会导致：
- 中文全部变成乱码
- 页面白屏或显示异常
- CSS 变量无法正确解析

### 正确的文件保存方式

#### VS Code
1. 右下角点击编码显示区域
2. 选择 "Reopen with Encoding" → "UTF-8"
3. 保存文件

#### PowerShell 写入文件
```powershell
$content = "中文内容"
[System.IO.File]::WriteAllText("路径\文件.html", $content, [System.Text.Encoding]::UTF8)
```

#### 检查文件编码
```powershell
$bytes = [System.IO.File]::ReadAllBytes("路径\文件.html")
# UTF-8 BOM: EF BB BF
# UTF-8 无 BOM: 直接是内容字节
```

---

## 项目结构

```
buyi-dictionary-web-draft/
├── assets/                    # 图片资源
│   ├── bouyei-nature.jpg      # Hero 背景图
│   ├── bouyei-landscape.jpg   # 景观图
│   ├── bouyei-craft.jpg       # 工艺图
│   ├── bouyei-textile.jpg     # 织锦图
│   └── ...                    # 其他页面背景
├── pages/                     # 页面文件
│   ├── home.html              # 首页
│   ├── vocabulary.html        # 词典查询
│   ├── phrases.html           # 常用短语
│   ├── proverbs.html          # 智慧谚语
│   ├── songs.html             # 传统民歌
│   ├── culture.html           # 文化探索
│   ├── search.html            # 搜索结果
│   ├── favorites.html         # 收藏夹
│   ├── profile.html           # 个人中心
│   ├── player.html            # 播放器详情
│   ├── record.html            # 学习记录
│   └── settings.html          # 设置页面
├── liquid-glass.css           # 共享设计系统
└── README.md                  # 本文件
```

---

## 设计系统

### 色彩变量

| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--c-brand` | #3A6B8C | 主色（蜡染靛蓝） |
| `--c-accent` | #D4883A | 强调色（织锦暖橙） |
| `--c-text` | #1B3A5C | 正文文字 |
| `--c-bg-warm` | #F5F2EF | 暖白背景 |
| `--c-glass` | rgba(255,255,255,0.45) | Liquid Glass 面板 |

### Liquid Glass 组件

```html
<!-- 面板 -->
<div class="liquid-glass">内容</div>

<!-- 导航栏 -->
<nav class="liquid-glass-nav">导航内容</nav>

<!-- 搜索框聚焦发光 -->
<div class="search-glow">搜索框</div>

<!-- 标题呼吸效果 -->
<h1 class="title-breath">标题</h1>
```

### 动效类名

| 类名 | 效果 |
|------|------|
| `reveal` | 入场 fadeUp 动画 |
| `reveal-1` ~ `reveal-6` | 延迟入场 |
| `img-reveal` | 图片揭幕动画 |
| `eq-bar` | 均衡器动画条 |
| `glow-card` | 鼠标光效跟随 |

---

## 响应式断点

| 断点 | 宽度 | 变化 |
|------|------|------|
| 移动端 | < 640px | 汉堡菜单、单列卡片 |
| 平板 | 640-900px | 显示导航、2列卡片 |
| 桌面 | > 900px | 完整导航、4列卡片 |

---

## 无障碍支持

- 焦点环: `focus-visible` 2px 靛蓝边框
- Skip Link: 页面顶部跳转链接
- 减少动效: `prefers-reduced-motion` 自动禁用动画
- ARIA 标签: 所有交互元素均有 aria-label

---

## 页面间导航

```html
<!-- 首页 → 词典 -->
<a href="vocabulary.html">词典查询</a>

<!-- 词典 → 首页 -->
<a href="home.html">返回首页</a>

<!-- 跳转带参数 -->
<a href="search.html?q=布依">搜索</a>
```

---

## 常见问题

### Q: 页面白屏？
A: 检查文件编码是否为 UTF-8，检查 CSS 引用路径是否正确

### Q: 样式不生效？
A: 确认 `liquid-glass.css` 路径正确，检查浏览器控制台是否有 404 错误

### Q: 动画不流畅？
A: 检查是否启用了 `prefers-reduced-motion`，或浏览器硬件加速是否开启

---

**维护者**: MiMo AI助手  
**联系方式**: 通过 GitHub Issues 反馈