<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="avatar">👤</div>
      <h1>未登录</h1>
      <p>登录后享受更多功能</p>
      <button class="login-btn">登录</button>
    </div>
    
    <div class="menu-list">
      <div class="menu-item">
        <span class="menu-icon">❤️</span>
        <span class="menu-text">我的收藏</span>
        <span class="menu-arrow">→</span>
      </div>
      <div class="menu-item">
        <span class="menu-icon">📊</span>
        <span class="menu-text">学习记录</span>
        <span class="menu-arrow">→</span>
      </div>
      <div class="menu-item">
        <span class="menu-icon">⚙️</span>
        <span class="menu-text">设置</span>
        <span class="menu-arrow">→</span>
      </div>
    </div>
    
    <div class="app-info">
      <p>布依族词典 v1.0.0</p>
      <p>© 2026 少数民族语言数字化保护</p>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 15px;
}

.profile-header h1 {
  color: #1B3A5C;
  margin: 0 0 10px 0;
}

.profile-header p {
  color: #666;
  margin: 0 0 20px 0;
}

.login-btn {
  padding: 12px 40px;
  background: #3A6B8C;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.menu-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 40px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-icon {
  font-size: 20px;
  margin-right: 15px;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.menu-arrow {
  color: #999;
}

.app-info {
  text-align: center;
  color: #999;
  font-size: 14px;
}

.app-info p {
  margin: 5px 0;
}
</style>
