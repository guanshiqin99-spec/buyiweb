<script setup>
import { ref } from 'vue'
import PageShell from '@/components/common/PageShell.vue'
import imgBg from '@/assets/images/folk-song-bg.jpg'

const songs = [
  { id: 1, title: '布依族山歌', artist: '布依族民歌传承人', duration: '3:45', genre: '山歌' },
  { id: 2, title: '好花红', artist: '布依族民歌传承人', duration: '4:12', genre: '情歌' },
  { id: 3, title: '布依族情歌', artist: '布依族民歌传承人', duration: '3:28', genre: '情歌' },
  { id: 4, title: '酒歌', artist: '布依族民歌传承人', duration: '2:56', genre: '酒歌' }
]

const currentPlaying = ref(null)

const togglePlay = (id) => {
  currentPlaying.value = currentPlaying.value === id ? null : id
}
</script>

<template>
  <PageShell
    :bg-image="imgBg"
    title="布依族民歌"
    subtitle="聆听布依族天籁之音，感受民族音乐魅力"
    overlay-style="accent"
    pattern-type="drum"
    :particle-density="10"
  >
    <div class="songs-content">
      <!-- 歌曲列表 -->
      <section class="songs-section">
        <h2 class="section-title">传统民歌</h2>
        <div class="songs-list stagger-enter">
          <div 
            v-for="song in songs" 
            :key="song.id" 
            class="song-card liquid-glass card-interactive glow-card"
            :class="{ playing: currentPlaying === song.id }"
          >
            <div class="glow-effect"></div>
            <div class="song-cover">
              <div class="cover-icon">🎵</div>
            </div>
            <div class="song-info">
              <h3>{{ song.title }}</h3>
              <p class="artist">{{ song.artist }}</p>
              <span class="genre-tag">{{ song.genre }}</span>
            </div>
            <div class="song-meta">
              <span class="duration">{{ song.duration }}</span>
              <button 
                class="play-btn pulse-hover" 
                :class="{ active: currentPlaying === song.id }"
                @click="togglePlay(song.id)"
                :aria-label="currentPlaying === song.id ? '暂停' : '播放'"
              >
                <svg v-if="currentPlaying === song.id" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 文化介绍 -->
      <section class="culture-section">
        <div class="culture-card liquid-glass glow-card glow-accent">
          <div class="glow-effect"></div>
          <h2>布依族音乐文化</h2>
          <p>布依族民歌是布依族文化的重要组成部分，包括山歌、情歌、酒歌等多种类型。这些歌曲承载着布依族的历史记忆和情感表达，是国家级非物质文化遗产。</p>
          <div class="culture-tags">
            <span class="tag">山歌</span>
            <span class="tag">情歌</span>
            <span class="tag">酒歌</span>
            <span class="tag">祭祀歌</span>
          </div>
        </div>
      </section>
    </div>
  </PageShell>
</template>

<style scoped>
.songs-content {
  display: flex;
  flex-direction: column;
  gap: 64px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 32px 0;
  text-align: center;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.song-card {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
  transition: all 300ms cubic-bezier(0.32, 0.72, 0, 1);
}

.song-card.playing {
  border-color: var(--c-brand-25);
  box-shadow: 0 0 0 1px var(--c-brand-25), 0 8px 24px var(--c-shadow-soft);
}

.song-cover {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--c-brand-08), var(--c-accent-10));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cover-icon {
  font-size: 24px;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 4px 0;
}

.artist {
  font-size: 13px;
  color: var(--c-text-60);
  margin: 0 0 8px 0;
}

.genre-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--c-brand-08);
  color: var(--c-brand);
  font-size: 11px;
  font-weight: 500;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.duration {
  font-size: 13px;
  color: var(--c-text-50);
  font-family: var(--font-mono);
}

.play-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: var(--c-brand);
  color: var(--c-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;
}

.play-btn:hover {
  background: var(--c-brand-dark);
}

.play-btn.active {
  background: var(--c-accent);
}

.culture-card {
  padding: 40px;
  text-align: center;
}

.culture-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 16px 0;
}

.culture-card p {
  font-size: 15px;
  color: var(--c-text-70);
  line-height: 1.7;
  margin: 0 0 24px 0;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.culture-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 16px;
  border-radius: 999px;
  background: var(--c-brand-08);
  color: var(--c-brand);
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 640px) {
  .song-card {
    padding: 16px;
  }
  
  .song-cover {
    width: 48px;
    height: 48px;
  }
}
</style>
