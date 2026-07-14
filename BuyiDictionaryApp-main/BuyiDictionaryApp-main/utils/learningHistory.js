const { recordsApi } = require('./api');
const { mapLearningRecordsResponse } = require('./content-mapper');

function isLoggedIn() {
  const app = getApp();
  return !!(app.globalData.isLogin && app.globalData.token);
}

function emitChange(payload) {
  try {
    getApp().eventBus.emit('history:changed', payload);
  } catch (error) {}
}

function getContentInfo(item = {}) {
  return {
    contentType: item.contentType || item.type,
    contentId: item.contentId || item.id,
  };
}

module.exports = {
  async list(page = 1, pageSize = 20) {
    if (!isLoggedIn()) {
      return {
        records: [],
        recent: [],
        total: 0,
        page,
        pageSize,
        stats: {
          today: 0,
          total: 0,
          streak: 0,
        },
      };
    }

    const payload = await recordsApi.list(page, pageSize);
    return mapLearningRecordsResponse(payload);
  },

  async getRecent(limit = 10) {
    const payload = await this.list(1, limit);
    return payload.recent || [];
  },

  async add(item = {}, actionType = 'view') {
    if (!isLoggedIn()) {
      return false;
    }

    const info = getContentInfo(item);
    if (!info.contentType || !info.contentId) {
      return false;
    }

    try {
      await recordsApi.create(info.contentType, info.contentId, actionType);
      emitChange({ action: 'add', item: { ...item, actionType } });
      return true;
    } catch (error) {
      return false;
    }
  },

  clear() {
    if (!isLoggedIn()) {
      return false;
    }

    return recordsApi.clear().then((result) => {
      emitChange({ action: 'clear', result });
      return true;
    });
  },

  subscribe(fn) {
    try {
      getApp().eventBus.on('history:changed', fn);
    } catch (error) {}
  },

  unsubscribe(fn) {
    try {
      getApp().eventBus.off('history:changed', fn);
    } catch (error) {}
  },
};
