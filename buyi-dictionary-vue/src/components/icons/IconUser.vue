<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IconBase v-bind="$attrs">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.4 3.3-5.2 7-5.2s6.2 1.8 7 5.2" />
  </IconBase>
</template>
