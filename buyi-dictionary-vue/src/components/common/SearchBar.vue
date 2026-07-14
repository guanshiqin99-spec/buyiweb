<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import { searchApi } from '@/utils/api'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索布依语词汇…'
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const suggestions = ref([])
const isSuggestionsLoading = ref(false)
const isInputFocused = ref(false)
const activeIndex = ref(-1)
let debounceTimer = null
let requestId = 0

const hasSuggestions = computed(() => suggestions.value.length > 0)
const showSuggestions = computed(() => isInputFocused.value && (hasSuggestions.value || isSuggestionsLoading.value))

function flattenSuggestions(payload) {
  const groups = [payload?.dictionary, payload?.phrases, payload?.proverbs]
  return groups.flatMap((items) => Array.isArray(items) ? items : []).slice(0, 8)
}

watch(() => props.modelValue, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  activeIndex.value = -1

  const keyword = String(value || '').trim()
  const id = ++requestId
  if (!keyword) {
    suggestions.value = []
    isSuggestionsLoading.value = false
    return
  }

  debounceTimer = window.setTimeout(async () => {
    isSuggestionsLoading.value = true
    try {
      const payload = await searchApi.suggest(keyword)
      if (id !== requestId) return
      suggestions.value = flattenSuggestions(payload)
    } catch {
      if (id !== requestId) return
      suggestions.value = []
    } finally {
      if (id === requestId) isSuggestionsLoading.value = false
    }
  }, 300)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleSearch = () => {
  emit('search', props.modelValue)
}

const handleClear = () => {
  emit('update:modelValue', '')
}

const selectSuggestion = (item) => {
  const keyword = item.zhText || item.buyiText || item.title || props.modelValue
  emit('update:modelValue', keyword)
  suggestions.value = []
  activeIndex.value = -1
  emit('search', keyword)
}

const handleKeydown = (e) => {
  if (e.key === 'ArrowDown' && hasSuggestions.value) {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % suggestions.value.length
    return
  }
  if (e.key === 'ArrowUp' && hasSuggestions.value) {
    e.preventDefault()
    activeIndex.value = activeIndex.value <= 0 ? suggestions.value.length - 1 : activeIndex.value - 1
    return
  }
  if (e.key === 'Enter') {
    if (activeIndex.value >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions.value[activeIndex.value])
      return
    }
    handleSearch()
  }
  if (e.key === 'Escape') {
    suggestions.value = []
    activeIndex.value = -1
  }
}
</script>

<template>
  <div class="search-bar-wrapper">
    <div class="search-bar liquid-glass-content search-glow">
      <IconSearch :size="20" color="var(--c-brand)" style="flex-shrink: 0;" />

      <input
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        name="q"
        autocomplete="off"
        spellcheck="false"
        aria-label="搜索布依语词汇"
        aria-autocomplete="list"
        aria-controls="dictionary-search-suggestions"
        :aria-expanded="showSuggestions"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="isInputFocused = true"
        @blur="isInputFocused = false"
      />

      <button
        v-if="modelValue"
        class="clear-btn"
        aria-label="清除"
        @click="handleClear"
      >
        <IconClose :size="16" />
      </button>

      <button v-pointer-glow="{ tone: 'brand', size: 'md' }" class="search-btn" @click="handleSearch">
        搜索
      </button>
    </div>

    <div
      v-if="showSuggestions"
      id="dictionary-search-suggestions"
      class="search-suggestions"
      role="listbox"
      aria-label="搜索建议"
    >
      <p v-if="isSuggestionsLoading" class="search-suggestions__state" aria-live="polite">正在获取建议…</p>
      <template v-else>
        <button
          v-for="(item, index) in suggestions"
          :key="`${item.type || 'content'}-${item.id || index}`"
          type="button"
          class="search-suggestions__item"
          :class="{ 'is-active': activeIndex === index }"
          role="option"
          :aria-selected="activeIndex === index"
          @mousedown.prevent="selectSuggestion(item)"
          @mouseenter="activeIndex = index"
        >
          <strong>{{ item.buyiText || item.title || item.zhText }}</strong>
          <span>{{ item.zhText || item.description || '' }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.search-bar-wrapper {
  position: relative;
  width: 100%;
  z-index: 2;
}

.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  height: 56px;
  padding: 0 8px 0 24px;
  border: 1px solid var(--c-brand);
  border-radius: 999px;
  box-sizing: border-box;
}

.search-bar input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--c-text);
  font: 400 16px var(--font-sans);
  padding: 0 16px;
  outline: none;
}

/* 聚焦反馈由外层 .search-glow 的青色光环统一承担，input 内不再画焦点环，避免出现黄色描边 */
.search-bar input:focus-visible {
  outline: none;
}

/* 覆盖浏览器自动填充的默认黄色背景，保持搜索框玻璃质感 */
.search-bar input:-webkit-autofill,
.search-bar input:-webkit-autofill:hover,
.search-bar input:-webkit-autofill:focus,
.search-bar input:-webkit-autofill:active {
  -webkit-text-fill-color: var(--c-text);
  -webkit-box-shadow: 0 0 0 1000px transparent inset;
  transition: background-color 9999s ease-in-out 0s;
}

.search-bar input::placeholder {
  color: var(--c-text-50);
}

.clear-btn {
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
  flex: 0 0 40px;
  transition: color 150ms ease;
}

.clear-btn:hover {
  color: var(--c-text);
}

.clear-btn:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
  background: var(--c-brand);
  color: var(--c-brand-foreground);
  font: 600 14px var(--font-sans);
  cursor: pointer;
  flex: 0 0 auto;
  transition: filter 150ms ease;
}

.search-btn:hover {
  filter: brightness(1.1);
}

.search-btn:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.search-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 3;
  overflow: hidden;
  border: 1px solid var(--c-divider);
  border-radius: 16px;
  background: var(--background);
  box-shadow: var(--shadow-lg);
}

.search-suggestions__state {
  margin: 0;
  padding: 14px 20px;
  color: var(--c-text-60);
  font-size: .875rem;
}

.search-suggestions__item {
  display: grid;
  width: 100%;
  gap: 3px;
  padding: 12px 20px;
  border: 0;
  border-bottom: 1px solid var(--c-divider);
  background: transparent;
  color: var(--c-text);
  cursor: pointer;
  text-align: left;
}

.search-suggestions__item:last-child { border-bottom: 0; }
.search-suggestions__item:hover,
.search-suggestions__item.is-active { background: var(--c-brand-08); }
.search-suggestions__item strong { font-size: .9375rem; font-weight: 600; }
.search-suggestions__item span { overflow: hidden; color: var(--c-text-60); font-size: .8125rem; text-overflow: ellipsis; white-space: nowrap; }
.search-suggestions__item:focus-visible { outline: 2px solid var(--c-focus); outline-offset: -2px; }

@media (max-width: 420px) {
  .search-bar { height: 52px; padding-left: 16px; }
  .search-bar input { padding: 0 10px; font-size: 15px; }
  .search-btn { padding: 0 16px; }
}
</style>
