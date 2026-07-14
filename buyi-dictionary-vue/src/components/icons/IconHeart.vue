<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })

defineProps({
  filled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <IconBase v-bind="$attrs">
    <path :fill="filled ? 'currentColor' : 'none'" d="M20.8 4.7a5.4 5.4 0 0 0-7.6 0L12 5.9l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z" />
  </IconBase>
</template>
