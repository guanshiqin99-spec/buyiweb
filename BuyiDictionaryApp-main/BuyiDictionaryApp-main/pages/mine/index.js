const { meApi } = require('../../utils/api');
const History = require('../../utils/learningHistory');
const { syncAppearance } = require('../../utils/view');

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
  },

  onLoad() {
    this._favoritesHandler = () => this.refreshUser();
    this._historyHandler = () => this.refreshUser();
    try {
      getApp().eventBus.on('favorites:changed', this._favoritesHandler);
      getApp().eventBus.on('history:changed', this._historyHandler);
    } catch (error) {}
  },

  onUnload() {
    try {
      getApp().eventBus.off('favorites:changed', this._favoritesHandler);
      getApp().eventBus.off('history:changed', this._historyHandler);
    } catch (error) {}
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 });
    }
    syncAppearance(this);
    this.refreshUser();
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

  toRecord() {
    wx.navigateTo({ url: '/pages/record/index' });
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
