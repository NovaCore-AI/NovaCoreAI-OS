# NovaCoreAI-OS

Team-OS-Plugin für **Claude Code** (und später Kimi Code CLI): Skills, Hooks und
Commands im Namespace `nc:` für den Workflow einer Softwarefirma — Feature-Lifecycle,
Session-Memory und Safety-Gate.

> Design-Spezifikation: [`docs/superpowers/specs/2026-07-06-novacoreai-os-design.md`](docs/superpowers/specs/2026-07-06-novacoreai-os-design.md)

## Architektur

- **Core:** globale Anweisung (`nc-sync.md`), Core-Skills, Hooks, Setup/Update
- **Module:** eigenständige Einheiten unter `modules/<modul>/`, gesteuert über `modules/module-registry.json`
- **Memory:** pro Arbeits-Repo unter `.nc/erinnerung/` (Stand + append-only Journal), nie im OS-Repo

## Skills (v0.1.0)

| Skill | Zweck |
|---|---|
| `/nc:start` | Session-Start: Kontext laden, aktives Modul erkennen |
| `/nc:save-session` | Session-Ende: Journal, Stand und Entscheidungen sichern |
| `/nc:setup` | Team-OS initial installieren |
| `/nc:update` | Team-OS aktualisieren |
| `/nc:feature-start` | Anforderung klären, Kontext laden, nächsten Skill empfehlen |
| `/nc:plan` | Task in vertikale, PR-große Slices zerlegen |
| `/nc:commit-prep` | Pre-Commit: Checks prüfen, Commit-Message vorschlagen |
| `/nc:pr` | PR aus Branch erstellen, Push erst nach Freigabe |

## Hooks

| Hook | Event | Verhalten |
|---|---|---|
| `nc-session-start` | SessionStart | Begrüßung + `/nc:start`-Hinweis — nur in Repos mit `.nc-os`-Marker |
| `nc-safety-gate` | PreToolUse (Bash) | Verlangt Faktennennung vor destruktiven Befehlen — nur in `.nc-os`-Repos |

## Installation

```bash
./setup.sh          # oder: node setup.js  (Windows: setup.ps1)
./install-cli.sh    # installiert den globalen Befehl `ncos`
```

Das Setup stagt die Dateien nach `~/.nc-os/plugin/` und registriert das
Plugin anschließend bei Claude Code (`claude plugin marketplace add` +
`claude plugin install novacoreai-os@novacoreai`). Ohne diese Registrierung
lädt Claude Code das Plugin nicht — bei fehlgeschlagener Registrierung nennt
das Setup die manuellen Befehle.

Danach pro Arbeits-Repo: `.nc-os`-Marker anlegen und `.nc/` in `.gitignore`
eintragen (Details: [ONBOARDING.md](ONBOARDING.md)).

## Update

```bash
ncos update         # git pull + Neu-Deploy + Aufräumen verwaister Dateien
```

## Entwicklung

```bash
npm test            # node:test-Suiten (Setup-Wiring, Safety-Gate, Plugin-Manifest)
```

## Koexistenz

NovaCoreAI-OS kollidiert nicht mit `uni:` oder ECC: eigener Namespace `nc:`,
eigenes Deploy-Manifest (`~/.nc-os/installed-manifest.json`) und Repo-Scoping
über den `.nc-os`-Marker — außerhalb markierter Repos sind alle Hooks no-op.

---

*Version 0.1.0 · Pflege: Lucas Vöhringer · Sprache aller Artefakte: Deutsch*
