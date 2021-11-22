FROM node:8.11-alpine
#RUN apk update && apk upgrade
ADD ./crane-client /zhd-crane
WORKDIR /zhd-crane
CMD [ "npm", "run", "start" ]