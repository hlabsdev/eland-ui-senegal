FROM node:12.16.3-alpine as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g @angular/cli@latest

EXPOSE 4200 49153
EXPOSE 4201
CMD [ "npm", "run", "docker-start" ]
