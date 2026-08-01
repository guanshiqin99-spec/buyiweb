Component({
  properties: {
    data: { type: Array, value: [] },
    title: { type: String, value: '学习类型分布' },
  },
  data: {
    maxValue: 0,
    totalCount: 0,
    hasData: false,
    yAxisLabels: [],
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
    // 依据传入数据重算最大值、总数与 Y 轴刻度
    recalc(data) {
      const list = Array.isArray(data) ? data : [];
      const maxValue = list.length ? Math.max(...list.map(i => Number(i.count) || 0)) : 0;
      const totalCount = list.reduce((s, i) => s + (Number(i.count) || 0), 0);
      const hasData = list.length > 0 && maxValue > 0;
      const yAxisLabels = [1, 2, 3, 4, 5].map(i => Math.round(maxValue * (5 - i + 1) / 5));
      this.setData({ maxValue, totalCount, hasData, yAxisLabels });
    },
  },
});
