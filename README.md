# Wizytówka — Astro + nginx + Docker

Strona-wizytówka na **Astro** (tryb hybrydowy: statyczny + renderowanie na
żądanie), za bramą **nginx**, w kontenerach Docker. Gotowa do rozbudowy o
backend (API) i bazę danych (PostgreSQL).

## Struktura

```
docker/
├── docker-compose.yml     # nginx + web (Astro) + web-dev (hot-reload, profil dev)
├── nginx/
│   └── nginx.conf         # reverse proxy → serwer Astro (gotowe /api)
├── web/                   # projekt Astro — TO EDYTUJESZ
│   ├── src/pages/         # strony (index, blog, status=SSR)
│   ├── src/content/blog/  # wpisy bloga (Markdown)
│   ├── src/layouts/
│   └── Dockerfile         # multi-stage: build (node) → runtime (node)
├── site/                  # STARA wizytówka statyczna — backup (nieużywana)
├── api/                   # placeholder na backend (etap 2)
├── logs/nginx/            # logi nginx (access.log, error.log)
└── README.md
```

## Uruchomienie (lokalnie)

Wymagany zainstalowany **Docker Desktop** (Windows) lub **Docker** (Linux).

**Wersja produkcyjna** (zbudowane Astro za nginx):

```bash
docker compose up -d --build     # zbuduj i uruchom w tle
```

Wejdź na **http://localhost**. Strony:
- `/` — wizytówka (statyczna)
- `/blog` — lista wpisów (statyczna)
- `/status` — demo renderowania na żądanie (czas zmienia się po odświeżeniu)

**Wersja developerska** (hot-reload — zmiany widać od razu):

```bash
docker compose --profile dev up web-dev   # → http://localhost:4321
```

Przydatne komendy:

```bash
docker compose logs -f web       # logi serwera Astro
docker compose ps                # status + healthcheck
docker compose up -d --build     # przebuduj po zmianie treści/kodu
docker compose down              # zatrzymaj i usuń kontenery
```

> W trybie **dev** (`web-dev`) zmiany w `web/src/` widać natychmiast.
> W trybie **produkcyjnym** po zmianie treści przebuduj: `docker compose up -d --build`.
> Nowy wpis bloga = nowy plik `.md` w `web/src/content/blog/` + przebudowa.

## Co dalej (kolejne etapy)

- **Etap 2 — backend/API:** dodać kod w `api/`, odkomentować usługę `api`
  w `docker-compose.yml` i blok `location /api/` w `nginx.conf`.
- **Etap 3 — baza PostgreSQL:** odkomentować usługę `db` i wolumen `db-data`.
- **Wdrożenie na serwer:** VPS + Docker, `git clone`, `docker compose up -d`,
  następnie DNS (rekord A → IP serwera), HTTPS (Let's Encrypt) i firewall
  (porty 80 + 443).

## Wbudowane udogodnienia

- `restart: unless-stopped` — kontener sam wstaje po awarii i po reboocie serwera
  (na serwerze pamiętaj o `sudo systemctl enable --now docker`).
- `healthcheck` — Docker sprawdza, czy nginx faktycznie odpowiada.
- Rotacja logów (`max-size` / `max-file`) — logi nie zapchają dysku.
- Logi nginx dostępne również jako pliki w `logs/nginx/`.
