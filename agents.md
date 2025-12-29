# Birdiary Agents

## Overview
- Citizen-science bird feeders push measurements, media, and metadata into this stack.
- A Flask API stores artifacts in MongoDB, classifies birds with TensorFlow Lite, and enqueues heavy work on Redis + RQ workers.
- React dashboards and static landing pages are served through nginx; rq-dashboard, Sentry, and Certbot cover observability and TLS hygiene.

## System Topology
1. **Stations** upload movement, audio/video, environment, and feed payloads to the API.
2. **RQ queues** fan out media processing (classification, video synthesis, Raspberry Pi image customization) and statistics crunching.
3. **MongoDB** stores stations, movements, validation, statistics, and time-series environment/feed documents.
4. **Front-ends** (React UI plus static templates) pull data from the API via nginx, while nginx also proxies uploads to Flask and handles TLS/HTTP.
5. **Operators** monitor redis-backed queues via rq-dashboard and renew certificates through the bundled Certbot sidecar.

## Agent Catalog
| Agent | Container / Service | Source | Core responsibilities | Depends on |
| --- | --- | --- | --- | --- |
| API | `api` | [api/api.py](api/api.py) | Flask REST API, ML inference, file handling, queue dispatch | MongoDB, Redis, uploads volume, TF Lite models |
| Worker (default+scheduler) | `worker` | [docker-compose.yml](docker-compose.yml) | Runs `rq worker default image statistics --with-scheduler` to drain high priority jobs | Redis, same image+volume as API |
| Worker (general) | `worker2` | [docker-compose.yml](docker-compose.yml) | Secondary `rq worker default` for throughput | Redis |
| Worker (named queues) | `worker3` | [docker-compose.yml](docker-compose.yml) | Targets `default image statistics` queues | Redis |
| React UI | `ui` (dev only) | [nginx/data_visualization](nginx/data_visualization) | Citizen dashboard (maps, charts, validation views) | API, nginx proxy |
| nginx | `nginx` | [nginx/dev.conf](nginx/dev.conf), [nginx/prod.conf](nginx/prod.conf) | Static hosting, reverse proxy, TLS termination | API, UI build, Certbot volumes |
| MongoDB | `mongodb` | docker hub `mongo:latest` | Primary datastore for domain objects | db-data volume |
| Redis | `redis` | docker hub `redis:6.2-alpine` | Queue + cache backing RQ | — |
| rq-dashboard | `rq-dashboard` | [rq-dashboard/Dockerfile](rq-dashboard/Dockerfile) | Web UI for queues (port 9181) | Redis |
| Certbot | `certbot` | docker hub `certbot/certbot` | Renews TLS certificates every 12h | nginx volumes |

## API Agent (Flask)
- Entry point lives in [api/api.py](api/api.py); models and helper scripts sit under [api/scripts](api/scripts) and [api/models](api/models).
- External services: Redis queues (`default`, `image`, `statistics`) instantiated near the top of [api/api.py](api/api.py#L72-L110); MongoDB connection targets `birdiary_database` collections that are namespaced per station.
- Media classifiers:
  - `classify()` in [api/scripts/classify_birds.py#L71-L126](api/scripts/classify_birds.py#L71-L126) loads the TF Lite model in [api/models/bird_classification](api/models/bird_classification) and ranks top-5 species.
  - Email notifications are formatted in [api/scripts/email_service.py#L10-L45](api/scripts/email_service.py#L10-L45).
- HTTP surface (selected groups):
  - Classification uploads: `/api/image`, `/api/video`, `/api/audio` ([api/api.py#L1067-L1131](api/api.py#L1067-L1131)).
  - Station lifecycle + metadata: `/api/station`, `/api/station/<station_id>` with API key gates and exhibit/test logic ([api/api.py#L1132-L1257](api/api.py#L1132-L1257)).
  - Environment + feed series: `/api/environment/<station_id>` and `/api/feed/<station_id>` ([api/api.py#L1258-L1350](api/api.py#L1258-L1350), [api/api.py#L1596-L1634](api/api.py#L1596-L1634)).
  - Movement ingestion, listing, media downloads, and validation endpoints ([api/api.py#L1313-L1548](api/api.py#L1313-L1548)).
  - Station image customization endpoints `/api/image/<id>` for Raspberry Pi OS templating ([api/api.py#L1563-L1587](api/api.py#L1563-L1587)).
- Background jobs (decorated via `enqueueable`):
  - `modify_image()` updates Wi-Fi credentials and rotation inside a mounted Pi image ([api/api.py#L222-L323](api/api.py#L222-L323)).
  - `calculateStatistics()` aggregates per-station and global stats, feeds `specialBirds`, validated counts, and per-day records ([api/api.py#L324-L676](api/api.py#L324-L676)).
  - `videoAnalysis()` / `videoAnalysisImage()` perform OpenCV frame sampling, species aggregation, email triggers, and video synthesis from uploaded images ([api/api.py#L679-L898](api/api.py#L679-L898)).
  - `saveEnvironment()`, `saveFeed()`, `saveValidation()` manage nested monthly documents and validation summaries ([api/api.py#L899-L1150](api/api.py#L899-L1150)).
- Configuration + deps:
  - Container recipes live in [api/Dockerfile](api/Dockerfile) and [api/Dockerfile.dev](api/Dockerfile.dev), layering TensorFlow, OpenCV, gpac, ffmpeg, and Flask.
  - Python dependencies are enumerated in [api/requirements.txt](api/requirements.txt) (Flask 2.0.x, mongoengine, redis, rq, sentry-sdk, etc.).
  - Runtime secrets and API keys are injected from `server.env` (not checked into SCM).
  - Upload destinations are under `uploads/disk/{images,audios,videos}` with public downloaders `/api/uploads/...`.
  - Observability uses Sentry via `sentry_sdk.init()` configured near the top of [api/api.py](api/api.py#L27-L69).

## Worker Agents (RQ)
- All workers reuse the `api` image to guarantee access to TensorFlow, cv2, and helper scripts.
- `worker` (dev and prod) launches `rq worker default image statistics --with-scheduler`, handling time-shifted jobs like `deleteMovement` and `calculateStatistics` ([docker-compose-dev.yml](docker-compose-dev.yml), [docker-compose.yml](docker-compose.yml)).
- `worker2` provides a lighter `rq worker default` process for bursty ingestion; `worker3` targets both `image` and `statistics` queues.
- Workers mount `./data/uploads` so post-processed media stays accessible to the API service.

## React UI Agent
- Source sits in [nginx/data_visualization](nginx/data_visualization); it is a Create React App workspace with dependencies listed in [package.json](nginx/data_visualization/package.json) (MUI 5, React 17, Chart.js, Leaflet, ApexCharts, Axios, Formik/Yup, etc.).
- Key feature folders inside `src/` include `Map`, `Statistics`, `Station/visualization`, `Movement`, `CreateStation`, `Validation`, and `Navbar`, mirroring dashboard views for live monitoring, charting, and validator workflows.
- Dev mode runs through `npm start` (`ui` service in [docker-compose-dev.yml](docker-compose-dev.yml)) and proxies via nginx at `/view` per [nginx/dev.conf](nginx/dev.conf). Production bundles are created by `npm run build` inside `nginx/data_visualization/Dockerfile` (referenced by the nginx production build stage) and served by nginx.

## Reverse Proxy Agent (nginx)
- Dev proxy ([nginx/Dockerfile.dev](nginx/Dockerfile.dev)) copies localized templates into `/usr/share/nginx/html`, swaps the default conf, and exposes port 8080 with generous upload limits and permissive CORS ([nginx/dev.conf](nginx/dev.conf)).
- Production config ([nginx/prod.conf](nginx/prod.conf)) terminates TLS (LetsEncrypt certs mounted under `./data/certbot`), redirects HTTP->HTTPS, serves localized landing pages (`/`, `/de`, `/en`), exposes the React dashboard at `/view`, and proxies `/api` plus `/static` to Flask.
- The nginx build referenced in [docker-compose.yml](docker-compose.yml) points to `nginx/Dockerfile`, which should mimic the dev Dockerfile but use the production conf (ensure the file exists when building in prod).

## Data & Supporting Agents
- **MongoDB** (`mongodb` service) persists state in `./db-data`. Collections are created dynamically per station (e.g., `movements_<station_id>`, `environments_<station_id>`, `feed_<station_id>`, `statistics`). Indices on movement timestamps/months are established when stations are created.
- **Redis** (`redis` service) is the single queue backend; no persistence is configured, so queue contents are ephemeral.
- **rq-dashboard** builds from [rq-dashboard/Dockerfile](rq-dashboard/Dockerfile), pins `rq==1.8.1`, and exposes port 9181 for operational visibility.
- **Certbot** runs a renewal loop every 12h and shares the letsencrypt + challenge volumes with nginx, matching the command embedded in [docker-compose.yml](docker-compose.yml).
- **Data volumes**: `./data/uploads` (media + Pi images), `./data/certbot/{conf,www}`, and `./db-data` are bind-mounted so containers stay stateless.

## Shared Assets & Templates
- Landing pages, legal imprint, upload forms, and API documentation themes live under [nginx/templates](nginx/templates). They are copied verbatim into nginx images.
- The API exposes OpenAPI/Redoc content in `templates/redoc`, and static CSS/JS assets live under `api/static` for direct serving when bypassing the React UI.

## Local & Production Workflows
1. **Development**: `docker-compose --file docker-compose-dev.yml up` starts API, MongoDB, Redis, nginx proxy, RQ workers, dashboard, and live React UI. The UI code mounts directly from `nginx/data_visualization` for hot reloads (see [README.md](README.md)).
2. **Production**: `docker-compose up` builds the API, compiles the React UI through the nginx multi-stage Dockerfile, and runs nginx with TLS and the Certbot sidecar. Workers are duplicated for throughput, and the API listens behind nginx on 80/443.
3. **Environment**: Populate `server.env` with Mail credentials, Sentry DSN overrides, API keys, MQTT/opensensemap secrets before launching.

## Observability & Operations
- Sentry tracing is enabled in [api/api.py](api/api.py#L27-L69); tune `traces_sampler` thresholds to control ingestion costs.
- Queue health: visit `http://localhost:9181` (dev) to check stuck jobs, worker status, and job payloads.
- Media and statistics jobs rely on ffmpeg/MP4Box; validate those binaries inside the API image (`ffmpeg -version`) if classification stalls.
- Certbot logs land in the container stdout; ensure ports 80/443 are reachable externally before first issuance.

## Next Steps When Extending
1. Add new agents/services by updating both compose files and documenting their dependencies here.
2. When introducing new queues, register them under both the API (queue creation) and the worker command list so jobs are drained.
3. For UI features, coordinate API contract changes with React reducers/components under `nginx/data_visualization/src` and keep nginx routes in sync.
