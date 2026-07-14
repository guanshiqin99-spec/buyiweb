<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { createQuizRound, scoreAnswers } from '@/data/quiz'
import imgBg from '@/assets/images/bouyei-nature.jpg'

const phase = ref('intro')
const round = ref([])
const currentIndex = ref(0)
const answers = ref([])
const selectedOption = ref('')
const isAnswered = ref(false)
const bgParallax = ref(0)
let scrollHandler = null

const currentQuestion = computed(() => round.value[currentIndex.value])
const score = computed(() => scoreAnswers(answers.value))
const correctCount = computed(() => answers.value.filter(answer => answer.correct).length)
const accuracy = computed(() => answers.value.length ? Math.round((correctCount.value / answers.value.length) * 100) : 0)
const streak = computed(() => {
  let count = 0
  for (let index = answers.value.length - 1; index >= 0 && answers.value[index].correct; index -= 1) count += 1
  return count
})

function startQuiz() {
  round.value = createQuizRound(10)
  currentIndex.value = 0
  answers.value = []
  selectedOption.value = ''
  isAnswered.value = false
  phase.value = 'question'
}

function selectOption(option) {
  if (isAnswered.value) return
  selectedOption.value = option
  const question = currentQuestion.value
  answers.value.push({ ...question, selected: option, correct: option === question.answer })
  isAnswered.value = true
}

function nextQuestion() {
  if (currentIndex.value === round.value.length - 1) {
    phase.value = 'result'
    return
  }
  currentIndex.value += 1
  selectedOption.value = ''
  isAnswered.value = false
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const coefficient = isMobile ? 0.035 : 0.07
  scrollHandler = () => {
    bgParallax.value = window.scrollY * coefficient
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <main id="main" class="quiz-page">
    <div class="quiz-page__bg" :style="{ transform: `translate3d(0, ${bgParallax}px, 0)` }"><img :src="imgBg" alt="" loading="eager" fetchpriority="high" /></div>

    <section v-if="phase === 'intro'" class="quiz-intro">
      <p>趣味闯关</p>
      <h1>把刚刚看见的文化线索，变成一次轻松回顾。</h1>
      <span>每局随机抽取 10 道四选一问题。答对得 10 分，连续答对会获得鼓励，但不会改变分数。</span>
      <button v-pointer-glow="{ tone: 'accent', size: 'lg' }" type="button" @click="startQuiz">开始答题 <b aria-hidden="true">→</b></button>
      <RouterLink to="/culture">先去文化页看看</RouterLink>
    </section>

    <section v-else-if="phase === 'question' && currentQuestion" class="quiz-question" aria-live="polite">
      <header>
        <span>第 {{ currentIndex + 1 }} / {{ round.length }} 题</span>
        <strong>{{ score }} 分</strong>
      </header>
      <div class="quiz-progress"><i :style="{ width: `${((currentIndex + 1) / round.length) * 100}%` }"></i></div>
      <p class="quiz-question__type">文化线索</p>
      <h1>{{ currentQuestion.prompt }}</h1>
      <div class="quiz-options" role="group" :aria-label="currentQuestion.prompt">
        <button
          v-for="option in currentQuestion.options"
          :key="option"
          type="button"
          :disabled="isAnswered"
          :class="{
            'is-selected': selectedOption === option,
            'is-correct': isAnswered && option === currentQuestion.answer,
            'is-wrong': isAnswered && selectedOption === option && option !== currentQuestion.answer
          }"
          @click="selectOption(option)"
        >
          <span>{{ option }}</span>
          <b v-if="isAnswered && option === currentQuestion.answer" aria-label="正确">✓</b>
          <b v-else-if="isAnswered && selectedOption === option" aria-label="错误">×</b>
        </button>
      </div>
      <aside v-if="isAnswered" class="quiz-feedback liquid-glass-quiet" :class="{ 'quiz-feedback--right': selectedOption === currentQuestion.answer }">
        <p>{{ selectedOption === currentQuestion.answer ? '回答正确' : '再看一眼答案' }}<span v-if="streak > 1"> · 连续答对 {{ streak }} 题</span></p>
        <h2>{{ currentQuestion.answer }}</h2>
        <span>{{ currentQuestion.explanation }}</span>
        <small>资料：{{ currentQuestion.source }}</small>
        <button v-pointer-glow="{ tone: 'accent', size: 'md' }" type="button" @click="nextQuestion">{{ currentIndex === round.length - 1 ? '查看结果' : '下一题' }} <b aria-hidden="true">→</b></button>
      </aside>
    </section>

    <section v-else class="quiz-result">
      <p>本局完成</p>
      <h1>{{ score }} <small>分</small></h1>
      <span>答对 {{ correctCount }} 题，正确率 {{ accuracy }}%。</span>
      <div class="quiz-review">
        <article v-for="answer in answers.filter(item => !item.correct)" :key="answer.id" class="liquid-glass-quiet">
          <p>需要复习</p>
          <h2>{{ answer.prompt }}</h2>
          <span>你的答案：{{ answer.selected }} · 正确答案：{{ answer.answer }}</span>
        </article>
        <p v-if="correctCount === round.length" class="quiz-review__perfect">十题全对。下一次可以试着不用提示再挑战一次。</p>
      </div>
      <div class="quiz-result__actions">
        <button type="button" @click="startQuiz">再来一局</button>
        <RouterLink to="/culture">回到文化页</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.quiz-page { position: relative; display: grid; min-height: 100vh; padding: 128px 24px 90px; place-items: center; overflow: hidden; color: var(--c-text); background: transparent; }

/* 固定背景图层：保留原图，不叠加整页蒙层。 */
.quiz-page__bg { position: fixed; inset: -10%; z-index: -2; will-change: transform; }
.quiz-page__bg img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.04); animation: quizBgReveal var(--duration-slow) var(--ease-out-quint) forwards; }
@keyframes quizBgReveal { to { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .quiz-page__bg, .quiz-page__bg img { animation: none !important; transform: none !important; } }
.quiz-intro, .quiz-question, .quiz-result { width: min(760px, 100%); }.quiz-intro > p, .quiz-question__type, .quiz-result > p, .quiz-feedback > p, .quiz-review article p { margin: 0; color: var(--c-accent); font-size: 12px; font-weight: 700; letter-spacing: .1em; }.quiz-intro h1, .quiz-question h1, .quiz-result h1 { margin: 14px 0; font: 600 clamp(38px, 6vw, 66px) / 1.08 var(--font-serif); letter-spacing: -.03em; text-wrap: balance; }.quiz-intro h1, .quiz-question h1 { color: var(--c-white); text-shadow: 0 2px 18px rgba(7, 23, 36, .78); }.quiz-intro h1 { margin: 10px 0; font-size: clamp(26px, 4vw, 40px); }.quiz-intro > span, .quiz-result > span { display: block; max-width: 49ch; color: var(--c-text-70); font-size: 16px; line-height: 1.85; }.quiz-intro > span { color: var(--c-white-78); text-shadow: 0 1px 12px rgba(7, 23, 36, .84); }.quiz-intro button, .quiz-feedback button, .quiz-result__actions button { margin-top: 28px; padding: 14px 22px; border: 0; border-radius: 999px; color: var(--c-white); background: var(--c-brand); cursor: pointer; font: 700 14px var(--font-sans); }.quiz-intro button:hover, .quiz-feedback button:hover, .quiz-result__actions button:hover { background: var(--c-brand-dark); }.quiz-intro button:focus-visible, .quiz-feedback button:focus-visible, .quiz-result__actions button:focus-visible, .quiz-options button:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }.quiz-intro a { display: inline-block; margin: 22px 0 0 20px; color: var(--c-brand); font-size: 14px; font-weight: 700; text-decoration: none; }
.quiz-question header { display: flex; justify-content: space-between; color: var(--c-text-60); font: 13px var(--font-mono); }.quiz-question header strong { color: var(--c-brand); }.quiz-progress { height: 3px; margin: 18px 0 56px; overflow: hidden; background: var(--c-brand-08); }.quiz-progress i { display: block; height: 100%; background: var(--c-accent); transition: width 260ms ease; }.quiz-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 34px; }.quiz-options button { display: flex; align-items: center; justify-content: space-between; min-height: 82px; padding: 18px; border: 1px solid rgba(27, 58, 92, 0.12); border-radius: var(--radius-md); color: var(--c-text); background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(8px) saturate(120%); -webkit-backdrop-filter: blur(8px) saturate(120%); box-shadow: 0 2px 8px rgba(7, 23, 36, 0.08), 0 1px 2px rgba(7, 23, 36, 0.06); cursor: pointer; text-align: left; transition: border-color 160ms ease, background 160ms ease, transform 160ms ease, box-shadow 160ms ease; }.quiz-options button:hover:not(:disabled) { border-color: var(--c-brand); background: rgba(255, 255, 255, 0.96); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(7, 23, 36, 0.12), 0 2px 4px rgba(7, 23, 36, 0.08); }.quiz-options button:disabled { cursor: default; }.quiz-options button.is-selected { border-color: var(--c-brand); background: rgba(235, 242, 247, 0.95); }.quiz-options button.is-correct { border-color: var(--c-success); color: #0f5c26; background: rgba(220, 244, 228, 0.95); backdrop-filter: blur(8px) saturate(120%); -webkit-backdrop-filter: blur(8px) saturate(120%); box-shadow: 0 2px 10px rgba(28, 119, 54, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.6); }.quiz-options button.is-wrong { border-color: var(--c-danger); color: #8a2a2a; background: rgba(248, 226, 226, 0.95); backdrop-filter: blur(8px) saturate(120%); -webkit-backdrop-filter: blur(8px) saturate(120%); box-shadow: 0 2px 10px rgba(181, 64, 64, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.6); }.quiz-options b { font-size: 20px; font-weight: 700; }.quiz-feedback { margin-top: 24px; padding: 24px; }.quiz-feedback--right { border-color: color-mix(in srgb, var(--c-success) 38%, transparent); }.quiz-feedback h2 { margin: 8px 0; font: 600 24px var(--font-serif); }.quiz-feedback > span { display: block; color: var(--c-text-70); line-height: 1.75; }.quiz-feedback small { display: block; margin-top: 13px; color: var(--c-text-50); font-size: 12px; }
.quiz-result { text-align: center; }.quiz-result h1 { margin-bottom: 2px; color: var(--c-brand); font-family: var(--font-mono); font-size: clamp(68px, 12vw, 130px); }.quiz-result h1 small { color: var(--c-accent); font: 700 26px var(--font-sans); }.quiz-result > span { margin: 0 auto; }.quiz-review { display: grid; gap: 10px; margin: 38px 0; text-align: left; }.quiz-review article { padding: 20px; }.quiz-review h2 { margin: 8px 0; font: 600 18px var(--font-serif); }.quiz-review article > span { color: var(--c-text-70); font-size: 13px; }.quiz-review__perfect { margin: 0; padding: 22px; color: var(--c-brand); background: var(--c-brand-06); line-height: 1.7; }.quiz-result__actions { display: flex; justify-content: center; gap: 16px; }.quiz-result__actions button { margin-top: 0; }.quiz-result__actions a { padding: 14px 0; color: var(--c-brand); font-size: 14px; font-weight: 700; text-decoration: none; }
@media (max-width: 580px) { .quiz-page { padding-right: 20px; padding-left: 20px; }.quiz-options { grid-template-columns: 1fr; }.quiz-intro a { display: block; margin-left: 0; }.quiz-result__actions { flex-direction: column; align-items: center; } }
@media (prefers-reduced-motion: reduce) { .quiz-progress i, .quiz-options button { transition: none; }.quiz-options button:hover:not(:disabled) { transform: none; } }
</style>
