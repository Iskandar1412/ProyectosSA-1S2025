FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# COPY .env .env

EXPOSE 5200

CMD [ "npm", "run", "dev" ]

# docker build -t micro-users .
# docker run -p 5200:5200 --name usuarios micro-users

# docker build -t micro-usuarios:v1 .
# docker build -t iskandar1412/proyecto-sa:usuarios .
# docker tag micro-usuarios:v1 iskandar1412/proyecto-sa:usuarios
# docker push iskandar1412/proyecto-sa:usuarios