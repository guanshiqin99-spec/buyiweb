<script setup>
import { computed } from 'vue'
import { playToneContour } from '@/utils/toneSynth'
import { toneIndexFromKey } from '@/data/tones'

const props = defineProps({
  tones: { type: Array, required: true },
  selectedIndex: { type: Number, default: 0 }
})
const emit = defineEmits(['select'])
const selectedTone = computed(() => props.tones[props.selectedIndex] || props.tones[0])

async function selectTone(index) {
  emit('select', index)
  await playToneContour(props.tones[index].value)
}

function handleKeyboard(event) {
  const index = toneIndexFromKey(event.key, props.tones.length)
  if (index < 0) return
  event.preventDefault()
  selectTone(index)
}
</script>

<template>
  <section class="tone-piano" tabindex="0" aria-label="声调钢琴，可按数字一到六试听调值示意" @keydown="handleKeyboard">
    <div class="tone-piano__heading">
      <div>
        <p>可玩展项</p>
        <h3>声调钢琴</h3>
      </div>
      <span>数字 1–6</span>
    </div>
    <div class="tone-piano__keys" role="group" aria-label="六个声调琴键">
      <button
        v-for="(tone, index) in tones"
        :key="tone.name"
        type="button"
        :class="{ 'is-selected': index === selectedIndex }"
        :aria-pressed="index === selectedIndex"
        @click="selectTone(index)"
      >
        <small>{{ index + 1 }}</small>
        <strong>{{ tone.name }}</strong>
        <span>{{ tone.value }}</span>
      </button>
    </div>
    <p class="tone-piano__detail"><strong>{{ selectedTone.name }} · {{ selectedTone.value }}</strong>{{ selectedTone.description }}。声音为合成调值轮廓示意，并非真实示例词录音。</p>
  </section>
</template>

<style scoped>
.tone-piano { padding: 26px; border: 1px solid var(--c-divider); border-radius: var(--radius-lg); background: var(--background); outline: none; }
.tone-piano:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 4px; }
.tone-piano__heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.tone-piano__heading p, .tone-piano__heading h3, .tone-piano__detail { margin: 0; }
.tone-piano__heading p { color: var(--c-accent); font-size: 12px; font-weight: 700; }
.tone-piano__heading h3 { margin-top: 4px; color: var(--c-text); font: 600 24px var(--font-serif); }
.tone-piano__heading > span { color: var(--c-text-60); font: 12px var(--font-mono); }
.tone-piano__keys { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); min-height: 150px; gap: 7px; }
.tone-piano__keys button { display: flex; flex-direction: column; align-items: start; justify-content: end; min-width: 0; padding: 14px 10px; border: 1px solid var(--c-divider); border-radius: 0 0 var(--radius-sm) var(--radius-sm); color: var(--c-text); background: var(--c-bg-silver); cursor: pointer; text-align: left; transition: background 180ms ease, color 180ms ease, transform 180ms ease; }
.tone-piano__keys button:hover, .tone-piano__keys button.is-selected { color: var(--c-white); background: var(--c-brand); transform: translateY(-4px); }
.tone-piano__keys button:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 2px; }
.tone-piano__keys small { margin-bottom: auto; opacity: .72; font: 11px var(--font-mono); }
.tone-piano__keys strong { overflow: hidden; max-width: 100%; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.tone-piano__keys span { margin-top: 4px; font: 700 20px var(--font-mono); }
.tone-piano__detail { margin-top: 18px; color: var(--c-text-70); font-size: 13px; line-height: 1.7; }
.tone-piano__detail strong { display: block; color: var(--c-text); font-size: 14px; }
@media (max-width: 620px) { .tone-piano { padding: 20px; } .tone-piano__keys { grid-template-columns: repeat(3, 1fr); min-height: 190px; } }
@media (prefers-reduced-motion: reduce) { .tone-piano__keys button { transition: none; } .tone-piano__keys button:hover, .tone-piano__keys button.is-selected { transform: none; } }
</style>
