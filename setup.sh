#!/usr/bin/env bash
# Dünner Wrapper: ruft die zentrale Setup-Logik (Node) auf.
set -euo pipefail
cd "$(dirname "$0")"
exec node setup.js "$@"
