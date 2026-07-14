const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    currentTheme: 'light',
    fontSizeClass: 'medium',
  },

  onShow() {
    syncAppearance(this);
  },
});
