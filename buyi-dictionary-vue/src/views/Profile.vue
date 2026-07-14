<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ToolPageShell from '@/components/common/ToolPageShell.vue'
import imgBg from '@/assets/images/generated/profile-learning-journal.png'
import BarChart from '@/components/specific/BarChart.vue'
import { useAuthStore } from '@/stores/auth'
import { meApi, recordsApi, badgesApi } from '@/utils/api'
import IconHeartFilled from '@/components/icons/IconHeartFilled.vue'
import IconBook from '@/components/icons/IconBook.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconAchievementBadge from '@/components/icons/IconAchievementBadge.vue'

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

// 菜单项统一使用线性 SVG 图标，避免 emoji 跨平台渲染差异与读屏朗读
const menuItems = [
  { icon: IconHeartFilled, label: '我的收藏', path: '/favorites' },
  { icon: IconBook, label: '学习记录', path: '/record' },
  { icon: IconSettings, label: '设置', path: '/settings' }
]

const handleLogout = () => {
  if (window.confirm('确定要退出当前账号吗？')) {
    authStore.logout()
  }
}

// 已解锁徽章数
const unlockedCount = computed(() => badges.value.filter(b => b.unlocked || b.isUnlocked).length)

// 徽章不使用奖杯、星级等游戏化符号；根据服务端标识、名称和描述映射为布依族纹样。
// 新增的后端徽章若尚未配置关键词，会回退到蜡染旋花，保持视觉一致性。
const badgeMotif = (badge) => {
  const source = [badge?.code, badge?.type, badge?.category, badge?.id, badge?.name, badge?.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/(收藏|收集|喜爱|favorite|collect|heart|save)/.test(source)) return 'grain'
  if (/(连续|坚持|打卡|天|streak|day|milestone|keep)/.test(source)) return 'drum'
  if (/(民歌|歌曲|聆听|声音|song|music|listen|audio)/.test(source)) return 'song'
  if (/(词汇|词典|学习|记录|字词|learn|study|record|vocabulary|word)/.test(source)) return 'brocade'
  if (/(探索|浏览|足迹|山|water|explore|browse|journey)/.test(source)) return 'mountain'
  return 'batik'
}

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
  <ToolPageShell title="个人中心" subtitle="管理你的学习进度与收藏" :bg-image="imgBg" :show-overlay="false" image-tone="light">
    <div class="profile-content">
      <!-- 头像区域 -->
      <section class="avatar-section liquid-glass liquid-glass-content">
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
          <div class="stat-card liquid-glass liquid-glass-content">
            <span class="stat-label">今日学习</span>
            <span class="stat-value">{{ learnStats.todayCount ?? 0 }}</span>
            <span class="stat-unit">条</span>
          </div>
          <div class="stat-card liquid-glass liquid-glass-content">
            <span class="stat-label">累计学习</span>
            <span class="stat-value">{{ learnStats.totalCount ?? 0 }}</span>
            <span class="stat-unit">条</span>
          </div>
          <div class="stat-card liquid-glass liquid-glass-content">
            <span class="stat-label">连续打卡</span>
            <span class="stat-value">{{ learnStats.streakDays ?? 0 }}</span>
            <span class="stat-unit">天</span>
          </div>
          <div class="stat-card liquid-glass liquid-glass-content">
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
              <div class="badge-icon" :class="`badge-icon--${badgeMotif(badge)}`" aria-hidden="true">
                <IconAchievementBadge :motif="badgeMotif(badge)" :size="44" />
              </div>
              <span class="badge-name">{{ badge.name }}</span>
            </div>
          </div>
        </div>

        <!-- 学习类型分布图 -->
        <div v-if="typeChartData.length" class="chart-card liquid-glass liquid-glass-content">
          <BarChart :data="typeChartData" title="学习类型分布" :height="220" />
        </div>
      </section>

      <!-- 菜单列表 -->
      <section class="menu-section">
        <nav class="menu-list liquid-glass-quiet">
          <RouterLink
            v-for="item in menuItems"
            :key="item.label"
            :to="item.path"
            class="menu-item card-interactive"
          >
            <component :is="item.icon" class="menu-icon" :size="20" />
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
        <div class="app-logo" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="16" cy="16" r="14" />
            <circle cx="16" cy="16" r="9" />
            <circle cx="16" cy="16" r="4" />
            <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <p class="app-name">布依族词典</p>
        <p class="app-version">v1.0.0</p>
        <p class="app-copyright">© 2026 少数民族语言数字化保护</p>
      </section>
    </div>
  </ToolPageShell>
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
  font: 600 var(--stat-size-sm) var(--font-stat);
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
  min-height: 82px;
  padding: 10px 6px 8px;
  border: 1px solid var(--c-divider);
  border-radius: 16px;
  background: var(--c-glass);
  text-align: center;
}

.badge-icon {
  display: grid;
  place-items: center;
  color: var(--c-brand);
}

.badge-icon--drum,
.badge-icon--grain {
  color: var(--c-accent-text);
}

.badge-icon--mountain {
  color: var(--c-text-70);
}

.badge-item.badge-locked .badge-icon {
  color: var(--c-text-35);
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
  color: var(--c-brand);
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
  color: var(--c-brand-foreground);
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

.login-btn:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 3px;
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
  outline: 2px solid var(--c-focus);
  outline-offset: -2px;
  background: var(--c-brand-06);
}

.menu-icon {
  color: var(--c-brand);
  margin-right: 16px;
  flex-shrink: 0;
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
  color: var(--c-brand);
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
