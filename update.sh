#!/usr/bin/env bash
# Dünner Wrapper: ruft die zentrale Update-Logik (Node) auf.
set -euo pipefail
cd "$(dirname "$0")"
exec node update.js "$@"
