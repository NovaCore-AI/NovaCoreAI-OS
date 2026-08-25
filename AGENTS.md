# AGENTS.md — NovaCoreAI-OS

> **Dieses Repo IST das Produkt.** NovaCore-OS ist eine **Familie von Claude-Code-Plugins**
> (Kern `nc` plus je Abteilung ein Plugin; Skills, Hooks), die aus einem Marketplace als
> „Betriebssystem für KI-Arbeit" an das NovaCore-Team verteilt wird — eine Methode für alle
> statt vieler Privat-Setups. Wer hier arbeitet, baut am Werkzeug der Firma, nicht an einer
> Anwendung. Diese Datei ist die **normative Einstiegs-Doku für alle Agenten**. Die getrackte
> `CLAUDE.md` importiert sie per `@AGENTS.md` — Claude Code liest `CLAUDE.md`, nicht
> `AGENTS.md` (Claude-Code-Doku, 2026-08-25); bis dahin war `CLAUDE.md` un-getrackt, und ein
> frischer Klon hatte keinen Pflicht-Einstieg. Persönliche Notizen gehören in `CLAUDE.local.md`.

## Pflicht-Einstieg für jede Session (kein Blind-Start)

**Vor der ersten inhaltlichen Aktion, in dieser Reihenfolge:**

1. **Log-Stand abrufen:** `git log --oneline -10` und `git status` — was zuletzt geschah und
   ob gerade ein Umbau läuft. Zusätzlich `git worktree list` und in jedem fremden Baum
   `git status --short`: **der Working Tree ist die Wahrheit**, nicht der letzte Commit und
   nicht diese Datei.
2. **Produktstand:** `CHANGELOG.md` (autoritativ für „was ist gebaut / was fehlt") + `VERSION`.
3. **Planungsstand:** Laufende Baupläne liegen final in `knowledge-base/aktive-bauplaene/`
   mit Datumspräfix — die jüngste Datei je Strang ist der aktuellste Planungsstand;
   `knowledge-base/grundwissen/` trägt seit Phase I nur noch dauerhafte Begriffsnormen und
   Design-Specs, nicht mehr die laufenden Pläne; die Produktvision
   (`NovaCore-OS-Produktarchitektur.md`) bleibt die Referenz für Vision-Abgleiche.
4. **Triage über den Master-Index:** `knowledge-base/SSOT-Document-Index.md` — Teil 1 sagt,
   wohin ein Dokument gehört, Teil 2 („Relevant wenn …") nennt je Quelle die
   Abruf-Situation. Vor Vermutungen dort nachsehen.
5. **Vor jeder Änderung:** `knowledge-base/standardprozesse/aktualisierungs-index.md` —
   die Änderungs-Matrix nennt je Änderungsart, was vorher zu lesen und was in derselben
   Änderung nachzuziehen ist.
6. **Aufgabenspezifisch nachladen** (Glossar unten): Skill-Arbeit →
   `plugins/nc/referenz/skill-authoring.md` · Plugin-/Marketplace-Arbeit →
   `knowledge-base/standardprozesse/abteilungs-plugin-bau.md` (neue Abteilung §3 ·
   Satellit-Extraktion §3a · **eigenständiges Kollegen-/Abteilungs-OS §3b** — pilotiert
   2026-07-28 mit `nc-felix`, inkl. Install-Fallen) bzw. `kern-plugin-bau.md` bei Arbeit am
   Kern · Wissensbasis-Arbeit → `knowledge-base/standardprozesse/ssot-aufbau.md` ·
   Workflow-Logik →
   `plugins/nc/wp-rahmen.md` (Rahmen WP0–WP8) und `plugins/nc-development/workflow.md`
   (Fachablauf) · Methodenfragen → `knowledge-base/standardprozesse/os-bau-methode.md`.

## Vision (Kurzfassung)

Sechs Schichten (Detail: `knowledge-base/grundwissen/NovaCore-OS-Produktarchitektur.md`):

1. **Verteilung** — ein Marketplace (`novacore-os`), mehrere Plugins (Kern + Abteilungen),
   versioniert je Plugin, Auto-Update fürs Team
2. **Wissen (SSOT)** — `doks/nc-teamsync.md` (Global-Anweisung, im Kern ausgeliefert),
   Projekt-CLAUDEs, Projekt-Memory je Arbeits-Repo — im OS-Repo `knowledge-base/sitzungswissen/`,
   sonst kein Dateistrom mehr (Projekt-Memory von Claude Code trägt allein)
3. **Pflicht-Workflow** — `/nc:start` → WP-Gates → `/nc:end-session`; Rahmen WP0–WP8
   normativ in `plugins/nc/wp-rahmen.md`, Fachablauf je Abteilung in deren `workflow.md`
4. **Abteilungen** — **je Abteilung ein Plugin** (`plugins/nc-<abteilung>/`, Kern als
   Dependency); Module = Skill-Präfix-Gruppen. Ständig: `gemeinsam` im Kern; fachlich zuerst:
   `development` mit Modulen `fe`/`be`/`flc`/`wzs`
5. **Kontrolle (deterministisch)** — Hooks nur im Kern: FFG (Fact-Forcing-Gate, markerlos);
   hier hat die KI kein Mitspracherecht
6. **Sandbox** — jeder baut eigene Skills nach den OS-Regeln; Bewährtes wandert per
   Fork-back ins OS

## Repo-Karte

| Pfad | Inhalt |
|---|---|
| `AGENTS.md` | diese Datei — normativer Einstieg, Regeln, Karte, Pflegeprozess |
| `CLAUDE.md` | Claude-Code-Einstieg: importiert `AGENTS.md` (`@AGENTS.md`) und trägt nur Claude-Code-spezifisches (Prüfzyklus, Worktree-Pflicht, Repo-ist-Produkt) — **keine zweite Regelquelle**; getrackt seit 2026-08-25, testerzwungen (`struktur.test.mjs`) |
| `README.md` | Team-/Contributor-Sicht: Architektur, Skill-Katalog, Installation |
| `ONBOARDING.md` | Ersteinrichtung + Migration von v0.2.0 |
| `CHANGELOG.md` | autoritative Änderungshistorie (Keep a Changelog) — geschrieben **nur** vom Release-Zug als Waypoint-Abschnitt (`aktualisierungs-index.md` §0/§3.6), nie im Strang |
| `SECURITY.md` | Sicherheitslage des OS: was die Kontroll-Schicht garantiert (je Hook eine Zeile mit Opt-out und Grenze), was sie ausdrücklich nicht garantiert, privater Meldeweg — **keine zweite Quelle**: maßgeblich bleiben `hooks.json`, die Hook-Köpfe und `plugins/nc/tests/` |
| `VERSION` | Produkt-Leitversion (SemVer) = Version des Kern-Plugins |
| `.claude-plugin/marketplace.json` | Marketplace `novacore-os` — Einträge ohne `version`-Feld (die steht allein in der jeweiligen `plugin.json`); die Repo-Wurzel ist **nur** Marketplace-Wurzel, kein Plugin |
| `.github/workflows/` | `ci.yml` (seit Phase J **Kostenschnitt**: Regelfall ein Job `pruefung` ubuntu/node 24 mit Suite + Validierung beider Ebenen + Validator-Positivkontrolle; Vollmatrix Ubuntu+Windows × Node 20/22/24 nur bei `workflow_dispatch` und Tag `nc--v*`) und `release.yml` (Tag `nc--v*` → GitHub-Release aus dem CHANGELOG-Abschnitt) |
| `plugins/nc/` | **Kern-Plugin** (Namespace `/nc:`), Dependency jedes Abteilungsplugins — Skills `start`/`end-session`/`journal`/`setup`/`os-info`/`skill-builder`/`update-doks`/`queue-abteilung`/`queue-kern`/`wissen-aendern`/`wissen-planen`/`wissen-nachschlagen`/`wissen-protokolle`, Hooks (Gate 1: `nc-ffg.js`; Gate 2: `nc-session-start.js` + `nc-start-gate.js` + `nc-start-stempel.js`; Gate 3: `nc-safety-gate.js`; PreCompact-Mahnung: `nc-end-mahnung.js` + `nc-end-stempel.js`; dazu `nc-doks-autosync.js` — Ebenen 1 + 1b; dritter SessionStart-Hook `nc-queue-faelligkeit.js` — Queue-Fälligkeits-**Anweisung** (weist die Session an, den fälligen Lauf JETZT auszuführen), kein Gate; vierter SessionStart-Hook `nc-setup-hinweis.js` — Setup-Beleg-Zeiger der Infra-Registry, kein Gate, kein Netz, fail-open; UserPromptSubmit-Hook `nc-wissens-hinweis.js` + `hooks/wissen-sucheindex.json` — Wissens-Zeiger, kein Gate; PreToolUse-Hook `nc-pfad-hinweis.js` + `hooks/pfad-aenderungsindex.json` — Pfad-Zeiger, kein Gate) mit geteilter `hooks/lib/` (`session-key.js`, `bash-analyse.js`, `shell-substitution.js`, `infra-registry.js` — die eine Registry-Leseimplementierung), `doks/global-claude-firmenblock.md` (Ebene-1-Payload), `doks/nc-teamsync.md` (zugleich Ebene-1b-Payload), `wp-rahmen.md`, `module-registry.json` (Metadaten-SSOT), `referenz/skill-authoring.md`, `referenz/agent-authoring.md` (Subagenten-Formatregeln, ausgeliefert), `referenz/pflege-auspraegung.md` (Queue-Format v1 + Kriterienliste v1, ausgeliefert), `agents/` (Subagent `sync-nachzug-executor`), `skills/setup/infra-registry.md` (Infra-Registry-Referenz), `tests/` |
| `plugins/nc-development/` | Abteilung `development` (Namespace `/nc-development:`): 15 Skills in 6 Modulen (`fe`/`be`/`flc`/`wzs`/`qs`/`rel`, flaches Layout) + `workflow.md` (Fachablauf WP1–WP7) + `development-abteilungs-claude.md` (CLAUDE-Ebene 2, erstes ausgeliefertes Exemplar) + `pflege-auspraegung.json` (Queue-Ort, Kriterienverweis, Journal-Sonderregeln, Domänen-rote-Linien, Übergangsregel) |
| `knowledge-base/` | Wissensbasis — Glossar im nächsten Abschnitt |
| `knowledge-base/standardprozesse/vorlagen/abteilungsplugin/` | Vorlage für neue Abteilungsplugins — **kein Plugin** (`.vorlage`-Endungen), **Unterordner** von `standardprozesse/`, keine eigene Kategorie; dazu `abteilungs-claude.md.vorlage` (Ebene 2, Pflichtbestandteil jedes Abteilungsplugins) und `agents/beispiel-agent.md.vorlage` (Subagenten-Baustein, Read-only-Variante, optional beim ersten Agenten) |

## Glossar der Wissensbasis (`knowledge-base/`)

| Kategorie | Zweck | Wann konsultieren |
|---|---|---|
| **`SSOT-Document-Index.md`** (Wurzel) | **Master-Index** der Wissensbasis: Teil 1 Ordner-Routing (wohin gehört ein Dokument), Teil 2 Quellen-Triage („Relevant wenn …") über alle Bestandsdateien. **Einzige Datei auf Wurzelebene** (testerzwungen) | **zuerst** — vor dem Griff in eine Kategorie und vor dem Anlegen/Verschieben/Löschen einer Wissensdatei |
| `grundwissen/` | Produktvision, Begriffsnormen (SSOT-, Gates-, CLAUDE-Ebenen-Definition) und Design-Specs — dauerhafte Referenzen ohne Datumspräfix; laufende Baupläne liegen seit Phase I in `aktive-bauplaene/` | Vision-/Architektur-Fragen; vor Design-Entscheidungen; wenn ein Begriff (SSOT, Gate, CLAUDE-Ebene) erklärt oder abgegrenzt werden muss |
| `aktive-bauplaene/` | laufende Baupläne (Datumspräfix je Strang), inkl. Delta-Mappings und Nachtschicht-Ausführungsplänen — der aktuelle Planungsstand, bis ein Plan abgeschlossen/verworfen und ins `bauplan-archiv/` verschoben wird | vor jeder Planungsarbeit; für den aktuellen Bauplan eines laufenden Stranges |
| `standardprozesse/` | verbindliche Abläufe: `aktualisierungs-index.md` (**„ich ändere X — was muss ich anfassen"**, Langfassung der Sync-Matrix + Prüfzyklus + Selbsttest), `kern-plugin-bau.md` (Kern-Plugin, Governance-Schichten, Doks-Autosync), `abteilungs-plugin-bau.md` (Abteilungen und Satelliten, Auslieferungsgrenze), `ssot-aufbau.md` (Aufbau der Wissensbasis, Struktur-Vererbung an Satelliten), `sync-nachzug-bauzyklus.md` (gebündelte Nachzüge je Bauzyklus), `os-bau-methode.md` (Gesamt-Methode, an die Firmenphilosophie anpassbar), `claude-netz-bau.md` (Instruktions-Schicht der CLAUDE-Ebenen), `subagenten-bau.md` (Bau von Subagenten: Agent-vs-Skill, Scope, Gate-Semantik), `wissens-router-bau.md` (Router, Sucheindex, Wissens-Zeiger-Hook — Anlass-Test, Kontext-Budget, Nachzüge), `standardprozess-authoring.md` (Form und Ablauf für neue Standardprozesse — der Prozess für Prozesse), `abteilungs-inhalts-pruefung.md` (wiederkehrendes, read-only Inhalts-Audit je Abteilung/Satellit), `team-distribution.md` (Rollout ans Team über den Claude-Team-Workspace), `contributing-flow.md` (Strang-Ablauf S1–S7 — bauender Agent unter Overseer, Merge/Release beim Maintainer), `jira-workflow.md` (Jira-Rest/MCP-Wege, Artefakt-Heimat `metaknowledge/`), `workflow-md-implementierung.md` (Anlass-Test und Mindestinhalt je Abteilungs-`workflow.md`) | vor **jeder** inhaltlichen Änderung am Plugin oder Repo — zuerst prüfen, ob ein Standardprozess existiert |
| `bauplan-archiv/` | abgeschlossene oder verworfene Baupläne, **unverändert** übernommen — **terminal**: keine Quelle Richtung Kern oder Satelliten, keine Kandidaten-Queue | wenn nachvollzogen werden soll, wie ein abgeschlossenes Vorhaben lief; **Pflicht-Verschiebung** dorthin, sobald ein Plan abgeschlossen oder verworfen ist |
| `ideen-backlog/` | Ideen ohne aktuellen Auftrag, je Idee ein Dokument | beim Festhalten einer Idee ohne Arbeitspaket; wird sie beauftragt, entsteht ein Bauplan in `aktive-bauplaene/`, der auf sie verweist — die Idee bleibt stehen |
| `feature-manuals/` | Manuals und Beschreibungen **externer** Software, fremder Repos und Features, die ins OS einbezogen werden: MCP-Server, Fremd-APIs, fremde Repos — **nie** eigene Standardprozesse (→ `standardprozesse/`); seit 2026-08-25 vorhanden, erster Inhalt Jira-REST-Zugang | wenn gegen ein Fremdsystem (MCP-Server, externe API, fremdes Repo) gearbeitet wird und dessen Zugangsweg/Setup gebraucht wird |
| `debugging-findings/` | `agent-learnings.md` — Agenten-Fehlerprotokoll (**eigene** Fehler, append-only Pflicht) · `debug-log.md` — Debug-Log (**gefundene** Bugs und Fehlbefunde, auch an fremdem Material, append-only Pflicht) | bei Debugging; nach jedem eigenen Fehler; nach jedem gefundenen Bug; vor neuen Aufgaben (eigene Fehlermuster) und vor jeder Fehlersuche (bekannte Symptome) |
| `firmenkernprozesse/` | extern geführte Prozess- und Produktdokumente des **Onsite.ai-OS-Vorbilds** und der Firmenebene: Prozesskarten, Team-Rollout-Infrastruktur, Featurekarte, Berichte und Methodik — Referenz für Ausrichtung und Abgleich, **nicht** normativ für dieses Repo | wenn der Vorbild-Stand abgeglichen, die Firmenprozesse nachvollzogen oder Rollout-/Onboarding-Material gebraucht wird; bei Widersprüchen gilt die NovaCore-Quellen-Hierarchie |
| `kandidaten-queue/` | Übergangs-Queue der repo-internen Abteilung `development` (`queue.md`, append-only) — kernrelevante Sitzungsergebnisse als Einzeiler + Verweis, Format nach `plugins/nc/referenz/pflege-auspraegung.md` Abschnitt 4 | wenn `/nc:end-session` einen Kandidaten klassifiziert oder geprüft wird, was aktuell zum Kern-Aufstieg ansteht; solange `development` keinen eigenen Satelliten hat, läuft die Einreichung über den regulären Branch/PR-Fluss dieses Repos |
| `queue-protokolle/` | Committete Prüfprotokolle des Kern-Aufstiegslaufs `/nc:queue-kern` — je Lauf ein Dokument `queue-protokoll-<abteilung>-<YYYY-MM-DD>.md`, das Ledger für dessen Folgelauf | wenn ein Aufstiegslauf sein Prüfprotokoll ablegt oder der Folgelauf entschiedene Zeilen gegen den Merge-Stand abgleicht; solange leer: `PLATZHALTER.md` |
| `sitzungswissen/` | Sitzungswissen dieses Repos selbst: `roll-up.md` (Mehrtages-Überblick), `offene-straenge-register.md`, je Abteilung `<abteilung>/stand.md` + `<abteilung>/journal/<YYYY-MM-DD>.md` — geschrieben/gelesen von `/nc:start` bzw. `/nc:end-session` | Session-Start/-Ende in diesem Repo; wenn der konsolidierte Stand, das jüngste Journal oder offene Stränge gebraucht werden |

**Zwei Indizes, zwei Fragen** — beide gehören zum Ablauf, in dieser Reihenfolge:
`SSOT-Document-Index.md` beantwortet *„welches Dokument existiert, wohin gehört es, wann
brauche ich es"*; `standardprozesse/aktualisierungs-index.md` beantwortet *„ich ändere X — was
muss ich alles mitändern"*.

Die **SKILL.md-Formatregeln** (`skill-authoring.md`) liegen **nicht** hier, sondern im
Kern-Plugin (`plugins/nc/referenz/`), weil sie zur Laufzeit mit ausgeliefert werden — ein
installiertes Plugin kann nicht auf Repo-Pfade zugreifen.

## Produktstand & Versionslogik

- **Gebaut (Kern v0.3.0, Umbau 2026-07-28):** Multi-Plugin-Schnitt umgesetzt — Marketplace
  `novacore-os` mit Kern `nc` (3 Skills, FFG v2 + Session-Start-Hook, WP-Rahmen, Registry,
  Formatregeln, Testsuite) und `nc-development` 0.1.0 (11 Skills in 4 Modulen,
  `dependencies: ["nc"]`). Die frühere eigene CLI (`ncos`, setup/update-Skripte) ist
  **ersatzlos abgeschafft** — Verteilung und Updates laufen ausschließlich über den
  Marketplace. Das alte marker-gebundene Safety-Gate ist im Destruktiv-Gate des FFG
  aufgegangen (markerlos, deny statt ask); der `.nc-os`-Marker scopte damals nur noch den
  Session-Start-**Hinweis** — seit 0.6.0 hat er **gar keine Funktion mehr** (siehe unten). Team-Mindestversion Claude Code ≥ 2.1.193.
- **Gebaut (Kern v0.4.0, 2026-07-28):** Zweite Abteilung `felix` als **erster Satellit**
  angelegt — Plugin `nc-felix` 0.2.0 im eigenen privaten Repo
  `NovaCore-AI/Felix-OS` (das Repo IST das Plugin), Marketplace-Eintrag per
  GitHub-Source mit Commit-SHA-Pin, Registry-Eintrag (Kern-Bump 0.3.0 → 0.4.0 wegen
  Registry-Erweiterung). **Eigenständiges Felix-OS:** Module statt Abteilungen, keine
  Kern-Dependency — Kernmodul (start, save-session, journal, os-info, code-tour,
  skill-builder) und eigene Kontroll-Schicht (FFG-Port) liegen im Plugin; nicht parallel
  zu `nc` betreiben. Arbeitsmodule folgen mit dem Fachbereich. Spec-Nachtrag: jüngste
  Design-Spec, §10.
- **Gebaut (Kern v0.5.0, 2026-08-05):** Dritte Abteilung `biggi` als **zweiter Satellit**
  angelegt — Plugin `nc-biggi` 0.1.1 im eigenen privaten Repo `NovaCore-AI/Biggi-OS`
  (das Repo IST das Plugin), Marketplace-Eintrag per GitHub-Source mit Commit-SHA-Pin,
  Registry-Eintrag (Kern-Bump 0.4.0 → 0.5.0 wegen Registry-Erweiterung). Eigenständiges
  Biggi-OS nach dem Felix-Muster, architektonisch am Onsite-Vorbild ausgerichtet
  (Maintainer-Leitlinie: bei Unterschieden gewinnt Onsite): Session-Start-Zwang statt
  Marker-Begrüßung, FFG mit Felix-Härtungen + Onsite-`exitCode`-Fix, CI/`release.yml`
  nach Onsite-Standard. Arbeitsmodul-Konvention reserviert: `controlling` (`ctrl`),
  `medizinisches` (`mdzn`), `dokumentation-daily-work` (`doc` + `day` — ein Modul, zwei
  Präfixe). Pilotierter Ablauf als `abteilungs-plugin-bau.md` **§3b** formalisiert; Felix-Tags/
  -Releases nachgezogen, Pin auf `v0.2.1`. Spec-Nachtrag: jüngste Design-Spec, §11.
- **Gebaut (Kern v0.6.0, 2026-08-10): Onsite-Align-Umbau** nach Bauplan
  `grundwissen/2026-08-10-onsite-align-umbau-bauplan.md` (AP1–AP8). **Gate 2
  (Session-Start-Zwang) ist jetzt gebaut** — zweiteilig nach dem Zangen-Prinzip:
  `nc-session-start.js` injiziert Pflicht-Einstieg + lebenden Projektstand,
  `nc-start-gate.js` lehnt jede schreibende Aktion ab, bis `/nc:start` per Fakten-Stempel
  (`nc-start-stempel.js`, verifiziert Branch/HEAD gegen die reale Git-Lage) abgeschlossen
  ist; **der `.nc-os`-Marker hat keine Funktion mehr**. Dazu: FFG-Angleich (geteilte
  `hooks/lib/session-key.js`, `process.exitCode` statt `process.exit`, erweiterte
  Read-only-Git-Erkennung) unter Beibehaltung aller NC-Review-Härtungen · **Doks-Autosync**
  (`nc-doks-autosync.js` + `doks/global-claude-firmenblock.md`, CLAUDE-Ebene 1) ·
  **SSOT-Infrastruktur** (Master-Index + Aktualisierungs-Index + drei Begriffsnormen) ·
  drei Kern-Infrapflege-Skills · CI/Release-Workflows · Marketplace-Kategorie `affiliate`.
  Nachtrag 2026-08-11: **`/nc:setup` — SSOT-Provisionierung** (Bauplan
  `grundwissen/2026-08-10-ssot-provisionierung-bauplan.md`): klont die Wissensbasis voll
  nach `~/.nc/ssot/<repo-name>/`, Verlinkung über den festen Pfad im Firmen-Block, per
  Fast-Forward aktuell; nach dem Livetest korrigiert (PR #13, Nachtrag N1).
  **Bewusst ausgeschlossen:** Queue-Logik/SSOT-Abstufung des Vorbilds und jeder
  Memory-Share zwischen Satelliten (Maintainer-Entscheid; siehe SSOT-Definition).
- **Gebaut (Kern v0.7.0, 2026-08-11): Prozesskorpus-Nachzug** nach Bauplan
  `grundwissen/2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md` (AP1–AP5, AP10).
  Aus `plugin-bau.md` wurden **vier** Standardprozesse: `kern-plugin-bau.md` (Scope,
  **Governance-Zwei-Schichten-Tabelle §1a**,
  **Autosync-Standardprozess §2a**, Mindest-Client-Schwellen), `abteilungs-plugin-bau.md`
  (Architektur, **Auslieferungsgrenze §1a**, Mechanik-Fakten, §3/§3a/§3b),
  **`ssot-aufbau.md`** (sieben Grundbausteine, §4 Struktur-Vererbung an Satelliten,
  **§4a Isolations-Invariante**) und **`sync-nachzug-bauzyklus.md`** (gebündelte Nachzüge je
  Bauzyklus samt Konfliktzonen-Regel). Dazu die Vorlage
  `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage`, das zweite Protokoll
  `debugging-findings/debug-log.md` und **zehn neue Änderungsarten** im
  Aktualisierungs-Index. **Nachtrag N3 korrigiert eine Mechanik-Behauptung des Vorbilds:**
  Der sparse clone hängt am Source-Typ `git-subdir`, nicht am `ref`/`sha`-Pin — die reale
  Auslieferungsgrenze ist die Kopie des **Plugin-Verzeichnisses** in den Cache.
  **Nachtrag N4:** Die Git-Historie des alten `plugin-bau.md` hängt an **keiner** der beiden
  Hälften — Vorgeschichte über den alten Pfad lesen
  (`git log --oneline -- knowledge-base/standardprozesse/plugin-bau.md`).
  **AP10 nachgezogen (2026-08-12):** Der Satellit `nc-felix` ist als **0.4.1** annotiert getaggt
  und released; der Marketplace-Pin steht auf `ref: v0.4.1` + Full-SHA `ed41f22…`, Registry- und
  README-Statuszeile, Gates-Definition und `ONBOARDING.md` sind nachgezogen — **beide** Satelliten
  tragen jetzt Gate 1 **und** Gate 2, markerlos.
  Minor-Bump, weil neue normative Prozesse hinzukommen.
- **Gebaut (Kern v0.6.1, 2026-08-11):** `/nc:setup` heilt **Sparse-Relikte der
  Erstfassung** — eine unveränderte Sparse-Kopie wird vor dem Pull per
  `git sparse-checkout disable` zum vollen Arbeitsbaum erweitert und explizit gemeldet
  (vorher: stiller Falscherfolg „aktualisiert"); lokal veränderte Kopien werden samt
  Sparse-Hinweis gemeldet, nie angefasst. ONBOARDING um den WSL-Hinweis ergänzt („WSL
  zählt als eigener Rechner"). Patch-Bump, weil die Erstfassung im Feld installiert ist —
  ohne Bump erreicht kein Fix ein installiertes Plugin (Bauplan-Nachtrag N2).
- **Gebaut (Kern v0.7.1, 2026-08-14):** Bugfix der Read-only-Git-Erkennung
  (`hooks/lib/bash-analyse.js`) — Start-Gate und FFG blockten ihren eigenen
  Pflicht-Einstieg, sobald der Befehl einen Pfadwechsel (`cd … && git …`,
  `git -C <dir> …`) oder eine Verkettung read-only-Kommandos enthielt; `git worktree
  list` (Pflicht-Einstieg) fehlte ganz. Die Erkennung prüft jetzt segmentweise
  (quote-aware): jedes Segment muss reiner Pfadwechsel oder allowlistetes
  Git-Kommando sein; Pipes/Redirects/Substitutionen bleiben ausgeschlossen.
  Negativproben testerzwungen. Folge-Vorgang: die Satelliten-FFG-Kopien
  (`nc-felix`, `nc-biggi`) tragen denselben Stand — je eigener Fix dort.
- **Gebaut (Kern v0.8.0, 2026-08-15): Onsite-Endstand-Nachbau Phase 1** nach Bauplan
  `grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md` (AP-A1–A4 + AP-B1–B2,
  „SSOT-Kern & Kontroll-Schicht"): **`/nc:setup` ist jetzt Reconciler S0–S6** (Referenz
  `skills/setup/infra-registry.md`; Infra-Registry `~/.claude/nc/infra.json` Schema v1;
  `ssot-provision.js` unverändert als S2-Baustein) · **`/nc:save-session` →
  `/nc:end-session`** (BREAKING, Rename-Sweep; Umfang gehoben: Roll-up,
  Offene-Stränge-Register, Projekt-Memory-Spiegel, Abschluss-Stempel) · `/nc:start` liest
  Memory/Register/Roll-up/Infra-Registry/Team-Sync · neuer Maintainer-Skill
  **`/nc:update-doks`** (F1 Marker-Reparatur über den Autosync-Code, F2 index-geführter
  Konsistenzlauf — F1/F2-Zweiteilung seit Kern v0.12.0 durch eine einzige Aufgabe ersetzt,
  Kreuzverweis-/Pfad-Pflege der SSOT-Dokumente, siehe Phase-H-Eintrag unten) ·
  **PreCompact-Mahnung** (`nc-end-mahnung.js` + `nc-end-stempel.js`,
  Heartbeat, Loop-Schutz, `NC_PRECOMPACT=off`) · **Doks-Autosync Ebene 1b**
  (`~/.claude/nc-teamsync.md` als Ganzdatei, Payload `doks/nc-teamsync.md` — seit 2026-08-25
  wie beim Vorbild unter doks/, Nachtrag N2 damit aufgehoben; CRLF-normalisierter Vergleich;
  Overrides `NC_AUTOSYNC_TARGET`/
  `NC_AUTOSYNC_TEAMSYNC_TARGET`). Wohnort des Sitzungswissens bleibt `.nc/erinnerung/`
  (E2a — dieses Repo ist öffentlich). Phasen 2 (Prozesskorpus/CLAUDE-Netz/Subagenten) und
  3 (Queue-Flow nur Kern ↔ interne Abteilungen; Kollegen-OS bleiben isoliert)
  folgen nach Bauplan.
- **Gebaut (Kern v0.9.0, 2026-08-16): Onsite-Endstand-Nachbau Phase 2** nach Bauplan
  `grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md` (AP-C1–C5, AP-D1):
  **Prozesskorpus** — vier neue Standardprozesse (`claude-netz-bau.md`, `subagenten-bau.md`,
  `team-distribution.md`, `abteilungs-inhalts-pruefung.md`) plus `anker-reservierung.md`
  samt Definitionsdokument `NovaCore-OS-Anker-Reservierung-Definition.md` (AP-C2).
  **Subagenten** (AP-D1) als neue Komponentenklasse: `agents/`-Verzeichnis, erster Agent
  `sync-nachzug-executor` (schreibend, Marker `nc:schreibend`, `sonnet`, ohne `Bash`),
  ausgelieferte Referenz `referenz/agent-authoring.md`, Vorlagen-Baustein
  `agents/beispiel-agent.md.vorlage`, zwei Prüfbausteine (`agenten.test.mjs` portabel,
  Baustein-Version 1.4.2; `agenten-os.test.mjs` OS-Repo-gebunden), Registry-`agents`-Segment.
  **Allowlist-Norm-Nachzug** von Onsite PR #60 (Bauplan-Nachtrag N7): `tools`/`model`
  Pflichtfelder, Defense-Baseline-Block Pflicht, Werkzeuggrenze in der `tools`-Allowlist statt
  `disallowedTools`. **Anker-Mechanik** zweistufig: frühe `reserve/*`-Tag-Reservierung
  (`anker-reservierung.md`) plus späte Testsuite-Invariante in `struktur.test.mjs` gegen
  doppelt vergebene CHANGELOG-Versionsüberschriften. Dazu Registry-**Reservierungen**
  `ui-ux`/`automation` (Bauplan-Nachtrag N6) und die **Abteilungs-CLAUDE-Vorlage** (Ebene 2,
  Format definiert — Auslieferung folgt mit dem ersten Abteilungs-Bump).
- **Gebaut (Kern v0.10.0, 2026-08-16): Onsite-Endstand-Nachbau Phase 3 — Queue-Flow &
  Development-Plugin** nach Bauplan
  `grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md` (AP-E1–E3, AP-F1–F2). **Queue-Flow
  zwischen Kern und internen Abteilungen mit Kern-Dependency** (AP-E1–E3): Referenz und Format
  (`plugins/nc/referenz/pflege-auspraegung.md`, Schema v1, Queue-Format v1, Kriterienliste v1)
  samt der ersten realen Ausprägung (`plugins/nc-development/pflege-auspraegung.json`), die
  Standardprozesse `queue-flow.md`/`kriterien-pflege.md`, zwei neue Skills
  `/nc:queue-abteilung`/`/nc:queue-kern` (Push/PR je Lauf einzeln freigabepflichtig — offener
  Maintainer-Entscheid) und der Fälligkeits-Hook `nc-queue-faelligkeit.js` (dritter
  SessionStart-Hook, kein Gate, 14-Tage-Takt). **Heutiger Übergangszustand E1:** Die Abteilung
  `development` liegt repo-intern ohne eigenen Satelliten — ihre Übergangs-Queue
  (`kandidaten-queue/queue.md`) läuft über den regulären Branch/PR-Fluss dieses Repos; beide
  Queue-Skills werden erst mit dem ersten Abteilungs-Satelliten wirksam. **Modernisierung
  `nc-development`** (AP-F1–F2, Erstanwendung von `abteilungs-inhalts-pruefung.md`): vier neue
  Skills (`qs-bugfix`, `qs-abnahme`, `rel-vorbereitung`, `rel-verifikation`) in zwei neuen
  Modulen `qs`/`rel` — Abteilung zählt jetzt 15 Skills in 6 Modulen — sowie
  `development-abteilungs-claude.md`, das **erste ausgelieferte Exemplar der CLAUDE-Ebene 2**,
  gelesen durch die neue Lese-Verdrahtung in `/nc:start`. Stehende offene Punkte: Kriterienliste
  v1 ist Abnahme-Gate dieses Phasen-PRs (Maintainer-Wortlautabnahme aussteht), Push-Recht und
  stehende PR-Freigabe des Queue-Flows sind Maintainer-Entscheide (`queue-flow.md` §6).
- **Gebaut (Kern v0.11.0, 2026-08-24): Onsite-Delta-Nachbau Phase G — Kontroll-Schicht-Parität**
  nach Mapping `grundwissen/2026-08-23-onsite-delta-mapping.md` (D1–D3, D6): FFG-Erweiterung
  (NotebookEdit, Windows-Destruktivmuster, Wrapper-Passthrough, Drift-Ritual §2b +
  Falltabelle), Safety-Gate/Gate 3 gebaut (`nc-safety-gate.js`, ask-Dialog, Musterliste v1 im
  NovaCore-Zuschnitt — Wortlaut-Abnahme am Phasen-PR), Gate 4 endgültig entfallen (Onsite
  §15.44), Queue-Hook mit PR-Sichtbarkeit über die Infra-Registry (einziger, vierfach
  gedeckelter Netzzugriff der Kontroll-Schicht) und Windows-Sperren-Härtung. Phasen H–K
  folgen nach Mapping.
- **Gebaut (Kern v0.12.0, 2026-08-24): Onsite-Delta-Nachbau Phase H — SSOT-Präsenz** nach
  Mapping `grundwissen/2026-08-23-onsite-delta-mapping.md` (D4, D5, D7, D8, D9, D25;
  Onsite-Quelle live `origin/main@51e230f`). Neue Begriffsnorm
  `grundwissen/NovaCore-OS-Node-Doks-Definition.md` (D25). **Vier neue Wissens-Router**
  im neuen Modul `wissen` (D7): `wissen-aendern`/`wissen-planen`/`wissen-nachschlagen`/
  `wissen-protokolle` — Zeiger auf die Node-Doks statt kopiertem Inhalt. **Zwei neue
  Zeiger-Hooks** (beide kein Gate): `nc-wissens-hinweis.js` (UserPromptSubmit, D4) und
  `nc-pfad-hinweis.js` (PreToolUse, D5) samt Sucheindizes. **`/nc:doku-sync` ersatzlos
  entfernt** (D8, Onsite §15.43) — Nachfolge: `/nc:wissen-aendern` + Aktualisierungs-Index
  (Träger-Regel). **`/nc:update-doks` auf eine Aufgabe geschnitten** (D9): reine
  Kreuzverweis-/Pfad-Pflege der SSOT-Dokumente, F1/F2 entfallen.
- **Gebaut (Kern v0.13.0, 2026-08-24): Onsite-Delta-Nachbau Phase I — Wissensfluss &
  Sanierungs-Normen** nach Mapping `grundwissen/2026-08-23-onsite-delta-mapping.md`
  (D10–D15, D26). **Sitzungswissen-Umzug** (D14, BREAKING): `.nc/erinnerung/` entfällt
  ersatzlos — Sitzungswissen wohnt jetzt committet in der Wissensbasis dieses Repos unter
  `sitzungswissen/` (`roll-up.md`, `offene-straenge-register.md`, je Abteilung `stand.md` +
  `journal/`); in fremden Arbeits-Repos ohne eigene Wissensbasis wird kein Sitzungswissen
  mehr angelegt — dort trägt das Projekt-Memory den Stand allein. `end-session` und `start`
  neu gefasst: Zwei-Fall-Logik am Argument `nachzug`, Stufen-Prüfungen **GL1–GL5** vor der
  Kandidaten-Klassifikation (`pflege-auspraegung.md` §5.5, Kriterienliste v2), Altstand-Regel
  (`.nc/`-Fund wird gemeldet, nie gelesen). **Kategorie `aktive-bauplaene/`** scharfgestellt
  (D10): `grundwissen/` trägt seither nur noch dauerhafte Begriffsnormen und Design-Specs,
  laufende Baupläne wohnen in `aktive-bauplaene/`; `vorlagen/` zog von der Repo-Wurzel nach
  `standardprozesse/vorlagen/` um (EN7). **Aktualisierungs-Index** neu gefasst (D11): §0
  Zwei-Klassen-Buchführung, §3.6 Release-Zug-Runbook (Waypoint-Batches statt Sammelrelease,
  EN5), Bagatellgrenze und Batch-Kadenzen. **Tag-Norm** nach P-E2: Reserve-/Anker-Tags
  entfallen, Tags entstehen nur noch als Teil eines Release. **`referenz/`-Einstufung** (D13,
  EN6 angepasst): dokumentierter Review-Vorgang je Datei, kein pauschaler
  `unreviewed`-Stempel. **`NovaCore-OS-Systemachsen.md`** neu angelegt (D26): drei Achsen
  (Wissensfluss, Auslieferung, Instandhaltung) + Scope-Begriff (Projekt/User/Scratchpad).
  **`scratchpad-nutzung.md`** neu angelegt (D27, R1–R3). Im gebündelten Nachzug dieses
  Zyklus zusätzlich: Team-Sync-Payload **„Ein Archiv ist keine Wissensquelle"** + Meta-Regeln
  + Multi-Agent-Ruleset in `doks/nc-teamsync.md` (D12), **`NC_SECRETS_REF`** (D15) und die
  Zähl-Wahrheits-Prüfung (D18). Branch `feat/onsite-delta-phase-i`, Commits
  `e7e5f19`/`7a4db3a`/`bcb3f6b` + Nachzugspaket.
- **Gebaut (Kern v0.15.0, 2026-08-26): Onsite-Delta-Nachbau Phase J** nach Bauplan
  `aktive-bauplaene/2026-08-25-onsite-delta-phase-j-bauplan.md` (J-D → J-A ∥ J-B → J-C → J-E,
  Nachträge N1–N3) und Nachtschicht-Plan `aktive-bauplaene/2026-08-25-nachtschicht-phase-j.md`
  (zwei Sonnet-Bau-Agenten, Orchestrator hält Fugen und Abnahmen). **Anker-Reservierung
  ersatzlos aufgehoben** (D31): beide Dateien + Prozesskarte 09 gelöscht, Begriffsnorm „Anker"
  als ein Absatz in `os-bau-methode.md`, Absicherung allein über Mechanik. **CI-Kostenschnitt**
  (D22): Regelfall ein Job `pruefung` (ubuntu/node 24), Vollmatrix nur bei Dispatch/Tag —
  „Breite reduziert, Prüfung nie". **Safety-Gate-Wertentscheidung** (D33): `NAME=wert` bewertet
  nur real zugewiesene Namen, der Wert entscheidet dreistufig (Fehlalarm-Schutz, Härtungen
  zeichengleich). **Queue-Handlungsanweisung** (D28): der Queue-Hook weist die Session an,
  den fälligen Lauf JETZT auszuführen, statt nur zu erinnern. **Setup-Hinweis-Hook**
  (D32, zehnter registrierter Hook): prüft den Infra-Registry-Beleg (fehlt/neuer/defekt/grün),
  kein Gate, kein Netz, fail-open; `/nc:setup` schreibt jetzt `kernRepoPfad` + Pflichtfelder;
  gemeinsame Lese-Lib `hooks/lib/infra-registry.js`; `os-info` zeigt den Setup-Beleg. **Drei
  Subagenten der Abteilung development** (D19): `code-reviewer` (inherit, read-only),
  `pipeline-praeflight` (sonnet, Diagnose-Klasse), `test-luecken-scout` (sonnet, read-only)
  samt Registry-`agents`-Segment — mit **Diagnose-Klasse im Agenten-Prüfbaustein 1.4.3**
  (Nachtrag N3: Marker `<!-- nc:diagnose -->`, genau Bash, Allowlist-Disziplin). **Normen**
  (J-C): Hook-Norm W4 (nur der Kern trägt Hooks bei der Auslieferung, Struktur-Invariante),
  Anlageweg-Weiche §3.0 mit Befristung der Registry-Reservierungen, `contributing-flow.md`
  S1–S7 + `NovaCore-OS-Strang-Definition.md` (D34), SSOT-Sichtbarkeitsmodell als
  Vorratsnorm (D35: in den Kern steigt nur ein konzentriertes Fakten-Dokument).
  `nc-development` **0.2.1 → 0.3.0** (drei Agenten + Overlap-Matrix).
- **Noch nicht gebaut:** (Gate 4 ist endgültig entfallen — Onsite §15.44, Mapping D2; die
  PreCompact-Mahnung bleibt und war nie Gate 4), CLAUDE-Ebene 0 (Org-Instructions, weiterhin
  ungenutzt), weitere fe-/be-Skills, Module
  `architecture`/`incident-support` sowie der Anschluss eines Abteilungs-Satelliten an den
  Queue-Flow (Skills und Hook sind gebaut, laufen aber ohne Satelliten in den
  Übergangs-Befund). Übersicht: `grundwissen/NovaCore-OS-Gates-Definition.md`.
- **Versionsmodell:** **Je Plugin eine Version, genau an einer Stelle:**
  `plugins/<name>/.claude-plugin/plugin.json`. Marketplace-Einträge tragen **kein**
  `version`-Feld (Claude Code nutzt den `plugin.json`-Wert „without warning" — Doku
  plugin-marketplaces, verifiziert 2026-07-28). Die **Kern-Version ist die
  Produkt-Leitversion**, gespiegelt in `VERSION` und `plugins/nc/module-registry.json`
  (Struktur-Test erzwingt Gleichstand). Abteilungsplugins zählen eigenständig
  (`nc-development` startet bei 0.1.0, der Kern steht bei 0.3.0) — die frühere
  Vier-Dateien-Gleichstand-Regel ist aufgehoben; `package.json` trägt bewusst keine Version
  mehr. Kein Bump = kein Auto-Update. Schema: Neuerung → Minor · Fix → Patch ·
  Strukturbruch → groß. Git-Tags sind optional und folgen, wenn genutzt, dem Schema
  `{plugin-name}--v{version}` (`claude plugin tag`) — nötig werden sie erst für
  versionsbeschränkte Dependencies.

## Quellen-Hierarchie

Bei Widersprüchen zwischen Doku-Ebenen: **1.** jüngste Design-Spec (`grundwissen/`) →
**2.** Standardprozesse → **3.** Produktvision (Visionsebene). Gebaute Artefakte müssen der
Spec folgen; weicht ein Build bewusst ab, wird die Spec per Nachtrag nachgezogen — nie
stillschweigend. **Pfad-Angaben:** Bei Widersprüchen zwischen Doku und realer Struktur gilt
die Platte (Glob / `git status`) — danach diese Datei korrigieren (Pflegeprozess unten).
Stand-Aussagen immer gegen **drei** Ebenen prüfen: Vision ↔ Spec ↔ gebaute Artefakte.

## Verbindliche Konventionen

- **Deutsch** für alle Artefakte.
- **Keine personenbezogenen Pfade/Annahmen** — Team-Tool, nicht Einzelperson-Setup.
- **SKILL.md-Format:** strikt nach `plugins/nc/referenz/skill-authoring.md` (inkl.
  **YAML-Falle**: `description` mit „Trigger-Begriffe: …" immer als `>-`-Block).
- **Plugin-/Marketplace-Arbeit:** strikt nach
  `knowledge-base/standardprozesse/abteilungs-plugin-bau.md` (Abteilung/Satellit) bzw.
  `kern-plugin-bau.md` (Kern).
- **Version-Bump:** ausschließlich in `plugins/<name>/.claude-plugin/plugin.json` (beim Kern
  zusätzlich `VERSION` + Registry) + CHANGELOG-Eintrag.
- **Kleine Dateien:** eine Datei pro Skill; Detailwissen als Referenzdatei daneben.
- **Rote Linien** (aus `wp-rahmen.md` des Kerns) gelten auch für Agenten, die IN diesem Repo
  arbeiten: keine Pushes, Merges, Releases oder Kundensichtbares ohne explizite Freigabe.

## Standardzyklus für Agenten in diesem Repo (verbindlich)

1. **Einstieg:** Pflicht-Einstieg oben vollständig ausführen.
2. **Source-of-Truth-Pflicht:** Vor Änderungen an Plugin-/Skill-/Marketplace-Format die
   offizielle Claude-Code-Doku abrufen (code.claude.com/docs: `skills`, `plugins-reference`,
   `plugin-marketplaces`) — nie aus dem Gedächtnis.
3. **Standardprozess-Check:** in `knowledge-base/standardprozesse/` prüfen, ob ein Prozess
   existiert — falls ja, ihm folgen; fehlt er und die Tätigkeit ist wiederkehrend, ihn dort
   im Anschluss dokumentieren. Der komplette Strang-Ablauf (S1–S7: Planung unter Overseer,
   Bau, Review, Merge und Release-Zug beim Maintainer) steht gebündelt in
   [`contributing-flow.md`](knowledge-base/standardprozesse/contributing-flow.md).
4. **Fehlerprotokoll (ohne Ausnahme):** Jeder selbst gemachte Fehler sofort nach
   `knowledge-base/debugging-findings/agent-learnings.md` (Format in der Datei); vor neuen
   Aufgaben dort eigene Fehlermuster prüfen.
5. **Abschluss-Checkliste vor jedem Commit(-Vorschlag) und vor jedem Push — nie überspringen**
   (Doku, die nicht bei jedem relevanten Push mitgezogen wird, verrottet unbemerkt und lügt
   dann über den Stand — Lehre aus dem 0.2.0-Release, als Tag und GitHub-Release den
   Versionsdateien hinterherhinkten):
   - [ ] Doku gemäß Sync-Matrix nachgezogen (README bei Installation/Nutzung/Features,
         ONBOARDING bei Setup-Ablauf, diese Datei bei Pfaden/Architektur); Live-Verweise
         geprüft (`grep` nach alten Pfaden)
   - [ ] **Kein** CHANGELOG-Eintrag, **kein** Version-Bump im Strang (Zwei-Klassen-Buchführung,
         `aktualisierungs-index.md` §0, seit 2026-08-24): Wissensträger des Strangs ist das
         **PR-Ergebnismemo** (was/warum/Entscheide/Verifikation, Produktanteil gekennzeichnet).
         Version, CHANGELOG-Waypoint und Tag entstehen ausschließlich am **Release-Zug** auf
         Maintainer-Kommando (§3.6) — eine Version je Batch und Plugin
   - [ ] Validierung beider Ebenen: `claude plugin validate .` **und**
         `claude plugin validate plugins/<name> --strict` je berührtem Plugin. Achtung
         (empirisch, CLI 2.1.220): Der Validator druckt `Validating skill:`-Zeilen nur bei
         **Befund** — ein stilles „Validation passed" ist das Erfolgssignal; die
         Frontmatter-Abdeckung sichern die Struktur-Tests.
   - [ ] Tests: `node --test plugins/nc/tests/*.test.mjs`
   - [ ] Fehlerprotokoll-Einträge der Session geschrieben
6. **Kein Commit/Push ohne explizite Freigabe des Maintainers.**

## Pflegeprozess dieser Datei und der lebenden Doku (verbindlich)

`AGENTS.md` und `README.md` sind **abgeleitete** Dokumente — Quelle der Wahrheit sind
Repo-Struktur, Manifeste, `CHANGELOG.md` und Spec.

1. **Gleicher Change, gleiche Pflege:** Wer Struktur, Pfade, Skills, Module oder Versionen
   ändert, zieht die betroffenen Doku-Abschnitte **in derselben Änderung** nach.
2. **Sync-Matrix:**

   | Änderung | Nachziehen in |
   |---|---|
   | Datei/Ordner verschoben/umbenannt/gelöscht | `knowledge-base/SSOT-Document-Index.md` (Teil 1 **und** Teil 2); Repo-Karte + Glossar (hier); README; alle Live-Verweise per `grep` |
   | Neue Wissensdatei in `knowledge-base/` | `knowledge-base/SSOT-Document-Index.md` Teil 2 (**testerzwungen**: Vollständigkeit + Linkgültigkeit); Glossar (hier) nur bei neuer Kategorie |
   | Hook / Gate geändert | `plugins/nc/hooks/hooks.json` (`description` trägt den Prosa-Zustand der ganzen Kontroll-Schicht), `grundwissen/NovaCore-OS-Gates-Definition.md`, README (Hook-Tabelle inkl. Opt-out-Envs), `SECURITY.md` (Garantie-Zeile, Opt-out, Grenze) — Details: `standardprozesse/aktualisierungs-index.md` §2.1; Bump und Waypoint erst am Release-Zug |
   | Pflicht-Einstieg / rote Linien geändert | der Text ist gespiegelt in `nc-session-start.js`, `skills/start/SKILL.md`, `doks/global-claude-firmenblock.md` und hier — alle vier gemeinsam, **plus Kern-Bump** |
   | Agent macht selbst einen Fehler | `debugging-findings/agent-learnings.md` (sofort, append-only) |
   | Sitzungswissen-Ort geändert | `plugins/nc/doks/nc-teamsync.md` §3, Skills `start`/`end-session`/`journal` (Kern), `SSOT-Document-Index.md`, hier (Glossar) — **plus Kern-Bump** |
   | Skill neu / entfernt / umbenannt | Skill-Tabelle (README + Plugin-README), Trigger-Matrix (`workflow.md`), CHANGELOG, Registry |
   | Neues Modul | Registry, README, CHANGELOG, Repo-Karte (hier) |
   | **Neues Abteilungsplugin** | Standardprozess `abteilungs-plugin-bau.md` befolgen (Marketplace, Registry, hier, README, CHANGELOG, Install-Probe) |
   | Version-Bump (nur am Release-Zug, §3.6) | nur `plugin.json` (Kern: + `VERSION` + Registry) + Waypoint-Abschnitt im CHANGELOG — **nie** im Marketplace-Eintrag, **nie** im Strang |
   | Design-Entscheidung geändert | **zuerst** Spec-Nachtrag in `grundwissen/`, dann hier/README |

3. **Drift-Regel:** Toter Pfad oder falsche Angabe in dieser Datei → realen Zustand
   verifizieren (Glob / `git log`), sofort korrigieren, Korrektur im Ergebnis melden.
4. **Historisch bleibt historisch:** CHANGELOG-Alteinträge, die v0.1.0-Spec und Findings
   werden nie rückwirkend umgeschrieben; nachgezogen werden nur lebende Dokumente.
