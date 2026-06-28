FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g @expo/ngrok --legacy-peer-deps

COPY package*.json ./

RUN npm install --legacy-peer-deps

# In development, this COPY acts as a fallback. 
# Your live code will actually be mounted via volumes.
COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "-c", "--tunnel"]