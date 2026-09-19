FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# SECURITY: drop root. The node:* images ship a non-root `node` user.
# chown so the app can still create/write its temp dir at runtime.
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
