const { favoritesApi } = require('./api');
const { mapFavoriteGroups, buildFavoriteLookup, getFavoriteKey } = require('./content-mapper');

function isLoggedIn() {
  const app = getApp();
  return !!(app.globalData.isLogin && app.globalData.token);
}

function emptyGroups() {
  return {
    dictionary: [],
    phrases: [],
    proverbs: [],
    songs: [],
  };
}

function emitChange(payload) {
  try {
    getApp().eventBus.emit('favorites:changed', payload);
  } catch (error) {}
}

async function loadGroups() {
  if (!isLoggedIn()) {
    return emptyGroups();
  }
  const payload = await favoritesApi.list();
  return mapFavoriteGroups(payload);
}

module.exports = {
  async getGroups() {
    return loadGroups();
  },

  async getLookup() {
    const groups = await loadGroups();
    return buildFavoriteLookup(groups);
  },

  async getAll() {
    const groups = await loadGroups();
    return [].concat(groups.dictionary, groups.phrases, groups.proverbs);
  },

  async getAllSorted() {
    return this.getAll();
  },

  async isFav(item) {
    if (!isLoggedIn()) {
      return false;
    }
    const lookup = await this.getLookup();
    return lookup.has(getFavoriteKey(item));
  },

  async toggle(item) {
    const app = getApp();
    if (!app.ensureLogin()) {
      return { isFavorited: false, skipped: true };
    }

    const contentType = item.contentType || item.type;
    const contentId = item.contentId || item.id;
    if (!contentType || !contentId) {
      wx.showToast({ title: '缺少收藏信息', icon: 'none' });
      return { isFavorited: false, skipped: true };
    }

    const result = await favoritesApi.toggle(contentType, contentId);
    emitChange({
      action: result.isFavorited ? 'add' : 'remove',
      item: { ...item, contentType, contentId, fav: result.isFavorited, isFavorited: result.isFavorited },
    });
    return result;
  },

  async remove(item) {
    return this.toggle(item);
  },

  async removeById(id, contentType) {
    if (!id || !contentType) {
      return false;
    }
    const result = await this.toggle({ id, contentId: id, contentType });
    return !!result;
  },

  async refresh() {
    const groups = await loadGroups();
    emitChange({ action: 'refresh', groups });
    return groups;
  },

  subscribe(fn) {
    try {
      getApp().eventBus.on('favorites:changed', fn);
    } catch (error) {}
  },

  unsubscribe(fn) {
    try {
      getApp().eventBus.off('favorites:changed', fn);
    } catch (error) {}
  },
};
