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

  async loadItems() {
    this.setData({ loading: true, errorText: '' });
    try {
      const payload = await contentApi.listByType('dictionary', 1, 100);
      const items = mapContentList(payload.items || [], 'dictionary').filter((item) => !!item.audio);
      this.setData({ items, loading: false });
    } catch (error) {
      this.setData({ items: [], loading: false, errorText: '词汇加载失败' });
    }
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
