const { homeApi, contentApi } = require('../../utils/api');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    currentTheme: 'light',
    fontSizeClass: 'medium',
    bannerItems: [],
    currentBanner: 0,
    keyword: '',
    suggestions: [],
    showSuggestions: false,
    history: [],
  },

  suggestTimer: null,

  onLoad() {
    this.setData({ history: wx.getStorageSync('searchHistory') || [] });
    this.loadHomeData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    syncAppearance(this);
  },

  async loadHomeData() {
    try {
      const payload = await homeApi.get();
      const bannerItems = Array.isArray(payload && payload.banners) ? payload.banners : [
        {
          id: 1,
          title: '布依迎客歌',
          zhText: '欢迎远方的客人，感受布依的热情与美好',
          image: '/assets/images/banner1.jpg',
          targetType: 'song',
          targetUrl: '/pages/song/index' // 歌谣页改为switchTab还是navigateTo? 因为歌谣页是tabbar页面，所以应当特殊处理
        }
      ];
      this.setData({ bannerItems });
    } catch (error) {
      this.setData({ bannerItems: [
        {
          id: 1,
          title: '布依迎客歌',
          zhText: '欢迎远方的客人，感受布依的热情与美好',
          image: '/assets/images/banner1.jpg',
          targetType: 'song',
          targetUrl: '/pages/song/index' 
        }
      ] });
    }
  },

  onBannerChange(e) {
    this.setData({ currentBanner: e.detail.current });
  },

  handleBannerTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.bannerItems[index];
    if (!item || !item.targetUrl) return;

    // 防止同为tabbar页面时navigateTo报错
    const tabUrls = ['/pages/home/index', '/pages/app/index', '/pages/favorite/index', '/pages/song/index', '/pages/mine/index'];
    if (tabUrls.some(u => item.targetUrl.startsWith(u))) {
      wx.switchTab({
        url: item.targetUrl,
        fail: () => {
          wx.showToast({ title: '页面正在建设中', icon: 'none' });
        }
      });
    } else {
      wx.navigateTo({
        url: item.targetUrl,
        fail: () => {
          wx.showToast({ title: '页面正在建设中', icon: 'none' });
        }
      });
    }
  },

  onInput(e) {
    const value = String((e.detail && e.detail.value) || '').trim();
    this.setData({ keyword: value });
    
    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer);
    }
    
    if (!value) {
      this.setData({ suggestions: [], showSuggestions: false });
      return;
    }
    
    this.suggestTimer = setTimeout(async () => {
      try {
        const payload = await contentApi.suggest(value);
        let items = [];
        if (payload.dictionary) items = items.concat(payload.dictionary);
        if (payload.phrases) items = items.concat(payload.phrases);
        if (payload.proverbs) items = items.concat(payload.proverbs);
        
        items = items.slice(0, 8);
        this.setData({ suggestions: items, showSuggestions: items.length > 0 });
      } catch (error) {
        console.error('Suggest error:', error);
      }
    }, 300);
  },

  onClear() {
    this.setData({ keyword: '', suggestions: [], showSuggestions: false });
  },

  onHideSuggestions() {
    this.setData({ showSuggestions: false });
  },

  onSelectSuggestion(e) {
    const item = e.currentTarget.dataset.item;
    const word = item.zhText || item.buyiText || this.data.keyword;
    this.setData({ keyword: word, showSuggestions: false });
    this.onSearch();
  },

  onSelectHistory(e) {
    const word = e.currentTarget.dataset.word;
    this.setData({ keyword: word || '' });
    this.onSearch();
  },

  onSearch() {
    const word = String(this.data.keyword || '').trim();
    if (!word) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }

    let history = wx.getStorageSync('searchHistory') || [];
    history = history.filter((item) => item !== word);
    history.unshift(word);
    history = history.slice(0, 8);
    wx.setStorageSync('searchHistory', history);
    this.setData({ history });

    wx.navigateTo({
      url: `/pages/query/index?word=${encodeURIComponent(word)}`,
    });
  },
});
