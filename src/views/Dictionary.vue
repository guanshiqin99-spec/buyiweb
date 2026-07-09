<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import SearchBar from '@/components/common/SearchBar.vue'

const route = useRoute()
const searchQuery = ref(route.query.q || '')
const activeFilter = ref('all')

const filters = [
  { key: 'all', label: '全部' },
  { key: 'word', label: '词汇' },
  { key: 'phrase', label: '短语' },
  { key: 'proverb', label: '谚语' }
]

const mockResults = [
  { id: 1, type: 'word', bouyei: 'ndaangl', phonetic: '/naŋ²⁴/', chinese: '水', english: 'water', example: 'Ndaangl ndil. 水很好。' },
  { id: 2, type: 'word', bouyei: 'mbaanl', phonetic: '/mbaːn²⁴/', chinese: '村', english: 'village', example: 'Mbaanl ndil. 村子很好。' },
  { id: 3, type: 'phrase', bouyei: 'Goy miz ndil?', chinese: '你好吗？', english: 'How are you?' },
  { id: 4, type: 'proverb', bouyei: 'Ndaangl miz byaaic miz dog.', chinese: '水不流不腐。', english: 'Water that does not flow becomes stagnant.' }
]

const filteredResults = computed(() => {
  let results = mockResults
  if (searchQuery.value) {
    results = results.filter(item =>
      item.bouyei.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.chinese.includes(searchQuery.value) ||
      (item.english && item.english.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  if (activeFilter.value !== 'all') {
    results = results.filter(item => item.type === activeFilter.value)
  }
  return results
})

const getTypeLabel = (type) => {
  const labels = { word: '词汇', phrase: '短语', proverb: '谚语' }
  return labels[type] || type
}

watch(() => route.query.q, (newQuery) => {
  if (newQuery) searchQuery.value = newQuery
})
</script>

<template>
  <div class="dictionary-page">
    <!-- 背景层 -->
    <div class="background-layer"></div>
    <div class="overlay-layer"></div>

    <main id="main" style="padding-top: 80px; padding-bottom: 120px;">
      <h1 class="sr-only">词典搜索</h1>

      <!-- 搜索区域 -->
      <section class="search-section">
        <div class="search-wrapper">
          <SearchBar
            v-model="searchQuery"
            placeholder="搜索布依语词汇、短语、谚语…"
          />

          <div class="search-meta">
            <div class="filter-pills liquid-glass">
              <button
                v-for="filter in filters"
                :key="filter.key"
                class="filter-btn"
                :class="{ active: activeFilter === filter.key }"
                :aria-pressed="activeFilter === filter.key"
                @click="activeFilter = filter.key"
              >
                {{ filter.label }}
              </button>
            </div>
            <p class="result-count">{{ filteredResults.length }} 个结果</p>
          </div>
        </div>
      </section>

      <!-- 搜索结果 -->
      <section class="results-section">
        <div class="results-wrapper liquid-glass">
          <article
            v-for="result in filteredResults"
            :key="result.id"
            class="result-item"
          >
            <div class="result-content">
              <span :class="['result-type', 'type-' + result.type]">
                {{ getTypeLabel(result.type) }}
              </span>
              <h3 class="result-bouyei">{{ result.bouyei }}</h3>
              <p v-if="result.phonetic" class="result-phonetic">{{ result.phonetic }}</p>
              <p class="result-chinese">
                {{ result.chinese }}
                <span v-if="result.english" class="result-english">· {{ result.english }}</span>
              </p>
              <p v-if="result.example" class="result-example">{{ result.example }}</p>
            </div>
            <div class="result-actions">
              <button class="action-btn" aria-label="播放发音">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </button>
              <button class="action-btn" aria-label="收藏">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dictionary-page {
  min-height: 100vh;
  position: relative;
}

/* 蜡染几何纹样背景 */
.background-layer {
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    repeating-linear-gradient(45deg, transparent 0, transparent 28px, rgba(27,58,92,0.05) 28px, rgba(27,58,92,0.05) 29px),
    repeating-linear-gradient(-45deg, transparent 0, transparent 28px, rgba(27,58,92,0.05) 28px, rgba(27,58,92,0.05) 29px),
    repeating-linear-gradient(45deg, transparent 0, transparent 14px, rgba(27,58,92,0.02) 14px, rgba(27,58,92,0.02) 15px),
    repeating-linear-gradient(-45deg, transparent 0, transparent 14px, rgba(27,58,92,0.02) 14px, rgba(27,58,92,0.02) 15px),
    radial-gradient(circle at 20% 80%, var(--c-brand-06) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, var(--c-accent-04) 0%, transparent 50%),
    linear-gradient(160deg, var(--c-bg-warm), var(--c-bg-silver));
}

.overlay-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: var(--c-overlay);
}

.search-section {
  padding: 24px 24px 32px;
  display: flex;
  justify-content: center;
}

.search-wrapper {
  width: 100%;
  max-width: 640px;
}

.search-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-pills {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 999px;
}

.filter-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--c-text-60);
  font: 500 13px var(--font-sans);
  cursor: pointer;
  transition: all 150ms ease;
}

.filter-btn:hover {
  color: var(--c-text);
}

.filter-btn.active {
  background: var(--c-brand);
  color: var(--c-white);
}

.result-count {
  font-size: 13px;
  color: var(--c-text-50);
  margin: 0;
}

.results-section {
  padding: 0 24px;
  display: flex;
  justify-content: center;
}

.results-wrapper {
  width: 100%;
  max-width: 640px;
  padding: 8px 0;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 20px 28px;
  gap: 16px;
  border-bottom: 1px solid var(--c-divider);
}

.result-item:last-child {
  border-bottom: none;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-type {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font: 600 11px var(--font-sans);
  letter-spacing: 0.02em;
  margin-bottom: 10px;
}

.type-word {
  background: var(--c-brand);
  color: var(--c-white);
}

.type-phrase {
  background: var(--c-accent);
  color: var(--c-white);
}

.type-proverb {
  background: var(--c-brand-light);
  color: var(--c-white);
}

.result-bouyei {
  font-size: 22px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 4px 0;
}

.result-phonetic {
  font-size: 13px;
  color: var(--c-brand-light);
  margin: 0 0 6px 0;
  font-family: var(--font-mono);
}

.result-chinese {
  font-size: 15px;
  color: var(--c-text-85);
  margin: 0;
}

.result-english {
  color: var(--c-text-60);
}

.result-example {
  font-size: 13px;
  color: var(--c-text-60);
  margin: 8px 0 0 0;
  font-style: italic;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--c-text-60);
  cursor: pointer;
  transition: all 150ms ease;
}

.action-btn:hover {
  background: var(--c-brand-08);
  color: var(--c-brand);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
