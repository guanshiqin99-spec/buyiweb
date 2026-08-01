const { meApi, recordsApi, badgesApi } = require('../../utils/api');
const History = require('../../utils/learningHistory');
const { syncAppearance } = require('../../utils/view');
const { generateSuggestions } = require('../../utils/learningSuggestion');
const { getDailyTasks } = require('../../utils/dailyTasks');
const {
  getTodayTypeCounts,
  USER_PROGRESS_UPDATED_EVENT,
  normalizeLearningStats,
  normalizeBadgesResponse,
} = require('../../utils/userProgress');
const { getTypeLabel } = require('../../utils/content-mapper');

function getDefaultUserInfo() {
  return {
    nickname: '点击登录',
    nickName: '点击登录',
    avatarUrl: '/images/avatar.png',
  };
}

function getDefaultStats() {
  return {
    favoriteCount: 0,
    learningRecordCount: 0,
    today: 0,
    streak: 0,
  };
}

Page({
  data: {
    userInfo: getDefaultUserInfo(),
    currentTheme: 'light',
    fontSizeClass: 'medium',
    isLogin: false,
    stats: getDefaultStats(),
    learnStats: { todayCount: 0, totalCount: 0, streakDays: 0, typeCounts: {} },
    todayTypeCounts: {},
    badges: [],
    suggestions: [],
    dailyTasks: [],
    allDailyTasksCompleted: false,
    dailyTasksCompletedCount: 0,
    unlockedBadgeCount: 0,
    totalBadgeCount: 0,
    typeChartData: [],
    selectedBadge: null,
    isExporting: false,
    shareCardRef: null,
    shareImageUrl: '',
    // 卡片折叠状态（默认展开）
    dashboardCollapsed: false,
    tasksCollapsed: false,
    suggestionCollapsed: false,
    badgesCollapsed: false,
    chartCollapsed: false,
  },

  onLoad() {
    this._favoritesHandler = () => this.refreshUser();
    this._historyHandler = () => this.refreshUser();
    this._progressHandler = (payload) => {
      // 进度更新：刷新今日类型计数、每日任务与统计，不阻塞既有事件处理
      const todayTypeCounts = getTodayTypeCounts();
      const learnStats = Object.assign({}, this.data.learnStats, { todayTypeCounts });
      const dailyTasks = getDailyTasks({
        ...learnStats,
        todayTypeCounts,
      });
      this.setData({
        todayTypeCounts,
        dailyTasks,
        allDailyTasksCompleted: dailyTasks.length > 0 && dailyTasks.every((task) => task.completed),
        dailyTasksCompletedCount: dailyTasks.filter((task) => task.completed).length,
      });
      this.refreshProfileProgress();
    };
    try {
      getApp().eventBus.on('favorites:changed', this._favoritesHandler);
      getApp().eventBus.on('history:changed', this._historyHandler);
      getApp().eventBus.on(USER_PROGRESS_UPDATED_EVENT, this._progressHandler);
    } catch (error) {}
  },

  onUnload() {
    try {
      getApp().eventBus.off('favorites:changed', this._favoritesHandler);
      getApp().eventBus.off('history:changed', this._historyHandler);
      getApp().eventBus.off(USER_PROGRESS_UPDATED_EVENT, this._progressHandler);
    } catch (error) {}
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 });
    }
    syncAppearance(this);
    this.refreshUser();
    this.refreshProfileProgress();
  },

  async refreshUser() {
    const app = getApp();
    const isLogin = !!app.globalData.isLogin;

    if (!isLogin) {
      this.setData({
        isLogin: false,
        userInfo: getDefaultUserInfo(),
        stats: getDefaultStats(),
      });
      return;
    }

    const localUser = app.globalData.userInfo || {};
    let fallbackNickname = localUser.nickName || localUser.nickname || '布依语词典用户';

    this.setData({
      isLogin: true,
      userInfo: {
        nickName: fallbackNickname,
        nickname: fallbackNickname,
        avatarUrl: localUser.avatarUrl || '/images/avatar.png',
      },
    });

    try {
      const [mePayload, historyPayload] = await Promise.all([
        meApi.get(),
        History.list(1, 1),
      ]);
      const user = mePayload.user || {};
      const meStats = mePayload.stats || {};
      const historyStats = historyPayload.stats || {};
      
      let finalNickname = user.nickname || user.nickName || fallbackNickname;

      this.setData({
        userInfo: {
          nickName: finalNickname,
          nickname: finalNickname,
          avatarUrl: user.avatarUrl || this.data.userInfo.avatarUrl,
        },
        stats: {
          favoriteCount: Number(meStats.favoriteCount || 0),
          learningRecordCount: Number(meStats.learningRecordCount || 0),
          today: Number(historyStats.today || 0),
          streak: Number(historyStats.streak || 0),
        },
      });
      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        id: user.id || localUser.id,
        nickName: finalNickname,
        nickname: finalNickname,
        avatarUrl: user.avatarUrl || this.data.userInfo.avatarUrl,
      };
      wx.setStorageSync('loginState', {
        ...wx.getStorageSync('loginState'),
        userInfo: app.globalData.userInfo
      });
    } catch (error) {}
  },

  // 成就体系：并行拉取用户信息、学习统计与徽章，单个失败不阻塞其他
  async refreshProfileProgress() {
    const app = getApp();
    const isLogin = !!(app && app.globalData && app.globalData.isLogin);
    if (!isLogin) {
      this.setData({
        learnStats: { todayCount: 0, totalCount: 0, streakDays: 0, typeCounts: {}, favoriteCount: 0 },
        todayTypeCounts: {},
        badges: [],
        suggestions: [],
        dailyTasks: [],
        allDailyTasksCompleted: false,
        dailyTasksCompletedCount: 0,
        unlockedBadgeCount: 0,
        totalBadgeCount: 0,
        typeChartData: [],
      });
      return;
    }

    const safeGet = (promise) => promise.catch(() => null);
    const [mePayload, statsPayload, badgesPayload] = await Promise.all([
      safeGet(meApi.get()),
      safeGet(recordsApi.stats()),
      safeGet(badgesApi.list()),
    ]);

    const rawStats = (statsPayload && typeof statsPayload === 'object') ? statsPayload : {};
    const learnStats = normalizeLearningStats(rawStats);
    const favoriteCount = Number((mePayload && mePayload.stats && mePayload.stats.favoriteCount) || 0);
    learnStats.favoriteCount = favoriteCount;

    const todayTypeCounts = getTodayTypeCounts();
    learnStats.todayTypeCounts = todayTypeCounts;

    const badgesResp = badgesPayload ? normalizeBadgesResponse(badgesPayload) : { items: [], total: 0, unlockedCount: 0 };
    const rawBadges = Array.isArray(badgesResp) ? badgesResp : (badgesResp.items || []);
    const badges = rawBadges.map((badge) => ({
      ...badge,
      pattern: this.badgeMotif(badge),
      unlockedAtText: badge.isUnlocked && badge.unlockedAt ? this.formatBadgeDate(badge.unlockedAt) : '',
    }));
    const totalBadgeCount = Array.isArray(badgesResp)
      ? badges.length
      : (badgesResp.total != null ? badgesResp.total : badges.length);
    const unlockedBadgeCount = badges.filter((b) => b.isUnlocked).length;

    const suggestions = generateSuggestions({ ...learnStats, todayTypeCounts });
    const dailyTasks = getDailyTasks({ ...learnStats, todayTypeCounts });
    const allDailyTasksCompleted = dailyTasks.length > 0 && dailyTasks.every((task) => task.completed);
    const dailyTasksCompletedCount = dailyTasks.filter((task) => task.completed).length;

    const typeKeys = ['dictionary', 'phrase', 'proverb', 'song'];
    const typeChartData = typeKeys.map((key) => ({
      category: getTypeLabel(key),
      count: Number(learnStats.typeCounts[key]) || 0,
    }));

    this.setData({
      learnStats,
      todayTypeCounts,
      badges,
      suggestions,
      dailyTasks,
      allDailyTasksCompleted,
      dailyTasksCompletedCount,
      unlockedBadgeCount,
      totalBadgeCount,
      typeChartData,
    });
  },

  // 徽章纹样映射：优先用后端 pattern；否则按 code/name/description 关键词推断
  badgeMotif(badge) {
    if (!badge) return 'batik';
    // 支持的 6 种纹样，旧值 weaving 归一为 brocade
    const VALID = ['batik', 'brocade', 'drum', 'mountain', 'grain', 'song'];
    if (badge.pattern) {
      if (badge.pattern === 'weaving') return 'brocade';
      if (VALID.indexOf(badge.pattern) > -1) return badge.pattern;
    }
    // 按 code/name/description 关键词推断纹样
    const text = `${badge.code || ''} ${badge.name || ''} ${badge.description || ''}`.toLowerCase();
    if (text.indexOf('song') > -1 || text.indexOf('music') > -1 || text.indexOf('歌') > -1) {
      return 'song';
    }
    if (text.indexOf('mountain') > -1 || text.indexOf('山') > -1 || text.indexOf('水') > -1 || text.indexOf('explore') > -1 || text.indexOf('浏览') > -1) {
      return 'mountain';
    }
    if (text.indexOf('grain') > -1 || text.indexOf('稻') > -1 || text.indexOf('收藏') > -1 || text.indexOf('collect') > -1) {
      return 'grain';
    }
    if (text.indexOf('quiz') > -1 || text.indexOf('answer') > -1 || text.indexOf('答题') > -1 || text.indexOf('题') > -1) {
      return 'drum';
    }
    if (text.indexOf('brocade') > -1 || text.indexOf('织锦') > -1 || text.indexOf('词') > -1 || text.indexOf('vocab') > -1) {
      return 'brocade';
    }
    return 'batik';
  },

  // 格式化徽章解锁时间为「YYYY年M月D日」（北京时间）
  formatBadgeDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    return `${beijing.getUTCFullYear()}年${beijing.getUTCMonth() + 1}月${beijing.getUTCDate()}日`;
  },

  openBadge(e) {
    const badge = e.currentTarget.dataset.badge;
    if (!badge) return;
    this.setData({ selectedBadge: badge });
  },

  closeBadge() {
    this.setData({ selectedBadge: null });
  },

  exportAchievement() {
    if (this.data.isExporting) return;
    const shareCard = this.selectComponent('#shareCard');
    if (!shareCard || typeof shareCard.share !== 'function') {
      wx.showToast({ title: '分享卡未就绪', icon: 'none' });
      return;
    }
    this.setData({ isExporting: true });
    const stats = [
      { label: '今日学习', value: this.data.learnStats.todayCount },
      { label: '累计学习', value: this.data.learnStats.totalCount },
      { label: '连续打卡', value: this.data.learnStats.streakDays, unit: '天' },
    ];
    const nickname = this.data.userInfo.nickname || this.data.userInfo.nickName || '';
    shareCard.share({
      title: '我的布依语学习成就',
      stats,
      filename: 'buyi-achievement',
      nickname,
    }).then(() => {
      this.setData({ isExporting: false });
    }).catch(() => {
      this.setData({ isExporting: false });
    });
  },

  // share-card 转发事件回调：拿到临时图片路径，供 onShareAppMessage 使用
  onShareCardReady(e) {
    const imageUrl = e && e.detail && e.detail.imageUrl;
    if (imageUrl) {
      this.setData({ shareImageUrl: imageUrl });
    }
  },

  onShareAppMessage() {
    const streak = (this.data.learnStats && this.data.learnStats.streakDays) || 0;
    return {
      title: `我在布依语词典学习了 ${streak} 天`,
      path: '/pages/mine/index',
      imageUrl: this.data.shareImageUrl || '',
    };
  },

  onSuggestionTap(e) {
    this.navigateByLink(e.currentTarget.dataset.link);
  },

  onTaskTap(e) {
    this.navigateByLink(e.currentTarget.dataset.link);
  },

  // 卡片折叠/展开切换
  toggleCard(e) {
    const key = e.currentTarget.dataset.key;
    if (!key || !(key in this.data)) return;
    this.setData({ [key]: !this.data[key] });
  },

  // tabBar 页用 switchTab（需剥离 query），其余用 navigateTo
  navigateByLink(link) {
    if (!link) return;
    const tabBarPaths = [
      '/pages/home/index',
      '/pages/app/index',
      '/pages/favorite/index',
      '/pages/song/index',
      '/pages/mine/index',
    ];
    const isTabBar = tabBarPaths.some((p) => link.indexOf(p) === 0);
    if (isTabBar) {
      wx.switchTab({ url: link.split('?')[0] });
    } else {
      wx.navigateTo({ url: link });
    }
  },

  toRecord() {
    wx.navigateTo({ url: '/pages/record/index' });
  },

  goToLearn() {
    wx.navigateTo({ url: '/pages/learn/index' });
  },

  toFavAndRecord() {
    wx.switchTab({ url: '/pages/favorite/index' });
  },

  onAvatarError() {
    if (this.data.userInfo && this.data.userInfo.avatarUrl && this.data.userInfo.avatarUrl !== '/images/avatar.png') {
      this.setData({
        'userInfo.avatarUrl': '/images/avatar.png'
      });
    }
  },

  onAvatarTap() {
    if (getApp().globalData.isLogin) {
      wx.showToast({ title: '当前已登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/login/login' });
  },

  toSettings() {
    wx.navigateTo({ url: '/pages/setting/index' });
  },

  showAbout() {
    wx.showModal({
      title: '关于布依语词典',
      content: '布依语词典用于词条查询、常用语学习、谚语浏览和民歌欣赏。',
      showCancel: false,
    });
  },

});
