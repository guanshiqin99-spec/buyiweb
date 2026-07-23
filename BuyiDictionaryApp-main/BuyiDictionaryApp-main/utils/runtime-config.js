const STORAGE_KEYS = {
  apiMode: 'apiMode',
  apiBaseDev: 'apiBaseDev',
  apiBaseProd: 'apiBaseProd',
};

// 云函数代理配置
// envId: 微信云开发环境 ID(开通云开发后获得)
// functionName: 代理云函数名称
// enabledEnvVersions: 在哪些小程序环境版本下启用云函数代理
const CLOUD_FUNCTION_CONFIG = {
  envId: 'cloud1-d3gj9ohe8a7ec0023',
  functionName: 'apiProxy',
  enabledEnvVersions: ['develop', 'trial', 'release'],
};

const LOCAL_DEV_API_BASE = 'http://127.0.0.1:3000/api';

const DEFAULT_API_BASES = {
  development: 'https://casting-object-link-hide.trycloudflare.com/api',
  production: 'https://casting-object-link-hide.trycloudflare.com/api',
};

function normalizeUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function getWechatEnvVersion() {
  try {
    if (wx.getAccountInfoSync) {
      const info = wx.getAccountInfoSync();
      return (info && info.miniProgram && info.miniProgram.envVersion) || 'develop';
    }
  } catch (error) {}
  return 'develop';
}

function normalizeApiMode(mode) {
  if (mode === 'development' || mode === 'production') {
    return mode;
  }
  return 'auto';
}

function shouldUseCloudFunction(envVersion = getWechatEnvVersion()) {
  if (!CLOUD_FUNCTION_CONFIG.envId || !CLOUD_FUNCTION_CONFIG.functionName) {
    return false;
  }
  return CLOUD_FUNCTION_CONFIG.enabledEnvVersions.includes(envVersion);
}

// 保留旧接口名称以兼容 app.js 中的调用
function shouldUseCloudContainer(envVersion) {
  return shouldUseCloudFunction(envVersion);
}

function getCloudContainerConfig(envVersion = getWechatEnvVersion()) {
  return {
    ...CLOUD_FUNCTION_CONFIG,
    enabled: shouldUseCloudFunction(envVersion),
  };
}

function mapEnvVersionToMode(envVersion) {
  return envVersion === 'release' ? 'production' : 'development';
}

function isLegacyApiBase(url) {
  if (!url) return false;
  return url.includes('10.70.153.97') || url.includes('47.114.114.135');
}

function getStoredApiBases() {
  let devUrl = normalizeUrl(wx.getStorageSync(STORAGE_KEYS.apiBaseDev));
  let prodUrl = normalizeUrl(wx.getStorageSync(STORAGE_KEYS.apiBaseProd));
  if (isLegacyApiBase(devUrl)) { wx.removeStorageSync(STORAGE_KEYS.apiBaseDev); devUrl = ''; }
  if (isLegacyApiBase(prodUrl)) { wx.removeStorageSync(STORAGE_KEYS.apiBaseProd); prodUrl = ''; }
  return {
    development: devUrl || DEFAULT_API_BASES.development,
    production: prodUrl || DEFAULT_API_BASES.production,
  };
}

function loadApiConfig() {
  const envVersion = getWechatEnvVersion();
  const apiMode = normalizeApiMode(wx.getStorageSync(STORAGE_KEYS.apiMode));
  const apiBases = getStoredApiBases();
  const activeMode = apiMode === 'auto' ? mapEnvVersionToMode(envVersion) : apiMode;

  return {
    apiMode,
    activeMode,
    envVersion,
    apiBase: apiBases[activeMode],
    apiBases,
  };
}

function saveApiMode(mode) {
  const normalized = normalizeApiMode(mode);
  wx.setStorageSync(STORAGE_KEYS.apiMode, normalized);
  return normalized;
}

function saveApiBase(mode, url) {
  const normalizedUrl = normalizeUrl(url);
  const targetMode = mode === 'production' ? 'production' : 'development';
  const key = targetMode === 'production' ? STORAGE_KEYS.apiBaseProd : STORAGE_KEYS.apiBaseDev;
  wx.setStorageSync(key, normalizedUrl || DEFAULT_API_BASES[targetMode]);
  return loadApiConfig();
}

function resetApiConfig() {
  wx.removeStorageSync(STORAGE_KEYS.apiMode);
  wx.removeStorageSync(STORAGE_KEYS.apiBaseDev);
  wx.removeStorageSync(STORAGE_KEYS.apiBaseProd);
  return loadApiConfig();
}

function getEnvLabel(envVersion) {
  switch (envVersion) {
    case 'release':
      return '正式版';
    case 'trial':
      return '体验版';
    default:
      return '开发版';
  }
}

module.exports = {
  CLOUD_FUNCTION_CONFIG,
  LOCAL_DEV_API_BASE,
  DEFAULT_API_BASES,
  getCloudContainerConfig,
  loadApiConfig,
  saveApiMode,
  saveApiBase,
  resetApiConfig,
  getEnvLabel,
  shouldUseCloudFunction,
  shouldUseCloudContainer,
};
