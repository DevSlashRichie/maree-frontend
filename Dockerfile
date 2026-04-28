# Stage 1: Build
FROM oven/bun:1 AS build
WORKDIR /app

ENV ENVIRONMENT=production
ENV VITE_GOOGLE_CLIENT_ID=664563004670-vbpp81aiu5khnrq1o8p75pg2f786l512.apps.googleusercontent.com

# Install dependencies
COPY package.json bun.lock ./
COPY orval.config.ts .
RUN bun install 

# Copy source and build
COPY . .
RUN bun run build

# Stage 2: Production
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
