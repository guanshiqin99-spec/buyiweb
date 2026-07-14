<script setup>
import { ref } from 'vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconSearch from '@/components/icons/IconSearch.vue'

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

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleSearch = () => {
  emit('search', props.modelValue)
}

const handleClear = () => {
  emit('update:modelValue', '')
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
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
      @input="handleInput"
      @keydown="handleKeydown"
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
</template>

<style scoped>
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

.search-bar input:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
  border-radius: 4px;
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

@media (max-width: 420px) {
  .search-bar { height: 52px; padding-left: 16px; }
  .search-bar input { padding: 0 10px; font-size: 15px; }
  .search-btn { padding: 0 16px; }
}
</style>
