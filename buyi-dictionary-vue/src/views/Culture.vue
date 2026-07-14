<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageShell from '@/components/common/PageShell.vue'
import ToneChart from '@/components/specific/ToneChart.vue'
import TonePiano from '@/components/specific/TonePiano.vue'
import PatternDecoration from '@/components/specific/PatternDecoration.vue'
import imgCultureBackground from '@/assets/images/bg-culture-batik-indigo.png'
import imgBatik from '@/assets/images/bouyei-batik-atmosphere.png'
import imgWeaving from '@/assets/images/bouyei-nature.jpg'
import imgDrum from '@/assets/images/bouyei-craft.jpg'
import { buyiTones } from '@/data/tones'
import { cultureExhibitsApi } from '@/utils/api'

const route = useRoute()
const selectedToneIndex = ref(0)
const dialogRef = ref(null)
const selectedPattern = ref(null)
const linkedExhibit = ref(null)
const linkedExhibitError = ref('')
const culturePageRef = ref(null)
let revealObserver = null

const tones = buyiTones

const languageFeatures = [
  ['语言线索', '从词汇、短语和谚语进入布依语的日常表达，查词不止得到释义，也能继续通往文化语境。'],
  ['调值体验', '六个舒声调以可视化和合成声音呈现高低、升降关系，帮助建立第一层听觉印象。'],
  ['工艺阅读', '把服饰、织造、印染和铜鼓相关内容置于可展开的资料单元中，让观看自然通往出处。']
]

const featureLinks = [
  '/dictionary?focus=1',
  { path: '/culture', hash: '#tone-exhibit' },
  { path: '/culture', hash: '#pattern-exhibit' }
]

const patterns = [
  {
    id: 'batik',
    title: '蜡染纹样',
    label: '蓝白之间',
    image: imgBatik,
    imageAlt: '布依族蜡染织物纹样',
    summary: '以蓝、青、白为主的视觉记忆，连接服饰中的纺织、印染、挑花、刺绣、蜡染与织锦。',
    detail: '本展项以现有蜡染图片和纹样示意帮助观察线条与留白。关于工艺与服饰的说明采用官方非遗资料的概述，不延伸未经核验的具体象征解释。',
    sourceTitle: '中国非遗网 · 布依族服饰',
    sourceUrl: 'https://www.ihchina.cn/project_details/15328.html'
  },
  {
    id: 'weaving',
    title: '斗纹布',
    label: '织进祝福',
    image: imgWeaving,
    imageAlt: '布依族织物与自然环境',
    summary: '斗纹布的图案灵感来自盛装粮食的“斗”，关联丰收、勤劳、团结、平安与幸福的祝愿。',
    detail: '资料记载，斗纹布以青色棉线为经、彩色丝线为纬，在织机上形成具有立体触感的方形纹样。此处以图片、纹样示意和出处共同呈现，方便继续追读。',
    sourceTitle: '中国非遗网 · 布依斗纹布：绣艺里的传承创新',
    sourceUrl: 'https://www.ihchina.cn/news_1_details/25730.html'
  },
  {
    id: 'drum',
    title: '铜鼓十二调',
    label: '礼乐回声',
    image: imgDrum,
    imageAlt: '布依族传统工艺与铜鼓文化意象',
    summary: '布依铜鼓是以青铜铸造的古老打击乐器；十二调与庆典、祭祖、祭祀等仪式相连。',
    detail: '铜鼓十二调已列入国家级非物质文化遗产代表性项目名录。展项只呈现来源中明确记载的音乐、地域和仪式信息，并把纹样作为视觉导览，而非文物复刻。',
    sourceTitle: '中国非遗网 · 铜鼓十二调',
    sourceUrl: 'https://www.ihchina.cn/project_details/12584/'
  }
]

function selectTone(index) {
  selectedToneIndex.value = index
}

function openPattern(pattern) {
  selectedPattern.value = pattern
  nextTick(() => dialogRef.value?.showModal())
}

function closePattern() {
  dialogRef.value?.close()
}

async function loadLinkedExhibit(slug) {
  if (!slug) {
    linkedExhibit.value = null
    linkedExhibitError.value = ''
    return
  }
  linkedExhibitError.value = ''
  try {
    const exhibit = await cultureExhibitsApi.detail(slug)
    linkedExhibit.value = exhibit
    if (Number.isInteger(exhibit.toneIndex) && tones[exhibit.toneIndex]) selectedToneIndex.value = exhibit.toneIndex
  } catch {
    linkedExhibit.value = null
    linkedExhibitError.value = '关联展项暂时无法载入，但你仍可继续浏览下方已核验的文化资料。'
  }
}

function initRevealObserver() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  nextTick(() => {
    const root = culturePageRef.value
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
}

watch(() => route.query.exhibit, (slug) => loadLinkedExhibit(String(slug || '')))
onMounted(() => {
  loadLinkedExhibit(String(route.query.exhibit || ''))
  initRevealObserver()
})

onUnmounted(() => {
  revealObserver?.disconnect()
})
</script>

<template>
  <PageShell :bg-image="imgCultureBackground" title="布依文化馆" subtitle="把静态资料变成可以听、按、展开阅读的展览" overlay-style="culture" pattern-type="drum">
    <div ref="culturePageRef" class="culture-page">
      <section class="culture-intro reveal-target" aria-labelledby="culture-intro-title">
        <p>数字展陈</p>
        <h2 id="culture-intro-title">从"看见"走向"参与"</h2>
        <span>这里不替代田野与实物，而是用可玩的声音、可展开的资料和明确的出处，给第一次接触留下可靠入口。</span>
      </section>

      <section v-if="linkedExhibit" class="linked-exhibit reveal-target" aria-labelledby="linked-exhibit-title">
        <header>
          <p>{{ linkedExhibit.kicker || '由词入馆' }}</p>
          <h2 id="linked-exhibit-title">{{ linkedExhibit.title }}</h2>
          <span>{{ linkedExhibit.summary }}</span>
        </header>
        <ol>
          <li>
            <span>01</span>
            <div><strong>词义语境</strong><p>{{ linkedExhibit.story || '该展项正在补充有出处的语境说明。' }}</p></div>
          </li>
          <li>
            <span>02</span>
            <div><strong>合成调值示意</strong><p>以下为声调轮廓的合成演示，不是该词的真实例词录音。</p></div>
          </li>
          <li>
            <span>03</span>
            <div><strong>{{ linkedExhibit.patternLabel || '纹样与工艺焦点' }}</strong><p>继续查看下方纹样资料，并通过出处回到原始公开资料。</p></div>
          </li>
        </ol>
        <div class="linked-exhibit__tone"><TonePiano :tones="tones" :selected-index="selectedToneIndex" @select="selectTone" /><ToneChart :tones="tones" :selected-index="selectedToneIndex" /></div>
        <footer>
          <a v-if="linkedExhibit.sourceUrl" :href="linkedExhibit.sourceUrl" target="_blank" rel="noreferrer">查看出处：{{ linkedExhibit.sourceTitle || '原始资料' }} <span aria-hidden="true">↗</span></a>
          <RouterLink v-if="linkedExhibit.featuredSongId" :to="{ path: '/songs', query: { song: linkedExhibit.featuredSongId } }">前往关联民歌 <span aria-hidden="true">→</span></RouterLink>
        </footer>
      </section>
      <p v-else-if="linkedExhibitError" class="linked-exhibit-error" role="status">{{ linkedExhibitError }}</p>

      <section class="feature-strip reveal-target" aria-label="文化页导览">
        <RouterLink v-for="([title, content], index) in languageFeatures" :key="title" :to="featureLinks[index]" class="feature-card">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <h3>{{ title }}</h3>
          <p>{{ content }}</p>
          <b>进入{{ title }} <i aria-hidden="true">↗</i></b>
        </RouterLink>
      </section>

      <section v-if="!linkedExhibit" id="tone-exhibit" class="tone-exhibit reveal-target" aria-labelledby="tone-title">
        <header>
          <p>可玩展项</p>
          <h2 id="tone-title">用耳朵感受调值的走向</h2>
          <span>选择一个琴键，声调曲线与说明会同步聚焦。</span>
        </header>
        <div class="tone-exhibit__grid">
          <TonePiano :tones="tones" :selected-index="selectedToneIndex" @select="selectTone" />
          <ToneChart :tones="tones" :selected-index="selectedToneIndex" />
        </div>
      </section>

      <section id="pattern-exhibit" class="pattern-exhibit reveal-target" :style="{ '--pattern-atmosphere': `url(${imgBatik})` }" aria-labelledby="pattern-title">
        <header>
          <p>可展开资料</p>
          <h2 id="pattern-title">纹样是进入资料的门把手</h2>
          <span>点击纹样，阅读经来源核验的工艺或音乐说明。</span>
        </header>
        <div class="pattern-exhibit__grid">
          <button v-for="pattern in patterns" :key="pattern.id" type="button" class="pattern-card" @click="openPattern(pattern)">
            <span class="pattern-card__art" aria-hidden="true"><PatternDecoration :pattern="pattern.id" :size="128" :opacity="1" /></span>
            <span class="pattern-card__label">{{ pattern.label }}</span>
            <strong>{{ pattern.title }}</strong>
            <span class="pattern-card__summary">{{ pattern.summary }}</span>
            <span class="pattern-card__action">展开资料 <i aria-hidden="true">↗</i></span>
          </button>
        </div>
      </section>

      <section class="source-note reveal-target">
        <h2>资料使用说明</h2>
        <p>文化页的扩展说明优先引用中国非物质文化遗产网公开条目；页面保留原有项目图片，不下载或复用外部资料图片。详情中的链接可直接查阅原始出处。</p>
      </section>
    </div>

    <dialog ref="dialogRef" class="pattern-dialog" @close="selectedPattern = null">
      <article v-if="selectedPattern">
        <button type="button" class="pattern-dialog__close" aria-label="关闭纹样详情" @click="closePattern">×</button>
        <img :src="selectedPattern.image" :alt="selectedPattern.imageAlt" width="960" height="640" />
        <div class="pattern-dialog__body">
          <p>{{ selectedPattern.label }}</p>
          <h2>{{ selectedPattern.title }}</h2>
          <p>{{ selectedPattern.detail }}</p>
          <a :href="selectedPattern.sourceUrl" target="_blank" rel="noreferrer">查看出处：{{ selectedPattern.sourceTitle }} <span aria-hidden="true">↗</span></a>
        </div>
      </article>
    </dialog>
  </PageShell>
</template>

<style scoped>
.culture-page {
  /* 页面级语义令牌：仅用于本页深色沉浸氛围，不 shadow 全局 --c-* 令牌 */
  --page-surface: rgba(4, 26, 41, .78);
  --page-surface-strong: rgba(3, 21, 34, .92);
  --page-ink: #f4fbfb;
  --page-muted: #d2e4e7;
  --page-muted-strong: #afcbd3;
  --page-accent: #f2bd70;
  --page-border: rgba(183, 220, 227, .28);
  --page-bg-silver: #0b3b4b;

  display: grid;
  gap: clamp(68px, 10vw, 118px);
  width: min(1040px, 100%);
  margin: 0 auto;
  padding: 30px 0 106px;
  /* 保留页面背景色（非 token shadow，是直接设置 background） */
  background: var(--page-surface);
  color: var(--page-ink);
}

.culture-intro {
  max-width: 780px;
  padding: 0 0 clamp(28px, 4vw, 42px);
  border-bottom: 1px solid var(--page-border);
}

.culture-intro p,
.tone-exhibit header p,
.pattern-exhibit header p,
.linked-exhibit header p {
  margin: 0;
  color: var(--page-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .1em;
}

.culture-intro h2,
.tone-exhibit h2,
.pattern-exhibit h2,
.linked-exhibit h2 {
  margin: 10px 0;
  color: var(--page-ink);
  font: 600 clamp(34px, 5vw, 58px) / 1.12 var(--font-serif);
  text-wrap: balance;
}

.culture-intro span,
.tone-exhibit header span,
.pattern-exhibit header span,
.linked-exhibit header > span {
  display: block;
  max-width: 56ch;
  color: var(--page-muted);
  line-height: 1.8;
}

.linked-exhibit {
  padding: clamp(28px, 5vw, 54px);
  border: 1px solid var(--page-border);
  background: linear-gradient(145deg, rgba(8, 43, 60, .9), var(--page-surface-strong));
  box-shadow: 0 24px 60px rgba(0, 9, 17, .3);
}

.linked-exhibit header { max-width: 720px; }
.linked-exhibit ol {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 44px 0 32px;
  padding: 0;
  list-style: none;
}
.linked-exhibit li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--page-border);
}
.linked-exhibit li > span { color: var(--page-accent); font: 13px var(--font-mono); }
.linked-exhibit li strong { color: var(--page-ink); font: 600 18px var(--font-serif); }
.linked-exhibit li p { margin: 8px 0 0; color: var(--page-muted); font-size: 13px; line-height: 1.75; }
.linked-exhibit__tone {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, .9fr);
  gap: 36px;
  align-items: center;
  padding: 28px 0;
  border-top: 1px solid var(--page-border);
  border-bottom: 1px solid var(--page-border);
}
.linked-exhibit__tone > :last-child { padding: 18px; background: rgba(4, 25, 39, .52); }
.linked-exhibit footer { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 24px; }
.linked-exhibit footer a { color: #a8dfe7; font-size: 13px; font-weight: 700; text-decoration: none; }
.linked-exhibit footer a:hover, .linked-exhibit footer a:focus-visible { color: var(--page-ink); text-decoration: underline; }
.linked-exhibit-error { margin: 0; padding: 18px 20px; border: 1px solid rgba(242, 189, 112, .42); color: var(--page-muted); background: rgba(54, 37, 15, .72); font-size: 13px; }

.feature-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--page-border);
  border-bottom: 1px solid var(--page-border);
  background: rgba(3, 25, 39, .42);
}
.feature-card {
  display: flex;
  flex-direction: column;
  min-height: 236px;
  padding: 28px 26px;
  border-right: 1px solid var(--page-border);
  color: inherit;
  text-decoration: none;
  transition: background 180ms ease, color 180ms ease;
}
.feature-card:last-child { border-right: 0; }
.feature-card span { color: #8eb5bd; font: 13px var(--font-mono); }
.feature-card h3 { margin: 28px 0 10px; color: var(--page-ink); font: 600 19px var(--font-serif); }
.feature-card p { margin: 0; color: var(--page-muted); font-size: 14px; line-height: 1.75; }
.feature-card b { display: inline-flex; gap: 8px; margin-top: auto; padding-top: 18px; color: #a8dfe7; font-size: 13px; }
.feature-card b i { font-style: normal; }
.feature-card:hover { background: rgba(77, 139, 153, .24); }
.feature-card:focus-visible { outline: 2px solid var(--page-accent); outline-offset: -2px; }

.tone-exhibit,
.pattern-exhibit { display: grid; gap: 38px; }
.pattern-exhibit { position: relative; isolation: isolate; }
.pattern-exhibit::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: -42px;
  background: linear-gradient(90deg, var(--page-surface-strong), transparent 32%, transparent 68%, var(--page-surface-strong)), var(--pattern-atmosphere) center / cover;
  opacity: .06;
  pointer-events: none;
}
.tone-exhibit__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, .9fr);
  gap: 44px;
  align-items: center;
}
.tone-exhibit__grid > :last-child {
  align-self: stretch;
  padding: 26px;
  border: 1px solid var(--page-border);
  background: rgba(3, 24, 38, .56);
}

.pattern-exhibit__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.pattern-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 360px;
  padding: 28px;
  border: 1px solid var(--page-border);
  border-radius: var(--radius-lg);
  color: inherit;
  background: linear-gradient(180deg, rgba(14, 57, 72, .84), rgba(4, 27, 42, .88));
  box-shadow: 0 12px 34px rgba(0, 8, 15, .16);
  cursor: pointer;
  text-align: left;
  transition: transform 200ms var(--ease-out-quart), border-color 200ms ease, background 200ms ease;
}
.pattern-card:hover { border-color: rgba(169, 223, 231, .7); background: linear-gradient(180deg, rgba(18, 69, 85, .96), rgba(4, 30, 46, .94)); transform: translateY(-2px); }
.pattern-card:focus-visible { outline: 2px solid var(--page-accent); outline-offset: 3px; }
.pattern-card__art { display: grid; width: 132px; height: 132px; margin-bottom: 28px; place-items: center; color: #9fdde6; }
.pattern-card__label { color: var(--page-accent); font-size: 12px; font-weight: 700; }
.pattern-card strong { margin-top: 8px; color: var(--page-ink); font: 600 24px var(--font-serif); }
.pattern-card__summary { margin-top: 12px; color: var(--page-muted); font-size: 13px; line-height: 1.75; }
.pattern-card__action { display: inline-flex; gap: 8px; margin-top: auto; padding-top: 20px; color: #a8dfe7; font-size: 13px; font-weight: 700; }
.pattern-card__action i { font-style: normal; }

.source-note { max-width: 720px; padding: 28px 0; border-top: 1px solid var(--page-border); border-bottom: 1px solid var(--page-border); }
.source-note h2 { margin: 0 0 10px; color: var(--page-ink); font: 600 20px var(--font-serif); }
.source-note p { max-width: 65ch; margin: 0; color: var(--page-muted); font-size: 13px; line-height: 1.8; }

.pattern-dialog { width: min(820px, calc(100% - 32px)); max-height: min(820px, calc(100% - 32px)); padding: 0; border: 1px solid var(--page-border); background: #071f2d; color: var(--page-ink); box-shadow: var(--shadow-xl); }
.pattern-dialog::backdrop { background: rgba(3, 15, 24, .8); backdrop-filter: blur(5px); }
.pattern-dialog article { position: relative; }
.pattern-dialog img { display: block; width: 100%; max-height: 410px; object-fit: cover; }
.pattern-dialog__body { padding: clamp(24px, 5vw, 44px); }
.pattern-dialog__body > p:first-child { margin: 0; color: var(--page-accent); font-size: 12px; font-weight: 700; }
.pattern-dialog__body h2 { margin: 8px 0 14px; color: var(--page-ink); font: 600 clamp(30px, 4vw, 46px) / 1.1 var(--font-serif); }
.pattern-dialog__body > p:nth-child(3) { margin: 0; color: var(--page-muted); line-height: 1.85; }
.pattern-dialog__body a { display: inline-block; margin-top: 22px; color: #a8dfe7; font-size: 13px; font-weight: 700; text-decoration: none; }
.pattern-dialog__body a:focus-visible, .pattern-dialog__body a:hover { color: var(--page-ink); text-decoration: underline; }
.pattern-dialog__close { position: absolute; z-index: 1; top: 14px; right: 14px; display: grid; width: 36px; height: 36px; place-items: center; border: 0; border-radius: 50%; color: #062131; background: rgba(244, 251, 251, .94); cursor: pointer; font-size: 24px; line-height: 1; }
.pattern-dialog__close:focus-visible { outline: 2px solid var(--page-accent); outline-offset: 2px; }

@media (max-width: 780px) {
  .culture-page { gap: 68px; }
  .feature-strip, .tone-exhibit__grid, .pattern-exhibit__grid, .linked-exhibit ol, .linked-exhibit__tone { grid-template-columns: 1fr; }
  .feature-card { min-height: 0; border-right: 0; border-bottom: 1px solid var(--page-border); }
  .feature-card:last-child { border-bottom: 0; }
  .tone-exhibit__grid > :last-child { padding: 16px; }
  .pattern-card { min-height: 0; }
  .pattern-card__art { margin-bottom: 12px; }
}

.reveal-target {
  opacity: 1;
  transform: none;
}

.motion-ready .reveal-target {
  opacity: 0;
  transform: translateY(28px);
}

.motion-ready .reveal-target.is-revealed {
  animation: cultureReveal 560ms var(--ease-out-quint) both;
}

@keyframes cultureReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-card, .pattern-card { transition: none; }
  .pattern-card:hover { transform: none; }
  .reveal-target { opacity: 1 !important; transform: none !important; }
}
</style>
