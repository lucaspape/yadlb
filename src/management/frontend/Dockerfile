FROM node:17.9.0-bullseye
WORKDIR /app
COPY ./package*.json ./
RUN npm install

RUN npm install -g serve

COPY ./ .

CMD npm start