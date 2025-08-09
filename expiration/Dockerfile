FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install --omit=dev #avoid installing dev dependencies
COPY . .

CMD ["npm","start"]