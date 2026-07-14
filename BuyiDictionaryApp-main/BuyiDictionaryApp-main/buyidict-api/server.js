'use strict';

/**
 * 布依词典 CloudRun 代理服务
 * 将 wx.cloud.callContainer 的请求转发到上游后端 (HTTPS)
 * 规避小程序端 HTTPS 域名白名单限制
 */

// 安全实践：CORS 白名单 + HTTPS 上游 + 目标地址从环境变量读取
const http = require('http');
const https = require('https');
const { URL } = require('url');

const UPSTREAM_HOST = process.env.UPSTREAM_HOST;
const UPSTREAM_PORT = Number(process.env.UPSTREAM_PORT) || 443;
const SERVER_PORT = Number(process.env.PORT) || 3000;

// CORS 白名单：逗号分隔的 origin 列表，未设置则拒绝所有跨域请求
const CORS_ORIGIN = process.env.CORS_ORIGIN || '';
const CORS_WHITELIST = CORS_ORIGIN
  .split(',')
  .map(s => s.trim())
  .filter(s => s.length > 0);

if (!UPSTREAM_HOST) {
  console.error('[buyidict-api proxy] 缺少必需的环境变量: UPSTREAM_HOST');
  console.error('请通过环境变量提供上游主机名，切勿硬编码于源码。');
  process.exit(1);
}

/**
 * 根据请求 Origin 判断是否允许跨域，返回需要回写的 Allow-Origin 值。
 * 未匹配白名单时返回空字符串（不回写该头，浏览器将拒绝跨域读取）。
 */
function resolveAllowOrigin(req) {
  const origin = req.headers['origin'] || '';
  if (!origin) return '';
  if (CORS_WHITELIST.length === 0) return '';
  return CORS_WHITELIST.includes(origin) ? origin : '';
}

function buildCorsHeaders(allowOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id, X-WX-SERVICE',
  };
  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}

function forwardRequest(req, res, bodyBuffer) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const targetPath = parsedUrl.pathname + parsedUrl.search;
  const method = req.method.toUpperCase();
  const authorization = req.headers['authorization'] || '';
  const allowOrigin = resolveAllowOrigin(req);

  const reqHeaders = {
    'content-type': 'application/json',
    'accept': 'application/json',
    'host': UPSTREAM_HOST,
  };
  if (authorization) {
    reqHeaders['authorization'] = authorization;
  }
  if (bodyBuffer && bodyBuffer.length > 0) {
    reqHeaders['content-length'] = bodyBuffer.length.toString();
  }

  const proxyReq = https.request(
    { host: UPSTREAM_HOST, port: UPSTREAM_PORT, path: targetPath, method, headers: reqHeaders },
    (proxyRes) => {
      const chunks = [];
      proxyRes.on('data', (chunk) => chunks.push(chunk));
      proxyRes.on('end', () => {
        const body = Buffer.concat(chunks);
        res.writeHead(proxyRes.statusCode, {
          ...buildCorsHeaders(allowOrigin),
          'content-type': proxyRes.headers['content-type'] || 'application/json; charset=utf-8',
        });
        res.end(body);
      });
      proxyRes.on('error', (err) => sendError(res, allowOrigin, 502, err.message));
    },
  );

  proxyReq.setTimeout(15000, () => proxyReq.destroy(new Error('上游请求超时')));
  proxyReq.on('error', (err) => sendError(res, allowOrigin, 502, err.message));

  if (bodyBuffer && bodyBuffer.length > 0) {
    proxyReq.write(bodyBuffer);
  }
  proxyReq.end();
}

function sendError(res, allowOrigin, statusCode, message) {
  if (res.writableEnded) return;
  res.writeHead(statusCode, { ...buildCorsHeaders(allowOrigin), 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ message }));
}

const server = http.createServer((req, res) => {
  const allowOrigin = resolveAllowOrigin(req);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, buildCorsHeaders(allowOrigin));
    res.end();
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const bodyBuffer = chunks.length > 0 ? Buffer.concat(chunks) : null;
    forwardRequest(req, res, bodyBuffer);
  });
  req.on('error', (err) => sendError(res, allowOrigin, 500, err.message));
});

server.listen(SERVER_PORT, '0.0.0.0', () => {
  console.log(`[buyidict-api proxy] Proxy server started on port ${SERVER_PORT}`);
});

server.on('error', (err) => {
  console.error('[buyidict-api proxy] Server error:', err);
  process.exit(1);
});
