const TYPE_PATHS = {
  dictionary: 'dictionary',
  phrase: 'phrases',
  proverb: 'proverbs',
  song: 'songs',
};

const { LOCAL_DEV_API_BASE } = require('./runtime-config');

function getAppInstance() {
  try {
    return getApp();
  } catch (error) {
    return null;
  }
}

function getRuntimeEnvVersion() {
  try {
    if (wx.getAccountInfoSync) {
      return wx.getAccountInfoSync().miniProgram.envVersion || 'develop';
    }
  } catch (error) {}
  return 'develop';
}

function getBaseUrl() {
  const app = getAppInstance();
  const baseUrl = app && typeof app.getApiBase === 'function' ? app.getApiBase() : LOCAL_DEV_API_BASE;
  const normalized = String(baseUrl || '').replace(/\/+$/, '');

  if (getRuntimeEnvVersion() === 'release' && !/^https:\/\//i.test(normalized)) {
    throw new Error('正式版小程序必须使用 HTTPS 接口地址');
  }

  return normalized;
}

function joinUrl(path) {
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

function extractMessage(payload) {
  if (!payload) {
    return '';
  }
  if (typeof payload === 'string') {
    return payload;
  }
  if (Array.isArray(payload.message)) {
    return payload.message.join('\uFF1B');
  }
  if (payload.message && typeof payload.message === 'object') {
    return extractMessage(payload.message);
  }
  return payload.message || payload.error || payload.msg || '';
}

function redirectToLogin() {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1];
  if (current && current.route === 'pages/login/login') {
    return;
  }
  wx.navigateTo({ url: '/pages/login/login' });
}

function handleUnauthorized(options = {}) {
  const app = getAppInstance();
  if (app && typeof app.clearLoginState === 'function') {
    app.clearLoginState({ silent: true });
  }
  if (options.redirectOn401 !== false) {
    redirectToLogin();
  }
}

function rawRequest(options = {}) {
  const {
    url,
    method = 'GET',
    data,
    headers = {},
  } = options;

  const app = getAppInstance();

  if (app && typeof app.requestApi === 'function') {
    return app.requestApi({
      path: url,
      method,
      data,
      header: headers,
    });
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: joinUrl(url),
      method,
      data,
      timeout: 15000,
      header: {
        'content-type': 'application/json',
        ...headers,
      },
      success: resolve,
      fail: reject,
    });
  });
}

async function request(options = {}) {
  const {
    url,
    method = 'GET',
    data,
    needAuth = false,
    showError = true,
    redirectOn401 = true,
    allowRefresh = true,
    _retried = false,
  } = options;
  const app = getAppInstance();
  const token = app && typeof app.getToken === 'function' ? app.getToken() : '';

  if (needAuth && !token) {
    if (showError) {
      wx.showToast({ title: '\u8BF7\u5148\u767B\u5F55', icon: 'none' });
    }
    if (redirectOn401) {
      redirectToLogin();
    }
    throw new Error('\u8BF7\u5148\u767B\u5F55');
  }

  try {
    const res = await rawRequest({
      url,
      method,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data;
    }

    const message = extractMessage(res.data) || '\u8BF7\u6C42\u5931\u8D25';
    if (res.statusCode === 401 && allowRefresh && !_retried && app && typeof app.refreshAccessToken === 'function') {
      try {
        await app.refreshAccessToken();
        return request({ ...options, _retried: true });
      } catch (error) {
        handleUnauthorized({ redirectOn401 });
        if (showError) {
          wx.showToast({ title: extractMessage(error) || '\u767B\u5F55\u5DF2\u5931\u6548', icon: 'none' });
        }
        throw error instanceof Error ? error : new Error(message);
      }
    }

    if (res.statusCode === 401) {
      handleUnauthorized({ redirectOn401 });
    }
    if (showError) {
      wx.showToast({ title: message, icon: 'none' });
    }
    throw new Error(message);
  } catch (error) {
    if (error && error.errMsg) {
      const message = '\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u786E\u8BA4\u540E\u7AEF\u670D\u52A1\u5DF2\u542F\u52A8';
      if (showError) {
        wx.showToast({ title: message, icon: 'none' });
      }
      throw new Error(message);
    }
    throw error;
  }
}

function get(url, data, options = {}) {
  return request({ ...options, url, data, method: 'GET' });
}

function post(url, data, options = {}) {
  return request({ ...options, url, data, method: 'POST' });
}

function put(url, data, options = {}) {
  return request({ ...options, url, data, method: 'PUT' });
}

function del(url, data, options = {}) {
  return request({ ...options, url, data, method: 'DELETE' });
}

function getTypePath(type) {
  return TYPE_PATHS[type] || TYPE_PATHS.dictionary;
}

const authApi = {
  loginWithWechat(code, profile = {}) {
    return post(
      '/miniapp/auth/wechat-login',
      {
        code,
        nickname: profile.nickname || '',
        avatarUrl: profile.avatarUrl || '',
      },
      { allowRefresh: false },
    );
  },
  refresh(refreshToken) {
    return post('/miniapp/auth/refresh', { refreshToken }, { allowRefresh: false, showError: false, redirectOn401: false });
  },
  logout() {
    return post('/miniapp/auth/logout', {}, { needAuth: true, allowRefresh: false, showError: false, redirectOn401: false });
  },
};

const meApi = {
  get() {
    return get('/miniapp/me', null, { needAuth: true });
  },
};

const settingsApi = {
  get() {
    return get('/miniapp/settings', null, { needAuth: true });
  },
  update(theme, fontSize) {
    return put('/miniapp/settings', { theme, fontSize }, { needAuth: true });
  },
};

const homeApi = {
  get() {
    return get('/miniapp/home', null, { showError: false });
  },
};

const healthApi = {
  check() {
    return get('/health', null, { showError: false, redirectOn401: false, allowRefresh: false });
  },
};

const contentApi = {
  search(keyword) {
    const app = getAppInstance();
    const isLogin = !!(app && app.globalData && app.globalData.isLogin && app.globalData.token);
    const url = isLogin ? '/miniapp/search/mine' : '/miniapp/search';
    return get(url, { keyword, page: 1, pageSize: 20 }, { needAuth: isLogin, showError: true });
  },
  suggest(keyword) {
    return get('/miniapp/search/suggest', { keyword }, { showError: false, redirectOn401: false });
  },
  listByType(type, page = 1, pageSize = 20, keyword = '') {
    const app = getAppInstance();
    const isLogin = !!(app && app.globalData && app.globalData.isLogin && app.globalData.token);
    const path = getTypePath(type);
    const useMineEndpoint = type === 'dictionary' && isLogin;
    const url = useMineEndpoint ? `/miniapp/${path}/mine` : `/miniapp/${path}`;
    return get(url, { page, pageSize, keyword }, { needAuth: useMineEndpoint, showError: true });
  },
};

const favoritesApi = {
  list() {
    return get('/miniapp/favorites', null, { needAuth: true });
  },
  toggle(contentType, contentId) {
    return post('/miniapp/favorites/toggle', { contentType, contentId }, { needAuth: true });
  },
  clear() {
    return del('/miniapp/favorites', null, { needAuth: true });
  },
};

const recordsApi = {
  list(page = 1, pageSize = 20) {
    return get('/miniapp/learning-records', { page, pageSize }, { needAuth: true });
  },
  create(contentType, contentId, actionType) {
    return post('/miniapp/learning-records', { contentType, contentId, actionType }, {
      needAuth: true,
      showError: false,
      redirectOn401: false,
    });
  },
  clear() {
    return del('/miniapp/learning-records', null, { needAuth: true });
  },
};

module.exports = {
  request,
  get,
  post,
  put,
  del,
  authApi,
  meApi,
  settingsApi,
  homeApi,
  healthApi,
  contentApi,
  favoritesApi,
  recordsApi,
  extractMessage,
};
