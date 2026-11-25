#!/bin/sh
# Build the single-file site from the topics.
set -e
cd "$(dirname "$0")"
python3 build.py
