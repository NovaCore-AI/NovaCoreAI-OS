# Changelog

Technisches Release-Log des NovaCore-OS (Plugin-Familie: Kern `nc`, Abteilung
`nc-development`). Format angelehnt an
[Keep a Changelog](https://keepachangelog.com/); Versionen folgen SemVer und leben
**je Plugin** allein in `plugins/<name>/.claude-plugin/plugin.json` — die Kern-Version ist
die Produkt-Leitversion und wird in `VERSION` und `plugins/nc/module-registry.json`
gespiegelt (testgesichert). Einträge bis einschließlich 0.2.0 beschreiben das frühere
Single-Plugin-Layout und bleiben historisch unverändert.

## [Unreleased]

### Added

- **ONBOARDING §1b — Kollegen-OS installieren:** Installationsweg der Satelliten
  (`nc-felix`, `nc-biggi`) inkl. Koexistenz-Regel und Marker-Unterschied (Biggi-OS
  markerlos, Opt-out `NC_START_GATE=off`); Abschnitt 2 um den Biggi-Hinweis ergänzt.
  Fund des Frische-Instanz-Reviews nach dem 0.5.0-Release: die Ersteinrichtungs-Doku
  kannte die Satelliten bis dahin nicht. — Agent: Claude (Opus 5)

## [0.5.0] — 2026-08-05

Dritte Abteilung `biggi` angelegt — als **zweites eigenständiges Kollegen-OS** im
Satelliten-Repo `NovaCore-AI/Biggi-OS` (Auftrag Maintainer 2026-08-05, Muster Felix-OS;
Architektur-Leitlinie laut Auftrag: bei Unterschieden zwischen NovaCore- und Onsite-Vorbild
gewinnt Onsite). Der mit Felix pilotierte Ablauf ist jetzt als `plugin-bau.md` **§3b**
formalisiert — die §3b-Verweise aus Felix-CHANGELOG/-AGENTS liefen bisher ins Leere
(Doku-Drift behoben). Spec-Nachtrag:
`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`, §11.

### Added

- **Abteilungsplugin `nc-biggi` 0.1.0 (Satellit, eigenständig):** eigenes privates Repo
  `NovaCore-AI/Biggi-OS` — das Repo IST das Plugin. **Kernmodul** ohne Präfix mit 6 Skills
  (Ports aus dem Felix-OS, auf das markerlose Modell umgestellt), **Kontroll-Schicht als
  Synthese beider Vorbilder**: FFG mit den Felix-Review-Härtungen (verankerte Exempt-Globs,
  Session-Key-Hashing, plattformbewusstes Case-Folding) plus Onsite-`exitCode`-Fix;
  **Session-Start-Zwang** als Onsite-Port (Injektion, markerlos, Opt-out
  `NC_START_GATE=off`). Arbeitsmodul-Konvention reserviert (nicht auf Vollständigkeit
  angelegt): `controlling` (`ctrl`), `medizinisches` (`mdzn`), `dokumentation-daily-work`
  (`doc` + `day` — ein Modul, zwei Präfixe; Registry-Schema mit `praefixe`-Arrays,
  Platzhalter-Ordner je Präfix). 45 Tests grün; CI `ci.yml` (Ubuntu+Windows × Node
  20/22/24, Validator-Positivkontrolle) und `release.yml` (Tag↔Manifest-Abgleich,
  Release-Notes aus dem CHANGELOG) nach Onsite-Standard. Extern reviewt (K3/Kimi) vor dem
  ersten Push; ausgeliefert als 0.1.1 (0.1.0 + BOM-Literal-Patch, Details im
  Satelliten-CHANGELOG).
- **Marketplace-Eintrag `nc-biggi`:** GitHub-Source mit Commit-SHA-Pin (`ref: v0.1.1`);
  kein `version`-Feld im Eintrag — die Version lebt allein in dessen `plugin.json`.
- **Registry:** Abteilung `biggi` (`repository` + satelliten-relatives
  `repoSkillsPath: "skills"`; Modul-SSOT liegt im Satelliten selbst).
- **`plugin-bau.md` §3b:** pilotierter Standardablauf „eigenständiges Kollegen-OS als
  Satellit" ausformuliert — inkl. der vier verifizierten Install-Fallen und des
  CI-/Release-Standards für Satelliten.

### Changed

- **Kern `nc` 0.4.0 → 0.5.0** (`VERSION` + Registry gespiegelt): Registry-Erweiterung um
  die Abteilung `biggi`.
- **Felix-OS-Release-Hygiene nachgezogen:** annotierte Tags `v0.2.0`/`v0.2.1` und
  GitHub-Releases im Satelliten erzeugt — der Marketplace-`ref: v0.2.0` zeigte bisher auf
  einen nicht existierenden Tag (nur der SHA trug); Eintrag `nc-felix` auf `v0.2.1`
  umgepinnt (realer Stand inkl. Repository-URL-Fix). — Agent: Claude (Opus 5)

## [0.4.0] — 2026-07-28

Zweite Abteilung `felix` angelegt — als **erster Satellit** des NovaCore-OS (Muster
`knowledge-base/standardprozesse/plugin-bau.md` §3a, Onsite.ai-OS-erprobt) und auf
Maintainer-Entscheidung als **eigenständiges Felix-OS**: Module statt Abteilungen, keine
Kern-Dependency. Spec-Nachtrag:
`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`, §10.

### Added

- **Abteilungsplugin `nc-felix` 0.2.0 (Satellit, eigenständig):** eigenes privates Repo
  `NovaCore-AI/Felix-OS` — das Repo IST das Plugin (Manifest an der Wurzel).
  **Kernmodul** ohne Präfix mit 6 Skills (`start`, `save-session`, `journal` als angepasste
  Ports der Kern-Skills; `os-info`, `skill-builder` nach Onsite-Vorbild; `code-tour`
  Neubau), **eigene Kontroll-Schicht** (FFG verbatim-Port + angepasster SessionStart-Hook,
  Env-Schalter `NC_FFG*` unverändert), geteilte Anweisung `felix-sync.md`, `wp-rahmen.md`,
  eigene `module-registry.json`, `referenz/skill-authoring.md`; FFG-/Struktur-/
  Frontmatter-Tests (36 grün), CI mit SHA-gepinnten Actions. **Keine Kern-Dependency** —
  nicht parallel zu `nc` betreiben (doppelte Gates).
- **Marketplace-Eintrag `nc-felix`:** GitHub-Source mit Commit-SHA-Pin
  (`dc6f6b98edec2d2c2de44fe2573b30043e3aeaf6`, `ref: v0.2.0`); der Pin greift, sobald der
  Satellit mit exakt diesem Commit gepusht und getaggt ist (kein Squash/Rebase beim Merge).
  Kein `version`-Feld im Eintrag — die Version lebt allein in dessen `plugin.json`.
- **Registry:** Abteilung `felix` (`repository` + satelliten-relatives
  `repoSkillsPath: "skills"`; Modul-SSOT liegt im Satelliten selbst).

### Changed

- **Kern `nc` 0.3.0 → 0.4.0** (`VERSION` + Registry gespiegelt): Registry-Erweiterung um
  die Abteilung `felix` — ohne Bump erhielte das Team die aktualisierte Registry nie per
  Auto-Update.
- **`plugin-bau.md` §1:** dokumentierte Ausnahme von der Kern-Dependency-Pflicht für
  eigenständige Abteilungs-OS in Satelliten-Repos. — Agent: Claude (Fable 5)

## [0.3.0] — 2026-07-28

Multi-Plugin-Umbau: Aus dem Single-Root-Plugin `novacoreai-os` wird die Plugin-Familie des
NovaCore-OS — Marketplace `novacore-os` mit Kern `nc` (0.3.0) und Abteilung
`nc-development` (0.1.0). Architektur-Übertrag aus der produktiv erprobten
Onsite.ai-Ausprägung derselben Produktvision; verbindliche Grundlage:
`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`.

### Added

- **Marketplace `novacore-os`:** Repo-Wurzel ist nur noch Marketplace-Wurzel; zwei
  Einträge (`nc`, `nc-development`), bewusst **ohne** `version`-Feld (Doku
  plugin-marketplaces: der `plugin.json`-Wert gewinnt „without warning").
- **Kern-Plugin `nc` (Namespace `/nc:`):** Skills `start`, `save-session`, `journal`;
  `wp-rahmen.md` (Pflicht-Zyklus WP0–WP8 mit roten Linien — Einlösung des
  Vision-Punkts „für NovaCore AI noch zu definieren"); `module-registry.json`
  (Metadaten-SSOT Abteilung → Plugin → Module → Skills); `referenz/skill-authoring.md`
  (verbindliche Formatregeln, mit ausgeliefert); `nc-sync.md` (aus der Repo-Wurzel in den
  Kern gezogen und auf die neue Architektur aktualisiert).
- **FFG v2 — Fact-Forcing-Gate** (`hooks/nc-ffg.js` + `hooks/lib/bash-analyse.js` +
  `hooks/lib/shell-substitution.js`), Port des Onsite-FFG nach GateGuard-Vorbild:
  Datei-Gate je Zieldatei (getrennte Edit-/Write-Texte, Subagenten übersprungen,
  `.claude/settings*.json` ausgenommen, Ausnahmen per `NC_FFG_EXEMPT_GLOBS`,
  Volltext-Budget `NC_FFG_FULL_DENIALS`), Destruktiv-Gate je Kommando (rm -rf,
  git push --force / reset --hard / clean -f / checkout -- / commit --amend, drop table,
  dd, find -exec, sh -c-Wrapper; quote-aware, Newline-Trenner — GHSA-4v57-ph3x-gf55;
  Zusatzmuster `NC_FFG_EXTRA_DESTRUCTIVE`), Routine-Bash einmal je Session,
  Read-only-Git nie. **Markerlos aktiv**, Opt-out nur per Env `NC_FFG=off`; fail-open.
- **Abteilungsplugin `nc-development`** (Namespace `/nc-development:`,
  `dependencies: ["nc"]` → Kern kommt transitiv): 11 Skills in 4 Modulen — `flc`
  (4 migrierte Lifecycle-Skills), `wzs` (5 migrierte WZS-Skills), `fe`/`be` (neu:
  `fe-review`, `be-review` — WP6-Diff-Reviews mit Severity-Schema, Entwurf statt Post);
  `workflow.md` (WP1–WP7 auf GitHub-Flow, Rote-Linien-Ownership, Trigger-Matrix).
- **Testsuite `plugins/nc/tests/`:** 26 Hook-Tests (FFG-Suite + Session-Start inkl.
  Regressionstest für den 0.1.1-Marker-Verzeichnis-Bug) + Struktur-Invarianten
  (Marketplace↔Platte, kein `version` im Marketplace, Dependencies-Topologie, Hooks nur
  im Kern, `CLAUDE_PLUGIN_ROOT`-Pflicht, MCP-Wächter, Frontmatter-/YAML-Falle,
  Plugin-Grenze, Leitversions-Gleichstand, Registry-Konsistenz, Vorlagen-Hygiene).
- **Vorlage `vorlagen/abteilungsplugin/`** (kein Plugin, `.vorlage`-Endungen) für künftige
  Abteilungen.
- **Wissensbasis `knowledge-base/`:** `grundwissen/` (Produktvision
  `NovaCore-OS-Produktarchitektur.md` ins Heimat-Repo übernommen; Design-Spec und
  Umbau-Plan 2026-07-28), `standardprozesse/` (`plugin-bau.md`, `os-bau-methode.md` —
  die wiederverwendbare, an die Firmenphilosophie anpassbare OS-Bau-Methode),
  `debugging-findings/` (`agent-learnings.md`, append-only Fehlerprotokoll).
- **`AGENTS.md`** als normative Einstiegs-Doku (Pflicht-Einstieg, Repo-Karte, Glossar,
  Standardzyklus mit Abschluss-Checkliste, Sync-Matrix).

### Changed

- **Namespaces:** `/nc:start` statt `/novacoreai-os:nc-start`; Abteilungs-Skills unter
  `/nc-development:<modul>-<name>` (Verzeichnisnamen ohne redundantes `nc-`-Präfix).
- **Session-Start-Hook:** liest die Version aus der `plugin.json` des eigenen Plugins
  statt `../VERSION` (Pfad existiert im Plugin-Cache nicht); Marker-Prüfung
  (`stat.isFile()`) in den Hook gezogen; bleibt bewusst Marker-gebunden (Komfort,
  kein Gate).
- **Versionsmodell:** je Plugin genau eine Versionsquelle (`plugin.json`); `VERSION` +
  Registry spiegeln nur den Kern; `package.json` trägt keine Version mehr — die frühere
  Vier-Dateien-Gleichstand-Regel ist aufgehoben.
- **README/ONBOARDING** vollständig auf Marketplace-Installation, Migration von v0.2.0
  und die neue Architektur umgestellt.
- **Review-Härtungen gegenüber dem Vorbild-FFG** (externes Kimi-Review, 2 MAJOR + Hinweise):
  Exempt-Globs voll verankert und case-gefoldet — kein Substring-Bypass mehr (`*.md`
  exemptete zuvor auch `foo.md.bak` und `x.md/evil.js`; Regressionstest ergänzt);
  Datei-Gate-Key wird nur auf case-insensitiven Plattformen (win32/darwin) gefoldet
  (Linux: getrennte Gates für `Foo.md`/`foo.md`); Session-Key-Sanitisierung hasht bei
  jeder Zeichen-Ersetzung (keine Key-Kollision `a/b` ↔ `a_b`). Fail-open bei
  unbeschreibbarem State und der konditionale MCP-Wächter-Test bleiben dokumentierte
  Design-Entscheidungen. Die drei gehärteten Muster stammen 1:1 aus dem Vorbild —
  Backport-Kandidat für das Onsite.ai-OS.

### Fixed

- **Alle fünf WZS-Skills hatten nicht parsende Frontmatter** (`name` mit Doppelpunkt
  `nc:wzs-…` — unzulässige Zeichen — und `description` als Plain-Scalar mit „Quelle: ").
  Sie luden laut Validator „with empty metadata" und konnten **nie automatisch
  triggern**. Durch die Migration behoben; die Struktur-Tests verhindern die
  Wiederholung mechanisch.

### Removed

- **Eigene CLI-/Deploy-Infrastruktur ersatzlos:** `ncos.js`, `setup.js`/`.sh`/`.ps1`,
  `update.js`/`.sh`/`.ps1`, `install-cli.sh`/`.ps1`, Deploy-Manifest-Mechanik
  (`~/.nc-os/plugin`) — Verteilung und Updates laufen ausschließlich über den
  Marketplace.
- Skills `nc-setup`/`nc-update` (Aufgabe übernimmt die Marketplace-Mechanik; Migration
  in ONBOARDING dokumentiert).
- `hooks/nc-safety-gate.js` — im Destruktiv-Gate des FFG aufgegangen (deny statt ask,
  markerlos, breitere Erkennung); die Vision-Schicht „Safety-Gate" ist damit erfüllt,
  nicht gestrichen.
- Alte Testsuiten `setup-wiring`/`safety-gate`/`plugin-manifest` (ersetzt durch Hook- und
  Struktur-Tests) sowie das Root-Plugin-Manifest `.claude-plugin/plugin.json`.

*Beitrag: Claude (Fable), Nachtschicht 2026-07-28 — Umsetzung mit drei Subagenten
(FFG-Port, Kern-Inhalte, Abteilung development); zur Abnahme als PR vorgelegt.*

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
