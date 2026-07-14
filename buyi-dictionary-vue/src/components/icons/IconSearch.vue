<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IconBase v-bind="$attrs">
    <circle cx="11" cy="11" r="7.25" />
    <path d="m16.2 16.2 4.3 4.3" />
  </IconBase>
</template>
