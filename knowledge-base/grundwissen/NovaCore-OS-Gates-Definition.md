# Kontroll-Schicht — Definition der vier Gates

> **Zweck:** die verbindliche Kurzbeschreibung der vier Gates an einem Ort. Abgeleitetes
> Dokument — bei Widerspruch gewinnen die normativen Quellen (jüngste Spec/Bauplan in
> `grundwissen/`, dann `CHANGELOG.md` als Produktstand).
>
> **Begriffshinweis:** „FFG" im engeren Sinn ist **Gate 1** (Fact-Forcing-Gate). Wenn im
> Alltag von **„FFG 1–3"** die Rede ist, sind damit die **drei Sub-Gates von Gate 1**
> gemeint — Datei-Gate, Destruktiv-Gate, Routine-Bash-Gate —, **nicht** drei eigenständige
> Gates. Normativ heißt die Familie **Kontroll-Schicht**, ihre Mitglieder **Gates**.

Gemeinsame Eigenschaften aller Gates: **deterministisch** (die KI hat kein Veto),
**fail-open** bei internen Fehlern (ein kaputtes Gate blockiert nie die Arbeit),
**kein Marker** — Aktivierungsbedingung ist die Installation des Kern-Plugins, Opt-out nur
per Env **je Gate**. Alle Hooks liegen im Kern `nc`.

| # | Gate | Erzwingt | Mechanik | Fragt den Menschen? | Status (2026-08-10) | Opt-out | Quelle |
|---|---|---|---|---|---|---|---|
| **1** | **FFG** (Fact-Forcing-Gate) — im Kern als domänen-freies **Basis-Gate**; drei Sub-Gates („FFG 1–3") | Fakten **vor** schreibenden Aktionen: **(1) Datei-Gate** je Zieldatei (Edit/Write/MultiEdit), **(2) Destruktiv-Gate** je Kommando (`rm -rf`, Force-Push, `reset --hard`, SQL-DDL, `find -exec` …), **(3) Routine-Bash-Gate** einmal je Session; Read-only-Git nie | PreToolUse (`nc-ffg.js`); Ablehnung mit Investigations-Text, Durchlass nach Faktenvorlage; quote-aware Bash-Analyse (GHSA-4v57-ph3x-gf55-Härtung), verankerte Exempt-Globs, plattformbewusstes Case-Folding, Session-Key-Hashing bei jeder Zeichen-Ersetzung | **Nie** — es verlangt Fakten und lässt danach den normalen Permission-Flow laufen | **gebaut** (v2; Review-Härtungen 2026-07-28, Lib-Extraktion + `exitCode`-Fix 2026-08-10) | `NC_FFG=off` | Design-Spec 2026-07-28 §5; Bauplan 2026-08-10 AP1 |
| **2** | **Session-Start-Zwang** | Kein Blind-Start: Pflicht-Einstieg + lebender Projektstand zu Sessionbeginn; die **erste schreibende Aktion** erst, nachdem `/nc:start` gelaufen und der Fakten-Stempel gesetzt ist — Lesen und Fragen bleiben frei | zweiteilig („Zangen-Prinzip"): SessionStart-**Injektion** (`nc-session-start.js`; kann plattformbedingt nicht blocken) + PreToolUse-**Erzwingungs-Begleiter** (`nc-start-gate.js`) mit Fakten-Stempel (`nc-start-stempel.js`, verifiziert `--branch`/`--head` gegen die Git-Lage des **Projektverzeichnisses**) | Nein | **gebaut** mit dem Umbau 2026-08-10 (vorher: markergebundener Begrüßungs-Hinweis, kein Gate) | `NC_START_GATE=off` (ein Schalter für beide Teile) | Bauplan 2026-08-10 AP2, Nachtrag N2 |
| **3** | **Safety-Gate** | Echte **menschliche Freigabe** vor Aktionen mit Außen- oder Infrastrukturwirkung: Infra/Deploy/Prod **und** kundensichtbare Schreibaktionen — Vorlagepflicht: Empfänger/Zielort + **wörtlicher** Text | PreToolUse mit `permissionDecision: "ask"` → echter Freigabedialog; semantische Schreib-Marker auch für `mcp__*`-Tools (manifest-unabhängig); Fehlalarm-Schutz als Abnahmekriterium | **Ja — genau dafür existiert es** (das einzige Gate mit Dialog) | **nicht gebaut** (wie im Vorbild) | vorgesehen, analog je Gate | offen |
| **4** | **Sitzungsabschluss** | Kein Wissensverlust am Sessionende: ungesicherte substanzielle Arbeit wird angemahnt, Erinnerung/Journal und Logs werden gepflegt | vorgesehen dreiteilig: PostToolUse-**Akkumulator** + **Stop**-Hook (blockt **einmal** je Turn-Kette, Schleifenschutz) + SessionEnd-Protokoll; menschliches Gegenstück ist `/nc:save-session` | Nein — es mahnt und blockt einmal, entscheidet nicht | **nicht gebaut** — nur der Skill `/nc:save-session` existiert | vorgesehen, analog je Gate | offen |

## Abgrenzungen, die Verwechslungen verhindern

- **Gate 1 vs. Gate 3:** Das FFG fragt **nie** den Menschen (Fakten, dann Permission-Flow);
  Gate 3 erzeugt den **echten Freigabedialog**. Eine Bestätigungspflicht für kundensichtbare
  Schreibaktionen ist deshalb eine Gate-3-Erweiterung und **kein zweites FFG**.
- **Basis-Gate vs. Domänen-FFG (Prüfungs-Eigentum):** Der Kern trägt Gate 1 **domänen-frei**
  (einmal gepflegt, für alle gleich); eine Abteilung darf später ein eigenes **Domänen-FFG**
  mit eigenen Fragen auf eigenen Mustern bauen. Regel: **keine Kern-Prüfung duplizieren oder
  abschwächen**; Matcher sind frei. Gate 1 und Gate 2 nutzen denselben Matcher und prüfen
  trotzdem Verschiedenes — das ist gewollt, nicht redundant.
- **Gate 2 vs. Gate 4:** Der Start-Zwang sichert den **Anfang** (richtiger Kontext, bevor
  geschrieben wird), der Sitzungsabschluss das **Ende** (nichts geht verloren). Ihre
  menschlichen Gegenstücke sind `/nc:start` und `/nc:save-session`.

## Was Gate 2 deterministisch prüft — und was nicht

Ehrliche Reichweite, damit die Tabelle oben nicht mehr verspricht, als der Code hält:

- **Geprüft wird die Git-Lage.** Der Stempel löst sie gegen das **Projektverzeichnis** auf
  (`CLAUDE_PROJECT_DIR`, sonst cwd) und vergleicht `--branch`/`--head` gegen
  `git rev-parse`. Ein Stempel aus einem Verzeichnis ohne Git wird als **unverifiziert**
  markiert und öffnet nur dort, wo auch die gegatete Aktion in keinem Git-Baum läuft —
  ein `cd` in ein leeres Verzeichnis reicht also nicht (Nachtrag N2, Befund H1).
- **Geprüft wird *eine* reale Git-Lage — nicht zwingend die des Zielpfads.** Der Stempel gilt
  für die ganze Session, nicht je Repo: Wer in einer Session mehrere Repos anfasst, stempelt
  einmal. Ein Stempel, der gegen Repo A verifiziert wurde, öffnet also auch Schreibvorgänge
  in Repo B. Das ist Absicht — ein Toplevel-Vergleich würde Mehr-Repo-Sessions unbrauchbar
  machen. Gate 2 erzwingt „der Agent hat eine echte Git-Lage angesehen", nicht „genau die
  des nächsten Schreibvorgangs".
- **Nicht geprüft wird, ob `/nc:start` inhaltlich lief.** Kein Hook kann das feststellen;
  der Stempel ist der Proxy. Wer ihn setzt, ohne den Ablauf durchlaufen zu haben, umgeht
  Gate 2 so bewusst wie per `NC_START_GATE=off`. Das ist die dokumentierte Proxy-Grenze.
- **Der Durchlass für den Stempel-Befehl ist eng gefasst:** Er verlangt eine einzeilige,
  am Zeilenanfang verankerte Invokation von **genau diesem** Skript (Pfadvergleich, nicht
  Namenssuffix); alles, was eine zweite Aktion anhängt — `;`, `&&`, `|`, `>`, `#`, `$(…)`
  oder ein Zeilenumbruch —, verwirft ihn.
- **Fail-open bleibt fail-open:** Läuft die Git-Abfrage des Gates in den 2-Sekunden-Timeout,
  wird durchgelassen (wie bei allen Gates) — dann aber mit einer Warnung auf stderr, damit
  Last die Kontroll-Schicht nicht unbemerkt abschwächt.
- **`NotebookEdit`** verlangt den erledigten Session-Start (Gate 2 matcht es), aber **keine
  Fakten je Zieldatei** — Gate 1 matcht es nicht.

## Satelliten (Kollegen-OS)

Die eigenständigen Satelliten (`nc-felix`, `nc-biggi`) tragen **eigene Kopien** von Gate 1
(Biggi zusätzlich Gate 2) in ihren Plugins; sie hängen nicht am Kern. Deshalb gilt:
**nie parallel zum Kern `nc` betreiben** — sonst feuern die Gates doppelt.

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus,
auf Weisung Lucas Vöhringer. Abgeleitet — normative Quellen gewinnen; bei Gate-Änderungen in
derselben Änderung nachziehen (`standardprozesse/aktualisierungs-index.md`, Zeile
„Hook neu/geändert").*
