# AGENTS.md — Guidance für Agenten in diesem Repo

Dieses Repo ist das **NovaCoreAI-OS** selbst (Team-OS-Plugin für Claude Code,
Namespace `nc:`). Hier wird am OS gearbeitet — nicht an Kundenprojekten.

## Repo-Überblick

| Pfad | Inhalt |
|---|---|
| `skills/` | Core-Skills (`nc-start`, `nc-save-session`, `nc-journal`, `nc-setup`, `nc-update`) |
| `modules/` | Module mit eigenen Skills; `module-registry.json` steuert Aktivierung |
| `hooks/` | `nc-session-start.js`, `nc-safety-gate.js`, `hooks.json` (Plugin-Hook-Konfiguration) |
| `.claude-plugin/plugin.json` | Claude-Code-Plugin-Manifest |
| `setup.js` / `update.js` / `ncos.js` | Setup-, Update- und CLI-Logik (Node, CommonJS) |
| `tests/` | `node:test`-Suiten (Setup-Wiring, Safety-Gate, Plugin-Manifest) |
| `docs/superpowers/specs/` | Design-Spezifikation |

## Regeln für Änderungen

- **Sprache:** Alle Artefakte auf Deutsch (Skills, Doku, Commits, Fehlermeldungen).
- **Tests:** `npm test` muss grün sein, bevor committet wird. Neue Logik zuerst mit Tests absichern (TDD).
- **Versionierung:** `VERSION`, `package.json`, `.claude-plugin/plugin.json` und `modules/module-registry.json` tragen dieselbe SemVer-Version — bei Releases alle vier anheben (die Plugin-Manifest-Tests erzwingen die Übereinstimmung).
- **Skills:** Eine Datei pro Skill (`SKILL.md` mit Frontmatter `name`/`description`), klein halten.
- **Module:** Neue Module unter `modules/<name>/` mit eigener `README.md` und Eintrag in `module-registry.json`.
- **Koexistenz:** Nichts bauen, das Dateien von ECC oder `uni:` anfasst; Hooks müssen ohne `.nc-os`-Marker no-op bleiben.
- **Branching:** Feature-Branch → PR → Review → Merge; kein direkter `main`-Push.

## Befehle

```bash
npm test          # Testsuite (node --test)
node setup.js     # Skills/Hooks lokal deployen
node update.js    # git pull + Setup + Aufräumen
node ncos.js version
```
