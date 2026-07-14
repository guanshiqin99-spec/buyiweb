const { contentApi } = require('../../utils/api');
const Favorites = require('../../utils/favorites');
const { buildFavoriteLookup, applyFavoriteLookup, mapContentList } = require('../../utils/content-mapper');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    items: [],
    currentTheme: 'light',
    fontSizeClass: 'medium',
    loading: false,
    errorText: '',
  },

  onShow() {
    syncAppearance(this);
    this.loadItems();
  },

  async loadItems() {
    this.setData({ loading: true, errorText: '' });
    try {
      const payload = await contentApi.listByType('proverb', 1, 50);
      let items = mapContentList(payload.items || [], 'proverb');
      if (getApp().globalData.isLogin) {
        const groups = await Favorites.getGroups();
        items = applyFavoriteLookup(items, buildFavoriteLookup(groups));
      }
      this.setData({ items, loading: false });
    } catch (error) {
      this.setData({ items: [], loading: false, errorText: '谚语加载失败' });
    }
  },

  async toggleFavorite(e) {
    const index = e.currentTarget.dataset.index;
    const items = this.data.items.slice();
    const item = items[index];
    if (!item) {
      return;
    }

    const previous = !!item.fav;
    items[index] = { ...item, fav: !previous, isFavorited: !previous };
    this.setData({ items });

    try {
      const result = await Favorites.toggle(item);
      if (result && result.skipped) {
        items[index] = { ...item, fav: previous, isFavorited: previous };
        this.setData({ items });
        return;
      }
      items[index] = { ...item, fav: !!result.isFavorited, isFavorited: !!result.isFavorited };
      this.setData({ items });
    } catch (error) {
      items[index] = { ...item, fav: previous, isFavorited: previous };
      this.setData({ items });
      wx.showToast({ title: '收藏失败，请稍后重试', icon: 'none' });
    }
  },
});
