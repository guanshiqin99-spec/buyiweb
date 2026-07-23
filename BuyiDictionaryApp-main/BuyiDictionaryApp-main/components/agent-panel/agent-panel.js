const { askStream } = require('../../utils/agentStream');

Component({
  properties: {},

  data: {
    open: false,
    inputText: '',
    sending: false,
    messages: [
      {
        role: 'assistant',
        content: '你好！我是「布依文化导览员」，可以解答布依语词汇、声调、民歌、谚语、蜡染、铜鼓、民俗节日等相关问题。请问想了解什么？',
      },
    ],
    scrollIntoView: '',
  },

  lifetimes: {
    attached() {
      this._history = [];
    },
    detached() {
      // 离开页面时不需要中断已发出的请求（云函数已不可取消）
      // 组件销毁时恢复底部导航栏，避免影响其他页面
      this._toggleTabBar(true);
    },
  },

  methods: {
    onTogglePanel() {
      const open = !this.data.open;
      this.setData({ open });
      // 打开面板时隐藏底部导航栏，防止输入区与导航栏重叠
      this._toggleTabBar(!open);
    },

    onClosePanel() {
      this.setData({ open: false });
      // 关闭面板后恢复底部导航栏
      this._toggleTabBar(true);
    },

    _toggleTabBar(visible) {
      try {
        const app = getApp();
        if (app && app.eventBus) {
          app.eventBus.emit(visible ? 'tabbar:show' : 'tabbar:hide');
        }
      } catch (e) {}
      const method = visible ? wx.showTabBar : wx.hideTabBar;
      if (typeof method === 'function') {
        method.call(wx, { animation: true, fail: () => {} });
      }
    },

    onInput(e) {
      this.setData({ inputText: e.detail.value || '' });
    },

    onSend() {
      const question = String(this.data.inputText || '').trim();
      if (!question || this.data.sending) return;

      const app = getApp();
      if (!(app && app.globalData && app.globalData.isLogin && app.globalData.token)) {
        wx.showToast({ title: '请先登录后使用 AI 导览员', icon: 'none' });
        return;
      }

      const userMsg = { role: 'user', content: question };
      const assistantPlaceholder = { role: 'assistant', content: '', loading: true };
      const messages = this.data.messages.concat([userMsg, assistantPlaceholder]);
      this.setData({
        messages,
        inputText: '',
        sending: true,
      });
      this._scrollToBottom();

      const messageIndex = messages.length - 1;
      let accumulated = '';

      askStream(question, this._history.slice(-6), {
        onDelta: (chunk) => {
          accumulated += chunk;
          const next = this.data.messages.slice();
          next[messageIndex] = { role: 'assistant', content: accumulated, loading: false };
          this.setData({ messages: next });
          this._scrollToBottom();
        },
        onDone: () => {
          const next = this.data.messages.slice();
          if (!accumulated) {
            next[messageIndex] = { role: 'assistant', content: '（未收到内容，请稍后重试）', loading: false };
          } else {
            next[messageIndex] = { role: 'assistant', content: accumulated, loading: false };
          }
          this._history.push({ role: 'user', content: question });
          this._history.push({ role: 'assistant', content: accumulated });
          this.setData({ messages: next, sending: false });
          this._scrollToBottom();
        },
        onError: (err) => {
          const next = this.data.messages.slice();
          next[messageIndex] = {
            role: 'assistant',
            content: `抱歉，${err.message || '智能体响应失败，请稍后重试'}`,
            loading: false,
            error: true,
          };
          this.setData({ messages: next, sending: false });
          this._scrollToBottom();
        },
      }).catch(() => {
        // onError 已处理，这里防止未捕获 reject
        this.setData({ sending: false });
      });
    },

    _scrollToBottom() {
      // 通过 setData 触发 scroll-into-view 滚动到最后一条消息
      this.setData({ scrollIntoView: 'agent-msg-last' });
    },

    onStop() {
      // 云函数模式下无法中断，仅重置 sending 状态提示
      this.setData({ sending: false });
      wx.showToast({ title: '当前请求无法中断，请等待响应', icon: 'none' });
    },
  },
});
