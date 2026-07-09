<script setup>
const songs = [
  { id: 1, title: '布依族山歌', artist: '布依族民歌传承人', duration: '3:45' },
  { id: 2, title: '好花红', artist: '布依族民歌传承人', duration: '4:12' },
  { id: 3, title: '布依族情歌', artist: '布依族民歌传承人', duration: '3:28' }
]
</script>

<template>
  <div class="songs-page">
    <h1>布依族民歌</h1>
    <p class="subtitle">聆听布依族天籁之音，感受民族音乐魅力</p>
    
    <div class="songs-list">
      <div class="song-card" v-for="song in songs" :key="song.id">
        <div class="song-info">
          <h3>{{ song.title }}</h3>
          <p>{{ song.artist }}</p>
        </div>
        <div class="song-meta">
          <span class="duration">{{ song.duration }}</span>
          <button class="play-btn">▶</button>
        </div>
      </div>
    </div>
    
    <div class="culture-info">
      <h2>布依族音乐文化</h2>
      <p>布依族民歌是布依族文化的重要组成部分，包括山歌、情歌、酒歌等多种类型。</p>
    </div>
  </div>
</template>

<style scoped>
.songs-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  text-align: center;
  color: #1B3A5C;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 50px;
}

.song-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.song-card:hover {
  transform: translateX(5px);
}

.song-info h3 {
  margin: 0 0 5px 0;
  color: #1B3A5C;
}

.song-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.duration {
  color: #999;
}

.play-btn {
  width: 45px;
  height: 45px;
  background: #3A6B8C;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s;
}

.play-btn:hover {
  background: #1B3A5C;
}

.culture-info {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.culture-info h2 {
  color: #1B3A5C;
  margin-bottom: 15px;
}

.culture-info p {
  color: #666;
  line-height: 1.6;
}
</style>
