<script setup>
import { computed } from 'vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconVolume from '@/components/icons/IconVolume.vue'

const props = defineProps({
  item: { type: Object, default: null },
  playingId: { type: String, default: null },
  isSharing: { type: Boolean, default: false },
  aiSentenceState: { type: Object, default: () => ({ itemId: '', status: 'idle', content: '' }) },
  relatedState: { type: Object, default: () => ({ itemId: '', status: 'idle', words: [] }) }
})

const emit = defineEmits([
  'play', 'favorite', 'learn', 'share', 'ask-agent', 'ai-sentence', 'related', 'search-related'
])

const isFavorite = computed(() => Boolean(props.item?.isFavorited))
const hasAiSentence = computed(() => props.aiSentenceState.itemId === props.item?.id && props.aiSentenceState.status !== 'idle')
const hasRelated = computed(() => props.relatedState.itemId === props.item?.id && props.relatedState.words.length)
const isLoadingAiSentence = computed(() => props.aiSentenceState.itemId === props.item?.id && props.aiSentenceState.status === 'loading')
const isLoadingRelated = computed(() => props.relatedState.itemId === props.item?.id && props.relatedState.status === 'loading')

function getContentLabel(type) {
  const map = { dictionary: '词语', phrase: '短语', proverb: '谚语', song: '歌曲' }
  return map[type] || '词条'
}
</script>

<template>
  <article v-if="item" class="entry-detail-inner" aria-label="词条详情">
    <div class="entry-detail__topline">
      <span>{{ getContentLabel(item.type) }}</span>
      <span>{{ item.english || '布依语词典' }}</span>
    </div>
    <h2>{{ item.bouyei }}</h2>
    <p class="entry-detail__meaning">{{ item.chinese }}</p>
    <p v-if="item.example" class="entry-detail__note">{{ item.example }}</p>

    <div class="entry-actions">
      <button
        v-pointer-glow="{ tone: 'brand', size: 'sm' }"
        type="button"
        :class="{ 'is-playing': playingId === item.id }"
        :aria-pressed="playingId === item.id"
        @click="emit('play', item)"
      >
        <IconVolume :size="16" />
        {{ playingId === item.id ? '停止播放' : '播放发音' }}
      </button>
      <button
        v-pointer-glow="{ tone: 'accent', size: 'sm' }"
        type="button"
        :aria-pressed="isFavorite"
        :aria-label="isFavorite ? '取消收藏' : '收藏词条'"
        @click="emit('favorite', item)"
      >
        <IconHeart :size="16" :filled="isFavorite" />
        {{ isFavorite ? '已收藏' : '收藏词条' }}
      </button>
      <button type="button" :disabled="isSharing" @click="emit('share', item)">
        {{ isSharing ? '生成中…' : '分享卡片' }}
      </button>
      <button type="button" @click="emit('learn', item)">加入学习</button>
      <button type="button" @click="emit('ask-agent', item)">请求解释</button>
      <button
        type="button"
        :disabled="isLoadingAiSentence"
        @click="emit('ai-sentence', item)"
      >
        {{ isLoadingAiSentence ? '造句中…' : 'AI 造句' }}
      </button>
    </div>

    <div
      v-if="hasAiSentence"
      class="ai-sentence"
      role="status"
    >
      <strong>AI 学习辅助</strong>
      <p v-if="aiSentenceState.status === 'error'">AI 造句暂不可用</p>
      <p v-else>{{ aiSentenceState.content || '正在组织例句…' }}</p>
    </div>

    <section v-if="item.relatedExhibits?.length" class="culture-links" aria-labelledby="culture-links-title">
      <p>由词入馆</p>
      <h3 id="culture-links-title">继续探索关联文化</h3>
      <RouterLink
        v-for="exhibit in item.relatedExhibits"
        :key="exhibit.slug"
        :to="{ path: '/culture', query: { exhibit: exhibit.slug } }"
      >
        <span>{{ exhibit.kicker || '文化展项' }}</span>
        <strong>{{ exhibit.title }}</strong>
        <b aria-hidden="true">→</b>
      </RouterLink>
    </section>

    <SourceBadge class="entry-detail__source" :source="item.source || '布依词典数据库'" />

    <!-- 招募母语者录音：当前词条暂未收录真人发音，欢迎布依语母语者参与录制 -->
    <p class="recruit-block" aria-label="招募母语者录音">
      <span class="recruit-block__kicker">招募母语者录音</span>
      <span class="recruit-block__text">本词条暂未收录真人发音，期待母语者协助录制。</span>
      <a class="recruit-block__contact" href="mailto:24011953@muc.edu.cn">24011953@muc.edu.cn</a>
    </p>

    <section class="related-learning" aria-label="AI 关联推荐">
      <button
        type="button"
        :disabled="isLoadingRelated"
        @click="emit('related', item)"
      >
        {{ isLoadingRelated ? '推荐中…' : '猜你想学' }}
      </button>
      <div v-if="hasRelated">
        <span>AI 推荐</span>
        <button
          v-for="word in relatedState.words"
          :key="word"
          type="button"
          @click="emit('search-related', word)"
        >
          {{ word }}
        </button>
      </div>
    </section>

    <RouterLink class="related-navigation" :to="{ path: '/culture', hash: '#pattern-exhibit' }">相关文化展项 →</RouterLink>
  </article>
</template>

<style scoped>
.entry-detail-inner { color: var(--c-text); }
.entry-detail__topline { display: flex; justify-content: space-between; gap: 16px; color: var(--c-text-60); font-size: .75rem; }
.entry-detail__topline span:first-child { color: var(--c-accent-text); font-weight: 700; }
.entry-detail-inner h2 { margin: 26px 0 6px; font: 600 3rem / 1.1 var(--font-serif); letter-spacing: -.025em; }
.entry-detail__meaning { margin: 0; color: var(--c-text); font-size: 1.25rem; font-weight: 600; }
.entry-detail__note { max-width: 55ch; margin: 28px 0; padding-left: 16px; border-left: 1px solid var(--c-brand-40); color: var(--c-text-70); line-height: 1.8; }
.entry-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.entry-actions button { min-height: 40px; padding: 0 14px; border: 1px solid var(--c-brand-25); border-radius: 999px; color: var(--c-brand); background: transparent; cursor: pointer; font: 600 .8125rem var(--font-sans); }
.entry-actions button:hover { color: var(--c-white); background: var(--c-brand); }
.entry-actions button.is-playing { color: var(--c-white); background: var(--c-brand); }
.entry-actions button:disabled { cursor: wait; opacity: .58; }
.entry-detail__source { margin-top: 28px; }
.ai-sentence { margin-top: 18px; padding: 16px 18px; border-left: 3px solid var(--c-accent); border-radius: var(--radius-sm); color: var(--c-text); background: var(--c-accent-04); }
.ai-sentence strong { color: var(--c-accent-text); font-size: .75rem; letter-spacing: .06em; }
.ai-sentence p { margin: 7px 0 0; color: var(--c-text-70); font-size: .875rem; line-height: 1.75; white-space: pre-wrap; }
.related-learning { display: grid; gap: 12px; margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--c-divider); }
.related-learning > button { justify-self: start; min-height: 38px; padding: 0 15px; border: 1px solid var(--c-brand-25); border-radius: 999px; color: var(--c-brand); background: transparent; cursor: pointer; font: 600 .8125rem var(--font-sans); }
.related-learning > button:hover { color: var(--c-white); background: var(--c-brand); }
.related-learning > button:disabled { cursor: wait; opacity: .58; }
.related-learning > div { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.related-learning > div > span { color: var(--c-text-60); font-size: .75rem; }
.related-learning > div > button { min-height: 34px; padding: 0 12px; border: 0; border-radius: 999px; color: var(--c-brand); background: var(--c-brand-08); cursor: pointer; font: 600 .8125rem var(--font-sans); }
.related-learning > div > button:hover { color: var(--c-white); background: var(--c-brand); }
.related-learning button:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }
.related-navigation { display: inline-flex; margin-top: 20px; color: var(--c-brand); font-size: .875rem; font-weight: 700; text-decoration: none; }
.related-navigation:hover { text-decoration: underline; }
.related-navigation:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }
.culture-links { display: grid; gap: 10px; margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--c-divider); }
.culture-links h3 { margin: 0 0 4px; font: 600 1.5rem var(--font-serif); }
.culture-links a { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; padding: 15px 0; border-bottom: 1px solid var(--c-divider); color: inherit; text-decoration: none; }
.culture-links a:hover strong { color: var(--c-brand); }
.culture-links a span { color: var(--c-text-60); font-size: .75rem; }
.culture-links a strong { color: var(--c-text); font-size: 1rem; }
.culture-links a b { grid-row: span 2; align-self: center; color: var(--c-accent-text); }
.entry-actions button:focus-visible, .culture-links a:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }

/* 招募母语者录音区块：单行紧凑展示在词条详情底部，引导母语者联系 */
.recruit-block { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin-top: 18px; padding: 7px 12px; border-left: 2px solid var(--c-accent); border-radius: var(--radius-sm); background: var(--c-accent-04); font-size: .75rem; line-height: 1.5; }
.recruit-block__kicker { color: var(--c-accent-text); font-weight: 700; letter-spacing: .06em; }
.recruit-block__text { color: var(--c-text-70); }
.recruit-block__contact { color: var(--c-brand); font-weight: 600; text-decoration: none; word-break: break-all; }
.recruit-block__contact:hover { text-decoration: underline; }
.recruit-block__contact:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 2px; border-radius: 2px; }

@media (max-width: 560px) {
  .entry-detail-inner h2 { font-size: 2.5rem; }
  .entry-actions button { flex: 1 1 calc(50% - 8px); }
}
</style>