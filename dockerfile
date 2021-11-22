FROM node:8.11-alpine
#RUN apk update && apk upgrade
ADD . zhd-crane
WORKDIR /zhd-crane
RUN ls -la
RUN npm install
CMD [ "npm", "run", "start" ]