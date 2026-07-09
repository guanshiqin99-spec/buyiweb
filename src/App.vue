<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<template>
  <div class="app-container">
    <a class="skip-link" href="#main">跳到主内容</a>
    <AppHeader />
    <RouterView />
    <AppFooter />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>
