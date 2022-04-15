FROM node:17.9.0-bullseye
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY ./ .
CMD node main.js