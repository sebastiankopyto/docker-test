# =====================================================================
#  Multi-stage build dla Astro (czysta statyka)
#  - etap "build":   Node buduje statyczne pliki (astro build → dist/)
#  - etap "runtime": nginx serwuje gotowe pliki (bez Node w produkcji)
#  Rebuild-on-save: nowa treść = ponowny build tego obrazu.
# =====================================================================

# ---------- etap 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# ---------- etap 2: runtime (nginx serwuje statykę) ----------
FROM nginx:alpine AS runtime
# gotowe pliki strony
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# nginx.conf i katalog logów montowane przez docker-compose
