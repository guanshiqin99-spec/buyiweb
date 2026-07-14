<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  strokeWidth: {
    type: [Number, String],
    default: 2
  },
  ariaLabel: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <svg
    v-bind="$attrs"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="ariaLabel ? 'img' : undefined"
    :aria-label="ariaLabel || undefined"
    :aria-hidden="ariaLabel ? undefined : 'true'"
    focusable="false"
  >
    <title v-if="ariaLabel">{{ ariaLabel }}</title>
    <slot />
  </svg>
</template>
