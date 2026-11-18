FROM node:22-slim

ENV EXPO_NO_TELEMETRY=1 \
    CI=false

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--lan"]
