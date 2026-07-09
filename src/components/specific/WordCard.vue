<script setup>
defineProps({
  word: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

defineEmits(['play', 'favorite', 'click'])
</script>

<template>
  <div class="word-card liquid-glass" @click="('click', word)">
    <div class="card-header">
      <span class="word-type">{{ word.type || '词汇' }}</span>
      <div class="card-actions" v-if="showActions">
        <button class="action-btn" @click.stop="('play', word)" aria-label="播放发音">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
        <button class="action-btn" @click.stop="('favorite', word)" aria-label="收藏">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="word-bouyei">{{ word.bouyei }}</h3>
      <p class="word-phonetic" v-if="word.phonetic">{{ word.phonetic }}</p>
      <p class="word-chinese">
        {{ word.chinese }}
        <span class="word-english" v-if="word.english">· {{ word.english }}</span>
      </p>
    </div>
    
    <div class="card-footer" v-if="word.example">
      <p class="word-example">{{ word.example }}</p>
    </div>
  </div>
</template>

<style scoped>
.word-card {
  padding: 20px;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.32, 0.72, 0, 1);
}

.word-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px var(--c-shadow-soft);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.word-type {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-white);
  background: var(--c-brand);
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--c-text-50);
  cursor: pointer;
  transition: all 150ms ease;
}

.action-btn:hover {
  background: var(--c-brand-08);
  color: var(--c-brand);
}

.card-content {
  margin-bottom: 12px;
}

.word-bouyei {
  font-size: 24px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 4px 0;
}

.word-phonetic {
  font-size: 14px;
  color: var(--c-brand-light);
  font-family: var(--font-mono);
  margin: 0 0 8px 0;
}

.word-chinese {
  font-size: 16px;
  color: var(--c-text-85);
  margin: 0;
}

.word-english {
  color: var(--c-text-60);
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid var(--c-divider);
}

.word-example {
  font-size: 13px;
  color: var(--c-text-60);
  margin: 0;
  font-style: italic;
  line-height: 1.5;
}
</style>
