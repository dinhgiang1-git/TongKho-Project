FROM node:20.16.0-alpine3.19 AS builder

WORKDIR /app
COPY ["package.json","yarn.lock","./"]

RUN yarn install

COPY . .
# Cài đặt các công cụ build cần thiết
RUN yarn build

ENV TZ="Asia/Ho_Chi_Minh"
EXPOSE 3000
CMD ["yarn", "start:prod"]
