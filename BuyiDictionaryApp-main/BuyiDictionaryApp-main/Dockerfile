FROM node:20-alpine AS build

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build


FROM node:20-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/src ./src
COPY --from=build /app/backend/docs ./docs
COPY --from=build /app/backend/tsconfig*.json ./
COPY --from=build /app/backend/nest-cli.json ./
COPY admin-web /app/admin-web

# 安全：非 root 用户运行，降低容器逃逸风险
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/backend/uploads && \
    chown -R nodejs:nodejs /app/backend /app/admin-web
USER nodejs

EXPOSE 3000

# 安全：node:20-alpine 无 curl，用内置 fetch 做健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main"]