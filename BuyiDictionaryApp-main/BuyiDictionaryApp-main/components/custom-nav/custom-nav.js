Component({
  properties: {
    textColor: { type: String, value: "#123B6B" }
  },
  data: {
    statusBarHeight: 20,
    showBack: false
  },
  attached() {
    const windowInfo = wx.getWindowInfo();
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
