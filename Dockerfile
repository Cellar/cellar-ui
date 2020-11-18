FROM node:14-alpine as node

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ARG APP_VERSION

RUN npm version ${APP_VERSION} && \
    npm run publish


FROM nginx:1.17-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=node /app/dist/cellar-ui /usr/share/nginx/html
