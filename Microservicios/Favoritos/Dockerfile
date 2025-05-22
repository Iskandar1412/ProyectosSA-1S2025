FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# COPY .env .env

EXPOSE 5400

CMD [ "npm", "run", "dev" ]

# docker build -t micro-favoritos:v1 .
# docker build -t iskandar1412/proyecto-sa:favoritos .
# docker tag micro-favoritos:v1 iskandar1412/proyecto-sa:favoritos
# docker push iskandar1412/proyecto-sa:favoritos