FROM node:latest as build
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./data_visualization/package.json /usr/src/app

RUN npm install

COPY ./data_visualization /usr/src/app
RUN npm run build

FROM nginx:1.15.8-alpine
COPY --from=build /usr/src/app/build ./usr/share/nginx/html/view
COPY ./templates/en ./usr/share/nginx/html
COPY ./templates/en ./usr/share/nginx/html/en
COPY ./templates/de ./usr/share/nginx/html/de
COPY ./templates/redoc ./usr/share/nginx/html/doc
COPY ./templates/upload ./usr/share/nginx/html/upload

RUN rm /etc/nginx/conf.d/default.conf
COPY /prod.conf /etc/nginx/conf.d

