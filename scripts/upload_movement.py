#!/usr/bin/env python3
"""Upload a single movement (audio + video + metadata) to a Birdiary API."""

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Tuple

import requests

DEFAULT_URL = "http://localhost:8080"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=DEFAULT_URL, help="Base URL of the API (default: %(default)s)")
    parser.add_argument("--station", required=True, help="Station ID to target")
    parser.add_argument("--audio", required=True, type=Path, help="Path to a WAV/MP3 recording")
    parser.add_argument("--video", required=True, type=Path, help="Path to an MP4/AVI video")
    parser.add_argument(
        "--weight", type=float, default=0.0, help="Movement weight value to store (default: %(default)s)"
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=30,
        help="Length of the movement in seconds; end time is start time + duration (default: %(default)s)",
    )
    parser.add_argument(
        "--start",
        type=str,
        default=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        help="Start timestamp (UTC) in '%Y-%m-%d %H:%M:%S' format (default: now)",
    )
    parser.add_argument("--temperature", type=float, default=12.3, help="Environment temperature (default: %(default)s)")
    parser.add_argument("--humidity", type=float, default=55.0, help="Environment humidity (default: %(default)s)")
    parser.add_argument("--apikey", help="Optional API key to append as ?apikey=... to the URL")
    return parser.parse_args()


def build_payload(args: argparse.Namespace) -> Dict:
    start_time = datetime.strptime(args.start, "%Y-%m-%d %H:%M:%S")
    end_time = start_time + timedelta(seconds=max(0, args.duration))
    return {
        "start_date": start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "end_date": end_time.strftime("%Y-%m-%d %H:%M:%S"),
        "weight": args.weight,
        "audio": "audio",  # must match the key used in files={...}
        "video": "video",
        "environment": {
            "date": start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "temperature": args.temperature,
            "humidity": args.humidity,
        },
    }


def open_binary(path: Path, mime: str) -> Tuple[str, object, str]:
    try:
        file_handle = path.open("rb")
    except OSError as exc:
        raise SystemExit(f"Failed to open {path}: {exc}")
    return (path.name, file_handle, mime)


def post_movement(args: argparse.Namespace) -> int:
    base_url = args.url.rstrip("/")
    endpoint = f"{base_url}/api/movement/{args.station}"
    if args.apikey:
        endpoint = f"{endpoint}?apikey={args.apikey}"

    payload = build_payload(args)
    files = {
        "audio": open_binary(args.audio, "audio/wav"),
        "video": open_binary(args.video, "video/mp4"),
    }
    data = {"json": json.dumps(payload)}

    print(f"Uploading movement to {endpoint}")
    response = requests.post(endpoint, data=data, files=files, timeout=120)

    # Close file handles eagerly regardless of status
    for file_tuple in files.values():
        file_tuple[1].close()

    if response.status_code != 200:
        print(f"Request failed ({response.status_code}): {response.text}")
        return 1

    try:
        body = response.json()
    except ValueError:
        body = response.text
    print("Server response:", body)
    return 0


def main() -> int:
    args = parse_args()
    return post_movement(args)


if __name__ == "__main__":
    sys.exit(main())
