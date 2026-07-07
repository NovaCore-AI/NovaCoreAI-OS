# NovaCoreAI-OS

Team-OS-Plugin für **Claude Code** (und später Kimi Code CLI): Skills, Hooks
und Commands im Namespace `nc:` für den Workflow einer Softwarefirma —
Feature-Lifecycle, Session-Memory und Safety-Gate.

## Repo-Layout

| Pfad | Inhalt |
|---|---|
| [`NovaCoreAI-OS/`](NovaCoreAI-OS/) | Das Plugin selbst: Skills, Hooks, Module, Setup/Update-Tooling — **Details in der [Plugin-README](NovaCoreAI-OS/README.md)** |
| [`docs/`](docs/) | Design-Spezifikationen (superpowers) |

## Quickstart

```bash
cd NovaCoreAI-OS
./setup.sh          # oder: node setup.js  (Windows: .\setup.ps1)
./install-cli.sh    # globaler Befehl `ncos`  (Windows: .\install-cli.ps1)
```

Das Setup stagt nach `~/.nc-os/plugin/` und registriert das Plugin bei
Claude Code (`claude plugin marketplace add` + `claude plugin install
novacoreai-os@novacoreai`). Danach pro Arbeits-Repo den Marker anlegen:
`touch .nc-os` — außerhalb markierter Repos sind alle nc-Hooks no-op.

Update: `ncos update` (bzw. `.\update.ps1`). Onboarding neuer Repos:
[`NovaCoreAI-OS/ONBOARDING.md`](NovaCoreAI-OS/ONBOARDING.md).

---

*Version 0.1.0 · Pflege: Lucas Vöhringer · Sprache aller Artefakte: Deutsch*
