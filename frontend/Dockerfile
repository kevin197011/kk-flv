FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ENV API_PROXY_TARGET=http://backend:8080
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
