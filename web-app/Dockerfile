# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files and web-app package files
COPY ../package*.json ./
COPY ./package*.json ./web-app/

# Install all dependencies using workspaces
RUN npm install

# Copy the web-app source code
COPY . ./web-app

# Build the Next.js app
WORKDIR /app/web-app
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner

WORKDIR /app

# Copy the standalone output to /app where Railway expects it when running from monorepo root
COPY --from=builder /app/web-app/.next/standalone/ ./
COPY --from=builder /app/web-app/.next/static ./web-app/.next/static
COPY --from=builder /app/web-app/public ./web-app/public
COPY --from=builder /app/web-app/package.json ./package.json

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "web-app/server.js"] 