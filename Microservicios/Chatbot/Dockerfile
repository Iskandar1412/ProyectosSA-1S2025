FROM node:23-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
# COPY .env .env

EXPOSE 5500

CMD [ "npm", "run", "dev" ]

# docker build -t micro-chatbot:v1 .
# docker build -t iskandar1412/proyecto-sa:chatbot .
# docker tag micro-chatbot:v1 iskandar1412/proyecto-sa:chatbot
# docker push iskandar1412/proyecto-sa:chatbot