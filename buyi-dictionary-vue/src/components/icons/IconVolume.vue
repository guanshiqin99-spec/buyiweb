<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IconBase v-bind="$attrs">
    <path d="M5 10h3l4-3.5v11L8 14H5Z" />
    <path d="M16 9a4.2 4.2 0 0 1 0 6M18.5 6.5a7.7 7.7 0 0 1 0 11" />
  </IconBase>
</template>
