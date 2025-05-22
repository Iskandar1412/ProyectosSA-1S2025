FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# COPY .env .env

EXPOSE 5300

CMD [ "npm", "run", "dev" ]

# docker build -t micro-productos:v1 .
# docker build -t iskandar1412/proyecto-sa:productos .
# docker tag micro-productos:v1 iskandar1412/proyecto-sa:productos
# docker push iskandar1412/proyecto-sa:productos