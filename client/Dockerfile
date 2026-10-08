FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_INSTANCE_URL
ARG VITE_SERVER_URL
ARG VITE_DEMO_MODE
ENV VITE_INSTANCE_URL=$VITE_INSTANCE_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
