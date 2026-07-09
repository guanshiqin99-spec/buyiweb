<script setup>
import PageShell from '@/components/common/PageShell.vue'
import imgBg from '@/assets/images/bouyei-craft.jpg'

const languageFeatures = [
  { icon: '🗺️', title: '语言分布', description: '布依语属汉藏语系壮侗语族壮傣语支，主要分布在贵州省' },
  { icon: '🎵', title: '声调系统', description: '布依语有6个声调，是声调语言的重要代表' },
  { icon: '📝', title: '文字系统', description: '布依族历史上使用过多种文字，现以拉丁字母为主' }
]

const heritageItems = [
  { 
    title: '蜡染工艺', 
    description: '世界非物质文化遗产，以靛蓝染料在棉麻布上绘制蓝白相间的图案',
    icon: 'batik'
  },
  { 
    title: '织锦技艺', 
    description: '布依族传统织锦，菱形、锯齿几何纹样中的点缀色',
    icon: 'weaving'
  },
  { 
    title: '银饰制作', 
    description: '布依族盛装银饰，银为驱邪纳福之物，重大节庆佩戴',
    icon: 'drum'
  }
]
</script>

<template>
  <PageShell
    :bg-image="imgBg"
    title="布依族文化"
    subtitle="探索布依族丰富的文化遗产与民族特色"
    overlay-style="warm"
    pattern-type="drum"
    :particle-density="12"
  >
    <div class="culture-content">
      <!-- 语言特征 -->
      <section class="features-section">
        <h2 class="section-title">语言特征</h2>
        <div class="features-grid stagger-enter">
          <div v-for="feature in languageFeatures" :key="feature.title" class="feature-card liquid-glass card-interactive glow-card">
            <div class="glow-effect"></div>
            <div class="card-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- 非物质文化遗产 -->
      <section class="heritage-section">
        <h2 class="section-title">非物质文化遗产</h2>
        <div class="heritage-list stagger-enter">
          <div v-for="item in heritageItems" :key="item.title" class="heritage-item liquid-glass card-interactive glow-card">
            <div class="glow-effect"></div>
            <div class="heritage-indicator" :class="'pattern-' + item.icon"></div>
            <div class="heritage-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <div class="heritage-icon">
              <svg v-if="item.icon === 'batik'" width="40" height="40" viewBox="0 0 48 48" fill="none">
                <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="var(--c-brand)" stroke-width="2"/>
                <circle cx="24" cy="24" r="8" stroke="var(--c-brand)" stroke-width="1.5"/>
              </svg>
              <svg v-else-if="item.icon === 'weaving'" width="40" height="40" viewBox="0 0 48 48" fill="none">
                <path d="M4 12H44M4 24H44M4 36H44" stroke="var(--c-brand)" stroke-width="2"/>
                <path d="M12 4V44M24 4V44M36 4V44" stroke="var(--c-brand)" stroke-width="1.5"/>
              </svg>
              <svg v-else width="40" height="40" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="18" stroke="var(--c-brand)" stroke-width="2"/>
                <circle cx="24" cy="24" r="10" stroke="var(--c-brand)" stroke-width="1.5"/>
                <circle cx="24" cy="24" r="4" fill="var(--c-brand)"/>
              </svg>
            </div>
          </div>
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
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 40px 0;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  padding: 32px;
  text-align: center;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 12px 0;
}

.feature-card p {
  font-size: 14px;
  color: var(--c-text-70);
  line-height: 1.6;
  margin: 0;
}

.heritage-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.heritage-item {
  display: flex;
  align-items: center;
  padding: 28px;
  gap: 24px;
  position: relative;
  overflow: hidden;
}

.heritage-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--c-brand);
}

.heritage-content {
  flex: 1;
}

.heritage-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 8px 0;
}

.heritage-content p {
  font-size: 14px;
  color: var(--c-text-70);
  line-height: 1.6;
  margin: 0;
}

.heritage-icon {
  flex-shrink: 0;
  opacity: 0.6;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.heritage-item:hover .heritage-icon {
  transform: rotate(5deg) scale(1.1);
  opacity: 1;
}

@media (max-width: 640px) {
  .heritage-item {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  
  .heritage-indicator {
    left: 0;
    right: 0;
    bottom: auto;
    width: auto;
    height: 4px;
  }
}
</style>
