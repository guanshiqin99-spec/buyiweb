const { contentApi } = require('../../utils/api');
const Favorites = require('../../utils/favorites');
const History = require('../../utils/learningHistory');
const { buildFavoriteLookup, applyFavoriteLookup, mapContentList } = require('../../utils/content-mapper');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    songs: [],
    currentTheme: 'light',
    fontSizeClass: 'medium',
    loading: false,
    errorText: '',
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    syncAppearance(this);
    this.loadSongs();
    try {
      getApp()._initPlayer && getApp()._initPlayer();
    } catch (error) {}
  },

  async loadSongs() {
    this.setData({ loading: true, errorText: '' });
    try {
      const payload = await contentApi.listByType('song', 1, 50);
      let songs = mapContentList(payload.items || [], 'song');
      if (getApp().globalData.isLogin) {
        const groups = await Favorites.getGroups();
        songs = applyFavoriteLookup(songs, buildFavoriteLookup(groups));
      }
      this.setData({ songs, loading: false });
    } catch (error) {
      this.setData({ songs: [], loading: false, errorText: '民歌加载失败' });
    }
  },

  playSong(e) {
    const index = e.currentTarget.dataset.index;
    const song = this.data.songs[index];
    if (!song || !song.audio) {
      wx.showToast({ title: '暂无可播放音频', icon: 'none' });
      return;
    }

    try {
      getApp().playSong(song, this.data.songs || [], index);
      History.add(song, 'play');
    } catch (error) {}

    const title = encodeURIComponent(song.title || '');
    const image = encodeURIComponent(song.image || '/assets/images/banner1.jpg');
    const audioUrl = encodeURIComponent(song.audio || '');
    wx.navigateTo({
      url: `/pages/player-detail/index?title=${title}&image=${image}&audio=${audioUrl}`,
    });
  },

  async toggleFavorite(e) {
    const index = e.currentTarget.dataset.index;
    const songs = this.data.songs.slice();
    const song = songs[index];
    if (!song) {
      return;
    }

    const previous = !!song.fav;
    songs[index] = { ...song, fav: !previous, isFavorited: !previous };
    this.setData({ songs });

    try {
      const result = await Favorites.toggle(song);
      if (result && result.skipped) {
        songs[index] = { ...song, fav: previous, isFavorited: previous };
        this.setData({ songs });
        return;
      }
      songs[index] = { ...song, fav: !!result.isFavorited, isFavorited: !!result.isFavorited };
      this.setData({ songs });
    } catch (error) {
      songs[index] = { ...song, fav: previous, isFavorited: previous };
      this.setData({ songs });
      wx.showToast({ title: '收藏失败，请稍后重试', icon: 'none' });
    }
  },

  onShareAppMessage() {
    return {
      title: '布依语民歌鉴赏，感受原生态天籁发音',
      path: '/pages/song/index'
    };
  },

  onShareTimeline() {
    return {
      title: '布依语民歌鉴赏，感受原生态天籁发音',
      query: ''
    };
  }
});
