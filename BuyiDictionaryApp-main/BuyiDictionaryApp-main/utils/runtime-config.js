const STORAGE_KEYS = {
  apiMode: 'apiMode',
  apiBaseDev: 'apiBaseDev',
  apiBaseProd: 'apiBaseProd',
};

const CLOUD_CONTAINER_CONFIG = {
  envId: 'cloud1-1gl3y5g7fbe3c208',
  serviceName: 'buyidict-backend',
  enabledEnvVersions: ['develop', 'trial', 'release'],
};

const LOCAL_DEV_API_BASE = 'http://127.0.0.1:3000/api';

const DEFAULT_API_BASES = {
  development: 'https://buyidict-backend-255536-7-1374507614.sh.run.tcloudbase.com/api',
  production: 'https://buyidict-backend-255536-7-1374507614.sh.run.tcloudbase.com/api',
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

function shouldUseCloudContainer(envVersion = getWechatEnvVersion()) {
  if (!CLOUD_CONTAINER_CONFIG.envId || !CLOUD_CONTAINER_CONFIG.serviceName) {
    return false;
  }
  return CLOUD_CONTAINER_CONFIG.enabledEnvVersions.includes(envVersion);
}

function getCloudContainerConfig(envVersion = getWechatEnvVersion()) {
  return {
    ...CLOUD_CONTAINER_CONFIG,
    enabled: shouldUseCloudContainer(envVersion),
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
      return '\u6B63\u5F0F\u7248';
    case 'trial':
      return '\u4F53\u9A8C\u7248';
    default:
      return '\u5F00\u53D1\u7248';
  }
}

module.exports = {
  CLOUD_CONTAINER_CONFIG,
  LOCAL_DEV_API_BASE,
  DEFAULT_API_BASES,
  getCloudContainerConfig,
  loadApiConfig,
  saveApiMode,
  saveApiBase,
  resetApiConfig,
  getEnvLabel,
  shouldUseCloudContainer,
};
