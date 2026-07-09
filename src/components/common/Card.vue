<script setup>
defineProps({
  padding: {
    type: String,
    default: '20px'
  }
})
</script>

<template>
  <div class="card" :style="{ padding }">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
</style>
