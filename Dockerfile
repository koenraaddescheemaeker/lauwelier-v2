# Gebruik een moderne Node.js versie die TypeScript ondersteunt
FROM node:22-alpine

WORKDIR /app

# Kopieer package bestanden
COPY package*.json ./

# Installeer alle dependencies (inclusief devDependencies voor de build)
RUN npm install

# Kopieer de rest van de broncode
COPY . .

# Bouw de frontend (Vite)
RUN npm run build

# Exposeer poort 3000 (de poort die we in server.ts gebruiken)
EXPOSE 3000

# Start de server
# We gebruiken de --experimental-strip-types vlag voor Node 22 om TS direct te draaien
CMD ["node", "--experimental-strip-types", "server.ts"]
