# NovaCoreAI-OS

Team-OS-Plugin für **Claude Code** (und später Kimi Code CLI): Skills, Hooks und
Commands im Namespace `nc:` für den Workflow einer Softwarefirma — Feature-Lifecycle,
Session-Memory und Safety-Gate.

> Design-Spezifikation: [`docs/superpowers/specs/2026-07-06-novacoreai-os-design.md`](docs/superpowers/specs/2026-07-06-novacoreai-os-design.md)

## Architektur

- **Core:** globale Anweisung (`nc-sync.md`), Core-Skills, Hooks, Setup/Update
- **Module:** eigenständige Einheiten unter `modules/<modul>/`, gesteuert über `modules/module-registry.json`
- **Memory:** pro Arbeits-Repo unter `.nc/erinnerung/` (Stand + append-only Journal), nie im OS-Repo

## Skills (v0.1.1)

| Skill | Zweck |
|---|---|
| `/nc:start` | Core | Session-Start: Kontext laden, aktives Modul erkennen |
| `/nc:save-session` | Core | Session-Ende: Journal, Stand und Entscheidungen sichern |
| `/nc:journal` | Core | Tages-Journal-Eintrag entwerfen (Git + optional Jira), Team- oder persönlicher Modus |
| `/nc:setup` | Core | Team-OS initial installieren |
| `/nc:update` | Core | Team-OS aktualisieren |
| `/nc:flc-feature-start` | FLC | Anforderung klären, Kontext laden, nächsten Skill empfehlen |
| `/nc:flc-plan` | FLC | Task in vertikale, PR-große Slices zerlegen |
| `/nc:flc-commit-prep` | FLC | Pre-Commit: Checks prüfen, Commit-Message vorschlagen |
| `/nc:flc-pr` | FLC | PR aus Branch erstellen, Push erst nach Freigabe |

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

Windows / PowerShell:

```powershell
.\setup.ps1         # Staging + Claude-Code-Registrierung
.\install-cli.ps1   # erzeugt den ncos.cmd-Shim unter ~\.nc-os\bin
                    # (Verzeichnis einmalig in den User-PATH aufnehmen —
                    #  der Installer nennt den fertigen Befehl)
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

Windows / PowerShell: `.\update.ps1` (identische Logik; `ncos update`
funktioniert ebenfalls, sobald der `install-cli.ps1`-Shim im PATH liegt).
Hinweis: `ncos update` deployt nur — die einmalige Claude-Code-Registrierung
übernimmt das Setup (`node setup.js`), nicht das Update.

## Entwicklung

```bash
npm test            # node:test-Suiten (Setup-Wiring, Safety-Gate, Plugin-Manifest)
```

## Koexistenz

NovaCoreAI-OS kollidiert nicht mit `uni:` oder ECC: eigener Namespace `nc:`,
eigenes Deploy-Manifest (`~/.nc-os/installed-manifest.json`) und Repo-Scoping
über den `.nc-os`-Marker — außerhalb markierter Repos sind alle Hooks no-op.

---

*Version 0.1.1 · Pflege: Lucas Vöhringer · Sprache aller Artefakte: Deutsch*
