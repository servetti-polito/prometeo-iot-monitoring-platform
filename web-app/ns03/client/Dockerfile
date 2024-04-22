FROM node:20.8.1

# ADD start.sh /etc/start.sh
WORKDIR /prometeo
COPY package*.json ./
RUN npm install
# RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache

COPY . ./

WORKDIR /prometeo/server
COPY package*.json ./server
RUN npm install
RUN npm install -g nodemon

ARG VITE_APP_DOMAIN
ENV VITE_APP_DOMAIN $VITE_APP_DOMAIN

WORKDIR /prometeo

# ENTRYPOINT [ "/etc/start.sh" ]
CMD ["yarn", "start"]
