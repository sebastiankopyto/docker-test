# API / backend — placeholder (etap 2)

Ten katalog jest celowo pusty. Wejdzie tu backend, gdy dojdzie:

- **formularz kontaktowy** — zapis wiadomości do bazy,
- **wyświetlanie danych** — pobieranie treści z bazy i podanie ich stronie.

## Jak to włączymy (etap 2)

1. Dodajemy tu backend (np. Node.js + Express, Python + FastAPI albo PHP) —
   z jednym endpointem, np. `POST /contact` i `GET /data`.
2. Dokładamy `Dockerfile` w tym katalogu.
3. W `docker-compose.yml` odkomentowujemy usługę `api`.
4. W `nginx/nginx.conf` odkomentowujemy blok `location /api/`.

Wtedy ruch z `http://twojadomena.pl/api/...` nginx przekieruje do tego backendu,
a backend rozmawia z bazą PostgreSQL (usługa `db`).
