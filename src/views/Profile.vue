<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import PageShell from '@/components/common/PageShell.vue'
import BarChart from '@/components/specific/BarChart.vue'
import { useAuthStore } from '@/stores/auth'
import { meApi, recordsApi, badgesApi } from '@/utils/api'
import imgBg from '@/assets/images/bg-profile.png'

const router = useRouter()
const authStore = useAuthStore()
const userStats = ref({ favoriteCount: 0, learningRecordCount: 0 })
// 学习统计仪表盘：今日/总数/连续天数/各类型计数
const learnStats = ref({ todayCount: 0, totalCount: 0, streakDays: 0, typeCounts: {} })
const badges = ref([])

const typeLabels = {
  dictionary: '词汇',
  phrase: '短语',
  proverb: '谚语',
  song: '民歌'
}

// 将 typeCounts 对象映射为 BarChart 数据
const typeChartData = computed(() => {
  const tc = learnStats.value.typeCounts || {}
  return Object.entries(tc)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ category: typeLabels[k] || k, count: v }))
})

const menuItems = [
  { icon: '❤️', label: '我的收藏', path: '/favorites' },
  { icon: '📊', label: '学习记录', path: '/record' },
  { icon: '⚙️', label: '设置', path: '/settings' }
]

const handleLogout = () => {
  if (window.confirm('确定要退出当前账号吗？')) {
    authStore.logout()
  }
}

// 已解锁徽章数
const unlockedCount = computed(() => badges.value.filter(b => b.unlocked || b.isUnlocked).length)

onMounted(async () => {
  if (!authStore.isLoggedIn) return
  // 并行拉取用户信息 + 学习统计 + 徽章
  const tasks = [
    meApi.get().then(res => { userStats.value = res.stats || userStats.value }).catch(e => console.error('获取用户信息失败', e)),
    recordsApi.stats().then(res => { learnStats.value = res || learnStats.value }).catch(e => console.error('获取学习统计失败', e)),
    badgesApi.list().then(res => { badges.value = res?.items || res?.list || res || [] }).catch(e => console.error('获取徽章失败', e))
  ]
  await Promise.allSettled(tasks)
})
</script>

<template>
  <PageShell
    :bg-image="imgBg"
    title="个人中心"
    subtitle="管理你的学习进度与收藏"
    overlay-style="cool"
    pattern-type="weaving"
    :particle-density="8"
  >
    <div class="profile-content">
      <!-- 头像区域 -->
      <section class="avatar-section liquid-glass glow-card">
        <div class="glow-effect"></div>
        <div class="avatar-wrapper">
          <div class="avatar">
            <img v-if="authStore.userInfo?.avatarUrl" :src="authStore.userInfo.avatarUrl" alt="头像" width="80" height="80" class="avatar-img" />
            <span v-else class="avatar-icon">👤</span>
          </div>
          <div class="avatar-border"></div>
        </div>
        <h2 class="username">{{ authStore.isLoggedIn ? (authStore.userInfo?.nickname || authStore.userInfo?.username || '用户') : '未登录' }}</h2>
        <p class="user-desc">{{ authStore.isLoggedIn ? `收藏 ${userStats.favoriteCount} · 学习 ${userStats.learningRecordCount}` : '登录后享受更多功能' }}</p>
        <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="login-btn">登录 / 注册</RouterLink>
        <button v-else class="login-btn" type="button" @click="handleLogout">退出登录</button>
      </section>

      <!-- 学习统计仪表盘（仅登录态显示） -->
      <section v-if="authStore.isLoggedIn" class="stats-dashboard">
        <h2 class="dashboard-title">学习概览</h2>
        <div class="stats-grid">
          <div class="stat-card liquid-glass glow-card reveal reveal-1">
            <div class="glow-effect"></div>
            <span class="stat-label">今日学习</span>
            <span class="stat-value">{{ learnStats.todayCount ?? 0 }}</span>
            <span class="stat-unit">条</span>
          </div>
          <div class="stat-card liquid-glass glow-card reveal reveal-2">
            <div class="glow-effect"></div>
            <span class="stat-label">累计学习</span>
            <span class="stat-value">{{ learnStats.totalCount ?? 0 }}</span>
            <span class="stat-unit">条</span>
          </div>
          <div class="stat-card liquid-glass glow-card reveal reveal-3">
            <div class="glow-effect"></div>
            <span class="stat-label">连续打卡</span>
            <span class="stat-value">{{ learnStats.streakDays ?? 0 }}</span>
            <span class="stat-unit">天</span>
          </div>
          <div class="stat-card liquid-glass glow-card reveal reveal-4">
            <div class="glow-effect"></div>
            <span class="stat-label">收藏词汇</span>
            <span class="stat-value">{{ userStats.favoriteCount ?? 0 }}</span>
            <span class="stat-unit">个</span>
          </div>
        </div>

        <!-- 徽章墙 -->
        <div v-if="badges.length" class="badge-wall">
          <div class="badge-wall-header">
            <h3 class="badge-wall-title">成就徽章</h3>
            <span class="badge-wall-count" aria-live="polite">已解锁 {{ unlockedCount }} / {{ badges.length }}</span>
          </div>
          <div class="badge-grid">
            <div
              v-for="badge in badges"
              :key="badge.id"
              class="badge-item"
              :class="{ 'badge-locked': !(badge.unlocked || badge.isUnlocked) }"
              :title="badge.description || badge.name"
            >
              <div class="badge-icon" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </div>
              <span class="badge-name">{{ badge.name }}</span>
            </div>
          </div>
        </div>

        <!-- 学习类型分布图 -->
        <div v-if="typeChartData.length" class="chart-card liquid-glass glow-card">
          <div class="glow-effect"></div>
          <BarChart :data="typeChartData" title="学习类型分布" :height="220" />
        </div>
      </section>

      <!-- 菜单列表 -->
      <section class="menu-section">
        <nav class="menu-list liquid-glass glow-card">
          <div class="glow-effect"></div>
          <RouterLink
            v-for="item in menuItems"
            :key="item.label"
            :to="item.path"
            class="menu-item card-interactive"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.label }}</span>
            <span class="menu-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          </RouterLink>
        </nav>
      </section>

      <!-- 应用信息 -->
      <section class="app-info">
        <div class="app-logo">🎋</div>
        <p class="app-name">布依族词典</p>
        <p class="app-version">v1.0.0</p>
        <p class="app-copyright">© 2026 少数民族语言数字化保护</p>
      </section>
    </div>
  </PageShell>
</template>

<style scoped>
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 480px;
  margin: 0 auto;
}

/* ===== 学习统计仪表盘 ===== */
.stats-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: var(--c-text-60);
  margin-bottom: 8px;
}

.stat-value {
  font: 600 32px var(--font-sans);
  color: var(--c-brand);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-unit {
  font-size: 11px;
  color: var(--c-text-50);
  margin-top: 4px;
}

/* 徽章墙 */
.badge-wall {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.badge-wall-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badge-wall-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
}

.badge-wall-count {
  font-size: 12px;
  color: var(--c-text-60);
  font-variant-numeric: tabular-nums;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 12px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
  text-align: center;
}

.badge-icon {
  color: var(--c-accent);
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.badge-item:hover .badge-icon {
  transform: scale(1.1);
}

.badge-item.badge-locked .badge-icon {
  color: var(--c-text-35);
  opacity: 0.5;
}

.badge-name {
  font-size: 11px;
  color: var(--c-text-70);
  line-height: 1.3;
}

.badge-item.badge-locked .badge-name {
  color: var(--c-text-50);
}

/* 学习类型分布图 */
.chart-card {
  padding: 8px 0;
}

.chart-card :deep(.chart-container) {
  padding: 16px 20px;
}

.chart-card :deep(.chart-title) {
  margin-top: 0;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 32px;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--c-brand-08), var(--c-accent-10));
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 36px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.avatar-border {
  position: absolute;
  inset: -4px;
  border-radius: 999px;
  border: 2px solid var(--c-brand-25);
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 8px 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-desc {
  font-size: 14px;
  color: var(--c-text-60);
  margin: 0 0 24px 0;
}

.login-btn {
  padding: 12px 32px;
  background: var(--c-brand);
  color: var(--c-white);
  border: none;
  border-radius: 999px;
  font: 600 14px var(--font-sans);
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease, box-shadow 200ms ease;
}

.login-btn:hover {
  background: var(--c-brand-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--c-brand-25);
}

/* 菜单列表 */
.menu-list {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background 200ms ease;
}

.menu-item:hover {
  background: var(--c-brand-06);
}

.menu-item:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: -2px;
  background: var(--c-brand-06);
}

.menu-icon {
  font-size: 20px;
  margin-right: 16px;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--c-text);
}

.menu-arrow {
  color: var(--c-text-35);
  transition: transform 200ms ease;
}

.menu-item:hover .menu-arrow {
  transform: translateX(4px);
  color: var(--c-brand);
}

/* 应用信息 */
.app-info {
  text-align: center;
  padding: 24px;
}

.app-logo {
  font-size: 32px;
  margin-bottom: 12px;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 4px 0;
}

.app-version {
  font-size: 12px;
  color: var(--c-text-50);
  margin: 0 0 8px 0;
  font-family: var(--font-mono);
}

.app-copyright {
  font-size: 12px;
  color: var(--c-text-35);
  margin: 0;
}

@media (max-width: 640px) {
  .avatar-section {
    padding: 32px 24px;
  }
}
</style>
