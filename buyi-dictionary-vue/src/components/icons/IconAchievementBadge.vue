<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  motif: {
    type: String,
    default: 'batik',
    validator: value => ['batik', 'brocade', 'drum', 'mountain', 'grain', 'song'].includes(value)
  },
  size: {
    type: [Number, String],
    default: 44
  }
})
</script>

<template>
  <svg
    v-bind="$attrs"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- A cloth-patch frame, rather than a medal or game token. -->
    <rect x="5.5" y="5.5" width="37" height="37" rx="8" fill="currentColor" fill-opacity="0.075" />
    <rect x="5.5" y="5.5" width="37" height="37" rx="8" />
    <path d="m10.5 14 2-2 2 2-2 2-2-2ZM33.5 14l2-2 2 2-2 2-2-2ZM10.5 34l2-2 2 2-2 2-2-2ZM33.5 34l2-2 2 2-2 2-2-2Z" stroke-width="1.2" />

    <!-- 蜡染旋花：用于初次解锁与通用成就。 -->
    <g v-if="motif === 'batik'">
      <circle cx="24" cy="24" r="10.5" />
      <path d="M24 15c3.3 0 5.8 2.4 5.8 5.3 0 2.5-1.7 4.3-3.9 4.3-1.8 0-3.2-1.3-3.2-3 0-1.3.9-2.4 2.1-2.4 1 0 1.8.8 1.8 1.7" />
      <path d="M24 33c-3.3 0-5.8-2.4-5.8-5.3 0-2.5 1.7-4.3 3.9-4.3 1.8 0 3.2 1.3 3.2 3 0 1.3-.9 2.4-2.1 2.4-1 0-1.8-.8-1.8-1.7" />
      <path d="M15.3 21.5c1.2-2.2 3.3-3.5 5.7-3.5M32.7 26.5c-1.2 2.2-3.3 3.5-5.7 3.5" />
    </g>

    <!-- 织锦菱格：对应词汇、学习与记录类成就。 -->
    <g v-else-if="motif === 'brocade'">
      <path d="m24 12 10 6-10 6-10-6 10-6ZM24 24l10 6-10 6-10-6 10-6Z" />
      <path d="m14 18 10 6 10-6M14 30l10-6 10 6M24 12v18" />
      <circle cx="24" cy="24" r="1.8" fill="currentColor" stroke="none" />
    </g>

    <!-- 铜鼓同心纹：对应坚持、连续学习与里程碑。 -->
    <g v-else-if="motif === 'drum'">
      <circle cx="24" cy="24" r="10.5" />
      <circle cx="24" cy="24" r="5.5" />
      <path d="M24 11.8v3M24 33.2v3M11.8 24h3M33.2 24h3M15.4 15.4l2.1 2.1M30.5 30.5l2.1 2.1M32.6 15.4l-2.1 2.1M17.5 30.5l-2.1 2.1" />
      <path d="m24 20.8 1 2.2 2.4.2-1.8 1.6.5 2.4-2.1-1.2-2.1 1.2.5-2.4-1.8-1.6 2.4-.2 1-2.2Z" fill="currentColor" stroke="none" />
    </g>

    <!-- 山水水纹：用于探索、词典浏览等自然意象类成就。 -->
    <g v-else-if="motif === 'mountain'">
      <path d="m13.5 29 7-9 4.2 5 3.1-4 6.7 8" />
      <path d="M13 32c2.2-1.4 4.4-1.4 6.6 0 2.2 1.4 4.4 1.4 6.6 0 2.2-1.4 4.4-1.4 6.6 0" />
      <path d="M16 35c1.8-1 3.6-1 5.4 0 1.8 1 3.6 1 5.4 0 1.8-1 3.6-1 5.4 0" stroke-width="1.25" />
      <circle cx="31.5" cy="15.5" r="2.3" />
    </g>

    <!-- 稻穗纹：对应收藏、积累与收集类成就。 -->
    <g v-else-if="motif === 'grain'">
      <path d="M24 34V14" />
      <path d="M24 18c-3.9-.2-6.2-2.1-6.9-5.3 3.8.1 6.2 1.8 6.9 5.3ZM24 22c-4.2.1-6.6 2-7.3 5.4 4-.1 6.5-1.8 7.3-5.4ZM24 18c3.9-.2 6.2-2.1 6.9-5.3-3.8.1-6.2 1.8-6.9 5.3ZM24 22c4.2.1 6.6 2 7.3 5.4-4-.1-6.5-1.8-7.3-5.4Z" />
      <path d="M20.5 32c1.1.8 2.3 1.2 3.5 1.2 1.2 0 2.4-.4 3.5-1.2" />
    </g>

    <!-- 民歌回纹：对应民歌、聆听与声音类成就。 -->
    <g v-else>
      <path d="M17 17.5c2-2.1 4.3-3.1 7-3.1 2.7 0 5 1 7 3.1" />
      <path d="M14.2 21.5c2.8-3.1 6-4.6 9.8-4.6 3.8 0 7 1.5 9.8 4.6" />
      <path d="M14.2 26.5c2.8 3.1 6 4.6 9.8 4.6 3.8 0 7-1.5 9.8-4.6" />
      <path d="M17 30.5c2 2.1 4.3 3.1 7 3.1 2.7 0 5-1 7-3.1" />
      <path d="M24 14.4v19.2M17 24h14" stroke-width="1.2" />
      <circle cx="24" cy="24" r="2.2" fill="currentColor" stroke="none" />
    </g>
  </svg>
</template>
