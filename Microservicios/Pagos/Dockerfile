FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# COPY .env .env

EXPOSE 5600

CMD [ "npm", "run", "dev" ]

# docker build -t micro-pagos:v1 .
# docker build -t iskandar1412/proyecto-sa:pagos .
# docker tag micro-pagos:v1 iskandar1412/proyecto-sa:pagos
# docker push iskandar1412/proyecto-sa:pagos