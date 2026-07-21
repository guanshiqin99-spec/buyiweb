<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import imgBg from '@/assets/images/generated/login-river-bridge.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mode = ref('login') // 'login' | 'register'
const isLoading = ref(false)
const errorMsg = ref('')

const form = ref({
  username: '',
  password: '',
  nickname: ''
})

// 前端校验：与后端 DTO 规则一致
const errors = computed(() => {
  const e = {}
  if (!form.value.username) {
    e.username = '请输入用户名'
  } else if (form.value.username.length < 3) {
    e.username = '用户名至少 3 个字符'
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.value.username)) {
    e.username = '用户名只能包含字母、数字和下划线'
  }

  if (!form.value.password) {
    e.password = '请输入密码'
  } else if (form.value.password.length < 6) {
    e.password = '密码至少 6 位'
  }

  if (mode.value === 'register' && form.value.nickname && form.value.nickname.length > 64) {
    e.nickname = '昵称不超过 64 个字符'
  }
  return e
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

async function handleSubmit() {
  errorMsg.value = ''
  if (!isValid.value) {
    // 聚焦首个错误字段
    const firstError = Object.keys(errors.value)[0]
    if (firstError) {
      const el = document.getElementById(firstError)
      el?.focus()
    }
    return
  }

  // 防重复提交：加载期间禁用按钮
  isLoading.value = true
  try {
    if (mode.value === 'login') {
      await authStore.login({
        username: form.value.username,
        password: form.value.password
      })
    } else {
      await authStore.register({
        username: form.value.username,
        password: form.value.password,
        nickname: form.value.nickname || form.value.username
      })
    }
    // 跳转回源页，避免登录后丢失原访问路径
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/')
  } catch (error) {
    // 安全：只展示后端返回的业务 message，不暴露技术堆栈
    const msg = error.response?.data?.message
    errorMsg.value = Array.isArray(msg) ? msg[0] : (msg || '操作失败，请重试')
    nextTick(() => {
      const el = document.querySelector('.form-error')
      if (el && typeof el.focus === 'function') el.focus()
    })
  } finally {
    isLoading.value = false
  }
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMsg.value = ''
}
</script>

<template>
  <!-- 声明导航栏下方背景 tone：与首页 hero 一致，供 AppHeader 分段探测消费 -->
  <div class="login-page" data-nav-tone="dark">
    <div class="login-bg">
      <img :src="imgBg" alt="布依族风光" width="1920" height="1280" loading="eager" />
    </div>
    <div class="login-scrim"></div>

    <div class="login-card liquid-glass liquid-glass-hero">
      <h1 class="login-title">{{ mode === 'login' ? '登录' : '注册' }}</h1>
      <p class="login-subtitle">布依族词典 · 传承语言之美</p>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            name="username"
            autocomplete="username"
            spellcheck="false"
            placeholder="字母、数字、下划线，至少3位…"
            :aria-invalid="!!errors.username"
            :aria-describedby="errors.username ? 'username-error' : undefined"
          />
          <span v-if="errors.username" id="username-error" class="field-error">{{ errors.username }}</span>
        </div>

        <div class="form-field">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            name="password"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            placeholder="至少6位…"
            :aria-invalid="!!errors.password"
            :aria-describedby="errors.password ? 'password-error' : undefined"
          />
          <span v-if="errors.password" id="password-error" class="field-error">{{ errors.password }}</span>
        </div>

        <div v-if="mode === 'register'" class="form-field">
          <label for="nickname">昵称（可选）</label>
          <input
            id="nickname"
            v-model="form.nickname"
            type="text"
            name="nickname"
            autocomplete="nickname"
            spellcheck="false"
            placeholder="留空则用用户名…"
            :aria-invalid="!!errors.nickname"
            :aria-describedby="errors.nickname ? 'nickname-error' : undefined"
          />
          <span v-if="errors.nickname" id="nickname-error" class="field-error">{{ errors.nickname }}</span>
        </div>

        <p v-if="errorMsg" class="form-error" role="alert" aria-live="polite" tabindex="-1">{{ errorMsg }}</p>

        <button
          type="submit"
          class="submit-btn"
          :disabled="isLoading"
        >
          {{ isLoading ? '处理中…' : (mode === 'login' ? '登录' : '注册') }}
        </button>
      </form>

      <p class="switch-mode">
        {{ mode === 'login' ? '还没有账号？' : '已有账号？' }}
        <button type="button" class="switch-link" @click="switchMode">
          {{ mode === 'login' ? '去注册' : '去登录' }}
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
}

.login-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, var(--c-overlay-deep-1), var(--c-overlay-deep-2));
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 44px 32px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 入场：轻量级联揭幕，与液体玻璃光泽同帧节奏 */
  animation: loginCardReveal 0.7s var(--ease-out-quart) both;
}

@keyframes loginCardReveal {
  from { opacity: 0; transform: translateY(18px) scale(0.985); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.login-title {
  font-family: var(--font-serif);
  font-size: 34px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--c-text);
  margin: 0 0 6px 0;
  animation: loginFadeUp 0.7s var(--ease-out-quart) 0.08s both;
}

/* 品牌靛蓝细线：分割标题与表单，呼应布依族青花瓷纹样 */
.login-subtitle {
  position: relative;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--c-text-60);
  margin: 0 0 32px 0;
  animation: loginFadeUp 0.7s var(--ease-out-quart) 0.16s both;
}

.login-subtitle::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -14px;
  width: 36px;
  height: 1.5px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, var(--c-brand), transparent);
  opacity: 0.7;
}

@keyframes loginFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-70);
}

/* 输入框使用语义令牌，浅/深色模式自动切换，避免白色透明系在深色卡片上突兀 */
.form-field input {
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--c-brand-25);
  border-radius: 12px;
  background: var(--input);
  color: var(--c-text);
  font: 400 15px var(--font-sans);
  outline: none;
  transition: border-color 200ms ease;
}

.form-field input:focus-visible {
  border-color: var(--c-brand);
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.form-field input::placeholder {
  color: var(--c-text-50);
}

.field-error {
  font-size: 12px;
  color: var(--c-danger);
}

.form-error {
  font-size: 13px;
  color: var(--c-danger);
  text-align: center;
  margin: 0;
  padding: 8px;
  background: var(--c-danger-08);
  border-radius: 8px;
}

.submit-btn {
  height: 48px;
  border: none;
  border-radius: 999px;
  /* 品牌靛蓝渐变，比平涂更具景深 */
  background: linear-gradient(135deg, var(--c-brand-dark) 0%, var(--c-brand) 55%, var(--c-brand-light) 100%);
  color: var(--c-brand-foreground);
  font: 600 15px var(--font-sans);
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: filter 150ms ease, transform 150ms ease, box-shadow 200ms ease;
  margin-top: 8px;
  box-shadow: 0 6px 20px rgba(27, 58, 92, 0.28);
}

.submit-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(27, 58, 92, 0.36);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 3px;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-mode {
  margin: 24px 0 0 0;
  font-size: 13px;
  color: var(--c-text-60);
  text-align: center;
}

.switch-mode a,
.switch-mode .switch-link {
  color: var(--c-brand);
  font-weight: 500;
  text-decoration: none;
}

.switch-mode a:hover,
.switch-mode .switch-link:hover {
  text-decoration: underline;
}

.switch-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  border-radius: 4px;
}

.switch-link:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}
</style>
