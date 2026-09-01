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

### `DELETE /api/movement/<station_id>/<movement_id>`

Deletes a movement. Auth: `apikey` query param (station key or global `API_KEY`), station owner, or admin.

- Default: deletes the movement document and its video/audio files.
- `videoAudioOnly=true`: keeps the movement document (so it still counts toward statistics) and only deletes the video/audio files and clears the `video`/`audio` fields, so nothing is left to preview.

Examples:

- `/api/movement/<station_id>/<movement_id>?apikey=<key>`
- `/api/movement/<station_id>/<movement_id>?apikey=<key>&videoAudioOnly=true`

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

### Station description and logbook

Every station document has two additional fields:

- `description` (string, public): free text set by the owner describing how the station is built/set up. Returned to everyone in `GET /api/station` and `GET /api/station/<station_id>`, and shown on the public station page. Settable by the owner/admin via `PUT /api/station/<station_id>` (same auth as other station edits: station `apikey`, global `API_KEY`, owner, or admin).
- `logbook` (array, private): timestamped notes for the owner's own use. Only included in the response when the caller is the authenticated station owner or an admin — anonymous visitors and requests only carrying an `apikey` never see it (same handling as the existing `mail`/`key` fields). It is *not* editable through the generic `PUT /api/station/<station_id>` body (any `logbook` key in that request is dropped) — use the dedicated endpoints below instead, so the entry history can't be silently overwritten.

`POST /api/station/<station_id>/logbook`

- Auth: authenticated station owner or admin (Bearer token) — the station `apikey`/global `API_KEY` alone is not accepted here, since the logbook belongs to the human owner, not the physical station device.
- Body: `{"text": "..."}`
- Appends `{id, text, createdAt, authorId, authorEmail}` to the station's `logbook` and returns the created entry (`201`).

`DELETE /api/station/<station_id>/logbook/<entry_id>`

- Auth: same as above (owner or admin).
- Removes the matching entry from `logbook`.

## UI integration notes

The UI request helper in `nginx/data_visualization/src/helpers/requests.js` supports passing extra movement search options to `searchForSpecies(...)`:

- `offset`
- `days`
- `from`
- `to`

This enables incremental loading and date-window constrained queries for improved frontend performance.