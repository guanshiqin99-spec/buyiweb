<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-brand">
        <h3>布依族词典</h3>
        <p>传承布依文化，连接语言之美</p>
      </div>

      <div class="footer-links">
        <div class="footer-section">
          <h4>功能</h4>
          <RouterLink to="/dictionary">词典查询</RouterLink>
          <RouterLink to="/songs">民歌欣赏</RouterLink>
          <RouterLink to="/culture">文化探索</RouterLink>
        </div>

        <div class="footer-section">
          <h4>关于</h4>
          <a href="#">项目介绍</a>
          <a href="#">使用帮助</a>
          <a href="#">联系我们</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 布依族词典 · 少数民族语言数字化保护</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--c-brand-dark);
  color: var(--c-white-78);
  padding: 48px 24px 24px;
  margin-top: auto;
}

.footer-content {
  max-width: 980px;
  margin: 0 auto;
}

.footer-brand {
  margin-bottom: 32px;
}

.footer-brand h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--c-white);
  margin: 0 0 8px 0;
}

.footer-brand p {
  font-size: 14px;
  color: var(--c-white-60);
  margin: 0;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-bottom: 32px;
}

@media (max-width: 640px) {
  .footer-links {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.footer-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-white);
  margin: 0 0 12px 0;
}

.footer-section a {
  display: block;
  font-size: 14px;
  color: var(--c-white-60);
  text-decoration: none;
  padding: 4px 0;
  transition: color 150ms ease;
}

.footer-section a:hover {
  color: var(--c-white);
}

.footer-bottom {
  border-top: 1px solid var(--c-white-15);
  padding-top: 24px;
}

.footer-bottom p {
  font-size: 12px;
  color: var(--c-white-50);
  margin: 0;
  text-align: center;
}
</style>
