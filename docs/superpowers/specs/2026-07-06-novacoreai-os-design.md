# NovaCoreAI-OS — Design-Spezifikation

> **Zweck:** Ein in Claude Code und Kimi Code CLI integrierbares Plugin aus Agents, Skills, Hooks und eigenen Slash Commands für den Workflow einer Softwarefirma.
> **Vorbild:** `C:\Users\LucasVöhringer\Desktop\Devteam-vibecodes` (Team-OS-Ansatz) — aber mit einem gänzlich anderen Use-Case.
> **Sprache aller Artefakte:** Deutsch.
> **Stand:** 2026-07-06 · Version: 0.1.0 · Pflege: Lucas Vöhringer.

---

## 1. Zielsetzung und Kontext

### 1.1 Was gebaut wird

Ein globales Team-OS ("NovaCoreAI-OS", Namespace `nc:`), das in `~/.claude/` und `~/.kimi-code/` installiert wird und in jedem Repo greift. Es besteht aus:

- einem stabilen **Core** (globale Anweisung, gemeinsame Skills/Commands/Hooks, Update-Mechanismus)
- darauf aufbauenden **Modulen** für wiederkehrende Workflows
- optionalen **Sub-Agenten** für komplexe Teilaufgaben

### 1.2 Zielgruppe und Workflows

| Abteilung/Rolle | Workflow |
|---|---|
| Build (Dev + Architektur) | Feature-Lifecycle, Architektur- & Entscheidungsfindung |
| QA / Review / Test | Review-Qualität, Review-Kommentare, Sicherheits-Checks |
| PM / Orga / Management | Projekt-Onboarding / Scoping |
| DevOps / Support | Incident / Debugging / Support |

### 1.3 Unterstützte Technologie-Stacks

Das Plugin ist bewusst **stack-agnostisch** im Core. Stack-spezifische Hilfestellungen für folgende Stacks leben in den Modulen:

- Web / TypeScript / Node
- Python / FastAPI / Django

### 1.4 Wesentliche Schmerzpunkte

- Code-Reviews dauern lang und sind ungleichmäßig.
- Viele manuelle Routinearbeiten (Commits, PRs, Checks, Doku).
- Skill-Lücken und fehlende Erfahrung im Team, insbesondere bei effizientem, sauberem Programmieren.

---

## 2. Lösungsansatz (gewählt)

### 2.1 Übersicht der Ansätze

| Ansatz | Beschreibung | Bewertung |
|---|---|---|
| A — Minimaler MVP | Fokus auf Review-Automatisierung und Routine-Erleichterung | Zu eng, deckt nicht alle vier Workflows ab |
| B — Vollständiges Team-OS von Tag 1 | ~15–20 Skills, alle Module sofort | Zu aufwändig, hohes Risiko halbfertiger Teile |
| **C — Modulare Plattform mit Core + Erweiterungen** | Stabiler Core + nacheinander aktivierbare Module | **Empfohlen:** schneller MVP, skalierbar, stack-agnostisch |

### 2.2 Entscheidung

Gewählt wird **Ansatz C**. Der Core wird zuerst gebaut. Als erstes Modul folgt `feature-lifecycle`. Weitere Module (`review-quality`, `architecture`, `incident-support`) werden iterativ hinzugefügt.

---

## 3. Architektur

### 3.1 Core

Der Core regelt:

- globale Agenten-Anweisung (`nc-sync.md`)
- gemeinsame Skills (`/nc:start`, `/nc:save-session`, `/nc:setup`, `/nc:update`)
- globale Commands
- globale Hooks (SessionStart-Hinweis, Safety/PreToolUse-Gate)
- gemeinsames Memory (`erinnerung/stand.md`, `erinnerung/journal/`)
- Update-/Sync-Mechanismus
- Namespace-Regeln und Modul-Schnittstelle

### 3.2 Module

Module sind eigenständige Einheiten unter `modules/<modul>/`. Jedes Modul enthält:

- eigene Skills (`modules/<modul>/.claude/skills/`)
- eigene Commands (`modules/<modul>/.claude/commands/`)
- eigene Hooks (`modules/<modul>/.claude/hooks/`)
- optionale Sub-Agenten (`modules/<modul>/agents/`)
- eigene `README.md`

### 3.3 Modul-Registry

Die Datei `modules/module-registry.json` listet aktivierte Module, deren Version und minimale Core-Version:

```json
{
  "version": "0.1.0",
  "modules": [
    { "name": "feature-lifecycle", "enabled": true, "minCoreVersion": "0.1.0" },
    { "name": "review-quality", "enabled": true, "minCoreVersion": "0.1.0" },
    { "name": "architecture", "enabled": true, "minCoreVersion": "0.1.0" },
    { "name": "incident-support", "enabled": false, "minCoreVersion": "0.1.0" }
  ]
}
```

Setup-Skripte lesen diese Registry und deployn nur aktivierte Module.

---

## 4. Module, Skills, Commands, Agents und Hooks

### 4.1 Core-Skills und -Commands

| Skill / Command | Zweck |
|---|---|
| `/nc:start` | Session-Start: Kontext laden, Rolle bestimmen, aktives Modul erkennen |
| `/nc:save-session` | Session-Ende: Journal, Stand und Entscheidungen sichern (als Skill und Command verfügbar) |
| `/nc:setup` | Team-OS initial installieren |
| `/nc:update` | Team-OS aktualisieren (git pull + Setup erneut) |

### 4.2 Modul `feature-lifecycle`

| Skill / Command | Zweck |
|---|---|
| `/nc:feature-start` | Anforderung klären, Kontext laden, nächsten Skill empfehlen |
| `/nc:plan` | Task in vertikale, PR-große Slices zerlegen |
| `/nc:commit-prep` | Pre-Commit: Lint/Format/Tests prüfen, Commit-Message vorschlagen |
| `/nc:pr` | PR aus Branch erstellen, Push erst nach Freigabe |

### 4.3 Modul `review-quality`

| Skill / Command | Zweck |
|---|---|
| `/nc:review` | Lokaler Diff oder GitHub-PR reviewen |
| `/nc:review-thread` | Review-Kommentare aufbereiten und Diskussionsfaden zusammenfassen |
| `/nc:security-check` | Sicherheits-Scan: Secrets, RBAC, Input-Validierung |

### 4.4 Modul `architecture`

| Skill / Command | Zweck |
|---|---|
| `/nc:scope` | Neues Projekt/Kundenauftrag scopen, einschätzen, Rahmen festlegen |
| `/nc:decide` | Architekturentscheidung strukturiert vorbereiten und protokollieren |
| `/nc:adr` | ADR / Entscheidungslog-Eintrag schreiben |

### 4.5 Modul `incident-support`

| Skill / Command | Zweck |
|---|---|
| `/nc:debug` | Systematisches Debugging: Hypothesen, Logs, Repro, Fix |
| `/nc:incident-log` | Post-Mortem / Incident-Eintrag dokumentieren |

### 4.6 Sub-Agenten

| Agent | Zweck | Einsatz durch |
|---|---|---|
| `reviewer` | Unabhängiger Code-Review-Sub-Agent | `/nc:review` |
| `debugger` | Tiefer Debug-Agent für komplexe Fehler | `/nc:debug` |
| `scoper` | Projekt-Scoping und Schätzung | `/nc:scope` |

### 4.7 Hooks

| Hook | Event | Zweck |
|---|---|---|
| `nc-session-start` | SessionStart | Begrüßung, Hinweis auf `/nc:start`, Versionscheck |
| `nc-safety-gate` | PreToolUse (Bash, Edit/Write) | Faktennennung vor destruktiven Aktionen |

---

## 5. Datenfluss

1. **Session-Start:** `/nc:start` lädt `erinnerung/stand.md`, ermittelt Git-Status, Rollenmodus und aktives Modul.
2. **Task-Start:** Nutzer ruft Modul-Skill auf (z.B. `/nc:feature-start`). Skill liest Projekt-/Repo-Kontext.
3. **Arbeitsphase:** Modul-Skills orchestrieren Agenten, Skills und ggf. Sub-Agenten.
4. **Protokollierung:** Ergebnisse werden append-only in `erinnerung/journal/<datum>.md` geschrieben.
5. **Abschluss:** `/nc:save-session` aktualisiert `stand.md`, schreibt Journal-Eintrag, sichert Entscheidungen.
6. **Update:** `uniplugin update` holt neuesten Stand und installiert Skills/Commands/Hooks neu.

---

## 6. Technische Implementierungs-Skizze

### 6.1 Setup und Deploy

- `setup.sh` / `setup.ps1` für Claude Code
- `setup-kimi.sh` / `setup-kimi.ps1` für Kimi Code CLI
- Optional später: `setup-codex.sh` / `setup-codex.ps1` für Codex CLI

Setup-Skripte:

- deployn Core-Skills und aktivierte Modul-Skills
- deployn Core-Commands und Modul-Commands
- deployn Core-Hooks und Modul-Hooks
- fügen `nc-sync.md` in die jeweilige globale Anweisung ein

### 6.2 Globale Installation

- Claude Code: `~/.claude/skills/nc/`, `~/.claude/commands/`, `~/.claude/hooks/`, `@import` in `~/.claude/CLAUDE.md`
- Kimi Code CLI: `~/.kimi-code/skills/`, Commands als Skills, `nc-sync.md` in `~/.kimi-code/AGENTS.md`, Hooks in `~/.kimi-code/config.toml`

### 6.3 Update-Mechanismus

`update.sh` / `update.ps1` führen aus:

1. `git pull`
2. Setup-Skript erneut ausführen
3. Gelöschte Skills/Commands/Hooks aus der Quelle entfernen

`uniplugin` ist ein globaler CLI-Befehl, der `update`, `setup` und `version` anbietet.

---

## 7. Dateistruktur

```text
NovaCoreAI-OS/
├── nc-sync.md                          # Globale Agenten-Anweisung
├── AGENTS.md                           # Guidance für Agenten, die in diesem Repo arbeiten
├── README.md                           # Gesamtübersicht
├── ONBOARDING.md                       # Ersteinrichtung
├── VERSION                             # SemVer
├── setup.sh / setup.ps1                # Claude-Setup
├── setup-kimi.sh / setup-kimi.ps1      # Kimi-Setup
├── update.sh / update.ps1              # Update
├── uniplugin.sh / uniplugin.ps1        # Globaler CLI-Befehl
├── install-cli.sh / install-cli.ps1    # Installiert `uniplugin` global
├── modules/
│   ├── module-registry.json
│   ├── feature-lifecycle/
│   │   ├── README.md
│   │   └── .claude/
│   │       ├── skills/
│   │       │   ├── nc-feature-start/SKILL.md
│   │       │   ├── nc-plan/SKILL.md
│   │       │   ├── nc-commit-prep/SKILL.md
│   │       │   └── nc-pr/SKILL.md
│   │       └── commands/
│   │           ├── nc-feature-start.md
│   │           ├── nc-plan.md
│   │           ├── nc-commit-prep.md
│   │           └── nc-pr.md
│   ├── review-quality/
│   ├── architecture/
│   └── incident-support/
├── .claude/
│   ├── skills/
│   │   ├── nc-start/SKILL.md
│   │   ├── nc-save-session/SKILL.md
│   │   ├── nc-setup/SKILL.md
│   │   └── nc-update/SKILL.md
│   ├── commands/
│   │   ├── nc-start.md
│   │   ├── nc-save-session.md
│   │   ├── nc-setup.md
│   │   └── nc-update.md
│   └── hooks/
│       ├── nc-session-start.js
│       └── nc-safety-gate.js
├── erinnerung/
│   ├── README.md
│   ├── stand.md
│   └── journal/
└── tests/
    ├── setup-wiring.test.js
    └── safety-gate.test.js
```

---

## 8. Error Handling, Safety und Conventions

### 8.1 Error Handling

- Skills fragen nach, statt zu raten.
- Bei fehlendem Kontext wird auf `/nc:start` zurückgegriffen.
- Sub-Agenten erhalten präzise Aufgabenstellungen und liefern strukturierte Ergebnisse.

### 8.2 Safety

- Keine automatischen Posts, Pushes, Merges oder Deployments ohne explizite Nutzerfreigabe.
- Destruktive Aktionen verlangen Faktennennung und wörtliches Zitat.
- Safety-Gate blockt Bash/Edit/Write bis der Nutzer den Kontext benannt hat.

### 8.3 Conventions

- Deutsche Sprache für alle Artefakte.
- Klare Skill-Namen im Namespace `nc:`.
- Kleine Markdown-Dateien, eine Datei pro Skill.
- Append-only Journal.
- Feature-Branch → PR → Review → Merge; kein direkter `main`-Push.

---

## 9. Teststrategie

| Test-Art | Zweck |
|---|---|
| Setup-Wiring-Tests | Prüfen, ob Skills/Commands/Hooks korrekt deployt werden |
| Safety-Gate-Tests | Prüfen, ob das Gate korrekt blockt und durchlässt |
| Skill-Manual-Tests | Testläufe in Beispiel-Repos mit Claude und Kimi |
| Modul-Akzeptanztests | Prüfen, ob ein Modul seinen Workflow vollständig abdeckt |

---

## 10. MVP-Scope

Die erste Iteration umfasst:

1. Core mit `/nc:start`, `/nc:save-session`, `/nc:setup`, `/nc:update`
2. Safety-Gate-Hook
3. Modul `feature-lifecycle` mit `/nc:feature-start`, `/nc:plan`, `/nc:commit-prep`, `/nc:pr`
4. Setup-Skripte für Claude Code und Kimi Code CLI
5. `uniplugin`-CLI
6. Basis-Tests für Setup und Gate

Weitere Module, Sub-Agenten, Codex-Support und erweiterte Hooks folgen iterativ.

---

## 11. Abgrenzung zum Vorbild

`Devteam-vibecodes` ist ein **akademisches Backend-Projekt** (Vereisungswarnung, FastAPI/Python, feste Rollen in einer Hochschulgruppe). Dieses Plugin ist für eine **kommerzielle Softwarefirma** gedacht:

- Stack-agnostisch (TypeScript/Node *und* Python)
- Workflow-Abdeckung über reine Backend-Entwicklung hinaus (Review, Architektur, Incidents)
- Modular erweiterbar statt eines festen Skill-Kanons
- Fokus auf Code-Review-Qualität, Routineautomatisierung und Wissenslücken im Team

---

## 12. Offene Punkte

- Keine.

---

*Spec-Version: 0.1.0 · Letzte Aktualisierung: 2026-07-06 · Verantwortlich: Lucas Vöhringer*
