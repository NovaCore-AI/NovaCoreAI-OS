#!/usr/bin/env bash
# Installiert den globalen Terminal-Befehl `ncos` (Symlink auf ncos.js).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
BIN_DIR="${NCOS_BIN_DIR:-$HOME/.local/bin}"

mkdir -p "$BIN_DIR"
chmod +x "$REPO_ROOT/ncos.js"
ln -sf "$REPO_ROOT/ncos.js" "$BIN_DIR/ncos"

echo "ncos installiert: $BIN_DIR/ncos -> $REPO_ROOT/ncos.js"

case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *)
    echo "HINWEIS: $BIN_DIR ist nicht im PATH. Ergänze z.B. in ~/.zshrc:"
    echo "  export PATH=\"$BIN_DIR:\$PATH\""
    ;;
esac
