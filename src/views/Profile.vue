<script setup>
import { useRouter } from 'vue-router'
import PageShell from '@/components/common/PageShell.vue'
import imgBg from '@/assets/images/bg-profile.png'

const router = useRouter()

const menuItems = [
  { icon: '❤️', label: '我的收藏', path: '/favorites' },
  { icon: '📊', label: '学习记录', path: '/record' },
  { icon: '⚙️', label: '设置', path: '/settings' }
]
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
            <span class="avatar-icon">👤</span>
          </div>
          <div class="avatar-border"></div>
        </div>
        <h2 class="username">未登录</h2>
        <p class="user-desc">登录后享受更多功能</p>
        <button class="login-btn">登录 / 注册</button>
      </section>

      <!-- 菜单列表 -->
      <section class="menu-section">
        <nav class="menu-list liquid-glass glow-card">
          <div class="glow-effect"></div>
          <a 
            v-for="(item, index) in menuItems" 
            :key="item.label"
            class="menu-item card-interactive"
            @click.prevent="router.push(item.path)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-text">{{ item.label }}</span>
            <span class="menu-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          </a>
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
  max-width: 400px;
  margin: 0 auto;
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
  transition: all 200ms ease;
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
