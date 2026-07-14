<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSearchStore } from '@/stores/search'
import { recordsApi } from '@/utils/api'
import imgHero from '@/assets/images/bouyei-landscape.jpg'
import imgBatik from '@/assets/images/bouyei-batik-atmosphere.png'
import imgCraft from '@/assets/images/bouyei-craft.jpg'
import imgNature from '@/assets/images/bouyei-nature.jpg'
import imgMusic from '@/assets/images/folk-song-bg.jpg'

const authStore = useAuthStore()
const searchStore = useSearchStore()
const homeRef = ref(null)
const learningStats = ref(null)
const heroParallax = ref(0)
let revealObserver = null
let scrollHandler = null

const learningCopy = computed(() => {
  if (!authStore.isLoggedIn) return '登录后，把每一次查词、练习和答题变成可回看的学习轨迹。'
  if (learningStats.value?.total) return `你已经留下 ${learningStats.value.total} 条学习记录，继续把声音与文字串成自己的词典。`
  return '从第一条学习记录开始，建立属于你的布依语探索档案。'
})

async function loadLearningStats() {
  if (!authStore.isLoggedIn) return
  try {
    learningStats.value = await recordsApi.stats()
  } catch {
    learningStats.value = null
  }
}

onMounted(() => {
  loadLearningStats()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const coefficient = isMobile ? 0.06 : 0.12

  scrollHandler = () => {
    heroParallax.value = Math.min(window.scrollY * coefficient, 80)
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })

  window.requestAnimationFrame(() => {
    const root = homeRef.value
    if (!root) return

    const targets = [...root.querySelectorAll('.reveal-target')]
    root.classList.add('motion-ready')
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        revealObserver?.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 })

    targets.forEach((target) => revealObserver.observe(target))
  })
})

onUnmounted(() => {
  revealObserver?.disconnect()
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <main id="main" ref="homeRef" class="museum-home" data-nav-tone="light">
    <section class="museum-hero" data-nav-tone="dark" :style="{ '--hero-image': `url(${imgHero})`, '--hero-parallax': `${heroParallax}px` }">
      <div class="museum-hero__content">
        <p>布依数字文化馆</p>
        <h1>从一个词，<br>走进一座文化馆。</h1>
        <span>让语言、纹样与民歌在同一段探索里相遇。</span>
        <button v-pointer-glow="{ tone: 'accent', size: 'lg' }" type="button" class="primary-action" @click="searchStore.open()">开始查词 <b aria-hidden="true">↗</b></button>
      </div>
      <div class="museum-hero__caption">以声音留存记忆，以查询连接日常。</div>
    </section>

    <section class="language-exhibit reveal-target" data-nav-tone="light" aria-labelledby="language-title">
      <header>
        <p>先从语言开始</p>
        <h2 id="language-title">一部可以随身翻开的布依语词典</h2>
      </header>
      <div class="language-exhibit__body">
        <p>词汇、短语与谚语不只是被检索的内容，也是理解生活方式的入口。输入汉字、拼音或布依语文字，沿着释义继续阅读。</p>
        <RouterLink to="/dictionary" class="text-link">进入词典 <span aria-hidden="true">→</span></RouterLink>
      </div>
    </section>

    <section class="craft-exhibit reveal-target" data-nav-tone="light" aria-labelledby="craft-title">
      <header class="section-heading">
        <p>看见手艺的时间</p>
        <h2 id="craft-title">靛蓝、织线与铜鼓，构成可阅读的文化纹理</h2>
      </header>
      <div class="craft-exhibit__images">
        <figure>
          <img :src="imgBatik" alt="布依族蜡染织物纹样" width="640" height="426" loading="lazy" />
          <figcaption>蜡染 · 蓝白之间留下手作的温度</figcaption>
        </figure>
        <figure>
          <img :src="imgCraft" alt="布依族传统工艺展示" width="640" height="426" loading="lazy" />
          <figcaption>工艺 · 把日常生活织进衣饰与器物</figcaption>
        </figure>
        <figure>
          <img :src="imgNature" alt="布依族文化与自然环境" width="640" height="426" loading="lazy" />
          <figcaption>纹样 · 从自然和记忆里提取线条</figcaption>
        </figure>
      </div>
      <RouterLink to="/culture" class="outline-action">去文化页亲手探索 <span aria-hidden="true">→</span></RouterLink>
    </section>

    <section class="sound-exhibit reveal-target" data-nav-tone="dark" :style="{ '--sound-image': `url(${imgMusic})` }">
      <div>
        <p>让民歌成为展品</p>
        <h2>听见布依民歌的呼吸</h2>
        <span>真实音频、离线回退和实时频谱，让声音不再只是背景。</span>
        <RouterLink to="/songs" class="light-action">进入民歌声场 <b aria-hidden="true">↗</b></RouterLink>
      </div>
    </section>

    <section class="participation-exhibit reveal-target" data-nav-tone="light" aria-labelledby="participation-title">
      <div>
        <p>把观看变成参与</p>
        <h2 id="participation-title">让每一次探索都留下回应</h2>
      </div>
      <div class="participation-exhibit__actions">
        <article>
          <span>学习档案</span>
          <p>{{ learningCopy }}</p>
          <RouterLink :to="authStore.isLoggedIn ? '/record' : '/login'">{{ authStore.isLoggedIn ? '查看学习记录' : '登录并开始学习' }} →</RouterLink>
        </article>
        <article>
          <span>趣味闯关</span>
          <p>用十道轻量问题回顾刚刚认识的文化线索，答完即可复盘与再挑战。</p>
          <RouterLink to="/quiz">开始答题 →</RouterLink>
        </article>
      </div>
    </section>

    <section class="closing-exhibit reveal-target" data-nav-tone="dark">
      <p>文化馆仍在展开</p>
      <h2>下一次，从你想查的那个词开始。</h2>
      <button type="button" class="primary-action" @click="searchStore.open()">打开词典 <b aria-hidden="true">↗</b></button>
    </section>
  </main>
</template>

<style scoped>
.museum-home { color: var(--c-text); background: var(--background); }
.museum-hero { position: relative; display: flex; align-items: end; justify-content: space-between; min-height: min(760px, 88svh); padding: 120px max(24px, calc((100vw - 1180px) / 2)) 54px; overflow: hidden; color: var(--c-white); }
.museum-hero::before { position: absolute; inset: -10% 0; background: linear-gradient(90deg, rgba(13, 37, 56, .94), rgba(27,58,92,.66) 46%, rgba(27,58,92,.15)), var(--hero-image) center / cover; content: ''; will-change: transform; transform: translate3d(0, var(--hero-parallax, 0px), 0); }.museum-hero::after { position: absolute; right: 7vw; bottom: 8vw; width: 14vw; min-width: 120px; aspect-ratio: 1; border: 1px solid rgba(255,255,255,.36); border-radius: 50%; content: ''; }
.museum-hero__content, .museum-hero__caption { position: relative; z-index: 1; }.museum-hero__content { max-width: 700px; }.museum-hero__content p, .section-heading p, .language-exhibit header p, .sound-exhibit p, .participation-exhibit > div > p, .closing-exhibit > p { margin: 0; color: var(--c-accent); font-size: 12px; font-weight: 700; letter-spacing: .1em; }
.museum-hero h1 { margin: 16px 0; font: 600 clamp(48px, 8vw, 92px) / .96 var(--font-serif); letter-spacing: -.04em; text-wrap: balance; }.museum-hero__content > span { display: block; max-width: 33ch; color: var(--c-white-78); font-size: 17px; line-height: 1.7; }.museum-hero__caption { max-width: 17ch; color: var(--c-white-65); font-size: 13px; line-height: 1.7; }
.primary-action, .light-action, .outline-action { position: relative; display: inline-flex; align-items: center; gap: 10px; margin-top: 30px; padding: 13px 19px; border: 1px solid transparent; border-radius: 999px; text-decoration: none; cursor: pointer; font: 700 14px var(--font-sans); -webkit-appearance: none; appearance: none; transition: transform var(--duration-fast) var(--ease-out-quart), filter var(--duration-fast) var(--ease-out-quart), box-shadow var(--duration-fast) var(--ease-out-quart), background var(--duration-fast) var(--ease-out-quart); }.primary-action { color: var(--c-white); background: var(--c-accent); }.primary-action:hover, .light-action:hover { transform: translateY(-2px); filter: brightness(1.04); box-shadow: var(--shadow-md); }.primary-action:active, .light-action:active, .outline-action:active { transform: scale(.98); }.primary-action:focus-visible, .light-action:focus-visible, .outline-action:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }
.language-exhibit, .participation-exhibit { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, .82fr); gap: clamp(42px, 10vw, 150px); width: min(960px, calc(100% - 48px)); margin: 0 auto; padding: 112px 0; }.language-exhibit h2, .section-heading h2, .participation-exhibit h2, .closing-exhibit h2 { margin: 9px 0 0; font: 600 clamp(32px, 5vw, 58px) / 1.15 var(--font-serif); text-wrap: balance; }.language-exhibit__body { display: grid; align-content: end; gap: 25px; }.language-exhibit__body p { max-width: 42ch; margin: 0; color: var(--c-text-70); line-height: 1.9; }.text-link, .participation-exhibit a { color: var(--c-brand); font-weight: 700; text-decoration: none; }.text-link span { margin-left: 8px; }
.craft-exhibit { padding: 100px max(24px, calc((100vw - 1180px) / 2)); background: var(--c-bg-silver); }.section-heading { max-width: 700px; }.craft-exhibit__images { display: grid; grid-template-columns: 1.15fr .85fr .85fr; gap: 18px; margin-top: 46px; }.craft-exhibit figure { margin: 0; }.craft-exhibit figure:nth-child(2) { margin-top: 58px; }.craft-exhibit figure:nth-child(3) { margin-top: 118px; }.craft-exhibit img { display: block; width: 100%; aspect-ratio: 3 / 4; object-fit: cover; }.craft-exhibit figure:first-child img { aspect-ratio: 4 / 5; }.craft-exhibit figcaption { margin-top: 12px; color: var(--c-text-70); font-size: 13px; line-height: 1.55; }.outline-action { border-color: var(--c-brand-40); color: var(--c-brand); background: transparent; }.outline-action:hover { background: var(--c-brand-06); }
.sound-exhibit { position: relative; display: grid; place-items: center start; min-height: 630px; padding: 80px max(24px, calc((100vw - 1180px) / 2)); color: var(--c-white); overflow: hidden; }.sound-exhibit::before { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(13,37,56,.95), rgba(13,37,56,.68)), var(--sound-image) center / cover; content: ''; }.sound-exhibit > div { position: relative; z-index: 1; max-width: 620px; }.sound-exhibit h2 { margin: 12px 0; font: 600 clamp(42px, 7vw, 74px) / 1 var(--font-serif); text-wrap: balance; }.sound-exhibit span { color: var(--c-white-78); font-size: 16px; line-height: 1.7; }.light-action { color: var(--c-brand); background: var(--c-white); }
.participation-exhibit { padding-bottom: 95px; }.participation-exhibit__actions { display: grid; gap: 2px; border-top: 1px solid var(--c-divider); }.participation-exhibit article { padding: 24px 0; border-bottom: 1px solid var(--c-divider); }.participation-exhibit article span { color: var(--c-accent); font-size: 12px; font-weight: 700; }.participation-exhibit article p { margin: 9px 0 14px; color: var(--c-text-70); font-size: 14px; line-height: 1.75; }
.closing-exhibit { padding: 112px 24px 152px; color: var(--c-white); background: var(--c-brand-dark); text-align: center; }.closing-exhibit > p { color: var(--c-accent); }.closing-exhibit h2 { max-width: 17ch; margin-right: auto; margin-left: auto; }.closing-exhibit .primary-action { margin-top: 28px; }

.reveal-target { opacity: 1; transform: none; }
.motion-ready .reveal-target.is-revealed { animation: sectionReveal var(--duration-base) var(--ease-out-quint) both; }
.motion-ready .museum-hero__content > p { animation: heroEnter var(--duration-slow) var(--ease-out-expo) both; }
.motion-ready .museum-hero__content > h1 { animation: heroEnter var(--duration-slow) var(--ease-out-expo) 70ms both; }
.motion-ready .museum-hero__content > span { animation: heroEnter var(--duration-slow) var(--ease-out-expo) 140ms both; }
.motion-ready .museum-hero__content > .primary-action { animation: heroEnter var(--duration-slow) var(--ease-out-expo) 200ms both; }
.motion-ready .museum-hero__caption { animation: heroEnter var(--duration-slow) var(--ease-out-expo) 160ms both; }

@keyframes heroEnter {
  from { opacity: 0; transform: translateY(18px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

@keyframes sectionReveal {
  from { opacity: .25; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 760px) { .museum-hero { align-items: end; min-height: min(640px, 82svh); padding-top: 104px; padding-bottom: 48px; }.museum-hero__caption { display: none; }.language-exhibit, .participation-exhibit { grid-template-columns: 1fr; padding: 72px 0; }.craft-exhibit { padding-top: 72px; padding-bottom: 72px; }.craft-exhibit__images { grid-template-columns: 1fr; gap: 30px; }.craft-exhibit figure:nth-child(2), .craft-exhibit figure:nth-child(3) { margin-top: 0; }.craft-exhibit img, .craft-exhibit figure:first-child img { aspect-ratio: 16 / 10; }.sound-exhibit { min-height: 510px; }.museum-hero h1 { font-size: clamp(45px, 13vw, 70px); } }
/* 跳转按钮呼吸动效：伪元素向外柔和发光，强度随呼吸缓慢起伏 */
.primary-action::after, .light-action::after, .outline-action::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: 0 0 18px 2px var(--breath-glow, transparent);
  opacity: 0;
  animation: buttonBreathe 3.2s var(--ease-out-quart) infinite;
}
.primary-action { --breath-glow: var(--c-accent-40); }
.light-action { --breath-glow: var(--c-white-50); }
.outline-action { --breath-glow: var(--c-brand-40); }
.primary-action:hover::after, .light-action:hover::after, .outline-action:hover::after {
  animation-play-state: paused;
}
@keyframes buttonBreathe {
  0%, 100% { opacity: 0; }
  45%, 55% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .museum-hero__content > *, .museum-hero__caption { animation: none !important; }
  .museum-hero::before { transform: none !important; }
  .reveal-target { opacity: 1 !important; transform: none !important; transition: none !important; }
  .primary-action, .light-action, .outline-action { transition: none; }
  .primary-action::after, .light-action::after, .outline-action::after { animation: none; opacity: 0; }
}
</style>
