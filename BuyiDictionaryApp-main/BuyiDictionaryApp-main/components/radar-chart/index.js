// 雷达图组件：5 维度学习侧重可视化（词汇/短语/谚语/民歌/答题）
// 纯 WXML/WXSS 渲染：view + 绝对定位 + clip-path: polygon 描绘数据面，
// 同心五边形网格与轴线由线段 view 旋转拼接，兼容浅色/深色模式。
Component({
  properties: {
    // {dictionary, phrase, proverb, song, quiz}：各维度今日计数
    data: { type: Object, value: {} },
    title: { type: String, value: '学习侧重' },
  },
  data: {
    // 5 个固定维度（顺序决定顶点位置：第 0 个在正上方，顺时针 5 等分）
    dimensions: [
      { key: 'dictionary', label: '词汇' },
      { key: 'phrase', label: '短语' },
      { key: 'proverb', label: '谚语' },
      { key: 'song', label: '民歌' },
      { key: 'quiz', label: '答题' },
    ],
    // 各维度每日投入基准（达成 100% 即满格），与 Web 端 RadarChart.vue 一致
    targets: { dictionary: 20, phrase: 5, proverb: 5, song: 3, quiz: 2 },
    centerX: 150,
    centerY: 120,
    radius: 90,
    canvasWidth: 300,
    canvasHeight: 250,
    hasData: false,
    values: [0, 0, 0, 0, 0],
    gridLines: [],     // 5 层 × 5 边 = 25 条网格线段
    axisLines: [],     // 5 条轴线
    dataFaceClip: '',  // 数据面 clip-path polygon（百分比坐标）
    dataEdges: [],     // 数据面 5 条边线（等效 1px solid 品牌色描边）
    dataPoints: [],    // 数据面 5 个顶点圆点
    labels: [],        // 5 个顶点标签
  },
  observers: {
    'data': function (data) {
      this.recalc(data);
    },
  },
  lifetimes: {
    attached() {
      this.recalc(this.data.data);
    },
  },
  methods: {
    recalc(rawData) {
      const dims = this.data.dimensions;
      const targets = this.data.targets;
      const cx = this.data.centerX;
      const cy = this.data.centerY;
      const R = this.data.radius;
      const cw = this.data.canvasWidth;
      const ch = this.data.canvasHeight;
      const labelRatio = 1.12;

      const obj = rawData && typeof rawData === 'object' ? rawData : {};
      // 达成度 = 今日计数 / 基准，封顶 100%
      const values = dims.map(d => {
        const count = Number(obj[d.key]) || 0;
        const target = targets[d.key] || 1;
        return count > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;
      });
      const maxValue = Math.max(0, ...values);
      const hasData = maxValue > 0;

      // 顶点坐标：第一个在正上方（-π/2），顺时针 5 等分
      const makePoint = (index, ratio) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / dims.length;
        return {
          x: cx + Math.cos(angle) * R * ratio,
          y: cy + Math.sin(angle) * R * ratio,
        };
      };

      // 线段描述：起点、长度、旋转角度（配合 transform-origin: 0 50%）
      const lineSeg = (p1, p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const deg = Math.atan2(dy, dx) * 180 / Math.PI;
        return { left: p1.x, top: p1.y, width: len, angle: deg };
      };

      // 5 层同心五边形网格（ratio 0.2/0.4/0.6/0.8/1.0），每层 5 条边
      const gridRatios = [0.2, 0.4, 0.6, 0.8, 1.0];
      const gridLines = [];
      gridRatios.forEach(r => {
        for (let i = 0; i < dims.length; i++) {
          const p1 = makePoint(i, r);
          const p2 = makePoint((i + 1) % dims.length, r);
          gridLines.push(lineSeg(p1, p2));
        }
      });

      // 5 条轴线：中心到外层顶点
      const axisLines = dims.map((_, i) =>
        lineSeg({ x: cx, y: cy }, makePoint(i, 1))
      );

      // 数据面：按各维度达成度比例（values[i]/100）计算顶点
      let dataFaceClip = '';
      let dataEdges = [];
      let dataPoints = [];
      if (hasData) {
        const dataVertices = dims.map((_, i) => {
          const ratio = values[i] / 100; // 100% 即满格
          return makePoint(i, ratio);
        });
        // clip-path 使用百分比坐标（相对画布尺寸）
        dataFaceClip = 'polygon(' + dataVertices
          .map(p => `${(p.x / cw * 100).toFixed(2)}% ${(p.y / ch * 100).toFixed(2)}%`)
          .join(', ') + ')';
        // 数据面边线：1px solid 品牌色等效描边（clip-path 不会描边框，故用线段拼接）
        dataEdges = dims.map((_, i) =>
          lineSeg(dataVertices[i], dataVertices[(i + 1) % dims.length])
        );
        // 数据顶点圆点
        dataPoints = dataVertices.map(p => ({ left: p.x, top: p.y }));
      }

      // 5 个顶点标签：「词汇 X%」等，绝对定位 + 三向对齐
      const labels = dims.map((d, i) => {
        const lp = makePoint(i, labelRatio);
        let align = 'center';
        if (lp.x < cx - 10) align = 'right';     // 左侧顶点：右对齐
        else if (lp.x > cx + 10) align = 'left'; // 右侧顶点：左对齐
        return { text: `${d.label} ${values[i]}%`, left: lp.x, top: lp.y, align };
      });

      this.setData({
        hasData, values, gridLines, axisLines,
        dataFaceClip, dataEdges, dataPoints, labels,
      });
    },
  },
});
