# 1. Base stage for dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 2. Builder stage
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js client bundle
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_INSFORGE_URL
ARG NEXT_PUBLIC_INSFORGE_ANON_KEY
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_LS_ORDER_VARIANT_ID

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_INSFORGE_URL=$NEXT_PUBLIC_INSFORGE_URL
ENV NEXT_PUBLIC_INSFORGE_ANON_KEY=$NEXT_PUBLIC_INSFORGE_ANON_KEY
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_PUBLIC_LS_ORDER_VARIANT_ID=$NEXT_PUBLIC_LS_ORDER_VARIANT_ID

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN bun run build

# 3. Runner stage (Lightweight standalone node runner)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
