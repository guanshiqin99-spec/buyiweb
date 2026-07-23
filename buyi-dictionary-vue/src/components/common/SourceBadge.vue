<script setup>
defineProps({
  source: {
    type: String,
    required: true
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <span class="source-badge" :class="{ 'source-badge--verified': verified }">
    <span class="source-badge__prefix">来源</span>
    <a
      v-if="sourceUrl"
      class="source-badge__name"
      :href="sourceUrl"
      target="_blank"
      rel="noopener noreferrer"
    >{{ source }}</a>
    <span v-else class="source-badge__name">{{ source }}</span>
    <span
      class="source-badge__status"
      :aria-label="verified ? '来源已核验' : '来源为馆内整理'"
    >
      <span aria-hidden="true">{{ verified ? '✓' : '◇' }}</span>
      {{ verified ? '已核验' : '馆内整理' }}
    </span>
  </span>
</template>

<style scoped>
.source-badge {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--c-divider);
  border-radius: 999px;
  color: var(--c-text-60);
  font-size: 12px;
  line-height: 1.35;
}

.source-badge__prefix {
  padding-right: 6px;
  border-right: 1px solid var(--c-divider);
}

.source-badge__name {
  overflow-wrap: anywhere;
  color: inherit;
  font-weight: 600;
  text-decoration: none;
}

a.source-badge__name:hover {
  color: var(--c-brand);
  text-decoration: underline;
  text-underline-offset: 2px;
}

a.source-badge__name:focus-visible {
  border-radius: 3px;
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
}

.source-badge__status {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding-left: 6px;
  border-left: 1px solid var(--c-divider);
}

.source-badge--verified .source-badge__status {
  color: var(--c-brand);
  font-weight: 700;
}
</style>
