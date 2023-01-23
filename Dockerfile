# Install dependencies only when needed
FROM node:18-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Install node-gyp dependencies
RUN apk add --no-cache libc6-compat git make g++ python3
WORKDIR /workdir

COPY package.json tsconfig.json ./
RUN npm install

FROM node:18-alpine AS runner

RUN apk add --no-cache ffmpeg

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app

COPY --from=deps /workdir .
COPY src src

USER app

CMD ["npm", "start"]