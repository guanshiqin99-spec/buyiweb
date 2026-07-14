'use strict';

/**
 * 布依词典 CloudRun 代理服务
 * 将 wx.cloud.callContainer 的请求转发到阿里云后端 (HTTP)
 * 规避小程序端 HTTPS 域名白名单限制
 */

const http = require('http');
const { URL } = require('url');

const TARGET_HOST = '47.114.114.135';
const TARGET_PORT = 80;
const SERVER_PORT = Number(process.env.PORT) || 3000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id, X-WX-SERVICE',
};

function forwardRequest(req, res, bodyBuffer) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const targetPath = parsedUrl.pathname + parsedUrl.search;
  const method = req.method.toUpperCase();
  const authorization = req.headers['authorization'] || '';

  const reqHeaders = {
    'content-type': 'application/json',
    'accept': 'application/json',
  };
  if (authorization) {
    reqHeaders['authorization'] = authorization;
  }
  if (bodyBuffer && bodyBuffer.length > 0) {
    reqHeaders['content-length'] = bodyBuffer.length.toString();
  }

  const proxyReq = http.request(
    { host: TARGET_HOST, port: TARGET_PORT, path: targetPath, method, headers: reqHeaders },
    (proxyRes) => {
      const chunks = [];
      proxyRes.on('data', (chunk) => chunks.push(chunk));
      proxyRes.on('end', () => {
        const body = Buffer.concat(chunks);
        res.writeHead(proxyRes.statusCode, {
          ...CORS_HEADERS,
          'content-type': proxyRes.headers['content-type'] || 'application/json; charset=utf-8',
        });
        res.end(body);
      });
      proxyRes.on('error', (err) => sendError(res, 502, err.message));
    },
  );

  proxyReq.setTimeout(15000, () => proxyReq.destroy(new Error('上游请求超时')));
  proxyReq.on('error', (err) => sendError(res, 502, err.message));

  if (bodyBuffer && bodyBuffer.length > 0) {
    proxyReq.write(bodyBuffer);
  }
  proxyReq.end();
}

function sendError(res, statusCode, message) {
  if (res.writableEnded) return;
  res.writeHead(statusCode, { ...CORS_HEADERS, 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ message }));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const bodyBuffer = chunks.length > 0 ? Buffer.concat(chunks) : null;
    forwardRequest(req, res, bodyBuffer);
  });
  req.on('error', (err) => sendError(res, 500, err.message));
});

server.listen(SERVER_PORT, '0.0.0.0', () => {
  console.log(`[buyidict-api proxy] Listening on :${SERVER_PORT} → ${TARGET_HOST}:${TARGET_PORT}`);
});

server.on('error', (err) => {
  console.error('[buyidict-api proxy] Server error:', err);
  process.exit(1);
});
