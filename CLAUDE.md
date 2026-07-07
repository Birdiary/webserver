# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Webserver for the Birdiary citizen-science project. Smart bird feeders ("stations") upload movement, video/audio/image, environment, and feed data. A Flask API classifies birds with a TensorFlow Lite model, stores everything in MongoDB, offloads heavy work (classification, video synthesis, statistics, Raspberry Pi image customization) to Redis/RQ workers, and serves a React dashboard plus static landing pages through nginx.

There is a companion `agents.md` in the repo root with a much deeper per-service breakdown (endpoint line ranges, worker queue assignments, data volumes). Read it when you need detail beyond this file.

## Running the stack

Everything runs via Docker Compose — there is no local (non-container) run path. Requires `server.env` in the repo root (secrets: `HOST`, `Mail_PWD`, `opensensemap_*`, `API_KEY`, `AES_KEY`, `AES_IV`, `ADMIN_EMAILS`; also tuning vars below). Not checked into SCM.

```bash
# Development (hot-reload React UI mounted from source, dashboard, all workers)
docker-compose --file docker-compose-dev.yml up

# Production (multi-stage React build served by nginx + TLS via certbot)
docker-compose up
docker-compose up --build   # force image rebuild
```

- Dev platform: http://localhost:8080 — API at http://localhost:8080/api — React dev server also on :3000 — Flask on :5000.
- RQ dashboard (queue health, stuck jobs): http://localhost:9181.
- If the first `up` errors on MongoDB or HTTP timeouts, abort and retry.

Frontend `config.apiUrl` is set in `nginx/data_visualization/public/config.js` (defaults to `http://localhost:8080/api`).

### Frontend-only commands

Inside `nginx/data_visualization/` (Create React App): `npm start`, `npm run build`, `npm test`. Tests use react-scripts/Jest; run a single test with `npm test -- <pattern>`. There is no Python test suite — `api/example_requests.py` is a manual script of example HTTP calls against the API.

## Architecture essentials

### Backend — one big Flask file
Nearly all backend logic lives in [api/api.py](api/api.py) (~3300 lines). Helpers are only [api/scripts/classify_birds.py](api/scripts/classify_birds.py) (TF Lite top-5 species ranking, model in [api/models/bird_classification](api/models/bird_classification)) and [api/scripts/email_service.py](api/scripts/email_service.py). Routes are plain `@app.route` decorators — grep `@app.route` in api.py to find endpoints.

### Queues and background jobs
Four RQ queues are defined near [api/api.py:185](api/api.py#L185): default (`q`), `priority`, `image` (`q2`), `statistics` (`q3`). Functions meant to run on a worker are marked with the `@enqueueable` decorator (defined [api/api.py:873](api/api.py#L873)) — it rewrites `__module__` so the function pickles correctly for RQ. **When adding a new queue, register it in both api.py AND the `rq worker ...` commands in both compose files, or jobs will never be drained.** Worker layout differs between dev (`worker`, `worker3`) and prod (`worker`..`worker5`); the `--with-scheduler` worker handles time-shifted jobs (e.g. `deleteMovement`, nightly statistics).

### MongoDB — per-station collections
Uses raw pymongo (not an ODM). Collections are created dynamically per station: `movements_<station_id>`, `environments_<station_id>`, `feed_<station_id>`, plus a shared `statistics` collection. Environment/feed docs are nested monthly documents (time-series). Data persists in the bind-mounted `./db-data`.

### Statistics — two-tier caching (see README "Statistics cache behavior")
- **Full recompute** (heavy, `calculateStatistics`): rebuilds per-station + global stats, runs nightly via scheduler.
- **Range cache** (lightweight): `/api/statistics/<station_id>/range` is cache-first — always serves cache, queues an async refresh when stale. Movement/validation/environment/feed writes trigger refreshes for matching cached ranges via `enqueue_matching_range_cache_refreshes`.
- Tuning env vars (in `server.env`): `RANGE_STATS_CACHE_MINUTES`, `RANGE_STATS_REFRESH_MATCH_LIMIT`, `STATISTICS_*_LIMIT`, `STATISTICS_JOB_TIMEOUT_SECONDS`, `STATISTICS_NIGHTLY_HOUR`. `PREWARM_RANGES` and `BIRDS_OF_INTEREST` are hardcoded constants near the top of api.py.

### Movement API filtering (see README + [api/README.md](api/README.md))
`GET /api/movement/<station_id>` supports server-side `movements`/`offset`/`species`/`date`/`days`/`from`+`to` for UI performance. Date-filter precedence: `from`/`to` → `days` → `date`. Species filter uses `_` for spaces (e.g. `Parus_major`). `GET /api/station/<station_id>` paginates movements and returns `movementsMeta` for the UI "load more" flow. The UI request layer for all of this is [nginx/data_visualization/src/helpers/requests.js](nginx/data_visualization/src/helpers/requests.js).

### Frontend
Create React App (React 17, MUI 5, react-router v6). Homepage base path is `/view` (see `package.json` `homepage`), so all routes are under `/view/...` — routes declared in [nginx/data_visualization/src/App.js](nginx/data_visualization/src/App.js). All API calls go through [helpers/requests.js](nginx/data_visualization/src/helpers/requests.js) (axios, Bearer-token auth headers). Bilingual (de/en) via [src/languages/languages.js](nginx/data_visualization/src/languages/languages.js).

### nginx routing
`dev.conf` and `prod.conf` in `nginx/`. Prod terminates TLS, redirects HTTP→HTTPS, serves localized landing pages (`/`, `/de`, `/en`) from `nginx/templates/`, mounts the React dashboard at `/view`, and proxies `/api` + `/static` to Flask. Note: prod compose references `nginx/Dockerfile` but only `nginx/Dockerfile.dev` exists in-repo — confirm/create the prod Dockerfile before a prod build.

### Auth
Cookie/Bearer-token auth with `werkzeug.security` password hashing; user + admin endpoints (`/api/register`, `/api/login`, `/api/me`, `/api/admin/*`) live at the bottom of api.py. Station ingestion endpoints are gated by `API_KEY`.

## Conventions worth matching
- Keep endpoint + background-job logic in api.py alongside the existing routes rather than splitting into new modules (that is the established pattern here).
- Observability is Sentry (`sentry_sdk.init` near the top of api.py, with a custom `traces_sampler` that down-samples static/upload/high-frequency POST paths). ffmpeg/MP4Box are required in the API image for video jobs.
