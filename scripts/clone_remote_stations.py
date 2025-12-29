#!/usr/bin/env python3
"""Clone selected remote stations (and a limited movement history) into the local dev MongoDB."""

import argparse
import copy
import datetime as dt
import secrets
import subprocess
import sys
import uuid
from collections import defaultdict
from typing import Dict, List, Tuple

import requests
from pymongo import MongoClient

REMOTE_API = "https://wiediversistmeingarten.org/api"
DEFAULT_STATIONS: Tuple[Tuple[str, str], ...] = (
    ("916c48da-19f6-4af4-80f3-8bf0abef02c7", "Landsitz Lotte"),
    ("6ad61509-788c-4350-8ea1-81d0a1e5bd0a", "TreeMountainView"),
    ("60086d57-6ff7-4382-b988-92de5b76309b", "Kreislehrgarten Steinfurt"),
)
DEFAULT_MAIL = {"adresses": ["import@birdiary.dev"], "notifications": False}
DATABASE_NAME = "birdiary_database"
STATION_COLLECTION = "stations"
DEFAULT_MOVEMENT_LIMIT = 10


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--stations",
        nargs="+",
        help="Station IDs to clone. Defaults to three curated stations if omitted.",
    )
    parser.add_argument(
        "--movements",
        type=int,
        default=DEFAULT_MOVEMENT_LIMIT,
        help="Number of movements to retain per station (default: %(default)s)",
    )
    parser.add_argument(
        "--remote-api",
        default=REMOTE_API,
        help="Base URL of the remote API (default: %(default)s)",
    )
    parser.add_argument(
        "--mongo-uri",
        help="Mongo connection URI (overrides docker port detection)",
    )
    parser.add_argument(
        "--mongo-port",
        type=int,
        help="Host port that forwards to MongoDB (skips docker port lookup)",
    )
    parser.add_argument(
        "--mongo-container",
        default="webserver-mongodb-1",
        help="Name of the MongoDB container to inspect for port mapping",
    )
    parser.add_argument(
        "--skip-environment",
        action="store_true",
        help="Do not copy archived environment measurements (still copies lastEnvironment)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch data but do not write to MongoDB",
    )
    return parser.parse_args()


def resolve_mongo_uri(args: argparse.Namespace) -> str:
    if args.mongo_uri:
        return args.mongo_uri
    host = "localhost"
    if args.mongo_port:
        return f"mongodb://{host}:{args.mongo_port}"
    try:
        output = subprocess.check_output(
            ["docker", "port", args.mongo_container, "27017"],
            text=True,
        ).strip()
        port = output.split(":")[-1]
        return f"mongodb://{host}:{port}"
    except Exception:
        return "mongodb://localhost:27017"


def fetch_station_payload(remote_api: str, station_id: str, movement_limit: int, include_environment: bool) -> Dict:
    params = {"movements": movement_limit}
    if include_environment:
        params["environment"] = "true"
    url = f"{remote_api.rstrip('/')}/station/{station_id}"
    response = requests.get(url, params=params, timeout=60)
    response.raise_for_status()
    return response.json()


def build_station_document(remote_station: Dict, source_api: str) -> Dict:
    allowed_fields = [
        "station_id",
        "location",
        "name",
        "count",
        "sensebox_id",
        "type",
        "advancedSettings",
        "lastEnvironment",
        "lastMovement",
        "lastFeedStatus",
        "stationSoftware",
        "ownerId",
        "createdAt",
    ]
    station_doc = {field: remote_station[field] for field in allowed_fields if field in remote_station}
    station_doc.setdefault("count", {})
    station_doc.setdefault("advancedSettings", {})
    station_doc.setdefault("stationSoftware", "birdiary")
    station_doc.setdefault("type", "observer")
    station_doc["mail"] = copy.deepcopy(DEFAULT_MAIL)
    station_doc["key"] = secrets.token_hex(16)
    station_doc["importMeta"] = {
        "source": source_api,
        "clonedAt": dt.datetime.utcnow().isoformat() + "Z",
    }
    return station_doc


def sync_movements(collection, station_id: str, movements: List[Dict]) -> int:
    target_collection = collection.database[f"movements_{station_id}"]
    target_collection.delete_many({})
    inserted = 0
    if movements:
        target_collection.insert_many(movements)
        inserted = len(movements)
    target_collection.create_index([("start_date", -1)])
    return inserted


def group_environment_measurements(station_id: str, measurements: List[Dict]) -> List[Dict]:
    buckets: Dict[str, List[Dict]] = defaultdict(list)
    for measurement in measurements:
        date_value = measurement.get("date")
        if not date_value:
            continue
        month = str(date_value)[:7]
        buckets[month].append(measurement)
    grouped = []
    for month, entries in buckets.items():
        entries.sort(key=lambda item: item.get("date", ""), reverse=True)
        grouped.append(
            {
                "station_id": station_id,
                "month": month,
                "list_id": str(uuid.uuid4()),
                "measurements": entries,
            }
        )
    return grouped


def sync_environment(collection, station_id: str, measurements: List[Dict]) -> int:
    target_collection = collection.database[f"environments_{station_id}"]
    target_collection.delete_many({})
    grouped_docs = group_environment_measurements(station_id, measurements)
    if grouped_docs:
        target_collection.insert_many(grouped_docs)
    target_collection.create_index([("month", -1)])
    return len(measurements)


def clone_station(
    db,
    station_id: str,
    remote_api: str,
    movement_limit: int,
    include_environment: bool,
    dry_run: bool,
) -> Dict:
    remote_station = fetch_station_payload(remote_api, station_id, movement_limit, include_environment)
    measurements = remote_station.pop("measurements", {}) or {}
    station_doc = build_station_document(remote_station, remote_api)
    summary = {
        "station_id": station_id,
        "name": remote_station.get("name", "unknown"),
        "movements": len(measurements.get("movements", []) or []),
        "environments": len(measurements.get("environment", []) or []),
    }
    if dry_run:
        return summary

    db[STATION_COLLECTION].replace_one({"station_id": station_id}, station_doc, upsert=True)
    inserted_movements = sync_movements(db[STATION_COLLECTION], station_id, measurements.get("movements", []) or [])
    summary["movements"] = inserted_movements
    if include_environment:
        inserted_env = sync_environment(db[STATION_COLLECTION], station_id, measurements.get("environment", []) or [])
        summary["environments"] = inserted_env
    return summary


def main() -> int:
    args = parse_args()
    mongo_uri = resolve_mongo_uri(args)
    stations = args.stations or [station_id for station_id, _ in DEFAULT_STATIONS]
    include_environment = not args.skip_environment

    print(f"Connecting to MongoDB at {mongo_uri} (database: {DATABASE_NAME})")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10_000)
    db = client[DATABASE_NAME]

    summaries = []
    for station_id in stations:
        try:
            summary = clone_station(
                db=db,
                station_id=station_id,
                remote_api=args.remote_api,
                movement_limit=args.movements,
                include_environment=include_environment,
                dry_run=args.dry_run,
            )
            summaries.append(summary)
            print(
                f"✓ {summary['name']} ({summary['station_id']}) -> "
                f"{summary['movements']} movements, {summary['environments']} env measurements"
            )
        except requests.HTTPError as http_error:
            print(f"HTTP error while cloning {station_id}: {http_error}")
        except Exception as exc:  # pragma: no cover (operational script)
            print(f"Failed to clone {station_id}: {exc}")

    if not summaries:
        print("No stations were cloned.")
        return 1

    print("\nImport summary:")
    for summary in summaries:
        print(
            f" - {summary['name']} ({summary['station_id']}): "
            f"{summary['movements']} movements, {summary['environments']} environment entries"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
