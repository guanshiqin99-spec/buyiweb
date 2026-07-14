const ENABLED_KEY = 'buyi_learning_reminder_enabled'
const LAST_SHOWN_KEY = 'buyi_learning_reminder_last_shown'
const REMINDER_HOUR = 20
let reminderTimer = null

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function getRegistration() {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.register('/learning-reminder-sw.js', { scope: '/' })
}

async function configureBackgroundSync(registration, enabled) {
  if (!registration?.periodicSync) return
  try {
    if (!enabled) {
      await registration.periodicSync.unregister('buyi-daily-learning-reminder')
      return
    }
    const permission = await navigator.permissions?.query({ name: 'periodic-background-sync' })
    if (!permission || permission.state === 'granted') {
      await registration.periodicSync.register('buyi-daily-learning-reminder', { minInterval: 24 * 60 * 60 * 1000 })
    }
  } catch {
    // 不支持后台周期同步时仍使用页面内定时器。
  }
}

async function showReminder() {
  if (Notification.permission !== 'granted') return
  const today = localDateKey()
  if (localStorage.getItem(LAST_SHOWN_KEY) === today) return
  const registration = await getRegistration()
  if (registration) {
    await registration.showNotification('今天也来学一点布依语吧', {
      body: '打开布依词典，复习几个词或完成一轮文化答题。',
      tag: 'buyi-daily-learning-reminder',
      data: { url: '/learn' }
    })
  } else {
    new Notification('今天也来学一点布依语吧', {
      body: '打开布依词典，复习几个词或完成一轮文化答题。'
    })
  }
  localStorage.setItem(LAST_SHOWN_KEY, today)
}

function scheduleNextReminder() {
  window.clearTimeout(reminderTimer)
  if (localStorage.getItem(ENABLED_KEY) !== 'true' || Notification.permission !== 'granted') return

  const now = new Date()
  if (now.getHours() >= REMINDER_HOUR && localStorage.getItem(LAST_SHOWN_KEY) !== localDateKey(now)) {
    showReminder().catch(() => null)
  }
  const next = new Date(now)
  next.setHours(REMINDER_HOUR, 0, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  reminderTimer = window.setTimeout(async () => {
    await showReminder()
    scheduleNextReminder()
  }, Math.min(next.getTime() - now.getTime(), 2_147_000_000))
}

export async function configureLearningReminder(enabled, { requestPermission = false } = {}) {
  if (!enabled) {
    localStorage.setItem(ENABLED_KEY, 'false')
    window.clearTimeout(reminderTimer)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => configureBackgroundSync(registration, false)).catch(() => null)
    }
    return { enabled: false, permission: 'default' }
  }
  if (!('Notification' in window)) throw new Error('当前浏览器不支持系统通知')

  let permission = Notification.permission
  if (permission === 'default' && requestPermission) permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error(permission === 'denied' ? '浏览器通知权限已被拒绝' : '需要允许通知权限才能开启提醒')

  const registration = await getRegistration()
  await configureBackgroundSync(registration, true)
  localStorage.setItem(ENABLED_KEY, 'true')
  scheduleNextReminder()
  return { enabled: true, permission }
}

export function initLearningReminder() {
  if (localStorage.getItem(ENABLED_KEY) === 'true' && 'Notification' in window && Notification.permission === 'granted') {
    getRegistration().then((registration) => configureBackgroundSync(registration, true)).catch(() => null)
    scheduleNextReminder()
  }
}
