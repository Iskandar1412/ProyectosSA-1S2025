FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# COPY .env .env

EXPOSE 5700

CMD [ "npm", "run", "dev" ]

# docker build -t micro-devoluciones:v1 .
# docker build -t iskandar1412/proyecto-sa:devoluciones .
# docker tag micro-devoluciones:v1 iskandar1412/proyecto-sa:devoluciones
# docker push iskandar1412/proyecto-sa:devoluciones