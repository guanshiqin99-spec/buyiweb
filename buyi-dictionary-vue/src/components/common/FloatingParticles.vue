<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  pattern: {
    type: String,
    default: 'batik',
    validator: (v) => ['batik', 'drum', 'weaving'].includes(v)
  },
  count: {
    type: Number,
    default: 12
  },
  color: {
    type: String,
    default: 'var(--c-brand)'
  }
})

const particles = ref([])
let animationId = null

// Pattern SVG paths
const patterns = {
  batik: `<path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1"/>`,
  drum: `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
         <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1"/>
         <circle cx="12" cy="12" r="2" fill="currentColor"/>
         <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="1.5"/>
         <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="1.5"/>
         <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="1.5"/>
         <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5"/>`,
  weaving: `<path d="M2 6H22M2 12H22M2 18H22" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 2V22M12 2V22M18 2V22" stroke="currentColor" stroke-width="1"/>
            <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="18" cy="18" r="1.5" fill="currentColor"/>`
}

const createParticle = () => {
  const size = Math.random() * 40 + 20
  return {
    id: Math.random().toString(36).substr(2, 9),
    x: Math.random() * 100,
    y: Math.random() * 100,
    size,
    opacity: Math.random() * 0.04 + 0.03,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * -30,
    drift: Math.random() * 20 - 10
  }
}

onMounted(() => {
  const count = Math.min(props.count, 6)
  particles.value = Array.from({ length: count }, createParticle)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <div class="floating-particles" aria-hidden="true">
    <svg
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :width="particle.size"
      :height="particle.size"
      viewBox="0 0 24 24"
      :style="{
        left: particle.x + '%',
        top: particle.y + '%',
        opacity: particle.opacity,
        animationDuration: particle.duration + 's',
        animationDelay: particle.delay + 's',
        '--drift': particle.drift + 'px',
        color: color
      }"
      v-html="patterns[pattern]"
    />
  </div>
</template>

<style scoped>
.floating-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  animation: floatUp linear infinite;
  will-change: transform;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: var(--particle-opacity, 0.08);
  }
  90% {
    opacity: var(--particle-opacity, 0.08);
  }
  100% {
    transform: translateY(-100vh) translateX(var(--drift, 0px)) rotate(90deg);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none !important;
    display: none;
  }
}

@media (max-width: 640px) {
  .particle:nth-child(n+5) {
    display: none;
  }
}
</style>
