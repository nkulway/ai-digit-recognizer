FROM node:16

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npx", "ts-node", "src/server.ts"]
