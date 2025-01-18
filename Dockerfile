# Verwende eine offizielle Node.js-Basis-Image
FROM node:18-alpine

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Projektabhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

# Kompiliere TypeScript
RUN npm run build

# Exponiere den Port, auf dem die Anwendung läuft
EXPOSE 3000

# Starte die Anwendung
CMD ["npm", "start"]