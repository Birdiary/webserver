FROM node:latest as build
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./data_visualization/package.json /usr/src/app

RUN npm install

COPY ./data_visualization /usr/src/app
RUN npm run build

FROM nginx:1.15.8-alpine
COPY --from=build /usr/src/app/build ./usr/share/nginx/html/view
COPY ./templates/info ./usr/share/nginx/html
COPY ./templates/redoc ./usr/share/nginx/html/doc
COPY ./templates/upload ./usr/share/nginx/html/upload
COPY ./templates/impressum ./usr/share/nginx/html/impressum

RUN rm /etc/nginx/conf.d/default.conf
COPY /prod.conf /etc/nginx/conf.d

