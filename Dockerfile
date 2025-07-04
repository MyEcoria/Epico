# Build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app /app
EXPOSE 8000
CMD ["node", "--openssl-legacy-provider", "dist/index.js"]
