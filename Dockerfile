FROM node:18.12-alpine

RUN mkdir /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm ci

COPY tsconfig.json /app/tsconfig.json
COPY src /app/src

RUN npm run build
ENTRYPOINT ["node", "./build/init.js"]
