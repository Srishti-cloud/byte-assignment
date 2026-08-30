FROM node:20-alpine

WORKDIR /app

RUN apk upgrade --no-cache

COPY package*.json ./
RUN npm ci --omit=dev \
	&& rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]
