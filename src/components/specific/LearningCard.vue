<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  word: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['play', 'favorite', 'next'])

const isFlipped = ref(false)
const isFavorite = ref(false)

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const handlePlay = (event) => {
  event.stopPropagation()
  emit('play', props.word)
}

const handleFavorite = (event) => {
  event.stopPropagation()
  isFavorite.value = !isFavorite.value
  emit('favorite', { ...props.word, isFavorite: isFavorite.value })
}

const handleNext = () => {
  isFlipped.value = false
  emit('next')
}
</script>

<template>
  <div class="learning-card" :class="{ flipped: isFlipped }" @click="flipCard">
    <div class="card-inner">
      <!-- 正面 -->
      <div class="card-front liquid-glass">
        <div class="card-header">
          <span class="card-type">{{ word.type || '词汇' }}</span>
          <div class="card-actions">
            <button class="action-btn" @click="handlePlay" aria-label="播放发音">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
            <button 
              class="action-btn" 
              :class="{ active: isFavorite }"
              @click="handleFavorite" 
              aria-label="收藏"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="card-content">
          <h2 class="word-bouyei">{{ word.bouyei }}</h2>
          <p class="word-phonetic" v-if="word.phonetic">{{ word.phonetic }}</p>
        </div>
        
        <div class="card-footer">
          <p class="flip-hint">点击翻转查看释义</p>
        </div>
      </div>
      
      <!-- 背面 -->
      <div class="card-back liquid-glass">
        <div class="card-header">
          <span class="card-type">{{ word.type || '词汇' }}</span>
        </div>
        
        <div class="card-content">
          <h3 class="word-chinese">{{ word.chinese }}</h3>
          <p class="word-english" v-if="word.english">{{ word.english }}</p>
          
          <div class="word-example" v-if="word.example">
            <p class="example-label">例句</p>
            <p class="example-text">{{ word.example }}</p>
          </div>
        </div>
        
        <div class="card-footer">
          <button class="next-btn" @click.stop="handleNext">
            下一个
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.learning-card {
  perspective: 1000px;
  width: 100%;
  max-width: 400px;
  height: 300px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1);
  transform-style: preserve-3d;
}

.learning-card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.card-back {
  transform: rotateY(180deg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-type {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-white);
  background: var(--c-brand);
  padding: 4px 12px;
  border-radius: 999px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
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

.action-btn.active {
  color: var(--c-accent);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.word-bouyei {
  font-size: 36px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 8px 0;
}

.word-phonetic {
  font-size: 16px;
  color: var(--c-brand-light);
  font-family: var(--font-mono);
  margin: 0;
}

.word-chinese {
  font-size: 28px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 8px 0;
}

.word-english {
  font-size: 16px;
  color: var(--c-text-60);
  margin: 0 0 16px 0;
}

.word-example {
  width: 100%;
  padding: 12px;
  background: var(--c-brand-06);
  border-radius: 8px;
  margin-top: 8px;
}

.example-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-60);
  margin: 0 0 4px 0;
}

.example-text {
  font-size: 14px;
  color: var(--c-text);
  margin: 0;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: center;
}

.flip-hint {
  font-size: 12px;
  color: var(--c-text-50);
  margin: 0;
}

.next-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: var(--c-brand);
  color: var(--c-white);
  font: 600 14px var(--font-sans);
  cursor: pointer;
  transition: all 150ms ease;
}

.next-btn:hover {
  background: var(--c-brand-dark);
  transform: translateX(4px);
}
</style>
