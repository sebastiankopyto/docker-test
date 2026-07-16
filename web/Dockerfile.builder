# =====================================================================
#  Obraz buildera — źródła Astro WPIECZONE w obraz (bez bind-mountu).
#  Dzięki temu `astro build` czyta/pisze po szybkim fs kontenera,
#  a nie po wolnym mount z Windows (Docker Desktop), który wieszał build.
#  Kontener wystawia HTTP /rebuild i buduje statykę na wolumen współdzielony.
# =====================================================================
FROM node:22-alpine
WORKDIR /app

# zależności (osobna warstwa = cache przy zmianie samego kodu)
COPY package.json package-lock.json* ./
RUN npm install

# źródła + skrypt buildera (node_modules/dist/.astro pominięte przez .dockerignore)
COPY . .

EXPOSE 8080
CMD ["node", "builder.mjs"]
