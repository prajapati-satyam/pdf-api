FROM node:18-slim

RUN sudo apt-get update

RUN sudo apt-get install -y qpdf

COPY . .

RUN npm install

EXPOSE 3000

CMD [ "node" , "index.js"]