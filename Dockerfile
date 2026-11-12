# ==========================================
# STAGE 1: Build dell'app React/Vite con Node
# ==========================================
FROM node:22-alpine AS build

WORKDIR /app

# 1. Copiamo solo package.json e package-lock.json per sfruttare la cache di Docker
COPY package*.json ./
RUN npm ci

# 2. Copiamo il resto dei sorgenti e lanciamo la build di produzione
COPY . .

# Variabile opzionale in fase di build per l'URL del backend (default: http://localhost:8080)
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ==========================================
# STAGE 2: Server web leggero con Nginx
# ==========================================
FROM nginx:stable-alpine

# Rimuoviamo la configurazione di default di Nginx e inseriamo la nostra (per React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamo solo i file statici compilati (cartella dist) dallo stage di build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

