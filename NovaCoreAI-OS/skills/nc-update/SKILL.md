---
name: nc-update
description: NovaCoreAI-OS aktualisieren — holt den neuesten Stand des OS-Repos und deployt Skills/Hooks neu, entfernt verwaiste Dateien anhand des Deploy-Manifests. Nutze diesen Skill, wenn eine neue OS-Version verfügbar ist.
---

# /nc:update — Team-OS aktualisieren

## Zweck

Bringt eine bestehende NovaCoreAI-OS-Installation auf den neuesten Stand,
ohne Fremddateien (ECC, uni:, User-Dateien) zu berühren.

## Ablauf

1. **Update ausführen:** Im OS-Repo `node update.js` starten (oder `ncos update`).
   Das Skript führt aus:
   1. `git pull` im OS-Repo
   2. Setup-Logik erneut (Skills/Hooks deployen)
   3. Entfernen gelöschter Skills/Hooks anhand `~/.nc-os/installed-manifest.json`
2. **Version prüfen:** `ncos version` bzw. Inhalt der Datei `VERSION` mit dem erwarteten Release vergleichen.
3. **Warnungen behandeln:** Übersprungene Module (z.B. `minCoreVersion` höher als Core-Version) melden und ggf. Core zuerst aktualisieren.

## Regeln

- Update entfernt ausschließlich Dateien, die im Deploy-Manifest von NovaCoreAI-OS geführt sind.
- Bei einem fehlgeschlagenen `git pull` (z.B. lokale Änderungen) abbrechen und nachfragen.
