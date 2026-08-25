# CLAUDE.md (project-scope, dev-only, nicht versioniert)

Diese Datei ist in `.gitignore` und wird nicht committet. **Normative Quelle für alle
Arbeitsregeln in diesem Repo ist die getrackte `AGENTS.md`** (Pflicht-Einstieg, Repo-Karte,
Standardzyklus, Sync-Matrix, Abschluss-Checkliste) — zuerst dort lesen. Hier stehen nur
lokale Ergänzungen, die nicht ins Repo gehören.

## Stand nach dem Multi-Plugin-Umbau (2026-07-28, Branch feat/multi-plugin-architektur)

- Das Repo ist jetzt **Marketplace-Wurzel** (`novacore-os`) mit den Plugins `plugins/nc`
  (Kern, Leitversion in `VERSION` gespiegelt) und `plugins/nc-development`.
- **Das alte Vier-Dateien-Versionsmodell ist aufgehoben.** Version je Plugin nur noch in
  dessen `plugin.json`; `package.json` trägt bewusst keine Version mehr. Details und
  Checklisten: `AGENTS.md` („Produktstand & Versionslogik" + Abschluss-Checkliste).
- Die Push-Checkliste von früher lebt jetzt — verschärft — als Punkt 5 des Standardzyklus
  in `AGENTS.md` (inkl. der 0.2.0-Lehre: Tag/Release nie vom Versions-Commit trennen).
- Git-Tags: optional; wenn genutzt, Schema `{plugin-name}--v{version}` (z. B. `nc--v0.3.0`)
  via `claude plugin tag`. Die alten `novacoreai-os--v*`-Tags bleiben historisch stehen.
- „Update" heißt für Nutzer nicht mehr `git pull` + Skript, sondern Marketplace-Mechanik
  (`/plugin update` bzw. Auto-Update nach Versions-Bump).

## Stand 2026-07-28 abends: erster Satellit `nc-felix` (Pilotprozess erfolgreich)

- Zweite Abteilung `felix` als **eigenständiges Kollegen-OS** im Satelliten-Repo
  `NovaCore-AI/Felix-OS` gebaut, registriert, installiert (Kern-Bump → 0.4.0). Branch
  `feat/abteilung-felix` trägt die uncommitteten OS-Anpassungen.
- **Für jedes weitere Kollegen-OS gilt der pilotierte Standardablauf
  `knowledge-base/standardprozesse/abteilungs-plugin-bau.md` §3b** (bis 2026-08-11
  `plugin-bau.md`) — inkl. der vier real getroffenen
  Fallen: Repo-Name = reale Heimat (nie raten), kein `type: module` bei CommonJS-Hooks,
  SSH-Falle (`CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1`), Plugin-Repo nie als Marketplace adden.
- Lokale Koexistenz-Falle dieser Maschine: `nc`/`nc-development` UND `nc-felix` sind
  installiert — doppelte FFG-Gates/Begrüßung; zum Arbeiten eines deaktivieren.

## Stand 2026-08-05: zweiter Satellit `nc-biggi` (Biggi-OS) — live

- Abteilung `biggi` als eigenständiges Kollegen-OS gebaut (Repo `NovaCore-AI/Biggi-OS`,
  INTERNAL; das Repo IST das Plugin). Releases v0.1.0/v0.1.1 kamen automatisch aus dessen
  `release.yml`; Marketplace-Pin `ref: v0.1.1` (SHA `edd5ad0…`); Kern 0.4.0 → 0.5.0
  (PR #8, Tag `nc--v0.5.0` + GitHub-Release).
- Onsite-Leitlinie (Maintainer-Auftrag 2026-08-05): bei Unterschieden gewinnt Onsite →
  Session-Start-Zwang statt Marker (Opt-out `NC_START_GATE=off`), FFG-`exitCode`-Fix,
  CI-/`release.yml`-Standard. `abteilungs-plugin-bau.md` **§3b existiert jetzt wirklich**
  (Drift der Felix-Verweise behoben); Spec-Nachtrag §11.
- Felix-Release-Hygiene nachgezogen: annotierte Tags v0.2.0/v0.2.1 + GitHub-Releases,
  Marketplace-Pin auf v0.2.1.
- Koexistenz-Falle erweitert: `nc`/`nc-development`, `nc-felix` und `nc-biggi` nie
  parallel in einer Session. Install-Probe lief in isoliertem `CLAUDE_CONFIG_DIR`
  (Temp) — die reale Maschinen-Konfiguration ist unverändert.
- Externes K3-Review vor dem ersten Push (request_changes → 5 Findings eingearbeitet,
  3 begründet abgelehnt; Details im Satelliten-CHANGELOG 0.1.0/0.1.1).
