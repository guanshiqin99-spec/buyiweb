const { buyiTones } = require('../../utils/tones');
const { cultureExhibitsApi } = require('../../utils/api');
const { syncAppearance } = require('../../utils/view');

// 三张纹样卡数据，照搬 Web 端 Culture.vue 的静态内容
const patterns = [
  {
    id: 'batik',
    title: '蜡染纹样',
    label: '蓝白之间',
    image: '/pages/culture/images/batik.jpg',
    imageAlt: '布依族蜡染织物纹样',
    summary: '以蓝、青、白为主的视觉记忆，连接服饰中的纺织、印染、挑花、刺绣、蜡染与织锦。',
    detail: '本展项以现有蜡染图片和纹样示意帮助观察线条与留白。关于工艺与服饰的说明采用官方非遗资料的概述，不延伸未经核验的具体象征解释。',
    sourceTitle: '中国非遗网 · 布依族服饰',
    sourceUrl: 'https://www.ihchina.cn/project_details/15328.html'
  },
  {
    id: 'weaving',
    title: '斗纹布',
    label: '织进祝福',
    image: '/pages/culture/images/nature.jpg',
    imageAlt: '布依族织物与自然环境',
    summary: '斗纹布的图案灵感来自盛装粮食的“斗”，关联丰收、勤劳、团结、平安与幸福的祝愿。',
    detail: '资料记载，斗纹布以青色棉线为经、彩色丝线为纬，在织机上形成具有立体触感的方形纹样。此处以图片、纹样示意和出处共同呈现，方便继续追读。',
    sourceTitle: '中国非遗网 · 布依斗纹布：绣艺里的传承创新',
    sourceUrl: 'https://www.ihchina.cn/news_1_details/25730.html'
  },
  {
    id: 'drum',
    title: '铜鼓十二调',
    label: '礼乐回声',
    image: '/pages/culture/images/craft.jpg',
    imageAlt: '布依族传统工艺与铜鼓文化意象',
    summary: '布依铜鼓是以青铜铸造的古老打击乐器；十二调与庆典、祭祖、祭祀等仪式相连。',
    detail: '铜鼓十二调已列入国家级非物质文化遗产代表性项目名录。展项只呈现来源中明确记载的音乐、地域和仪式信息，并把纹样作为视觉导览，而非文物复刻。',
    sourceTitle: '中国非遗网 · 铜鼓十二调',
    sourceUrl: 'https://www.ihchina.cn/project_details/12584/'
  }
];

Page({
  data: {
    tones: buyiTones,
    patterns,
    selectedToneIndex: 0,
    selectedPattern: null,
    linkedExhibit: null,
    linkedExhibitError: '',
    playingTone: -1,
    currentTheme: 'light',
    fontSizeClass: 'medium',
  },

  onLoad(options) {
    this._pendingSlug = '';
    if (options && options.slug) {
      this._pendingSlug = options.slug;
    }
  },

  onShow() {
    syncAppearance(this);
    if (this._pendingSlug) {
      const slug = this._pendingSlug;
      this._pendingSlug = '';
      this.loadLinkedExhibit(slug);
    }
  },

  onReady() {
    this.drawToneChart();
  },

  onUnload() {
    this.destroyAudio();
  },

  onHide() {
    this.destroyAudio();
  },

  // 纹样详情弹窗
  openPattern(e) {
    const pattern = e.currentTarget.dataset.pattern;
    if (!pattern) return;
    this.setData({ selectedPattern: pattern });
  },

  closePattern() {
    this.setData({ selectedPattern: null });
  },

  // 阻止弹窗内触摸冒泡与滚动穿透
  noop() {},

  // 复制出处链接，提示去浏览器打开
  copySourceUrl(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: '链接已复制，可到浏览器打开', icon: 'none' });
      },
    });
  },

  // 关联展项带关联民歌时跳转民歌 tab
  goToFeaturedSong() {
    const exhibit = this.data.linkedExhibit;
    if (!exhibit || !exhibit.featuredSongId) return;
    wx.switchTab({ url: '/pages/song/index' });
  },

  // 选中某个声调并试听调值轮廓
  selectTone(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (Number.isNaN(index) || !this.data.tones[index]) return;
    this.setData({ selectedToneIndex: index });
    this.playTone(index);
    this.drawToneChart();
  },

  playTone(index) {
    const tone = this.data.tones[index];
    if (!tone) return;
    this.initAudio();
    // 再次点击同一调且正在播放，则停止
    if (this.data.playingTone === index) {
      try { this._audioCtx.stop(); } catch (err) {}
      this.setData({ playingTone: -1 });
      return;
    }
    try { this._audioCtx.stop(); } catch (err) {}
    this._audioCtx.src = `/pages/culture/audio/tone-${tone.value}.mp3`;
    this._audioCtx.play();
    this.setData({ playingTone: index });
  },

  initAudio() {
    if (this._audioCtx) return;
    this._audioCtx = wx.createInnerAudioContext();
    this._audioCtx.obeyMuteSwitch = false;
    this._audioCtx.onEnded(() => this.setData({ playingTone: -1 }));
    this._audioCtx.onError(() => {
      this.setData({ playingTone: -1 });
      wx.showToast({ title: '音频播放失败', icon: 'none' });
    });
  },

  destroyAudio() {
    if (this._audioCtx) {
      try { this._audioCtx.stop(); } catch (err) {}
      try { this._audioCtx.destroy(); } catch (err) {}
      this._audioCtx = null;
      this.setData({ playingTone: -1 });
    }
  },

  // 通过词详情带 slug 跳入时，拉取关联展项
  async loadLinkedExhibit(slug) {
    if (!slug) {
      this.setData({ linkedExhibit: null, linkedExhibitError: '' });
      return;
    }
    this.setData({ linkedExhibitError: '' });
    try {
      const exhibit = await cultureExhibitsApi.detail(slug);
      const next = { linkedExhibit: exhibit };
      if (exhibit && Number.isInteger(exhibit.toneIndex) && this.data.tones[exhibit.toneIndex]) {
        next.selectedToneIndex = exhibit.toneIndex;
      }
      this.setData(next, () => this.drawToneChart());
    } catch (err) {
      this.setData({
        linkedExhibit: null,
        linkedExhibitError: '关联展项暂时无法载入，但你仍可继续浏览下方已核验的文化资料。',
      });
    }
  },

  // 用 canvas 2d 绘制六调调值轮廓曲线，逻辑照 ToneChart.vue
  drawToneChart() {
    const query = wx.createSelectorQuery();
    query.select('#toneChart').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : (wx.getSystemInfoSync().pixelRatio || 1);
      const cssWidth = res[0].width;
      const cssHeight = res[0].height;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      ctx.scale(dpr, dpr);

      const width = cssWidth;
      const height = cssHeight;
      const tones = this.data.tones;
      const selectedIndex = this.data.selectedToneIndex;
      const padding = { top: 24, right: 28, bottom: 36, left: 28 };
      const innerWidth = width - padding.left - padding.right;
      const innerHeight = height - padding.top - padding.bottom;

      ctx.clearRect(0, 0, width, height);
      // 网格
      ctx.strokeStyle = 'rgba(22, 100, 217, 0.10)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i += 1) {
        const y = padding.top + (innerHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      // 调值数字取平均高度作为 y 坐标
      const toneHeight = (value) => {
        const digits = String(value).split('').map(Number);
        return digits.reduce((total, digit) => total + digit, 0) / digits.length;
      };
      const points = tones.map((tone, index) => {
        const x = padding.left + (innerWidth / Math.max(1, tones.length - 1)) * index;
        const y = padding.top + innerHeight * (1 - (toneHeight(tone.value) - 1) / 4);
        return { x, y, tone };
      });

      // 连线
      ctx.strokeStyle = '#1664D9';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index) ctx.lineTo(point.x, point.y);
        else ctx.moveTo(point.x, point.y);
      });
      ctx.stroke();

      // 节点与名称
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      points.forEach((point, index) => {
        const selected = index === selectedIndex;
        ctx.fillStyle = selected ? '#D4883A' : '#1664D9';
        ctx.beginPath();
        ctx.arc(point.x, point.y, selected ? 8 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(23, 59, 108, 0.7)';
        ctx.fillText(point.tone.name, point.x, height - 13);
      });
    });
  },
});
