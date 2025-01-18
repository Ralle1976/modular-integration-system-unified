# Basis Image
FROM node:20-alpine

# Arbeitsverzeichnis erstellen
WORKDIR /usr/src/app

# Package Files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci

# Source kopieren
COPY . .

# TypeScript kompilieren
RUN npm run build

# Port freigeben
EXPOSE 3000

# Anwendung starten
CMD ["npm", "start"]