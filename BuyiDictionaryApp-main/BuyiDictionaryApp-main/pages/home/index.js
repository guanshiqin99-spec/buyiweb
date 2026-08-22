const { homeApi, contentApi } = require('../../utils/api');
const { syncAppearance } = require('../../utils/view');
const { resolveMediaUrl } = require('../../utils/content-mapper');

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
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    syncAppearance(this);
    this.loadHomeData();
  },

  onUnload() {
    clearTimeout(this.suggestTimer);
    clearTimeout(this.hideSuggestTimer);
  },

  onHide() {
    clearTimeout(this.suggestTimer);
  },

  async loadHomeData() {
    try {
      const payload = await homeApi.get();
      const bannerItems = Array.isArray(payload && payload.banners) && payload.banners.length > 0 ? payload.banners : [
        {
          id: 1,
          title: '布依迎客歌',
          zhText: '欢迎远方的客人，感受布依的热情与美好',
          image: '/assets/images/banner1.jpg',
          targetType: 'song',
          targetUrl: '/pages/song/index' // 歌谣页改为switchTab还是navigateTo? 因为歌谣页是tabbar页面，所以应当特殊处理
        }
      ];
      bannerItems.forEach((item) => {
        // 后端返回的相对路径(/uploads/...)需补全为完整 URL，本地包内图片(/assets/...)保持原样
        if (item.image && !/^https?:\/\//i.test(item.image) && !item.image.startsWith('/assets/')) {
          item.image = resolveMediaUrl(item.image);
        }
        item.image = item.image || '/assets/images/banner1.jpg';
      });
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
        if (payload.songs) items = items.concat(payload.songs);

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
    this.hideSuggestTimer = setTimeout(() => {
      this.setData({ showSuggestions: false });
    }, 150);
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
