FROM node:14-buster as build

WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

RUN npm install react-scripts@3.4.3 -g --silent

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install --silent

COPY . /usr/src/app/.
RUN npm run build

#########
# FINAL #
#########

FROM mhart/alpine-node:base
WORKDIR /app
COPY --from=builder /usr/src/app .
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]