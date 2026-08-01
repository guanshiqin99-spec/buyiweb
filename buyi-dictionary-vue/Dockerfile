FROM node:20-alpine AS build

WORKDIR /app/web

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM nginx:alpine AS runtime

COPY --from=build /app/web/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# 安全：非 root 用户运行 + 健康检查（nginx:alpine 自带 wget）
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d
USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]