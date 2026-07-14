<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IconBase v-bind="$attrs">
    <path d="M5 10h3l4-3.5v11L8 14H5Z" />
    <path d="m16 10 4 4m0-4-4 4" />
  </IconBase>
</template>
