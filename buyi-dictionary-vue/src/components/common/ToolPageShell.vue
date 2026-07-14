<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  bgImage: {
    type: String,
    default: ''
  },
  showOverlay: {
    type: Boolean,
    default: true
  },
  imageTone: {
    type: String,
    default: 'dark',
    validator: (value) => ['dark', 'light'].includes(value)
  }
})

const bgParallax = ref(0)
let scrollHandler = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const coefficient = isMobile ? 0.025 : 0.05
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
  <main id="main" class="tool-page" :class="{ 'tool-page--image-only': bgImage && !showOverlay, 'tool-page--image-light': bgImage && !showOverlay && imageTone === 'light' }" :data-nav-tone="bgImage && !showOverlay ? imageTone : (showOverlay ? 'light' : null)" data-motion-surface="tool">
    <div v-if="bgImage" class="tool-page__bg" :style="{ transform: `translate3d(0, ${bgParallax}px, 0)` }">
      <img :src="bgImage" alt="" loading="eager" fetchpriority="high" />
    </div>
    <div v-if="bgImage && showOverlay" class="tool-page__overlay" />

    <header class="tool-page__header">
      <div class="tool-page__heading">
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
    </header>

    <div class="tool-page__content">
      <slot />
    </div>
  </main>
</template>

<style scoped>
.tool-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: var(--c-text);
  background: transparent;
}

/* 固定背景图层：让液体玻璃有内容可折射 */
.tool-page__bg {
  position: fixed;
  inset: -10%;
  z-index: -2;
  will-change: transform;
}

.tool-page__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
  animation: toolBgReveal var(--duration-slow) var(--ease-out-quint) forwards;
}

@keyframes toolBgReveal {
  to {
    transform: scale(1);
  }
}

/* 浅色蒙层：仅轻压保证文字可读，保留足够纹理供玻璃折射 */
.tool-page__overlay {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(247, 245, 242, 0.58) 0%,
    rgba(247, 245, 242, 0.66) 45%,
    rgba(247, 245, 242, 0.74) 100%
  );
}

.tool-page__header {
  position: relative;
  z-index: 1;
  padding: 116px 24px 34px;
  overflow: hidden;
  background: transparent;
}

.tool-page__heading {
  position: relative;
  z-index: 1;
  width: min(100%, 820px);
  margin: 0 auto;
}

.tool-page__heading h1 {
  margin: 0;
  color: var(--c-text);
  font: 600 32px / 1.2 var(--font-sans);
  letter-spacing: -0.025em;
  text-wrap: balance;
  opacity: 0;
  transform: translateY(20px);
  animation: toolTitleIn 500ms var(--ease-out-quint) 120ms forwards;
}

@keyframes toolTitleIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tool-page__heading p {
  max-width: 60ch;
  margin: 9px 0 0;
  color: var(--c-text-70);
  font-size: 14px;
  line-height: 1.65;
  text-wrap: pretty;
  opacity: 0;
  transform: translateY(14px);
  animation: toolSubtitleIn 450ms var(--ease-out-quint) 240ms forwards;
}

@keyframes toolSubtitleIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tool-page--image-only .tool-page__heading h1 {
  color: var(--c-white);
  text-shadow: 0 2px 18px rgba(7, 23, 36, .78);
}

.tool-page--image-only .tool-page__heading p {
  color: var(--c-white-78);
  text-shadow: 0 1px 12px rgba(7, 23, 36, .84);
}

.tool-page--image-only.tool-page--image-light .tool-page__heading h1 {
  color: var(--c-text);
  text-shadow: 0 2px 16px rgba(255, 255, 255, .78);
}

.tool-page--image-only.tool-page--image-light .tool-page__heading p {
  color: var(--c-text-70);
  text-shadow: 0 1px 10px rgba(255, 255, 255, .82);
}

.tool-page__content {
  position: relative;
  z-index: 2;
  width: min(100%, 820px);
  margin: 0 auto;
  padding: 40px 24px 120px;
  opacity: 0;
  transform: translateY(24px);
  animation: toolContentIn 550ms var(--ease-out-quint) 340ms forwards;
}

@keyframes toolContentIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 工具页液体玻璃：恢复折射与厚度层，仅克制镜面高光 */
.tool-page__content :deep(.liquid-glass),
.tool-page__content :deep(.liquid-glass-content),
.tool-page__content :deep(.liquid-glass-hero),
.tool-page__content :deep(.liquid-glass-quiet) {
  --lg-spec: 0;
  --lg-tint-a: 0.78;
  border: 1px solid var(--c-divider);
  box-shadow: var(--shadow-sm);
  transition: border-color var(--duration-fast) var(--ease-out-quart), box-shadow var(--duration-fast) var(--ease-out-quart);
}

.tool-page__content :deep(.liquid-glass:hover),
.tool-page__content :deep(.liquid-glass-content:hover),
.tool-page__content :deep(.liquid-glass-hero:hover),
.tool-page__content :deep(.liquid-glass-quiet:hover) {
  transform: none;
  box-shadow: var(--shadow-sm);
}

.tool-page__content :deep(button:not(:disabled):active) {
  transform: scale(.98);
}

@media (max-width: 640px) {
  .tool-page__header {
    padding-top: 96px;
    padding-bottom: 28px;
  }

  .tool-page__heading h1 {
    font-size: 28px;
  }

  .tool-page__content {
    padding-top: 28px;
    padding-bottom: 96px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tool-page__bg,
  .tool-page__bg img,
  .tool-page__heading h1,
  .tool-page__heading p,
  .tool-page__content {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}

/* 深色模式：蒙层改为深色，保持玻璃折射可见 */
[data-theme="dark"] .tool-page__overlay {
  background: linear-gradient(
    180deg,
    rgba(15, 20, 25, 0.62) 0%,
    rgba(15, 20, 25, 0.70) 45%,
    rgba(15, 20, 25, 0.78) 100%
  );
}

/* 深色模式：image-only 页面也压一层深色蒙层，避免亮背景图冲淡深色氛围 */
[data-theme="dark"] .tool-page--image-only::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: rgba(15, 20, 25, 0.5);
}

/* 深色模式：玻璃卡片显式切为深色调，抵消 scoped :deep() 选择器高优先级覆盖 */
[data-theme="dark"] .tool-page__content :deep(.liquid-glass),
[data-theme="dark"] .tool-page__content :deep(.liquid-glass-content),
[data-theme="dark"] .tool-page__content :deep(.liquid-glass-hero),
[data-theme="dark"] .tool-page__content :deep(.liquid-glass-quiet) {
  --lg-tint: 22, 28, 36;
  --lg-tint-a: 0.82;
}
</style>
