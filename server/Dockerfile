FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && apk del python3 make g++
COPY . .
RUN chmod -R a+rX /app && chown -R node:node /app
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:3001/health || exit 1
CMD ["node", "server.js"]
