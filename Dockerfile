FROM node:24-bookworm-slim AS client

WORKDIR /src

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./

ARG VITE_API_URL=http://localhost:5601
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates nginx openssl \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f /etc/nginx/sites-enabled/default

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci && npm cache clean --force

COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/prisma7.config.ts ./

RUN DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/master_app" npx prisma generate

COPY --from=client /src/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/master-app.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
  && chmod +x /usr/local/bin/docker-entrypoint.sh \
  && nginx -t

ENV PORT=5601
EXPOSE 5600 5601

ENTRYPOINT ["docker-entrypoint.sh"]
