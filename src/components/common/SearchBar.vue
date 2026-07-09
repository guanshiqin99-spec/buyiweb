<script setup>
import { ref } from 'vue'

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
  <div class="search-bar liquid-glass search-glow">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="flex-shrink: 0; color: var(--c-brand-light);"
    >
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>

    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <button class="search-btn" @click="handleSearch">
      搜索
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
  padding: 0 8px 0 24px;
  border: 1px solid var(--c-brand);
  border-radius: 999px;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--c-text);
  font: 400 16px var(--font-sans);
  padding: 0 16px;
  outline: none;
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
  transition: color 150ms ease;
}

.clear-btn:hover {
  color: var(--c-text);
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
  color: var(--c-white);
  font: 600 14px var(--font-sans);
  cursor: pointer;
  transition: filter 150ms ease;
}

.search-btn:hover {
  filter: brightness(1.1);
}
</style>
