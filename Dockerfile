# Multi-stage build for WesWorld
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY client ./client
COPY server ./server
RUN npm install && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
RUN npm install --omit=dev
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/dist/index.js"]