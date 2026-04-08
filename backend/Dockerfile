# Backend API for Remote Ephemeral Browser
# When running: mount Docker socket so the app can create browser containers
#   docker run -v /var/run/docker.sock:/var/run/docker.sock -p 3001:3001 youruser/rebrowser-backend:latest

FROM node:20-alpine3.22

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3001

ENV PORT=3001
CMD ["node", "src/index.js"]
