<script setup>
import { ref, computed } from 'vue'
import PageShell from '@/components/common/PageShell.vue'
import imgBg from '@/assets/images/bouyei-textile.jpg'

const words = [
  { id: 1, bouyei: 'ndaangl', chinese: '水', english: 'water', phonetic: '/naŋ²⁴/' },
  { id: 2, bouyei: 'mbaanl', chinese: '村', english: 'village', phonetic: '/mbaːn²⁴/' },
  { id: 3, bouyei: 'byaail', chinese: '走', english: 'walk', phonetic: '/pjaːi²⁴/' },
  { id: 4, bouyei: 'ndil', chinese: '好', english: 'good', phonetic: '/ndi²⁴/' },
  { id: 5, bouyei: 'goy', chinese: '我', english: 'I', phonetic: '/kɔi²⁴/' }
]

const currentIndex = ref(0)
const isFlipped = ref(false)
const learnedCount = ref(0)

const currentWord = computed(() => words[currentIndex.value])

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextWord = () => {
  isFlipped.value = false
  currentIndex.value = (currentIndex.value + 1) % words.length
  learnedCount.value++
}
</script>

<template>
  <PageShell
    :bg-image="imgBg"
    title="学习布依语"
    subtitle="点击卡片翻转查看释义，轻松掌握词汇"
    overlay-style="warm"
    pattern-type="weaving"
    :particle-density="8"
  >
    <div class="learn-content">
      <div class="progress liquid-glass glow-card">
        <div class="glow-effect"></div>
        <span>已学习: {{ learnedCount }} 词</span>
        <span>进度: {{ currentIndex + 1 }} / {{ words.length }}</span>
      </div>
      
      <div class="card-container glow-card" @click="flipCard">
        <div class="glow-effect"></div>
        <div class="card" :class="{ flipped: isFlipped }">
          <div class="card-front liquid-glass">
            <span class="phonetic">{{ currentWord.phonetic }}</span>
            <h2 class="word">{{ currentWord.bouyei }}</h2>
            <p class="hint">点击翻转</p>
          </div>
          <div class="card-back">
            <h2>{{ currentWord.chinese }}</h2>
            <p class="english">{{ currentWord.english }}</p>
            <p class="phonetic">{{ currentWord.phonetic }}</p>
          </div>
        </div>
      </div>
      
      <button class="next-btn" @click="nextWord">
        下一个 →
      </button>
    </div>
  </PageShell>
</template>

<style scoped>
.learn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  max-width: 400px;
  margin: 0 auto;
}

.progress {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16px 24px;
  font-size: 14px;
  color: var(--c-text-70);
}

.card-container {
  perspective: 1000px;
  cursor: pointer;
  width: 100%;
}

.card {
  width: 100%;
  height: 300px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1);
}

.card.flipped {
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
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  padding: 32px;
}

.card-front {
  background: var(--c-glass);
  border: 1px solid var(--c-white-50);
}

.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, var(--c-brand-dark), var(--c-brand));
  color: white;
}

.word {
  font-size: 48px;
  font-weight: 700;
  color: var(--c-text);
  margin: 12px 0;
  letter-spacing: -0.02em;
}

.card-back h2 {
  font-size: 40px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.phonetic {
  font-size: 16px;
  color: var(--c-brand-light);
  font-family: var(--font-mono);
}

.card-back .phonetic {
  color: rgba(255,255,255,0.7);
}

.english {
  font-size: 18px;
  color: rgba(255,255,255,0.8);
  margin: 0 0 12px 0;
}

.hint {
  color: var(--c-text-50);
  font-size: 14px;
  margin: 16px 0 0 0;
}

.next-btn {
  padding: 14px 36px;
  background: var(--c-brand);
  color: var(--c-white);
  border: none;
  border-radius: 999px;
  font: 600 16px var(--font-sans);
  cursor: pointer;
  transition: all 200ms ease;
}

.next-btn:hover {
  background: var(--c-brand-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--c-brand-25);
}

.next-btn:active {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none !important;
  }
}
</style>
