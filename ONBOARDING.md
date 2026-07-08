# ONBOARDING — Ersteinrichtung NovaCoreAI-OS

## Voraussetzungen

- **Node.js v18+** (`node --version`)
- **Claude Code** installiert
- Git-Zugriff auf dieses Repo

## 1. Globale Installation (einmal pro Rechner)

```bash
git clone <repo-url> && cd NovaCoreAI-OS
./setup.sh            # Windows: .\setup.ps1
./install-cli.sh      # Windows: .\install-cli.ps1  → globaler Befehl `ncos`
```

Das Setup macht zwei Dinge:

1. **Staging-Deploy:** Core-Skills, Skills aktivierter Module (siehe
   `modules/module-registry.json`) und Hooks werden nach `~/.nc-os/plugin/`
   kopiert; das Deploy-Manifest liegt unter `~/.nc-os/installed-manifest.json`.
2. **Registrierung bei Claude Code:** Das Setup führt automatisch
   `claude plugin marketplace add <repo>` und
   `claude plugin install novacoreai-os@novacoreai` aus — erst dadurch lädt
   Claude Code Skills und Hooks. Schlägt das fehl (z.B. `claude` nicht im
   PATH), gibt das Setup die beiden Befehle zum manuellen Nachholen aus.

## 2. Arbeits-Repo einrichten (einmal pro Repo)

Im Kunden-/Arbeits-Repo:

```bash
touch .nc-os                          # aktiviert Hooks & Begrüßung in diesem Repo
mkdir -p .nc/erinnerung/journal
echo ".nc/" >> .gitignore             # Kunden-Interna nie committen
```

Initialen Stand anlegen (`.nc/erinnerung/stand.md`):

```markdown
# Stand — <Projektname>

## Überblick
<Kurzbeschreibung des Projekts>

## Aktueller Zustand
<Branches, offene PRs, bekannte Risiken>
```

## 3. Arbeiten mit dem OS

| Wann | Was |
|---|---|
| Session-Beginn | `/nc:start` |
| Neues Feature/Ticket | `/nc:feature-start` → `/nc:plan` |
| Vor jedem Commit | `/nc:commit-prep` |
| Bereit für Review | `/nc:pr` |
| Session-Ende | `/nc:save-session` |

## 4. Aktualisieren

```bash
ncos update      # git pull + Neu-Deploy + Entfernen verwaister Dateien
ncos version     # installierte Version prüfen
```

## Fehlerbehebung

- **Skills erscheinen nicht:** Setup erneut ausführen (`ncos setup`), Claude Code neu starten.
- **Hooks feuern im falschen Repo:** Prüfen, ob dort versehentlich eine `.nc-os`-Datei liegt — ohne Marker sind alle nc-Hooks no-op.
- **Modul fehlt:** In `modules/module-registry.json` prüfen, ob `enabled: true` und `minCoreVersion` ≤ Inhalt von `VERSION`.
