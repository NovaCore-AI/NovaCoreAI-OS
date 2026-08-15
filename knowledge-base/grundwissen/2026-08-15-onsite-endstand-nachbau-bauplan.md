# Bauplan 2026-08-15 — Onsite-Endstand-Nachbau (Onsite 0.22.0 → NovaCore)

> **Status:** Entwurf zur Maintainer-Freigabe (Auftrag Lucas Vöhringer, 2026-08-15: „das
> Onsite-OS ist final fertig … das werden wir 1:1 in NovaCore-OS umsetzen mit Anpassungen wo
> nötig"; zwei Leitplanken aus demselben Auftrag: **(L1)** die SSOT-Skills im Kern-Plugin und
> das korrekte SSOT-Setup werden zuerst abgesichert — wie im Onsite-OS; **(L2)** die konkreten
> Skills außerhalb des Kern-Plugins kommen ganz am Ende). **Adversarial reviewt** durch
> Opus-Agent am 2026-08-15: 20 Findings (1 CRITICAL / 5 HIGH / 11 MEDIUM / 3 LOW), alle
> eingearbeitet; Faktencheck aller Versions- und Datei-Belege bestanden.
>
> **Erhoben gegen:** Onsite.ai-OS `origin/feat/queue-flow@c55085f` (Kern **0.22.0**, PR #58
> „Queue-Flow" **ungemergt** — der importierte Rollout-Katalog setzt dessen Merge voraus) und
> `origin/main@efd90c1` (0.21.0). NovaCore-Basis: `main@8885495` (Kern **0.7.1**, inkl.
> Firmenkernprozesse-Import PR #18). Exploration am 2026-08-15 durch vier parallele
> Sonnet-Agenten (Prozesskarten-Delta · Featurekarte/Rollout-Inventar · Neuerungs-Timeline ·
> Code-Ground-Truth) plus eigene Verifikation (Testsuite-Lauf, `/nc:setup`-Probelauf,
> Git-Forensik beider Repos).
>
> **Vorgängerpläne:** [Onsite-Align-Umbau 2026-08-10](2026-08-10-onsite-align-umbau-bauplan.md)
> · [SSOT-Provisionierung 2026-08-10](2026-08-10-ssot-provisionierung-bauplan.md) ·
> [Prozesskorpus-Nachzug 2026-08-11](2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md).
> Deren Mapping-Regeln und Invarianten gelten fort, soweit hier nicht ausdrücklich revidiert.

## 0. Auftrag und Abgrenzung

1. **1:1 in der Substanz, nicht zeichengleich:** Namen, Pfade, Envs nach §2 gemappt;
   Onsite-Firmenspezifika (GitLab/Jira-PAR/PartSens/AWS/InDesign/LinkedIn) werden **nicht**
   blind übernommen, sondern je Fall generisch abstrahiert oder ausgelassen (§2, §8/E5).
2. **Weisungsquelle** ist der importierte Korpus `knowledge-base/firmenkernprozesse/`
   (Prozesskarten 00–10, Rollout-Katalog 00–05, Featurekarte, drei Berichte) **plus** der reale
   Onsite-Quellcode. Bei Widerspruch zwischen Karte und Platte gewinnt die Platte des Vorbilds
   (`origin/feat/queue-flow`), der Widerspruch wird protokolliert.
3. **Der einzige harte Alt-Ausschluss** (Vorgängerplan §0.3: keine Queue, keine Promotion,
   keine Cross-Satelliten-Reads) **kollidiert mit dem neuen 1:1-Auftrag**, denn Onsite
   0.16.0–0.22.0 ist im Kern der Queue-Flow. Das wird nicht stillschweigend übergangen,
   sondern als Entscheid **E1** (§8) sauber aufgelöst: die Isolation der **eigenständigen
   Kollegen-OS** (Felix, Biggi) bleibt in jedem Fall bestehen (§3 I8) — zur Entscheidung steht
   nur der Queue-Flow zwischen Kern und **echten Abteilungen mit Kern-Dependency**.
4. **Nicht Teil dieses Plans:** Bau von `oai-mneme`/Dreaming (bei Onsite selbst nur
   Konzeption, Bau nicht freigegeben) und der Metaflow-Umbau (bei Onsite reine Konzeption,
   E1–E7 offen). Beide sind Kandidaten für den `ideen-backlog/`, kein Arbeitspaket.

## 1. Verifizierte Ausgangslage (2026-08-15)

### 1a. Sync-Punkt und Rückstand

Letzter NovaCore-Sync erfolgte gegen Onsite `5d335a7` = Merge PR #29 = Kern **0.15.0**
(2026-08-11). Alles ab Onsite **0.16.0** fehlt in NovaCore vollständig:

| Onsite-Version | Neuerung (Mechanik) |
|---|---|
| 0.16.0/0.16.1 | Kandidaten-Queue angeschlossen, `sammel-pr`, `pflege-auspraegung.json` v1, Kriterien a–d |
| 0.17.0 | CLAUDE-Netz vollendet: Ebene 1b (`oai-teamsync.md`, Ganzdatei-Autosync) + Ebene 2 (Abteilungs-CLAUDE als Pflichtbestandteil jedes Abteilungsplugins) |
| 0.18.0–0.18.2 | `save-session`→`end-session` (BREAKING), 4. Hook **PreCompact-Mahnung** + Heartbeat-Fix, `init`-Fixes (alle SSOT-Bausteine in S4, `gh`-Klon-Resilienz, absolute Registry-Pfade) |
| 0.19.0 | Payload-Review Ebene 1/1b (Firmenblock = normative Quelle der roten Linien) |
| 0.20.0 | Satelliten-Extraktion `development` (Commit-SHA-Pin-Falle dokumentiert + getestet) |
| 0.21.0 | **Subagenten als Komponentenklasse** (`agents/`, `agent-authoring.md`, `sync-nachzug-executor`, Allowlist-Sicherheitsmodell) + **Anker-Reservierung** (`reserve/*`-Tags) |
| 0.22.0 (PR #58, ungemergt) | **2-Stufen-Queue-Flow**: `queue-abteilung` + `queue-kern`, Fälligkeits-Hook, Ledger, Queue-Protokolle |

Schon vor dem Cutoff gebaut, aber in NovaCore **nie übernommen**: `/oai:init` als
S0–S6-Reconciler mit Infra-Registry (0.14.0), `/oai:update-doks` (0.15.0),
**SSOT-Residenzpflicht** `sitzungswissen/` + Offene-Stränge-Register (0.13.0),
`/oai:firmenwissen-suche` (Atlassian, firmenspezifisch).

### 1b. SSOT-Skills im Kern — Ist-Befund (L1-Gegenstand)

- Kern-Testsuite grün (97/97) — der Schaden ist **kein Strukturproblem**.
- `~/.nc/` existierte auf der Maintainer-Maschine **nicht**: `/nc:setup` war nie erfolgreich
  gelaufen; der Firmenblock verlinkte ins Leere. Probelauf 2026-08-15: `ssot-provision.js
  --json` läuft fehlerfrei und legte `~/.nc/ssot/NovaCoreAI-OS` an (Zeiger `index.json`
  hält Commit `8885495…` fest) — das Skript
  funktioniert, aber **nichts erzwingt oder verifiziert seine Ausführung**.
- `/nc:setup` deckt nur Onsites Schritt **S2** (Klon/Fast-Forward) ab. Es fehlen: S0
  (Voraussetzungs-Check), S1 (Plugin-Stand), S3 (Infra-Registry `infra.json`), S4
  (SSOT-Struktur-Anlage — Onsite-Lehre 0.18.2: **alle** Pflichtbausteine anlegen, sonst
  Zirkelverweis-Deadlock auf frischen Maschinen), S5 (CLAUDE-Doks-Verifikation), S6
  (Abschlussbericht); ebenso das dreiwertige Lagebild (0.16.1: „lokal erweitert" ≠ „defekt").
- `/nc:start` und `/nc:save-session` sind gegenüber dem Vorbild rückständig: kein
  Projekt-Memory-Spiegel, kein Offene-Stränge-Register, kein Roll-up, keine Residenzpflicht
  (`.nc/erinnerung/` ist einziger Wohnort statt Fallback), keine Queue-Klassifikation.
- `/nc:update-doks`-Pendant fehlt ganz (Marker-Reparatur F1 + Konsistenzlauf F2).

### 1c. Mechanik-Delta Kontroll-Schicht und Komponenten (Code-Ground-Truth)

| Fehlt in NovaCore | Onsite-Beleg |
|---|---|
| PreCompact-Mahnung + Heartbeat | `hooks/oai-end-mahnung.js`, `oai-end-stempel.js`, Event `PreCompact` |
| Doks-Autosync **Ebene 1b** (Teamsync-Ganzdatei) | `oai-doks-autosync.js` (`syncTeamsync()`), `doks/oai-teamsync.md` |
| Queue-Fälligkeits-Hook | `hooks/oai-queue-faelligkeit.js` (3. SessionStart-Hook) |
| Subagenten-Apparat komplett | `agents/sync-nachzug-executor.md`, `referenz/agent-authoring.md`, 2 Testdateien, `agents`-Feld der Registry, Vorlage `agents/beispiel-agent.md.vorlage` |
| Queue-Flow komplett | Skills `queue-abteilung`/`queue-kern`, `referenz/pflege-auspraegung.md`, Queue-Format v1, Ledger/Protokolle |
| Vorlage `abteilungs-claude.md.vorlage` (Ebene 2) | `vorlagen/abteilungsplugin/` |
| Kern-Skills `init`(voll), `update-doks`, `firmenwissen-suche`, `end-session`(-Umfang) | `plugins/oai/skills/…` |

### 1d. Prozesskorpus-Delta (Karten 00–10 gegen `standardprozesse/`)

**Voll abgedeckt:** 03 Kern-Plugin-Bau · 08 Sync-Nachzug-Bauzyklus. **Teilweise:** 00
(Familienkarte fehlt als Gattung), 01 (keine Agent-Zeile, kein Anker-§, keine 4. Bump-Stelle),
02 (Sequenzierungs-Gate — bewusste NC-Abweichung „Hooks nur im Kern", keine Lücke), 04
(Schwester-Bezug CLAUDE-Netz fehlt), 05 (nur Marker-Mechanik in `kern-plugin-bau.md` §2a
gedeckt; Ebenen-Prinzip/Kanal-Regel/`@`-Import fehlen als Prozess). **Fehlen komplett:** 06
Team-Distribution · **07 Subagenten-Bau** · **09 Anker-Reservierung** · **10
Abteilungs-Inhalts-Prüfung**. Über die Karten hinaus führt Onsites Ruleset-Ordner
(`plugin-maintanance-ruleset-source/`, **12** Dokumente) zwei Prozesse ohne eigene Karte,
die in NovaCore ebenfalls fehlen: `queue-flow.md` und **`kriterien-pflege.md`** samt
Herleitung `project-meta-infos/Onsite.ai-OS-Kriterienliste-Definition.md` (beide → AP-E1).

### 1e. NovaCore-Vorsprünge — werden NIE verschlechtert (§3 I1)

Start-Gate-Härtungen (verankerte Stempel-Regex, Interpreter-/Realpath-Prüfung, Verbot
angehängter Zweitaktionen, `verified`-Feld + Git-Baum-Gegenprobe — Onsite prüft nur
Substring) · Autosync-Härtungen §2a.4 (atomarer Write, „Sicherung nie verschlechtern") ·
Sparse-Heilung in `ssot-provision.js` · Konfliktzonen-Regel im Sync-Nachzug ·
`abteilungs-plugin-bau.md` §1a (belegte Auslieferungsgrenze statt „Sparse-Clone-Regel") und
§3b (eigenständige Kollegen-OS) · Marketplace-Kategorie `affiliate`.

### 1f. Strukturelle Anpassungszwänge (keine Wahl, echte Unterschiede)

1. **Dieses Repo ist ÖFFENTLICH, das Vorbild privat.** Onsites Residenzpflicht legt
   Sitzungswissen (Journale, Stand, Register) **ins Repo**. Wörtlich übernommen hieße das:
   interne Arbeitsstände öffentlich committen → Entscheid **E2**.
2. **NovaCore-Satelliten sind eigenständige Kollegen-OS ohne Kern-Dependency** (Felix, Biggi)
   — Onsites Queue-Flow adressiert Abteilungs-Satelliten **mit** Kern-Dependency. Der
   Promotionspfad hat bei uns heute nur einen realen Kandidaten: die repo-interne Abteilung
   `nc-development` → prägt die E1-Optionen.
3. Onsite nutzt Jira/Confluence/GitLab (Team-Connector, MCP) — NovaCore hat dafür heute keinen
   beauftragten Firmenkontext → E5.

## 2. Mapping-Regeln (erben §2 der Vorgängerpläne, hier ergänzt)

| Vorbild | NovaCore |
|---|---|
| `oai` / `OAI_*` / `/oai:` | `nc` / `NC_*` / `/nc:` |
| `~/.claude/oai/` (`infra.json`, `queue-lauf.json`) | `~/.claude/nc/` |
| `~/.claude/oai-teamsync.md` (Ebene 1b) | `~/.claude/nc-teamsync.md` |
| `os.tmpdir()/oai-start-gate` bzw. `oai-end-gate` | `…/nc-start-gate` (Bestand) bzw. `…/nc-end-gate` |
| Marker-/Stempel-Präfixe `<!-- OAI:BLOCK:* -->` / `<!-- OAI:TEAMSYNC:* -->` | `<!-- NC:BLOCK:* -->` (Bestand) / `<!-- NC:TEAMSYNC:* -->` (neu, AP-B2) |
| `project-meta-infos/` (Definitionsdokumente/Herleitungen) | `grundwissen/` (Bestand: `NovaCore-OS-*-Definition.md`) |
| `Onsite.ai-OS-Betriebshandbuch.md` | **entfällt** — die Funktion tragen `AGENTS.md` + `README.md`; Ports (z. B. der Executor-Agent) verweisen dorthin, nie auf ein Betriebshandbuch |
| `wurzelordner` mit **Arbeitsklonen** (`~/OnsiteAI/…`) | vorerst **kein** Pendant: `~/.nc/ssot/` bleibt **Lesekopie** (read-only, Bestandsentscheid `setup/SKILL.md`); ein Arbeitsklon-Konzept entstünde frühestens mit E1/Phase E als eigener Entscheid |
| `/oai:init` (S0–S6) | `/nc:setup` wird zum Reconciler **ausgebaut** (kein zweiter Skill; der Name `setup` ist im Team eingeführt) |
| `/oai:end-session` | Entscheid E3 (Rename von `save-session` ja/nein) |
| `sitzungswissen/` in der Wissensbasis | Ausprägung nach Entscheid E2 |
| `Onsite.ai-OS-Development` (Satellit mit Kern-Dependency) | `nc-development` bleibt vorerst repo-intern; Extraktion ist Ideen-Backlog (`2026-08-10-dev-plugin-satelliten-extraktion.md`), **nicht** dieser Plan |
| Jira/Confluence/GitLab/PAR/PartSens/AWS/InDesign/LinkedIn | firmenspezifisch — auslassen oder generisch abstrahieren (E5); nie wörtlich |
| Onsite-Spec-§ (15.29/15.32/15.34/15.36 …) | Verweis auf diesen Bauplan + Definitionsdokumente in `grundwissen/` |
| Karten-Ordner `plugin-maintanance-ruleset-source/` | `standardprozesse/` (Bestand) |

## 3. Harte Invarianten (Review gated hierauf)

- **I1 — Härtungs-Erhalt (REVIEW-FOKUS).** Kein Port setzt NovaCore hinter den eigenen Stand
  zurück (§1e-Liste). Wo Onsite weicher ist (Start-Gate-Substring), wird die NC-Härtung
  beibehalten und die Abweichung im Portkopf dokumentiert.
- **I2 — Fail-Richtung je Hook exakt wie begründet.** PreCompact: defekter Abschluss-Stempel
  = „nicht gestempelt" (eine Mahnung zu viel ist harmlos), defekter Mahn-Marker = „schon
  gemahnt" (nie Dauerblockade); zweite Kompaktierung läuft **immer** durch (Auto-Compact-
  Sackgasse). Autosync: fail-safe bei defekten Markern (nichts schreiben). Fälligkeits-Hook:
  fail-open, reine Erinnerung, max. 5 Git-Aufrufe.
- **I3 — `process.exitCode`, nie `process.exit()`** (Truncation-Falle); Blockade-Entscheide
  über die dafür dokumentierten JSON-Felder (`permissionDecision` bzw. PreCompact top-level
  `decision`), nie über Exit-Codes. Opt-out-Env je Hook an drei Orten (Hook-Kopf,
  `hooks.json`-description, README).
- **I4 — Subagenten-Schreibgrenze hart im Frontmatter.** Read-only-Agenten führen
  `disallowedTools: Write, Edit, MultiEdit, NotebookEdit, Bash` — **ohne Ausnahme, auch wenn
  eine enge `tools`-Allowlist faktisch dasselbe sperrte** (Onsite-Regel wörtlich, `agent-
  authoring.md`); schreibende Agenten nur mit Marker + begründeter Allowlist; verbotene Felder (`hooks`,
  `mcpServers`, `permissionMode`) kommen nicht vor; `isolation` bleibt gesperrt, bis die
  Team-Mindestversion es trägt. Vor dem ersten Agenten wird die **Gate-Semantik von
  `nc-ffg.js`/`nc-start-gate.js` für Subagenten geklärt und dokumentiert** (Onsite-Befund:
  Datei- und Start-Gate greifen für Subagenten nicht — nur Destruktiv-Gate bleibt scharf).
- **I5 — Version nur an einer Stelle** (Bestand); **kein Bump ohne Anker**, sobald AP-C2
  gebaut ist. Satelliten-Pins per `ref` + 40-stelligem **Commit**-SHA (`^{commit}`-Regel).
- **I6 — Quelle schlägt Gedächtnis.** Jede Port-Datei wird beim Bau aus
  `git -C Onsite.ai-OS show "origin/feat/queue-flow:<pfad>"` gelesen, nie rekonstruiert; ist
  PR #58 bis dahin gemergt, aus `origin/main`. Die importierten Karten sind Zweitquelle.
- **I7 — Index-Pflicht und Wurzel-Regel** (Bestand, testerzwungen): jede neue Wissensdatei
  bekommt ihre Index-Zeile in derselben Änderung.
- **I8 — Kollegen-OS-Isolation bleibt.** Was auch immer E1 ergibt: Felix-OS und Biggi-OS
  bleiben terminal — keine Queue, keine Promotion, kein Cross-Read über die Repo-Grenze
  (Invariante I1 des Vorgängerplans gilt für sie unverändert fort).
- **I9 — Öffentliches Repo schützt Interna.** Solange dieses Repo öffentlich ist, wird kein
  personenbezogenes oder firmeninternes Sitzungswissen hineincommittet (prägt E2). Tests
  schreiben nie in echte `~/.claude/`-Ziele — Overrides nach Onsite-Vorbild:
  `NC_AUTOSYNC_TARGET` (Ebene 1) **und** `NC_AUTOSYNC_TEAMSYNC_TARGET` (Ebene 1b, neu in
  AP-B2).

## 4. Arbeitspakete — sechs Phasen in Zwangsreihenfolge

**Phase A — SSOT-Kern absichern (L1, zuerst):**

- **AP-A1 `/nc:setup` → Reconciler S0–S6.** `ssot-provision.js` bleibt als S2-Baustein
  bestehen (inkl. Sparse-Heilung); dazu: S0 Voraussetzungen (git/gh/Node/Client-Version), S1
  Plugin-Stand, S3 Infra-Registry `~/.claude/nc/infra.json` (Schema v1 nach Onsite-Vorbild:
  `schemaVersion`, `abteilung`, `szenario`, `wurzelordner`, absolute native Pfade,
  `zuletztGeprueft` je Schicht; „Platte schlägt Registry"), S4 SSOT-Struktur-Anlage
  (**alle** Pflichtbausteine — 0.18.2-Lehre), S5 CLAUDE-Doks-Verifikation (Marker Ebene 1,
  ab AP-B2 auch 1b), S6 Abschlussbericht. Dreiwertiges Lagebild (0.16.1). `gh repo clone`
  statt interaktivem Credential-Prompt. Tests gegen lokales `file://`-Origin (Bestand).
  **Drei Klärungen aus dem Opus-Review 2026-08-15:** (1) **Gate-Lage als Schritt 0** wie im
  Vorbild (`init/SKILL.md`): ist das Start-Gate aktiv und die Session ungestempelt, bricht
  der Reconciler mit klarer Anweisung ab; jede Datei-Neuanlage benennt vorab Ziel und
  Einbindungsort (FFG-konform). Lehre aus `debug-log.md` 2026-08-14 („Start-Gate blockte
  seinen eigenen Pflicht-Einstieg"): das Gate wird gegen die eigene vorgeschriebene Nutzung
  getestet (T21). (2) **`~/.nc/ssot/` bleibt Lesekopie** (Bestandsentscheid): das
  dreiwertige Lagebild wird auf Lesekopie-Semantik übersetzt — „aktuell" / „nachgezogen" /
  „lokal verändert" (Warnung, nie stilles Überschreiben); Onsites Zustand „lokal erweitert —
  Einreichung ausstehend" gehört zu **Arbeitsklonen** und käme erst mit Phase E (§2-Zeile
  Wurzelordner). (3) **Pflicht-Nachzug:** die ausgelieferte Aussage „Das OS-Repo ist privat"
  in `setup/SKILL.md` ist falsch (Repo ist PUBLIC, per `gh repo view` belegt) — korrigieren;
  S0 differenziert Kern-Quelle öffentlich / Satelliten privat.
- **AP-A2 Residenzpflicht + Register (Ausprägung nach E2).** Kategorie `sitzungswissen/` mit
  `stand.md`, `journal/`, `offene-straenge-register.md`, `roll-up.md`; `.nc/erinnerung/`
  wird Fallback für Repos ohne eigene Wissensbasis (Onsite §15.29). Index-Zeilen + Glossar.
- **AP-A3 `/nc:start` + `/nc:save-session` auf Endstand.** Start: Projekt-Memory als
  commit-unabhängige Pflichtquelle, Register/Roll-up laden, Infra-Registry lesen. Abschluss:
  Journal + Stand + Roll-up + Register + Memory-Spiegel + Abschluss-Stempel
  (`nc-end-stempel.js`, gebaut in AP-B1); Queue-Klassifikation nur nach E1. Rename nach E3.
- **AP-A4 `/nc:update-doks`.** F1 Marker-/Payload-Reparatur (fährt denselben Autosync-Code,
  kein Zweit-Chirurgie-Pfad — Onsite-Regel) + F2 index-geführter Konsistenzlauf mit
  Drift-Bericht; Fixes nur nach Freigabe.

**Phase B — Kontroll-Schicht:**

- **AP-B1 PreCompact-Mahnung.** `nc-end-mahnung.js` + `nc-end-stempel.js` (Heartbeat 60 s,
  Verfall nach 30 Min **Inaktivität**), Loop-Schutz, `NC_PRECOMPACT=off`, Tests nach
  Onsite-Muster (`oai-end-mahnung.test.mjs`), Gates-Definition + `hooks.json`-description +
  README nachziehen. Ausdrücklich **nicht** Gate 4 (bleibt auf Eis, wie im Vorbild).
- **AP-B2 Autosync Ebene 1b.** Zweites, unabhängiges Ziel `~/.claude/nc-teamsync.md`
  (Ganzdatei + Versions-Stempel `<!-- NC:TEAMSYNC:VERSION … -->`, kein Marker, keine
  Privat-Zone); Payload `doks/nc-teamsync.md` — Inhaltsquelle ist `plugins/nc/nc-sync.md`.
  **Achtung (Review-Finding):** `nc-sync.md` ist keine tote Repo-Datei, sondern
  **ausgelieferte** Plugin-Doku mit eigener Matrix-Zeile („Abteilungs-/Plugin-CLAUDE
  geändert", Aktualisierungs-Index) und Nennungen in AGENTS/README/Ebenen-Definition — der
  Umzug zur Payload wird als genau diese Änderungsart geführt (Bump + Nachzüge).
  **Test-Override zwingend zweigleisig** nach Onsite-Vorbild: `NC_AUTOSYNC_TARGET` (Ebene 1)
  **und neu `NC_AUTOSYNC_TEAMSYNC_TARGET`** (Ebene 1b) — ohne den zweiten Override wäre die
  rote Linie „Tests fassen `~/.claude/nc-teamsync.md` nie an" nicht einhaltbar.
  **CRLF-Härtung (Windows-Falle, dokumentiert im Rollout-Korpus):** der Hook vergleicht
  Inhalte als String — Zeilenenden werden vor dem Vergleich normalisiert (oder
  Hash-über-normalisiertem-Inhalt), sonst Dauer-Mismatch auf Windows-Maschinen; Doku-Hinweis
  `git config --global core.autocrlf input` wandert in ONBOARDING. Beide Ziele unabhängig,
  Backup vor jedem Write; NC-Härtungen §2a.4 gelten für beide Ziele. Payload-Review nach
  0.19.0-Muster (Firmenblock = normative Quelle der roten Linien).

**Phase C — CLAUDE-Netz + Prozesskorpus (Doku-Spur, parallelisierbar zu B):**

- **AP-C1 `standardprozesse/claude-netz-bau.md`** (Karte 05 gemappt: Ebenen-Prinzip
  0/1/1b/2/3/3b, Kanal-Regel, `@`-Import-Mechanik, Bau-Ablauf, Replikation) + Abgleich/
  Nachzug `grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md` + Vorlage
  **`abteilungs-claude.md.vorlage`** (Ebene 2 als Pflichtbestandteil jedes künftigen
  Abteilungsplugins).
- **AP-C2 `standardprozesse/anker-reservierung.md`** + Mechanik: `reserve/*`-Tags (Ablauf
  fetch→ls-remote→taggen→pushen; Kollision = Normalfall), Aufräum-Pflicht, `struktur.test`-
  Invarianten (Duplikat-Erkennung), Freigabe-Ausnahme für `reserve/*`-Pushes nur nach E4.
  Dazu das Warum-Dokument `grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md` —
  Onsite führt Herleitung und Prozess bewusst als **zwei** Dateien (§2-Zeile
  `project-meta-infos/` → `grundwissen/`). Onsites zweite Anker-Invariante („jüngster
  Nachtrag ist in der Spec-Fußzeile verzeichnet") entfällt **bewusst**: NovaCore führt keine
  Einzel-Spec mit Fußzeilen-Kette (§2, Zeile Onsite-Spec-§) — bewusster Ausschluss statt
  stiller Lücke.
- **AP-C3 `standardprozesse/subagenten-bau.md`** + `plugins/nc/referenz/agent-authoring.md`
  (13-Feld-Kanon, Schreibsperren-Regel nach I4-Wortlaut, gesperrte Felder) — Prozess **vor**
  Mechanik (AP-D1). Inklusive Mitwander-Regel: bekommt ein Satellit ein
  `agents/`-Verzeichnis, wandert der portable Prüfbaustein (AP-D1) im selben Zug mit.
- **AP-C4 `standardprozesse/abteilungs-inhalts-pruefung.md`** (Karte 10: zwei unabhängige
  Durchläufe Soll/Ist, Synthese in Bauplan, read-only, Persistenz-Pflicht der Rohdaten).
- **AP-C5 Aktualisierungs-Index-Nachzug:** Zeile „Agent neu/geändert", §-Abschnitt „Parallele
  Stränge und Anker", vierte Bump-Stelle (`x.y.z.n` für reinen Versionsnummern-Nachzug),
  Doku der Tag-Test-Invariante; Familienkarte-Frage und `team-distribution.md` nach E5.
  Zusätzlich (Review-Findings): **Korrektur** der bestehenden Aussage
  „`nc-doks-autosync.test.mjs` läuft ausschließlich gegen `NC_AUTOSYNC_TARGET`" (mit AP-B2
  falsch — beide Overrides nennen); **neue Matrix-Zeile** „CLAUDE-Netz-Ebene/Payload neu
  oder geändert" (Onsite-0.17.0-Muster, fällig mit AP-B2) und **neue Matrix-Zeile**
  „Pflege-Ausprägung/Queue-Format geändert" (fällig mit AP-E1).

**Phase D — Subagenten-Mechanik (braucht C3):**

- **AP-D1 `plugins/nc/agents/`** als Komponentenklasse: erster Agent
  `sync-nachzug-executor.md` (deckt exakt die Executor-Rolle, die
  `sync-nachzug-bauzyklus.md` §2 heute prosaisch beschreibt; `tools: Read,Write,Edit,Grep,
  Glob`, kein Bash, `maxTurns`; Nachzugsziele auf NovaCore gemappt: README, AGENTS,
  Registry, Indizes — **kein** Betriebshandbuch, §2), Vorlage
  **`vorlagen/abteilungsplugin/agents/beispiel-agent.md.vorlage`** (nie unter `plugins/nc/`
  — der Bestandstest „Keine offenen Vorlagen-Platzhalter in ausgelieferten Plugins" würde
  sonst rot), Registry-Feld `agents`, portable Tests (`agenten.test.mjs` +
  `agenten-os.test.mjs` — Non-Empty-Guard gegen stilles Grün; der Baustein trägt eine
  **Baustein-Version im Kopf**, damit Satelliten-Kopien mit niedrigerer Nummer als Drift
  erkennbar sind, und eine Invariante prüft die Existenz dieser Versionszeile),
  FFG-/Start-Gate-Semantik für Subagenten dokumentiert (I4).

**Phase E — Queue-Flow (nur nach E1; braucht A2, B-Hook-Muster, C2):**

- **AP-E1 Referenz + Format:** `referenz/pflege-auspraegung.md` (Schema v1
  `pflege-auspraegung.json`, Queue-Format v1 append-only mit genau einer Statustransition,
  Kriterien a–d + Gegenkriterien GF1–GF4, No-Duplicate-Regel), Erweiterung
  `ssot-grundgeruest.md.vorlage` um den Queue-Baustein, Standardprozesse
  `standardprozesse/queue-flow.md` **und** `standardprozesse/kriterien-pflege.md` samt
  Definitionsdokument `grundwissen/NovaCore-OS-Kriterienliste-Definition.md` (Onsite-Quellen:
  Ruleset-Ordner, §1d). **Schema-Grenze aus `kriterien-pflege.md` übernehmen:**
  `schemaVersion` zählt nur bei Feld-Änderungen — wer sie bei reiner Kriterien-Textpflege
  hochzählt, zwingt jeden Satelliten zu einem unnötigen Release (dokumentierter
  Onsite-Irrtum).
- **AP-E2 Skills `/nc:queue-abteilung` + `/nc:queue-kern`:** Wochen-PR-Mechanik
  (Remote-Identität, Standardbranch-Divergenz-Abbruch aus 0.16.1, Pfad-Reinheit), Station 2
  liest **nur gemergten** Stand (`git show origin/<branch>:<queuePfad>`), Prüfprotokolle,
  manipulationssichere Ledger-Logik (beförderte Einträge nie re-evaluiert), Dry-Run.
  Merge bleibt in beiden Stationen strikt menschlich (rote Linie).
- **AP-E3 `nc-queue-faelligkeit.js`** (3. SessionStart-Hook, Lauf-Marker
  `~/.claude/nc/queue-lauf.json` — bewusst reboot-fest außerhalb tmp), Tests nach
  Onsite-Muster, `/nc:save-session`-Klassifikation scharf schalten (AP-A3-Haken).

**Phase F — Skills außerhalb des Kerns (L2, ganz am Ende):**

- **AP-F1 Inhalts-Prüfung `nc-development`** nach dem in AP-C4 gebauten Prozess (Soll-Register
  aus den gemappten Normquellen · Ist-Inventur · Synthese-Bauplan). Bekannte Lücke vorab:
  WP7 (QS & Abnahme) ist bei uns „noch ohne eigenen Skill", Onsite-dev trägt 17 Skills in
  6 Modulen (inkl. `qs-*`, `rel-*`) gegenüber unseren 11 in 4.
- **AP-F2 Modernisierung `nc-development`** auf Basis des AP-F1-Befunds: fehlende Module
  generisch gemappt (QS-/Release-Zyklus ohne Onsite-Firmenspezifika wie GitLab-`exec-*`,
  PAR-Tickets, PartSens); `disable-model-invocation: true` als Muster für gefährliche
  Ops-Skills übernehmen; Abteilungs-CLAUDE (Ebene 2, aus AP-C1) ausliefern.
- **AP-F3 (optional, eigener Auftrag):** Satelliten-Extraktion `nc-development` — bleibt
  Ideen-Backlog, wird hier nicht gebaut, aber AP-F2 baut nichts, was ihr widerspricht.

## 5. Delegationsschnitt (Bau mit Agenten — Plan-Sandwich je Paket)

- **Jedes delegierte Paket bekommt einen Plan-Sandwich-Vertrag:** nummerierte Invarianten,
  nummerierte Testfälle, No-Diff-Zonen, Quellpfade (I6) — kein Paket ohne Vertrag.
- **Konfliktzonen-Regel gilt verschärft** (aus `sync-nachzug-bauzyklus.md`): kein Paketagent
  fasst `CHANGELOG.md`, `AGENTS.md`, `README.md`, `SSOT-Document-Index.md`,
  `module-registry.json` oder Versionsdateien an — diese gehören dem Executor-Lauf am
  Zyklusende (ab Phase D: dem Subagenten `sync-nachzug-executor`). Einzige Ausnahme: die
  testerzwungene Index-Zeile einer neuen Wissensdatei.
- **Besetzung:** Doku-/Karten-Ports mit klarer Vorlage (C1, C3, C4, E1) → Sonnet-Agenten;
  Hooks/Gates/Reconciler (A1, B1, B2, E2, E3, D1) → Opus/Fable, weil Kontroll-Schicht;
  Review immer heterogen (Implementierer ≠ Reviewer; externes Review nach Hausbrauch).
- **Ein Zyklus = ein Branch/Worktree = ein Executor-Lauf**; Phasen A/B/C sind je ein eigener
  Bauzyklus mit eigenem Kern-Bump; D, E, F je ein weiterer.

## 6. Nummerierte Testfälle (write-first, Kernfälle je Phase)

**Gegenprobe-Pflicht für jede neue Invariante** (aus `debug-log.md` 2026-08-12, verbindliches
Abnahmekriterium): Jede neue Invariante wird **mit** ihrer Gegenprobe geliefert — Datenlage
gezielt verletzen, roten Lauf zitieren, zurücksetzen. Prüft ein Test einen Textabschnitt,
wird der Abschnitt abgegrenzt und seine **Existenz** mitgeprüft (Non-Empty-Guard) — sonst
prüft der Test weniger, als sein Name zusagt.

1. **T1 (A1):** Frische Maschine (leeres `HOME`-Fixture) → `/nc:setup`-Skript legt Klon,
   `infra.json` **und** alle SSOT-Pflichtbausteine an; zweiter Lauf ist idempotent (`ok`,
   keine Änderung).
2. **T2 (A1):** `infra.json` mit Relativ-/`~`-Pfad → Skript lehnt ab bzw. schreibt absolut.
3. **T3 (A1):** lokal veränderte Wissensbasis-Kopie → dreiwertiges Lagebild „lokal
   erweitert", nie „defekt", nie Überschreiben.
4. **T4 (A2):** Wissensdatei ohne Index-Zeile in `sitzungswissen/`-Kategorie → Struktur-Test
   rot (Bestandsinvariante greift auf neue Kategorie).
5. **T5 (A3):** Abschlusslauf schreibt Journal + Stand + Roll-up + Register in einem Lauf;
   Register-Eintrag ohne Strang-Schließung bleibt erhalten (append-only).
6. **T6 (A4):** Defekte Marker in Ebene-1-Ziel → F1 repariert mit Backup; intakte Datei →
   F1 rührt sie nicht an (byte-identisch).
7. **T7 (B1):** Erste Kompaktierung ohne Abschluss-Stempel → `decision:"block"`; zweite
   Kompaktierung derselben Session → läuft durch (Loop-Schutz).
8. **T8 (B1):** Heartbeat: aktive Session > 30 Min → keine erneute Mahnung; inaktive → Mahnung.
9. **T9 (B1):** Defekter Mahn-Marker → gilt als „schon gemahnt" (keine Dauerblockade);
   defekter Abschluss-Stempel → gilt als „nicht gestempelt".
10. **T10 (B2):** Teamsync-Ziel fehlt/veraltet → Ganzdatei-Ersatz mit Versions-Stempel;
    Ebene-1-Ziel defekt → Ebene 1b synct trotzdem (Unabhängigkeit); Backup existiert vor
    jedem Write; echte `~/.claude`-Pfade werden in Tests nie berührt (Overrides
    `NC_AUTOSYNC_TARGET` **und** `NC_AUTOSYNC_TEAMSYNC_TARGET`); **CRLF-Fixture:** ein Ziel
    mit CRLF-Zeilenenden bei inhaltsgleichem Payload → kein Dauer-Mismatch, kein
    Rewrite-Loop (Normalisierung greift).
11. **T11 (B2):** Privat-Zone außerhalb der Marker bleibt byte-identisch (Bestandstest
    erweitert auf Zwei-Ziel-Lauf).
12. **T12 (C2):** `reserve/*`-Tag-Kollision im Fixture-Repo → zweiter Reservierungsversuch
    schlägt sichtbar fehl (`already exists` = Normalfall, kein Crash).
13. **T13 (C2/C5):** doppelt vergebene Spec-/Versions-Nummer im Fixture → Struktur-Test rot.
14. **T14 (D1):** Agent-Frontmatter mit `hooks`/`mcpServers`/`permissionMode`, read-only
    ohne **vollständige** `disallowedTools`-Sperre (alle vier Schreib-Werkzeuge + `Bash`),
    `description` nicht als `>-`-Block-Scalar (YAML-Falle — bei Agenten greift sonst die
    Auto-Delegation still nie) oder globales `mcp__*` in `tools` → Agenten-Test rot;
    leeres `agents/`-Verzeichnis → Non-Empty-Guard verhindert stilles Grün.
15. **T15 (D1):** `sync-nachzug-executor` ohne `Bash` in `tools`; Praxistest mit Negativprobe
    (Auftrag außerhalb der Allowlist scheitert).
16. **T16 (E2):** `queue-kern` liest ausschließlich `origin/<branch>`-Stand (lokal
    abweichende `queue.md` wird ignoriert); beförderte Zeile wird im Folgelauf nie
    re-evaluiert (Ledger).
17. **T17 (E2):** Standardbranch-Divergenz → `queue-abteilung` bricht ab (0.16.1-Lehre).
18. **T18 (E3):** Fälligkeits-Hook: kein Queue-Inhalt → kein Hinweis; Inhalt + letzter Lauf
    > 7 Tage → Hinweis; Git-Fehler → fail-open, max. 5 Aufrufe.
19. **T19 (alle Hooks):** kein `process.exit(`-**Aufruf** in `plugins/nc/hooks/` — geprüft
    auf kommentar-bereinigtem Quelltext, denn die vier Bestandsdateien tragen die Regel
    als Warnkommentar und ein naiver Grep wäre gegen den heutigen, korrekten Code rot
    (Onsite sichert dieselbe Eigenschaft verhaltensbasiert je Hook-Test — beides zulässig);
    jede Blockade über dokumentierte JSON-Felder.
20. **T20 (Abschluss je Phase):** `claude plugin validate` beider Ebenen + volle Suite +
    Verweis-Sweep nach Alt-Begriffen des Zyklus (Protokollpflicht aus
    `sync-nachzug-bauzyklus.md`) + Gegenprobe-Nachweis je neuer Invariante (§6-Kopf).
21. **T21 (A1):** Reconciler unter aktivem Start-Gate: ungestempelte Session → `/nc:setup`
    bricht mit klarer Anweisung ab, statt in die Gate-Ablehnung zu laufen (Gate wird gegen
    die eigene vorgeschriebene Nutzung getestet — `debug-log.md` 2026-08-14).

## 7. Rote Linien

Kein Commit, Push, PR, Merge, Tag/Release ohne ausdrückliche Maintainer-Freigabe — in keinem
Repo, auch nicht durch delegierte Agenten (einzige mögliche Ausnahme künftig: E4).
`~/.claude/CLAUDE.md` und `~/.claude/nc-teamsync.md` der Entwickler werden von Tests nie
beschrieben (Overrides: `NC_AUTOSYNC_TARGET` für Ebene 1, `NC_AUTOSYNC_TEAMSYNC_TARGET`
für Ebene 1b). Queue-Merges (beide Stationen) bleiben menschlich. Keine Secrets in Dateien,
Logs oder Commits. Behauptung nur mit gesehener Ausgabe. Der Lese-Worktree
`onsite-queue-flow` wird nach Bauende wieder entfernt (`git worktree remove`).

## 8. Maintainer-Entscheidungen (offen — blockieren die genannten Phasen)

- **E1 — ENTSCHIEDEN (Weisung Maintainer 2026-08-15): Option (a), verschärft.** Die Firma
  kennt **zwei Kategorien**: **interne Abteilungen** (heute `nc-development`) und **externe
  Affiliate-/Kollegen-OS-Satelliten** (Felix, Biggi) mit eigener **zweidimensionaler SSOT**
  (privat + abteilungsintern), gepflegt über normale Commits im eigenen Repo. Queue-Flow
  wird ausschließlich zwischen Kern und internen Abteilungen gebaut; die Satelliten werden
  **KEINESFALLS** an Queue oder Kern-SSOT angeschlossen — ihre SSOT wird gepflegt, steigt
  aber nie ins Kern-Plugin auf (I8 verschärft; Satelliten folgen den bestehenden Regeln
  §3b/`ssot-aufbau.md` §4a). **Zusatzauftrag:** Der Satelliten-Start-Skill liest die eigene
  SSOT — der Zugriff auf die Kern-SSOT ist administrativ unterbunden (GitHub-Rechte), und
  der Skill braucht dafür eine saubere Erkennungs-/Meldelösung („für Satelliten by design
  nicht erreichbar"), damit ein Agent das nie als blockierten/defekten Skill deutet
  (Regel + Vorlagen-Baustein in Phase 2/3). **Der Umbau konzentriert sich auf Kern +
  `nc-development`.**
- **E2 — Sitzungswissen im öffentlichen Repo (blockiert AP-A2-Ausprägung).** Optionen:
  **(a) — Empfehlung:** Residenzpflicht übernehmen, aber Wohnort-Regel an Sichtbarkeit
  knüpfen: privates Repo → `sitzungswissen/` in der Wissensbasis (wie Onsite); öffentliches
  Repo → `.nc/erinnerung/` bleibt Wohnort (Fallback-Regel wird Hauptregel), Register/Roll-up
  leben dort. **(b)** Repo auf privat stellen und wörtlich übernehmen. **(c)** Sichtbarkeit
  ignorieren — verletzt I9, nicht empfohlen.
- **E3 — WIRD GEBAUT (Umsetzungsauftrag 2026-08-15 ohne Gegenrede zur Empfehlung):**
  Rename `/nc:save-session` → `/nc:end-session` im selben Zyklus wie AP-A3, mit
  Rename-Sweep + Team-Hinweis im Release-Text. Gleiches gilt für **E2**, Ausprägung (a):
  Repo ist öffentlich → `.nc/erinnerung/` bleibt Wohnort des Sitzungswissens
  (Register/Roll-up leben dort); die Onsite-Residenzpflicht greift erst in privaten Repos.
- **E4 — `reserve/*`-Push-Ausnahme** von der „kein Push ohne Freigabe"-Linie (Onsite hat sie
  ausdrücklich, inkl. Branch-Protection-Ausnahme). Ohne E4 bleibt Anker-Reservierung
  freigabepflichtig je Push — funktioniert, ist aber langsamer.
- **E5 — Firmenspezifische Bausteine:** `firmenwissen-suche` (Atlassian-Connector),
  `team-distribution.md` (Claude-Team-Workspace, GitLab-MCP), Familienkarte als Gattung.
  Empfehlung: `team-distribution` generisch auf GitHub/dieses Setup mappen (schließt
  Karten-Lücke 06), `firmenwissen-suche` zurückstellen bis ein Firmen-Wissenssystem
  beauftragt ist, Familienkarte als kurzes Kapitel in `os-bau-methode.md` statt eigener Datei.
- **E6 — Versionsfahrplan.** Empfehlung: je Phase ein Minor (A→0.8.0, B→0.9.0, C→0.10.0,
  D→0.11.0, E→0.12.0, F bumpt `nc-development`), Anker ab AP-C2 für alle Folge-Bumps.
  Die Vorab-Zuweisung dieser Nummern gilt als **Ersatz-Anker für das Fenster vor AP-C2**
  (Onsite-Lehre 0.21.0: zwei parallele Zyklen belegten dieselbe Spec-Nummer/Version, die
  Kollision fiel erst beim Merge auf) — B und C dürfen nur parallel laufen, wenn ihre
  Zielversionen vorab festgeschrieben sind.

## 9. Plan-Nachträge aus der Umsetzung

### N1 — Weisung 2026-08-15: Drei Großphasen, Besetzung, Review-Kette

Die sechs Bauspuren aus §4 werden zu **drei Großphasen** gebündelt (Weisung Maintainer):

| Großphase | Enthält (§4) | Kern-Bump am Phasenende |
|---|---|---|
| **Phase 1 — SSOT-Kern & Kontroll-Schicht** | A (AP-A1–A4) + B (AP-B1–B2) | 0.8.0 |
| **Phase 2 — Prozesskorpus, CLAUDE-Netz & Subagenten** | C (AP-C1–C5) + D (AP-D1) | 0.9.0 |
| **Phase 3 — Queue-Flow & Development-Plugin** | E (AP-E1–E3) + F (AP-F1–F2) | 0.10.0 (+ `nc-development`-Bump) |

**Besetzung (Weisung):** Fable führt und baut selbst alles Architekturkritische (Hooks,
Gates, Reconciler) und schreibt je delegiertem Paket den Plan-Sandwich-Vertrag; **Opus**
übernimmt mittlere Implementierungspakete; **Sonnet** Recherche und Bulk. **Versions- und
Doku-Nachzüge grundsätzlich nur am Phasenende** (Konfliktzonen-Regel, §5). Im Zweifel
entscheiden `standardprozesse/` und `firmenkernprozesse/` — dort ist nahezu jeder Prozess
beschrieben. **Review-Kette je Phase:** Selbstreview → externes Review über das
Kimi-Code-Plugin (K3 und GLM-5.3; zusätzlich ChatGPT-Plugin, sofern in der Session
verfügbar) → alle nicht-kosmetischen Findings iterieren → PR des Feature-Branches
(Push + PR ausdrücklich autorisiert, Merge bleibt beim Maintainer).

E6 gilt damit sinngemäß ENTSCHIEDEN (ein Bump je Großphase, am Ende); E4 ist **vertagt**
(in Phase 1/2 nicht benötigt); E5 ist **vertagt auf Phase 2**.

### N2 — Ebene-1b-Payload bleibt `plugins/nc/nc-sync.md` (Umsetzung AP-B2, 2026-08-15)

AP-B2 sah als Payload `doks/nc-teamsync.md` mit „Umzug" von `nc-sync.md` vor. Beim Bau
zeigte der Verweis-Sweep: `nc-sync.md` wird von **über zehn ausgelieferten Dateien**
referenziert (Skills des Kerns und der Abteilung, `workflow.md`, `skill-authoring.md`,
Standardprozesse, AGENTS/README) — ein Umzug bräche sie alle, eine Kopie nach `doks/`
wäre verbotene Doppelpflege. Entscheid der Umsetzung: Der Autosync liest
`plugins/nc/nc-sync.md` **direkt** als Ebene-1b-Payload (`TEAMSYNC_PAYLOAD`); die Datei
bleibt die eine Quelle an ihrem eingeführten Ort. Abweichung vom Onsite-Layout
(`doks/oai-teamsync.md`) ist im Hook-Kopf dokumentiert. Ziel-Dateiname beim Nutzer bleibt
`~/.claude/nc-teamsync.md` (wie Vorbild).

### N3 — Reconciler-Schichten S3/S4 bleiben skill-geführt (Umsetzung AP-A1, 2026-08-15)

Wie im Vorbild (`/oai:init` hat kein Registry-Skript) schreiben S3 (Infra-Registry) und
S4 (Sitzungswissen-Gerüst) skill-geführt nach den harten Feldregeln der Referenzdatei
`setup/infra-registry.md`; einziges Skript bleibt `ssot-provision.js` (S2, unverändert
inkl. Sparse-Heilung). Testfälle T1/T2 werden entsprechend gelesen: T1 (Idempotenz) gilt
für das S2-Skript (bestandsgetestet in `nc-ssot-provision.test.mjs`) plus die
Skip-Semantik des Skill-Ablaufs; T2 (absolute Pfade) ist Regelwerk der Referenz + Prüfung
in S3 („jeden Pfad gegen S2 re-checken"), nicht Skript-Unit-Test. Die Onsite-Zustände
„lokal erweitert" gehören zu Arbeitsklonen und existieren in NC nicht — die Lesekopie
meldet `lokal-veraendert` als Warnung (E1-Kontext: kein Arbeitsklon-Konzept vor Phase E).

---

*Angelegt 2026-08-15 durch Claude (Fable 5, Claude Code) auf Weisung Lucas Vöhringer.
Quellen: Onsite.ai-OS `origin/feat/queue-flow@c55085f` (0.22.0) und `origin/main@efd90c1`
(0.21.0), importierter Korpus `knowledge-base/firmenkernprozesse/` (23 Dokumente, PR #18),
NovaCore `main@8885495`; Exploration durch vier Sonnet-Agenten, Befunde eigenverifiziert
(Testsuite 97/97, `/nc:setup`-Probelauf, `~/.nc/`-Erstbefund).*
