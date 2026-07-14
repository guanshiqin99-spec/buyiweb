const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    song: {},
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    currentTimeText: '00:00',
    durationText: '00:00',
    currentTheme: 'light',
    fontSizeClass: 'medium',
    isSeeking: false,
  },

  onLoad(options) {
    const app = getApp();
    syncAppearance(this);

    this._themeHandler = () => syncAppearance(this);
    try {
      app.eventBus.on('theme:changed', this._themeHandler);
      app.eventBus.on('font:changed', this._themeHandler);
    } catch (error) {}

    const song = {
      title: options.title ? decodeURIComponent(options.title) : '',
      image: options.image ? decodeURIComponent(options.image) : '',
      audio: options.audio ? decodeURIComponent(options.audio) : '',
    };
    const state = app.globalData.playerState || {};
    this.setData({
      song: song.title ? song : (state.currentSong || {}),
      isPlaying: !!state.isPlaying,
      currentTime: state.currentTime || 0,
      duration: state.duration || 0,
    });
    this.updateTimeText(state.currentTime || 0, state.duration || 0);

    this._stateHandler = (nextState) => {
      const playerState = nextState || app.globalData.playerState || {};
      this.setData({
        isPlaying: !!playerState.isPlaying,
        song: playerState.currentSong || this.data.song,
        duration: playerState.duration || 0,
      });
    };

    this._timeHandler = (time) => {
      if (this.data.isSeeking) {
        return;
      }
      const currentTime = time.currentTime || 0;
      const duration = time.duration || this.data.duration || 0;
      this.setData({ currentTime, duration });
      this.updateTimeText(currentTime, duration);
    };

    app.eventBus.on('player:state', this._stateHandler);
    app.eventBus.on('player:time', this._timeHandler);
  },

  onUnload() {
    const app = getApp();
    try {
      app.eventBus.off('player:state', this._stateHandler);
      app.eventBus.off('player:time', this._timeHandler);
      app.eventBus.off('theme:changed', this._themeHandler);
      app.eventBus.off('font:changed', this._themeHandler);
    } catch (error) {}
  },

  onTogglePlay() {
    getApp().togglePlay && getApp().togglePlay();
  },

  onSeekChanging(e) {
    const value = Number((e.detail && e.detail.value) || 0);
    this.setData({ isSeeking: true, currentTime: value });
    this.updateTimeText(value, this.data.duration || 0);
  },

  onSeek(e) {
    const value = Number((e.detail && e.detail.value) || 0);
    getApp().seekPlayer && getApp().seekPlayer(value);
    this.setData({ isSeeking: false, currentTime: value });
    this.updateTimeText(value, this.data.duration || 0);
  },

  onPrev() {
    getApp().playPrev && getApp().playPrev();
  },

  onNext() {
    getApp().playNext && getApp().playNext();
  },

  updateTimeText(current, duration) {
    this.setData({
      currentTimeText: this.formatTime(current),
      durationText: this.formatTime(duration),
    });
  },

  formatTime(seconds) {
    const value = Math.floor(seconds || 0);
    const minute = Math.floor(value / 60);
    const second = value % 60;
    return `${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}`;
  },

  onShareAppMessage() {
    const song = this.data.song || {};
    const title = encodeURIComponent(song.title || '');
    const image = encodeURIComponent(song.image || '');
    const audio = encodeURIComponent(song.audio || '');
    return {
      title: song.title ? `我正在听布依族民歌《${song.title}》，推荐给你！` : '布依族原生态民歌，快来听听吧！',
      path: `/pages/player-detail/index?title=${title}&image=${image}&audio=${audio}`,
      imageUrl: song.image || '/assets/images/banner1.jpg'
    };
  },

  onShareTimeline() {
    const song = this.data.song || {};
    const title = encodeURIComponent(song.title || '');
    const image = encodeURIComponent(song.image || '');
    const audio = encodeURIComponent(song.audio || '');
    return {
      title: song.title ? `布依族民歌《${song.title}》` : '布依族原生态发音民歌',
      query: `title=${title}&image=${image}&audio=${audio}`,
      imageUrl: song.image || '/assets/images/banner1.jpg'
    };
  }
});
