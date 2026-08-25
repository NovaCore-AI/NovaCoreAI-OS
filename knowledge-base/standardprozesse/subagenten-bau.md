# Subagenten-Bau — Standardprozess

> **Verbindlich**, sobald eine Datei unter `agents/` eines OS-Plugins angelegt oder geändert
> wird — im Kern `nc` wie in einem Abteilungsplugin oder einem eigenständigen Kollegen-OS.
> Diese Datei regelt die **Prozess-Ebene**: Einordnung Agent/Skill, Scope, Bauablauf, rote
> Linien, Trigger, Gate-Semantik, Testschutz.
>
> **Das Dateiformat regelt sie ausdrücklich nicht.** Frontmatter-Feldkanon, YAML-Falle,
> Werkzeuggrenzen-Regel nach dem Allowlist-Prinzip (seit 2026-08-15, Vorbild-PR #60),
> Defense-Baseline und Prompt-Gliederung stehen in `agent-authoring.md` des Kern-Plugins
> (`plugins/nc/referenz/agent-authoring.md`) — sie wird mit dem Plugin ausgeliefert und ist
> damit auch beim Nutzer zur Laufzeit da. Diese Prozessdatei liegt in der Wissensbasis des
> OS-Repos und ist nach Installation **nicht** erreichbar. Bei Widerspruch in Formatfragen
> gewinnt `agent-authoring.md`.
>
> **Schwestern:** [`kern-plugin-bau.md`](kern-plugin-bau.md) und
> [`abteilungs-plugin-bau.md`](abteilungs-plugin-bau.md) (Agenten sitzen immer in einem der
> beiden Plugin-Typen) · [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md) (der erste
> geplante Agent deckt genau dessen Executor-Rolle) ·
> [`aktualisierungs-index.md`](aktualisierungs-index.md) (Änderungsumfang je Änderungsart).
>
> **Status: lebend.** Der Prozess steht bewusst **vor** der Mechanik (Bauplan-Reihenfolge
> AP-C3 → AP-D1): Die Komponentenklasse selbst — `agents/`-Verzeichnis, erster Agent,
> portabler Prüfbaustein plus OS-gebundene Testdatei, Registry-Feld `agents` — entsteht erst
> im Folgepaket **AP-D1**. Stellen, die sie beschreiben, sind als **(AP-D1)** gekennzeichnet:
> Sie sind **Bauvorschrift** für dieses Paket und werden mit dessen Abschluss zum Ist-Stand.

---

## 1. Zweck und Geltung

Wenn ein Subagent neu entsteht oder geändert wird: erst **Agent-vs-Skill** und **Scope**
klären, dann Overlap gegen bestehende Agents **und** Skills prüfen, nach `agent-authoring.md`
bauen, praxistesten (inklusive Negativprobe), Doku nachziehen, Suite fahren — und den
portablen Prüfbaustein mitwandern lassen.

**Greift nicht** bei reiner Skill-Arbeit, bei Plugin-Struktur ohne Agenten und bei reinen
Formatfragen (→ `agent-authoring.md`). **Greift**, sobald eine Datei unter `agents/` angelegt
oder geändert wird — Kern, Abteilung oder Satellit.

---

## 2. Agent oder Skill

**Faustregel:** Flutet die Arbeit den Haupt-Kontext oder braucht sie Isolation → **Agent**;
geführter Ablauf in der Haupt-Session → **Skill**. **Im Zweifel Skill.**

| Richtung | Wann | NovaCore-Beispiele |
|---|---|---|
| **Skill** | Die Session geht jeden Schritt mit · Zwischen-Entscheide · kleine fokussierte Checks · Rückfragen an den Menschen sind Teil des Ablaufs | `/nc:start`, `/nc:end-session`, `/nc:update-doks`, `/nc:skill-builder` |
| **Agent** | Der Haupt-Kontext würde fluten oder ein eigener Kontext ist nötig · bulkige Lese-/Schreibarbeit · klar umrissener Auftrag mit Zusammenfassungs-Rückgabe · unabhängige Zweitdiagnose | `sync-nachzug-executor` — gebündelte Doku-Nachzüge am Zyklusende (AP-D1) |

Ein Agent kostet einen Delegations-Schritt und liefert nur eine **Zusammenfassung** zurück,
keinen Vollabzug seines Kontexts. Deshalb grenzt seine `description` pflichtgemäß zum
nächstliegenden Skill ab (Format-Regel in `agent-authoring.md`) — sonst wählt die
Auto-Delegation die falsche Komponente.

**Warum „im Zweifel Skill":** Ein Skill ist billiger (kein Delegations-Schritt), sichtbarer
(der Mensch sieht jeden Schritt) und rückfragefähig. Ein Agent, der eigentlich ein Skill sein
sollte, versteckt Entscheidungen in einem fremden Kontext.

---

## 3. Scope: Kern oder Abteilung

| Regel | Inhalt |
|---|---|
| **Domänen-frei → Kern** | Aufgaben, die jede Abteilung gleichermaßen hat (Doku-Nachzüge, Repo-Pflege). Ablage `plugins/nc/agents/`, Namespace `nc:<agent>` |
| **Domäne → Abteilung** | Fachwissen, Fremdsysteme, Workflows genau einer Abteilung. Ablage `plugins/nc-<abteilung>/agents/` bzw. `agents/` im Satelliten-Repo, Namespace `nc-<abteilung>:<agent>` (z. B. `nc-development:…`, `nc-felix:…`, `nc-biggi:…`) |
| **Prüfungs-Eigentum** | Kein Abteilungs-Agent dupliziert oder schwächt eine Kern-Prüfung ab. Existiert die Aufgabe im Kern → **Kern-Agent nutzen, nicht kopieren.** Abteilungen dürfen eigene Domänen-Prüfungen **daneben** stellen, nie darüber (`kern-plugin-bau.md` §1a) |
| **Flaches Layout** | **Keine Unterordner** unter `agents/`. Die Plattform macht einen Unterordner zum Teil des Scoped Identifier (`plugin:ordner:name`); bei einstelligen Agentenzahlen bringt das keinen Mehrwert, verlängert jeden Aufruf und erschwert die Tests |
| **Verbotene Frontmatter-Felder** | `hooks`, `mcpServers`, `permissionMode` werden bei **Plugin**-Agenten **lautlos ignoriert** — kein Fehler, keine Warnung, die vermeintliche Absicherung existiert zur Laufzeit nicht. Deshalb im OS verboten. Wer sie braucht, legt den Agenten in `.claude/agents/` des **Arbeits-Repos** an, nie ins Plugin |
| **`isolation` gesperrt** | `isolation: worktree` bleibt gesperrt, **bis die Team-Mindestversion ≥ 2.1.210** ist. NovaCore fordert heute **≥ 2.1.193** (`kern-plugin-bau.md` §3 — einzige Stelle für Schwellen); die Isolationszusage hält darunter nicht. Bis dahin steht **kein** `isolation`-Feld in einer OS-Agent-Datei. Begründung und Doku-Beleg: `agent-authoring.md` |

**Versionsgrenze — bewusste Abweichung von der Prozesskarte:** Karte 07
(`firmenkernprozesse/prozesskarten/07-subagenten-bau.md`) nennt an drei Stellen „≥ 2.1.203".
Das ist der **überholte** Stand: Die Formatreferenz des Vorbilds hat die Grenze am 2026-08-14
gegen die Doku auf **2.1.210** korrigiert („strikte `isolation`-Prüfung für Clients ≥ 2.1.210",
so auch der Onsite-Feature-Bericht vom 2026-08-14). Es gilt **2.1.210**; die Karte ist an
dieser Stelle nicht nachgezogen (Karten sind ohnehin nicht normativ).

---

## 4. Ablauf: einen Agenten bauen (7 Schritte)

1. **Einordnen.** Kern oder Abteilung (§3), **read-only oder schreibend**, `model`-Routing
   (`sonnet` für Bulk-Executor, `inherit` für urteilskritische Agenten). Diese Entscheidungen
   steuern die `tools`-Allowlist (Allowlist-Prinzip, seit 2026-08-15) und werden bei
   schreibenden Agenten über den Marker `<!-- nc:schreibend -->` belegt (§6, Format in
   `agent-authoring.md`).
2. **Overlap-Prüfung gegen bestehende Agents UND Skills** — eigenes Plugin **und** Kern, vor
   dem ersten Schreiben (§5).
3. **Formatregeln laden.** `agent-authoring.md` **lesen**, nicht aus dem Gedächtnis bauen.
   Zur Laufzeit liegt sie im installierten Kern-Plugin unter `referenz/`; im OS-Repo unter
   `plugins/nc/referenz/`. Installierte Plugins sehen **keine** Repo-Pfade.
4. **Agent-Datei schreiben** nach `agent-authoring.md`: Pflichtfelder `name` (== Dateiname,
   kebab-case, kein `:`), `description` (`>-`-Block-Scalar, dritte Person, Einsatz-Situation
   **und** benannte Abgrenzung zum nächstliegenden Skill), `model` (bewusstes Routing) und
   `tools` (Allowlist als einzige Laufzeitgrenze — Werkzeuggrenzen-Regel §6),
   Prompt-Gliederung Rolle/Zweck → Defense-Baseline → Vorgehen → Regeln (rote Linien zuerst)
   → Rückgabe-Format. **Keine Formatdetails hier erfinden.**
5. **Praxistest mit NEGATIVPROBE.** Expliziter Aufruf per `@`-Mention in einer echten Session
   **plus** Gegenprobe auf die roten Linien: Ein read-only-Agent **muss** am Schreibversuch
   scheitern; ein schreibender Agent **muss** an seiner deklarierten Grenze scheitern. Ohne
   belegte Negativprobe gilt der Agent als ungetestet — ein Positivlauf allein zeigt nur, dass
   er läuft, nicht dass die Sperre greift. Vorbedingung: Plugin **installiert und aktiviert**.
   Beleg im Ergebnis dokumentieren.
6. **Doku-Nachzüge** gemäß Änderungs-Matrix des `aktualisierungs-index.md` — maßgeblich ist
   die Zeile **„Agent (Subagent) neu/geändert"** in §2.1 (existiert seit Phase 2/AP-C5,
   Bauplan 2026-08-15): Agent-Datei · Registry-`agents`-Segment · README · `AGENTS.md` ·
   Overlap-Prüfung · `CHANGELOG.md` · Bump des tragenden Plugins. Steht für einen Sonderfall keine
   passende Zeile bereit, ist das selbst ein Befund: Die Matrix ist selbst-normativ und wird
   ergänzt (`sync-nachzug-bauzyklus.md`, Schritt 1).
7. **Abschluss nach Standardzyklus.** Suite `node --test plugins/nc/tests/*.test.mjs` grün,
   `claude plugin validate plugins/<plugin> --strict` fehlerfrei (**nicht** nur
   `claude plugin validate .` — an der Repo-Wurzel prüft der Befehl allein das
   Marketplace-Manifest), Protokoll-Pflichten, Abschluss-Checkliste der `AGENTS.md`.
   **Kein Commit ohne Maintainer-Freigabe.**

**Reihenfolge ist Teil der Regel:** Schritt 2 vor 4 verhindert divergente Runbooks; Schritt 3
vor 4 verhindert erfundene Formatregeln; Schritt 5 vor 6 verhindert, dass ein Nachzug einen
ungeprüften Agenten als „fertig" beschreibt.

---

## 5. Overlap-Prüfung (Agents **und** Skills)

Gelesen wird in dieser Reihenfolge: Agents des eigenen Plugins → Skills des eigenen Plugins →
Agents des Kerns → Skills des Kerns. Erst danach entsteht die Datei.

**Belegte Lektion (Onsite-B3):** Bei der ersten Agenten-Garnitur des Vorbilds wurde ein
bestehendes Skill-Modul samt Referenzdateien übersehen und ein drittes, divergentes Runbook
vorgeschlagen — gefangen erst im externen Review. Overlap gilt deshalb **nicht nur gegen
Agents**.

**Wissen lebt einmalig in den Skills.** Der Agent **referenziert** es (`skills:`-Preload oder
explizite Leseanweisung im Prompt), er kopiert es nicht. Zweitkopien driften — und die
Drift merkt niemand, weil beide Fassungen für sich plausibel bleiben.

---

## 6. Rote Linien für Subagenten

| Linie | Inhalt |
|---|---|
| **Kein Automatisieren** | Merges, Deploys, Releases, Kundensichtbares (Posts, Ticket-Kommentare). Entwürfe ja, Ausführung nein — das macht der Mensch im Team-Prozess |
| **Schreibgrenze explizit** | Hart in der `tools`-Allowlist — das ist die **einzige** Laufzeitgrenze; `disallowedTools` nur als Zusatzsicherung für Sonderfälle — **und** zusätzlich als Regel im System-Prompt (Sekundärschicht). Nie im Vertrauen auf die Gates (§7) |
| **Fremdsysteme read-only-Default** | Produktive Fremdsysteme (Geräte, Ticketsysteme, produktive DBs): Diagnose und Eingriffs-**Entwurf** im Agenten, Ausführung im Team-Prozess |
| **Commit-Hoheit** | Bleibt beim führenden Agenten bzw. Maintainer. **Subagenten committen, pushen und taggen nie.** Die deterministische Gegenprobe (Suite, `grep`-Sweeps) bleibt Pflicht des Führenden — ein Subagenten-Review allein hat schon Fehler durchgelassen (`debugging-findings/agent-learnings.md`) |

### Werkzeuggrenzen-Regel (Allowlist-Prinzip, wörtlich hart — seit 2026-08-15)

1. **Read-only-Agent (Standardklasse):** `tools: Read, Grep, Glob` (+ konkrete, lesende
   MCP-Tools). Kein Schreib-Werkzeug und **kein `Bash`** in der Liste: Wer Bash besitzt,
   umgeht jede Werkzeug-Schreibsperre über Shell-Umleitung, `sed -i` oder `git` — und
   Subagenten sind vom Datei-Gate ausgenommen (§7). Ein `disallowedTools`-Feld ist nicht
   mehr nötig — die enge Allowlist **ist** die Sperre, die Suite prüft sie.
2. **Schreibender Agent:** Marker `<!-- nc:schreibend -->` im Body (direkt unter der
   Frontmatter) **plus** begründete `tools`-Allowlist, die genau die benötigten
   Schreib-Werkzeuge nennt — weiterhin **ohne `Bash`** (Referenzmuster:
   `sync-nachzug-executor`) — und `maxTurns` als Obergrenze.
3. **`disallowedTools` als Zusatzsicherung (Sonderfälle):** zulässig, wo die Allowlist nicht
   greift — insbesondere das globale `mcp__*` gegen ererbte MCP-Server; nie Ersatz für eine
   fehlende `tools`-Allowlist.

**Der Marker ist Autoren- und Testvertrag, keine Laufzeitgrenze.** Er macht die bewusste
Entscheidung prüfbar. Die harte Grenze steht allein in der `tools`-Allowlist. Ein Agent,
der `Bash` für **lesende** Diagnose braucht, ist **kein** read-only-Agent im Sinne dieser
Regel, sondern eine ausdrücklich zu kennzeichnende Diagnose-Ausnahme: Kommandoklassen im
Prompt benennen, Grenze in der `description` sichtbar machen.

---

## 7. Trigger-Mechanik

Ein Subagent wird **ausschließlich aus Sessions** gerufen: per Skill, per `@`-Mention oder per
`description`-getriebener **Auto-Delegation**.

- **`description` ist delegations-kritisch.** Die **YAML-Falle**: Ein Plain-Scalar mit
  Doppelpunkt-plus-Leerzeichen (`: `) oder `#` parst nicht — und die Frontmatter bricht
  **nicht sichtbar** ab, die Metadaten werden still fallengelassen. Bei Agenten heißt das:
  **Die Auto-Delegation greift nie**, der Agent wird nie automatisch gerufen, und niemand
  merkt es. Deshalb `description` **immer** als Folded-Block-Scalar `>-` (Format-Detail und
  Beleg in `agent-authoring.md`; dieselbe Parser-Lektion wie bei Skills, siehe
  `skill-authoring.md`).
- **Kein Cron, kein Scheduler je Maschine.** Trigger-Automatik über die Maschine wäre eine
  verbotene Setup-Abhängigkeit. Verteilannahme des OS: Agenten reisen **im Plugin** mit und
  funktionieren ohne per-Maschinen-Einrichtung.

---

## 8. Gate-Semantik: Subagenten und die Kontroll-Schicht

**Am realen NovaCore-Code belegt** (nicht aus dem Vorbild übernommen):

| Gate | Für Subagenten | Beleg im Kern-Plugin |
|---|---|---|
| **FFG-Datei-Gate** (Edit/Write/MultiEdit) | gilt **nicht** | `plugins/nc/hooks/nc-ffg.js`: beide Zweige beginnen mit `if (isSubagentInvocation(input)) return;` — der Parent hat die Datei bereits gegated (so auch der Dateikopf: „Subagenten uebersprungen") |
| **Start-Gate** | gilt **nicht** | `plugins/nc/hooks/nc-start-gate.js`: `isSubagentInvocation(input)` vor jeder Prüfung; Kopfkommentar „Subagenten sind ausgenommen (der Parent hat den Start-Zwang erfuellt)" |
| **FFG-Destruktiv-Gate** (Bash) | bleibt **scharf** | derselbe `nc-ffg.js`: Der Bash-Pfad ruft `isSubagentInvocation` **nicht** — kein destruktives Kommando kommt ohne Faktenvorlage durch, auch nicht im Subagenten. Ebenso gegated: das Routine-Bash-Gate |
| PreCompact-Mahnung, Doks-Autosync | greifen **nicht** | `nc-end-mahnung.js`, `nc-doks-autosync.js` — beide steigen bei Subagenten aus (der Parent führt die Sitzung bzw. hat den Sync erledigt) |

Die Erkennung liegt zentral in `plugins/nc/hooks/lib/session-key.js`: `isSubagentInvocation()`
prüft die Hook-Felder `agent_id`/`agent_type` (offizielle Hook-Doku, verifiziert 2026-07-26).
Eine zweite Kopie dieser Logik wäre Drift-Risiko — deshalb teilen sich alle Hooks die Lib.

**Konsequenz — die eigentliche Regel:** Ein schreibender Agent mit falsch gesetzter Grenze hat
**kein Datei-Gate als Fangnetz.** Schreibgrenzen stehen deshalb in der `tools`-Allowlist
(plus `disallowedTools` als Zusatzsicherung in Sonderfällen) und im System-Prompt (§6), nie
im Vertrauen auf die Kontroll-Schicht. Abteilungen dürfen eigene
Domänen-Prüfungen um ihre Agenten bauen, duplizieren oder schwächen aber keine Kern-Prüfung
(Prüfungs-Eigentum, §3). Konzeptioneller Rahmen der Gates:
[`NovaCore-OS-Gates-Definition.md`](../grundwissen/NovaCore-OS-Gates-Definition.md).

---

## 9. Testschutz: der portable Prüfbaustein wandert mit (AP-D1)

**Regel:** Bekommt ein Repo ein `agents/`-Verzeichnis, wandert der portable Prüfbaustein
`agenten.test.mjs` **im selben Zug** mit — bei einer Satelliten-Extraktion gemeinsam mit den
Agenten, nicht später.

**Begründung (belegte Beinahe-Lektion):** Die Suite scannt **plattenbasiert**, und ein
plattenbasierter Scan endet an der Repo-Grenze. Zieht ein geprüftes Artefakt in ein anderes
Repo um, verliert eine zurückgebliebene Prüfung ihren Gegenstand — **ohne rot zu werden**. Sie
findet dann schlicht nichts mehr und meldet grün. Genau so wäre bei einer Extraktion die
Frontmatter-Prüfung ganzer Skill-Sätze lautlos verschwunden.

| Baustein | Ort / Eigenschaft | Rolle |
|---|---|---|
| `agenten.test.mjs` | **portabel**, wandert mit dem `agents/`-Baum | Keine hartkodierte Verzeichnistiefe (Repo-Wurzel wird gesucht, nicht gezählt), kein Bezug auf Registry, Vorlagen oder andere OS-Repo-Artefakte, **Nicht-Leer-Guard**: Kopie in einem Repo ohne Agenten wird **rot** statt still zuzustimmen |
| `agenten-os.test.mjs` | **bleibt im OS-Repo** | Repo-gebundene Invarianten (Registry-Abgleich, Vorlagen-Platzhalter). Bewusst **keine** „überspringen, wenn Datei fehlt"-Logik in einer gemeinsamen Datei — ein still übersprungener Test meldet grün, ohne geprüft zu haben |
| **Baustein-Version** | Zeile im **Kopf** von `agenten.test.mjs`; ihre Existenz ist selbst Invariante | Jede inhaltliche Änderung zählt sie hoch. Eine Satelliten-Kopie mit niedrigerer Nummer ist damit als **Drift erkennbar**. Rückrichtung (Kopien nach einer Kern-Änderung nachziehen) gehört in die Änderungs-Matrix |

**Frage bei jedem Rückbau, jeder Extraktion, jedem Umzug:** „Welche Prüfung verliert hier
ihren Gegenstand?"

---

## 10. Artefakte

| Richtung | Was | Ort |
|---|---|---|
| gelesen | Formatregeln | `plugins/nc/referenz/agent-authoring.md` (Laufzeit: im installierten Plugin) |
| gelesen | bestehende Agents **und** Skills | eigenes Plugin **und** Kern (Overlap, §5) |
| gelesen | Änderungsumfang | `aktualisierungs-index.md` (Zeile „Agent (Subagent) neu/geändert", §2.1) |
| geschrieben | Agent-Datei | `plugins/nc/agents/<name>.md` bzw. `plugins/nc-<abteilung>/agents/<name>.md` — **flach** (AP-D1) |
| mitwandernd | portabler Test | `agenten.test.mjs` mit dem `agents/`-Baum (§9, AP-D1) |
| nachgezogen | Doku | `module-registry.json` (Agents-Segment), Repo-Karten in `AGENTS.md`/`README.md`, `CHANGELOG.md`; bei neuer Wissensdatei zusätzlich `SSOT-Document-Index.md` |
| **nie vom Subagenten** | Commit, Push, Tag | Commit-Hoheit beim Führenden/Maintainer (§6) |
| **nicht ins Plugin** | Agent mit `hooks`/`mcpServers`/`permissionMode` | stattdessen `.claude/agents/` des Arbeits-Repos |
| **gesperrt** | `isolation: worktree` | bis Team-Mindestversion ≥ 2.1.210 (§3) |
| **nie unter `plugins/`** | Agenten-**Vorlage** mit Platzhaltern | `knowledge-base/standardprozesse/vorlagen/abteilungsplugin/` — die Invariante „Keine offenen Vorlagen-Platzhalter in ausgelieferten Plugins" (`struktur.test.mjs`) würde sonst rot |

---

## 11. Kopplungen

| Kopplung | Rolle |
|---|---|
| `agent-authoring.md` (Kern-Plugin) | Dateiformat, 13-Feld-Kanon, YAML-Falle, Werkzeuggrenzen-Regel (Allowlist-Prinzip), Defense-Baseline, Prompt-Gliederung — **hier bewusst nicht wiederholt** |
| `kern-plugin-bau.md` / `abteilungs-plugin-bau.md` | Der Agent sitzt immer in einem der beiden Plugin-Typen; Governance und Prüfungs-Eigentum |
| [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md) | Der erste geplante Agent `sync-nachzug-executor` (AP-D1) deckt exakt die **Executor-Rolle** aus dessen Ablauf-Schritt 2: Protokoll plus zitierte Matrix-Zeilen entgegennehmen, Nachzüge **gebündelt** abarbeiten, nichts Inhaltliches am Bau ändern. Die dortige Regel „entscheidend ist die Trennung der Rolle, nicht die Person" bleibt gültig — der Agent macht die Trennung nur mechanisch sichtbar. Die **Konfliktzonen-Regel** des Parallelbaus gilt unverändert: Kein Paketagent fasst `CHANGELOG.md`, `AGENTS.md`, `README.md`, `SSOT-Document-Index.md`, `module-registry.json` oder eine Versionsdatei an — Ausnahme bleibt die testerzwungene Index-Zeile einer neuen Wissensdatei |
| `aktualisierungs-index.md` | Änderungsumfang; Baustein-Version nachziehen |
| Kontroll-Schicht (`nc-ffg.js`, `nc-start-gate.js`) | Subagenten-Ausnahmen im Code belegt (§8) |
| `debugging-findings/agent-learnings.md` | Fehlermuster-Protokoll — vor der Fehlersuche lesen, eigene Fehler sofort eintragen |
| Prozesskarte 07 (`firmenkernprozesse/prozesskarten/07-subagenten-bau.md`) | Vorbild-Fassung, **nicht normativ**; bei Widerspruch gewinnt diese Datei bzw. `agent-authoring.md` |

---

## 12. Fallen und bekannte Fehler

| Falle | Symptom | Gegenmaßnahme |
|---|---|---|
| YAML-Falle in `description` | Plain-Scalar mit `: ` → stiller Metadaten-Verlust; Auto-Delegation ruft **nie** | `>-`-Block-Scalar (§7) |
| Overlap nur gegen Agents geprüft | divergentes Runbook neben einem bestehenden Skill | Overlap gegen Agents **und** Skills, eigenes Plugin **und** Kern (§5) |
| Schreibgrenze nur im Prompt | Laufzeit lässt Schreiben zu | Harte Grenze in der `tools`-Allowlist (§6) |
| Vertrauen auf das Datei-Gate | Subagent erbt die Ausnahme des Parent | Datei- und Start-Gate greifen **nicht**; nur Destruktiv-Gate bleibt scharf (§8) |
| Nur Positivtest | Agent läuft — die Sperre wurde nie erprobt | **Negativprobe** ist Teil von Schritt 5 |
| Test bleibt im alten Repo | plattenbasierter Scan meldet grün ohne Gegenstand | Baustein wandert mit, Nicht-Leer-Guard, Baustein-Version (§9) |
| `isolation: worktree` gesetzt | Isolationszusage hält auf der Team-Mindestversion nicht | nicht setzen, bis ≥ 2.1.210 (§3) |
| Verbotene Frontmatter-Felder | `hooks`/`mcpServers`/`permissionMode` laufen **lautlos ins Leere** | nicht ins Plugin; ggf. `.claude/agents/` des Arbeits-Repos (§3) |
| Unterordner unter `agents/` | Aufrufname wird `plugin:ordner:name`, Tests und Registry driften | flaches Layout (§3) |
| Subagenten-Review als Beleg | Fehler kamen durch | Suite plus `grep`-Sweep beim Führenden (§6) |

---

## 13. Verifikation und Abschluss

1. **Praxistest belegt:** `@`-Mention **und** Negativprobe auf die roten Linien; Plugin
   installiert und aktiviert; Beleg dokumentiert.
2. **Overlap-Protokoll:** keine Agent-/Skill-Duplikation; Wissen referenziert, nicht kopiert.
3. **Schreibgrenze** in der `tools`-Allowlist **und** im Prompt — Marker allein genügt nie.
4. **Kein verbotenes Feld**, kein `isolation`, flaches Layout, `name` == Dateiname ohne `:`.
5. **Doku-Nachzüge** laut Änderungs-Matrix; bei neuer Wissensdatei die Index-Zeile in
   **derselben** Änderung (testerzwungen).
6. **Suite:** `node --test plugins/nc/tests/*.test.mjs` grün ·
   `claude plugin validate plugins/<plugin> --strict` fehlerfrei.
7. **Bei neuem oder umgezogenem `agents/`:** portabler Baustein liegt im selben Repo,
   Baustein-Version stimmig, OS-gebundener Test nur im OS-Repo erwartet (AP-D1).
8. **Kein Commit ohne Maintainer-Freigabe.**

---

## 14. Abnahme und Peer-Review (Norm B des Vorbild-Zielbilds)

Agenten-Arbeit durchläuft eine Abnahme durch den führenden Agenten plus — je Klasse — ein
Peer-Review. Plattform-Realität: Es gibt keinen nativen Review-Mechanismus zwischen Agenten,
nur Orchestrierungs-Konvention — deshalb Prozessnorm, kein Hook. Drei Stufen, aufsteigend
nach Eingriffstiefe:

1. **Stufe 1 — Strukturierte Selbstauskunft (jeder Agent):** Die Rückgabe weist je
   Arbeits-/Prüfpunkt den Ausgang aus — bei Prüfaufträgen mit expliziten Statuswerten
   (`erledigt`/`fehlgeschlagen`/`nicht geprüft`), bei Arbeitsaufträgen über die
   Pflichtrubriken **Ergebnis · Abweichungen · unklare Punkte** (nichts wird still
   ausgelassen; Referenzmuster: Rückgabeformat des `sync-nachzug-executor`) — und endet
   mit dem expliziten **Gegenprobe-Auftrag an den Parent** (Diff sichten · Suite
   ausführen · Freigabe einholen). Das Rückgabeformat ist Pflichtbestandteil jeder
   Agent-Datei (Muster: `agent-authoring.md`, Gliederung).
2. **Stufe 2 — Abnahme durch den Führenden (jeder Agent, verpflichtend):** Der führende
   Agent sichtet das Ergebnis **persönlich** gegen den Auftrag (Diff bzw. Befund), gibt
   Feedback zur Neuiteration oder nimmt ab. Commit-Hoheit bleibt beim führenden
   Agenten/Maintainer (§6).
3. **Stufe 3 — Peer-Review durch unbeteiligten Zweitagenten (klassenabhängig):** Pflicht
   für **schreibende Agenten** und für Prüf-Befunde, auf denen eine Entscheidung ruht;
   Besetzung heterogen (Implementierer ≠ Reviewer, Hausbrauch der Review-Kette).

*Quelle: Norm B des Onsite-Zielbild-Bauplans „Subagenten-Zielbild: Nachschärfung"
(2026-08-15, PR #59 — upstream noch offen); auf die NovaCore-Rollen gemappt
(„Overseer" → führender Agent). Die dort zusätzlich normierten Punkte, die dem
implementierten PR #60 widersprechen (JSON-Array-Format der Allowlist,
`disallowedTools`-Totalverbot), sind **nicht** übernommen — es gilt der implementierte
Stand (PR #60); Abgleich nach dem Upstream-Merge, Bauplan-Nachtrag N7.*

---

*Angelegt 2026-08-15 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
[`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md`](../grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md),
AP-C3 — Prozess **vor** Mechanik). Quellen: Prozesskarte 07 des Vorbilds (Weisungsquelle,
nicht normativ), das Onsite-Original `agent-authoring.md` (gelesen aus dem Arbeitsstand des
Zweiges `feat/queue-flow`, Invariante I6), `skill-authoring.md` für den NC-Stil, sowie der
reale NovaCore-Code `plugins/nc/hooks/nc-ffg.js`, `nc-start-gate.js` und
`hooks/lib/session-key.js` für die Gate-Semantik (§8) — dort steht Code, nicht Vorbild.
Abweichungen vom Vorbild sind im Text als solche benannt (Versionsgrenze 2.1.210 statt der
überholten 2.1.203 der Karte; fehlende Matrix-Zeile „Agent neu/geändert" bis AP-C5).*
