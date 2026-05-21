# =============================================================================
# STAGE 1: Install dependencies
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack enable \
    && corepack prepare pnpm@10.20.0 --activate \
    && pnpm i --frozen-lockfile

# =============================================================================
# STAGE 2: Build the Next.js application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_ENDPOINT=http://api.uav-store.io.vn/api
ARG NEXT_PUBLIC_MINIO_PUBLIC_URL=http://storage.uav-store.io.vn
ARG NEXT_PUBLIC_STORAGE_BASE_URL=http://storage.uav-store.io.vn

ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_MINIO_PUBLIC_URL=$NEXT_PUBLIC_MINIO_PUBLIC_URL
ENV NEXT_PUBLIC_STORAGE_BASE_URL=$NEXT_PUBLIC_STORAGE_BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable \
    && corepack prepare pnpm@10.20.0 --activate \
    && pnpm build

# =============================================================================
# STAGE 3: Production runner (Next.js standalone output)
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ARG NEXT_PUBLIC_API_ENDPOINT=http://api.uav-store.io.vn/api
ARG NEXT_PUBLIC_MINIO_PUBLIC_URL=http://storage.uav-store.io.vn
ARG NEXT_PUBLIC_STORAGE_BASE_URL=http://storage.uav-store.io.vn

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_MINIO_PUBLIC_URL=$NEXT_PUBLIC_MINIO_PUBLIC_URL
ENV NEXT_PUBLIC_STORAGE_BASE_URL=$NEXT_PUBLIC_STORAGE_BASE_URL

RUN apk add --no-cache libc6-compat \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
