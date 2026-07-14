function getFontSizeClass(fontSize) {
  if (fontSize === '小') {
    return 'small';
  }
  if (fontSize === '大') {
    return 'large';
  }
  return 'medium';
}

function syncAppearance(page, extraData = {}) {
  const app = getApp();
  const theme = app.globalData.theme || wx.getStorageSync('theme') || 'light';
  const fontSize = app.globalData.fontSize || wx.getStorageSync('fontSize') || '中';
  page.setData({
    currentTheme: theme,
    fontSizeClass: getFontSizeClass(fontSize),
    ...extraData,
  });
}

module.exports = {
  getFontSizeClass,
  syncAppearance,
};
