/**
 * 获取当前北京时间毫秒时间戳
 * @returns {number} 毫秒时间戳
 */
exports.now = function () {
  return Date.now();
};

/**
 * 格式化时间戳为北京时间字符串
 * @param {number} timestamp - 毫秒时间戳
 * @returns {string} 格式化后的北京时间字符串
 */
exports.formatBeijing = function (timestamp) {
  const date = new Date(timestamp || Date.now());
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
  });
};
