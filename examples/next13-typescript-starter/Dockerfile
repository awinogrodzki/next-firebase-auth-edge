FROM node:18.19.0-alpine

WORKDIR /usr/app

COPY . .

RUN yarn install --production

RUN printenv

RUN yarn build

CMD [ "yarn", "start" ]