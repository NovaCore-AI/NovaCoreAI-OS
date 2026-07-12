# Changelog

Technisches Release-Log für `novacoreai-os`. Format angelehnt an
[Keep a Changelog](https://keepachangelog.com/); Versionen folgen SemVer und
stimmen mit `VERSION` / `.claude-plugin/plugin.json` / `package.json` /
`modules/module-registry.json` überein.

## [Unreleased]

## [0.2.0] — 2026-07-12

Offizieller Plugin-Release: NovaCoreAI-OS ist jetzt ein Claude-Code-Plugin
nach offiziellem Schema (analog zum Vorbild `Kimi-code-Plugin-CC`).

### Changed

- **Offizielles Plugin-Manifest:** `.claude-plugin/plugin.json` trägt jetzt
  `$schema`, `repository` und `license` — das Format, das Claude Code für
  `/plugin marketplace add` + `/plugin install` erwartet. Das Plugin lässt
  sich jetzt direkt aus dem Repo-Root installieren, ohne den Umweg über das
  Staging-Verzeichnis.
- **Offizielles Marketplace-Manifest:** `.claude-plugin/marketplace.json`
  trägt `$schema` und eine vollständige Beschreibung — Schema-konform zum
  Claude-Code-Marketplace-Format.
- **Direkte Plugin-Installation:** Neue Installationsvariante
  (`/plugin marketplace add ./` + `/plugin install novacoreai-os@novacoreai`)
  neben dem bestehenden `setup.sh`-Weg.
- Versionsbump 0.1.1 → 0.2.0 ( konsistent über `VERSION`, `plugin.json`,
  `package.json`, `modules/module-registry.json`).

### Added

- **Plugin-Manifest-Tests:** Schema-Konformitäts-Checks für `plugin.json`
  (`$schema`, `repository`, `license`, `author.name`) und `marketplace.json`
  (`$schema`, `owner.name`, Plugin-Source).

### Docs

- README um den offiziellen Plugin-Status und die direkte
  `/plugin install`-Variante ergänzt.
- ONBOARDING um Variante A (offizielles Plugin) ergänzt.
- AGENTS.md um die marketplace.json im Pfad-Überblick ergänzt.

## [0.1.1] — 2026-07-08

Bugfix-Release: Plugin lud in Claude Code teils nicht bzw. das Safety-Gate
griff außerhalb markierter Repos.

### Fixed

- **Duplicate-Hooks-Manifest:** `.claude-plugin/plugin.json` deklarierte
  zusätzlich zum automatisch erkannten `hooks/hooks.json` ein eigenes
  `"hooks"`-Feld — führte bei Claude Code zu `failed to load: Duplicate
  hooks file`. Feld entfernt; Hooks werden ausschließlich über die
  Konvention `hooks/hooks.json` geladen.
- **Marker-Kollision mit `~/.nc-os`:** `nc-safety-gate` prüfte nur
  `fs.existsSync('.nc-os')`, ohne zu verifizieren, dass der Marker eine
  **Datei** ist (`touch .nc-os`, siehe ONBOARDING). Das vom Setup angelegte
  Staging-**Verzeichnis** `~/.nc-os/` zählte dadurch selbst als Marker und
  aktivierte das Gate in jedem Repo unterhalb des Home-Verzeichnisses statt
  nur in explizit markierten Repos. Fix: Marker muss laut `fs.statSync(...)`
  eine reguläre Datei sein.

### Docs

- Root-`README.md` ergänzt — die bisherige README lag nur unter
  `NovaCoreAI-OS/` und wurde von GitHub auf der Repo-Startseite nicht
  gerendert.
- Windows/PowerShell-Ablauf für Setup, CLI-Install und Update dokumentiert.

## [0.1.0] — 2026-07-07

Initialer MVP-Release.

### Added

- Core-Skills im Namespace `nc:`: `nc-start`, `nc-save-session`,
  `nc-journal`, `nc-setup`, `nc-update`.
- Hooks: `nc-session-start` (SessionStart-Begrüßung), `nc-safety-gate`
  (PreToolUse-Faktenpflicht vor destruktiven Bash-Befehlen) — beide
  Repo-scoped über den `.nc-os`-Marker, außerhalb markierter Repos No-Op.
- Modul-System (`modules/module-registry.json`, `minCoreVersion`-Gating):
  `feature-lifecycle` (`nc-feature-start`, `nc-plan`, `nc-commit-prep`,
  `nc-pr`) und `empfehlungssystem-wzs` (`nc-wzs-attribution`,
  `nc-wzs-blocker-gate`, `nc-wzs-reward-guard`, `nc-wzs-share-invariant`,
  `nc-wzs-webhook-contract`) aktiviert; `review-quality`, `architecture`,
  `incident-support` als deaktivierte Platzhalter.
- Setup/Update-Tooling (`setup.js`, `update.js` + `.sh`/`.ps1`-Wrapper):
  staged nach `~/.nc-os/plugin/`, registriert das Plugin bei Claude Code
  (`claude plugin marketplace add` + `claude plugin install
  novacoreai-os@novacoreai`), räumt verwaiste Dateien anhand eines
  Deploy-Manifests auf.
- Test-Suite (`node --test`): Plugin-Manifest-Konsistenz, Safety-Gate,
  Setup-Wiring.
