<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FloatingParticles from './FloatingParticles.vue'

const props = defineProps({
  bgImage: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  overlayStyle: {
    type: String,
    default: 'warm',
    validator: (v) => ['warm', 'cool', 'accent', 'culture'].includes(v)
  },
  patternType: {
    type: String,
    default: 'batik',
    validator: (v) => ['batik', 'drum', 'weaving'].includes(v)
  },
  particleDensity: {
    type: Number,
    default: 6
  }
})

const isLoaded = ref(false)
const parallaxOffset = ref(0)

const handleScroll = () => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const coefficient = isMobile ? 0.05 : 0.1
  parallaxOffset.value = window.scrollY * coefficient
}

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <main id="main" class="page-shell" :class="{ loaded: isLoaded }">
    <div
      class="page-shell__bg"
      :style="{ transform: `translate3d(0, ${parallaxOffset}px, 0)` }"
    >
      <img :src="bgImage" alt="" width="1920" height="1080" loading="eager" fetchpriority="high" />
    </div>

    <div class="page-shell__overlay" :class="'overlay-' + overlayStyle" />

    <FloatingParticles 
      :pattern="patternType" 
      :count="particleDensity" 
    />

    <div class="page-shell__hero">
      <div class="page-shell__hero-content">
        <h1 class="page-shell__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-shell__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="page-shell__content">
      <slot />
    </div>
  </main>
</template>

<style scoped>
.page-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.page-shell__bg {
  position: fixed;
  inset: -20%;
  z-index: -2;
  will-change: transform;
}


.page-shell__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.08);
  animation: bgReveal var(--duration-slow) var(--ease-out-quint) forwards;
}

@keyframes bgReveal {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.page-shell__overlay {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.overlay-warm {
  background: linear-gradient(
    180deg,
    rgba(27, 58, 92, 0.72) 0%,
    rgba(27, 58, 92, 0.42) 45%,
    rgba(247, 245, 242, 0.90) 100%
  );
}

.overlay-cool {
  background: linear-gradient(
    180deg,
    rgba(27, 58, 92, 0.74) 0%,
    rgba(58, 107, 140, 0.50) 45%,
    rgba(247, 245, 242, 0.90) 100%
  );
}

.overlay-accent {
  background: linear-gradient(
    180deg,
    rgba(27, 58, 92, 0.72) 0%,
    rgba(212, 136, 58, 0.10) 35%,
    rgba(247, 245, 242, 0.90) 100%
  );
}

.overlay-culture {
  background: linear-gradient(
    180deg,
    rgba(3, 23, 39, 0.56) 0%,
    rgba(3, 23, 39, 0.72) 42%,
    rgba(3, 23, 39, 0.93) 100%
  );
}

.page-shell__hero {
  position: relative;
  z-index: 2;
  min-height: 280px;
  display: flex;
  align-items: flex-end;
  padding: 80px 24px 48px;
  padding-top: calc(80px + env(safe-area-inset-top, 0px));
}

.page-shell__hero-content {
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
}

.page-shell__title {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(32px, 6vw, 56px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #fff;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateY(28px) scale(0.98);
  filter: blur(6px);
  animation: heroTitleIn 620ms var(--ease-out-expo) 100ms forwards;
}

@keyframes heroTitleIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
    letter-spacing: -0.03em;
  }
}

.page-shell__subtitle {
  font-size: clamp(14px, 2vw, 18px);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.78);
  margin: 0;
  max-width: 480px;
  opacity: 0;
  transform: translateY(18px);
  animation: heroSubtitleIn 520ms var(--ease-out-quint) 260ms forwards;
}

@keyframes heroSubtitleIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-shell__content {
  position: relative;
  z-index: 3;
  padding: 0 24px 120px;
  max-width: 980px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(32px);
  animation: contentRise 600ms var(--ease-out-quint) 380ms forwards;
}

@keyframes contentRise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-shell__bg,
  .page-shell__bg img,
  .page-shell__title,
  .page-shell__subtitle,
  .page-shell__content {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
</style>
