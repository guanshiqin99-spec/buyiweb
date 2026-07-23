/**
 * AI 智能体流式调用封装
 *
 * 由于微信小程序云函数不支持 SSE 流式转发，这里采用「云函数累积完整响应 + 小程序端模拟打字」方案：
 * 1. 通过 app.requestApi 调用云函数 apiProxy，云函数内部累积 SSE 事件后返回完整文本
 * 2. 小程序端拿到完整文本后，按字符分块通过 setTimeout 模拟流式打字效果
 * 3. 调用方可通过 onDelta 实时接收分块，onDone/onError 接收结束事件
 *
 * 后端接口：
 * - POST /miniapp/agent/ask     问答（需登录）
 * - POST /miniapp/agent/generate 生成造句/五题/关联词（免登录，已登录则带身份）
 */

const TYPE_PATHS = {
  ask: '/miniapp/agent/ask',
  generate: '/miniapp/agent/generate',
};

/**
 * 把完整文本按标点/长度切成小块，用于模拟打字效果
 */
function splitToChunks(text, size = 12) {
  if (!text) return [];
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + size, text.length);
    if (end < text.length) {
      const punct = '，。；！？、,.!?; \n';
      let next = end;
      for (let j = end; j < Math.min(end + 8, text.length); j += 1) {
        if (punct.includes(text[j])) {
          next = j + 1;
          break;
        }
      }
      end = next;
    }
    chunks.push(text.slice(i, end));
    i = end;
  }
  return chunks;
}

/**
 * 调用 AI 问答或生成接口，云函数返回完整文本后模拟流式打字
 *
 * @param {Object} options
 * @param {string} options.endpoint - 'ask' | 'generate'
 * @param {Object} options.payload - 请求体
 * @param {Function} options.onDelta - (chunk: string) => void 每收到一块文本回调
 * @param {Function} [options.onDone] - () => void 完成回调
 * @param {Function} [options.onError] - (err: Error) => void 错误回调
 * @param {number} [options.chunkSize=12] - 模拟打字每块字符数
 * @param {number} [options.chunkDelay=30] - 每块间隔毫秒
 * @returns {Promise<void>}
 */
function callAgentStream({
  endpoint,
  payload,
  onDelta,
  onDone,
  onError,
  chunkSize = 12,
  chunkDelay = 30,
}) {
  const path = TYPE_PATHS[endpoint];
  if (!path) {
    const err = new Error('未知的 AI 接口');
    if (onError) onError(err);
    return Promise.reject(err);
  }

  const app = getApp();
  const token = (app && typeof app.getToken === 'function') ? app.getToken() : '';

  // generate 端点免登录：有 token 则带上身份，无 token 也可调用；ask 端点仍由后端强制鉴权
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return app
    .requestApi({
      path,
      method: 'POST',
      data: payload,
      header: headers,
      timeout: 60000,
    })
    .then((res) => {
      const statusCode = res && res.statusCode;
      const data = (res && res.data) || {};

      if (statusCode >= 200 && statusCode < 300) {
        // 云函数返回的统一结构：{ type: 'done', content: '...' } 或 { type: 'error', message: '...' }
        if (data.type === 'error') {
          const err = new Error(data.message || '智能体响应失败');
          if (onError) onError(err);
          return;
        }
        const fullContent = typeof data.content === 'string' ? data.content : '';
        if (!fullContent) {
          if (onDone) onDone();
          return;
        }
        // 模拟流式打字
        const chunks = splitToChunks(fullContent, chunkSize);
        let i = 0;
        const step = () => {
          if (i >= chunks.length) {
            if (onDone) onDone();
            return;
          }
          const chunk = chunks[i];
          i += 1;
          if (onDelta) onDelta(chunk);
          setTimeout(step, chunkDelay);
        };
        step();
        return;
      }

      // 非 2xx
      let msg = '智能体响应失败';
      if (data && data.message) {
        msg = Array.isArray(data.message) ? data.message.join('；') : String(data.message);
      } else if (typeof data === 'string') {
        msg = data;
      }
      const err = new Error(msg);
      if (onError) onError(err);
    })
    .catch((err) => {
      const message = (err && err.errMsg) ? '网络连接失败，请确认后端服务已启动' : (err && err.message) || 'AI 调用失败';
      if (onError) onError(new Error(message));
    });
}

/**
 * AI 问答（导览员）
 * @param {string} question
 * @param {Array<{role:string, content:string}>} history
 * @param {Object} callbacks { onDelta, onDone, onError }
 */
function askStream(question, history = [], callbacks = {}) {
  return callAgentStream({
    endpoint: 'ask',
    payload: { question, history },
    ...callbacks,
  });
}

/**
 * AI 内容生成
 * @param {'sentence'|'quiz'|'related'} type
 * @param {string} word
 * @param {Object} callbacks { onDelta, onDone, onError }
 */
function generateStream(type, word = '', callbacks = {}) {
  return callAgentStream({
    endpoint: 'generate',
    payload: { type, word },
    ...callbacks,
  });
}

module.exports = {
  askStream,
  generateStream,
  splitToChunks,
};
