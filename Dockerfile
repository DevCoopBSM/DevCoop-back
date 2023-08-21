FROM node:18.16.0

WORKDIR /index

COPY package*.json ./
COPY package-lock.json .

RUN npm install


COPY . .

EXPOSE 6002
CMD ["npm", "start"]
CMD ["node", "index.js"]
