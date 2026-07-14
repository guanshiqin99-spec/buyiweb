const app = getApp();

Component({
  data: {
    selected: 0,
    theme: 'light',
    list: [
      { pagePath: '/pages/home/index', text: '首页', iconPath: '/assets/icons/home.png', selectedIconPath: '/assets/icons/home-active.png' },
      { pagePath: '/pages/app/index', text: '应用', iconPath: '/assets/icons/app.png', selectedIconPath: '/assets/icons/app-active.png' },
      { pagePath: '/pages/favorite/index', text: '收藏', iconPath: '/assets/icons/favorite.png', selectedIconPath: '/assets/icons/favorite-active.png' },
      { pagePath: '/pages/song/index', text: '民歌', iconPath: '/assets/icons/song.png', selectedIconPath: '/assets/icons/song-active.png' },
      { pagePath: '/pages/mine/index', text: '我的', iconPath: '/assets/icons/mine.png', selectedIconPath: '/assets/icons/mine-active.png' },
    ],
  },

  lifetimes: {
    attached() {
      this.updateSelected();
      this.updateTheme();
      this._themeHandler = () => this.updateTheme();
      try {
        app.eventBus.on('theme:changed', this._themeHandler);
      } catch (error) {}
    },
    detached() {
      try {
        app.eventBus.off('theme:changed', this._themeHandler);
      } catch (error) {}
    },
  },

  pageLifetimes: {
    show() {
      this.updateSelected();
      this.updateTheme();
    },
  },

  methods: {
    updateTheme() {
      const theme = app.globalData.theme || wx.getStorageSync('theme') || 'light';
      this.setData({ theme });
    },

    updateSelected() {
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (!current || !current.route) {
        return;
      }

      const route = current.route.startsWith('/') ? current.route : `/${current.route}`;
      let index = this.data.list.findIndex((item) => item.pagePath.toLowerCase() === route.toLowerCase());
      if (index < 0) {
        const currentFolder = route.split('/')[2];
        index = this.data.list.findIndex((item) => item.pagePath.split('/')[2] === currentFolder);
      }
      this.setData({ selected: index < 0 ? 0 : index });
    },

    onTabItemTap(e) {
      const index = e.currentTarget.dataset.index;
      const url = this.data.list[index].pagePath;
      wx.switchTab({ url });
    },
  },
});
