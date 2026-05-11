FROM node:20-alpine AS builder

ARG NEXT_PUBLIC_BACKEND_URL

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL npm run build

FROM node:20-alpine

ARG NEXT_PUBLIC_BACKEND_URL

WORKDIR /app

RUN npm install -g next@16.1.6

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next-env.d.ts ./
COPY --from=builder /app/tsconfig.json ./

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

EXPOSE 3000

CMD ["next", "start"]