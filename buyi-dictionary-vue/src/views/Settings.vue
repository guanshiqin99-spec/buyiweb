<script setup>
import { ref, onMounted, watch } from 'vue'
import ToolPageShell from '@/components/common/ToolPageShell.vue'
import imgBg from '@/assets/images/generated/dictionary-archive-study.png'
import { settingsApi } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const settings = ref({
  theme: themeStore.mode,
  notifications: true,
  autoplay: false,
  language: 'zh-CN'
})
const isLoading = ref(true)
const isSaving = ref(false)
const saveMsg = ref('')

onMounted(async () => {
  try {
    const data = await settingsApi.get()
    if (data) settings.value = { ...settings.value, ...data }
  } catch (e) {
    // 后端未实现时使用默认值
    console.error('加载设置失败', e)
  } finally {
    isLoading.value = false
  }
})

async function handleSave() {
  isSaving.value = true
  saveMsg.value = ''
  try {
    await settingsApi.update(settings.value)
    saveMsg.value = '设置已保存'
  } catch (e) {
    saveMsg.value = '保存失败，请重试'
    console.error('保存设置失败', e)
  } finally {
    isSaving.value = false
    setTimeout(() => { saveMsg.value = '' }, 3000)
  }
}

function handleLogout() {
  if (window.confirm('确定要退出当前账号吗？')) {
    authStore.logout()
  }
}

// 主题切换即时生效
watch(() => settings.value.theme, (mode) => {
  themeStore.setMode(mode)
})
</script>

<template>
  <ToolPageShell title="设置" subtitle="个性化你的使用体验" :bg-image="imgBg" :show-overlay="false" image-tone="light">
    <div class="settings-content">
      <section v-if="isLoading" class="settings-loading" aria-live="polite">
        <p>加载中…</p>
      </section>

      <template v-else>
        <!-- 外观设置 -->
        <section class="settings-group liquid-glass liquid-glass-content">
          <h2 class="group-title">外观</h2>
          <div class="setting-row">
            <div class="setting-label">
              <p class="setting-name">主题模式</p>
              <p class="setting-desc">选择浅色或深色界面</p>
            </div>
            <select v-model="settings.theme" class="setting-select" aria-label="主题模式">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
        </section>

        <!-- 播放设置 -->
        <section class="settings-group liquid-glass-quiet">
          <h2 class="group-title">播放</h2>
          <div class="setting-row">
            <div class="setting-label">
              <p class="setting-name">自动播放</p>
              <p class="setting-desc">进入民歌页时自动播放</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.autoplay" />
              <span class="toggle-slider" aria-hidden="true"></span>
              <span class="sr-only">自动播放</span>
            </label>
          </div>
        </section>

        <!-- 通知设置 -->
        <section class="settings-group liquid-glass-quiet">
          <h2 class="group-title">通知</h2>
          <div class="setting-row">
            <div class="setting-label">
              <p class="setting-name">学习提醒</p>
              <p class="setting-desc">每日提醒你坚持学习</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.notifications" />
              <span class="toggle-slider" aria-hidden="true"></span>
              <span class="sr-only">学习提醒</span>
            </label>
          </div>
        </section>

        <!-- 账户操作 -->
        <section class="settings-group liquid-glass-quiet">
          <h2 class="group-title">账户</h2>
          <div class="setting-row">
            <div class="setting-label">
              <p class="setting-name">退出登录</p>
              <p class="setting-desc">退出当前账号</p>
            </div>
            <button class="danger-btn" type="button" @click="handleLogout">退出</button>
          </div>
        </section>

        <!-- 保存按钮 -->
        <div class="save-bar">
          <p v-if="saveMsg" class="save-msg" aria-live="polite">{{ saveMsg }}</p>
          <button
            class="save-btn"
            type="button"
            :disabled="isSaving"
            @click="handleSave"
          >
            {{ isSaving ? '保存中…' : '保存设置' }}
          </button>
        </div>
      </template>
    </div>
  </ToolPageShell>
</template>

<style scoped>
.settings-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-loading {
  text-align: center;
  padding: 48px 24px;
  color: var(--c-text-50);
}

.settings-group {
  padding: 24px 24px 20px;
}

.group-title {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 16px 0;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--c-divider);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  min-width: 0;
}

.setting-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text);
  margin: 0;
}

.setting-desc {
  font-size: 12px;
  color: var(--c-text-60);
  margin: 2px 0 0 0;
}

.setting-select {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--c-brand-25);
  border-radius: 8px;
  background: var(--c-glass);
  color: var(--c-text);
  font: 400 14px var(--font-sans);
  cursor: pointer;
  outline: none;
}

[data-theme="dark"] .setting-select {
  background: var(--c-glass);
}

.setting-select:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--c-brand-25);
  border-radius: 999px;
  transition: background 200ms ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 200ms ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle input:checked + .toggle-slider {
  background: var(--c-brand);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle input:focus-visible + .toggle-slider {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.danger-btn {
  padding: 8px 20px;
  border: 1px solid color-mix(in srgb, var(--c-danger) 35%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--c-danger);
  font: 500 13px var(--font-sans);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
  flex-shrink: 0;
}

.danger-btn:hover {
  background: var(--c-danger-08);
  border-color: color-mix(in srgb, var(--c-danger) 55%, transparent);
}

.danger-btn:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.save-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
}

.save-msg {
  font-size: 13px;
  color: var(--c-success);
  margin: 0;
}

.save-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 999px;
  background: var(--c-brand);
  color: var(--c-brand-foreground);
  font: 600 14px var(--font-sans);
  cursor: pointer;
  transition: background 150ms ease, transform 200ms ease, box-shadow 200ms ease;
}

.save-btn:hover:not(:disabled) {
  background: var(--c-brand-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--c-brand-25);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}
</style>
