FROM node:20-alpine AS build
WORKDIR /workspace
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ENV API_UPSTREAM=http://api:8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/dist/aether-web/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
