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
    validator: (v) => ['warm', 'cool', 'accent'].includes(v)
  },
  patternType: {
    type: String,
    default: 'batik',
    validator: (v) => ['batik', 'drum', 'weaving'].includes(v)
  },
  particleDensity: {
    type: Number,
    default: 12
  }
})

const isLoaded = ref(false)
const parallaxOffset = ref(0)

const handleScroll = () => {
  parallaxOffset.value = window.scrollY * 0.3
}

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="page-shell" :class="{ loaded: isLoaded }">
    <div 
      class="page-shell__bg"
      :style="{ transform: `translateY(${parallaxOffset}px)` }"
    >
      <img :src="bgImage" :alt="title" loading="eager" />
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
  </div>
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
  animation: bgReveal 1.4s cubic-bezier(0.32, 0.72, 0, 1) forwards;
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
    rgba(27, 58, 92, 0.92) 0%,
    rgba(27, 58, 92, 0.75) 40%,
    rgba(245, 242, 239, 0.95) 100%
  );
}

.overlay-cool {
  background: linear-gradient(
    180deg,
    rgba(27, 58, 92, 0.94) 0%,
    rgba(58, 107, 140, 0.8) 40%,
    rgba(245, 242, 239, 0.95) 100%
  );
}

.overlay-accent {
  background: linear-gradient(
    180deg,
    rgba(27, 58, 92, 0.92) 0%,
    rgba(212, 136, 58, 0.15) 30%,
    rgba(245, 242, 239, 0.95) 100%
  );
}

.page-shell__hero {
  position: relative;
  z-index: 2;
  min-height: 280px;
  display: flex;
  align-items: flex-end;
  padding: 80px 24px 48px;
}

.page-shell__hero-content {
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
  opacity: 0;
  transform: translateY(24px);
  animation: fadeInUp 0.8s cubic-bezier(0.32, 0.72, 0, 1) 0.3s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
}

.page-shell__subtitle {
  font-size: clamp(14px, 2vw, 18px);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.78);
  margin: 0;
  max-width: 480px;
}

.page-shell__content {
  position: relative;
  z-index: 3;
  padding: 0 24px 120px;
  max-width: 980px;
  margin: 0 auto;
}

.page-shell.loaded .page-shell__content > :deep(*) {
  opacity: 0;
  transform: translateY(20px);
  animation: staggerIn 0.6s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.page-shell.loaded .page-shell__content > :deep(*:nth-child(1)) { animation-delay: 0.4s; }
.page-shell.loaded .page-shell__content > :deep(*:nth-child(2)) { animation-delay: 0.5s; }
.page-shell.loaded .page-shell__content > :deep(*:nth-child(3)) { animation-delay: 0.6s; }
.page-shell.loaded .page-shell__content > :deep(*:nth-child(4)) { animation-delay: 0.7s; }
.page-shell.loaded .page-shell__content > :deep(*:nth-child(5)) { animation-delay: 0.8s; }
.page-shell.loaded .page-shell__content > :deep(*:nth-child(6)) { animation-delay: 0.9s; }

@keyframes staggerIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-shell__bg img,
  .page-shell__hero-content,
  .page-shell.loaded .page-shell__content > :deep(*) {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
