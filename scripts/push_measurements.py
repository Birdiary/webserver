#!/usr/bin/env python3
"""Send synthetic environment (and optional feed) updates to a Birdiary API."""

import argparse
import random
import sys
import time
from datetime import datetime, timedelta
from typing import Tuple

import requests

DEFAULT_URL = "http://localhost:8080"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=DEFAULT_URL, help="Base URL of the API (default: %(default)s)")
    parser.add_argument("--station", required=True, help="Station ID to target")
    parser.add_argument("--samples", type=int, default=10, help="Number of measurements to send (default: %(default)s)")
    parser.add_argument(
        "--interval-ms",
        type=int,
        default=250,
        help="Sleep this many milliseconds between requests (default: %(default)s)",
    )
    parser.add_argument("--seed", type=int, help="Seed for the random generator (optional)")
    feed_toggle = parser.add_mutually_exclusive_group()
    feed_toggle.add_argument("--feed", dest="send_feed", action="store_true", help="Send feed payloads as well")
    feed_toggle.add_argument("--no-feed", dest="send_feed", action="store_false", help="Only send environment payloads")
    parser.add_argument("--feed-min", type=float, default=0.0, help="Minimum feed level/value (default: %(default)s)")
    parser.add_argument("--feed-max", type=float, default=100.0, help="Maximum feed level/value (default: %(default)s)")
    parser.set_defaults(send_feed=True)
    return parser.parse_args()


def build_environment_payload(offset_minutes: int) -> dict:
    timestamp = datetime.utcnow() - timedelta(minutes=offset_minutes)
    return {
        "date": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "temperature": round(random.uniform(-10, 35), 2),
        "humidity": round(random.uniform(20, 98), 2),
    }


def build_feed_payload(date_str: str, min_value: float, max_value: float) -> dict:
    return {
        "date": date_str,
        "silolevel": round(random.uniform(min_value, max_value), 2),
    }


def post_json(url: str, payload: dict) -> Tuple[int, str]:
    response = requests.post(url, json=payload, timeout=30)
    snippet = response.text.strip().replace("\n", " ")
    if len(snippet) > 200:
        snippet = snippet[:197] + "..."
    return response.status_code, snippet


def main() -> int:
    args = parse_args()
    if args.seed is not None:
        random.seed(args.seed)
    if args.feed_min > args.feed_max:
        print("feed-min cannot be greater than feed-max", file=sys.stderr)
        return 1

    samples = max(1, args.samples)
    interval = max(0, args.interval_ms) / 1000
    base_url = args.url.rstrip("/")
    env_endpoint = f"{base_url}/api/environment/{args.station}"
    feed_endpoint = f"{base_url}/api/feed/{args.station}"

    print(f"Sending {samples} environment payloads to {env_endpoint}")
    if args.send_feed:
        print(f"Feed payloads enabled ({feed_endpoint})")

    for i in range(samples):
        payload = build_environment_payload(i)
        try:
            status, snippet = post_json(env_endpoint, payload)
            print(f"ENV #{i+1:02d} [{status}]: {snippet}")
        except Exception as exc:  # pragma: no cover
            print(f"ENV #{i+1:02d} failed: {exc}")
            return 1

        if args.send_feed:
            feed_payload = build_feed_payload(payload["date"], args.feed_min, args.feed_max)
            try:
                status, snippet = post_json(feed_endpoint, feed_payload)
                print(f"FEED#{i+1:02d} [{status}]: {snippet}")
            except Exception as exc:  # pragma: no cover
                print(f"FEED#{i+1:02d} failed: {exc}")
                return 1

        if interval:
            time.sleep(interval)

    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
