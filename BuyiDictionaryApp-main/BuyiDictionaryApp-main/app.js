const {
  getCloudContainerConfig,
  LOCAL_DEV_API_BASE,
  loadApiConfig,
  saveApiMode,
  saveApiBase,
  resetApiConfig,
  shouldUseCloudContainer,
} = require('./utils/runtime-config');

App({
  onLaunch() {
    this.initializeThemeAndFont();
    this.initializeCloudBase();
    if (wx.onThemeChange) {
      wx.onThemeChange(({ theme }) => {
        const nextTheme = theme === 'dark' ? 'dark' : 'light';
        this.applySettings({ theme: nextTheme }, { persist: true, broadcast: true });
      });
    }
  },

  onShow() {
    this.refreshApiConfig();
    this._applyTabBarThemeWithDelay(16);
    this.showDailyLearningReminder();
  },

  initializeThemeAndFont() {
    const theme = wx.getStorageSync('theme') || '\u006c\u0069\u0067\u0068\u0074';
    const fontSize = wx.getStorageSync('fontSize') || '\u4e2d';
    const notifications = wx.getStorageSync('notifications') === true;
    const autoplay = wx.getStorageSync('autoplay') === true;
    const loginState = wx.getStorageSync('loginState') || {};
    const apiConfig = loadApiConfig();

    this.globalData.theme = theme;
    this.globalData.fontSize = fontSize;
    this.globalData.notifications = notifications;
    this.globalData.autoplay = autoplay;
    this.globalData.isLogin = !!loginState.isLogin && !!loginState.token;
    this.globalData.userInfo = loginState.userInfo || null;
    this.globalData.token = loginState.token || '';
    this.globalData.refreshToken = loginState.refreshToken || '';
    this.globalData.apiBase = apiConfig.apiBase;
    this.globalData.apiMode = apiConfig.apiMode;
    this.globalData.activeApiMode = apiConfig.activeMode;
    this.globalData.apiBases = apiConfig.apiBases;
    this.globalData.wechatEnvVersion = apiConfig.envVersion;

    this._applyTabBarThemeImmediate();
  },

  refreshApiConfig() {
    const apiConfig = loadApiConfig();
    const cloudContainer = getCloudContainerConfig(apiConfig.envVersion);
    this.globalData.apiBase = apiConfig.apiBase;
    this.globalData.apiMode = apiConfig.apiMode;
    this.globalData.activeApiMode = apiConfig.activeMode;
    this.globalData.apiBases = apiConfig.apiBases;
    this.globalData.wechatEnvVersion = apiConfig.envVersion;
    this.globalData.cloudContainer = cloudContainer;
    return apiConfig;
  },

  initializeCloudBase() {
    const cloudContainer = getCloudContainerConfig(this.globalData.wechatEnvVersion);
    this.globalData.cloudContainer = cloudContainer;
    if (!cloudContainer.envId) {
      return;
    }
    if (!wx.cloud || !wx.cloud.init) {
      console.warn('[CloudBase] wx.cloud 不可用，请确认 app.json 已配置 "cloud": true');
      return;
    }
    try {
      wx.cloud.init({ env: cloudContainer.envId, traceUser: true });
      console.log('[CloudBase] wx.cloud.init 成功，env:', cloudContainer.envId);
    } catch (error) {
      console.error('[CloudBase] wx.cloud.init 失败:', error);
    }
  },

  getApiBase() {
    return this.globalData.apiBase || this.refreshApiConfig().apiBase;
  },

  getCloudContainerConfig() {
    return this.globalData.cloudContainer || getCloudContainerConfig(this.globalData.wechatEnvVersion);
  },

  shouldUseCloudContainer() {
    const envVersion = this.globalData.wechatEnvVersion || loadApiConfig().envVersion;
    return shouldUseCloudContainer(envVersion);
  },

  requestApi(options = {}) {
    const {
      path,
      method = 'GET',
      data,
      header = {},
      timeout = 15000,
    } = options;
    const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;

    if (this.shouldUseCloudContainer() && wx.cloud && wx.cloud.callFunction) {
      const cloudConfig = this.getCloudContainerConfig();
      console.log('[CloudFunc] callFunction →', method, normalizedPath, 'function:', cloudConfig.functionName, 'env:', cloudConfig.envId);
      return wx.cloud.callFunction({
        config: { env: cloudConfig.envId },
        name: cloudConfig.functionName,
        data: {
          path: normalizedPath,
          method,
          data,
          headers: header,
        },
      }).then((res) => {
        const result = res && res.result ? res.result : {};
        console.log('[CloudFunc] callFunction 响应', normalizedPath, 'statusCode:', result.statusCode, 'dataLen:', result.data ? JSON.stringify(result.data).length : 0);
        return {
          statusCode: result.statusCode || 200,
          data: result.data,
          headers: result.headers || {},
        };
      }).catch((err) => {
        console.error('[CloudFunc] callFunction 失败', normalizedPath, 'errMsg:', err.errMsg, 'errCode:', err.errCode, 'fullErr:', JSON.stringify(err));
        throw err;
      });
    }
    console.warn('[CloudFunc] 未走云函数，降级到 wx.request，envVersion:', this.globalData.wechatEnvVersion, 'hasCloud:', !!wx.cloud);


    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.getApiBase().replace(/\/+$/, '')}${normalizedPath}`,
        method,
        data,
        timeout,
        header: {
          'content-type': 'application/json',
          ...header,
        },
        success: resolve,
        fail: reject,
      });
    });
  },

  getApiConfig() {
    return {
      apiMode: this.globalData.apiMode,
      activeApiMode: this.globalData.activeApiMode,
      apiBase: this.globalData.apiBase,
      apiBases: this.globalData.apiBases,
      cloudContainer: this.globalData.cloudContainer,
      wechatEnvVersion: this.globalData.wechatEnvVersion,
    };
  },

  setApiMode(mode) {
    saveApiMode(mode);
    const config = this.refreshApiConfig();
    try {
      this.eventBus.emit('api:changed', config);
    } catch (error) {}
    return config;
  },

  setApiBaseFor(mode, url) {
    const config = saveApiBase(mode, url);
    this.refreshApiConfig();
    try {
      this.eventBus.emit('api:changed', config);
    } catch (error) {}
    return config;
  },

  resetApiConfig() {
    const config = resetApiConfig();
    this.refreshApiConfig();
    try {
      this.eventBus.emit('api:changed', config);
    } catch (error) {}
    return config;
  },

  getToken() {
    return this.globalData.token || '';
  },

  getRefreshToken() {
    return this.globalData.refreshToken || '';
  },

  _persistLoginState() {
    wx.setStorageSync('loginState', {
      isLogin: !!this.globalData.isLogin,
      token: this.globalData.token || '',
      refreshToken: this.globalData.refreshToken || '',
      userInfo: this.globalData.userInfo || null,
    });
  },

  applySettings(settings = {}, options = {}) {
    const persist = options.persist !== false;
    const broadcast = options.broadcast !== false;

    if (settings.theme) {
      this.globalData.theme = settings.theme;
      if (persist) {
        wx.setStorageSync('theme', settings.theme);
      }
      if (broadcast) {
        try { this.eventBus.emit('theme:changed', { theme: settings.theme }); } catch (error) {}
      }
    }

    if (settings.fontSize) {
      this.globalData.fontSize = settings.fontSize;
      if (persist) {
        wx.setStorageSync('fontSize', settings.fontSize);
      }
      if (broadcast) {
        try { this.eventBus.emit('font:changed', { fontSize: settings.fontSize }); } catch (error) {}
      }
    }

    if (settings.notifications !== undefined) {
      this.globalData.notifications = settings.notifications === true;
      if (persist) wx.setStorageSync('notifications', this.globalData.notifications);
    }

    if (settings.autoplay !== undefined) {
      this.globalData.autoplay = settings.autoplay === true;
      if (persist) wx.setStorageSync('autoplay', this.globalData.autoplay);
    }

    this._applyTabBarThemeWithDelay(0);
  },

  showDailyLearningReminder() {
    if (!this.globalData.notifications) return;
    const now = new Date();
    if (now.getHours() < 20) return;
    const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (wx.getStorageSync('lastLearningReminderDay') === dayKey) return;
    wx.setStorageSync('lastLearningReminderDay', dayKey);
    wx.showModal({
      title: '今日学习提醒',
      content: '来复习几个布依语词条，或完成一轮文化答题吧。',
      confirmText: '去学习',
      cancelText: '稍后',
      success: (result) => {
        if (result.confirm) wx.switchTab({ url: '/pages/app/index' });
      },
    });
  },

  updateLoginState(userInfo, token, refreshTokenOrSettings, maybeSettings = {}) {
    const refreshToken = typeof refreshTokenOrSettings === 'string' ? refreshTokenOrSettings : '';
    const settings =
      typeof refreshTokenOrSettings === 'string' ? maybeSettings || {} : refreshTokenOrSettings || {};
    const normalizedSettings = {
      ...settings,
      notifications: settings.notifications === true || settings.notifications === 'true',
      autoplay: settings.autoplay === true || settings.autoplay === 'true',
    };
    const safeUser = userInfo
      ? {
          id: userInfo.id || null,
          nickName: userInfo.nickname || userInfo.nickName || '',
          nickname: userInfo.nickname || userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          phoneNumber: userInfo.phoneNumber || '',
        }
      : null;

    this.globalData.isLogin = true;
    this.globalData.userInfo = safeUser;
    this.globalData.token = token || '';
    this.globalData.refreshToken = refreshToken || '';
    this._persistLoginState();

    if (settings && Object.keys(settings).length) {
      this.applySettings(normalizedSettings, { persist: true, broadcast: true });
      this.showDailyLearningReminder();
    }

    try {
      this.eventBus.emit('login:changed', {
        isLogin: true,
        token: this.globalData.token,
        refreshToken: this.globalData.refreshToken,
        userInfo: safeUser,
      });
    } catch (error) {}
  },

  async refreshAccessToken() {
    if (this._refreshPromise) {
      return this._refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('\u7f3a\u5c11\u5237\u65b0\u4ee4\u724c');
    }

    this._refreshPromise = new Promise((resolve, reject) => {
      this.requestApi({
        path: '/miniapp/auth/refresh',
        method: 'POST',
        data: { refreshToken },
      })
        .then((res) => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error((res.data && res.data.message) || '\u5237\u65b0\u767b\u5f55\u5931\u8d25'));
            return;
          }

          const payload = res.data || {};
          this.updateLoginState(payload.user, payload.accessToken, payload.refreshToken, payload.settings || {});
          resolve(payload.accessToken);
        })
        .catch(() => {
          reject(new Error('\u5237\u65b0\u767b\u5f55\u5931\u8d25'));
        });
    })
      .catch((error) => {
        this.clearLoginState({ silent: true });
        throw error;
      })
      .finally(() => {
        this._refreshPromise = null;
      });

    return this._refreshPromise;
  },

  async logoutSession(options = {}) {
    const token = this.getToken();
    const silent = options.silent === true;

    if (!token) {
      this.clearLoginState({ silent });
      return;
    }

    await new Promise((resolve) => {
      this.requestApi({
        path: '/miniapp/auth/logout',
        method: 'POST',
        header: {
          Authorization: `Bearer ${token}`,
        },
      })
        .catch(() => null)
        .finally(() => {
          resolve();
        });
    });

    this.clearLoginState({ silent });
  },

  clearLoginState(options = {}) {
    const silent = options.silent === true;

    this.globalData.isLogin = false;
    this.globalData.userInfo = null;
    this.globalData.token = '';
    this.globalData.refreshToken = '';

    try { wx.removeStorageSync('loginState'); } catch (error) {}

    try {
      this.eventBus.emit('login:changed', {
        isLogin: false,
        token: '',
        refreshToken: '',
        userInfo: null,
      });
    } catch (error) {}

    if (!silent) {
      wx.showToast({ title: '\u8bf7\u5148\u767b\u5f55', icon: 'none' });
    }
  },

  ensureLogin(options = {}) {
    if (this.globalData.isLogin && this.globalData.token) {
      return true;
    }

    if (options.redirect !== false) {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (!current || current.route !== 'pages/login/login') {
        wx.navigateTo({ url: '/pages/login/login' });
      }
    }
    return false;
  },

  _initPlayer() {
    if (this._player) {
      return this._player;
    }

    const player = wx.createInnerAudioContext();
    player.obeyMuteSwitch = true;
    this._player = player;
    this.globalData.player = player;

    player.onPlay(() => {
      this.globalData.playerState.isPlaying = true;
      this.eventBus.emit('player:state', { ...this.globalData.playerState });
    });

    player.onPause(() => {
      this.globalData.playerState.isPlaying = false;
      this.eventBus.emit('player:state', { ...this.globalData.playerState });
    });

    player.onStop(() => {
      this.globalData.playerState.isPlaying = false;
      this.eventBus.emit('player:state', { ...this.globalData.playerState });
    });

    player.onEnded(() => {
      this.globalData.playerState.isPlaying = false;
      this.eventBus.emit('player:state', { ...this.globalData.playerState });
      try { this.playNext(); } catch (error) {}
    });

    player.onTimeUpdate(() => {
      this.globalData.playerState.currentTime = player.currentTime || 0;
      this.globalData.playerState.duration = player.duration || this.globalData.playerState.duration || 0;
      this.eventBus.emit('player:time', {
        currentTime: this.globalData.playerState.currentTime,
        duration: this.globalData.playerState.duration,
      });
    });

    player.onCanplay(() => {
      setTimeout(() => {
        const duration = player.duration || 0;
        if (duration && !Number.isNaN(duration)) {
          this.globalData.playerState.duration = duration;
          this.eventBus.emit('player:state', { ...this.globalData.playerState });
        }
      }, 200);
    });

    return player;
  },

  playSong(song, playlist, index) {
    if (!song || !song.audio) {
      return;
    }

    const player = this._initPlayer();
    const current = this.globalData.playerState.currentSong;

    this.globalData.playerState.currentSong = song;
    if (Array.isArray(playlist) && playlist.length) {
      this.globalData.playerState.playlist = playlist;
      this.globalData.playerState.currentIndex = typeof index === 'number' ? index : 0;
    }

    if (!current || current.audio !== song.audio) {
      player.src = song.audio;
    }

    player.play();
    this.globalData.playerState.isPlaying = true;
    this.eventBus.emit('player:state', { ...this.globalData.playerState });
  },

  playNext() {
    const state = this.globalData.playerState || {};
    const list = state.playlist || [];
    if (!list.length) {
      return;
    }

    const nextIndex = (state.currentIndex + 1) % list.length;
    const nextSong = list[nextIndex];
    if (!nextSong || !nextSong.audio) {
      return;
    }

    this.playSong(nextSong, list, nextIndex);
  },

  playPrev() {
    const state = this.globalData.playerState || {};
    const list = state.playlist || [];
    if (!list.length) {
      return;
    }

    const prevIndex = (state.currentIndex - 1 + list.length) % list.length;
    const prevSong = list[prevIndex];
    if (!prevSong || !prevSong.audio) {
      return;
    }

    this.playSong(prevSong, list, prevIndex);
  },

  pausePlayer() {
    const player = this._initPlayer();
    player.pause();
    this.globalData.playerState.isPlaying = false;
    this.eventBus.emit('player:state', { ...this.globalData.playerState });
  },

  togglePlay() {
    const player = this._initPlayer();
    if (this.globalData.playerState.isPlaying) {
      player.pause();
      this.globalData.playerState.isPlaying = false;
    } else {
      player.play();
      this.globalData.playerState.isPlaying = true;
    }
    this.eventBus.emit('player:state', { ...this.globalData.playerState });
  },

  seekPlayer(time) {
    const player = this._initPlayer();
    if (typeof time === 'number' && !Number.isNaN(time)) {
      player.seek(time);
    }
  },

  eventBus: {
    _handlers: {},
    on(key, fn) {
      (this._handlers[key] = this._handlers[key] || []).push(fn);
    },
    off(key, fn) {
      if (!this._handlers[key]) {
        return;
      }
      if (!fn) {
        this._handlers[key] = [];
        return;
      }
      this._handlers[key] = this._handlers[key].filter((item) => item !== fn);
    },
    emit(key, data) {
      (this._handlers[key] || []).forEach((fn) => {
        try { fn(data); } catch (error) { console.error('eventBus handler error', error); }
      });
    },
  },

  _getTabBarStyle() {
    const theme = this.globalData.theme || 'light';
    if (theme === 'dark') {
      return {
        backgroundColor: '#1f2937',
        borderStyle: 'white',
        color: '#9ca3af',
        selectedColor: '#ffffff',
      };
    }
    return {
      backgroundColor: '#ffffff',
      borderStyle: 'black',
      color: '#7c8aa5',
      selectedColor: '#2056c9',
    };
  },

  _applyTabBarThemeImmediate() {
    const style = this._getTabBarStyle();
    wx.setTabBarStyle({ ...style, fail: () => {} });
  },

  _applyTabBarThemeWithDelay(delay = 16) {
    if (this._tabBarThemeTimer) {
      clearTimeout(this._tabBarThemeTimer);
    }

    const style = this._getTabBarStyle();
    wx.setTabBarStyle({
      ...style,
      fail: () => {
        this._tabBarThemeTimer = setTimeout(() => {
          wx.setTabBarStyle({ ...style, fail: () => {} });
        }, delay);
      },
    });
  },

  globalData: {
    apiBase: LOCAL_DEV_API_BASE,
    apiMode: 'auto',
    activeApiMode: 'development',
    apiBases: {
      development: LOCAL_DEV_API_BASE,
      production: 'https://api.buyi.example.com/api',
    },
    wechatEnvVersion: 'develop',
    theme: 'light',
    fontSize: '\u4e2d',
    notifications: false,
    autoplay: false,
    learningReminderTemplateId: '',
    isLogin: false,
    token: '',
    refreshToken: '',
    userInfo: null,
    player: null,
    playerState: {
      isPlaying: false,
      currentSong: null,
      currentTime: 0,
      duration: 0,
      playlist: [],
      currentIndex: 0,
    },
  },
});
