Component({
  properties: {
    textColor: { type: String, value: "#123B6B" },
    title: { type: String, value: '' }
  },
  data: {
    statusBarHeight: 20,
    showBack: false
  },
  attached() {
    const windowInfo = typeof wx.getWindowInfo === 'function'
      ? wx.getWindowInfo()
      : wx.getSystemInfoSync();
    const pages = getCurrentPages();
    this.setData({ 
      statusBarHeight: windowInfo.statusBarHeight,
      showBack: pages.length > 1
    });
  },
  methods: {
    onBack() {
      wx.navigateBack();
    }
  }
})
