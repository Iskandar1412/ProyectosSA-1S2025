FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# COPY .env .env

EXPOSE 5100

CMD [ "npm", "run", "dev" ]

# docker build -t micro-compras:v1 .
# docker build -t iskandar1412/proyecto-sa:compras .
# docker tag micro-compras:v1 iskandar1412/proyecto-sa:compras
# docker push iskandar1412/proyecto-sa:compras