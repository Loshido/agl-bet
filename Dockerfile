FROM node:lts-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=./cache \
    npm i

COPY . .
RUN npm run build

FROM oven/bun:alpine AS production
WORKDIR /app

COPY --from=build /app/server server
COPY --from=build /app/dist dist

ENV PORT=80
EXPOSE 80
ENTRYPOINT [ "bun", "server/entry.bun.js" ]