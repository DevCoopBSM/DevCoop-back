FROM node:18.16.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install


COPY . .

EXPOSE 6002
CMD ["npm", "start"]
CMD ["node", "index.js"]
