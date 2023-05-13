FROM node:latest

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD service postgresql start \
&& su - postgres -c 'createdb ntmt' \
&& npm run migrate \
&& npm start