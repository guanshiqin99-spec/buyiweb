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
    loadingMore: false,
    page: 1,
    totalPages: 1,
    errorText: '',
  },

  onShow() {
    syncAppearance(this);
    this.loadItems();
  },

  async loadItems(page = 1) {
    this.setData(page === 1 ? { loading: true, errorText: '' } : { loadingMore: true, errorText: '' });
    try {
      const payload = await contentApi.listByType('phrase', page, 20);
      let nextItems = mapContentList(payload.items || [], 'phrase');
      if (getApp().globalData.isLogin) {
        const groups = await Favorites.getGroups();
        nextItems = applyFavoriteLookup(nextItems, buildFavoriteLookup(groups));
      }
      const items = page === 1 ? nextItems : this.data.items.concat(nextItems.filter((item) => !this.data.items.some((current) => current.id === item.id)));
      this.setData({
        items,
        page,
        totalPages: Number(payload.totalPages || Math.max(1, Math.ceil(Number(payload.total || 0) / 20))),
        loading: false,
        loadingMore: false,
      });
    } catch (error) {
      this.setData({ items: page === 1 ? [] : this.data.items, loading: false, loadingMore: false, errorText: page === 1 ? '常用语加载失败' : '' });
      if (page > 1) wx.showToast({ title: '更多常用语加载失败', icon: 'none' });
    }
  },

  loadMore() {
    if (!this.data.loadingMore && this.data.page < this.data.totalPages) this.loadItems(this.data.page + 1);
  },

  onReachBottom() {
    this.loadMore();
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
