# NovaCoreAI-OS — Design-Spezifikation

> **Zweck:** Ein in Claude Code und Kimi Code CLI integrierbares Plugin aus Agents, Skills, Hooks und eigenen Slash Commands für den Workflow einer Softwarefirma.
> **Vorbild:** `C:\Users\LucasVöhringer\Desktop\Devteam-vibecodes` (Copy-Deploy-Team-OS) — aber mit einem gänzlich anderen Use-Case.
> **Sprache aller Artefakte:** Deutsch.
> **Stand:** 2026-07-06 · Version: 0.1.0 · Pflege: Lucas Vöhringer.

---

## 1. Zielsetzung und Kontext

### 1.1 Was gebaut wird

Ein Team-OS ("NovaCoreAI-OS", Namespace `nc:`), das Skills, Hooks und Commands für Claude Code und Kimi Code CLI bereitstellt. Es besteht aus:

- einem stabilen **Core** (globale Anweisung, gemeinsame Skills, Hooks, Update-Mechanismus)
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

Das Plugin ist bewusst **stack-agnostisch** im Core. Stack-spezifische Hilfestellungen für folgende Stacks werden später als eigene Module ergänzt:

- Web / TypeScript / Node
- Python / FastAPI / Django

Für den MVP (v0.1.0) gibt es keine stack-spezifischen Module. Die Skills arbeiten repo- und stack-agnostisch.

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
| C — Modulare Plattform mit Core + Erweiterungen | Stabiler Core + nacheinander aktivierbare Module | **Empfohlen:** schneller MVP, skalierbar, stack-agnostisch |
| D — Eigenbau vs. ECC/Fertiglösung | ECC oder ein anderes fertiges System + dünner Firmen-Layer | Nicht passend: bestehende Systeme decken weder den firmenspezifischen Workflow noch die Modularität ab |

### 2.2 Entscheidung: Plugin-Mechanik

Claude Code bietet ein echtes Plugin-System (`.claude-plugin/plugin.json`, Marketplace-Installation). Kimi Code CLI hat kein vergleichbares Plugin-System und arbeitet mit direktem Copy-Deploy nach `~/.kimi-code/`.

Daher:

- **Claude Code:** echtes Plugin über `.claude-plugin/plugin.json` mit Namespace `nc:`
- **Kimi Code CLI:** Copy-Deploy der Skills nach `~/.kimi-code/skills/` (kein separater Command-Mechanismus)

Diese Entscheidung betrifft primär den Setup-Pfad; der Quellcode der Skills bleibt identisch.

### 2.3 Entscheidung: Modulare Plattform

Gewählt wird **Ansatz C**. Der Core wird zuerst gebaut. Als erstes Modul folgt `feature-lifecycle`. Weitere Module (`review-quality`, `architecture`, `incident-support`) werden iterativ hinzugefügt.

---

## 3. Architektur

### 3.1 Core

Der Core regelt:

- globale Agenten-Anweisung (`nc-sync.md`)
- gemeinsame Skills (`/nc:start`, `/nc:save-session`, `/nc:setup`, `/nc:update`)
- globale Hooks (SessionStart-Hinweis, Safety/PreToolUse-Gate)
- gemeinsames Memory-Konzept
- Update-/Sync-Mechanismus
- Namespace-Regeln und Modul-Schnittstelle

### 3.2 Module

Module sind eigenständige Einheiten unter `modules/<modul>/`. Jedes Modul enthält:

- eigene Skills (`modules/<modul>/skills/`)
- optionale eigene Hooks (`modules/<modul>/hooks/`)
- optionale Sub-Agenten (`modules/<modul>/agents/`)
- eigene `README.md`

### 3.3 Modul-Registry

Die Datei `modules/module-registry.json` listet aktivierte Module, deren Version und minimale Core-Version:

```json
{
  "version": "0.1.0",
  "modules": [
    { "name": "feature-lifecycle", "enabled": true, "minCoreVersion": "0.1.0" },
    { "name": "review-quality", "enabled": false, "minCoreVersion": "0.1.0" },
    { "name": "architecture", "enabled": false, "minCoreVersion": "0.1.0" },
    { "name": "incident-support", "enabled": false, "minCoreVersion": "0.1.0" }
  ]
}
```

Setup/Update liest diese Registry und aktiviert nur `enabled: true`-Module. Die `minCoreVersion`-Prüfung erfolgt im Setup/Update-Skript.

---

## 4. Module, Skills, Agents und Hooks

### 4.1 Core-Skills

| Skill | Zweck |
|---|---|
| `/nc:start` | Session-Start: Kontext laden, aktives Modul erkennen |
| `/nc:save-session` | Session-Ende: Journal, Stand und Entscheidungen sichern |
| `/nc:setup` | Team-OS initial installieren |
| `/nc:update` | Team-OS aktualisieren |

**Rollen:** Im MVP wird kein Rollen-Konzept umgesetzt. `/nc:start` lädt den Projekt- und Session-Kontext, ohne eine Abteilung/Rolle explizit zu bestimmen. Rollen werden in einer späteren Iteration ergänzt, falls nötig.

### 4.2 Modul `feature-lifecycle`

| Skill | Zweck |
|---|---|
| `/nc:flc-feature-start` | Anforderung klären, Kontext laden, nächsten Skill empfehlen |
| `/nc:flc-plan` | Task in vertikale, PR-große Slices zerlegen |
| `/nc:flc-commit-prep` | Pre-Commit: Lint/Format/Tests prüfen, Commit-Message vorschlagen |
| `/nc:flc-pr` | PR aus Branch erstellen, Push erst nach Freigabe |

### 4.3 Modul `review-quality`

| Skill | Zweck |
|---|---|
| `/nc:review` | Lokaler Diff oder GitHub-PR reviewen |
| `/nc:review-thread` | Review-Kommentare aufbereiten und Diskussionsfaden zusammenfassen |
| `/nc:security-check` | Sicherheits-Scan: Secrets, RBAC, Input-Validierung |

### 4.4 Modul `architecture`

| Skill | Zweck |
|---|---|
| `/nc:scope` | Neues Projekt/Kundenauftrag scopen, einschätzen, Rahmen festlegen |
| `/nc:decide` | Architekturentscheidung strukturiert vorbereiten und protokollieren |
| `/nc:adr` | ADR / Entscheidungslog-Eintrag schreiben |

### 4.5 Modul `incident-support`

| Skill | Zweck |
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
| `nc-session-start` | SessionStart | Begrüßung, Hinweis auf `/nc:start`, Versionscheck — nur aktiv, wenn `.nc-os`-Marker im Repo vorhanden |
| `nc-safety-gate` | PreToolUse (Bash) | Faktennennung vor destruktiven Aktionen — nur aktiv, wenn `.nc-os`-Marker im Repo vorhanden |

---

## 5. Datenfluss und Memory-Ort

### 5.1 Memory-Ort

NovaCoreAI-OS arbeitet in mehreren Kunden-Repos. Um Vertraulichkeit zu wahren und Kundenkontext vom OS-Repo zu trennen, wird das Memory **pro Arbeits-Repo** unter `.nc/erinnerung/` abgelegt:

- `.nc/erinnerung/stand.md` — konsolidierter Gesamtstand des Repos
- `.nc/erinnerung/journal/<datum>.md` — append-only Tagesprotokoll

Das zentrale OS-Repo (`NovaCoreAI-OS`) enthält nur ein Template/Beispiel, keine echten Session-Daten.

`.nc/` wird in `.gitignore` des Arbeits-Repos eingetragen, damit Kunden-Interna nicht committet werden.

### 5.2 Datenfluss

1. **Session-Start:** `/nc:start` prüft `.nc-os`-Marker, lädt `.nc/erinnerung/stand.md`, ermittelt Git-Status und aktives Modul.
2. **Task-Start:** Nutzer ruft Modul-Skill auf (z.B. `/nc:flc-feature-start`). Skill liest Projekt-/Repo-Kontext.
3. **Arbeitsphase:** Modul-Skills orchestrieren Agenten, Skills und ggf. Sub-Agenten.
4. **Protokollierung:** Ergebnisse werden append-only in `.nc/erinnerung/journal/<datum>.md` geschrieben.
5. **Abschluss:** `/nc:save-session` aktualisiert `.nc/erinnerung/stand.md`, schreibt Journal-Eintrag, sichert Entscheidungen.
6. **Update:** `ncos update` holt neuesten Stand des OS-Repos und installiert Skills/Hooks neu.

---

## 6. Technische Implementierungs-Skizze

### 6.1 Voraussetzungen

- **Node.js** (v18+) ist Voraussetzung für Hooks und Tests.
- **Claude Code** für Plugin-Betrieb.
- **Kimi Code CLI** für Kimi-Setup (optional, Iteration 2).

### 6.2 Setup und Deploy

Die Setup-Logik wird zentral in Node.js implementiert. `setup.sh` / `setup.ps1` sind dünne Wrapper, die das Node-Skript aufrufen.

**Claude Code Plugin:**

- Quelle: `.claude-plugin/plugin.json`
- Skills: `skills/<name>/SKILL.md` (flat, je Skill ein Ordner)
- Hooks: `hooks/<hook-name>.js`
- Installation: Marketplace oder lokale Entwicklerinstallation

**Kimi Code CLI:**

- Copy-Deploy der Skills nach `~/.kimi-code/skills/<name>/SKILL.md`
- Copy-Deploy der Hooks nach `~/.kimi-code/hooks/`
- Eintrag in `~/.kimi-code/AGENTS.md`

### 6.3 Globale Installation

- **Claude Code:** Plugin-Verzeichnis unter `~/.claude/plugins/novacoreai-os/` oder Entwickler-Plugin-Pfad
- **Kimi Code CLI:** `~/.kimi-code/skills/`, `~/.kimi-code/hooks/`, `~/.kimi-code/AGENTS.md`

### 6.4 Update-Mechanismus

`ncos update` führt aus:

1. `git pull` im OS-Repo
2. Setup-Skript erneut ausführen
3. Gelöschte Skills/Hooks anhand des Deploy-Manifests entfernen

Das Deploy-Manifest (`~/.nc-os/installed-manifest.json`) führt alle von NovaCoreAI-OS deployten Dateien, damit Update sie sauber entfernen kann, ohne User-Dateien oder andere Systeme (ECC, uni) zu berühren.

### 6.5 CLI-Befehl

Der globale Terminal-Befehl heißt `ncos` (nicht `uniplugin`, um Kollisionen mit `uni:` zu vermeiden):

- `ncos setup` — Erstinstallation
- `ncos update` — Aktualisierung
- `ncos version` — Version anzeigen

---

## 7. Dateistruktur

```text
NovaCoreAI-OS/
├── nc-sync.md                          # Globale Agenten-Anweisung
├── AGENTS.md                           # Guidance für Agenten, die in diesem Repo arbeiten
├── README.md                           # Gesamtübersicht
├── ONBOARDING.md                       # Ersteinrichtung
├── VERSION                             # SemVer
├── package.json                        # Node-Abhängigkeiten, Scripts, Test-Runner
├── setup.js                            # Zentrale Setup-Logik (Node)
├── setup.sh / setup.ps1                # Dünne Wrapper für setup.js
├── update.js                           # Zentrale Update-Logik (Node)
├── update.sh / update.ps1              # Dünne Wrapper für update.js
├── ncos.js                             # CLI-Implementierung
├── install-cli.sh / install-cli.ps1    # Installiert `ncos` global
├── .claude-plugin/
│   └── plugin.json                     # Claude-Code-Plugin-Manifest
├── modules/
│   ├── module-registry.json
│   ├── feature-lifecycle/
│   │   ├── README.md
│   │   └── skills/
│   │       ├── nc-feature-start/SKILL.md
│   │       ├── nc-plan/SKILL.md
│   │       ├── nc-commit-prep/SKILL.md
│   │       └── nc-pr/SKILL.md
│   ├── review-quality/
│   ├── architecture/
│   └── incident-support/
├── skills/
│   ├── nc-start/SKILL.md
│   ├── nc-save-session/SKILL.md
│   ├── nc-setup/SKILL.md
│   └── nc-update/SKILL.md
├── hooks/
│   ├── nc-session-start.js
│   └── nc-safety-gate.js
└── tests/
    ├── setup-wiring.test.js
    └── safety-gate.test.js
```

---

## 8. Koexistenz mit anderen Systemen

Auf denselben Rechnern können bereits laufen:

- `uni:` Team-OS G2 (SessionStart-Hook + UNI_GATE_*-PreToolUse-Gate)
- ECC

NovaCoreAI-OS verhindert Kollisionen durch:

- **Repo-Scoping:** Hooks und SessionStart-Begrüßung greifen nur, wenn im aktuellen Repo eine Datei `.nc-os` existiert.
- **Eigener Manifest-Bereich:** `~/.nc-os/installed-manifest.json` führt nur NovaCoreAI-OS-Dateien.
- **Eigener Namespace:** `nc:` kollidiert nicht mit `uni:` oder `ecc:`.
- **Gate-Scoping:** Das nc-Safety-Gate ist außerhalb `.nc-os`-Repos no-op.

---

## 9. Error Handling, Safety und Conventions

### 9.1 Error Handling

- Skills fragen nach, statt zu raten.
- Bei fehlendem Kontext wird auf `/nc:start` zurückgegriffen.
- Sub-Agenten erhalten präzise Aufgabenstellungen und liefern strukturierte Ergebnisse.

### 9.2 Safety

- Keine automatischen Posts, Pushes, Merges oder Deployments ohne explizite Nutzerfreigabe.
- Das Safety-Gate greift nur bei destruktiven Bash-Befehlen:
  - `git push --force`, `git reset --hard`, `git clean -fd`, `rm -rf`, `drop table`, `deploy`, `terraform destroy`
- Bei destruktiven Aktionen verlangt das Gate Faktennennung und wörtliches Zitat.

### 9.3 Conventions

- Deutsche Sprache für alle Artefakte.
- Klare Skill-Namen im Namespace `nc:`.
- Kleine Markdown-Dateien, eine Datei pro Skill.
- Append-only Journal.
- Feature-Branch → PR → Review → Merge; kein direkter `main`-Push.

---

## 10. Teststrategie

| Test-Art | Zweck |
|---|---|
| Setup-Wiring-Tests | Prüfen, ob Skills/Hooks korrekt deployt werden |
| Safety-Gate-Tests | Prüfen, ob das Gate nur bei destruktiven Befehlen blockt |
| Plugin-Manifest-Tests | Prüfen, ob `plugin.json` gültig ist |
| Skill-Manual-Tests | Testläufe in Beispiel-Repos mit Claude und Kimi |
| Modul-Akzeptanztests | Prüfen, ob ein Modul seinen Workflow vollständig abdeckt |

**Test-Runner:** Node.js mit einem geeigneten Framework (z.B. `node:test` oder `vitest`), definiert in `package.json`.

---

## 11. MVP-Scope

Die erste Iteration umfasst:

1. Core mit `/nc:start`, `/nc:save-session`, `/nc:setup`, `/nc:update`
2. Safety-Gate-Hook (nur destruktive Befehle, nur in `.nc-os`-Repos)
3. Modul `feature-lifecycle` mit `/nc:flc-feature-start`, `/nc:flc-plan`, `/nc:flc-commit-prep`, `/nc:flc-pr`
4. Claude-Code-Plugin-Struktur (`.claude-plugin/plugin.json`)
5. Setup/Update-Logik in Node.js mit dnnen Shell/PowerShell-Wrappers
6. `ncos`-CLI (setup, update, version)
7. Basis-Tests für Setup, Gate und Plugin-Manifest

**Nicht im MVP:**

- Kimi-Code-CLI-Support (folgt in Iteration 2)
- Module `review-quality`, `architecture`, `incident-support`
- Stack-spezifische Module (TypeScript/Node, Python)
- Rollen-Konzept
- Sub-Agenten

---

## 12. Abgrenzung zu Alternativen

### 12.1 Vorbild: Devteam-vibecodes

`Devteam-vibecodes` ist ein **akademisches Backend-Projekt** (Vereisungswarnung, FastAPI/Python, feste Rollen in einer Hochschulgruppe). Dieses Plugin ist für eine **kommerzielle Softwarefirma** gedacht:

- Stack-agnostisch (TypeScript/Node *und* Python)
- Workflow-Abdeckung über reine Backend-Entwicklung hinaus (Review, Architektur, Incidents)
- Modular erweiterbar statt eines festen Skill-Kanons
- Fokus auf Code-Review-Qualität, Routineautomatisierung und Wissenslücken im Team

### 12.2 Alternative: ECC oder andere Fertiglösung

ECC und ähnliche Systeme bieten vorgefertigte Skills, decken aber weder den firmenspezifischen Workflow noch die geplante Modularität und das Memory-Konzept ab. Ein dünner Firmen-Layer reicht nicht, um die geplanten Workflows abbzubilden.

---

## 13. Offene Punkte

Die folgenden Punkte sind bewusst offen und werden in späteren Iterationen entschieden:

1. **Rollen-Konzept:** Wird `/nc:start` langfristig Rollen bestimmen, oder bleibt es ohne Rollen?
2. **Stack-Module:** Wann und wie werden TypeScript/Node- und Python-Module ergänzt?
3. **Kimi-Code-CLI-Support:** Konkrete Umsetzung des Copy-Deploy-Pfads.
4. **Codex-CLI-Support:** Ob und wann eine Unterstützung für Codex CLI folgt.
5. **Marketplace-Verteilung:** Ob das Claude-Code-Plugin später über den Marketplace verteilt wird.

---

*Spec-Version: 0.1.0 · Letzte Aktualisierung: 2026-07-06 · Verantwortlich: Lucas Vöhringer*
