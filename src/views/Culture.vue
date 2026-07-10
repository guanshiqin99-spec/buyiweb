<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PageShell from '@/components/common/PageShell.vue'
import ToneChart from '@/components/specific/ToneChart.vue'
import PatternDecoration from '@/components/specific/PatternDecoration.vue'
import imgBg from '@/assets/images/bouyei-craft.jpg'
import imgBatik from '@/assets/images/bouyei-textile.jpg'
import imgWeaving from '@/assets/images/bouyei-nature.jpg'
import imgDrum from '@/assets/images/bouyei-craft.jpg'

const languageFeatures = [
  { title: '语言分布', description: '布依语属汉藏语系壮侗语族壮傣语支，主要分布在贵州省。黔南、黔西南两个布依族苗族自治州是核心使用区，使用人口约 200 万。' },
  { title: '声调系统', description: '布依语有 6 个舒声调、2 个促声调，是声调语言的重要代表。声调区别词义，同一音节不同声调含义迥异。' },
  { title: '文字系统', description: '布依族历史上使用过方块布依字，现以拉丁字母为基础的拼音文字为主。20 世纪 50 年代创制拉丁字母方案并多次修订。' }
]

// 布依语声调数据（6 个舒声调）
const buyiTones = [
  { name: '第一调', value: 55, description: '高平调' },
  { name: '第二调', value: 11, description: '低平调' },
  { name: '第三调', value: 53, description: '高降调' },
  { name: '第四调', value: 31, description: '低降调' },
  { name: '第五调', value: 24, description: '中升调' },
  { name: '第六调', value: 33, description: '中平调' }
]

// 纹样符号系统
const patternSymbols = [
  {
    name: '蜡染鱼鸟纹',
    pattern: 'batik',
    meaning: '菱形为骨，鱼鸟为魂。鱼寓意多子丰产，鸟象征天地沟通，是蜡染中最古老的母题。'
  },
  {
    name: '铜鼓太阳纹',
    pattern: 'drum',
    meaning: '鼓面中心十二芒太阳纹，外扩晕圈象征宇宙层次。铜鼓纹是布依族宇宙观的几何表达。'
  },
  {
    name: '织锦几何纹',
    pattern: 'weaving',
    meaning: '菱形与锯齿交替排列，记载族群迁徙路径与世系谱系，是织在布上的文字。'
  }
]

const heritageItems = [
  {
    title: '蜡染工艺',
    description: '世界非物质文化遗产。以靛蓝染料在棉麻布上绘制蓝白相间的图案，纹样多取材自然——铜鼓纹、漩涡纹、花鸟纹。冰纹裂痕是蜡染独有的"冰肌玉骨"质感。',
    img: imgBatik,
    imgAlt: '布依族蜡染蓝白纹样布料',
    tag: '世界非遗'
  },
  {
    title: '织锦技艺',
    description: '布依族传统织锦以菱形、锯齿几何纹样为骨，点缀红黄暖色。通经断纬的织法让正反两面纹样一致，是土司时代的重要贡品。',
    img: imgWeaving,
    imgAlt: '布依族织锦几何纹样特写',
    tag: '传统技艺'
  },
  {
    title: '铜鼓文化',
    description: '铜鼓是布依族的"重器之首"，用于祭祀、节庆、集会。鼓面太阳纹与晕圈层层外扩，承载着民族对宇宙秩序的理解。现存最古老的铜鼓可追溯至汉代。',
    img: imgDrum,
    imgAlt: '布依族铜鼓纹样',
    tag: '礼乐重器'
  }
]

const containerRef = ref(null)
let observer = null

onMounted(() => {
  if (!containerRef.value) return
  // 兜底：无论是否减少动效，都先让内容可见，避免 CSS 加载失败时内容消失
  for (const el of containerRef.value.querySelectorAll('.reveal-on-scroll:not(.is-visible)')) {
    el.classList.add('is-visible')
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' })
  for (const el of containerRef.value.querySelectorAll('.reveal-on-scroll:not(.is-visible)')) {
    observer.observe(el)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <PageShell
    :bg-image="imgBg"
    title="布依族文化"
    subtitle="探索布依族丰富的文化遗产与民族特色"
    overlay-style="warm"
    pattern-type="drum"
  >
    <div ref="containerRef" class="culture-content">
      <!-- 语言特征 -->
      <section class="features-section">
        <h2 class="section-title reveal-on-scroll">语言特征</h2>
        <div class="features-list">
          <article
            v-for="(feature, i) in languageFeatures"
            :key="feature.title"
            class="feature-row reveal-on-scroll"
            :style="{ transitionDelay: (i * 80) + 'ms' }"
          >
            <span class="feature-index" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="feature-body">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-desc">{{ feature.description }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- 声调系统：可视化 -->
      <section class="tone-section reveal-on-scroll">
        <ToneChart :tones="buyiTones" />
      </section>

      <!-- 非物质文化遗产 -->
      <section class="heritage-section">
        <h2 class="section-title reveal-on-scroll">非物质文化遗产</h2>
        <div class="heritage-list">
          <article
            v-for="(item, i) in heritageItems"
            :key="item.title"
            class="heritage-item reveal-on-scroll"
            :style="{ transitionDelay: (i * 100) + 'ms' }"
          >
            <div class="heritage-img-wrap">
              <img
                :src="item.img"
                :alt="item.imgAlt"
                width="280"
                height="200"
                loading="lazy"
                class="heritage-img"
              />
              <span class="heritage-tag">{{ item.tag }}</span>
            </div>
            <div class="heritage-body">
              <h3 class="heritage-title">{{ item.title }}</h3>
              <p class="heritage-desc">{{ item.description }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- 纹样符号 -->
      <section class="patterns-section">
        <h2 class="section-title reveal-on-scroll">纹样符号</h2>
        <p class="section-intro reveal-on-scroll">布依族纹样不是装饰，是"织在布上、刻在鼓上"的族群密码。</p>
        <div class="patterns-grid">
          <article
            v-for="(sym, i) in patternSymbols"
            :key="sym.name"
            class="pattern-card liquid-glass reveal-on-scroll"
            :style="{ transitionDelay: (i * 100) + 'ms' }"
          >
            <div class="pattern-visual" aria-hidden="true">
              <PatternDecoration :pattern="sym.pattern" :size="120" :opacity="1" />
            </div>
            <div class="pattern-body">
              <h3 class="pattern-name">{{ sym.name }}</h3>
              <p class="pattern-meaning">{{ sym.meaning }}</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </PageShell>
</template>

<style scoped>
.culture-content {
  display: flex;
  flex-direction: column;
  gap: 80px;
  max-width: 880px;
  margin: 0 auto;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 32px 0;
  text-align: center;
}

/* ===== 语言特征：编号纵向列表 ===== */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 24px 8px;
  border-bottom: 1px solid rgba(58, 107, 140, 0.1);
}

.feature-row:last-child {
  border-bottom: none;
}

.feature-index {
  flex-shrink: 0;
  font: 600 28px var(--font-mono);
  color: var(--c-brand-25, rgba(58, 107, 140, 0.25));
  line-height: 1;
  font-variant-numeric: tabular-nums;
  min-width: 48px;
}

.feature-body {
  flex: 1;
}

.feature-title {
  font-size: 19px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 8px 0;
}

.feature-desc {
  font-size: 14px;
  color: var(--c-text-70);
  line-height: 1.7;
  margin: 0;
}

/* ===== 非遗：图卡纵向列表，真实图片叙事 ===== */
.section-intro {
  text-align: center;
  font-size: 14px;
  color: var(--c-text-60);
  line-height: 1.7;
  max-width: 560px;
  margin: -16px auto 32px;
}

/* ===== 声调系统：卡片化图表 ===== */
.tone-section {
  padding: 32px;
  border-radius: 20px;
  background: var(--c-brand-06, rgba(58, 107, 140, 0.04));
  border: 1px solid rgba(58, 107, 140, 0.08);
}

.tone-section :deep(.tone-chart) {
  padding: 0;
}

.tone-section :deep(.chart-title) {
  margin-top: 0;
}

/* ===== 纹样符号：三联卡片 ===== */
.patterns-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 760px) {
  .patterns-grid {
    grid-template-columns: 1fr;
  }
}

.pattern-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
  border-radius: 18px;
  text-align: center;
}

.pattern-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
}

.pattern-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 10px 0;
}

.pattern-meaning {
  font-size: 13px;
  color: var(--c-text-70);
  line-height: 1.7;
  margin: 0;
}

.heritage-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.heritage-item {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
  align-items: center;
}

@media (max-width: 640px) {
  .heritage-item {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.heritage-img-wrap {
  position: relative;
  width: 280px;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .heritage-img-wrap {
    width: 100%;
    height: 220px;
  }
}

.heritage-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 600ms cubic-bezier(0.32, 0.72, 0, 1);
}

.heritage-item:hover .heritage-img {
  transform: scale(1.05);
}

.heritage-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  background: rgba(27, 58, 92, 0.72);
  color: var(--c-white);
  font: 500 11px var(--font-sans);
  border-radius: 999px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.heritage-body {
  min-width: 0;
}

.heritage-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 10px 0;
}

.heritage-desc {
  font-size: 14px;
  color: var(--c-text-70);
  line-height: 1.7;
  margin: 0;
}

/* ===== 滚动入场 ===== */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .heritage-img { transition: none !important; }
}
</style>
