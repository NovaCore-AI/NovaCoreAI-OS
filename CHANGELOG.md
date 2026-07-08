# Changelog

Technisches Release-Log für `novacoreai-os`. Format angelehnt an
[Keep a Changelog](https://keepachangelog.com/); Versionen folgen SemVer und
stimmen mit `VERSION` / `.claude-plugin/plugin.json` / `package.json` /
`modules/module-registry.json` überein.

## [Unreleased]

### Changed

- **Repo-Struktur geflacht:** Der Plugin-Inhalt lag bisher doppelt verschachtelt
  unter `NovaCoreAI-OS/NovaCoreAI-OS/` (Repo-Root enthielt einen gleichnamigen
  Unterordner mit dem eigentlichen Plugin). Jetzt ist Repo-Root = Plugin-Root,
  analog zu anderen Plugin-Repos. Betrifft nur Repo-Layout, keine
  Laufzeit-Logik — `setup.js`/`update.js` lösen ihren Root ohnehin über
  `__dirname` auf, alle Tests bleiben grün. Duplikate (`.gitattributes`,
  `docs/superpowers/specs/…`, zweite README) dabei entfernt bzw.
  zusammengeführt. Kein Versionsbump, da sich am ausgelieferten
  Plugin-Verhalten nichts ändert.
- Nach dem Mergen dieses Branches muss die Marketplace-Registrierung
  (`known_marketplaces.json` → `novacoreai`) auf den neuen Root-Pfad zeigen;
  danach `claude plugin marketplace update` + `claude plugin update` +
  Neustart.

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
