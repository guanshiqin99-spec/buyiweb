const { contentApi } = require('../../utils/api');
const Favorites = require('../../utils/favorites');
const History = require('../../utils/learningHistory');
const { mapContentList } = require('../../utils/content-mapper');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    items: [],
    currentTheme: 'light',
    fontSizeClass: 'medium',
    playingIndex: -1,
    loading: false,
    loadingMore: false,
    page: 1,
    totalPages: 1,
    errorText: '',
  },

  onShow() {
    syncAppearance(this);
    this.loadItems();
  },

  onUnload() {
    if (this._audioCtx) {
      try {
        this._audioCtx.destroy();
      } catch (error) {}
      this._audioCtx = null;
    }
  },

  async loadItems(page = 1) {
    this.setData(page === 1 ? { loading: true, errorText: '' } : { loadingMore: true, errorText: '' });
    try {
      const payload = await contentApi.listByType('dictionary', page, 20);
      const nextItems = mapContentList(payload.items || [], 'dictionary').filter((item) => !!item.audio);
      const items = page === 1 ? nextItems : this.data.items.concat(nextItems.filter((item) => !this.data.items.some((current) => current.id === item.id)));
      const totalPages = Number(payload.totalPages || Math.max(1, Math.ceil(Number(payload.total || 0) / 20)));
      this.setData({ items, page, totalPages, loading: false, loadingMore: false }, () => {
        if (page === 1 && getApp().globalData.autoplay && items.length) this.playAtIndex(0);
      });
    } catch (error) {
      this.setData({ items: page === 1 ? [] : this.data.items, loading: false, loadingMore: false, errorText: page === 1 ? '词汇加载失败' : '' });
      if (page > 1) wx.showToast({ title: '更多词汇加载失败', icon: 'none' });
    }
  },

  loadMore() {
    if (!this.data.loadingMore && this.data.page < this.data.totalPages) this.loadItems(this.data.page + 1);
  },

  onReachBottom() {
    this.loadMore();
  },

  async onFav(e) {
    const index = e.detail.index;
    const items = this.data.items.slice();
    const item = items[index];
    if (!item) {
      return;
    }

    const previous = !!item.fav;
    items[index] = { ...item, fav: !previous, isFavorited: !previous };
    this.setData({ items });

    try {
      const result = await Favorites.toggle(item);
      if (result && result.skipped) {
        items[index] = { ...item, fav: previous, isFavorited: previous };
        this.setData({ items });
        return;
      }
      items[index] = { ...item, fav: !!result.isFavorited, isFavorited: !!result.isFavorited };
      this.setData({ items });
    } catch (error) {
      items[index] = { ...item, fav: previous, isFavorited: previous };
      this.setData({ items });
      wx.showToast({ title: '收藏失败，请稍后重试', icon: 'none' });
    }
  },

  initAudio() {
    if (!this._audioCtx) {
      this._audioCtx = wx.createInnerAudioContext();
      this._audioCtx.obeyMuteSwitch = true;
      this._audioCtx.onEnded(() => this.setData({ playingIndex: -1 }));
      this._audioCtx.onError(() => {
        this.setData({ playingIndex: -1 });
        wx.showToast({ title: '音频播放失败', icon: 'none' });
      });
    }
  },

  onPlay(e) {
    const index = e.detail.index;
    this.playAtIndex(index);
  },

  playAtIndex(index) {
    const item = this.data.items[index];
    if (!item || !item.audio) {
      wx.showToast({ title: '暂无音频', icon: 'none' });
      return;
    }

    this.initAudio();

    if (this.data.playingIndex === index) {
      try {
        this._audioCtx.stop();
      } catch (error) {}
      this.setData({ playingIndex: -1 });
      return;
    }

    try {
      this._audioCtx.stop();
    } catch (error) {}
    this._audioCtx.src = item.audio;
    this._audioCtx.play();
    this.setData({ playingIndex: index });
    History.add(item, 'play');
  },
});
