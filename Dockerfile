FROM node:24-alpine AS node

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

RUN npm version ${APP_VERSION} --allow-same-version && \
    npm run build


FROM nginx:1.28-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=node /app/dist /usr/share/nginx/html

