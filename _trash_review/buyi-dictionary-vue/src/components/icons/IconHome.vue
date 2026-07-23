<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IconBase v-bind="$attrs">
    <path d="m3.5 10.5 8.5-7 8.5 7" />
    <path d="M5.5 10.5V20h13v-9.5" />
    <path d="M8 20v-5h8v5M4.8 13h14.4" />
  </IconBase>
</template>
