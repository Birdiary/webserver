# Birdiary API

## Movement endpoints

### `GET /api/movement/<station_id>`

Returns movements for a station with optional server-side filters.

Supported query parameters:

- `movements=<N>`: maximum number of returned movements
- `offset=<N>`: skip first N matching movements
- `species=<latin_name>`: species filter (`Parus_major` is accepted by replacing spaces with `_`)
- `date=YYYY-MM-DD`: single-day filter
- `days=<N>`: rolling window including today and the previous `N-1` days
- `from=YYYY-MM-DD&to=YYYY-MM-DD`: explicit date range

Date precedence in requests:

1. `from`/`to`
2. `days`
3. `date`

Validation behavior:

- Invalid `from`, `to`, `date` format returns `400`
- Invalid `movements`, `offset`, `days` values return `400`

Examples:

- `/api/movement/<station_id>?movements=100`
- `/api/movement/<station_id>?movements=50&offset=50`
- `/api/movement/<station_id>?species=Parus_major&days=2`
- `/api/movement/<station_id>?from=2026-07-01&to=2026-07-07&movements=200`

### `GET /api/station/<station_id>`

For station detail loading (including measurements.movements), pagination options are:

- `movements=<N>`
- `movementsOffset=<N>` (alias `movements_offset`)

When pagination is used, response includes `movementsMeta`:

- `limit`
- `offset`
- `returned`
- `total`
- `hasMore`

## UI integration notes

The UI request helper in `nginx/data_visualization/src/helpers/requests.js` supports passing extra movement search options to `searchForSpecies(...)`:

- `offset`
- `days`
- `from`
- `to`

This enables incremental loading and date-window constrained queries for improved frontend performance.