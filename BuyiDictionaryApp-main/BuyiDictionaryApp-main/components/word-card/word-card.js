Component({
  properties: {
    item: { type: Object, value: {} },
    index: { type: Number, value: 0 },
    playing: { type: Boolean, value: false }
  },
  methods: {
    onFavTap() {
      this.triggerEvent('fav', { index: this.data.index });
    },
    onPlayTap() {
      this.triggerEvent('play', { index: this.data.index });
    }
  }
});
