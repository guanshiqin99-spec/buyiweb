<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main id="main" class="not-found">
    <div class="not-found-card liquid-glass">
      <p class="not-found-code">404</p>
      <h1 class="not-found-title">页面未找到</h1>
      <p class="not-found-desc">
        你访问的页面不存在或已被移除，请检查链接或返回首页继续浏览。
      </p>
      <RouterLink class="not-found-link" to="/">返回首页</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
}

.not-found-card {
  max-width: 28rem;
  width: 100%;
  padding: 3rem 2rem;
  border-radius: 20px;
  text-align: center;
}

.not-found-code {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  color: var(--c-brand);
  margin: 0 0 0.75rem;
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--c-text);
}

.not-found-desc {
  margin: 0 0 1.75rem;
  color: var(--c-text-70);
  line-height: 1.7;
}

.not-found-link {
  display: inline-block;
  padding: 0.7rem 1.8rem;
  border-radius: 999px;
  background: var(--c-brand);
  color: var(--c-brand-foreground);
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.not-found-link:hover {
  opacity: 0.85;
}
</style>
