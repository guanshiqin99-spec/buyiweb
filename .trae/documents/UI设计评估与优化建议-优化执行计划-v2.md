# UI 设计评估与优化建议 — 优化执行计划 v2

## 1. 摘要

本计划针对 `D:\BuyiDictionaryWeb\buyi-dictionary-vue\UI设计评估与优化建议.md` 中提出的方向，使用 **web-design-guidelines**、**algorithmic-art**、**frontend-skill** 三个技能，对 buyi-dictionary-vue 前端进行最后一轮收束式优化。

目标：
1. 完成液体玻璃材质语义化（Hero / Content / Quiet）在所有页面的落地。
2. 完成页面背景与动效降噪。
3. 统一导航与组件形态。
4. 修复 Web Interface Guidelines 剩余合规问题。
5. 按实际落地结果重写一版优化后的 `UI设计评估与优化建议-已落地.md`。

范围限定在 `buyi-dictionary-vue/src/**/*`，不引入新依赖，不推翻现有架构。

## 2. 当前状态分析

### 2.1 已完成的优化（已落文件确认）

- **液体玻璃材质层级已建立**：`src/assets/styles/liquid-glass.css` 已定义 `.liquid-glass-hero`、`.liquid-glass-content`、`.liquid-glass-quiet`，并降低了默认高光、阴影与 hover 浮起幅度。
- **首页关键区域已降噪**：`src/views/Home.vue` 中 Hero 粒子数降至 8，统计卡改为 `.liquid-glass-quiet`，学习面板改为 `.liquid-glass-content`，文化卡移除 `.glow-card`。
- **页面壳层已降噪**：`src/components/common/PageShell.vue` 默认粒子密度降至 6，视差系数 0.15，渐变透明度简化，内容 stagger 延迟收敛到 0.2–0.6s。
- **粒子与光标光晕已降噪**：`src/components/common/FloatingParticles.vue` 透明度与移动端数量降低；`src/components/common/CursorGlow.vue` 光晕透明度降低。
- **交互性能优化**：`src/utils/liquidGlass.js` 增加 `RECT_TTL` 缓存，降低