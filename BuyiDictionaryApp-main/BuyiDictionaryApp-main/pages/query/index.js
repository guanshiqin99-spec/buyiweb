const { contentApi } = require('../../utils/api');
const { generateStream } = require('../../utils/agentStream');
const Favorites = require('../../utils/favorites');
const History = require('../../utils/learningHistory');
const { flattenSearchResults } = require('../../utils/content-mapper');
const { syncAppearance } = require('../../utils/view');

Page({
  data: {
    word: '',
    results: [],
    activeLang: 'buyi',
    currentTheme: 'light',
    fontSizeClass: 'medium',
    loading: false,
    loadingMore: false,
    page: 1,
    totalPages: 1,
    errorText: '',
    emptyText: '请输入关键词开始查询',
    suggestions: [],
    showSuggestions: false,
    playingIndex: -1,
  },

  suggestTimer: null,

  onLoad(options) {
    const word = decodeURIComponent((options && options.word) || '');
    syncAppearance(this, { word });

    this.initAudio();

    if (word) {
      this.fetchResults(word);
    }
  },

  // 惰性初始化 audioContext：onHide 销毁后 onShow/播放入口可重建
  initAudio() {
    if (this.audioContext) return;
    this.audioContext = wx.createInnerAudioContext();
    this.audioContext.onEnded(() => {
      this.setData({ playingIndex: -1 });
    });
    this.audioContext.onError((err) => {
      console.error('Audio Error:', err);
      this.setData({ playingIndex: -1 });
      wx.showToast({ title: '音频播放失败', icon: 'none' });
    });
    this.audioContext.onStop(() => {
      this.setData({ playingIndex: -1 });
    });
  },

  onUnload() {
    if (this.audioContext) {
      this.audioContext.destroy();
    }
    clearTimeout(this.suggestTimer);
    clearTimeout(this.hideSuggestTimer);
  },

  onHide() {
    if (this.audioContext) {
      try { this.audioContext.stop(); } catch (e) {}
      try { this.audioContext.destroy(); } catch (e) {}
      this.audioContext = null;
    }
    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer);
      this.suggestTimer = null;
    }
    if (this.hideSuggestTimer) {
      clearTimeout(this.hideSuggestTimer);
      this.hideSuggestTimer = null;
    }
  },

  onPlayAudio(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.results[index];
    const audioUrl = item.audio || item.audioUrl;

    if (!audioUrl) {
      wx.showToast({
        title: '录音资源暂时不存在',
        icon: 'none'
      });
      return;
    }

    // 防御性重建：onShow 已处理，此处兜底以防极端时序
    this.initAudio();

    if (this.data.playingIndex === index) {
      // 当前词条正在播放，停止
      this.audioContext.stop();
      this.setData({ playingIndex: -1 });
    } else {
      this.playResultAtIndex(index);
    }
  },

  onShow() {
    syncAppearance(this);
    // onHide 销毁 audioContext 后，返回页面时惰性重建
    this.initAudio();
  },

  onInput(e) {
    const value = String((e.detail && e.detail.value) || '').trim();
    this.setData({ word: value });
    
    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer);
    }
    
    if (!value) {
      this.setData({ suggestions: [], showSuggestions: false });
      return;
    }
    
    this.suggestTimer = setTimeout(async () => {
      try {
        const payload = await contentApi.suggest(value);
        let items = [];
        // Flat mapping suggestions
        if (payload.dictionary) items = items.concat(payload.dictionary);
        if (payload.phrases) items = items.concat(payload.phrases);
        if (payload.proverbs) items = items.concat(payload.proverbs);
        if (payload.songs) items = items.concat(payload.songs);
        
        // Take top 8 suggestions max
        items = items.slice(0, 8);
        this.setData({ suggestions: items, showSuggestions: items.length > 0 });
      } catch (e) {
        console.error('Suggest error:', e);
      }
    }, 300);
  },

  onSelectSuggestion(e) {
    const item = e.currentTarget.dataset.item;
    // Hide suggestions, set word to purely Chinese or Buyi
    const word = item.zhText || item.buyiText || this.data.word;
    this.setData({ word, showSuggestions: false });
    this.fetchResults(word);
  },

  onHideSuggestions() {
    this.hideSuggestTimer = setTimeout(() => {
      this.setData({ showSuggestions: false });
    }, 150);
  },

  onClear() {
    this.setData({ word: '', suggestions: [], showSuggestions: false });
  },

  onSearch() {
    const word = String(this.data.word || '').trim();
    if (!word) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }
    this.fetchResults(word);
  },

  async fetchResults(keyword, page = 1) {
    this.setData(page === 1
      ? { loading: true, errorText: '', emptyText: '没有找到相关结果' }
      : { loadingMore: true, errorText: '' });
    try {
      const payload = await contentApi.search(keyword, page, 20);
      const nextResults = flattenSearchResults(payload);
      const results = page === 1
        ? nextResults
        : this.data.results.concat(nextResults.filter((item) => !this.data.results.some((current) => `${current.contentType}:${current.id}` === `${item.contentType}:${item.id}`)));
      this.setData({
        results,
        word: keyword,
        loading: false,
        loadingMore: false,
        page,
        totalPages: Number((payload.pagination && payload.pagination.totalPages) || 1),
        errorText: '',
        emptyText: results.length ? '' : '没有找到相关结果',
      }, () => {
        if (page !== 1 || !getApp().globalData.autoplay) return;
        const audioIndex = results.findIndex((item) => item.audio || item.audioUrl);
        if (audioIndex >= 0) this.playResultAtIndex(audioIndex);
      });

      const firstDictionary = page === 1 && results.find((item) => item.contentType === 'dictionary');
      if (firstDictionary) {
        History.add(firstDictionary, 'view');
      }
    } catch (error) {
      this.setData({
        results: page === 1 ? [] : this.data.results,
        loading: false,
        loadingMore: false,
        errorText: page === 1 ? '查询失败，请稍后重试' : '',
        emptyText: page === 1 ? '查询失败，请稍后重试' : this.data.emptyText,
      });
      if (page > 1) wx.showToast({ title: '更多结果加载失败', icon: 'none' });
    }
  },

  loadMore() {
    if (!this.data.loadingMore && this.data.page < this.data.totalPages) this.fetchResults(this.data.word, this.data.page + 1);
  },

  onReachBottom() {
    this.loadMore();
  },

  switchLang(e) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({ activeLang: lang || 'buyi' });
  },

  playResultAtIndex(index) {
    const item = this.data.results[index];
    const audioUrl = item && (item.audio || item.audioUrl);
    if (!audioUrl || !this.audioContext) return;
    this.audioContext.stop();
    this.audioContext.src = audioUrl;
    this.audioContext.play();
    this.setData({ playingIndex: index });
    History.add(item, 'play');
  },

  async toggleFavorite(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.results.slice();
    const item = list[index];
    if (!item) {
      return;
    }

    const previous = !!item.fav;
    list[index] = { ...item, fav: !previous, isFavorited: !previous };
    this.setData({ results: list });

    try {
      const result = await Favorites.toggle(item);
      if (result && result.skipped) {
        list[index] = { ...item, fav: previous, isFavorited: previous };
        this.setData({ results: list });
        return;
      }
      list[index] = { ...item, fav: !!result.isFavorited, isFavorited: !!result.isFavorited };
      this.setData({ results: list });
    } catch (error) {
      list[index] = { ...item, fav: previous, isFavorited: previous };
      this.setData({ results: list });
      wx.showToast({ title: '收藏失败，请稍后重试', icon: 'none' });
    }
  },

  toRecord() {
    wx.navigateTo({ url: '/pages/record/index' });
  },

  // 由词入馆：跳转文化馆并携带展项 slug
  goToExhibit(e) {
    const slug = e.currentTarget.dataset.slug;
    if (!slug) return;
    wx.navigateTo({ url: `/pages/culture/index?slug=${encodeURIComponent(slug)}` });
  },

  // ============ AI 造句 / AI 关联推荐 ============

  // 校验登录态，返回 false 时已自动提示
  _checkLoginForAI() {
    const app = getApp();
    if (app && app.globalData && app.globalData.isLogin && app.globalData.token) {
      return true;
    }
    wx.showToast({ title: '登录后可以使用 AI 功能', icon: 'none' });
    return false;
  },

  // 更新单条结果的字段
  _patchResult(index, patch) {
    const list = this.data.results.slice();
    const current = list[index];
    if (!current) return;
    list[index] = { ...current, ...patch };
    this.setData({ results: list });
  },

  // 格式化 AI 造句返回内容：兼容 JSON / Markdown 代码围栏，统一为多行纯文本
  _formatAiSentence(content) {
    if (!content || typeof content !== 'string') return '';

    // 剥离 Markdown 代码围栏（```json ... ``` 或 ``` ... ```）
    let text = content.trim();
    const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (fence) text = fence[1].trim();

    // 尝试按 JSON 解析，提取例句 / 翻译 / 语法说明（兼容中英文键名变体）
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        const pick = (...keys) => {
          for (const k of keys) {
            const v = obj[k];
            if (typeof v === 'string' && v.trim()) return v.trim();
          }
          return '';
        };
        const sentence = pick('sentence', '例句');
        const translation = pick('translation', '翻译');
        const grammar = pick('grammar_note', 'grammarNote', 'grammar', '语法说明');
        const lines = [];
        if (sentence) lines.push(`例句：${sentence}`);
        if (translation) lines.push(`翻译：${translation}`);
        if (grammar) lines.push(`语法说明：${grammar}`);
        if (lines.length) return lines.join('\n');
      }
    } catch (e) {
      // 非 JSON 内容，回退原文
    }

    // 解析失败或无已知字段时，返回剥离围栏后的原文
    return text;
  },

  // AI 造句
  onAISentence(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.results[index];
    if (!item || item.aiSentenceLoading) return;
    if (!this._checkLoginForAI()) return;

    const word = item.ch || item.buyi || '';
    if (!word) {
      wx.showToast({ title: '当前词条没有可用词汇', icon: 'none' });
      return;
    }

    this._patchResult(index, {
      aiSentenceLoading: true,
      aiSentence: '',
      aiSentenceError: '',
    });

    let accumulated = '';
    generateStream('sentence', word, {
      onDelta: (chunk) => {
        accumulated += chunk;
        this._patchResult(index, { aiSentence: this._formatAiSentence(accumulated) });
      },
      onDone: () => {
        if (!accumulated) {
          this._patchResult(index, {
            aiSentenceLoading: false,
            aiSentenceError: 'AI 未返回内容，请稍后重试',
          });
          return;
        }
        this._patchResult(index, { aiSentenceLoading: false, aiSentence: this._formatAiSentence(accumulated) });
      },
      onError: (err) => {
        this._patchResult(index, {
          aiSentenceLoading: false,
          aiSentence: '',
          aiSentenceError: `AI 造句暂不可用：${err.message || '请稍后重试'}`,
        });
      },
    }).catch(() => {
      this._patchResult(index, { aiSentenceLoading: false });
    });
  },

  onClearAISentence(e) {
    const index = e.currentTarget.dataset.index;
    this._patchResult(index, { aiSentence: '', aiSentenceError: '' });
  },

  // AI 关联推荐
  onAIRelated(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.results[index];
    if (!item || item.aiRelatedLoading) return;
    if (!this._checkLoginForAI()) return;

    const word = item.ch || item.buyi || '';
    if (!word) {
      wx.showToast({ title: '当前词条没有可用词汇', icon: 'none' });
      return;
    }

    this._patchResult(index, {
      aiRelatedLoading: true,
      aiRelated: '',
      aiRelatedError: '',
    });

    let accumulated = '';
    generateStream('related', word, {
      onDelta: (chunk) => {
        accumulated += chunk;
        this._patchResult(index, { aiRelated: accumulated });
      },
      onDone: () => {
        if (!accumulated) {
          this._patchResult(index, {
            aiRelatedLoading: false,
            aiRelatedError: 'AI 未返回内容，请稍后重试',
          });
          return;
        }
        this._patchResult(index, { aiRelatedLoading: false, aiRelated: accumulated });
      },
      onError: (err) => {
        this._patchResult(index, {
          aiRelatedLoading: false,
          aiRelated: '',
          aiRelatedError: `AI 推荐暂不可用：${err.message || '请稍后重试'}`,
        });
      },
    }).catch(() => {
      this._patchResult(index, { aiRelatedLoading: false });
    });
  },

  onClearAIRelated(e) {
    const index = e.currentTarget.dataset.index;
    this._patchResult(index, { aiRelated: '', aiRelatedError: '' });
  },
});
