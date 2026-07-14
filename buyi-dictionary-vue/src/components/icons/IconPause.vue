<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IconBase v-bind="$attrs">
    <path d="M9 6v12M15 6v12" />
  </IconBase>
</template>
