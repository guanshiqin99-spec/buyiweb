const Favorites = require('../../utils/favorites');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    favWords: [],
    favSongs: [],
    currentTheme: 'light',
    fontSizeClass: 'medium',
    activeTab: 'words',
    isLogin: false,
    loading: false,
    totalFavorites: 0,
  },

  onLoad() {
    this._onFavChange = () => this.refreshFavorites();
    Favorites.subscribe(this._onFavChange);
  },

  onUnload() {
    Favorites.unsubscribe(this._onFavChange);
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    syncAppearance(this, { isLogin: !!getApp().globalData.isLogin });
    this.refreshFavorites();
  },

  async refreshFavorites() {
    if (!getApp().globalData.isLogin) {
      this.setData({
        isLogin: false,
        favWords: [],
        favSongs: [],
        loading: false,
        totalFavorites: 0,
      });
      return;
    }

    this.setData({ loading: true, isLogin: true });
    try {
      const groups = await Favorites.getGroups();
      const favWords = []
        .concat(groups.dictionary || [])
        .concat(groups.phrases || [])
        .concat(groups.proverbs || []);
      const favSongs = groups.songs || [];
      this.setData({
        favWords,
        favSongs,
        loading: false,
        totalFavorites: favWords.length + favSongs.length,
      });
    } catch (error) {
      this.setData({ favWords: [], favSongs: [], loading: false, totalFavorites: 0 });
      wx.showToast({ title: '\u6536\u85CF\u52A0\u8F7D\u5931\u8D25', icon: 'none' });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab || 'words' });
  },

  openDetail(e) {
    const type = e.currentTarget.dataset.type;
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    if (type === 'song') {
      const title = encodeURIComponent(item.title || '');
      const image = encodeURIComponent(item.image || '/assets/images/banner1.jpg');
      const audioUrl = encodeURIComponent(item.audio || '');
      wx.navigateTo({
        url: `/pages/player-detail/index?title=${title}&image=${image}&audio=${audioUrl}`,
      });
    } else {
      const word = item.buyi || item.zh || item.en;
      if (word) {
        wx.navigateTo({
          url: `/pages/query/index?word=${encodeURIComponent(word)}`,
        });
      }
    }
  },

  toLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  onItemOpen(e) {
    const detail = e.detail || {};
    const comps = this.selectAllComponents('.swipe-item-comp') || [];
    comps.forEach((comp) => {
      const props = comp.properties || {};
      if (props.index === detail.index && props.type === detail.type) {
        return;
      }
      if (typeof comp.close === 'function') {
        comp.close();
      }
    });
  },

  onItemDelete(e) {
    const detail = e.detail || {};
    const list = detail.type === 'song' ? this.data.favSongs : this.data.favWords;
    const item = (list || [])[detail.index];
    if (!item) {
      return;
    }

    wx.showModal({
      title: '\u786E\u8BA4\u79FB\u9664',
      content: '\u786E\u5B9A\u8981\u4ECE\u6536\u85CF\u4E2D\u79FB\u9664\u8FD9\u6761\u5185\u5BB9\u5417\uFF1F',
      confirmText: '\u79FB\u9664',
      cancelText: '\u53D6\u6D88',
      success: async (res) => {
        if (!res.confirm) {
          return;
        }
        try {
          await Favorites.toggle(item);
          this.refreshFavorites();
          wx.showToast({ title: '\u5DF2\u79FB\u9664', icon: 'success' });
        } catch (error) {
          wx.showToast({ title: '\u79FB\u9664\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5', icon: 'none' });
        }
      },
    });
  },
});
