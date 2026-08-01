const History = require('../../utils/learningHistory');
const { syncAppearance } = require('../../utils/view');
const { recordsApi } = require('../../utils/api');
const { generateSuggestions } = require('../../utils/learningSuggestion');
const { normalizeLearningStats } = require('../../utils/userProgress');

// tabBar 页路径集合，onSuggestionTap 跳转时需用 wx.switchTab
const TAB_BAR_PATHS = [
  '/pages/home/index',
  '/pages/app/index',
  '/pages/favorite/index',
  '/pages/song/index',
  '/pages/mine/index',
];

Page({
  data: {
    records: [],
    heatmapRecords: [],
    recent: [],
    currentTheme: 'light',
    fontSizeClass: 'medium',
    isLogin: false,
    loading: false,
    loadingMore: false,
    page: 1,
    totalPages: 1,
    stats: {
      today: 0,
      streak: 0,
      total: 0,
      progress: 0,
    },
    typeCounts: {},
    suggestions: [],
  },

  onLoad() {
    this._historyHandler = () => this.refreshRecords();
    History.subscribe(this._historyHandler);
  },

  onUnload() {
    History.unsubscribe(this._historyHandler);
  },

  onShow() {
    syncAppearance(this, { isLogin: !!getApp().globalData.isLogin });
    this.refreshRecords();
  },

  async refreshRecords(page = 1) {
    if (!getApp().globalData.isLogin) {
      this.setData({
        isLogin: false,
        records: [],
        heatmapRecords: [],
        recent: [],
        page: 1,
        totalPages: 1,
        stats: { today: 0, streak: 0, total: 0, progress: 0 },
        typeCounts: {},
        suggestions: [],
      });
      return;
    }

    this.setData(page === 1 ? { loading: true, isLogin: true } : { loadingMore: true, isLogin: true });
    try {
      const pageSize = 20;
      const payload = await History.list(page, pageSize);
      const target = 10;
      const progress = Math.min(100, Math.round(((payload.stats.today || 0) / target) * 100));
      this.setData({
        records: page === 1
          ? (payload.records || [])
          : this.data.records.concat((payload.records || []).filter((record) => !this.data.records.some((current) => current.recordId === record.recordId))),
        recent: page === 1 ? (payload.recent || []) : this.data.recent,
        loading: false,
        loadingMore: false,
        page,
        totalPages: Math.max(1, Math.ceil(Number(payload.total || 0) / pageSize)),
        stats: {
          today: payload.stats.today || 0,
          streak: payload.stats.streak || 0,
          total: payload.stats.total || 0,
          progress,
        },
      });
      // 仅首页拉取学习统计与建议，失败时静默置空，不阻塞主流程
      if (page === 1) {
        this.loadStatsAndSuggestions();
        this.loadHeatmapRecords();
      }
    } catch (error) {
      this.setData({
        records: page === 1 ? [] : this.data.records,
        recent: page === 1 ? [] : this.data.recent,
        loading: false,
        loadingMore: false,
        page: page === 1 ? 1 : this.data.page,
        totalPages: page === 1 ? 1 : this.data.totalPages,
        stats: page === 1 ? { today: 0, streak: 0, total: 0, progress: 0 } : this.data.stats,
        typeCounts: page === 1 ? {} : this.data.typeCounts,
        suggestions: page === 1 ? [] : this.data.suggestions,
      });
      wx.showToast({ title: page === 1 ? '\u5B66\u4E60\u8BB0\u5F55\u52A0\u8F7D\u5931\u8D25' : '更多记录加载失败', icon: 'none' });
    }
  },

  // 拉取学习统计（typeCounts）并生成学习建议；任何异常均静默置空，不影响主流程
  async loadStatsAndSuggestions() {
    try {
      const stats = await recordsApi.stats();
      const normalized = normalizeLearningStats(stats || {});
      const typeCounts = normalized.typeCounts || {};
      const suggestions = generateSuggestions({
        totalCount: normalized.totalCount,
        todayCount: normalized.todayCount,
        streakDays: normalized.streakDays,
        typeCounts,
      });
      this.setData({ typeCounts, suggestions });
    } catch (error) {
      this.setData({ typeCounts: {}, suggestions: [] });
    }
  },

  // 拉取覆盖近 12 周的大 pageSize 记录用于热力图，失败时静默置空，不阻塞主流程
  async loadHeatmapRecords() {
    try {
      const payload = await History.list(1, 500);
      this.setData({
        heatmapRecords: payload.records || [],
      });
    } catch (error) {
      this.setData({ heatmapRecords: [] });
    }
  },

  loadMore() {
    if (!this.data.loadingMore && this.data.page < this.data.totalPages) this.refreshRecords(this.data.page + 1);
  },

  onReachBottom() {
    this.loadMore();
  },

  clearRecords() {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '清空记录',
      content: '确定要清空全部学习记录吗？',
      confirmColor: '#d9534f',
      success: async (res) => {
        if (!res.confirm) {
          return;
        }

        try {
          await History.clear();
          await this.refreshRecords();
          wx.showToast({ title: '学习记录已清空', icon: 'success' });
        } catch (error) {
          wx.showToast({ title: '清空失败，请稍后重试', icon: 'none' });
        }
      },
    });
  },

  openDetail(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    if (item.type === 'song') {
      const title = encodeURIComponent(item.title || '');
      const image = encodeURIComponent(item.image || '/assets/images/banner1.jpg');
      const audioUrl = encodeURIComponent(item.audio || '');
      wx.navigateTo({
        url: `/pages/player-detail/index?title=${title}&image=${image}&audio=${audioUrl}`,
      });
    } else {
      const word = item.buyi || item.zh || item.en;
      if (word) {
        wx.navigateTo({ url: `/pages/query/index?word=${encodeURIComponent(word)}` });
      }
    }
  },

  toLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  // 点击学习建议卡跳转：tabBar 页用 switchTab，其他用 navigateTo
  onSuggestionTap(e) {
    const link = e.currentTarget.dataset.link;
    if (!link || typeof link !== 'string') return;

    const cleanPath = link.split('?')[0];
    if (TAB_BAR_PATHS.indexOf(cleanPath) !== -1) {
      wx.switchTab({ url: cleanPath, fail: () => {} });
    } else {
      wx.navigateTo({
        url: link,
        fail: () => {
          // 个别页面可能未注册或路径有问题，降级尝试 switchTab
          wx.switchTab({ url: cleanPath, fail: () => {} });
        },
      });
    }
  },
});
