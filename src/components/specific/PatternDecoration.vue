<script setup>
defineProps({
  pattern: {
    type: String,
    default: 'batik',
    validator: (value) => ['batik', 'drum', 'weaving'].includes(value)
  },
  size: {
    type: Number,
    default: 100
  },
  opacity: {
    type: Number,
    default: 0.1
  }
})
</script>

<template>
  <div class="pattern-decoration" :style="{ opacity }">
    <!-- 蜡染鱼鸟纹 -->
    <svg
      v-if="pattern === 'batik'"
      :width="size"
      :height="size"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 菱形基础纹样 -->
      <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      <path d="M50 20 L80 50 L50 80 L20 50 Z" stroke="var(--c-brand)" stroke-width="1" fill="none" />
      
      <!-- 鱼形纹样 -->
      <path d="M35 45 Q40 35 50 40 Q60 35 65 45 Q60 55 50 50 Q40 55 35 45 Z" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      <circle cx="42" cy="43" r="2" fill="var(--c-brand)" />
      
      <!-- 鸟形纹样 -->
      <path d="M45 55 Q50 48 55 55 Q58 60 55 65 Q50 62 45 65 Q42 60 45 55 Z" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      <path d="M50 55 L50 48" stroke="var(--c-brand)" stroke-width="1" />
      
      <!-- 装饰点 -->
      <circle cx="50" cy="15" r="2" fill="var(--c-brand)" />
      <circle cx="85" cy="50" r="2" fill="var(--c-brand)" />
      <circle cx="50" cy="85" r="2" fill="var(--c-brand)" />
      <circle cx="15" cy="50" r="2" fill="var(--c-brand)" />
    </svg>

    <!-- 铜鼓太阳纹 -->
    <svg
      v-else-if="pattern === 'drum'"
      :width="size"
      :height="size"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 外圈 -->
      <circle cx="50" cy="50" r="45" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      <circle cx="50" cy="50" r="38" stroke="var(--c-brand)" stroke-width="1" fill="none" />
      
      <!-- 太阳光芒 -->
      <line v-for="i in 12" :key="i"
        x1="50" y1="12"
        x2="50" y2="25"
        :transform="otate( 50 50)"
        stroke="var(--c-brand)" stroke-width="1.5"
      />
      
      <!-- 内圈纹样 -->
      <circle cx="50" cy="50" r="20" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      <circle cx="50" cy="50" r="8" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      <circle cx="50" cy="50" r="3" fill="var(--c-brand)" />
      
      <!-- 菱形装饰 -->
      <path d="M50 30 L55 50 L50 70 L45 50 Z" stroke="var(--c-brand)" stroke-width="1" fill="none" />
      <path d="M30 50 L50 45 L70 50 L50 55 Z" stroke="var(--c-brand)" stroke-width="1" fill="none" />
    </svg>

    <!-- 织锦几何纹 -->
    <svg
      v-else-if="pattern === 'weaving'"
      :width="size"
      :height="size"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 锯齿纹 -->
      <polyline points="10,20 25,35 40,20 55,35 70,20 85,35" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      <polyline points="10,40 25,55 40,40 55,55 70,40 85,55" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      <polyline points="10,60 25,75 40,60 55,75 70,60 85,75" stroke="var(--c-brand)" stroke-width="1.5" fill="none" />
      
      <!-- 菱形连续纹 -->
      <path d="M20 30 L30 40 L20 50 L10 40 Z" stroke="var(--c-brand)" stroke-width="1" fill="none" />
      <path d="M50 30 L60 40 L50 50 L40 40 Z" stroke="var(--c-brand)" stroke-width="1" fill="none" />
      <path d="M80 30 L90 40 L80 50 L70 40 Z" stroke="var(--c-brand)" stroke-width="1" fill="none" />
      
      <!-- 点缀 -->
      <circle cx="20" cy="40" r="2" fill="var(--c-brand)" />
      <circle cx="50" cy="40" r="2" fill="var(--c-brand)" />
      <circle cx="80" cy="40" r="2" fill="var(--c-brand)" />
    </svg>
  </div>
</template>

<style scoped>
.pattern-decoration {
  pointer-events: none;
  user-select: none;
}
</style>
