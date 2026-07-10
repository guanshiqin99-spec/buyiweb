<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { initCursorGlow, destroyCursorGlow } from '@/utils/cursorGlow'

const glow = ref(null)

onMounted(() => {
  // 鼠标跟随光晕：全局固定层，独立于路由与液态玻璃模块
  if (glow.value) initCursorGlow(glow.value)
})

onUnmounted(() => {
  destroyCursorGlow()
})
</script>

<template>
  <div ref="glow" class="cursor-glow" aria-hidden="true"></div>
</template>

<style>
/* 全局固定光晕层：低于 modal(z:100) 与播放器(z:50)，高于内容但 pointer-events 不挡交互 */
.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 460px;
  height: 460px;
  margin: -230px 0 0 -230px;  /* 居中到光标点 */
  border-radius: 50%;
  pointer-events: none;
  z-index: 45;
  opacity: 0;
  /* 双层光晕：外层靛蓝主光 + 内层铜色暖心（民族感） */
  background:
    radial-gradient(circle,
      rgba(212, 136, 58, 0.04) 0%,
      transparent 26%),
    radial-gradient(circle,
      rgba(58, 107, 140, 0.08) 0%,
      rgba(58, 107, 140, 0.04) 34%,
      rgba(58, 107, 140, 0.02) 62%,
      transparent 76%);
  filter: blur(6px);
  will-change: transform, opacity;
  transition: opacity 420ms ease;
}

/* 触屏 / 减弱动效：隐藏整个光晕层 */
@media (prefers-reduced-motion: reduce), (pointer: coarse) {
  .cursor-glow { display: none !important; }
}
</style>
