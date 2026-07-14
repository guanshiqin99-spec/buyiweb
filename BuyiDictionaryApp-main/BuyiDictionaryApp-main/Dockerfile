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

EXPOSE 3000

CMD ["node", "dist/main"]