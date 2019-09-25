###
FROM node:10.16.3-alpine as dev

RUN apk add --no-cache less bash


###
FROM node:10.16.3-alpine as prod

# environment setup
ENV NODE_ENV=production
WORKDIR /app

# yarn install
COPY package.json yarn.lock ./
RUN yarn install

# copy source and run
COPY ./src ./src
CMD node ./src/app.js
