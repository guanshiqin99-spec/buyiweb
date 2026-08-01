Component({
  properties: {
    records: { type: Array, value: [] },
  },
  data: {
    cellMatrix: [],      // 7 行（周一到周日）× 12 列（周）格子矩阵
    monthLabels: [],     // 12 列月份标签
    weekLabels: ['一', '二', '三', '四', '五', '六', '日'],
    totalCount: 0,       // 近 12 周内记录总数
    hasRecords: false,
  },
  observers: {
    'records': function (records) {
      this.recalc(records);
    },
  },
  lifetimes: {
    attached() {
      this.recalc(this.data.records);
    },
  },
  methods: {
    // 依据 records 重算热力图格子
    recalc(records) {
      const list = Array.isArray(records) ? records : [];

      // 1. 按 createdAt 聚合为 {dateKey(YYYY-MM-DD): count}
      const countMap = {};
      let totalCount = 0;
      list.forEach(r => {
        if (!r || r.createdAt == null) return;
        const d = new Date(r.createdAt);
        if (isNaN(d.getTime())) return;
        const key = this.formatDateKey(d);
        countMap[key] = (countMap[key] || 0) + 1;
        totalCount += 1;
      });

      // 2. 起点对齐到本周周一，往前推 11 周，共 12 周（84 天）
      const weeks = 12;
      const days = 7;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayDow = today.getDay();        // 0=Sun..6=Sat
      const mondayOffset = (todayDow + 6) % 7; // 距本周一的天数
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - mondayOffset);
      const startDate = new Date(thisMonday);
      startDate.setDate(thisMonday.getDate() - (weeks - 1) * 7);

      // 3. 构建 7 行（周一到周日）× 12 列（周）矩阵
      const cellMatrix = [];
      for (let row = 0; row < days; row++) {
        const rowCells = [];
        for (let col = 0; col < weeks; col++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + col * 7 + row);
          const dateKey = this.formatDateKey(date);
          const count = countMap[dateKey] || 0;
          const isInFuture = date.getTime() > today.getTime();
          rowCells.push({
            dateKey,
            count,
            level: this.countToLevel(count),
            monthLabel: '',
            dayLabel: date.getDate(),
            isInFuture,
          });
        }
        cellMatrix.push(rowCells);
      }

      // 4. 月份标签：每列首格若月份变化则显示「M月」
      const monthLabels = [];
      let lastMonth = -1;
      for (let col = 0; col < weeks; col++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + col * 7);
        const m = date.getMonth() + 1;
        if (m !== lastMonth) {
          monthLabels.push(m + '月');
          lastMonth = m;
        } else {
          monthLabels.push('');
        }
      }
      // 同步月份标签到首行格子，便于 tooltip / 调试
      for (let col = 0; col < weeks; col++) {
        cellMatrix[0][col].monthLabel = monthLabels[col];
      }

      this.setData({
        cellMatrix,
        monthLabels,
        totalCount,
        hasRecords: list.length > 0,
      });
    },

    // 格式化为 YYYY-MM-DD
    formatDateKey(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },

    // count → level 分档
    countToLevel(count) {
      if (count <= 0) return 0;
      if (count === 1) return 1;
      if (count <= 3) return 2;
      if (count <= 6) return 3;
      return 4;
    },
  },
});
