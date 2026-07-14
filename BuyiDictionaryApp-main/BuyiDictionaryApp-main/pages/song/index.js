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
    loadingMore: false,
    page: 1,
    totalPages: 1,
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

  async loadSongs(page = 1) {
    this.setData(page === 1 ? { loading: true, errorText: '' } : { loadingMore: true, errorText: '' });
    try {
      const payload = await contentApi.listByType('song', page, 20);
      let nextSongs = mapContentList(payload.items || [], 'song');
      if (getApp().globalData.isLogin) {
        const groups = await Favorites.getGroups();
        nextSongs = applyFavoriteLookup(nextSongs, buildFavoriteLookup(groups));
      }
      const songs = page === 1 ? nextSongs : this.data.songs.concat(nextSongs.filter((song) => !this.data.songs.some((current) => current.id === song.id)));
      this.setData({
        songs,
        page,
        totalPages: Number(payload.totalPages || Math.max(1, Math.ceil(Number(payload.total || 0) / 20))),
        loading: false,
        loadingMore: false,
      });
    } catch (error) {
      this.setData({ songs: page === 1 ? [] : this.data.songs, loading: false, loadingMore: false, errorText: page === 1 ? '民歌加载失败' : '' });
      if (page > 1) wx.showToast({ title: '更多民歌加载失败', icon: 'none' });
    }
  },

  loadMore() {
    if (!this.data.loadingMore && this.data.page < this.data.totalPages) this.loadSongs(this.data.page + 1);
  },

  onReachBottom() {
    this.loadMore();
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
