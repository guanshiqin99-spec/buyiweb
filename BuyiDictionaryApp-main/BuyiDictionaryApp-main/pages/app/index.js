const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    currentTheme: 'light',
    fontSizeClass: 'medium',
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    syncAppearance(this);
  },

  goToQuery() {
    wx.navigateTo({ url: '/pages/query/index' });
  },

  goToPhrases() {
    wx.navigateTo({ url: '/pages/phrases/index' });
  },

  goToProverbs() {
    wx.navigateTo({ url: '/pages/proverbs/index' });
  },

  goToVocabulary() {
    wx.navigateTo({ url: '/pages/vocabulary/index' });
  },
});
