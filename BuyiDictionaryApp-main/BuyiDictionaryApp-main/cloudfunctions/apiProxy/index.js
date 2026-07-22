// API 代理云函数
// 将小程序的请求转发到后端接口,绕开小程序白名单和备案限制
const http = require('http');
const https = require('https');
const url = require('url');

// 后端基础地址,直连服务器 IP
// 注意:云函数运行在微信服务器,可以访问 HTTP IP,不受小程序白名单限制
const BACKEND_BASE = 'http://39.96.81.132:80/api';
// 请求超时时间(毫秒)
const REQUEST_TIMEOUT = 15000;

function buildTargetUrl(path) {
  const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
  return `${BACKEND_BASE}${normalizedPath}`;
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
