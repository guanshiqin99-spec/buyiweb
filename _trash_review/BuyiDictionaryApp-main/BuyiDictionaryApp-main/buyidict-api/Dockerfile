FROM node:20-alpine

WORKDIR /app

# 仅复制代理服务入口，无需任何 npm 依赖（使用 Node.js 内置 http 模块）
COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
