FROM node:20-alpine3.22

RUN apk upgrade --no-cache

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3001

ENV PORT=3001
CMD ["node", "src/index.js"]
