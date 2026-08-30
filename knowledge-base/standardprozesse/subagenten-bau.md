# Subagenten-Bau — Standardprozess für Agenten

> **Verbindlich** für jedes Anlegen oder Ändern eines **Subagenten** (`agents/`-Verzeichnis)
> in einem Plugin des Onsite.ai-OS — Kern wie Abteilung. Schwester-Dokument zu
> `abteilungs-plugin-bau.md` (Plugin- und Marketplace-Ebene) und `kern-plugin-bau.md`.
> Das **Dateiformat** eines Agenten (Frontmatter-Feldkanon, YAML-Falle, Werkzeuggrenzen-Regel
> nach dem Allowlist-Prinzip, Defense-Baseline, Prompt-Gliederung) regelt
> `agent-authoring.md` — liegt im Kern-Plugin unter
> `plugins/oai/referenz/agent-authoring.md` und wird mit dem Kern ausgeliefert; hier geht es um
> die **Prozess-Ebene** (Einordnung, Ablauf, rote Linien, Trigger, Gates, Abnahme — §8). Normative Grundlage:
> Spec §15.34. Alle Mechanik-Aussagen sind gegen die offizielle Claude-Code-Doku verifiziert
> (abgerufen **2026-08-13**: `sub-agents`, `plugins-reference`). Vor Format-Änderungen erneut
> abrufen — nie aus dem Gedächtnis.
> **Kette:** **dieser Prozess** → `sync-nachzug-bauzyklus.md`

## 1. Wann Agent, wann Skill

**Faustregel: Flutet die Arbeit den Haupt-Kontext oder braucht sie Isolation → Agent;
geführter Ablauf in der Haupt-Session → Skill.**

- **Skill**, wenn der Nutzer bzw. die Session jeden Schritt mitgehen soll: geführte Abläufe
  mit Zwischen-Entscheiden (`/oai:end-session`, `/oai:queue-abteilung`), kleine fokussierte Checks
  (ein Einzelbefund über `ps-debug`), alles, was Rückfragen an den Menschen braucht.
- **Agent**, wenn die Arbeit den Haupt-Kontext fluten würde oder einen eigenen braucht:
  bulkige Lese-/Schreibarbeit mit vielen Dateizugriffen, großen Logs oder DB-Abfragen
  (gebündelte Doku-Nachzüge des `sync-nachzug-executor`, isolierte Fit- und Ruleset-Prüfung
  des `fit-pruefer` §15.45, geräteübergreifende Diagnosen des
  `partsens-geraete-doktor`), klar umrissene Aufträge mit definierter Zusammenfassungs-Rückgabe,
  unabhängige Zweitdiagnosen im eigenen Kontextfenster.
- **Im Zweifel Skill.** Ein Agent kostet einen Delegations-Schritt und liefert nur eine
  Zusammenfassung zurück; die `description` des Agenten grenzt Pflicht-gemäß zum
  nächstliegenden Skill ab (Regel in `agent-authoring.md`), damit die Auto-Delegation die
  richtige Komponente wählt.

## 2. Scope-Entscheidung: Kern oder Abteilung

- **Domänen-frei → Kern** `plugins/oai/agents/`: Aufgaben, die jede Abteilung gleichermaßen
  hat (Doku-Nachzüge, Repo-Pflege). Namespace `oai:<agent>`.
- **Domäne → Abteilungsplugin** `plugins/oai-<abteilung>/agents/`: alles, was Fachwissen,
  Fremdsysteme oder Workflows genau einer Abteilung braucht (Beispiel: PartSens-Diagnose in
  `oai-development`). Namespace `oai-<abteilung>:<agent>`.
- **Prüfungs-Eigentum analog Spec §15.22:** Kein Abteilungs-Agent dupliziert oder schwächt
  einen Kern-Agenten ab. Existiert die Aufgabe schon im Kern, wird der Kern-Agent benutzt,
  nicht kopiert.
- **Hausregel: flaches `agents/`-Layout** — keine Unterordner. Unterordner würden Teil des
  Scoped Identifier (`p:ordner:name`); bei einstelligen Agentenzahlen kein Mehrwert, nur
  Test- und Pflege-Reibung.
- Für Plugin-Agenten lautlos ignorierte Felder (`hooks`, `mcpServers`, `permissionMode`) sind
  **verboten**. Wer sie braucht, legt den Agenten in `.claude/agents/` des Arbeits-Repos —
  nicht ins Plugin. `isolation: worktree` ist in v1 gesperrt (bis Team-Mindestversion
  ≥ 2.1.210; Details in `agent-authoring.md` — dort am 2026-08-14 doku-korrigiert).

## 3. Ablauf: neuen Agenten bauen (7 Schritte)

1. **Einordnen:** Kern oder Abteilung (§2), read-only, Diagnose-Ausnahme (lesendes Bash)
   oder schreibend, `model`-Routing (`sonnet` für Bulk-Executor, `inherit` für
   urteilskritische Agenten) — diese Entscheidungen steuern die `tools`-Allowlist
   (Allowlist-Prinzip, seit 2026-08-15) und werden über die Marker
   `<!-- oai:diagnose -->` bzw. `<!-- oai:schreibend -->` belegt (Klassen in
   `agent-authoring.md`).
2. **Overlap-Prüfung gegen bestehende Agents UND Skills.** Das gilt **auch gegen Skills**
   (B3-Lektion): Bei der ersten Garnitur-Planung wurde das bestehende `ps`-Modul
   (`ps-debug`/`ps-healthcheck` samt Referenzdateien) übersehen und ein drittes, divergentes
   Runbook vorgeschlagen — im externen Review gefangen. Also: bestehende Agents **und** Skills
   des eigenen und des Kern-Plugins zuerst lesen. Wissen lebt einmalig in den Skills — der
   Agent referenziert es (`skills:`-Preload oder explizite Leseanweisung), statt eine zweite
   Kopie zu bauen.
3. **Formatregeln laden:** `agent-authoring.md` des Kern-Plugins lesen. Das ist ein
   Laufzeit-Pfad im installierten Plugin — installierte Plugins sehen keine Repo-Pfade wie
   `knowledge base/…`; im OS-Repo liegt die Datei unter `plugins/oai/referenz/`.
4. **Agent-Datei schreiben** nach `agent-authoring.md`: Pflichtfelder `name` (== Dateiname),
   `description` (`>-`-Block-Scalar, mit Einsatz-Situation **und** Abgrenzung zum
   nächstliegenden Skill), `model` (bewusstes Routing) und `tools` (Allowlist als einzige
   Laufzeitgrenze — Read-only ohne Schreib-Tools und ohne Bash, Diagnose-Ausnahme mit
   Marker `<!-- oai:diagnose -->` und Command-Disziplin, schreibend mit Marker
   `<!-- oai:schreibend -->` und begründeter Schreib-Allowlist), dazu der
   **Skill-Anbindungs-Abschnitt** (Norm A: Preload-Ziele als nackte Namen des eigenen
   Plugins, Pflicht-Referenzdateien mit Leseanweisung, Skill-Tool-Entscheidung),
   Prompt-Gliederung Rolle → Defense-Baseline → Vorgehen → Regeln (rote Linien zuerst) →
   Rückgabe-Format mit strukturierter Selbstauskunft (`PASS/FAIL/NOT CHECKED` +
   Gegenprobe-Auftrag, Norm B Stufe 1 — Format in `agent-authoring.md`).
5. **Praxistest:** expliziter Aufruf per @-Mention in einer echten Session **plus**
   Negativprobe auf die roten Linien (ein read-only-Agent darf nicht schreiben; ein
   schreibender Agent darf seine deklarierte Grenze nicht überschreiten). Beleg im Ergebnis
   dokumentieren. Vorbedingung: das Plugin ist installiert **und aktiviert**.
6. **Doku-Nachzüge** gemäß der Zeile „Agent neu/geändert" im `Aktualisierungs-Index`
   (u. a. `module-registry.json` Agents-Segment, Betriebshandbuch, Repo-Karten, CHANGELOG) —
   und bei einer neuen Prozess-/Wissensdatei den `SSOT-Document-Index` nicht vergessen.
7. **Abschluss nach Standardzyklus:** Suite (`node --test plugins/oai/tests/*.test.mjs`),
   Validierung beider Ebenen, Protokoll-Pflichten — **kein Commit ohne Maintainer-Freigabe.**

## 4. Rote Linien für Agenten

- **Kein Agent automatisiert Merges, Deploys oder Kundensichtbares** (Posts, Ticket-
  Kommentare, Release-Schritte). Entwürfe ja, Ausführung nein — Mensch und Team-Prozess
  führen aus.
- **Schreibende Agenten tragen ihre Schreibgrenze explizit:** hart in der
  `tools`-Allowlist (die einzige Laufzeitgrenze; `disallowedTools` nur als
  Zusatzsicherung für Sonderfälle) **und** als Regel im System-Prompt
  (Sekundärschicht) — nie im Vertrauen auf die Gates (§6). Der Marker
  `<!-- oai:schreibend -->` ist ein Autoren-/Test-Vertrag, keine Laufzeitgrenze.
- **Produktive Fremdsysteme sind read-only-Default** (PartSens-Geräte, Jira, produktive
  Datenbanken): Diagnose und Eingriffs-Entwurf im Agenten, Ausführung im Team-Prozess.
- **Commit-Hoheit bleibt beim führenden Agenten/Maintainer** — Subagenten committen, pushen
  und taggen nie. Damit wird das bisher gelebte Muster normiert. Die deterministische
  Gegenprobe (Testsuite, grep-Sweeps) bleibt ebenfalls Pflicht des führenden Agenten —
  Subagenten-Review allein ließ bereits Fehler durch (Warn-Beleg `agent-learnings.md`
  2026-08-12).

## 5. Trigger-Mechanik

- Aufruf **aus Sessions heraus**: per Skill, per @-Mention oder per description-getriebener
  Auto-Delegation. Deshalb ist die `description` delegations-kritisch — ein stiller
  Metadaten-Verlust (YAML-Falle: Plain-Scalar mit `: `) heißt hier, der Agent wird nie
  automatisch gerufen, und niemand merkt es.
- **Kein Cron/Scheduler je Maschine.** Trigger-Automatik wäre eine verbotene
  Setup-Abhängigkeit; die Verteilannahme ist: Agenten reisen im Plugin mit, ohne
  per-Maschinen-Setup.

## 6. Gate-Semantik: Subagenten und die Kontroll-Schicht

- Jeder neue Agent **erbt die Subagenten-Ausnahmen** der Kontroll-Schicht (im Code belegt):
  das FFG-**Datei**-Gate und das **Start-Gate** gelten für Subagenten nicht — der Parent hat
  sie erfüllt (`oai-ffg.js` Edit/Write-Zweig, `oai-start-gate.js`). Das **Destruktiv-Gate
  bleibt scharf**: Der Bash-Pfad kennt keine Subagenten-Ausnahme.
- **Konsequenz:** Schreibgrenzen stehen in der `tools`-Allowlist (plus `disallowedTools`
  als Zusatzsicherung in Sonderfällen) und im System-Prompt — nie im Vertrauen auf die
  Gates. Ein schreibender Agent mit falsch gesetzter Grenze hat **kein** Datei-Gate als
  Fangnetz.
- Abteilungen dürfen eigene Domänen-Hooks um ihre Agenten bauen, duplizieren oder schwächen
  aber keine Kern-Prüfung (Prüfungs-Eigentum, Spec §15.22/§15.34).

## 7. Testschutz: der Prüfbaustein wandert mit

**Regel: Bekommt ein Repo ein `agents/`-Verzeichnis, wandert der portable Prüfbaustein
`agenten.test.mjs` im selben Zug mit** — bei einer Satelliten-Extraktion also gemeinsam mit
den Agenten, nicht später.

Begründung (belegte Beinahe-Lektion, `Debugging + findings/agent-learnings.md` 2026-08-14):
Die Testsuite scannt **plattenbasiert**, und ein plattenbasierter Scan endet an der
Repo-Grenze. Zieht ein geprüftes Artefakt in ein anderes Repo, verliert eine zurückgebliebene
Prüfung ihren Gegenstand — **ohne rot zu werden**. Sie findet dann schlicht nichts mehr und
meldet grün. Genau so wäre bei der `development`-Extraktion die Frontmatter-Prüfung von 17
Skills lautlos verschwunden.

Praktisch:

- `plugins/oai/tests/agenten.test.mjs` ist deshalb **portabel gebaut**: keine hartkodierte
  Verzeichnistiefe (die Repo-Wurzel wird gesucht, nicht gezählt), kein Bezug auf Registry,
  Vorlagen oder andere OS-Repo-Artefakte, dazu ein **Nicht-Leer-Guard** — wer ihn in ein Repo
  ohne Agenten kopiert, bekommt Rot statt stiller Zustimmung.
- Die repo-gebundenen Invarianten (Registry-Abgleich, Vorlagen-Platzhalter) leben getrennt in
  `agenten-os.test.mjs` und bleiben im OS-Repo. Bewusst **keine** „überspringen, wenn Datei
  fehlt"-Logik in einer gemeinsamen Datei: Ein still übersprungener Test meldet grün, ohne
  geprüft zu haben (Maintainer-Entscheid 2026-08-14).
- Der Baustein trägt im Kopf eine **Baustein-Version**. Jede inhaltliche Änderung zählt sie
  hoch; eine Satelliten-Kopie mit niedrigerer Nummer ist dadurch als Drift erkennbar. Die
  Rückrichtung — Kopien nach einer Kern-Änderung nachziehen — gehört in die Matrix-Zeile
  „Agent neu/geändert" des `Aktualisierungs-Index`.
- Frage bei **jedem** Rückbau oder Umzug: „Welche Prüfung verliert hier ihren Gegenstand?"

## 8. Abnahme und Peer-Review (Norm B, seit 2026-08-15)

Agenten-Arbeit durchläuft eine Aufseher-Abnahme plus — je Klasse — ein Peer-Review.
Plattform-Realität: Es gibt keinen nativen Review-Mechanismus zwischen Agenten, nur
Orchestrierungs-Konvention — deshalb ist das eine Prozessnorm, kein Hook. Drei Stufen,
aufsteigend nach Eingriffstiefe:

1. **Stufe 1 — Strukturierte Selbstauskunft (jeder Agent):** Rückgabeschema
   `PASS/FAIL/NOT CHECKED` je Prüfpunkt plus expliziter **Gegenprobe-Auftrag an den
   Parent** (Diff sichten · Suite ausführen · Freigabe einholen). Das Rückgabeformat ist
   Pflichtbestandteil jeder Agent-Datei (Format in `agent-authoring.md`).
2. **Stufe 2 — Overseer-Abnahme (jeder Agent, verpflichtend):** Der führende Agent
   sichtet das Ergebnis **persönlich** gegen den Auftrag (Diff bzw. Befund), gibt
   Feedback zur Neuiteration oder nimmt ab. Commit-Hoheit bleibt beim führenden
   Agenten/Maintainer (§15.34.5). Die deterministische Gegenprobe (Testsuite,
   grep-Sweeps) bleibt Pflicht des führenden Agenten — Subagenten-Review allein ließ
   bereits Fehler durch (Warn-Beleg `agent-learnings.md` 2026-08-12).
3. **Stufe 3 — Peer-Review durch unbeteiligten Zweitagenten (klassenabhängig):** Pflicht
   für **schreibende Agenten** und für Execution-Engines, deren Befund eine Entscheidung
   trägt (z. B. eine Pipeline-Prognose vor einem Push, eine Diagnose vor einem
   Runbook-Entwurf). Muster: **Ersteller ≠ Abnehmer** · der Reviewer ändert nichts selbst
   (read-only, frischer Kontext) · maximal 2 Korrekturschleifen, danach Eskalation an
   Overseer/Maintainer. Strikt lesende Agenten brauchen keinen Peer — Stufe 1+2 genügt
   (die Beleg-Pflicht je Kernaussage ist ihr eingebauter Prüfpfad).

Quelle: Zielbild-Bauplan `Bauplan-archiv/2026-08-15-subagenten-zielbild-nachschaerfung.md`
(OS-Repo), Maintainer-Entscheid 2026-08-15.
