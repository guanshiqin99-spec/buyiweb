const { contentApi } = require('../../utils/api');
const Favorites = require('../../utils/favorites');
const History = require('../../utils/learningHistory');
const { mapContentList } = require('../../utils/content-mapper');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    words: [],
    currentTheme: 'light',
    fontSizeClass: 'medium',
    isFlipped: false,
    currentIndex: 0,
    learnedCount: 0,
    playingIndex: -1,
    isLogin: false,
    stats: { streak: 0, total: 0, today: 0 },
    loading: false,
    errorText: '',
  },

  onLoad() {
    // 翻转卡的去重集合：浏览按"一次停留"计，复习按词条计，两套互不影响
    this._currentVisitId = 0;
    this._recordedVisitIds = new Set();
    this._recordingVisitIds = new Set();
    this._recordedReviewIds = new Set();
    this.loadWords();
  },

  onShow() {
    syncAppearance(this);
    this.setData({ isLogin: !!getApp().globalData.isLogin });
    this.refreshStats();
  },

  onHide() {
    this.destroyAudio();
  },

  onUnload() {
    this.destroyAudio();
  },

  isLoggedIn() {
    return !!getApp().globalData.isLogin;
  },

  async loadWords() {
    this.setData({ loading: true, errorText: '' });
    try {
      const payload = await contentApi.listByType('dictionary', 1, 50);
      // 不过滤无音频的词条，让所有词都能学，和 Web 端 Learn.vue 保持一致
      const words = mapContentList(payload.items || [], 'dictionary');
      this.setData({
        words,
        loading: false,
        currentIndex: 0,
        isFlipped: false,
        errorText: '',
      });
    } catch (error) {
      this.setData({ words: [], loading: false, errorText: '词汇加载失败' });
    }
  },

  // 学习统计：登录态拉取，写记录后实时刷新
  async refreshStats() {
    if (!this.isLoggedIn()) {
      this.setData({ stats: { streak: 0, total: 0, today: 0 } });
      return;
    }
    try {
      const payload = await History.list(1, 1);
      const s = (payload && payload.stats) || {};
      this.setData({
        stats: {
          streak: Number(s.streak || 0),
          total: Number(s.total || 0),
          today: Number(s.today || 0),
        },
      });
    } catch (error) {}
  },

  initAudio() {
    if (this._audioCtx) return;
    this._audioCtx = wx.createInnerAudioContext();
    this._audioCtx.obeyMuteSwitch = false;
    this._audioCtx.onEnded(() => this.setData({ playingIndex: -1 }));
    this._audioCtx.onError(() => {
      this.setData({ playingIndex: -1 });
      wx.showToast({ title: '音频播放失败', icon: 'none' });
    });
  },

  destroyAudio() {
    if (this._audioCtx) {
      try { this._audioCtx.stop(); } catch (e) {}
      try { this._audioCtx.destroy(); } catch (e) {}
      this._audioCtx = null;
      this.setData({ playingIndex: -1 });
    }
  },

  stopPronunciation() {
    if (this._audioCtx) {
      try { this._audioCtx.stop(); } catch (e) {}
      this.setData({ playingIndex: -1 });
    }
  },

  // 播放当前词条发音，再次点击同一个则停止
  playAtIndex(index) {
    const word = this.data.words[index];
    if (!word || !word.audio) {
      wx.showToast({ title: '暂无音频', icon: 'none' });
      return;
    }
    this.initAudio();
    if (this.data.playingIndex === index) {
      try { this._audioCtx.stop(); } catch (e) {}
      this.setData({ playingIndex: -1 });
      return;
    }
    try { this._audioCtx.stop(); } catch (e) {}
    this._audioCtx.src = word.audio;
    this._audioCtx.play();
    this.setData({ playingIndex: index });
  },

  flipCard() {
    this.setData({ isFlipped: !this.data.isFlipped });
  },

  handlePlay() {
    this.playAtIndex(this.data.currentIndex);
  },

  async handleFavorite() {
    const word = this.data.words[this.data.currentIndex];
    if (!word) return;
    if (!this.isLoggedIn()) {
      // 未登录：弹窗确认后引导去登录页
      wx.showModal({
        title: '需要登录',
        content: '登录后可以收藏词条，是否前往登录？',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        },
      });
      return;
    }
    try {
      const result = await Favorites.toggle(word);
      if (result && result.skipped) return;
      wx.showToast({
        title: result && result.isFavorited ? '已收藏' : '已取消收藏',
        icon: 'none',
      });
    } catch (error) {
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  async handleReview() {
    if (!this.isLoggedIn()) {
      wx.showToast({ title: '请先登录后再复习', icon: 'none' });
      return;
    }
    const word = this.data.words[this.data.currentIndex];
    if (!word || !word.id) return;
    // 同一张卡本次会话只写一次复习记录
    if (this._recordedReviewIds.has(word.id)) {
      wx.showToast({ title: '已复习过，无需重复添加', icon: 'none' });
      return;
    }
    const ok = await History.add(word, 'review');
    if (ok) {
      this._recordedReviewIds.add(word.id);
      wx.showToast({ title: '已加入复习清单', icon: 'none' });
      this.refreshStats();
    } else {
      wx.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  },

  // 给当前词写浏览记录，按 currentVisitId 去重，切到下一词后旧 id 失效
  async recordCurrentView() {
    const visitId = this._currentVisitId;
    const word = this.data.words[this.data.currentIndex];
    if (!word || !word.id) return;
    if (this._recordedVisitIds.has(visitId) || this._recordingVisitIds.has(visitId)) return;
    this._recordingVisitIds.add(visitId);
    try {
      await History.add(word, 'view');
      this._recordingVisitIds.delete(visitId);
      if (visitId === this._currentVisitId) {
        this._recordedVisitIds.add(visitId);
      }
    } catch (error) {
      this._recordingVisitIds.delete(visitId);
    }
  },

  nextWord() {
    this.stopPronunciation();
    this.setData({ isFlipped: false });
    const words = this.data.words;
    if (!words.length) return;
    // 先记当前词的浏览，再切索引，避免把"下一词"算进学习记录
    const previousVisitId = this._currentVisitId;
    this.recordCurrentView();
    const nextIndex = (this.data.currentIndex + 1) % words.length;
    this._currentVisitId += 1;
    this._recordedVisitIds.delete(previousVisitId);
    this._recordingVisitIds.delete(previousVisitId);
    this.setData({
      currentIndex: nextIndex,
      learnedCount: this.data.learnedCount + 1,
    });
  },
});
