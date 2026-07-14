Component({
  properties: {
    text: {
      type: String,
      value: '按钮'
    },
    type: {
      type: String,
      value: 'primary' // 支持 primary / danger / secondary
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent('tap'); // 向父组件传递 tap 事件
    }
  }
});
