FROM node:18.16.0

WORKDIR /

COPY package*.json ./
COPY package-lock.json .

RUN npm install


COPY . .

EXPOSE 6002
CMD ["npm", "start"]
