FROM node

WORKDIR /api

COPY package.json .
COPY package-lock.json .
RUN npm install
RUN npm install -g nodemon
RUN npm install pm2 -g

COPY . .

EXPOSE 3001

# CMD ["pm2-runtime", "index.js"]
CMD ["nodemon", "index.js"]

