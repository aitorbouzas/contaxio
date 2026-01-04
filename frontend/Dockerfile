FROM node:22-alpine

WORKDIR /app

# Copiamos solo los package*.json para aprovechar el caché de Docker
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de desarrollo de Next.js
EXPOSE 3000

# Arrancamos en modo desarrollo con Hot-Reload
CMD ["npm", "run", "dev"]