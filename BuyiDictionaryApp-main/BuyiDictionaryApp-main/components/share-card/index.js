// 成就分享卡导出组件
// 使用 <canvas type="2d"> 离屏绘制 1200×1600 学习成就卡，
// 通过 wx.canvasToTempFilePath 导出临时图片，支持保存到相册与转发给好友。
// 绘制逻辑移植自 Web 端 ShareCard.vue 的 drawBatikPattern/drawWrappedText/roundedRectPath。

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 1600;
const SITE_NAME = '布依语词典小程序';

Component({
  data: {
    previewVisible: false,
    tempFilePath: '',
    shareImageUrl: '',
    isGenerating: false,
  },

  methods: {
    // 供页面调用：生成分享卡并展示预览
    // options = { title, stats, filename, nickname }
    share(options) {
      if (this.data.isGenerating) return Promise.resolve();
      this.setData({ isGenerating: true });
      return this.generate(options || {}).then((tempFilePath) => {
        this.setData({ previewVisible: true, isGenerating: false });
        return tempFilePath;
      }).catch((err) => {
        this.setData({ isGenerating: false });
        wx.showToast({ title: '分享卡生成失败', icon: 'none' });
        throw err;
      });
    },

    // 生成分享卡：获取 canvas 节点 → 绘制 → 导出临时图片路径
    generate(options) {
      return new Promise((resolve, reject) => {
        wx.createSelectorQuery()
          .in(this)
          .select('#shareCanvas')
          .node()
          .exec((res) => {
            if (!res || !res[0] || !res[0].node) {
              reject(new Error('画布节点未就绪'));
              return;
            }
            const canvas = res[0].node;
            canvas.width = CARD_WIDTH;
            canvas.height = CARD_HEIGHT;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('画布上下文创建失败'));
              return;
            }
            try {
              this.drawCard(ctx, options || {});
            } catch (err) {
              reject(err);
              return;
            }
            wx.canvasToTempFilePath({
              canvas: canvas,
              fileType: 'png',
              quality: 1,
              success: (r) => {
                this.setData({ tempFilePath: r.tempFilePath });
                resolve(r.tempFilePath);
              },
              fail: (err) => reject(err),
            });
          });
      });
    },

    // 绘制整张分享卡
    drawCard(ctx, options) {
      const W = CARD_WIDTH;
      const H = CARD_HEIGHT;
      const title = options.title || '我的布依语学习报告';
      const stats = this.normalizeStats(options.stats);
      const finalStats = stats.length ? stats : [
        { label: '今日学习', value: '0' },
        { label: '累计学习', value: '0' },
        { label: '连续打卡', value: '0' },
      ];
      const nickname = options.nickname || '';

      // a. 深蓝渐变背景（#0f1c2e 顶部 → #1e2c60 底部）
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, '#0f1c2e');
      gradient.addColorStop(1, '#1e2c60');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      // b. 蜡染纹样装饰：四角 8 瓣旋花（金色点缀）
      this.drawBatikPattern(ctx, 150, 160, 110, 0.22);
      this.drawBatikPattern(ctx, W - 150, 160, 110, 0.22);
      this.drawBatikPattern(ctx, 150, H - 250, 130, 0.18);
      this.drawBatikPattern(ctx, W - 150, H - 250, 130, 0.18);

      ctx.textAlign = 'left';

      // c. 副标题「学习成就」+ 主标题「布依语词典」
      ctx.fillStyle = 'rgba(201, 169, 110, 0.85)';
      ctx.font = '600 36px sans-serif';
      this.drawSpacedText(ctx, '学 习 成 就', 110, 230, 14);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 96px serif';
      this.drawWrappedText(ctx, '布依语词典', 110, 350, 980, 110, 1);

      // d. 用户昵称（如有）
      let nicknameBottom = 440;
      if (nickname) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.font = '500 40px sans-serif';
        nicknameBottom = this.drawWrappedText(ctx, nickname, 110, 470, 980, 56, 1);
      }

      // e. 3 项统计卡（圆角矩形 + 数值 + 标签）
      const reportTitleBottom = this.drawWrappedText(ctx, title, 110, nicknameBottom + 90, 980, 80, 2);
      const cardTop = Math.max(620, reportTitleBottom + 60);
      const cardCount = finalStats.length;
      const gap = 24;
      const cardWidth = (980 - (cardCount - 1) * gap) / cardCount;
      const cardHeight = 280;

      finalStats.forEach((stat, index) => {
        const left = 110 + index * (cardWidth + gap);

        // 卡片底：半透明白 + 描边
        ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.strokeStyle = 'rgba(201, 169, 110, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.roundedRectPath(ctx, left, cardTop, cardWidth, cardHeight, 28);
        ctx.fill();
        ctx.stroke();

        // 数值
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 72px serif';
        ctx.textAlign = 'center';
        ctx.fillText(stat.value, left + cardWidth / 2, cardTop + 130);

        // 标签
        ctx.fillStyle = 'rgba(201, 169, 110, 0.85)';
        ctx.font = '500 30px sans-serif';
        ctx.fillText(stat.label, left + cardWidth / 2, cardTop + 210);
      });
      ctx.textAlign = 'left';

      // f. 站点署名「布依语词典小程序」+ 日期
      ctx.strokeStyle = 'rgba(201, 169, 110, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(110, H - 190);
      ctx.lineTo(W - 110, H - 190);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 38px serif';
      ctx.fillText(SITE_NAME, 110, H - 110);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
      ctx.font = '400 28px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.formatDate(new Date()), W - 110, H - 110);
      ctx.textAlign = 'left';
    },

    // 蜡染 8 瓣旋花纹样（移植自 Web ShareCard.vue drawMotif）
    // cx/cy 圆心，radius 半径，alpha 描边透明度
    drawBatikPattern(ctx, cx, cy, radius, alpha) {
      ctx.save();
      ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
      ctx.lineWidth = 3;

      ctx.beginPath();
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8;
        const nextAngle = angle + Math.PI / 8;
        const innerX = cx + Math.cos(angle) * radius * 0.35;
        const innerY = cy + Math.sin(angle) * radius * 0.35;
        const outerX = cx + Math.cos(nextAngle) * radius;
        const outerY = cy + Math.sin(nextAngle) * radius;
        if (i === 0) ctx.moveTo(innerX, innerY);
        ctx.quadraticCurveTo(
          outerX, outerY,
          cx + Math.cos(angle + Math.PI / 4) * radius * 0.35,
          cy + Math.sin(angle + Math.PI / 4) * radius * 0.35
        );
      }
      ctx.closePath();
      ctx.stroke();

      // 中心小圆
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },

    // 文本换行（移植自 Web ShareCard.vue，适配小程序 Canvas 2D）
    // 返回最后一行基线 y + lineHeight
    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
      const limit = maxLines || 3;
      const characters = [...String(text || '')];
      const lines = [];
      let line = '';

      characters.forEach((character) => {
        const candidate = `${line}${character}`;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = character;
        } else {
          line = candidate;
        }
      });
      if (line) lines.push(line);

      const visibleLines = lines.slice(0, limit);
      if (lines.length > limit) {
        let lastLine = visibleLines[limit - 1];
        while (lastLine && ctx.measureText(`${lastLine}…`).width > maxWidth) {
          lastLine = lastLine.slice(0, -1);
        }
        visibleLines[limit - 1] = `${lastLine}…`;
      }

      visibleLines.forEach((currentLine, index) => {
        ctx.fillText(currentLine, x, y + index * lineHeight);
      });
      return y + visibleLines.length * lineHeight;
    },

    // 手动字间距绘制（小程序 Canvas 不支持 ctx.letterSpacing）
    drawSpacedText(ctx, text, x, y, spacing) {
      const chars = [...String(text || '')];
      let cur = x;
      chars.forEach((ch) => {
        ctx.fillText(ch, cur, y);
        cur += ctx.measureText(ch).width + spacing;
      });
    },

    // 圆角矩形路径（移植自 Web ShareCard.vue）
    roundedRectPath(ctx, x, y, width, height, radius) {
      const safeRadius = Math.min(radius, width / 2, height / 2);
      ctx.moveTo(x + safeRadius, y);
      ctx.lineTo(x + width - safeRadius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
      ctx.lineTo(x + width, y + height - safeRadius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
      ctx.lineTo(x + safeRadius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
      ctx.lineTo(x, y + safeRadius);
      ctx.quadraticCurveTo(x, y, x + safeRadius, y);
      ctx.closePath();
    },

    // 规范化统计数组：最多 3 项，每项 {label, value}
    normalizeStats(stats) {
      return (Array.isArray(stats) ? stats : []).slice(0, 3).map((stat) => {
        if (typeof stat === 'string') return { label: stat, value: '' };
        const value = stat && stat.value != null ? stat.value : 0;
        const unit = (stat && stat.unit) || '';
        return {
          label: String((stat && stat.label) || ''),
          value: `${value}${unit}`,
        };
      });
    },

    formatDate(date) {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      return `${y}年${m}月${d}日`;
    },

    // 保存到相册
    onSaveToAlbum() {
      const filePath = this.data.tempFilePath;
      if (!filePath) {
        wx.showToast({ title: '分享卡尚未生成', icon: 'none' });
        return;
      }
      wx.saveImageToPhotosAlbum({
        filePath: filePath,
        success: () => {
          wx.showToast({ title: '已保存到相册', icon: 'success' });
        },
        fail: (err) => {
          const msg = (err && err.errMsg) || '';
          // 授权拒绝（含 auth deny / scope）引导用户去设置开启权限
          if (msg.indexOf('auth') > -1 || msg.indexOf('deny') > -1 || msg.indexOf('scope') > -1) {
            wx.showModal({
              title: '提示',
              content: '请在设置中开启相册权限，以便保存分享卡到相册',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting();
                }
              },
            });
          } else {
            wx.showToast({ title: '保存失败', icon: 'none' });
          }
        },
      });
    },

    // 转发给好友：设置 shareImageUrl 并通过 triggerEvent 通知页面在 onShareAppMessage 使用
    onShareToFriend() {
      const filePath = this.data.tempFilePath;
      if (!filePath) {
        wx.showToast({ title: '分享卡尚未生成', icon: 'none' });
        return;
      }
      this.setData({ shareImageUrl: filePath });
      this.triggerEvent('share', { imageUrl: filePath });
    },

    // 关闭预览
    onPreviewClose() {
      this.setData({ previewVisible: false });
    },
  },
});
