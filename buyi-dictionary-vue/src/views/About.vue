<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main id="main" class="about-page">
    <header class="about-hero">
      <p>关于布依族词典</p>
      <h1>让语言资料更容易被查找、聆听与学习</h1>
      <span>这里集中说明项目定位、基本使用方法和反馈渠道。</span>
    </header>

    <div class="about-layout">
      <nav class="about-nav" aria-label="关于页面目录">
        <RouterLink :to="{ hash: '#project' }">项目介绍</RouterLink>
        <RouterLink :to="{ hash: '#help' }">使用帮助</RouterLink>
        <RouterLink :to="{ hash: '#contact' }">联系我们</RouterLink>
      </nav>

      <div class="about-content">
        <section id="project" aria-labelledby="project-title">
          <p class="section-label">项目介绍</p>
          <h2 id="project-title">一部面向日常使用的布依语数字词典</h2>
          <p>布依族词典 Web 版汇集词汇、短语、谚语、民歌与文化资料，支持检索、发音、收藏和学习记录，帮助使用者从一个词继续理解它所在的文化语境。</p>
          <p>项目以少数民族语言数字化保护为出发点，内容以服务端已发布资料为准，并持续完善可检索性与可用性。</p>
        </section>

        <section id="help" aria-labelledby="help-title">
          <p class="section-label">使用帮助</p>
          <h2 id="help-title">从查词开始</h2>
          <ol>
            <li><strong>搜索：</strong>在全站搜索或词典页输入布依语、中文关键词。</li>
            <li><strong>查看与聆听：</strong>选择结果后阅读释义；有音频的词条可直接播放发音。</li>
            <li><strong>收藏与学习：</strong>登录后可收藏词条、加入学习，并在个人中心查看记录。</li>
          </ol>
          <RouterLink class="primary-link" :to="{ path: '/dictionary', query: { focus: '1' } }">现在去查词 <span aria-hidden="true">→</span></RouterLink>
        </section>

        <section id="contact" aria-labelledby="contact-title">
          <p class="section-label">联系我们</p>
          <h2 id="contact-title">反馈问题或内容建议</h2>
          <p>如果你发现词条、发音或页面功能存在问题，可以在项目仓库提交反馈。请尽量附上页面地址、操作步骤和截图，便于快速定位。</p>
          <a class="primary-link" href="https://github.com/guanshiqin99-spec/buyiweb/issues" target="_blank" rel="noopener noreferrer">前往项目反馈页 <span aria-hidden="true">↗</span></a>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  padding: 132px max(24px, calc((100% - 980px) / 2)) 112px;
  color: var(--c-text);
  background: var(--c-bg-warm);
}

.about-hero { max-width: 720px; padding-bottom: 56px; }
.about-hero > p, .section-label { margin: 0; color: var(--c-accent-text); font-size: .75rem; font-weight: 700; }
.about-hero h1 { max-width: 18ch; margin: 12px 0 18px; font: 600 3rem/1.12 var(--font-serif); letter-spacing: -.03em; text-wrap: balance; }
.about-hero > span { display: block; max-width: 55ch; color: var(--c-text-70); font-size: 1rem; line-height: 1.8; }

.about-layout { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 64px; align-items: start; }
.about-nav { position: sticky; top: 92px; display: flex; flex-direction: column; border-top: 1px solid var(--c-divider); }
.about-nav a { padding: 14px 0; border-bottom: 1px solid var(--c-divider); color: var(--c-text-60); font-size: .875rem; font-weight: 600; text-decoration: none; }
.about-nav a:hover { color: var(--c-brand); }
.about-nav a:focus-visible, .primary-link:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 4px; }

.about-content { min-width: 0; }
.about-content section { padding: 0 0 56px; scroll-margin-top: 88px; }
.about-content section + section { padding-top: 56px; border-top: 1px solid var(--c-divider); }
.about-content h2 { margin: 10px 0 18px; font: 600 1.75rem/1.25 var(--font-serif); letter-spacing: -.02em; text-wrap: balance; }
.about-content p, .about-content li { max-width: 65ch; color: var(--c-text-70); line-height: 1.85; }
.about-content ol { display: grid; gap: 10px; padding-left: 1.25rem; }
.about-content strong { color: var(--c-text); }
.primary-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; color: var(--c-brand); font-weight: 700; text-decoration: none; }
.primary-link:hover { color: var(--c-brand-dark); }

@media (max-width: 720px) {
  .about-page { padding-top: 104px; }
  .about-hero h1 { font-size: 2.25rem; }
  .about-layout { grid-template-columns: 1fr; gap: 40px; }
  .about-nav { position: static; flex-direction: row; flex-wrap: wrap; gap: 8px 20px; border-top: 0; }
  .about-nav a { border-bottom: 0; }
}
</style>
