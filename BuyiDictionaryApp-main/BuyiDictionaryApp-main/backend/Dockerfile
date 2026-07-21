FROM node:20-alpine AS build

WORKDIR /app/backend

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build


FROM node:20-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app/backend

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/src ./src
COPY --from=build /app/backend/docs ./docs
COPY --from=build /app/backend/tsconfig*.json ./
COPY --from=build /app/backend/nest-cli.json ./

RUN mkdir -p /app/backend/uploads && \
    chown -R nodejs:nodejs /app/backend

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/main"]
