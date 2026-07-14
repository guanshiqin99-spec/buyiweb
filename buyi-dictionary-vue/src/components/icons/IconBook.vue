<script setup>
import IconBase from './IconBase.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <IconBase v-bind="$attrs">
    <path d="M4.5 5.2c2.8-1.2 5.5-.8 7.5 1.4v12.2c-2-2.1-4.7-2.5-7.5-1.3Z" />
    <path d="M19.5 5.2c-2.8-1.2-5.5-.8-7.5 1.4v12.2c2-2.1 4.7-2.5 7.5-1.3Z" />
    <path d="M7 9.7c1.2-.3 2.2-.2 3 .2M17 9.7c-1.2-.3-2.2-.2-3 .2" />
  </IconBase>
</template>
