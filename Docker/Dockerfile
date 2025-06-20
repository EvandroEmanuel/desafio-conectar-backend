FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY Docker/start.sh /scripts/start.sh

RUN chmod +x /scripts/start.sh


RUN npm run build

CMD ["sh", "/scripts/start.sh"]