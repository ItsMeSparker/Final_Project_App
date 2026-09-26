FROM node:20-alpine

WORKDIR /usr/src/app

# It's okay to keep legacy-peer-deps for the global ngrok install
RUN npm install -g @expo/ngrok --legacy-peer-deps

COPY package*.json ./

# REMOVE --legacy-peer-deps here! Let npm enforce the correct versions.
RUN npm install

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "-c", "--tunnel"]