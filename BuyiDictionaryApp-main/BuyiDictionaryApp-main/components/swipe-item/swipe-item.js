Component({
  options: {
    multipleSlots: true
  },
  properties: {
    index: { type: Number, value: 0 },
    type: { type: String, value: 'word' },
    deleteText: { type: String, value: '删除' },
    deleteWidth: { type: Number, value: 140 },
    deleteIcon: { type: String, value: '/assets/icons/trash.png' },
    useIcon: { type: Boolean, value: false }, // 改为文本因为没合适的垃圾桶图标对比度或者大小
  },

  data: {
    translateX: 0,
  },

  lifetimes: {
    attached() {
      try {
        if (wx.getWindowInfo && typeof wx.getWindowInfo === 'function') {
          const info = wx.getWindowInfo();
          if (info && info.windowWidth) {
            this._pxToRpx = 750 / info.windowWidth;
            return;
          }
        }
      } catch (error) {}

      this._pxToRpx = 750 / 375;
    },
  },

  methods: {
    touchStart(e) {
      try {
        const touch = e.touches && e.touches[0];
        if (touch) {
          this._startX = touch.clientX;
        }
        this.triggerEvent('open', { index: this.properties.index, type: this.properties.type });
      } catch (error) {
        console.error('swipe-item touchStart error', error);
      }
    },

    touchMove(e) {
      try {
        if (!this._startX) {
          return;
        }
        const touch = e.touches && e.touches[0];
        if (!touch) {
          return;
        }
        const dx = touch.clientX - this._startX;
        const rpx = Math.min(0, dx * (this._pxToRpx || (750 / 375)));
        const max = -this.properties.deleteWidth;
        const translateX = rpx < max ? max : rpx;
        this.setData({ translateX });
      } catch (error) {
        console.error('swipe-item touchMove error', error);
      }
    },

    touchEnd() {
      try {
        const threshold = -Math.min(60, this.properties.deleteWidth / 2);
        const translateX = this.data.translateX <= threshold ? -this.properties.deleteWidth : 0;
        this.setData({ translateX });
        this._startX = null;
      } catch (error) {
        console.error('swipe-item touchEnd error', error);
        this.setData({ translateX: 0 });
        this._startX = null;
      }
    },

    close() {
      this.setData({ translateX: 0 });
    },

    onDeleteTap() {
      this.triggerEvent('delete', { index: this.properties.index, type: this.properties.type });
    },
  },
});
