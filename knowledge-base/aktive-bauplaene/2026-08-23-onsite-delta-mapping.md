# Onsite-Delta-Mapping 0.23.0 → 0.25.0 — Iterationsgrundlage (2026-08-23)

> **Zweck:** Kartiert, was das Onsite.ai-OS-Vorbild seit unserem letzten Referenzstand gebaut
> hat, und klassifiziert jeden Posten für die nächste Nachbau-Iteration. Dieses Dokument ist
> die **Mapping-Vorstufe** — der eigentliche Bauplan entsteht erst nach der
> Maintainer-Priorisierung und verweist hierher. Es ersetzt den offenen
> Onsite-Upstream-Prüfpunkt (#59/#61/#62) aus dem Offene-Stränge-Register.
>
> **Status:** Mapping abgeschlossen. **Beauftragt per Maintainer-Weisung 2026-08-23**
> (Nachtrag N1 unten): finaler Umbau auf Onsite-Niveau und -Architektur, Entscheide EN1–EN8
> aufgelöst auf **Onsite-Parität als Default**; einzige benannte Dauer-Abweichung ist die
> **Affiliate-Invariante** (N1.1). Dieses Dokument ist damit der geltende Bauplan der
> Phasen G–K.

## 1. Quellen und Methode (verifiziert 2026-08-23)

- **Referenzstand (alt):** Onsite `origin/main@5c2c210`, Kern **0.23.0** — der Stand, gegen den
  der [Bauplan 2026-08-15](2026-08-15-onsite-endstand-nachbau-bauplan.md) (Phasen A–F, per
  Nachtrag N8 bestätigt) gebaut wurde. Unsere Seite danach: Kern **0.10.0**,
  `nc-development` **0.2.0** (PR #21).
- **Neuer Stand:** Onsite `origin/main@6d3f8db`, Kern **0.25.0** (Releases 0.24.0 vom
  2026-08-18 und 0.25.0 vom 2026-08-21). Delta: **235 Commits, 153 Dateien,
  +17.223/−1.550 Zeilen**.
- **Methode:** CHANGELOG-Diff (`git diff 5c2c210..origin/main -- CHANGELOG.md`, 205 neue
  Zeilen) als Primärquelle „was ist gebaut", ergänzt um Struktur-Verifikation
  (`git ls-tree origin/main` für Hooks, Skills, Wissensbasis) und Gegenprobe am eigenen Repo
  (Grep/Read der betroffenen NovaCore-Artefakte). Onsite-Spec-Paragraphen (§15.x) sind unten
  als Fundstellen genannt.
- **Klassifikation je Posten:**
  **N** = Nachbauen (Arbeitspaket) · **P** = Prozess-/Norm-Nachzug (Doku, klein) ·
  **E** = Maintainer-Entscheid nötig, bevor gebaut wird · **X** = bewusst nicht übernehmen ·
  **B** = beobachten (bei Onsite selbst noch in-flight).

## 2. Delta-Inventar

### 2.1 Kontroll-Schicht (Hooks/Gates)

| # | Posten (Onsite-Fundstelle) | Klasse | Befund gegen NovaCore-Ist |
|---|---|---|---|
| D1 | **Safety-Gate (Gate 3)** `oai-safety-gate.js` — `PreToolUse` auf `Bash` + `mcp__.*`, `permissionDecision: "ask"`, Musterliste v1, Opt-out, **vier GLM-Bypass-Härtungen** als Regressionstests (§4.7/§15.21/§15.26, PR #83) | **N + E** | Bei uns explizit „noch nicht gebaut" (AGENTS.md). Entscheid: Musterliste auf NovaCore-Realität zuschneiden — unsere Domänen-roten-Linien sind WZS-Deploy/DB/Webhooks (`pflege-auspraegung.json`), nicht terraform |
| D2 | **Gate 4 entfällt endgültig** (§15.44 — PreCompact-Mahnung bleibt, war nie Gate 4) | **P + E** | Bei uns steht Gate 4 noch als „noch nicht gebaut" in AGENTS.md und Gates-Definition — Entscheid: Onsite-Parität übernehmen und Doku umstellen |
| D3 | **FFG-Erweiterung** (§15.38): `NotebookEdit` im Datei-Gate, **Windows-Destruktivmuster** (del/rmdir/rd /s, Remove-Item -Recurse -Force, cmd/PS-Wrapper, `-EncodedCommand`, MSYS), **Upstream-Drift-Ritual** mit eigener Testdatei `oai-ffg-drift.test.mjs` (PR #65) | **N** | Verifiziert: `nc-ffg.js` kennt **keine** Windows-Destruktivmuster; deckt sich 1:1 mit unserer eigenen Backlog-Idee [FFG-Nachbesserungen](../ideen-backlog/2026-08-10-ffg-nachbesserungen-upstream-windows-notebookedit.md) (alle drei Lücken dort bereits gegen unseren Code belegt). Idee → Beauftragung; Idee bleibt liegen |
| D4 | **Wissens-Hinweis-Hook** `oai-wissens-hinweis.js` (`UserPromptSubmit`, kein Gate) + handgepflegter Sucheindex `wissen-sucheindex.json` — max. drei Einzeiler-Treffer je Sitzung (§15.40, Hook-Teil, PR #75) | **N** | Fehlt bei uns vollständig; gehört zum SSOT-Präsenz-Paket (mit D7) |
| D5 | **Pfad-Zeiger-Hook** `oai-pfad-hinweis.js` (`PreToolUse` Write/Edit, 15 Pfadklassen aus `pfad-aenderungsindex.json`, injiziert die passende Matrix-Zeile bei der ersten Schreibaktion je Klasse) + „Red Flags"-Block in der Session-Start-Injektion (§15.49, PR #94) | **N** | Fehlt bei uns vollständig; unsere Änderungs-Matrix existiert (`aktualisierungs-index.md` §2), nur der Zeiger-Mechanismus fehlt |
| D6 | **PR-Sichtbarkeit über Repo-Grenzen** im Queue-Fälligkeits-Hook (§15.39, PR #69): offene PRs über alle Infra-Registry-Repos via `gh`, 2,5-s-Budget, Tages-Cache; **plus Windows-Sperren-Fix** (`mitSperre` gab bei `EPERM`/`EACCES`/`EBUSY`/`ENOTEMPTY` vorzeitig auf) | **N** | Unser `nc-queue-faelligkeit.js` hat keinen PR-Check; unsere `mitSperre` behandelt nur `EEXIST` als Retry-Fall (Z. 218) — auf Windows verweigert sie bei transienten Fehlcodes unnötig (fail-closed statt Lost Update, aber Robustheitslücke) |

### 2.2 Wissens-Schicht (SSOT-Präsenz und Sanierung)

| # | Posten | Klasse | Befund gegen NovaCore-Ist |
|---|---|---|---|
| D7 | **Vier Wissens-Router-Skills** `wissen-aendern` / `wissen-planen` / `wissen-nachschlagen` / `wissen-protokolle` (Modul `wissen`, Zeiger statt Kopien, Kontext-Budget testerzwungen ≤ 6.000 Zeichen; §15.40, PR #75) | **N** | Fehlen bei uns vollständig |
| D8 | **`doku-sync` ersatzlos entfernt** (§15.43, Maintainer-Entscheid A1): Funktion trägt der Router `wissen-aendern`; Pre-Commit-Fangnetz verworfen; abgeleitete Regel „jede Checklistenzeile braucht einen benannten Träger" | **E + N** | Wir haben `/nc:doku-sync` (und den Executor-Verweis darauf) — Entscheid: mit dem Router-Bau entfernen (Onsite-Parität) oder behalten |
| D9 | **`update-doks` auf eine Aufgabe geschnitten** (§15.47, Entscheid A2): F1/F2-Zweiteilung entfernt; nur noch Kreuzverweis-/Pfad-Pflege innerhalb der harten SSOT-Dokumente, Vorschau vor dem Schreiben, nur Maintainer-Vokabular triggert | **N** | Unser `/nc:update-doks` trägt exakt die verworfene F1/F2-Zweiteilung |
| D10 | **SSOT-Sanierungs-Normen** (PR #114, Pakete A–F): linearer Dokument-Lebenszyklus + Statuslegende + **Bagatellgrenze** + Batch-Kadenzen; Massenbereinigung (20 Archivierungen); **`vorlagen/` in die Wissensbasis umgezogen**; Spec-Governance: Fußzeilen-Kette und Spec-Versionszählung **abgeschafft**, Nachträge datums-geschlüsselt; keine Zahlen-/Versions-Spiegel; Register statt Offen-Listen | **P + E** | Unsere Wissensbasis ist jünger/kleiner und teils schon konform (Register existiert). Zu entscheiden: Statuslegende/Bagatellgrenze/Kadenzen übernehmen · `vorlagen/` von der Repo-Wurzel in die Wissensbasis? · Spec-Nachtrags-Governance angleichen. Sofort fällig unabhängig davon: **Bauplan 2026-08-15 ist abgeschlossen → Pflicht-Verschiebung ins `bauplan-archiv/`** |
| D11 | **Release-Zug-Runbook**: `metaflow.md` aufgelöst in Aktualisierungs-Index **§0 (Zwei-Klassen-Regel)** und **§3.6 (Waypoint-Batches: eine Version je Batch und Plugin, Tag-Kadenz)** | **P + E** | Betrifft unseren offenen E7-Entscheid („gesammeltes Release am Umbau-Ende"): Entscheid, ob E7 durch das Waypoint-Batch-Modell ersetzt wird |
| D12 | **Team-Sync-Payload-Satz „Ein Archiv ist keine Wissensquelle"** (Ebene 1b, §15.28/§15.32, PR #113) | **P** | In unsere `nc-sync.md` übernehmen (Payload-Änderung → Kern-Bump) |
| D13 | **doks/-Governance** (Maintainer-Entscheid Onsite 2026-08-21): `doks/` ist der einzige freigegebene Instruktions-Träger im Paket; `referenz/`-Bestand + `wp-rahmen` als **unreviewed** eingestuft, Review-/Neubau-Strang registriert | **E** | Bei uns liegt `referenz/` (skill-/agent-authoring, pflege-auspraegung) reviewt im Paket — Entscheid, ob die Onsite-Einstufungsnorm für uns überhaupt zutrifft oder bewusst abgelehnt wird |

### 2.3 Sitzungswissen (größter Einzelposten)

| # | Posten | Klasse | Befund gegen NovaCore-Ist |
|---|---|---|---|
| D14 | **Wissensfluss dreistufig — lokaler Strom abgeschafft** (§15.48, PR #92): `.oai/erinnerung/` existiert nicht mehr; Sitzungswissen wohnt **in Repos mit eigener Wissensbasis** unter `sitzungswissen/` (committet), in fremden Arbeits-Repos trägt das **Projekt-Memory** den Stand allein. `end-session` neu gefasst: Klassifikation gegen Stufen-Prüfungen **GL1–GL5** (`pflege-auspraegung.md` §5.5), Zwei-Fall-Logik am Argument `nachzug`, Konsolidierungspflicht `stand.md`. `start` auf Projekt-Memory umgestellt, Lagebriefing nach 30-Sekunden-Norm | **N + E** | Bei uns wohnt Sitzungswissen in `.nc/erinnerung/` (Entscheid E2a vom 2026-08-15: „Repo ist öffentlich"). **Der Maintainer-Commit `242b9e7` (2026-08-23, `.nc/` bewusst auf `main` committet) nimmt die Onsite-Richtung faktisch vorweg** — Entscheid nötig: Ziellayout `sitzungswissen/` im öffentlichen OS-Repo (inkl. Umzug `.nc/erinnerung/` → `knowledge-base/sitzungswissen/`?) und Umbau von `start`/`end-session` inkl. GL1–GL5 |

### 2.4 Kern-Skills und Kleinteile

| # | Posten | Klasse | Befund gegen NovaCore-Ist |
|---|---|---|---|
| D15 | **Secrets-ENV-Referenz** `OAI_SECRETS_REF` statt Textkapitel (§15.41): Variable trägt Verweis, nie Wert; `init` prüft nicht-blockierend, `os-info` meldet nur gesetzt/nicht gesetzt | **N** | Fehlt bei uns (Pendant: `NC_SECRETS_REF`, Prüfpunkt in `setup`/`os-info`) — klein |
| D16 | **`skill-builder` auf Metaflow-Stand** (Satelliten, Anker, Plugin-Grenze, `--strict`, Overlap gegen Subagenten; PR #109) + **`os-info`-Nachzug** auf Installations-Ist | **N** | Unsere Pendants gegen den 0.10.0-Ist prüfen und analog nachziehen |
| D17 | **Fit-Prüfung** `/oai:fit-pruefung` + read-only Subagent `fit-pruefer` + `rubrik.md` (§15.45): prüft Plugin-Definitionen gegen die Ruleset-Source | **N + E** | Fehlt bei uns. Onsites „Ruleset-Source" (`plugin-maintanance-ruleset-source/`) entspricht unserem `standardprozesse/` (Index-Mapping-Tabelle) — Zuschnitt-Entscheid, ob unsere `abteilungs-inhalts-pruefung.md` das schon teilweise trägt |
| D18 | **Marketplace-Beschreibungs-Hygiene** (Zähl-Korrektur „gebaute Skills zählen, Platzhalter nicht", Review-Fund #118) | **P** | Mini: unsere Marketplace-/Registry-Beschreibungen auf Zähl-Wahrheit prüfen |

### 2.5 Abteilungen, Satelliten, Verteilung

| # | Posten | Klasse | Befund gegen NovaCore-Ist |
|---|---|---|---|
| D19 | **Erste Abteilungs-Subagenten** (`oai-development` v0.13.0): `code-reviewer` (read-only Diff-Review, `model: inherit`), `pipeline-praeflight` (Grün-Prognose der CI vor dem Push, Diagnose-Klasse mit Marker, lesendes Bash + read-only MCP), `test-luecken-scout` (read-only Testlücken-Analyse); Overlap-Matrix; portabler Agenten-Prüfbaustein 1.3.0 mit **Diagnose-Klasse** | **N** | `nc-development` führt `agents: {}` (leer). Adaption nötig: `pipeline-praeflight` ist bei Onsite GitLab-spezifisch → bei uns GitHub-Actions-Präflight. Bausteinversions-Abgleich prüfen (unser `agenten.test.mjs` trägt 1.4.2, Onsite-portabel 1.3.0 — Diagnose-Klasse bei uns vorhanden?) |
| D20 | **Hook-Norm W4 — Sequenzierungs-Gate entfernt** (Maintainer-Entscheid Onsite 2026-08-21, PR #117/#119): bei Auslieferung trägt nur der Kern Hooks; ein **etablierter** Satellit darf eigene spezialisierte, nicht-redundante, nicht-kollidierende Hooks tragen; Struktur-Invariante „nur Kern trägt Hooks im OS-Repo" | **P** | In `abteilungs-plugin-bau.md`/`kern-plugin-bau.md` §1a, Gates-Definition und ggf. Struktur-Invariante nachziehen |
| D21 | **Anlageweg-Weiche §15.53/§3.0**: Eine Abteilung **mit Inhalt** entsteht nie über das OS-Repo — Direktanlage als Satellit (Regelfall) vs. befristete Reservierungsanlage (Sonderfall, inhaltsleer); Repo-Anlage an den bauenden Agenten delegierbar (Freigabepflicht bleibt) | **P + E** | Betrifft unsere Registry-Reservierungen `ui-ux`/`automation` und die Idee [dev-Plugin-Satelliten-Extraktion](../ideen-backlog/2026-08-10-dev-plugin-satelliten-extraktion.md); Norm in `abteilungs-plugin-bau.md` §3 + `team-distribution.md` nachziehen |
| D22 | **CI-Kostenschnitt** (§15.51, PR #104): Regelfall **ein** Job, volle Matrix nur am Release-Tag und per `workflow_dispatch`; `claude.yml` stillgelegt | **N + E** | Unsere `ci.yml` fährt die volle Matrix (Ubuntu+Windows × Node 20/22/24) bei jedem Push. Mitentscheiden: Umgang mit dem reaktionslosen @claude-Bot (offener Strang) |
| D23 | **Mikrobiologie-Satellit v0.2.0** (§15.53/§3a, PR #115/#116): fachspezifische Onsite-Abteilung (Schimmelpilz-Analytik); prozessual relevant: SSOT-**Neuanlage** mit sieben Bausteinen, Pin + Rückbau **atomar in einem PR** | **X** (Inhalt) / **P** (Prozess) | Inhalt nicht übernehmen. Prozessdetails (Neuanlage-Weg, Atomar-Regel) gegen unser `abteilungs-plugin-bau.md` §3a/§3b abgleichen |
| D24 | **Onsite in-flight** — 10 aktive Baupläne: mneme-dreaming (Makro+Mikro), ssot-krake-claude-memory-arme, init-cli-bootstrap-und-auto-update, nachzug-kadenz-und-executor-umbau, node-doks-definition-und-gate2-ssot-bezug, claude-ebenen-inhalts-standards, dev-plugin-inhalts-modernisierung, ssot-sanierung-governance (Phase 2), mikrobiologie-ssot-anschluss | **B** | Nicht nachbauen, bis beim Vorbild gemergt/released; als Beobachtungsliste in den nächsten Prüfpunkt übernehmen. Für das Jira-Vorhaben (Produktentwicklung des OS) sind sie Kandidaten für Epics/laufende Vorgänge |

### 2.6 Nicht Teil dieses Deltas (Alt-Lücken, zur Ehrlichkeit)

`init`, `firmenwissen-suche` und `grill-me` existierten bereits im Referenzstand 5c2c210. Ihr
Schicksal regelt der [Bauplan 2026-08-15](2026-08-15-onsite-endstand-nachbau-bauplan.md)
(unser `setup`-Reconciler trägt die `init`-Rolle); ob `firmenwissen-suche` bewusst
ausgeschlossen wurde, ist bei der Priorisierung einmalig gegen dessen Entscheide E1–E6 zu
prüfen — nicht hier zu klären.

## 3. Aufgelöste und berührte offene Stränge

- **Onsite-Upstream-Prüfpunkt #59/#61/#62** (Register 2026-08-16): #59/#60 war per Nachtrag
  N7/N8 erledigt; #61/#62 (Metaflow) geht in **D11** auf. Der Prüfpunkt ist mit diesem
  Mapping **abgearbeitet**; Nachfolger ist die Beobachtungsliste **D24**.
- **Ideen-Backlog-Deckung:** D3 deckt die FFG-Nachbesserungs-Idee; D21 berührt die
  Satelliten-Extraktions-Idee; D24 überschneidet sich mit mehreren Onsite-Backlog-Ideen.
- **E7-Release-Strang** (Register): wird durch D11 zum Entscheid „E7 vs. Waypoint-Batches".

## 4. Phasenvorschlag (Zwangsreihenfolge, Fortsetzung der A–F-Zählung)

| Phase | Inhalt | Begründung der Reihenfolge |
|---|---|---|
| **G — Kontroll-Schicht-Parität** | D3 (FFG), D1 (Safety-Gate), D2 (Gate-4-Entfall), D6 (Queue-Hook: PR-Check + Sperren-Härtung) | In sich geschlossen, keine Wissensbasis-Abhängigkeit; höchster Sicherheitswert; D3 vor D1 (geteilte `lib/bash-analyse.js` zuerst stabilisieren) |
| **H — SSOT-Präsenz** | D7 (Router), D4 (Wissens-Hinweis-Hook + Sucheindex), D5 (Pfad-Zeiger-Hook + Index + Red-Flags), D8 (doku-sync-Entfall), D9 (update-doks-Schnitt) | Router zuerst (D8 setzt ihn voraus); die zwei Hooks brauchen ihre Indizes |
| **I — Wissensfluss & Sanierungs-Normen** | D14 (sitzungswissen/GL1–GL5/end-session/start), D10 (Sanierungs-Normen inkl. Bauplan-Archivierung), D11 (Release-Runbook/E7), D12 (1b-Satz), D13 (doks-Governance-Entscheid) | Größter Umbau, braucht die Entscheide EN1/EN5/EN6/EN7 vorab |
| **J — Abteilung & Verteilung** | D19 (drei Subagenten), D20 (W4), D21 (Anlageweg), D22 (CI-Schnitt), D23-Prozessteil | Unabhängig von G–I parallelisierbar, aber nach H sinnvoller (Overlap-Prüfung gegen Router) |
| **K — Kleinteile-Sweep** | D15, D16, D17, D18 | Rest; D17 nach Entscheid EN8 |

## 5. Offene Maintainer-Entscheide (vor dem Bauplan)

| # | Entscheid | Hängt an |
|---|---|---|
| EN1 | **Sitzungswissen-Ziellayout:** `sitzungswissen/` committet in der Wissensbasis (Onsite-Parität; `242b9e7` deutet dahin) vs. `.nc/erinnerung/` lokal behalten (Alt-Entscheid E2a „Repo öffentlich") — inkl. Migrationsweg | D14 |
| EN2 | Gate-4-Entfall übernehmen (Doku-Umstellung) | D2 |
| EN3 | `/nc:doku-sync` entfernen, sobald Router steht | D8 |
| EN4 | Safety-Gate-Musterliste v1 im NovaCore-Zuschnitt (WZS-Verben: deploy/DB/webhook; was noch?) | D1 |
| EN5 | Release-Politik: E7 (ein Sammelrelease am Umbau-Ende) vs. Waypoint-Batch-Modell §3.6 | D11 |
| EN6 | doks/-Governance-Norm übernehmen oder begründet ablehnen | D13 |
| EN7 | `vorlagen/` von der Repo-Wurzel in die Wissensbasis umziehen | D10 |
| EN8 | Fit-Prüfung: Zuschnitt gegen `abteilungs-inhalts-pruefung.md` (Doppelung vermeiden) | D17 |

## 6. Verifikations-Anker

- Onsite-HEAD dieses Mappings: `6d3f8db` (Merge PR #122). Jede spätere Iteration misst ihr
  Delta **ab diesem** Anker.
- Eigene Gegenproben dieses Mappings: `nc-ffg.js` ohne Windows-Muster (Grep 2026-08-23) ·
  `nc-queue-faelligkeit.js` `mitSperre` nur `EEXIST`-Retry (Z. 218) · `ci.yml` volle Matrix ·
  `module-registry.json` `development.agents = {}` · Skill-Bestand Kern ohne `wissen-*`,
  `fit-pruefung`, Secrets-Prüfpunkt.

## Nachtrag N1 (2026-08-23) — Beauftragung und Entscheid-Auflösung

**Maintainer-Weisung (Lucas Vöhringer, 2026-08-23, wörtlicher Kern):** „wichtiger ist dass du
den finalen umbau des novacore OS auf onsite niveau und architektur bringst […] was die neuen
Funktionen angeht die geändert wurden was die Specs was die Releases was die Dokumentationen
und was die Standardprozesse angeht. […] das Wichtigste ist dass du dabei bedenkst dass es
hier im NovaCore-Marketplace einen anderen Plugin-Typen gegenüber dem ursprünglichen gibt —
die Affiliate-Plugins, die nicht standardmäßig an die SSOT angeschlossen werden."

### N1.1 Affiliate-Invariante (I-A0, hart, gilt für jeden Posten D1–D24)

NovaCore führt gegenüber dem Onsite-Vorbild die zusätzliche Marketplace-Kategorie
**`affiliate`** (heute: `kimi-code-plugin-cc`). Affiliate-Plugins sind **keine Abteilungen**:
keine Registry-Zeile, keine `pflege-auspraegung.json`, keine Kandidaten-Queue, kein
SSOT-Anschluss, kein Memory-Share (Begriffsnorm: `NovaCore-OS-SSOT-Definition.md`, Abschnitt
firmenintern ↔ affiliate). **Jeder portierte Onsite-Baustein wird vor Übernahme gegen diese
Invariante geprüft** — insbesondere alles, was über „alle Plugins", „alle Repos der
Infra-Registry" oder „alle Abteilungen" iteriert (D6 PR-Sichtbarkeit, D7 Router, D17
Fit-Prüfung, D19 Registry-`agents`): Affiliate-Plugins sind dort **auszunehmen** bzw. nie zu
erfassen. Die Standardprozess-Nachzüge (D10, D20, D21, D23) übernehmen Onsite-Wortlaute nur
mit der Affiliate-Abgrenzung des jeweiligen NovaCore-Prozesses.

### N1.2 Entscheid-Auflösung (Default: Onsite-Parität)

| # | Auflösung |
|---|---|
| EN1 | **Onsite-Parität:** Sitzungswissen wandert als `sitzungswissen/` in die Wissensbasis des OS-Repos (committet); der Maintainer-Commit `242b9e7` (.nc/ auf main) hat die Richtung vorweggenommen. Migrationsweg im Phase-I-Baustein; Alt-Entscheid E2a ist damit überstimmt |
| EN2 | **Übernehmen:** Gate 4 entfällt endgültig; Doku-Umstellung in Phase G |
| EN3 | **Übernehmen:** `/nc:doku-sync` wird mit dem Router-Bau entfernt (Phase H) |
| EN4 | **NovaCore-Zuschnitt:** Musterliste v1 = Onsite-Muster (tofu/terraform apply/destroy, generisches deploy mit Lese-Ausnahmen, mcp-Schreibverben) **plus** WZS-Domänen-Verben (Deploy/DB/Webhook); Wortlaut-Abnahme durch den Maintainer am Phase-G-PR |
| EN5 | **Übernehmen:** Release-Politik wechselt von E7 (ein Sammelrelease) auf das Waypoint-Batch-Modell (Aktualisierungs-Index §0/§3.6-Pendant); Umsetzung in Phase I, erster Waypoint schneidet den aufgelaufenen `[Unreleased]`-Bestand |
| EN6 | **Übernehmen, angepasst:** doks-Governance-Norm wird übernommen; ob unser `referenz/`-Bestand als reviewed gilt (er entstand reviewt), stellt der Phase-I-Baustein gegen die Onsite-Norm klar statt blind „unreviewed" zu stempeln |
| EN7 | **Übernehmen:** `vorlagen/` zieht in die Wissensbasis um (Phase I, mit Index-/Verweis-Sweep) |
| EN8 | **Übernehmen, angepasst:** Fit-Prüfung kommt; Ruleset-Source = `standardprozesse/`; Abgrenzung zur bestehenden `abteilungs-inhalts-pruefung.md` wird im Phase-K-Baustein dokumentiert (Fit = Plugin-Definitionen gegen Normlage, Inhalts-Prüfung = Fachinhalte) |

### N1.3 Besetzung und Vorgehen (Org-Ruleset)

Overseer (Fable) plant, baut die infrastrukturkritischen Teile (Hooks/Gates, Kern-Mechanik)
selbst und reviewt jede Delegation; reguläre, isolierte Bausteine gehen an Opus-Agenten mit
Plan-Sandwich-Vertrag; die gebündelten Doku-Nachzüge je Zyklusende trägt der
Sonnet-Executor (`@nc:sync-nachzug-executor`). Je Phase ein Branch + PR; Push/PR nur mit
Einzelfreigabe, Merge bleibt Maintainer. Quelle jedes Ports ist der reale Onsite-Code
(`git show origin/main:…`), nie das Gedächtnis; NC-Review-Härtungen unserer Bestands-Hooks
bleiben erhalten (Härtungs-Erhalt wie Bauplan 2026-08-15, I-Serie).

## Nachtrag N2 (2026-08-23) — Präzisierungen nach Maintainer-Rückfrage (live verifiziert)

- **D25 (N, Phase H — Vorbedingung für D7):** **Node-Doks-Definition** ist bei Onsite eine
  **gemergte Begriffsnorm** (`project-meta-infos/Onsite.ai-OS-Node-Doks-Definition.md`,
  §15.40-Begriffsnormierung): Node-Doks = Knotendokumente, die Fachinhalt **erschließen statt
  tragen** (Knoten vs. Blätter, fünf Knotendokumente, Kontext-Ökonomie-Regel: Mechanismen
  zeigen auf Knoten, nie auf jedes Blatt). D24 hatte den Strang pauschal als in-flight
  geführt — korrekt ist: die **Norm** ist gemergt und wird als
  `NovaCore-OS-Node-Doks-Definition.md` portiert; nur der Folge-Bauplan
  (node-doks + Gate-2-SSOT-Bezug) bleibt bei Onsite aktiv und damit in D24.
- **D26 (N + E, Phase I):** `project-meta-infos/Onsite.ai-OS-Systemachsen.md` ist **neu seit
  dem Referenzstand** (5c2c210 kennt es nicht) — Inhalt sichten, Port-Entscheid beim
  Phase-I-Zuschnitt.
- **D14-Präzisierung:** Onsites `pflege-auspraegung.md` trägt inzwischen die
  **Kriterienliste v2** (unsere ist v1) und den Abschnitt **§5.5 „Stufen-Prüfungen lokal →
  Abteilung" (GL1–GL5, §15.48.5)**. Der D14-Port umfasst damit auch die v1→v2-Anhebung —
  Wortlaut-Abnahme durch den Maintainer ist Pflicht (`kriterien-pflege.md` §2), Kern-Bump,
  `schemaVersion` nur bei Feld-Änderung.
- **Klarstellung „Sammel-PR":** Im Delta wurde **kein** Skill dieses Namens entfernt
  (Grep über Commits und Diff). Real entfernt/ersetzt wurden: `/oai:doku-sync` (D8) ·
  F1/F2-Zweiteilung von `update-doks` (D9) · Sequenzierungs-Gate (D20) ·
  Pre-Commit-Fangnetz (D8) · Spec-Fußzeilen + Spec-Versionszählung (D10) · `metaflow.md`
  als Datei (D11, Inhalt lebt im Aktualisierungs-Index §0/§3.6) · `.oai/erinnerung/`
  (D14). „abend-sammelpaket" war ein Onsite-Branchname, kein Skill.
- **Phase-G-Vollzug:** D1, D2, D3, D6 sind am 2026-08-23 gebaut (Branch
  `feat/onsite-delta-phase-g`, Suite 245/243/2 skip, 0 fail); D6 per Opus-Agent mit
  Plan-Sandwich-Vertrag, Overseer-reviewt. Offen im Zyklus: gebündelte Nachzüge
  (CHANGELOG-Batch, Kern-Bump 0.11.0 + VERSION/Registry, README-Hook-Tabelle,
  AGENTS-Produktstand) via Executor.

## Nachtrag N3 (2026-08-24) — Phase-H-Vollzug und Anker-Fortschreibung

- **Phase H ist gebaut und reviewt** (Nachtschicht 2026-08-24): D4, D5, D7, D8, D9, D25 —
  Branch `feat/onsite-delta-phase-h`, **PR #23** (stacked auf PR #22/Phase G). Kern
  0.12.0, Suite 249 → 312 (310 pass / 2 skip), GLM-5.3 R1+R2 („vollständig behoben,
  keine neuen Probleme"). Drei parallele Opus-Baupakete + Sonnet-Executor,
  Overseer-integriert.
- **Beobachtungs-Anker fortgeschrieben:** Onsite `origin/main` wanderte während der Nacht
  auf **`51e230f`** (PRs #121/#123 — Doku-Hygiene, u. a. **Vier-Knoten-Entscheid**-Fix,
  kein neuer Produktbaustein; Delta geprüft). Phase-H-Ports lasen live diesen Stand;
  die nächste Iteration misst ab `51e230f`.
- **Neue offene Posten aus Phase H:** Knoten-Entscheid `module-registry.json`
  (Knoten oder Blatt) · Ketten-Zeilen in den lebenden Standardprozessen (Onsite-Muster,
  vertagt) · `/nc:setup` schreibt `kernRepoPfad` nicht (D5 ruht bis dahin;
  D4/Router nutzen die `kernSsotPfad`-Zweitquelle — Overseer-Entscheid dokumentiert).
- **Offen bleiben die Phasen I, J, K** (D10–D18 Rest, D14 inkl. Kriterienliste v2 +
  GL1–GL5, D19–D23, D26 Systemachsen-Port [Entscheid: portieren]).

## Nachtrag N4 (2026-08-25) — Phase-I-Vollzug, Anker-Fortschreibung, vier neue Posten

- **Phase I ist gebaut** (Pakete I-A/I-B/I-C, Branch `feat/onsite-delta-phase-i`, Commits
  `e7e5f19`/`7a4db3a`/`bcb3f6b`, plus der gebündelte Nachzug dieses Zyklus): **D10**
  (Sanierungs-Normen — Statuslegende, Bagatellgrenze, Batch-Kadenzen, Spec-Governance ohne
  Versionszählung, Archivierungs-Sweep, `vorlagen/`-Umzug nach EN7), **D11**
  (Aktualisierungs-Index §0/§3.6, Waypoint-Batch-Modell statt E7-Sammelrelease nach EN5),
  **D12** (Team-Sync-Payload „Ein Archiv ist keine Wissensquelle" + Meta-Regeln +
  Multi-Agent-Ruleset in `nc-sync.md`), **D13** (`referenz/`-Einstufung nach EN6, angepasst:
  dokumentierter Review-Vorgang je Datei statt pauschalem `unreviewed`-Stempel), **D14**
  (Sitzungswissen-Umzug: `.nc/erinnerung/` entfällt ersatzlos, `sitzungswissen/` im OS-Repo,
  GL1–GL5, `end-session`/`start` neu gefasst, Kriterienliste v2), **D15** (`NC_SECRETS_REF`),
  **D18** (Zähl-Wahrheits-Prüfung), **D26** (`NovaCore-OS-Systemachsen.md`). **D15 und D18**
  waren ursprünglich Phase K („Kleinteile-Sweep", Abschnitt 4) zugeordnet — sie wurden als
  kleine, unabhängige Posten in den Phase-I-Nachzug vorgezogen (Sonnet-Executor-Bündelung am
  PR-Ende, Org-Ruleset N1.3), statt auf den Beginn von Phase K zu warten.
- **Beobachtungs-Anker fortgeschrieben:** Onsite `origin/main` wanderte auf **`2530ced`**,
  Kern **0.26.0** (zuvor `51e230f`, Kern 0.12.0-Referenzstand aus Nachtrag N3). Die nächste
  Iteration misst ihr Delta **ab `2530ced`**.
- **Vier neue Posten** (aus dem laufenden Nachbau, nicht Teil des ursprünglichen
  D1–D26-Inventars):

  | # | Posten | Klasse | Phase | Status |
  |---|---|---|---|---|
  | D27 | Scratchpad-Norm (`scratchpad-nutzung.md`, R1 Arbeiten/R2 Ersetzen/R3 Erfassen) | **N** | I | gebaut (C7) |
  | D28 | Queue-Fälligkeit als Handlungsanweisung (nicht nur Hinweis) | **N** | J | offen |
  | D29 | Standardprozess `jira-workflow.md` | **N** | J/K | offen |
  | D30 | `workflow.md` abteilungsoptional (nicht jede Abteilung zwingend) | **P** | J | offen |

- **Offen bleiben:** die Phasen J/K in vollem Umfang (D16, D17, D19–D23, D28–D30); D15/D18
  sind mit diesem Nachtrag erledigt und aus dem Phase-K-Rest gestrichen.

## Nachtrag N5 (2026-08-25) — Onsite 0.27.0, Anker-Fortschreibung, sieben neue Posten

- **Beobachtungs-Anker fortgeschrieben:** Onsite `origin/main` wanderte von `2530ced`
  (Kern **0.26.0**, Anker aus Nachtrag N4) auf **`a9927b2`**, Kern **0.27.0** (Release
  2026-08-25). Delta: **37 Commits, 53 Dateien, +2.036/−399 Zeilen** (`git diff --stat
  2530ced..origin/main`). Die nächste Iteration misst ihr Delta **ab `a9927b2`**.
- **Klarstellung zu „Team-Sync-Payload erweitert (#130)":** Der Eintrag steht zwar in
  Onsites 0.27.0-Sektion, liegt aber **vor** dem Anker — `2530ced` **ist** der Merge von
  #130. Der Posten ist als **D12** bereits in Phase I (PR #25) gebaut
  (`plugins/nc/nc-sync.md`: Meta-Regeln + Multi-Agent-Ruleset + „Ein Archiv ist keine
  Wissensquelle"). **Kein neuer Posten.** Onsite hat ihn nur deshalb im Release-Text,
  weil dessen Waypoint-Batch alle seit 0.26.0 gemergten PRs zusammenfasst.
- **Sieben neue Posten** (D31 ff., aus dem 0.27.0-Delta):

  | # | Posten | Klasse | Phase | Status |
  |---|---|---|---|---|
  | D31 | Anker-Reservierung ersatzlos aufgehoben (Onsite #138, `7d172c1`) | **P + E** | J | offen |
  | D32 | Setup-Hinweis-Hook `oai-setup-hinweis.js` + `hooks/lib/infra-registry.js` (OS-36, #137) | **N** | J | offen |
  | D33 | Safety-Gate: Fehlalarm-Härtung `NAME=wert`-Wertentscheidung (#131) | **N** | J | offen |
  | D34 | Contributing-Flow S1–S7 + Strang-Definition (#132, Jira OS-14) | **N + E** | J | offen |
  | D35 | SSOT-Sichtbarkeitsmodell der Abteilungs-SSOT (#134, `b18016d`) | **P + E** | J | offen |
  | D36 | `oai-development` v0.13.3 — ISENTO-Jira-Ticket-Schreibkonvention (#139) | **X** | — | entfällt (Prozessteil in D29) |
  | D37 | Ideen-Backlog „Referenz-Testbaustein für Satelliten-Suiten" (2026-08-25) | **B** | — | beobachten |

### N5.1 D31 — Anker-Reservierung ersatzlos aufgehoben (**P + E**, Phase J)

**Onsite-Fundstelle:** Maintainer-Entscheid 2026-08-25, PR #138, Commit `7d172c1`. Gelöscht
wurden **beide** Dokumente: `plugin-maintanance-ruleset-source/anker-reservierung.md` und
`project-meta-infos/Onsite.ai-OS-Anker-Reservierung-Definition.md` (`git diff --name-status`
führt sie als `D`). Die letzte verbliebene Ankerklasse (Skill-/Agent-/Hook-**Name**) entfällt;
die Absicherung trägt jetzt allein die Mechanik: Merge-Konflikt bei Dateikollision,
Suite-Invariante gegen doppelte Spec-Abschnittsnummern. Bereinigt wurden im selben Zug
`skills/skill-builder`, `wissen-aendern`, `wissen-planen`, `fit-pruefung/rubrik.md` und der
tote Eintrag in `hooks/wissen-sucheindex.json`; die Kettenzeile „Anker gesetzt
(`anker-reservierung.md`) →" verschwand aus `kern-plugin-bau.md`, `abteilungs-plugin-bau.md`,
`subagenten-bau.md`, `wissens-router-bau.md` und `abteilungs-inhalts-pruefung.md`, und
`Aktualisierungs-Index` §3.3 sagt jetzt wörtlich „**Es wird nichts reserviert**" — was bleibt,
ist Pflichtschritt 8: fremde Worktrees vor dem ersten Schreiben prüfen.

**Befund gegen NovaCore-Ist:** Wir haben am 2026-08-24 mit Entscheid **P-E2** das Gegenteil
gebaut — *Begriffsnorm behalten, Git-Ref-Mittel entfernen*. Belegt durch die Banner beider
Dateien: `knowledge-base/standardprozesse/anker-reservierung.md` Z. 3–12 („das Git-Ref-Mittel
ist entfallen … **Was bleibt:** die **Begriffsnorm Anker**") und
`knowledge-base/grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md` Z. 3–10 („Die
Begriffsnorm dieses Dokuments gilt unverändert … Aufgehoben ist das Mittel"). Onsite ist einen
Schritt weiter gegangen und hat auch die Begriffsnorm gestrichen.

**Nach N1.2 gilt Onsite-Parität als Default, Vorschlag also:** beide Dateien ersatzlos
streichen, Ketten-/Verweiszeilen und Sucheindex bereinigen. Der Posten trägt trotzdem ein
**E**, weil er einen erst gestern getroffenen eigenen Entscheid (P-E2) überstimmt — das ist
Maintainer-Sache, nicht Agenten-Sache.

**Verweis-Sweep (`git grep -il 'anker-reservierung|Anker-Reservierung'`, 31 Dateien):**
`AGENTS.md` · `CHANGELOG.md` · `README.md` · `knowledge-base/SSOT-Document-Index.md` ·
`aktive-bauplaene/2026-08-16-nc-development-modernisierung-bauplan.md` ·
`aktive-bauplaene/2026-08-24-onsite-delta-phase-i-bauplan.md` ·
`bauplan-archiv/2026-08-15-onsite-endstand-nachbau-bauplan.md` ·
`debugging-findings/agent-learnings.md` · drei Berichte in `firmenkernprozesse/`
(2026-08-14-Bericht, 2026-08-15-Entwicklungs-Recap, 2026-08-15-USPs) ·
`firmenkernprozesse/prozesskarten/00-FAMILIE-UND-VERDRAHTUNG.md`,
`…/01-aktualisierungs-index.md`, `…/09-anker-reservierung.md`, `…/README.md` ·
`firmenkernprozesse/team-rollout-infrastruktur/03-META-PROZESSE-UND-DATENFLUESSE.md` ·
`grundwissen/2026-08-16-novacore-agent-sdk-gui-architektur.md` ·
`grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md` ·
`grundwissen/NovaCore-OS-Kriterienliste-Definition.md` ·
`grundwissen/NovaCore-OS-Node-Doks-Definition.md` ·
`sitzungswissen/gemeinsam/journal/2026-08-16.md` ·
`sitzungswissen/offene-straenge-register.md` ·
`standardprozesse/abteilungs-inhalts-pruefung.md`, `…/aktualisierungs-index.md`,
`…/anker-reservierung.md`, `…/os-bau-methode.md` · `plugins/nc/hooks/wissen-sucheindex.json` ·
`plugins/nc/skills/wissen-aendern/SKILL.md`, `…/wissen-nachschlagen/SKILL.md`,
`…/wissen-planen/SKILL.md` · `plugins/nc/tests/struktur.test.mjs`.
**Sechs davon sind Historie und bleiben unangetastet** (CHANGELOG, Bauplan-Archiv, Journal,
die drei datierten Firmenkernprozess-Berichte); der Rest ist echter Nachzug. Zwei Grenzfälle:
`plugins/nc/tests/struktur.test.mjs` hängt eine Struktur-Invariante am Dateinamen — sie fällt
mit der Datei und muss im selben Paket geändert werden, sonst ist die Suite rot; und die
Prozesskarte `09-anker-reservierung.md` ist ein eigenes Dokument mit eigener
Familien-Verdrahtung (`00-FAMILIE-UND-VERDRAHTUNG.md`), ihre Löschung zieht Nummernkreis und
Verdrahtung nach. Das ist der aufwendigste Teil des Postens.

### N5.2 D32 — Setup-Hinweis-Hook (**N**, Phase J)

**Onsite-Fundstelle:** OS-36, PR #137, Commits `48153ab` (Hook v1 + Registry-Lib), `9de9e02`
(Zustandsmaschine), `f0483ec` (Tests), `2145ecf` (Registrierung), `214a991` (Review-Fixes);
Dateien `plugins/oai/hooks/oai-setup-hinweis.js`, `plugins/oai/hooks/lib/infra-registry.js`,
`plugins/oai/tests/oai-setup-hinweis.test.mjs` (21 Tests), Bauplan
`Aktive Baupläne/2026-08-25-setup-hinweis-hook.md`, Betriebshandbuch §6.5b.

**Mechanik aus der Quelle** (Hook-Kopf und Betriebshandbuch §6.5b, live gelesen):
SessionStart, **kein Gate** — SessionStart kann laut Doku ohnehin nicht blocken. Geprüft wird
der **init-Beleg** der Maschine, die Infra-Registry `~/.claude/oai/infra.json` (der
`init`-Skill ist ihr einziger Schreiber — „die Platte ist die Wahrheit").
**Pflichtfelder:** `schemaVersion`, `abteilung`, `szenario` (String-tolerant), dazu
Pfad-Liveness je `kernRepoPfad`/`abteilungsRepoPfad` (`.git` als **Datei** zählt →
Worktree-Lage; die Windows-8.3-Kurzpfad-Tilde ist **kein** Relativ-Pfad-Indiz, Debug-Log
`0763260`; `"ausstehend"` ist allein im `abteilungsRepoPfad` grün).
**Zustandsmaschine, erster Treffer gewinnt:** `fehlt` · `neuer` (`schemaVersion` höher als der
installierte Kern → Anweisung *Marketplace-Update*, nicht init) · `defekt` (Pflichtfeld fehlt,
toter Pfad, unzulässiges `ausstehend` im `kernRepoPfad`) · `gruen` = **stumm** (null Token auf
eingerichteten Maschinen). Bei den ersten drei injiziert er **höchstens einmal je Sitzung**
eine **Anweisung zum Handeln** (Muster Queue-Fälligkeit): `/oai:init` ausführen oder an einen
Subagenten delegieren. Der Sitzungsmarker liegt in `os.tmpdir()` und verhindert den
**Compact-Hijack** (Review-Befund H1: sonst stünde die Anweisung nach jeder
Auto-Kompaktierung erneut mitten in laufender Arbeit); ein defekter Marker gilt als *bereits
gezeigt* (Noise-Safety). **Opt-out `OAI_SETUP_HINWEIS=off`**, **Subagenten ausgenommen**,
**fail-open** (jede Exception → Exit 0). Kein Cron, kein Scheduler, kein Netz, kein
Git-Aufruf. Test-Umleitungen `OAI_SETUP_STATE_DIR` / `OAI_SETUP_SESSION_DIR`. Die neue Lib
`hooks/lib/infra-registry.js` konsolidiert die **vierte** Lesestelle der Registry; die
Bewertung bleibt im Hook.

**Befund gegen NovaCore-Ist:** `plugins/nc/hooks/hooks.json` registriert **neun** Hooks
(`nc-session-start`, `nc-doks-autosync`, `nc-queue-faelligkeit`, `nc-wissens-hinweis`,
`nc-end-mahnung`, `nc-ffg`, `nc-start-gate`, `nc-safety-gate`, `nc-pfad-hinweis`) — **keiner
prüft den Setup-Beleg**. `infra.json` wird bei uns an drei Stellen gelesen
(`nc-queue-faelligkeit.js:229`, `nc-wissens-hinweis.js:115`, `nc-pfad-hinweis.js:104`), eine
gemeinsame Lib fehlt — Onsites Konsolidierungsgrund gilt bei uns also genauso.
**`nc-session-start.js` liest `infra.json` nicht** (kein Treffer im Grep über
`plugins/nc/hooks/`). Der Port bringt damit zwei Dinge: den Hook **und** die Lib-Extraktion
der drei Bestands-Lesestellen.

**Affiliate-Invariante (N1.1):** Der Hook iteriert über die Registry-Pfade. Affiliate-Plugins
und Kollegen-OS stehen per Isolations-Invariante nie in der Registry und werden folglich nie
belegt-geprüft — die Port-Formulierung muss das benennen statt es stillschweigend mitzunehmen.

**Bekannte NovaCore-Vorbedingung:** `/nc:setup` schreibt `kernRepoPfad` heute nicht (offener
Strang seit Phase H, Registerzeile 2026-08-24). Der Zustand `defekt` würde bei uns also
flächendeckend feuern, solange das nicht gebaut ist — der Port hängt an jenem Vorgang, oder
das Feld muss im NC-Zuschnitt optional bleiben. **Overseer-Entscheid, hier bewusst offen
gelassen.**

### N5.3 D33 — Safety-Gate: Fehlalarm-Härtung der `NAME=wert`-Zuweisung (**N**, Phase J)

**Onsite-Fundstelle:** PR #131, Commits `d2e5342`/`eaa4149`,
`git diff 2530ced..origin/main -- plugins/oai/hooks/oai-safety-gate.js` (+98 Testzeilen).

**Mechanik in drei Sätzen:** Bei einem `NAME=wert`-Token entscheidet nicht mehr der Name,
sondern der **Wert**, in drei Stufen — deploy-Wort **im Wert** fragt (`MODE=deploy-prod`),
deploy-Wort **im Namen** mit Prod-Wert fragt ebenfalls (`DEPLOYMENT_TYPE=prod` *ist* die
Auslieferungs-Entscheidung), jeder andere Wert bleibt still (`DEPLOYMENT_TYPE=dev`). Als Prod
zählt jeder Wert mit **Präfix** `prod`/`prd`/`live` (Konstante `PROD_PRAEFIXE`, deshalb auch
`prod-eu`, `prod2`, `production-blue`, `prd-01`; `preprod` braucht keine Ausnahme, weil es
nicht mit `prod` beginnt) sowie jeder statisch nicht auflösbare Wert (`$VAR`, `${…}`,
Kommando-Substitution, Backticks) — konservativ wie Muster 2. Der Zuweisungs-Pass läuft auf
dem **quote-awaren** Tokenstrom (sonst fiele `DEPLOYMENT_TYPE="prod"` durch), bewertet aber
nur Namen, die im quote-**bereinigten** Strom als echte Zuweisung auftauchen — sonst feuerte
`git commit -m "DEPLOYMENT_TYPE=prod"`; ein leerer Wert ist kein Prod-Ziel. Anlass war ein
belegter Fehlalarm im Arbeits-Repo `partsens` (`make up DEPLOYMENT_TYPE=dev`, der lokale
Containerstart).

**Befund gegen NovaCore-Ist:** `plugins/nc/hooks/nc-safety-gate.js` hat die
Verbpositions-Regel (`DEPLOY_AUSNAHMEN` Z. 171, `deployTreffer` Z. 218–223) und kennt
Zuweisungen nur als **Präfix-Überspringer** (`ZUWEISUNG` Z. 123, benutzt in Z. 132, um
führende `VAR=wert` vor dem Binary zu überlesen). `TRAEGT_DEPLOY` ist bei uns unverändert
`(t) => /deploy/i.test(t)` (Z. 172) — **keine Wertentscheidung, kein `PROD_PRAEFIXE`**. Die
Fehlalarm-Klasse existiert bei uns damit unverändert: jedes `make up DEPLOYMENT_TYPE=dev`
erzeugt einen Freigabedialog. Unsere NC-Härtung „reine Lesekommandos mit deploy-Wort nur im
Argument fragen nie" deckt den Fall **nicht** ab, weil `make`/`env` keine Lesekommandos sind.
Fehlalarm-Schutz ist auch bei uns Abnahmekriterium (Hook-Kopf) — der Port ist keine Kür.

### N5.4 D34 — Contributing-Flow S1–S7 + Strang-Definition (**N + E**, Phase J)

**Onsite-Fundstelle:** PR #132, Jira OS-14 (aus Desktop-TODO T11), Commits `c0536e3`
(Standardprozess + Begriffsnorm), `270a228` (Challenger-Review: 1 Critical, 5 Important),
`2b2751d` (Rollenbesetzung). Neue Dateien:
`plugin-maintanance-ruleset-source/contributing-flow.md` und
`project-meta-infos/Onsite.ai-OS-Strang-Definition.md`; dazu `CONTRIBUTING.md` um einen
Flow-Absatz erweitert und der Wissens-Sucheindex ergänzt.

**Inhalt aus der Quelle:** Ein **Strang** ist die beauftragte Arbeitseinheit von der Übernahme
(Jira-Ticket „In Arbeit" oder Maintainer-Auftrag) bis zum gemergten PR — genau ein Ziel-Repo,
genau ein Branch im Schema `<typ>/<thema>` (`feat`/`fix`/`docs`/`chore`/`update`), genau ein
Worktree `.worktrees/<branch>`, genau ein PR-Ergebnismemo als Wissensträger, und ein Ende, das
das Aufräumen von Branch und Worktree einschließt. Der Standardprozess führt die Stationen
**S1 Vorlauf · S2 Strang anlegen · S3 Bauen (versionslos) · S4 Abschluss · S5 Einreichen
(Freigabe nötig) · S6 Review + Merge · S7 Übergabe an den Release-Zug** mit je einer
QS-Spalte. Tragende Regel: *Agenten bereiten bis zum fertigen PR vor, Menschen entscheiden*;
Versionen vergibt ausschließlich der Release-Zug. **S6 und S7 trägt namentlich der
Systemarchitekt Lucas Vöhringer — bewusst kein Agent.** Abgrenzungen sind explizit gesetzt:
Queue-Flow = Aufstieg von *Wissen*, dieser Prozess = *Arbeits*-Beitrag; das Release-Runbook
bleibt `Aktualisierungs-Index` §3.6; das *Was* regeln `kern-plugin-bau.md` /
`abteilungs-plugin-bau.md`.

**Befund gegen NovaCore-Ist:** `git grep -il 'contributing-flow|Strang-Definition'` über den
Worktree ist **leer** — beides fehlt vollständig. Wir führen ein Offene-**Stränge**-Register
und benutzen den Begriff durchgehend, haben ihn aber nirgends definiert; dieselbe Lücke, die
Onsite mit OS-14 geschlossen hat.

**Warum zusätzlich E:** Die Rollenbesetzung ist bei uns nicht deckungsgleich. Onsite hat einen
Systemarchitekten, der S6/S7 persönlich trägt; bei NovaCore steht in der Firmenspezifikation
ein Team mit den Abteilungen dev, ui-ux und automation, dazu ein Multi-Agent-Ruleset, in dem
der Overseer plant und reviewt und der Maintainer mergt. Der Zuschnitt von S6/S7 auf reale
NovaCore-Rollen ist ein Maintainer-Entscheid, kein Übersetzungsschritt.

**Affiliate-Invariante (N1.1):** Der Prozess spricht von „Kern oder Satellit" und iteriert
damit über die Plugin-Landschaft. Affiliate-Plugins sind **ausgenommen** — sie folgen dem
Beitrags-Flow des OS nicht und stehen nie in der Infra-Registry.

### N5.5 D35 — SSOT-Sichtbarkeitsmodell der Abteilungs-SSOT (**P + E**, Phase J)

**Onsite-Fundstelle:** Maintainer-Entscheid 2026-08-25, PR #134, Commit `b18016d`
(Spec-Nachtrag 2026-08-25, präzisiert §15.24 E3, deutet E6/AP3 um). Berührt:
`Onsite.ai-OS-SSOT-Definition.md`, `kern-ssot-aufbau.md` §1/§4, `abteilungs-plugin-bau.md`
§3.1 Schritt 5, `queue-flow.md` §5/§6.2, `skills/queue-kern/SKILL.md` Schritt 9 + Regelblock,
Plugin-README.

**Der Entscheid:** Die Abteilungs-SSOTs bleiben **privat**. In den Kern steigt je beförderter
Sache ein **konzentriertes Fakten-Dokument** auf — die firmenweit handlungsnötigen Fakten,
Datum und Herkunftsabteilung im Kopf, die **auflösbare** Fundstelle (Pfad, PR oder Commit; bei
Ideen die Queue-Zeile). Das Vollprotokoll bleibt in der Abteilung, Zugriff darauf wird **bei
Bedarf angefragt**. Die Verbindungsregel wechselt damit von „Kern verlinkt, Abteilung
dokumentiert" auf **„Kern verdichtet und verweist, Abteilung dokumentiert vollständig"** —
nie eine Volltext-Kopie, nie das umgezogene Original. Zwei abgeleitete Regeln: fehlt einer
Queue-Zeile der auflösbare Verweis, ist das ein **Befund für den Kurator** im Prüfprotokoll
(kein Formfehler, den der Skill still heilt); und der Cross-Abteilungs-Zugriff ist kein
Standing-Read mehr, sondern eine Anfrage — der Bau dieses Anfragewegs bleibt bei Onsite als
`AP3` in neuer Deutung offen.

**Befund gegen NovaCore-Ist:** Wir tragen durchgehend die **alte** Formel.
`plugins/nc/skills/queue-kern/SKILL.md` Z. 191–192: „Inhalt ist **Einzeiler + Verweis auf die
Abteilungsquelle** — ‚Kern verlinkt, Abteilung dokumentiert', nie eine Volltext-Kopie", und
Z. 288 im Regelblock: „**Kein Volltext im Kern** — Einzeiler + Verweis". Dazu
`knowledge-base/standardprozesse/queue-flow.md` Z. 61 (Spalte „Verweis statt Volltext") und
Z. 65 (Station 6 wörtlich „Kern verlinkt, Abteilung dokumentiert") sowie
`knowledge-base/grundwissen/NovaCore-OS-SSOT-Definition.md` Z. 90. Der Port ist damit ein
Vier-Dateien-Nachzug plus Kern-Bump (Skill-Änderung = Produktklasse).

**Warum zusätzlich E:** Die Privatheits-Prämisse ist bei Onsite real — dort sind die
Abteilungs-Satelliten getrennte, teils fremd-gelesene Repos. Bei uns gilt der
Übergangszustand E1: die Abteilungs-Queue lebt noch im OS-Repo selbst, es gibt also derzeit
gar keine Grenze, über die hinweg angefragt werden müsste. Ob wir das Modell **jetzt**
übernehmen (Vorratsnorm) oder erst mit dem echten Satelliten-Split, ist Maintainer-Sache.

**Affiliate-Invariante (N1.1):** Das Modell spricht von „allen Abteilungen". Affiliate-Plugins
haben keine Abteilungs-SSOT im Sinne dieses Flows und sind aus Aufstieg wie Anfrageweg
**ausgenommen**.

### N5.6 D36 / D37 — nicht zu bauen

- **D36 (X):** Marketplace-Pin `oai-development` v0.13.2 → v0.13.3 (#139, `c76ccab`) trägt die
  **ISENTO**-Jira-Ticket-Schreibkonvention — eine Kundenkonvention von Onsites Abteilung,
  firmenspezifisch und für NovaCore gegenstandslos. Der **Prozessteil** (wie Jira-Tickets
  überhaupt geschrieben und bewegt werden) ist bei uns bereits als **D29**
  (`jira-workflow.md`) erfasst und geht dort auf.
- **D37 (B):** `Feature-idea-backlog/2026-08-25-referenz-testbaustein-satelliten-suiten.md` —
  versionierter Referenz-Testbaustein für die Satelliten-Testsuiten, damit deren
  Near-Duplikate nicht auseinanderdriften. **Bei Onsite selbst Idee, nicht beauftragt**
  („Status: Idee, nicht beauftragt"); der Mechanismus existiert dort erst für genau eine Datei
  (`agenten.test.mjs` mit Baustein-Version im Kopf, `subagenten-bau.md` §7). Beobachten, bis
  Onsite entscheidet.

### N5.7 Restprüfung der übrigen geänderten Onsite-Dateien

Jede weitere Datei des `--name-status`-Laufs wurde per
`git diff 2530ced..origin/main -- <pfad>` gesichtet. **Kein weiterer eigenständiger Posten
gefunden** — alle gehen in D31–D35 auf:

- `Aktualisierungs-Index.md` (§3.3 „Es wird nichts reserviert", Ref-Zeile der Design-Matrix,
  gestrichener `reserve/*`-Aufräumschritt) · `abteilungs-inhalts-pruefung.md` ·
  `kern-plugin-bau.md` · `subagenten-bau.md` · `wissens-router-bau.md` ·
  `Onsite.ai-OS-Kriterienliste-Definition.md` (Beispielzeile umformuliert) — **geprüft, geht
  in D31 auf.**
- `Onsite.ai-OS-Gates-Definition.md` (Gate-3-Zeile um die Wertentscheidung ergänzt) ·
  `SECURITY.md` (Musterlisten-Absatz Gate 3 **und** neue Garantie-Zeile für den
  Setup-Hinweis) · `Onsite.ai-OS-Betriebshandbuch.md` (Reifegrad Ebene 5, neuer §6.5b,
  Muster-/Fehlalarm-Tabelle, Opt-out-Liste) · `plugins/oai/skills/os-info/SKILL.md`
  (Opt-out-Liste) · `plugins/oai/README.md`, `AGENTS.md`, `CLAUDE.md`,
  `module-registry.json`, `VERSION`, `plugin.json`, `.claude-plugin/marketplace.json` —
  **geprüft, reine Doku- und Release-Nachzüge zu D32/D33**; unsere Pendants fallen ohnehin
  erst mit dem jeweiligen Bau an.
- `queue-flow.md` (neue Regel „Der Kern-Beitrag ist ein Fakten-Dokument", AP3 in neuer
  Deutung, AP-K10 auf „erster realer `queue-kern`-Lauf am 2026-08-25 läuft" fortgeschrieben) ·
  `kern-ssot-aufbau.md` (Verbindungsregel + zwei Tabellenzeilen) ·
  `Onsite.ai-OS-SSOT-Definition.md` (neuer Sichtbarkeits-Absatz) ·
  `abteilungs-plugin-bau.md` §3.1 · `skills/queue-kern/SKILL.md` — **geprüft, geht in D35
  auf.** Der AP-K10-Fortschritt ist Onsite-Betriebslage; unsere eigene Queue-Praxisprobe
  steht bereits als Registerzeile (2026-08-16).
- `CONTRIBUTING.md` — **geprüft, geht in D34 auf.**
- `plugins/oai/skills/init/SKILL.md`: nimmt den vierten Satelliten `mikrobiologie` in die
  Abteilungsliste auf (Drift-Korrektur, `35d1253`). **Onsite-eigener Bestand, kein
  NovaCore-Posten** — unsere Abteilungen sind dev, ui-ux und automation.
- `Debugging + findings/debug-log.md` (`0763260`, Windows-8.3-Kurzpfad-Tilde als Fehlalarm im
  Pfad-Check) und `agent-learnings.md` (`caa1a8e`, stdin-Hänger durch Rest-`cat` im
  verketteten Bash-Zug): Onsite-Sitzungswissen. Der Tilde-Befund ist als Umsetzungsdetail in
  D32 vermerkt, der stdin-Befund betrifft Arbeitsweise, nicht Produkt. **Kein eigener Posten.**
- `Queue-Protokolle/queue-protokoll-development-2026-08-25.md` (`006212d`) und
  `Bauplan-archiv/2026-08-25-zuordnungshilfe-rote-linien-sammelklausel.md` (`356763d`,
  Kuration nach PR #133): Onsite-Betriebsartefakte des eigenen Queue-Laufs. **Kein Posten.**
- `Aktive Baupläne/2026-08-13-claude-ebenen-inhalts-standards.md`: bei Onsite weiterhin
  **aktiv** — bleibt auf der Beobachtungsliste (D24), kein Nachbau-Posten.

### N5.8 D24-Beobachtungsliste — Delta gegen N3

`git ls-tree --name-only origin/main "knowledge base/Aktive Baupläne/"` gegen `a9927b2` zeigt
**zwölf Dateien / elf Stränge** (mneme-dreaming zählt mit Makro- und Mikroarchitektur zwei
Dateien):

- **Unverändert aus der N3-Liste, alle noch aktiv:** mneme-dreaming (Makro + Mikro) ·
  ssot-krake (`2026-08-17`) · init-cli-Bootstrap (`2026-08-18`) ·
  Nachzug-Kadenz/Executor-Umbau (`2026-08-18`) · Node-Doks-Folgeplan
  (`2026-08-18-node-doks-definition-und-gate2-ssot-bezug`) · Claude-Ebenen-Inhalts-Standards
  (`2026-08-13`) · dev-Plugin-Inhalts-Modernisierung (`2026-08-14`) · SSOT-Sanierung
  (`2026-08-21-ssot-sanierung-governance`).
- **Neu auf der Liste (drei):** `2026-08-21-doku-nachzug-nachtlauf.md` ·
  `2026-08-23-scratchpad-norm.md` (bei uns als **D27** bereits gebaut — der Onsite-Plan steht
  dort noch aktiv) · **`2026-08-25-setup-hinweis-hook.md`** (die Planquelle zu D32).
- **Archiviert seit N3: keiner.** Neu im `Bauplan-archiv/` liegt allein die
  Zuordnungshilfe-Sammelklausel (`2026-08-25`), die nie auf der aktiven Liste stand.

Die Beobachtungsliste wächst also, ohne dass etwas abgeräumt wurde — für die nächste Iteration
relevant, weil jeder dieser Stränge ein künftiger D-Posten werden kann.

**Offen bleiben: Phasen J/K (D16, D17, D19–D23, D28–D30) plus D31–D37 aus 0.27.0;
Phase-J-Bauplan `2026-08-25-onsite-delta-phase-j-bauplan.md` schneidet sie.**

---

*Angelegt 2026-08-23 durch Claude (Fable 5, Claude Code) als Overseer-Mapping auf Weisung
Lucas Vöhringer; Quellen: Onsite.ai-OS `origin/main@6d3f8db`, NovaCoreAI-OS `main@242b9e7`.
Nachtrag N1 am selben Tag nach Maintainer-Weisung (Beauftragung, Onsite-Parität,
Affiliate-Invariante); Nachtrag N2 am selben Tag (Node-Doks/Systemachsen/Kriterienliste-v2,
Phase-G-Vollzug); Nachtrag N3 am 2026-08-24 (Phase-H-Vollzug, Anker `51e230f`); Nachtrag N4
am 2026-08-25 (Phase-I-Vollzug, Anker `2530ced`, D27–D30); Nachtrag N5 am 2026-08-25
(Onsite 0.27.0, Anker `a9927b2`, D31–D37).*

## Nachtrag N6 — Phase-J-Vollzug (2026-08-26, Orchestrator-Nachtschicht)

**Vollzogen** auf `feat/onsite-delta-phase-j` (Basis: main nach PR #30), Bauplan
`2026-08-25-onsite-delta-phase-j-bauplan.md` mit Nachträgen N1–N3, Nachtschicht-Plan
`2026-08-25-nachtschicht-phase-j.md` (zwei Sonnet-Bau-Agenten + Orchestrator):

- **D31 Anker-Aufhebung** (J-D): beide Dateien + Prozesskarte 09 gelöscht, Begriffsnorm
  als Absatz in `os-bau-methode.md`, N5.1-Sweep über alle lebenden Fundstellen;
  `aktualisierungs-index.md` §3 sagt jetzt „Es wird nichts reserviert".
- **D22 CI-Kostenschnitt** (J-D, J-E2): `ci.yml` Regelfall ein Job `pruefung`
  (ubuntu/node 24), Vollmatrix nur bei Dispatch/Tag `nc--v*`; Bot-Registerzeile ohne
  Handlungsbedarf geschlossen.
- **D33 Safety-Gate-Wertentscheidung** (J-A): `NAME=wert` bewertet nur real zugewiesene
  Namen, Wert entscheidet dreistufig; Härtungen zeichengleich (J-1), T1–T7 in der Suite.
- **D28 Queue-Handlungsanweisung** (J-A): Titel „JETZT ausführen (keine Blockade)",
  Anweisung an die Session inkl. Subagenten-Weg und Stempel-Kommando (T14).
- **D32 Setup-Hinweis** (J-A): zehnter Hook `nc-setup-hinweis.js` (kein Gate, kein Netz,
  fail-open, `NC_SETUP_HINWEIS=off`), `/nc:setup` schreibt `kernRepoPfad` + Pflichtfelder,
  `lib/infra-registry.js` als eine Leseimplementierung, `os-info` zeigt den Beleg (T8–T13).
- **D19 Subagenten** (J-B): `code-reviewer`/`pipeline-praeflight`/`test-luecken-scout`,
  Overlap-Matrix, Registry-`agents`; **Diagnose-Klasse** im Prüfbaustein 1.4.3
  implementiert (Nachtrag N3 des Bauplans — Konflikt J-E3 ↔ No-Diff-Zone gelöst).
- **D20/D21/D34/D35** (J-C): Hook-Norm W4 mit Struktur-Invariante, Anlageweg-Weiche §3.0
  mit Befristung, `contributing-flow.md` + `NovaCore-OS-Strang-Definition.md`,
  SSOT-Sichtbarkeitsmodell als Vorratsnorm.

**Anker-Fortschreibung:** Die Suite-Invariante „keine doppelte CHANGELOG-Versionsüberschrift"
ist jetzt die einzige deterministische Anker-Prüfung (so auch `os-bau-methode.md`).

**Rest für Phase K:** D16 (`skill-builder`/`os-info` Metaflow-Stand), D17 (Fit-Prüfung),
D24-Beobachtungsliste, Migration der drei Registry-Leser auf `lib/infra-registry.js`,
WZS-Deploy-Muster (wartet auf Maintainer-Weiche), Jira Block B/C, Betriebshandbuch,
Achse-2-Task, Skill-Größendeckel, Satellitenanschluss Queue-Flow. Nicht aufgenommen:
`oai-development` ISENTO-Jira-Konvention (X), Referenz-Testbaustein-Backlog (B).
