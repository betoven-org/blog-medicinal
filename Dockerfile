FROM node:22-alpine AS base

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args become env vars at build time (Next.js needs them for SSG)
ARG CMS_URL
ARG CMS_API_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG REVALIDATE_SECRET

ENV CMS_URL=$CMS_URL
ENV CMS_API_KEY=$CMS_API_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
ENV REVALIDATE_SECRET=$REVALIDATE_SECRET

RUN corepack enable pnpm && pnpm run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Pre-built ISR cache — seeded at build time, updated at runtime
# Mount a Docker volume at /app/.next/cache to persist between deploys
COPY --from=builder --chown=nextjs:nodejs /app/.next/cache ./.next/cache

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
