# Stage 1: build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_HF_TOKEN
ENV VITE_HF_TOKEN=$VITE_HF_TOKEN
RUN npm run build

# Stage 2: serve with nginx
# CF_ACCOUNT_ID and CF_TOKEN are passed as runtime env vars (docker-compose environment:)
# nginx's own entrypoint runs envsubst on /etc/nginx/templates/*.template at startup
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
