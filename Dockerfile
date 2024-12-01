FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm run build

COPY . .

FROM nginx:1.24-alpine

COPY --from=builder /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]