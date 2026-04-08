# --- STAGE 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Kopieer package bestanden
COPY package*.json ./

# Installeer alle dependencies voor de build
RUN npm install

# Kopieer de rest van de broncode
COPY . .

# Bouw de frontend (Vite genereert de /dist map)
RUN npm run build

# --- STAGE 2: Production Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

# Stel de omgeving in op productie
ENV NODE_ENV=production

# Kopieer alleen de noodzakelijke bestanden van de builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

# Installeer alleen productie-dependencies (geen devDeps, bespaart ruimte)
RUN npm install --omit=dev

# Exposeer de poort
EXPOSE 3000

# Start de server met native TypeScript ondersteuning van Node 22
# De vlag --experimental-strip-types zorgt dat we server.ts direct kunnen draaien
CMD ["node", "--experimental-strip-types", "server.ts"]
