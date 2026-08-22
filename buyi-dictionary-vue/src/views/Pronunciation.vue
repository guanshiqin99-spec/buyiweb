<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { apiBaseURL, pronunciationApi, quizApi } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import imgBg from '@/assets/images/bouyei-nature.jpg'

// Web Speech API 在不同浏览器内核下构造器名不同（Chrome/Safari 前缀差异）
const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
const speechSupported = Boolean(SpeechRecognitionCtor)

// 每局题数、通过分数线与本机成绩存储 key
const QUESTIONS_PER_ROUND = 5
const PASS_THRESHOLD = 6
const LOCAL_ATTEMPTS_KEY = 'buyi_pronunciation_attempts'

const phase = ref('intro')
const authStore = useAuthStore()
const round = ref([])
const currentIndex = ref(0)
const answers = ref([])
const bgParallax = ref(0)
const isLoadingQuestions = ref(false)
const loadErrorMessage = ref('')
const lastAttempt = ref(null)
const isSavingResult = ref(false)
const resultSaveMessage = ref('')

// 当前题的跟读状态
const isListening = ref(false)
const isScoring = ref(false)
const isPlayingAudio = ref(false)
const interimText = ref('')
const currentResult = ref(null)
const actionError = ref('')

let recognition = null
let currentAudio = null
let messageTimer = null
let scrollHandler = null

const currentQuestion = computed(() => round.value[currentIndex.value])
// 评分成功后 answers 的最后一条即当前题作答
const currentAnswer = computed(() => answers.value[answers.value.length - 1])
const score = computed(() => answers.value.reduce((sum, answer) => sum + answer.points, 0))
const correctCount = computed(() => answers.value.filter(answer => answer.correct).length)
const totalQuestions = computed(() => round.value.length)
const averageSimilarity = computed(() => {
  if (!answers.value.length) return 0
  const sum = answers.value.reduce((total, answer) => total + (Number(answer.similarity) || 0), 0)
  return Math.round((sum / answers.value.length) * 100)
})
const primaryActionLabel = computed(() => {
  if (isScoring.value) return 'AI 评分中…'
  if (isListening.value) return '停止'
  return '开始跟读'
})
const isLastQuestion = computed(() => currentIndex.value === round.length - 1)

// 拉题失败的轻提示：与 Quiz 页 AI 提示一致，短暂展示后自动消失
function showLoadError(text) {
  loadErrorMessage.value = text
  if (messageTimer) window.clearTimeout(messageTimer)
  messageTimer = window.setTimeout(() => {
    loadErrorMessage.value = ''
  }, 4200)
}

function startRound() {
  if (isLoadingQuestions.value) return
  isLoadingQuestions.value = true
  resultSaveMessage.value = ''
  pronunciationApi.questions({ count: QUESTIONS_PER_ROUND })
    .then((response) => {
      const items = Array.isArray(response?.items) ? response.items : []
      if (!items.length) throw new Error('empty questions')
      round.value = items.map((item) => ({
        id: item?.id,
        kind: item?.kind === 'phrase' ? 'phrase' : 'dictionary',
        buyiText: String(item?.buyiText || ''),
        zhText: String(item?.zhText || ''),
        description: String(item?.description || ''),
        audioUrl: String(item?.audioUrl || '')
      }))
      currentIndex.value = 0
      answers.value = []
      resetQuestionState()
      phase.value = 'question'
    })
    .catch(() => {
      showLoadError('题目加载失败，请检查网络后重试。')
    })
    .finally(() => {
      isLoadingQuestions.value = false
    })
}

// 切题/重开时清理当前题的识别、音频与提示状态
function resetQuestionState() {
  cleanupRecognition()
  stopAudio()
  interimText.value = ''
  currentResult.value = null
  actionError.value = ''
  isListening.value = false
  isScoring.value = false
}

function playQuestionAudio() {
  const question = currentQuestion.value
  const audioUrl = String(question?.audioUrl || '').trim()
  if (!audioUrl || isPlayingAudio.value) return
  stopAudio()
  // 后端可能返回相对路径（如 /uploads/...），需拼接后端域名（与 Learn 页一致）
  let fullUrl = audioUrl
  if (!/^https?:\/\//i.test(fullUrl)) {
    const base = (apiBaseURL || '').replace(/\/api\/?$/, '')
    fullUrl = `${base}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`
  }
  const audio = new Audio(fullUrl)
  currentAudio = audio
  isPlayingAudio.value = true
  audio.onended = () => {
    if (currentAudio === audio) stopAudio()
  }
  audio.onerror = () => {
    if (currentAudio !== audio) return
    stopAudio()
    actionError.value = '发音加载失败，请检查网络后重试。'
  }
  audio.play().catch(() => {
    if (currentAudio !== audio) return
    stopAudio()
    actionError.value = '浏览器未能播放该发音，请稍后重试。'
  })
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio = null
  }
  isPlayingAudio.value = false
}

function toggleRecognition() {
  if (currentResult.value || isScoring.value) return
  if (isListening.value) {
    stopRecognition()
    return
  }
  startRecognition()
}

function stopRecognition() {
  if (!recognition) return
  try { recognition.stop() } catch { /* 对已结束的识别调用 stop 可能抛错，忽略即可 */ }
}

function startRecognition() {
  const question = currentQuestion.value
  if (!question || !speechSupported || isListening.value || isScoring.value || currentResult.value) return
  stopAudio()
  // 每次跟读前重置上一轮的识别与提示状态
  interimText.value = ''
  currentResult.value = null
  actionError.value = ''

  const recognizer = new SpeechRecognitionCtor()
  recognition = recognizer
  // 本轮是否已发起评分：避免 final 之后 onend 兜底重复评分
  let hasScored = false
  const attemptScore = (text) => {
    if (hasScored) return
    hasScored = true
    scoreRecognition(text)
  }

  recognizer.lang = 'zh-CN'
  recognizer.interimResults = true
  recognizer.continuous = false

  recognizer.onresult = (event) => {
    if (recognition !== recognizer) return
    let finalText = ''
    let latestInterim = ''
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index]
      const text = result?.[0]?.transcript || ''
      if (result.isFinal) finalText += text
      else latestInterim += text
    }
    // 实时展示中间识别文本
    if (latestInterim) interimText.value = latestInterim
    if (finalText.trim()) attemptScore(finalText.trim())
  }

  recognizer.onerror = (event) => {
    if (recognition !== recognizer) return
    const errorCode = event?.error
    if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
      actionError.value = '麦克风权限被拒绝，请在浏览器设置中允许麦克风后重试。'
    } else if (errorCode === 'no-speech') {
      actionError.value = '没有听到声音，请靠近麦克风大声再试一次。'
    } else if (errorCode === 'aborted') {
      // 主动停止会触发 aborted，交由 onend 兜底，不当作错误
    } else {
      actionError.value = '语音识别出现异常，请重试。'
    }
  }

  recognizer.onend = () => {
    if (recognition !== recognizer) return
    isListening.value = false
    // 停止时仍无 final 结果：用最近的中间文本兜底评分，否则提示未识别
    if (!hasScored && !isScoring.value) {
      if (interimText.value.trim()) {
        attemptScore(interimText.value.trim())
      } else if (!actionError.value) {
        actionError.value = '未识别到内容，请再试一次。'
      }
    }
  }

  try {
    recognizer.start()
    isListening.value = true
  } catch {
    actionError.value = '语音识别启动失败，请重试。'
    isListening.value = false
  }
}

async function scoreRecognition(text) {
  const question = currentQuestion.value
  if (!question || !text) return
  isScoring.value = true
  try {
    const response = await pronunciationApi.score({
      targetText: question.buyiText,
      recognizedText: text
    })
    const similarity = Number(response?.similarity) || 0
    const points = Math.round(similarity * 10)
    currentResult.value = {
      score: Math.round(Number(response?.score) || 0),
      similarity,
      feedback: String(response?.feedback || ''),
      targetSyllables: Array.isArray(response?.targetSyllables) ? response.targetSyllables.map((item) => String(item)) : [],
      recognizedSyllables: Array.isArray(response?.recognizedSyllables) ? response.recognizedSyllables.map((item) => String(item)) : []
    }
    interimText.value = ''
    answers.value.push({
      id: question.id,
      buyiText: question.buyiText,
      zhText: question.zhText,
      recognizedText: text,
      similarity,
      points,
      correct: points >= PASS_THRESHOLD
    })
  } catch {
    actionError.value = '评分服务暂时不可用，请点击"开始跟读"重新尝试本题。'
  } finally {
    isScoring.value = false
  }
}

// 目标音节按位置与识别音节比对：相同位置一致视为读对
function isSyllableMatched(index) {
  const result = currentResult.value
  if (!result) return false
  return result.recognizedSyllables[index] === result.targetSyllables[index]
}

async function nextQuestion() {
  if (!currentResult.value || isListening.value || isScoring.value) return
  if (isLastQuestion.value) {
    phase.value = 'result'
    await persistResult()
    return
  }
  currentIndex.value += 1
  resetQuestionState()
}

async function persistResult() {
  // 先写本机存储，未登录或断网时成绩也不丢
  const attempt = {
    score: score.value,
    correctCount: correctCount.value,
    totalQuestions: totalQuestions.value,
    answers: answers.value.map((answer) => ({
      id: answer.id,
      buyiText: answer.buyiText,
      zhText: answer.zhText,
      recognizedText: answer.recognizedText || '',
      similarity: answer.similarity,
      points: answer.points,
      correct: answer.correct
    }))
  }
  let localAttempts = []
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_ATTEMPTS_KEY) || '[]')
    localAttempts = Array.isArray(stored) ? stored : []
  } catch {}
  const savedAttempt = { ...attempt, createdAt: new Date().toISOString() }
  localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify([savedAttempt, ...localAttempts].slice(0, 20)))
  lastAttempt.value = savedAttempt

  if (!authStore.isLoggedIn) {
    resultSaveMessage.value = '成绩已保存在本机；登录后可同步到账号。'
    return
  }
  isSavingResult.value = true
  try {
    await quizApi.create({
      mode: 'pronunciation',
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      answers: attempt.answers.map((answer) => ({ ...answer, type: 'pronunciation' }))
    })
    resultSaveMessage.value = '成绩已同步到你的学习账号。'
  } catch {
    resultSaveMessage.value = '成绩已保存在本机，云端同步失败，可稍后再试。'
  } finally {
    isSavingResult.value = false
  }
}

// intro 展示最近一次本机成绩（localStorage 首条）
function loadLastAttempt() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_ATTEMPTS_KEY) || '[]')
    if (Array.isArray(stored) && stored[0]) lastAttempt.value = stored[0]
  } catch {}
}

function cleanupRecognition() {
  if (!recognition) return
  // 先摘除回调再中止，避免组件卸载/切题后仍触发兜底评分
  recognition.onresult = null
  recognition.onerror = null
  recognition.onend = null
  try { recognition.abort() } catch { /* 已结束的识别再次 abort 可能抛错，忽略即可 */ }
  recognition = null
  isListening.value = false
}

onMounted(() => {
  loadLastAttempt()
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
  if (messageTimer) window.clearTimeout(messageTimer)
  cleanupRecognition()
  stopAudio()
})
</script>

<template>
  <main id="main" class="pron-page" data-motion-surface="tool" data-tool-page="">
    <div class="pron-page__bg" :style="{ transform: `translate3d(0, ${bgParallax}px, 0)` }"><img :src="imgBg" alt="" loading="eager" fetchpriority="high" /></div>
    <div class="pron-page__scrim" aria-hidden="true"></div>
    <p v-if="loadErrorMessage" class="pron-message" role="status">{{ loadErrorMessage }}</p>

    <section v-if="phase === 'intro'" class="pron-intro">
      <p class="pron-kicker">发音闯关</p>
      <h1>跟着 AI 读布依语，把每个词句念准。</h1>
      <span>每局 5 题，先听示范再跟读，AI 会根据相似度为你的发音打分。每题满分 10 分，得到 6 分及以上算通过。首次使用需要允许浏览器使用麦克风。</span>
      <small v-if="lastAttempt" class="pron-intro__last">最近成绩：{{ lastAttempt.score }} 分（通过 {{ lastAttempt.correctCount }} / {{ lastAttempt.totalQuestions }} 题）</small>
      <p v-if="!speechSupported" class="pron-intro__warn">当前浏览器不支持语音识别，请使用 Chrome / Edge 浏览器。</p>
      <button v-pointer-glow="{ tone: 'accent', size: 'lg' }" type="button" :disabled="!speechSupported || isLoadingQuestions" @click="startRound">{{ isLoadingQuestions ? '准备中…' : '开始闯关' }} <b aria-hidden="true">→</b></button>
      <RouterLink to="/quiz">先去答题闯关</RouterLink>
    </section>

    <section v-else-if="phase === 'question' && currentQuestion" class="pron-question" aria-live="polite">
      <header>
        <span>第 {{ currentIndex + 1 }} / {{ round.length }} 题</span>
        <strong>{{ score }} 分</strong>
      </header>
      <div class="pron-progress"><i :style="{ width: `${((currentIndex + 1) / round.length) * 100}%` }"></i></div>
      <p class="pron-question__type">{{ currentQuestion.kind === 'phrase' ? '短语跟读' : '词汇跟读' }}</p>
      <h1>{{ currentQuestion.buyiText }}</h1>
      <p class="pron-question__zh">{{ currentQuestion.zhText }}</p>
      <p v-if="currentQuestion.description" class="pron-question__desc">{{ currentQuestion.description }}</p>

      <div class="pron-actions">
        <button v-if="currentQuestion.audioUrl" type="button" class="pron-actions__listen" :disabled="isListening || isScoring || isPlayingAudio" @click="playQuestionAudio">{{ isPlayingAudio ? '播放中…' : '听发音' }}</button>
        <button v-if="!currentResult" v-pointer-glow="{ tone: 'accent', size: 'md' }" type="button" class="pron-actions__speak" :class="{ 'is-stop': isListening }" :disabled="isScoring" @click="toggleRecognition">{{ primaryActionLabel }}</button>
      </div>

      <div v-if="isListening || interimText" class="pron-live">
        <p v-if="isListening" class="pron-live__status"><i aria-hidden="true"></i>正在聆听，请大声跟读…</p>
        <p v-if="interimText" class="pron-live__text">{{ interimText }}</p>
      </div>

      <p v-if="actionError" class="pron-error" role="alert">{{ actionError }}</p>

      <aside v-if="currentResult" class="pron-feedback liquid-glass-quiet" :class="{ 'pron-feedback--pass': currentAnswer?.correct }">
        <p class="pron-feedback__kicker">{{ currentAnswer?.correct ? '发音通过' : '再练一练' }}<span v-if="currentAnswer"> · 本题 {{ currentAnswer.points }} / 10 分</span></p>
        <div class="pron-feedback__score">
          <strong>{{ currentResult.score }}</strong>
          <span>分（百分制）</span>
          <em>相似度 {{ Math.round(currentResult.similarity * 100) }}%</em>
        </div>
        <p v-if="currentResult.feedback" class="pron-feedback__text">{{ currentResult.feedback }}</p>
        <p class="pron-feedback__heard">你说的：{{ currentAnswer?.recognizedText || '（未识别到内容）' }}</p>
        <div class="pron-syllables">
          <div class="pron-syllables__row">
            <small>目标</small>
            <span v-for="(syllable, index) in currentResult.targetSyllables" :key="`t-${index}`" class="pron-syllable" :class="isSyllableMatched(index) ? 'is-correct' : 'is-wrong'">{{ syllable }}</span>
            <span v-if="!currentResult.targetSyllables.length" class="pron-syllables__empty">（无音节数据）</span>
          </div>
          <div class="pron-syllables__row">
            <small>听到</small>
            <span v-for="(syllable, index) in currentResult.recognizedSyllables" :key="`r-${index}`" class="pron-syllable is-heard">{{ syllable }}</span>
            <span v-if="!currentResult.recognizedSyllables.length" class="pron-syllables__empty">（无识别音节）</span>
          </div>
        </div>
        <button v-pointer-glow="{ tone: 'accent', size: 'md' }" type="button" @click="nextQuestion">{{ isLastQuestion ? '查看结果' : '下一题' }} <b aria-hidden="true">→</b></button>
      </aside>
    </section>

    <section v-else class="pron-result">
      <p class="pron-kicker">本局完成</p>
      <h1>{{ score }} <small>分</small></h1>
      <span>通过 {{ correctCount }} / {{ totalQuestions }} 题，平均相似度 {{ averageSimilarity }}%。</span>
      <p class="pron-result__save" aria-live="polite">{{ isSavingResult ? '正在保存成绩…' : resultSaveMessage }}</p>
      <div class="pron-result__actions">
        <button type="button" @click="startRound">再来一局</button>
        <RouterLink to="/quiz">回到答题闯关</RouterLink>
        <RouterLink to="/record">查看学习记录 →</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.pron-page { position: relative; display: grid; min-height: 100vh; padding: 128px 24px 90px; place-items: center; overflow: hidden; color: var(--c-text); background: transparent; }

/* 固定背景图层：复用布依山水原图，仅在文字侧叠加渐变蒙层以提升对比度。 */
.pron-page__bg { position: fixed; inset: -10%; z-index: -2; will-change: transform; }
/* 暗色渐变蒙层：左侧与底部加暗，保证文字区背景足够深。 */
.pron-page__scrim { position: fixed; inset: 0; z-index: -1; pointer-events: none; background: var(--grad-hero-bottom), var(--grad-hero-scrim); }
.pron-page__bg img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.04); animation: pronBgReveal var(--duration-slow) var(--ease-out-quint) forwards; }
@keyframes pronBgReveal { to { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .pron-page__bg, .pron-page__bg img { animation: none !important; transform: none !important; } }

.pron-intro, .pron-question, .pron-result { width: min(760px, 100%); }
/* 背景图上的无阴影文字补一层近距投影，确保亮区也能看清。 */
.pron-kicker, .pron-question__type, .pron-question header, .pron-question__zh, .pron-result h1, .pron-result > span { text-shadow: 0 1px 2px var(--c-shadow-40); }
.pron-kicker, .pron-question__type, .pron-feedback__kicker { margin: 0; color: var(--c-accent); font-size: 12px; font-weight: 700; letter-spacing: .1em; }
.pron-intro h1, .pron-question h1, .pron-result h1 { margin: 14px 0; font: 600 clamp(38px, 6vw, 66px) / 1.08 var(--font-serif); letter-spacing: -.03em; text-wrap: balance; }
.pron-intro h1, .pron-question h1 { color: var(--c-white); text-shadow: 0 1px 2px var(--c-shadow-40), 0 2px 18px rgba(7, 23, 36, .78); }
.pron-intro h1 { margin: 10px 0; font-size: clamp(26px, 4vw, 40px); }
.pron-intro > span { display: block; max-width: 49ch; color: var(--c-white-78); font-size: 16px; line-height: 1.85; text-shadow: 0 1px 2px var(--c-shadow-40), 0 1px 12px rgba(7, 23, 36, .84); }
.pron-intro__last { display: block; margin-top: 14px; color: var(--c-white-78); font-size: 13px; }
.pron-intro__warn { max-width: 49ch; margin: 18px 0 0; padding: 12px 16px; border-radius: var(--radius-md); color: #8a2a2a; background: rgba(248, 226, 226, .94); font-size: 13px; line-height: 1.7; }
.pron-intro button, .pron-feedback button, .pron-result__actions button { margin-top: 28px; padding: 14px 22px; border: 0; border-radius: 999px; color: var(--c-white); background: var(--c-brand); cursor: pointer; font: 700 14px var(--font-sans); }
.pron-intro button:hover, .pron-feedback button:hover, .pron-result__actions button:hover { background: var(--c-brand-dark); }
.pron-intro button:focus-visible, .pron-feedback button:focus-visible, .pron-result__actions button:focus-visible, .pron-actions button:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }
.pron-intro button:disabled { cursor: wait; opacity: .62; }
.pron-intro a { display: inline-block; margin: 22px 0 0 20px; color: var(--c-brand); font-size: 14px; font-weight: 700; text-decoration: none; }
.pron-message { position: fixed; top: calc(72px + env(safe-area-inset-top, 0px)); z-index: 3; max-width: calc(100% - 32px); margin: 0; padding: 10px 16px; border-radius: 999px; color: var(--c-text); background: rgba(255, 255, 255, .92); box-shadow: 0 8px 28px var(--c-shadow-20); font-size: 13px; }

.pron-question header { display: flex; justify-content: space-between; color: var(--c-text-60); font: 13px var(--font-mono); }
.pron-question header strong { color: var(--c-brand); }
.pron-progress { height: 3px; margin: 18px 0 56px; overflow: hidden; background: var(--c-brand-08); }
.pron-progress i { display: block; height: 100%; background: var(--c-accent); transition: width 260ms ease; }
/* 布依语原文：大字号衬线，作为跟读的视觉主角。 */
.pron-question h1 { margin: 10px 0; font-size: clamp(44px, 8vw, 84px); }
.pron-question__zh { margin: 12px 0 0; color: var(--c-white); font-size: 18px; font-weight: 600; text-shadow: 0 1px 2px var(--c-shadow-40), 0 1px 12px rgba(7, 23, 36, .84); }
.pron-question__desc { margin: 12px 0 0; max-width: 56ch; color: var(--c-white-78); font-size: 14px; line-height: 1.75; text-shadow: 0 1px 2px var(--c-shadow-40); }

.pron-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.pron-actions button { padding: 14px 22px; border: 0; border-radius: 999px; color: var(--c-white); background: var(--c-brand); cursor: pointer; font: 700 14px var(--font-sans); transition: background 160ms ease, color 160ms ease; }
.pron-actions button:hover:not(:disabled) { background: var(--c-brand-dark); }
.pron-actions button:disabled { cursor: wait; opacity: .62; }
/* 听发音：浅色次按钮。 */
.pron-actions__listen { color: var(--c-brand); background: rgba(255, 255, 255, .9); }
.pron-actions__listen:hover:not(:disabled) { color: var(--c-white); background: var(--c-brand-dark); }
/* 识别中：停止按钮转为警示色。 */
.pron-actions__speak.is-stop { background: var(--c-danger); }
.pron-actions__speak.is-stop:hover:not(:disabled) { background: color-mix(in srgb, var(--c-danger) 82%, black); }

.pron-live { margin-top: 22px; }
.pron-live__status { display: flex; align-items: center; gap: 9px; margin: 0; color: var(--c-white); font-size: 14px; font-weight: 700; text-shadow: 0 1px 2px var(--c-shadow-40); }
.pron-live__status i { width: 9px; height: 9px; border-radius: 50%; background: var(--c-danger); animation: pronPulse 1.1s ease-in-out infinite; }
@keyframes pronPulse { 50% { opacity: .35; transform: scale(.8); } }
.pron-live__text { margin: 10px 0 0; color: var(--c-white); font-size: 16px; line-height: 1.7; text-shadow: 0 1px 2px var(--c-shadow-40), 0 1px 12px rgba(7, 23, 36, .84); }

.pron-error { margin: 20px 0 0; padding: 12px 16px; border-radius: var(--radius-md); color: #8a2a2a; background: rgba(248, 226, 226, .94); font-size: 14px; line-height: 1.7; }

.pron-feedback { margin-top: 26px; padding: 24px; }
.pron-feedback--pass { border-color: color-mix(in srgb, var(--c-success) 38%, transparent); }
.pron-feedback__score { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 12px; margin: 12px 0 0; }
.pron-feedback__score strong { color: var(--c-brand); font: 700 44px / 1 var(--font-mono); }
.pron-feedback__score span, .pron-feedback__score em { color: var(--c-text-70); font-size: 13px; font-style: normal; }
.pron-feedback__text { margin: 12px 0 0; color: var(--c-text-70); line-height: 1.75; }
.pron-feedback__heard { margin: 10px 0 0; color: var(--c-text); font-size: 14px; line-height: 1.7; }
/* 音节对比：目标行按位置对/错着色，听到行保持中性。 */
.pron-syllables { display: grid; gap: 8px; margin-top: 16px; }
.pron-syllables__row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.pron-syllables__row small { margin-right: 2px; color: var(--c-text-60); font-size: 12px; }
.pron-syllable { padding: 4px 10px; border-radius: 8px; color: var(--c-text); background: var(--c-brand-06); font-size: 14px; font-weight: 600; }
.pron-syllable.is-correct { color: #0f5c26; background: rgba(220, 244, 228, .95); }
.pron-syllable.is-wrong { color: #8a2a2a; background: rgba(248, 226, 226, .95); }
.pron-syllables__empty { color: var(--c-text-60); font-size: 13px; }

.pron-result { text-align: center; }
.pron-result h1 { margin-bottom: 2px; color: var(--c-brand); font-family: var(--font-mono); font-size: clamp(68px, 12vw, 130px); }
.pron-result h1 small { color: var(--c-accent); font: 700 26px var(--font-sans); }
.pron-result > span { display: block; max-width: 49ch; margin: 0 auto; color: var(--c-text-70); font-size: 16px; line-height: 1.85; }
.pron-result__save { min-height: 22px; margin: 12px auto 0; color: var(--c-text-70); font-size: 13px; }
.pron-result__actions { display: flex; justify-content: center; gap: 16px; margin-top: 34px; }
.pron-result__actions button { margin-top: 0; }
.pron-result__actions a { padding: 14px 0; color: var(--c-brand); font-size: 14px; font-weight: 700; text-decoration: none; }

[data-theme="dark"] .pron-syllable { background: rgba(255, 255, 255, .08); }
[data-theme="dark"] .pron-syllable.is-correct { color: var(--c-success); background: rgba(28, 119, 54, .25); }
[data-theme="dark"] .pron-syllable.is-wrong { color: var(--c-danger); background: rgba(181, 64, 64, .25); }
[data-theme="dark"] .pron-error, [data-theme="dark"] .pron-intro__warn { color: var(--c-danger); background: rgba(181, 64, 64, .2); }

@media (max-width: 580px) {
  .pron-page { padding-right: 20px; padding-left: 20px; }
  .pron-intro button { width: 100%; }
  .pron-intro a { display: block; margin-left: 0; }
  .pron-actions { flex-direction: column; align-items: stretch; }
  .pron-result__actions { flex-direction: column; align-items: center; }
}
@media (prefers-reduced-motion: reduce) {
  .pron-progress i, .pron-actions button { transition: none; }
  .pron-live__status i { animation: none; }
}
</style>
