FROM node:14

WORKDIR /app
COPY package.json /app
RUN npm rebuild && npm install && npm i --save firebase-functions
COPY . /app

EXPOSE 8081
CMD npm start