FROM oven/bun:canary AS builder
WORKDIR /build
COPY . .

RUN bun i
RUN bun run build

FROM oven/bun:alpine AS production
WORKDIR /app

COPY --from=builder /build/server server
COPY --from=builder /build/dist dist

EXPOSE 80
ENTRYPOINT [ "bun", "server/entry.bun.js" ]

LABEL org.opencontainers.image.source=https://github.com/Loshido/agl-bet