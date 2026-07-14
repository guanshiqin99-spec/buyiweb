const History = require('../../utils/learningHistory');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    records: [],
    recent: [],
    currentTheme: 'light',
    fontSizeClass: 'medium',
    isLogin: false,
    loading: false,
    stats: {
      today: 0,
      streak: 0,
      total: 0,
      progress: 0,
    },
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

  async refreshRecords() {
    if (!getApp().globalData.isLogin) {
      this.setData({
        isLogin: false,
        records: [],
        recent: [],
        stats: { today: 0, streak: 0, total: 0, progress: 0 },
      });
      return;
    }

    this.setData({ loading: true, isLogin: true });
    try {
      const payload = await History.list(1, 30);
      const target = 10;
      const progress = Math.min(100, Math.round(((payload.stats.today || 0) / target) * 100));
      this.setData({
        records: payload.records || [],
        recent: payload.recent || [],
        loading: false,
        stats: {
          today: payload.stats.today || 0,
          streak: payload.stats.streak || 0,
          total: payload.stats.total || 0,
          progress,
        },
      });
    } catch (error) {
      this.setData({
        records: [],
        recent: [],
        loading: false,
        stats: { today: 0, streak: 0, total: 0, progress: 0 },
      });
      wx.showToast({ title: '\u5B66\u4E60\u8BB0\u5F55\u52A0\u8F7D\u5931\u8D25', icon: 'none' });
    }
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
});
