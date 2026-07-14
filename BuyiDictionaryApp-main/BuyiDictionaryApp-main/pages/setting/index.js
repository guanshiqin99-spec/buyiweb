const { favoritesApi, recordsApi, settingsApi, healthApi } = require('../../utils/api');
const { getEnvLabel } = require('../../utils/runtime-config');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    themes: [
      { label: '\u9752\u82B1\u74F7', value: 'light' },
      { label: '\u5C71\u6C34\u58A8\u97F5', value: 'dark' },
    ],
    apiModes: [
      { label: '\u81EA\u52A8', value: 'auto' },
      { label: '\u5F00\u53D1', value: 'development' },
      { label: '\u751F\u4EA7', value: 'production' },
    ],
    fontSizes: ['\u5C0F', '\u4E2D', '\u5927'],
    currentTheme: 'light',
    currentFontSize: '\u4E2D',
    fontSizeIndex: 1,
    fontSizeClass: 'medium',
    isLogin: false,
    apiMode: 'auto',
    activeApiMode: 'development',
    apiBaseDev: '',
    apiBaseProd: '',
    apiBase: '',
    envLabel: '\u5F00\u53D1\u7248',
    apiStatusText: '未检测',
    apiStatusType: 'idle',
    showDeveloperMode: false,
    versionClickCount: 0,
  },

  onLoad() {
    this._loginHandler = (state) => {
      this.setData({ isLogin: !!(state && state.isLogin) });
      this.loadSettings();
    };
    this._apiHandler = () => {
      this.loadApiConfig();
    };
    try {
      getApp().eventBus.on('login:changed', this._loginHandler);
      getApp().eventBus.on('api:changed', this._apiHandler);
    } catch (error) {}
  },

  onVersionClick() {
    let count = this.data.versionClickCount + 1;
    if (count >= 5 && !this.data.showDeveloperMode) {
      this.setData({ showDeveloperMode: true, versionClickCount: 0 });
      wx.showToast({ title: '\u5DF2\u8FDB\u5165\u5F00\u53D1\u8005\u6A21\u5F0F', icon: 'none' });
    } else {
      this.setData({ versionClickCount: count });
      if (this.clickTimer) clearTimeout(this.clickTimer);
      this.clickTimer = setTimeout(() => {
        this.setData({ versionClickCount: 0 });
      }, 2000);
    }
  },

  onShow() {
    syncAppearance(this, { isLogin: !!getApp().globalData.isLogin });
    this.loadSettings();
    this.loadApiConfig();
    this.checkApiHealth();
  },

  onUnload() {
    try {
      getApp().eventBus.off('login:changed', this._loginHandler);
      getApp().eventBus.off('api:changed', this._apiHandler);
    } catch (error) {}
  },

  loadApiConfig() {
    const app = getApp();
    const config = app.getApiConfig ? app.getApiConfig() : {};
    const activeApiMode = config.activeApiMode || config.activeMode || 'development';
    this.setData({
      apiMode: config.apiMode || 'auto',
      activeApiMode,
      apiBaseDev: (config.apiBases && config.apiBases.development) || '',
      apiBaseProd: (config.apiBases && config.apiBases.production) || '',
      apiBase: config.apiBase || '',
      envLabel: getEnvLabel(config.wechatEnvVersion || 'develop'),
    });
  },

  async checkApiHealth() {
    this.setData({ apiStatusText: '检测中...', apiStatusType: 'checking' });
    try {
      const payload = await healthApi.check();
      const service = payload && payload.service ? ` · ${payload.service}` : '';
      this.setData({
        apiStatusText: `连接正常${service}`,
        apiStatusType: 'success',
      });
    } catch (error) {
      this.setData({
        apiStatusText: '无法连接当前接口地址，请确认后端服务已启动',
        apiStatusType: 'error',
      });
    }
  },

  async loadSettings() {
    const app = getApp();
    const isLogin = !!app.globalData.isLogin;
    let theme = wx.getStorageSync('theme') || app.globalData.theme || 'light';
    let fontSize = wx.getStorageSync('fontSize') || app.globalData.fontSize || '\u4E2D';

    if (isLogin) {
      try {
        const payload = await settingsApi.get();
        theme = payload.theme || theme;
        fontSize = payload.fontSize || fontSize;
      } catch (error) {}
    }

    app.applySettings({ theme, fontSize }, { persist: true, broadcast: true });
    const fontSizeIndex = this.data.fontSizes.indexOf(fontSize);
    this.setData({
      currentTheme: theme,
      currentFontSize: fontSize,
      fontSizeIndex: fontSizeIndex >= 0 ? fontSizeIndex : 1,
      fontSizeClass: fontSize === '\u5C0F' ? 'small' : fontSize === '\u5927' ? 'large' : 'medium',
      isLogin,
    });
  },

  async syncSettings(nextTheme, nextFontSize) {
    const app = getApp();
    app.applySettings({ theme: nextTheme, fontSize: nextFontSize }, { persist: true, broadcast: true });
    const fontSizeIndex = this.data.fontSizes.indexOf(nextFontSize);
    this.setData({
      currentTheme: nextTheme,
      currentFontSize: nextFontSize,
      fontSizeIndex: fontSizeIndex >= 0 ? fontSizeIndex : 1,
      fontSizeClass: nextFontSize === '\u5C0F' ? 'small' : nextFontSize === '\u5927' ? 'large' : 'medium',
    });

    if (!app.globalData.isLogin) {
      return;
    }

    try {
      await settingsApi.update(nextTheme, nextFontSize);
    } catch (error) {
      wx.showToast({ title: '\u8BBE\u7F6E\u540C\u6B65\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5', icon: 'none' });
    }
  },

  changeTheme(e) {
    const theme = e.currentTarget.dataset.value || 'light';
    this.syncSettings(theme, this.data.currentFontSize);
  },

  changeFontSize(e) {
    let index = 1;
    if (e && e.detail && e.detail.value !== undefined) {
      index = Number(e.detail.value);
    }
    const fontSize = this.data.fontSizes[index] || '\u4E2D';
    this.syncSettings(this.data.currentTheme, fontSize);
  },

  changeApiMode(e) {
    const mode = e.currentTarget.dataset.value || 'auto';
    const config = getApp().setApiMode(mode);
    this.setData({
      apiMode: config.apiMode,
      activeApiMode: config.activeMode,
      apiBase: config.apiBase,
    });
    wx.showToast({ title: '\u63A5\u53E3\u73AF\u5883\u5DF2\u5207\u6362', icon: 'success' });
  },

  onDevBaseInput(e) {
    this.setData({ apiBaseDev: String((e.detail && e.detail.value) || '').trim() });
  },

  onProdBaseInput(e) {
    this.setData({ apiBaseProd: String((e.detail && e.detail.value) || '').trim() });
  },

  saveDevBase() {
    if (!this.data.apiBaseDev) {
      wx.showToast({ title: '\u8BF7\u8F93\u5165\u5F00\u53D1\u73AF\u5883\u5730\u5740', icon: 'none' });
      return;
    }
    const config = getApp().setApiBaseFor('development', this.data.apiBaseDev);
    this.setData({ apiBase: config.apiBase, apiBaseDev: config.apiBases.development });
    wx.showToast({ title: '\u5F00\u53D1\u73AF\u5883\u5730\u5740\u5DF2\u4FDD\u5B58', icon: 'success' });
    this.checkApiHealth();
  },

  saveProdBase() {
    if (!this.data.apiBaseProd) {
      wx.showToast({ title: '\u8BF7\u8F93\u5165\u751F\u4EA7\u73AF\u5883\u5730\u5740', icon: 'none' });
      return;
    }
    if (!/^https:\/\//i.test(this.data.apiBaseProd)) {
      wx.showToast({ title: '\u751F\u4EA7\u63A5\u53E3\u5FC5\u987B\u4F7F\u7528 HTTPS', icon: 'none' });
      return;
    }
    const config = getApp().setApiBaseFor('production', this.data.apiBaseProd);
    this.setData({ apiBase: config.apiBase, apiBaseProd: config.apiBases.production });
    wx.showToast({ title: '\u751F\u4EA7\u73AF\u5883\u5730\u5740\u5DF2\u4FDD\u5B58', icon: 'success' });
    this.checkApiHealth();
  },

  resetApiBaseConfig() {
    wx.showModal({
      title: '\u6062\u590D\u9ED8\u8BA4\u5730\u5740',
      content: '\u786E\u5B9A\u8981\u5C06\u5F00\u53D1\u4E0E\u751F\u4EA7\u63A5\u53E3\u5730\u5740\u6062\u590D\u4E3A\u9ED8\u8BA4\u503C\u5417\uFF1F',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        const config = getApp().resetApiConfig();
        this.setData({
          apiMode: config.apiMode,
          activeApiMode: config.activeMode,
          apiBase: config.apiBase,
          apiBaseDev: config.apiBases.development,
          apiBaseProd: config.apiBases.production,
          envLabel: getEnvLabel(config.envVersion),
        });
        wx.showToast({ title: '\u5DF2\u6062\u590D\u9ED8\u8BA4\u5730\u5740', icon: 'success' });
        this.checkApiHealth();
      },
    });
  },

  clearFavorites() {
    wx.showModal({
      title: '\u6E05\u7A7A\u6536\u85CF',
      content: '\u786E\u5B9A\u8981\u6E05\u7A7A\u6240\u6709\u6536\u85CF\u5417\uFF1F',
      success: async (res) => {
        if (!res.confirm) {
          return;
        }
        try {
          await favoritesApi.clear();
          wx.showToast({ title: '\u6536\u85CF\u5DF2\u6E05\u7A7A', icon: 'success' });
        } catch (error) {}
      },
    });
  },

  clearRecords() {
    wx.showModal({
      title: '\u6E05\u7A7A\u8BB0\u5F55',
      content: '\u786E\u5B9A\u8981\u6E05\u7A7A\u5B66\u4E60\u8BB0\u5F55\u5417\uFF1F',
      success: async (res) => {
        if (!res.confirm) {
          return;
        }
        try {
          await recordsApi.clear();
          wx.showToast({ title: '\u8BB0\u5F55\u5DF2\u6E05\u7A7A', icon: 'success' });
        } catch (error) {}
      },
    });
  },

  logout() {
    wx.showModal({
      title: '\u9000\u51FA\u767B\u5F55',
      content: '\u786E\u5B9A\u8981\u9000\u51FA\u5F53\u524D\u8D26\u53F7\u5417\uFF1F',
      confirmColor: '#d9534f',
      success: async (res) => {
        if (!res.confirm) {
          return;
        }
        await getApp().logoutSession({ silent: true });
        this.setData({ isLogin: false });
        wx.showToast({ title: '\u5DF2\u9000\u51FA\u767B\u5F55', icon: 'success' });
      },
    });
  },
});
