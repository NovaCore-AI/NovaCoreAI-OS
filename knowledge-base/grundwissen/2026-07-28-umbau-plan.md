# Multi-Plugin-Umbau — Implementierungsplan (v0.2.0 → v0.3.0)

> **For agentic workers:** Umsetzung task-weise; jeder Task endet mit einem prüfbaren
> Artefakt. Spec: `2026-07-28-multi-plugin-architektur-design.md` (gleicher Ordner) —
> bei Widerspruch gilt die Spec.

**Ziel:** NovaCoreAI-OS vom Single-Root-Plugin zur Marketplace-Architektur umbauen
(Kern `nc` + Abteilung `nc-development` mit Modulen fe/be/flc/wzs), FFG v2 portieren,
CLI abschaffen, Wissensbasis + lebende Doku aufbauen.

**Architektur:** siehe Design-Spec §2 (Zielbild). **Stack:** reines Node ≥ 18
(`node:test`), Markdown, JSON — keine neuen Dependencies.

## Globale Invarianten (gelten für jeden Task)

- Sprache aller Artefakte: **Deutsch**; keine personenbezogenen Pfade.
- SKILL.md strikt nach `plugins/nc/referenz/skill-authoring.md` (Frontmatter `name` =
  Verzeichnisname; `description` als `>-`-Block mit Trigger-Begriffen, dritte Person,
  ≤ 1024 Zeichen; Gliederung Zweck/Ablauf/Regeln/Verifikation; 60–120 Zeilen Ziel).
- **Keine Pfade über die Plugin-Grenze** in ausgelieferten Dateien (kein `../`,
  kein `knowledge-base/…` als Leseanweisung — nur als Quellenangabe mit „OS-Repo").
- Version je Plugin **nur** in dessen `plugin.json`; Marketplace-Einträge ohne `version`.
- Hooks nur im Kern; Hook-Kommandos mit `"${CLAUDE_PLUGIN_ROOT}/…"`.
- JS-Dateien BOM-frei über das Write-Tool erzeugen (PS-5.1-`Out-File`-Falle).
- Verifikationsbefehle wortgleich: `node --test plugins/nc/tests/*.test.mjs` ·
  `claude plugin validate .` · `claude plugin validate plugins/<name> --strict`.

## Phasen und Zuschnitt (Delegation)

| Phase | Inhalt | Ausführung |
|---|---|---|
| P1 | Gerüst: marketplace.json, Kern-Manifest, Registry, VERSION, hooks.json | Hauptagent |
| P2 | FFG-Port + Session-Start-Umzug + Hook-Tests | Subagent A (Vertrag §P2) |
| P3 | Kern-Inhalte: 3 Skills, wp-rahmen.md, skill-authoring.md, nc-sync.md | Subagent B (Vertrag §P3) |
| P4 | Abteilung nc-development: Manifest, workflow.md, 9 Skill-Migrationen + fe-review/be-review | Subagent C (Vertrag §P4) |
| P5 | Vorlage abteilungsplugin + Struktur-Invarianten-Test | Hauptagent |
| P6 | Root-Aufräumen: CLI/Setup/alte Struktur entfernen, package.json | Hauptagent |
| P7 | Lebende Doku: CLAUDE.md, README, AGENTS.md, ONBOARDING.md, CHANGELOG | Hauptagent (+ Review) |
| P8 | Verifikation: Tests, Validierung beider Ebenen, Grep-Sweeps, externes Review, Fixes | Hauptagent |
| P9 | Bericht (Desktop) + Branch-Push + PR | Hauptagent |

P2/P3/P4 laufen nach P1 parallel — die Schreibpfade sind disjunkt
(`plugins/nc/hooks|tests` vs. `plugins/nc/skills|referenz|wp-rahmen|nc-sync` vs.
`plugins/nc-development/`).

---

### P1 — Gerüst (Hauptagent)

**Dateien (Create):** `.claude-plugin/marketplace.json` (ersetzt), `plugins/nc/.claude-plugin/plugin.json`,
`plugins/nc/module-registry.json`, `plugins/nc/hooks/hooks.json`, `VERSION` (0.3.0),
`plugins/nc-development/.claude-plugin/plugin.json`.

- marketplace.json: name `novacore-os`, owner NovaCore AI, Einträge `nc`
  (source `./plugins/nc`, category `kern`) und `nc-development`
  (source `./plugins/nc-development`, category `abteilung`) — **kein** `version`-Feld.
- Kern-Manifest: name `nc`, displayName „NovaCore-OS (Kern)", version `0.3.0`,
  author NovaCore AI, **keine** dependencies.
- Abteilungs-Manifest: name `nc-development`, version `0.1.0`, `dependencies: ["nc"]`.
- Registry nach Onsite-Muster (`_hinweis` + `abteilungen[]`): gemeinsam (nc, staendig true,
  Module core) und development (nc-development, minCoreVersion 0.3.0, Module
  fe/be/flc/wzs mit Statusangabe).
- hooks.json: SessionStart → `node "${CLAUDE_PLUGIN_ROOT}/hooks/nc-session-start.js"`;
  PreToolUse matcher `Write|Edit|MultiEdit|Bash` → `node "${CLAUDE_PLUGIN_ROOT}/hooks/nc-ffg.js"`
  mit `timeout: 10`.

**Verifikation:** `claude plugin validate .` grün; JSON parst (`node -e "JSON.parse(...)"`).

### P2 — FFG-Port (Subagent A) — Transformationsvertrag

**Quelle (Onsite-Repo, read-only):** `plugins/oai/hooks/oai-ffg.js`,
`plugins/oai/hooks/lib/bash-analyse.js`, `plugins/oai/hooks/lib/shell-substitution.js`,
`plugins/oai/tests/oai-ffg.test.mjs`.
**Ziel:** `plugins/nc/hooks/nc-ffg.js`, `plugins/nc/hooks/lib/{bash-analyse,shell-substitution}.js`,
`plugins/nc/tests/nc-ffg.test.mjs`, `plugins/nc/tests/session-start.test.mjs`,
`plugins/nc/hooks/nc-session-start.js` (aus NovaCore-Bestand angepasst).

Umbenennungs-Tabelle (vollständig, sonst 1:1 — **Logik nicht verändern**):

| Alt | Neu |
|---|---|
| `OAI_FFG` / `OAI_FFG_STATE_DIR` / `OAI_FFG_EXEMPT_GLOBS` / `OAI_FFG_FULL_DENIALS` / `OAI_FFG_EXTRA_DESTRUCTIVE` | `NC_FFG` / `NC_FFG_STATE_DIR` / `NC_FFG_EXEMPT_GLOBS` / `NC_FFG_FULL_DENIALS` / `NC_FFG_EXTRA_DESTRUCTIVE` |
| tmp-Verzeichnis `oai-ffg` · stderr-Präfix `[oai-ffg]` · „oai-ffg fail-open" | `nc-ffg` · `[nc-ffg]` · „nc-ffg fail-open" |
| Kopf-Kommentare „Onsite.ai-OS … Spec §15.x" | „NovaCore-OS … Design-Spec 2026-07-28 §5 (OS-Repo)" |
| Gate-Text-Präfix `[FFG]` | bleibt `[FFG]` |

- Session-Start-Hook: Marker-Logik (`hasNcOsMarker`, isFile-Prüfung) aus dem alten
  `hooks/nc-safety-gate.js` **in den Hook selbst** übernehmen (kein Require auf das
  entfallende Gate); Versionsquelle: `.claude-plugin/plugin.json` des eigenen Plugins
  (`path.join(__dirname, '..', '.claude-plugin', 'plugin.json')`) statt `../VERSION`;
  Text nennt `/nc:start` und `/nc:save-session`.
- Tests: FFG-Suite portieren (gleiche Fälle, NC-Env-Namen, State-Dir via Temp-Override);
  `session-start.test.mjs` prüft: Marker-Datei → Kontext mit Version aus plugin.json;
  Marker-**Verzeichnis** → null (Regressionstest des 0.1.1-Bugs); kein Marker → null.

**Verifikation:** `node --test plugins/nc/tests/nc-ffg.test.mjs plugins/nc/tests/session-start.test.mjs`
vollständig grün; `node -c` (Syntax) je Datei; kein Vorkommen von `OAI` unter `plugins/nc/`
(`grep -ri "oai" plugins/nc` leer).

### P3 — Kern-Inhalte (Subagent B)

**Ziel:** `plugins/nc/skills/{start,save-session,journal}/SKILL.md`, `plugins/nc/wp-rahmen.md`,
`plugins/nc/referenz/skill-authoring.md`, `plugins/nc/nc-sync.md`.

- Skills: inhaltliche Basis = bestehende NovaCore-Skills (`skills/nc-start/…` usw.),
  Struktur-/Qualitätsniveau = Onsite-Kern-Skills (`plugins/oai/skills/start/…` als Vorbild
  für Faktentiefe und Verifikationsteil). Aufruf `/nc:<name>`; Memory-Pfade
  `.nc/erinnerung/` unverändert; Marker-Semantik: `start` weist auf fehlenden `.nc-os`-Marker
  hin (Begrüßungs-Scope), arbeitet aber auch ohne Marker; **kein** Verweis auf
  `nc-setup`/`nc-update` (entfallen — stattdessen ONBOARDING des OS-Repos als Quellenangabe).
- `wp-rahmen.md`: WP0–WP8 nach Onsite-Vorbild, aber NovaCore-generisch (GitHub-Flow,
  rote Linien aus Design-Spec §4, `NC_FFG_EXTRA_DESTRUCTIVE` erwähnt, `.nc/erinnerung/`).
- `skill-authoring.md`: Onsite-Fassung übernehmen und anpassen: Namespaces `/nc:` bzw.
  `/nc-development:`, Beispiele NovaCore-typisch, offsite-/Jira-spezifische Pflichten
  ersetzt durch NovaCore-Pflichten (Fakten nur mit Quelle aus Arbeits-Repo, rote Linien,
  Verifikation vor Vertrauen, MCP-Hinweis generisch); Verifikationsdatum 2026-07-28 nennen.
- `nc-sync.md`: bestehende Root-Fassung übernehmen, §3.2 (OS-Repo-Struktur) auf das neue
  Layout, §5-Skillnamen auf `/nc-development:flc-*`, CLI-/`ncos`-Passagen entfernen,
  Safety-Absatz auf FFG (deny, markerlos, `NC_FFG=off`) umstellen.

**Verifikation:** Frontmatter-Check je Skill (`>-`-Block, name=Verzeichnis);
`claude plugin validate plugins/nc --strict` grün (nach P1+P2); Grep: kein
`nc-setup`, kein `ncos`, kein `/nc:flc-` unter `plugins/nc/`.

### P4 — Abteilung development (Subagent C)

**Ziel:** `plugins/nc-development/workflow.md`, `plugins/nc-development/README.md`,
`plugins/nc-development/skills/<name>/SKILL.md` für: `flc-feature-start`, `flc-plan`,
`flc-commit-prep`, `flc-pr`, `wzs-attribution`, `wzs-blocker-gate`, `wzs-reward-guard`,
`wzs-share-invariant`, `wzs-webhook-contract` (Migration aus `modules/…`, Verzeichnis ohne
`nc-`-Präfix) sowie **neu**: `fe-review`, `be-review`.

- Migration: Inhalte übernehmen, auf Formatregeln heben (Frontmatter `>-` + Trigger-Begriffe
  dritte Person; Abschnitt „Verifikation" ergänzen, wo er fehlt), alle Selbstaufrufe von
  `/nc:nc-flc-…`/`/nc:flc-…` auf `/nc-development:flc-…` umstellen; Querverweise auf
  Kern-Skills bleiben `/nc:…`.
- `fe-review` (WP6): Frontend-Diff-Review — Semantik/A11y (Tastatur, Kontrast,
  reduced motion), Web Vitals-Risiken (Layout-Shift, Bundle, Bilder), Design-Qualität
  (Zustände hover/focus/active, Hierarchie), Komponenten-Hygiene (Props-Verträge, keine
  Server-State-Duplikate). Ablauf: Diff erfassen → Checkliste → Befunde nach
  CRITICAL/HIGH/MEDIUM/LOW → Entwurf des Review-Kommentars (Mensch postet).
- `be-review` (WP6): Backend-Diff-Review — API-Verträge/Kompatibilität, Fehlerpfade
  (kein stilles Schlucken), Input-Validierung an Systemgrenzen, Datenzugriff
  (N+1, Transaktionen, Migrationen), Secrets, Testtiefe kritischer Pfade (≥ 80 %,
  `nc-sync.md` §2.2). Gleicher Ablauf/Severity-Schema wie `fe-review`.
- `workflow.md`: WP1–WP7 auf GitHub-Flow übersetzt (Tabelle wie Onsite-Vorbild),
  Modul-Zuordnung (flc → WP1–WP5, fe/be → WP6, wzs → WP3/WP6-Invarianten),
  Rote-Linien-Ownership (flc-pr trägt Push/PR-Freigabe; kein Skill merged/deployt),
  Trigger-Matrix mit disjunkten Begriffen.

**Verifikation:** `claude plugin validate plugins/nc-development --strict` grün; 11 Skills
gelistet; Grep unter `plugins/nc-development/`: kein `nc-flc`, kein `nc-wzs`, kein
`modules/`, kein `../`.

### P5 — Vorlage + Struktur-Tests (Hauptagent)

- `vorlagen/abteilungsplugin/{VORLAGE.md, README.md.vorlage, .claude-plugin/plugin.json.vorlage}`:
  Onsite-Fassung mit `oai`→`nc`, `{{PLUGIN_NAME}}` = `nc-<abteilung>`, MIN_CORE 0.3.0.
- `plugins/nc/tests/struktur.test.mjs`: Onsite-Port mit `KERN = 'nc'`; Satelliten-Zweig
  bleibt (zukunftsfest); Leitversion prüft `VERSION` ↔ Kern-Manifest ↔ Registry;
  Ausnahme-Pfad der Grenz-Prüfung: `referenz/skill-authoring.md`.

**Verifikation:** `node --test plugins/nc/tests/*.test.mjs` komplett grün.

### P6 — Root-Aufräumen (Hauptagent)

**Entfernen (git rm):** `setup.js`, `setup.sh`, `setup.ps1`, `update.js`, `update.sh`,
`update.ps1`, `ncos.js`, `install-cli.sh`, `install-cli.ps1`, `.claude-plugin/plugin.json`
(Root-Plugin), `skills/` (5 alte Kern-Skills), `modules/` (Registry + 2 Modulordner),
`hooks/` (3 Dateien inkl. `nc-safety-gate.js`), `tests/` (3 alte Suiten), Root-`nc-sync.md`
(zieht in den Kern). **Nicht anfassen:** `_wzs-*-backup-*`, `docs/superpowers/specs/…`.
`package.json`: `version`-Feld entfernen, scripts nur noch `test`, Beschreibung neu.
`.gitignore` prüfen/erhalten.

**Verifikation:** `git status` zeigt nur beabsichtigte Moves/Deletes; `node --test
plugins/nc/tests/*.test.mjs` weiterhin grün; `claude plugin validate .` grün.

### P7 — Lebende Doku (Hauptagent)

`CLAUDE.md` (Pflicht-Einstieg, Repo-Karte, Glossar knowledge-base, Konventionen,
Quellen-Hierarchie, Standardzyklus, Sync-Matrix, Abschluss-Checkliste), `AGENTS.md`
(Kurzverweis), `README.md` (Architektur, Skill-Katalog beider Plugins, Installation/Migration,
Entwicklung/Tests), `ONBOARDING.md` (Marketplace-Weg + Migration von v0.2.0 + Arbeits-Repo-
Einrichtung), `CHANGELOG.md` ([0.3.0]-Eintrag, Namenszeichnung „Fable, 2026-07-28"),
`knowledge-base/debugging-findings/agent-learnings.md` (Kopf + Session-Einträge),
`knowledge-base/grundwissen/NovaCore-OS-Produktarchitektur.md` (Kopie aus Onsite-Repo,
Herkunftsvermerk).

### P8 — Verifikation & Review (Hauptagent)

1. `node --test plugins/nc/tests/*.test.mjs` → alle grün.
2. `claude plugin validate .` + je Plugin `--strict` → „Validating skill:"-Zeilen zählen
   (nc: 3, nc-development: 11).
3. Grep-Sweeps (mit Positivkontrolle!): `{{` in `plugins/` (0 Treffer), `oai` in `plugins/`
   (0), `ncos|setup\.js` in lebender Doku (0 außer CHANGELOG-Historie), `\.\./` in
   ausgelieferten .md (0), alte Namespaces `novacoreai-os:|/nc:flc|/nc:wzs|nc-setup|nc-update`
   (0 in Plugins).
4. Externes Review (kimi-code) über Hook-Port + Struktur-Test + Manifeste; Befunde
   CRITICAL/HIGH fixen, Rest dokumentieren.
5. Fehlerprotokoll-Einträge der Session schreiben.

### P9 — Abschluss (Hauptagent)

Commits logisch geschnitten (Gerüst / Hooks+Tests / Kern-Inhalte / Abteilung / Aufräumen /
Doku); Push `feat/multi-plugin-architektur`; PR mit `--body-file` (Zusammenfassung,
Architektur-Entscheidungen, Testplan, offene Punkte: Install-Probe nach Merge, Backups-
Aufräumen, Satelliten-Zukunft wzs); Bericht `C:\Users\luceb\Desktop\Nachtschicht-Bericht-…md`.

---

*Plan 2026-07-28 · Ausführung: hybrid (Hauptagent + 3 parallele Subagenten mit
Transformationsverträgen) · Approval-Gate: PR-Review durch Maintainer am Morgen.*
