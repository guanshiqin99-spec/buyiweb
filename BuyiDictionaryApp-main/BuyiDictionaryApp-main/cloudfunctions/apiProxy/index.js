// API 代理云函数
// 将小程序的请求转发到后端接口，绕开小程序白名单和备案限制
// 对 /miniapp/agent/* 路径做 SSE 流式特殊处理：累积完整响应后一次性返回，
// 由小程序端模拟打字效果展示，保证稳定性和架构一致性。
const http = require('http');
const https = require('https');
const url = require('url');

// 后端基础地址，直连服务器 IP
// 注意：云函数运行在微信服务器，可以访问 HTTP IP，不受小程序白名单限制
const BACKEND_BASE = 'http://39.96.81.132:80/api';
// 普通请求超时时间（毫秒）
const REQUEST_TIMEOUT = 15000;
// AI 流式接口超时时间（毫秒），DeepSeek 生成 5 题可能需要较长时间
const STREAM_TIMEOUT = 60000;

// SSE 流式接口路径前缀，命中时走流式累积逻辑
const STREAM_PATH_PREFIX = '/miniapp/agent/';

function buildTargetUrl(path) {
  const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
  return `${BACKEND_BASE}${normalizedPath}`;
}

function isStreamPath(path) {
  const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
  return normalizedPath.indexOf(STREAM_PATH_PREFIX) === 0;
}

function request(targetUrl, method, data, headers) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    const isGet = String(method).toUpperCase() === 'GET';
    const isHttps = parsed.protocol === 'https:';
    let body = '';

    if (data && !isGet) {
      body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.path,
      method: String(method || 'GET').toUpperCase(),
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        ...headers,
      },
      timeout: REQUEST_TIMEOUT,
    };

    if (body) {
      options.headers['content-length'] = Buffer.byteLength(body);
    }

    const requestModule = isHttps ? https : http;
    const req = requestModule.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const rawText = buffer.toString('utf8');
        let parsedData;
        try {
          parsedData = rawText ? JSON.parse(rawText) : '';
        } catch (e) {
          parsedData = rawText;
        }
        resolve({
          statusCode: res.statusCode || 200,
          data: parsedData,
          headers: res.headers,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('请求后端超时'));
    });
    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// 流式请求：累积 SSE 事件，解析后返回完整结果
// 后端 SSE 事件格式：data: {"type":"delta","content":"..."}\n\n
// 解析完成后返回统一结构：{ type: 'done'|'error', content: '完整文本', message: '错误信息' }
function requestStream(targetUrl, method, data, headers) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    const isHttps = parsed.protocol === 'https:';
    const body = typeof data === 'string' ? data : JSON.stringify(data || {});

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.path,
      method: String(method || 'POST').toUpperCase(),
      headers: {
        'content-type': 'application/json',
        'accept': 'text/event-stream',
        ...headers,
      },
      timeout: STREAM_TIMEOUT,
    };

    if (body) {
      options.headers['content-length'] = Buffer.byteLength(body);
    }

    const requestModule = isHttps ? https : http;
    const req = requestModule.request(options, (res) => {
      let fullContent = '';
      let errorMessage = '';
      let buffer = '';
      let receivedDone = false;

      res.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        // 按双换行符切分 SSE 事件块
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const lines = part.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload) continue;
            try {
              const evt = JSON.parse(payload);
              if (evt.type === 'delta' && typeof evt.content === 'string') {
                fullContent += evt.content;
              } else if (evt.type === 'done') {
                receivedDone = true;
              } else if (evt.type === 'error') {
                errorMessage = evt.message || '智能体响应失败';
              }
            } catch (e) {
              // 忽略无法解析的分片
            }
          }
        }
      });

      res.on('end', () => {
        // 处理 buffer 中剩余的最后一个事件块
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith('data:')) {
            const payload = trimmed.slice(5).trim();
            try {
              const evt = JSON.parse(payload);
              if (evt.type === 'delta' && typeof evt.content === 'string') {
                fullContent += evt.content;
              } else if (evt.type === 'done') {
                receivedDone = true;
              } else if (evt.type === 'error') {
                errorMessage = evt.message || '智能体响应失败';
              }
            } catch (e) {}
          }
        }

        if (errorMessage) {
          resolve({
            statusCode: 200,
            data: { type: 'error', message: errorMessage },
            headers: res.headers,
          });
          return;
        }

        resolve({
          statusCode: res.statusCode || 200,
          data: {
            type: 'done',
            content: fullContent,
            receivedDone,
          },
          headers: res.headers,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('AI 响应超时，请稍后重试'));
    });
    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

exports.main = async (event, context) => {
  const {
    path,
    method = 'GET',
    data,
    headers = {},
  } = event || {};

  if (!path) {
    return {
      statusCode: 400,
      data: { message: '缺少 path 参数' },
    };
  }

  const targetUrl = buildTargetUrl(path);

  try {
    // AI 智能体接口走流式累积逻辑
    if (isStreamPath(path)) {
      const res = await requestStream(targetUrl, method, data, headers);
      return {
        statusCode: res.statusCode,
        data: res.data,
        headers: res.headers,
      };
    }

    const res = await request(targetUrl, method, data, headers);
    return {
      statusCode: res.statusCode,
      data: res.data,
      headers: res.headers,
    };
  } catch (err) {
    console.error('[apiProxy] 请求失败:', targetUrl, err.message);
    return {
      statusCode: 500,
      data: {
        message: `云函数代理请求失败: ${err.message || '未知错误'}`,
      },
    };
  }
};
