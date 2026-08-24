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

---

*Angelegt 2026-08-23 durch Claude (Fable 5, Claude Code) als Overseer-Mapping auf Weisung
Lucas Vöhringer; Quellen: Onsite.ai-OS `origin/main@6d3f8db`, NovaCoreAI-OS `main@242b9e7`.
Nachtrag N1 am selben Tag nach Maintainer-Weisung (Beauftragung, Onsite-Parität,
Affiliate-Invariante); Nachtrag N2 am selben Tag (Node-Doks/Systemachsen/Kriterienliste-v2,
Phase-G-Vollzug).*
