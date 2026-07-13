# Wizytówka — Docker + nginx

Prosta strona-wizytówka serwowana przez nginx w kontenerze Docker.
Gotowa do rozbudowy o backend (API) i bazę danych (PostgreSQL).

## Struktura

```
docker/
├── docker-compose.yml     # spina usługi; teraz aktywny tylko nginx
├── nginx/
│   └── nginx.conf         # reverse proxy + serwowanie strony (gotowe /api)
├── site/                  # pliki strony statycznej — TO EDYTUJESZ
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
├── api/                   # placeholder na backend (etap 2)
├── logs/nginx/            # tu lądują logi nginx (access.log, error.log)
└── README.md
```

## Uruchomienie (lokalnie)

Wymagany zainstalowany **Docker Desktop** (Windows) lub **Docker** (Linux).

```bash
docker compose up -d      # uruchom w tle
```

Wejdź na **http://localhost** — powinna pojawić się wizytówka.

Przydatne komendy:

```bash
docker compose logs -f nginx     # logi nginx na żywo
docker compose ps                # status kontenerów (i healthcheck)
docker compose restart nginx     # restart po zmianie nginx.conf
docker compose down              # zatrzymaj i usuń kontenery
```

> Zmiany w plikach `site/` widać po odświeżeniu przeglądarki — nie trzeba
> restartować kontenera (katalog jest podmontowany na żywo).
> Zmiany w `nginx.conf` wymagają `docker compose restart nginx`.

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
