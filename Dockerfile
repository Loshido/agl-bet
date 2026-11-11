FROM --platform=$BUILDPLATFORM oven/bun:alpine AS builder
WORKDIR /build
COPY . .

RUN bun i
RUN bun run build

FROM --platform=linux/amd64 oven/bun:alpine AS production
WORKDIR /app

COPY --from=builder /build/server server
COPY --from=builder /build/dist dist
COPY ./db/init/tables.sql /init.sql

EXPOSE 80
ENTRYPOINT [ "bun", "server/entry.bun.js" ]
ENV INIT_FILE_PATH="/init.sql"
LABEL org.opencontainers.image.source=https://github.com/Loshido/agl-bet
