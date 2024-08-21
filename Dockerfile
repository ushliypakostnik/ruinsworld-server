FROM node:16-alpine

WORKDIR /opt/app

COPY package*.json ./

# install dependencies
RUN npm install

COPY . .

# for development
# CMD ["npm", "run", "start:dev"]

# for production
RUN npm run build
CMD ["npm", "run", "start:prod"]

# Сборка образа
# sudo docker build -t broshotter-backend .

# Запуск образа
# sudo docker run -p 8082:8082 broshotter-backend
