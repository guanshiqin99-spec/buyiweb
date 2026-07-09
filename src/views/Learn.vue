<script setup>
import { ref, computed } from 'vue'

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
  <div class="learn-page">
    <h1>学习布依语</h1>
    <p class="subtitle">点击卡片翻转查看释义</p>
    
    <div class="progress">
      <span>已学习: {{ learnedCount }} 词</span>
      <span>进度: {{ currentIndex + 1 }} / {{ words.length }}</span>
    </div>
    
    <div class="card-container" @click="flipCard">
      <div class="card" :class="{ flipped: isFlipped }">
        <div class="card-front">
          <span class="phonetic">{{ currentWord.phonetic }}</span>
          <h2>{{ currentWord.bouyei }}</h2>
          <p class="hint">点击翻转</p>
        </div>
        <div class="card-back">
          <h2>{{ currentWord.chinese }}</h2>
          <p>{{ currentWord.english }}</p>
          <p class="phonetic">{{ currentWord.phonetic }}</p>
        </div>
      </div>
    </div>
    
    <button class="next-btn" @click="nextWord">
      下一个 →
    </button>
  </div>
</template>

<style scoped>
.learn-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  color: #1B3A5C;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  color: #3A6B8C;
  font-size: 14px;
}

.card-container {
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: 30px;
}

.card {
  width: 100%;
  height: 300px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
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
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.card-back {
  transform: rotateY(180deg);
  background: #3A6B8C;
  color: white;
}

.card-front h2 {
  font-size: 48px;
  color: #1B3A5C;
  margin: 10px 0;
}

.card-back h2 {
  font-size: 40px;
  margin: 10px 0;
}

.phonetic {
  font-size: 18px;
  color: #6BA3BE;
}

.card-back .phonetic {
  color: rgba(255,255,255,0.7);
}

.hint {
  color: #999;
  font-size: 14px;
}

.next-btn {
  padding: 15px 40px;
  background: #3A6B8C;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s;
}

.next-btn:hover {
  background: #1B3A5C;
}
</style>
