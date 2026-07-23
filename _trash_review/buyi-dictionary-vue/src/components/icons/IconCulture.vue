<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IconBase v-bind="$attrs">
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2.1" />
    <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2.1 2.1M15.9 15.9 18 18M18 6l-2.1 2.1M8.1 15.9 6 18" />
  </IconBase>
</template>
