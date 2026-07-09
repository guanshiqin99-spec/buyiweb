<script setup>
defineProps({
  tag: {
    type: String,
    default: 'div'
  },
  hoverable: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <component
    :is="tag"
    class="liquid-glass-component"
    :class="{ hoverable }"
  >
    <slot />
  </component>
</template>

<style scoped>
.liquid-glass-component {
  position: relative;
  border-radius: 1.2rem;
  background: var(--c-glass);
  border: 1px solid var(--c-white-50);
  overflow: hidden;
}

.liquid-glass-component::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.18) 35%, transparent 55%);
}

.liquid-glass-component::after {
  content: '';
  position: absolute;
  inset: 1px;
  z-index: -2;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 1px 0 0 var(--c-white-35),
              inset 0 -1px 0 0 rgba(0,0,0,0.03);
}

@supports (backdrop-filter: blur(20px)) {
  .liquid-glass-component {
    backdrop-filter: blur(10px) saturate(110%);
    -webkit-backdrop-filter: blur(10px) saturate(110%);
  }
}

@supports not (backdrop-filter: blur(20px)) {
  .liquid-glass-component {
    background: var(--c-white-65);
  }
}

.liquid-glass-component.hoverable {
  transition: transform 250ms cubic-bezier(0.32,0.72,0,1),
              box-shadow 250ms cubic-bezier(0.32,0.72,0,1);
}

.liquid-glass-component.hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px var(--c-shadow-soft);
}
</style>
