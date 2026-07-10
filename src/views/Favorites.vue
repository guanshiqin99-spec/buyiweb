<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import PageShell from '@/components/common/PageShell.vue'
import { useFavoritesStore } from '@/stores/favorites'
import imgBg from '@/assets/images/bg-vocabulary.jpg'

const favoritesStore = useFavoritesStore()
const favorites = ref([])
const isLoading = ref(true)

const typeLabels = {
  dictionary: '词汇',
  phrase: '短语',
  proverb: '谚语',
  song: '民歌'
}

const typePaths = {
  dictionary: '/dictionary',
  phrase: '/dictionary',
  proverb: '/dictionary',
  song: '/songs'
}

onMounted(async () => {
  try {
    await favoritesStore.fetchFavorites()
    favorites.value = favoritesStore.favorites
  } catch (e) {
    console.error('加载收藏失败', e)
  } finally {
    isLoading.value = false
  }
})

async function removeFavorite(item) {
  if (!window.confirm('确定取消收藏吗？')) return
  try {
    await favoritesStore.toggleFavorite(item.contentType, item.contentId)
    favorites.value = favoritesStore.favorites
  } catch (e) {
    console.error('取消收藏失败', e)
  }
}
</script>

<template>
  <PageShell
    :bg-image="imgBg"
    title="我的收藏"
    subtitle="珍藏的布依语词汇与文化内容"
    overlay-style="warm"
    pattern-type="batik"
    :particle-density="8"
  >
    <div class="favorites-content">
      <section class="fav-summary liquid-glass glow-card">
        <div class="glow-effect"></div>
        <p class="summary-count">{{ favorites.length }}</p>
        <p class="summary-label">个收藏内容</p>
      </section>

      <section v-if="isLoading" class="fav-loading" aria-live="polite">
        <p>加载中…</p>
      </section>

      <section v-else-if="favorites.length === 0" class="fav-empty liquid-glass">
        <p class="empty-icon" aria-hidden="true">♡</p>
        <p class="empty-text">还没有收藏内容</p>
        <p class="empty-hint">在词典和民歌中点击收藏按钮，内容会出现在这里</p>
        <RouterLink to="/dictionary" class="cta-pill-outline">去词典探索</RouterLink>
      </section>

      <section v-else class="fav-list">
        <article
          v-for="item in favorites"
          :key="`${item.contentType}-${item.contentId}`"
          class="fav-item liquid-glass"
        >
          <RouterLink class="fav-item-body" :to="typePaths[item.contentType] || '/dictionary'">
            <span class="fav-type-tag">{{ typeLabels[item.contentType] || '内容' }}</span>
            <div class="fav-item-info">
              <p class="fav-item-title">{{ item.title || item.buyiText || item.zhText || `#${item.contentId}` }}</p>
              <p v-if="item.subtitle || item.chinese" class="fav-item-sub">{{ item.subtitle || item.chinese }}</p>
            </div>
          </RouterLink>
          <button
            class="fav-remove-btn"
            type="button"
            aria-label="取消收藏"
            @click="removeFavorite(item)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
            </svg>
          </button>
        </article>
      </section>
    </div>
  </PageShell>
</template>

<style scoped>
.favorites-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.fav-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
}

.summary-count {
  font-family: var(--font-serif);
  font-size: 48px;
  font-weight: 700;
  color: var(--c-brand);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.summary-label {
  font-size: 14px;
  color: var(--c-text-60);
  margin: 4px 0 0 0;
}

.fav-loading {
  text-align: center;
  padding: 48px 24px;
  color: var(--c-text-50);
}

.fav-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
  color: var(--c-text-35);
  margin: 0;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  margin: 8px 0 0 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--c-text-60);
  margin: 0 0 16px 0;
  max-width: 320px;
}

.cta-pill-outline {
  padding: 10px 24px;
  border: 1px solid var(--c-brand-25);
  border-radius: 999px;
  background: transparent;
  color: var(--c-brand);
  font: 500 14px var(--font-sans);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}

.cta-pill-outline:hover {
  background: var(--c-brand-08);
  border-color: var(--c-brand-40);
}

.fav-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fav-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
}

.fav-item-body {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px;
  margin-left: -4px;
  outline: none;
  text-decoration: none;
  color: inherit;
}

.fav-item-body:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
}

.fav-type-tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-white);
  background: var(--c-brand);
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.fav-item-info {
  min-width: 0;
  flex: 1;
}

.fav-item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-item-sub {
  font-size: 13px;
  color: var(--c-text-60);
  margin: 2px 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-remove-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--c-accent);
  cursor: pointer;
  transition: background 150ms ease;
}

.fav-remove-btn:hover {
  background: var(--c-accent-10);
}

.fav-remove-btn:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
}
</style>
