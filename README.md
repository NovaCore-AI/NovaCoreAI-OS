# NovaCoreAI-OS

**NovaCore-OS** — das Team-Betriebssystem für KI-Arbeit von NovaCore AI, ausgeliefert als
**Familie von Claude-Code-Plugins** aus einem Marketplace: eine Methode für alle statt
vieler Privat-Setups.

**Status: Kern `nc` v0.13.0 · Abteilung `nc-development` v0.2.0 · Abteilung `nc-felix`
v0.4.1 (erster Satellit, eigenständiges Felix-OS) · Abteilung `nc-biggi` v0.1.1 (zweiter
Satellit, eigenständiges Biggi-OS) · Affiliate `kimi-code-plugin-cc` v1.4.0 (extern) ·
Affiliate `mneme-kimi-code` v2.0.24 (extern) —
Multi-Plugin-Architektur (Umbau 2026-07-28), Kontroll-Schicht mit Gate 1–3 + zwei
Zeiger-Hooks (Onsite-Delta-Nachbau 2026-08-23/24; Gate 4 endgültig entfallen).** Historie: [CHANGELOG.md](CHANGELOG.md) · Normativ für
Agenten: [AGENTS.md](AGENTS.md) · Wissens-Triage:
[`knowledge-base/SSOT-Document-Index.md`](knowledge-base/SSOT-Document-Index.md) ·
Design-Spec:
[`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`](knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md)

## Architektur

Ein Marketplace (`novacore-os`), je Abteilung ein Plugin; der Kern ist Dependency der
Abteilungsplugins dieses Repos — eigenständige Satelliten-OS wie `nc-felix` und `nc-biggi`
bringen ihren Kern als **Modul** selbst mit:

| Plugin | Rolle | Namespace | Version |
|---|---|---|---|
| `nc` | **Kern** — ständige Abteilung `gemeinsam`: Session-Zyklus, Infrapflege-Skills, SSOT-Präsenz-Router (`wissen-*`), Queue-Flow-Skills (`queue-abteilung`/`queue-kern`), Kontroll-Schicht (Gate 1 + Gate 2 + Gate 3 + Queue-Fälligkeits-Erinnerung + zwei Zeiger-Hooks), Doks-Autosync, WP-Rahmen, Registry, Formatregeln, `nc-sync.md`, Subagenten (`agents/`) | `/nc:` | 0.13.0 (= `VERSION`) |
| `nc-development` | Abteilung development — Module `fe` / `be` / `flc` / `wzs` / `qs` / `rel` | `/nc-development:` | 0.2.0 |
| `nc-felix` | Abteilung felix — **eigenständiges Felix-OS** (erster Satellit, privates Repo `NovaCore-AI/Felix-OS`): Kernmodul mit 7 Skills, eigene Kontroll-Schicht mit Gate 1 + Gate 2 (markerlos) und eigene isolierte Wissensbasis, hängt **nicht** am Kern | `/nc-felix:` | 0.4.1 |
| `nc-biggi` | Abteilung biggi — **eigenständiges Biggi-OS** (zweiter Satellit, privates Repo `NovaCore-AI/Biggi-OS`): Kernmodul mit 6 Skills + Kontroll-Schicht (FFG + Session-Start-Zwang nach Onsite-Vorbild), hängt **nicht** am Kern; Arbeitsmodul-Konvention `ctrl` / `mdzn` / `doc`+`day` reserviert | `/nc-biggi:` | 0.1.1 |
| `kimi-code-plugin-cc` | **Affiliate** (keine Abteilung) — externes MIT-Plugin `ArchiDoxx/Kimi-code-Plugin-CC`: bindet headless CLI-Agenten (Kimi Code) als Zweitmeinung ein (Review-/Planning-Loops, adversariale Dual-Reviews). Host-Anforderungen: `uv` + `kimi`-CLI | `/kimi-code-plugin-cc:` | 1.4.0 (extern) |
| `mneme-kimi-code` | **Affiliate** (keine Abteilung) — externes AGPL-3.0-Plugin `ArchiDoxx/mneme-kimi-code`: persistentes Projekt-Gedächtnis über Sessions hinweg (7 Hooks → lokale SQLite, Rückholung per Skill `mem-search` + MCP-Tools; Claude Code und Kimi Code). Host-Anforderung: `uv` | `/mneme-kimi-code:` | 2.0.24 (extern) |

- **Plugin-Grenze = Abteilungsgrenze:** Wer eine Abteilung installiert, bekommt den Kern
  transitiv mit (`dependencies: ["nc"]`). Ausnahme: die eigenständigen Kollegen-OS
  `nc-felix` und `nc-biggi` führen keine Kern-Dependency (Kernmodul + Kontroll-Schicht im
  Plugin selbst).
- **Hooks nur im Kern**, Module sind Skill-Präfixe, die `module-registry.json` ist reiner
  Metadaten-SSOT.
- **Memory:** im OS-Repo selbst committet unter `knowledge-base/sitzungswissen/` (Stand,
  append-only Journal, Register, Roll-up); in einem fremden Arbeits-Repo ohne eigene
  Wissensbasis entsteht kein Dateistrom mehr — dort trägt das Projekt-Memory von Claude Code
  den Stand allein.
- **Satelliten:** `nc-felix` und `nc-biggi` leben in eigenen privaten Repos (das Repo IST
  das Plugin); der Marketplace-Eintrag pinnt per GitHub-Source auf einen Commit-SHA
  (`abteilungs-plugin-bau.md` §3a/§3b — der `sha` ist der effektive Pin).
- **Kategorie `affiliate` — firmenintern vs. affiliate:** Der Marketplace verteilt neben
  Kern und Abteilungen auch persönliche bzw. externe Werkzeuge. Sie sind **keine
  Abteilungen**: keine Zeile in der `module-registry.json`, keine Kern-Dependency, **kein
  Memory-/Wissens-Share** mit Kern oder Satelliten (Begriffsnorm:
  [`NovaCore-OS-SSOT-Definition.md`](knowledge-base/grundwissen/NovaCore-OS-SSOT-Definition.md)).
  Externe Quellen werden wie Satelliten per `ref` **und** vollem Commit-SHA gepinnt
  (testerzwungen). **Bekannte Grenze:** Bringt ein solches Plugin einen MCP-Server mit
  (wie `kimi-code-plugin-cc`), laufen dessen `mcp__*`-Werkzeuge **nicht** durch das FFG —
  der Matcher deckt sie heute nicht ab. Das ist dokumentiert, nicht still.

## Skills

**Kern `nc` (immer dabei):**

| Skill | WP | Zweck |
|---|---|---|
| `/nc:start` | WP0 | Session-Start: Stand, Journal, Git-Lage laden — kein Blind-Start; liest je installiertem Abteilungsplugin dessen CLAUDE-Ebene 2 (`<abteilung>-abteilungs-claude.md`); setzt zum Abschluss den Fakten-Stempel, der Gate 2 öffnet |
| `/nc:end-session` | WP8 | Session-Ende (bis 0.7.x `save-session`): Journal schreiben, Stand + Roll-up + Offene-Stränge-Register konsolidieren, Projekt-Memory spiegeln, Sitzungsergebnisse gegen die Kriterienliste in die Kandidaten-Queue der Abteilung klassifizieren (Queue-Flow, Station 1); letzter Schritt setzt den Abschluss-Stempel, der die PreCompact-Mahnung der Sitzung abschaltet |
| `/nc:journal` | laufend | Einzelne Ereignisse sofort festhalten |
| `/nc:setup` | einmal pro Rechner, danach bei Bedarf | Reconciler über sechs Soll-Schichten S0–S6 (seit 0.8.0): Voraussetzungen + Plugin-Stand prüfen, Wissensbasis als Lesekopie bereitstellen (voller Klon nach `~/.nc/ssot/<repo-name>/`, Fast-Forward, Sparse-Heilung), Sitzungswissen-Gerüst reconcilen (nur bei eigener Wissensbasis des Repos — sonst nicht anwendbar, kein Dateistrom), CLAUDE-Lokaldokumente verifizieren, Infra-Registry `~/.claude/nc/infra.json` schreiben — mehrfach ausführbar, kein Schritt legt doppelt an |
| `/nc:update-doks` | Maintainer, bei Bedarf | **Eine Aufgabe seit 0.12.0:** Kreuzverweis-/Pfad-Pflege der harten SSOT-Dokumente — erhebt Drift (tote Links, verschobene Pfade, veraltete Kreuzverweise, Index-Lücken) gegen die Änderungs-Matrix und den SSOT-Document-Index, zeigt eine Vorschau vor dem Schreiben und zieht erst nach Bestätigung nach; nur Maintainer-Vokabular triggert |
| `/nc:os-info` | jederzeit | Erklärt das OS **auf Basis der realen Installation** — Plugins, Module, nutzbare Skills, Gate-Status |
| `/nc:skill-builder` | jederzeit | Führt durch den Bau eines Skills nach den OS-Regeln (Sandbox oder OS-Beitrag, inkl. Fork-back) |
| `/nc:wissen-aendern` | WP1 / WP8 | Router: Zeiger auf die Änderungs-Matrix und die Standardprozesse — was eine Änderung am OS vorher lesen und in derselben Änderung nachziehen muss |
| `/nc:wissen-planen` | WP0 / WP1 | Router: Zeiger auf laufende/abgeschlossene Baupläne, Bauplan-Archiv, Ideen-Backlog, Anker-Reservierung und das Sitzungswissen des Arbeits-Repos (Stand, Journal, Offene-Stränge-Register) |
| `/nc:wissen-nachschlagen` | WP0 | Router: Zeiger auf Master-Index (SSOT-Document-Index), Repo-Karte, Produktarchitektur, Design-Specs und die normativen Begriffsdokumente der Wissensbasis |
| `/nc:wissen-protokolle` | WP1–WP8, begleitend | Router: Zeiger auf Fehlerprotokoll und Debug-Log samt Eintragspflicht, dazu die append-only Register des Wissensflusses (Kandidaten-Queue, Queue-Protokolle) |
| `/nc:queue-abteilung` | WP8, 14-tägig | Erste Station des Queue-Flows: bündelt die lokal gesammelten SSOT-Commits samt neuer Kandidaten-Queue-Zeilen eines Abteilungs-Satelliten-Klons zu einem Zyklus-PR gegen das Abteilungs-Repo. Push/PR-Anlage je Lauf einzeln freigabepflichtig |
| `/nc:queue-kern` | WP8, 14-tägig (+1 Tag Versatz) | Zweite Station: prüft die **gemergte** Abteilungs-Queue gegen die Kriterienliste und die Kern-SSOT (No-Duplicate), entwirft Kern-Dokument + Prüfprotokoll und stellt einen Promotions-PR; Folgelauf schreibt die Marker zurück |

**Subagenten (Kern `nc`):** `agents/sync-nachzug-executor.md` — schreibender Executor (Marker
`nc:schreibend`, `sonnet`, ohne `Bash`), bündelt am Bauzyklus-Ende die abgeleiteten
Doku-Nachzüge aus dem Protokoll des führenden Agenten. Format-Referenz (ausgeliefert):
`plugins/nc/referenz/agent-authoring.md` (Feldkanon, Werkzeuggrenzen-Regel,
Defense-Baseline-Pflichtbaustein).

**Abteilung `nc-development`:**

| Modul | Skills | WP |
|---|---|---|
| `flc` Feature-Lifecycle | `flc-feature-start` · `flc-plan` · `flc-commit-prep` · `flc-pr` | WP1–WP5 |
| `fe` Frontend | `fe-review` | WP6 |
| `be` Backend | `be-review` | WP6 |
| `wzs` Empfehlungssystem WZS | `wzs-attribution` · `wzs-blocker-gate` · `wzs-reward-guard` · `wzs-share-invariant` · `wzs-webhook-contract` | WP3/WP6 |
| `qs` QS & Abnahme | `qs-bugfix` · `qs-abnahme` | WP7 |
| `rel` Release-Zyklus | `rel-vorbereitung` · `rel-verifikation` (beide nur manuell aufrufbar) | WP7 |

CLAUDE-Ebene 2 der Abteilung: `plugins/nc-development/development-abteilungs-claude.md`
(gelesen von `/nc:start`); deklarative Pflege-Ausprägung:
`plugins/nc-development/pflege-auspraegung.json` (Queue-Ort, Kriterienverweis,
Journal-Sonderregeln, WZS-Domänen-rote-Linien, Übergangsregel).

**Abteilung `nc-felix` (eigenständiges Felix-OS):** Kernmodul ohne Präfix — `start`,
`save-session`, `journal`, `os-info`, `code-tour`, `skill-builder`; Arbeitsmodule folgen
(Satelliten-Repo mit eigener Kontroll-Schicht, siehe Architektur — nicht parallel zu `nc`
betreiben).

**Abteilung `nc-biggi` (eigenständiges Biggi-OS):** Kernmodul ohne Präfix — dieselben
6 Skills als markerlose Ports; Arbeitsmodule als Namenskonvention reserviert:
`controlling` (`ctrl`), `medizinisches` (`mdzn`), `dokumentation-daily-work` (`doc` +
`day` — ein Modul, zwei Präfixe). Satelliten-Repo mit eigener Kontroll-Schicht (FFG +
Session-Start-Zwang) — nicht parallel zu `nc` oder `nc-felix` betreiben.

Fachablauf und Trigger-Matrix: [`plugins/nc-development/workflow.md`](plugins/nc-development/workflow.md);
Rahmen WP0–WP8: [`plugins/nc/wp-rahmen.md`](plugins/nc/wp-rahmen.md).

## Kontroll-Schicht (Hooks, nur im Kern)

| Hook | Event | Verhalten |
|---|---|---|
| `nc-ffg` (Gate 1, Fact-Forcing-Gate) | PreToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash) | Fakten **vor** der Aktion: Datei-Gate je Zieldatei (inkl. `NotebookEdit` auf `notebook_path`), Destruktiv-Gate je Kommando (quote-aware, inkl. Windows-Destruktivmuster und Wrapper-Passthrough), Routine-Bash einmal je Session; Read-only-Git nie. **Markerlos aktiv**, Opt-out nur per Env `NC_FFG=off`; Betreiber-Schalter: `NC_FFG_EXEMPT_GLOBS`, `NC_FFG_FULL_DENIALS`, `NC_FFG_EXTRA_DESTRUCTIVE`. Fail-open bei internen Fehlern. |
| `nc-session-start` (Gate 2, Teil 1) | SessionStart | Injiziert Pflicht-Einstieg, **lebenden Projektstand** (VERSION, Branch, Commits, Working Tree, `[Unreleased]`, laufende Vorhaben, Abteilungen) und den exakten Stempel-Befehl. **Markerlos** — ein Gate, das man vergessen kann, ist kein Gate. Kann laut Doku nicht blocken. |
| `nc-start-gate` (Gate 2, Teil 2) | PreToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash) | Lehnt jede **schreibende** Aktion ab, bis `/nc:start` mit dem Fakten-Stempel abgeschlossen ist. Der Stempel (`nc-start-stempel.js`) verifiziert `--branch`/`--head` gegen die Git-Lage des **Projektverzeichnisses** und vermerkt, ob überhaupt etwas zu prüfen war — ein ungeprüft gesetzter Stempel öffnet nicht in einem Git-Baum. Lesen, Read-only-Git (auch mit Pfadwechsel per `cd`/`git -C`, Verkettung und `worktree list`) und die Stempel-Invokation selbst bleiben frei; Subagenten ausgenommen. Opt-out `NC_START_GATE=off` — **ein** Schalter für beide Gate-2-Teile. Reichweite und Grenzen: [Gates-Definition](knowledge-base/grundwissen/NovaCore-OS-Gates-Definition.md). |
| `nc-safety-gate` (Gate 3, Safety-Gate) | PreToolUse (`Bash`, `mcp__.*`) | Echter Freigabedialog (`permissionDecision: "ask"`) vor riskanten Aktionen: Musterliste v1 im NovaCore-Zuschnitt (tofu/terraform apply/destroy, generisches deploy-Wort mit Verbpositions-Ausnahme get/describe/logs, mcp-Schreibverben über Werkzeug- und Parameternamen), inkl. der vier GLM-Bypass-Härtungen des Vorbilds (Shell-Wrapper-Rekursion, Präfix-Kommandos, gequotetes Kommandowort, Verbpositions-Schärfung). Kein State — jeder Treffer fragt erneut; Subagenten **nicht** ausgenommen. Opt-out `NC_SAFETY_GATE=off`. |
| `nc-doks-autosync` | SessionStart | Hält **zwei** Ziele unabhängig voneinander auf dem Stand des installierten Kerns: Ebene 1 — Firmen-Block in `~/.claude/CLAUDE.md` per Marker-Chirurgie (`NC:BLOCK:…`), **Privat-Zone außerhalb der Marker wird nie verändert**, bei defekten Markern wird nichts geschrieben; Ebene 1b — Team-Sync-Datei `~/.claude/nc-teamsync.md` als Ganzdatei mit Versions-Stempel in Zeile 1 (Payload: `nc-sync.md`). Backup vor jedem Schreiben (intakte Sicherungen werden nie verschlechtert), atomarer Write, zeilenenden-normalisierter Identitätsvergleich (kein CRLF-Churn). Opt-out `NC_AUTOSYNC=off` (beide Ziele), Test-Overrides `NC_AUTOSYNC_TARGET` / `NC_AUTOSYNC_TEAMSYNC_TARGET`. |
| `nc-end-mahnung` (PreCompact-Mahnung) | PreCompact (ohne Matcher: manual + auto) | Blockt die **erste** Kompaktierung einer Sitzung ohne abgeschlossenes `/nc:end-session` (Blockade über top-level JSON `decision`, Exit bleibt 0) und nennt den Abschluss-Stempel `nc-end-stempel.js`; die zweite Kompaktierung läuft immer durch (Loop-Schutz). Marker verfallen nach 30 Min **Inaktivität** (Heartbeat). Subagenten ausgenommen. Opt-out `NC_PRECOMPACT=off`, State-Override `NC_END_STATE_DIR`. **Nicht Gate 4** — Gate 4 ist endgültig entfallen (Onsite §15.44). |
| `nc-queue-faelligkeit` (Queue-Fälligkeits-Erinnerung, **kein Gate**) | SessionStart | Erinnert je Sitzungsstart an zwei Fälligkeiten des Queue-Flows: nicht eingereichte Wissensbasis-Arbeit im Abteilungs-Satelliten-Klon und offene Zeilen der **gemergten** Abteilungs-Queue — 14-Tage-Takt plus ein Tag Versatz. Blockiert nichts, injiziert nur einen Hinweis; höchstens fünf lokale Git-Aufrufe für den Fälligkeits-Teil. Repo-Pfade ausschließlich über die Infra-Registry `~/.claude/nc/infra.json`; fehlt dort ein Abteilungs-Satellit, schweigt der Hook (heutiger Übergangszustand — `development` liegt repo-intern). Zweiter Befund desselben Hooks: PR-Sichtbarkeit über alle Repos der Infra-Registry — der einzige, mehrfach gedeckelte Netzzugriff der Kontroll-Schicht (Zeitbudget, Tages-Cache, Schweigen bei unbrauchbarem `gh`). Subagenten ausgenommen. Opt-out `NC_QUEUE_CHECK=off` (ganzer Hook), `NC_PR_CHECK=off` (nur der PR-Netzteil), Test-Overrides `NC_QUEUE_STATE_DIR` / `NC_QUEUE_SESSION_DIR` / `NC_QUEUE_PFAD` / `NC_PR_CMD`. |
| `nc-wissens-hinweis` (Wissens-Zeiger der SSOT-Präsenz, **kein Gate**) | UserPromptSubmit | Gleicht Stichworte des Prompts gegen den vorgebauten Sucheindex `hooks/wissen-sucheindex.json` (38 Einträge) ab und injiziert höchstens drei Einzeiler-Treffer als `additionalContext` — Zeiger auf Node-Doks und Quellen der Wissensbasis, nie deren Inhalt; ergänzt die vier Router-Skills `wissen-*`. Exit-Code niemals 2 (würde den Prompt löschen). Derselbe Treffer höchstens einmal je Sitzung; Repo-Pfad über die Infra-Registry (`kernRepoPfad`, sonst `kernSsotPfad`). Subagenten ausgenommen. Opt-out `NC_WISSEN_HINWEIS=off`, Test-Overrides `NC_WISSEN_INDEX` / `NC_WISSEN_STATE_DIR` / `NC_WISSEN_SESSION_DIR`. |
| `nc-pfad-hinweis` (Pfad-Zeiger der Disziplin-Schicht, **kein Gate**) | PreToolUse (Write/Edit/MultiEdit/NotebookEdit — bewusst **ohne** Bash) | Legt bei der ersten Schreibaktion je Sitzung und je Pfadklasse (22 Klassen in `hooks/pfad-aenderungsindex.json`, Auflösung per längstem Prefix) die passende Zeile der Änderungs-Matrix bei — was vorher zu lesen, was nachzuziehen ist. `permissionDecision` wird **nie** gesetzt (weder deny noch allow). Höchstens drei Klassen je Aufruf, jede höchstens einmal je Sitzung; Repo-Pfad ausschließlich über `kernRepoPfad` (keine Lesekopie-Fallback). Subagenten ausgenommen. Opt-out `NC_PFAD_HINWEIS=off`, Test-Overrides `NC_PFAD_INDEX` / `NC_PFAD_STATE_DIR` / `NC_PFAD_SESSION_DIR`. |

Gate 3 (Safety-Gate, `nc-safety-gate.js`) ist **gebaut** — echter Freigabedialog vor
riskanten Aktionen (Musterliste v1 im NovaCore-Zuschnitt, Wortlaut-Abnahme am Phasen-PR
aussteht). Gate 4 (Sitzungsabschluss als eigener Hook) ist **endgültig entfallen** (Onsite
§15.44) — die PreCompact-Mahnung bleibt bestehen, war aber nie Gate 4. Übersicht und
Abgrenzungen:
[`NovaCore-OS-Gates-Definition.md`](knowledge-base/grundwissen/NovaCore-OS-Gates-Definition.md).
Das frühere marker-gebundene Safety-Gate ist im Destruktiv-Gate des FFG aufgegangen
(deny statt ask, breitere Erkennung); der `.nc-os`-Marker hat seit dem Umbau 2026-08-10
**keine Funktion mehr**.

## Installation

Voraussetzungen: Claude Code **≥ 2.1.193**, Node.js ≥ 18 (Hooks). In Claude Code:

```
/plugin marketplace add NovaCore-AI/NovaCoreAI-OS
/plugin install nc-development@novacore-os
```

Der Kern `nc` kommt automatisch als Dependency mit. Die eigenständigen Kollegen-OS
installieren sich analog per `/plugin install nc-felix@novacore-os` bzw.
`/plugin install nc-biggi@novacore-os` (Satelliten — auf Maschinen ohne geladenen SSH-Key
vorher `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` setzen); sie bringen eine eigene
Kontroll-Schicht mit und laufen **nicht** parallel zu `nc`/`nc-development` oder
zueinander in derselben Session. Details, Migration von v0.2.0 und
Arbeits-Repo-Einrichtung: [ONBOARDING.md](ONBOARDING.md).

## Update

Marketplace-Mechanik: Versions-Bump in `plugin.json` → `/plugin update` bzw. Auto-Update.
Es gibt **keine** eigene CLI mehr (`ncos`/Setup-Skripte sind mit 0.3.0 entfallen).

## Entwicklung

```bash
npm test                                        # node --test plugins/nc/tests/*.test.mjs
claude plugin validate .                        # Marketplace-Manifest
claude plugin validate plugins/nc --strict      # Manifest + Skills (je Plugin!)
claude plugin validate plugins/nc-development --strict
```

Verbindliche Prozesse: [`kern-plugin-bau.md`](knowledge-base/standardprozesse/kern-plugin-bau.md)
(Kern-Plugin) · [`abteilungs-plugin-bau.md`](knowledge-base/standardprozesse/abteilungs-plugin-bau.md)
(Abteilungen und Satelliten) · [`ssot-aufbau.md`](knowledge-base/standardprozesse/ssot-aufbau.md)
(Wissensbasis) · [`sync-nachzug-bauzyklus.md`](knowledge-base/standardprozesse/sync-nachzug-bauzyklus.md)
(Nachzüge je Bauzyklus) · [`os-bau-methode.md`](knowledge-base/standardprozesse/os-bau-methode.md)
(Gesamt-Methode) · [`claude-netz-bau.md`](knowledge-base/standardprozesse/claude-netz-bau.md)
(CLAUDE-Ebenen) · [`subagenten-bau.md`](knowledge-base/standardprozesse/subagenten-bau.md)
(Subagenten) · [`anker-reservierung.md`](knowledge-base/standardprozesse/anker-reservierung.md)
(Anker bei Parallelbau) · [`abteilungs-inhalts-pruefung.md`](knowledge-base/standardprozesse/abteilungs-inhalts-pruefung.md)
(Inhalts-Audit je Abteilung) · [`team-distribution.md`](knowledge-base/standardprozesse/team-distribution.md)
(Team-Rollout) · [`queue-flow.md`](knowledge-base/standardprozesse/queue-flow.md) (Weg eines
Wissensstücks von der Sitzung in die Kern-SSOT, nur Abteilungen mit Kern-Dependency) ·
[`kriterien-pflege.md`](knowledge-base/standardprozesse/kriterien-pflege.md)
(Pflege der Kriterienliste „firmenrelevant"). Skill-Format: `plugins/nc/referenz/skill-authoring.md`;
Agent-Format: `plugins/nc/referenz/agent-authoring.md`; Queue-/Pflege-Ausprägungs-Format:
`plugins/nc/referenz/pflege-auspraegung.md`.

## Versionsmodell

Je Plugin **eine** Version, genau an einer Stelle: `plugins/<name>/.claude-plugin/plugin.json`
— die Marketplace-Einträge tragen bewusst **kein** `version`-Feld. Kern-Version =
Produkt-Leitversion (`VERSION` + Registry gespiegelt, testgesichert). Kein Bump = kein
Auto-Update.

## Koexistenz

Eigene Namespaces `nc:`/`nc-development:`/`nc-felix:`/`nc-biggi:`, keine Kollision mit
`uni:` oder ECC. Die Kontroll-Schicht des Kerns ist **markerlos** in jeder Session aktiv,
in der der Kern installiert ist: FFG (`NC_FFG=off`), Session-Start-Zwang
(`NC_START_GATE=off`), Doks-Autosync (`NC_AUTOSYNC=off`), PreCompact-Mahnung
(`NC_PRECOMPACT=off`). Die eigenständigen `nc-felix` und
`nc-biggi` tragen eigene Kopien dieser Hooks mit denselben Env-Schaltern — deshalb `nc`,
`nc-felix` und `nc-biggi` **nie parallel** in derselben Session betreiben (die Gates feuern
sonst doppelt). Affiliate-Plugins wie `kimi-code-plugin-cc` bringen keine Gates mit und
sind von dieser Regel nicht betroffen.

---

*Pflege: NovaCore AI · Sprache aller Artefakte: Deutsch*
