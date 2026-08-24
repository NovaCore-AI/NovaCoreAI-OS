# Agent-Learnings — Fehlerprotokoll des Agenten

> Source of truth für Reflexion, späteres Lernen und Nachschärfen des Agenten.
> **Pflicht (Standardzyklus in `CLAUDE.md`):** Jeder einzelne Fehler und Bug, den ein
> Agent selbst bei der Arbeit an diesem Repo macht, wird hier festgehalten — ohne Ausnahme,
> append-only. Bei neuen Aufgaben zuerst hier auf bekannte eigene Fehlermuster prüfen.
>
> Format pro Eintrag: **Datum · Kontext/Aufgabe · Was schiefging · Ursache ·
> Lernerkenntnis/Präventionsregel**

## Einträge

### 2026-08-12 — Exitcode hinter einer Pipe geprüft: Positivkontrolle „fehlgeschlagen" gemeldet, obwohl sie bestand

- **Kontext/Aufgabe:** Im Review von PR #15 sollte die Positivkontrolle des Validators aus
  `ci.yml` lokal nachgestellt werden (absichtlich defekter Wegwerf-Skill **muss**
  `claude plugin validate --strict` rot machen, intakte Kontrollgruppe bleibt grün).
- **Was schiefging:** Die Prüfung war als `if claude plugin validate … | tail -6; then …`
  geschrieben. Der Validator meldete korrekt `✘ Validation failed`, mein Skript aber
  „POSITIVKONTROLLE FEHLGESCHLAGEN: Validator prueft keine Skills" — ein **Fehlalarm gegen
  fremdes Material**, der ohne zweiten Blick als Befund im Bericht gelandet wäre.
- **Ursache:** Falsche Annahme über die Shell: Der Exitcode einer Pipeline ist der des
  **letzten** Glieds. `tail` gelingt immer, also war die `if`-Bedingung unabhängig vom
  Validator-Ergebnis wahr. Die Vorlage in `ci.yml` prüft bewusst **ohne** Pipe — ich habe beim
  Nachstellen ein `| tail` „zur Lesbarkeit" hinzugefügt und damit die Semantik zerstört.
- **Lernerkenntnis/Präventionsregel:** Wird ein Befehl **wegen seines Exitcodes** ausgeführt, darf
  nichts dahinter gehängt werden: erst `cmd; rc=$?` (oder `cmd` direkt in `if`), Ausgabe getrennt
  betrachten — oder `set -o pipefail` bzw. `${PIPESTATUS[0]}`. Und: Beim Nachstellen eines
  CI-Schritts wird die Befehlsform **wörtlich** übernommen; jede „Verschönerung" ist eine
  Änderung der Prüfung. Gegenprobe gegen den eigenen Prüfstand: Ein Urteil, das dem sichtbaren
  Werkzeug-Output widerspricht (hier `✘ Validation failed` bei gemeldetem „prüft nicht"), ist
  bis zum Gegenbeweis mein Fehler, nicht der des Werkzeugs.

### 2026-08-11 — Gelöschten Rename-Quellpfad als `git add`-Pathspec übergeben

- **Kontext/Aufgabe:** Die vollständig übertragene Prozesskorpus-Arbeit sollte im isolierten
  Konsolidierungs-Worktree ausschließlich über explizit aufgezählte Pfade gestagt werden.
- **Was schiefging:** Der Stage-Befehl enthielt neben dem vorhandenen Rename-Ziel auch den nicht
  mehr vorhandenen Quellpfad `knowledge-base/grundwissen/2026-07-28-umbau-plan.md`. Git brach
  mit `pathspec ... did not match any files` ab; am Index kamen dadurch keine neuen Pfade hinzu.
- **Ursache:** Die Annahme, `git add -A -- <alter-pfad>` akzeptiere einen bereits als Rename
  erkannten, gelöschten Einzelpfad, wurde nicht vorab mit dem realen Dateibaum abgeglichen.
- **Lernerkenntnis/Präventionsregel:** Vor explizitem Staging jede Pathspec gegen Platte oder
  Index prüfen. Bei einem bekannten Rename das existierende Ziel explizit stagen und die
  zugehörige Löschung gezielt per `git add -u -- <enger-elternpfad>` erfassen; danach den
  staged Namensstatus gegen den vorher inventarisierten Scope vergleichen.

### 2026-07-28 — Edit auf subagenten-erzeugte Testdatei ohne frischen Read

- **Kontext/Aufgabe:** Regressionstest für die FFG-Glob-Härtung sollte in die von einem
  Subagenten erzeugte `nc-ffg.test.mjs` eingefügt werden.
- **Was schiefging:** Der erste Edit-Versuch lief ohne vorherigen Read der Zielregion und
  wurde vom Tool verweigert; erst der Grep/Read der Helper-Signaturen machte den Edit
  möglich.
- **Ursache:** Der Agentenbericht (Dateiliste, Testfälle) wurde als ausreichende Kenntnis
  des Dateiinhalts behandelt — Berichte ersetzen keinen Blick in die Datei.
- **Lernerkenntnis/Präventionsregel:** Vor jedem Edit an fremd- oder subagenten-erzeugten
  Dateien die Zielregion frisch lesen (Read/Grep mit Kontext) — insbesondere Helper-Namen
  und exakte Anker nie aus Berichten ableiten.

### 2026-07-28 — Write auf un-getrackte CLAUDE.md ohne vorherige Existenzprüfung

- **Kontext/Aufgabe:** Multi-Plugin-Umbau; die lebende Doku sollte nach Onsite-Vorbild eine
  getrackte Projekt-CLAUDE.md bekommen.
- **Was schiefging:** Der Write-Versuch setzte voraus, dass keine CLAUDE.md existiert —
  `.gitignore` listete sie aber als bewusst un-getrackte lokale Datei, und auf der Platte
  lag eine Fassung mit wertvollen lokalen Regeln (Push-Checkliste, Tag-Lehre 0.2.0). Das
  Write-Tool verweigerte („not read yet") — erst danach wurde gelesen und die Architektur-
  Entscheidung korrigiert (AGENTS.md wird die getrackte Normativ-Doku, CLAUDE.md bleibt
  lokal).
- **Ursache:** „Untracked laut git ls-files" wurde mit „existiert nicht" gleichgesetzt;
  die `.gitignore`-Semantik (bewusstes Lokal-Halten) war zwar gelesen, wurde aber nicht
  auf den Schreibplan angewendet.
- **Lernerkenntnis/Präventionsregel:** Vor jedem Write auf einen Wurzel-Dateinamen
  zusätzlich die Platte prüfen (`Test-Path`/Glob), nicht nur den Git-Index — und
  `.gitignore`-Einträge als aktive Design-Entscheidungen behandeln, die man erst liest
  und dann bewusst bestätigt oder revidiert.


<!-- Neueste Einträge oben. Format:

### YYYY-MM-DD — <Kurztitel>
- **Kontext/Aufgabe:**
- **Was schiefging:**
- **Ursache:**
- **Lernerkenntnis/Präventionsregel:**

-->

### 2026-07-28 — Umbau-Plan ließ den Standardprozess plugin-bau.md ungeplant

- **Kontext/Aufgabe:** Multi-Plugin-Umbau (Nachtschicht); der Implementierungsplan wurde vor
  Baubeginn geschrieben und die Vorlage `vorlagen/abteilungsplugin/` verwies auf
  `knowledge-base/standardprozesse/plugin-bau.md`.
- **Was schiefging:** Die referenzierte Datei war in keiner Plan-Phase als Task enthalten —
  aufgefallen erst beim Schreiben der Vorlage, nicht beim Plan-Self-Review.
- **Ursache:** Der Plan wurde aus den Phasen des Vorbilds abgeleitet; die Design-Spec (§6)
  nannte die Datei zwar, aber der Abgleich „jede in Spec/Artefakten referenzierte Datei hat
  einen erzeugenden Task" wurde nicht systematisch gefahren.
- **Lernerkenntnis/Präventionsregel:** Beim Plan-Self-Review alle in Spec und bereits
  geschriebenen Artefakten **referenzierten Pfade** greppen und gegen die Task-Liste
  abbilden — jede Referenz braucht einen Erzeuger oder eine bewusste Auslassung.

*(Weitere Einträge dieser Session werden vor dem PR ergänzt, falls Fehler auftreten.)*

### 2026-08-05 — Unsichtbares BOM-Literal in CHANGELOG und Commit-Message eingeschleppt

- **Kontext/Aufgabe:** Biggi-OS-Satellit (nc-biggi); das K3-Review-Finding „BOM-Literal im
  Regex" sollte im CHANGELOG des Satelliten dokumentiert werden.
- **Was schiefging:** Beim Dokumentieren wanderte das unsichtbare U+FEFF-Zeichen selbst in
  den CHANGELOG-Text und in die Commit-Message; der erste Gegenfix ersetzte BOM durch BOM,
  weil U+FEFF (unsichtbar) in einfachen JS-Quotes erneut als Unicode-Escape interpretiert wurde.
- **Ursache:** Unsichtbare Zeichen überleben Copy/Paste unbemerkt; die Escape-Ebenen
  Bash→Node wurden beim Gegenfix falsch gestapelt.
- **Lernerkenntnis/Präventionsregel:** Unsichtbare Zeichen nie wörtlich zitieren, sondern
  als Escape-Sequenz (Backslash-uFEFF) schreiben; nach jedem solchen Fund einen
  Node-Scan über alle berührten Textdateien laufen lassen; in Bash→Node-Einzeilern
  Ersatzstrings aus String.fromCharCode bauen statt Escapes zu raten.

### 2026-08-10 — Regeltext über die Plugin-Grenze verletzte die Regel, die er beschreibt

- **Kontext/Aufgabe:** Onsite-Align-Umbau, AP5 — Port des Skills `skill-builder` nach
  `plugins/nc/skills/skill-builder/SKILL.md`.
- **Was schiefging:** In der Regel „Plugin-Grenze wahren" stand das verbotene Muster als
  Literal im Fließtext. Die Struktur-Invariante „Plugin-Dateien verweisen nicht über die
  Plugin-Grenze" prüft zeilenweise per Regex und kennt keinen Unterschied zwischen Verweis
  und Zitat — die Suite wurde rot (76/77).
- **Ursache:** Beim Formulieren wurde an den Leser gedacht, nicht an den Prüfer. Die einzige
  Datei, die das Muster zitieren darf, ist `referenz/skill-authoring.md` (namentliche
  Ausnahme im Test) — das war bekannt, wurde beim Schreiben aber nicht mitgedacht.
- **Lernerkenntnis/Präventionsregel:** In ausgelieferten Dateien **verbotene Muster nie
  wörtlich zitieren**, sondern benennen („nie ins Elternverzeichnis springen") und für den
  Wortlaut auf die Ausnahme-Datei verweisen. Allgemeiner: Wer eine Regel in Prosa
  wiedergibt, die ein Test mechanisch prüft, prüft zuerst, ob die eigene Formulierung
  selbst darunter fällt.

### 2026-08-11 — Review-Finding ungeprüft übernommen: `--local` sah den Sparse-Schalter nicht

- **Kontext/Aufgabe:** PR #14 (Sparse-Relikt-Migration in `/nc:setup`); ein LOW-Finding des
  Opus-Reviews empfahl `git config --local --get core.sparseCheckout`, um Fehlalarme durch
  global gesetzte Werte zu vermeiden.
- **Was schiefging:** Der Scope-Wechsel wurde direkt eingebaut; beide Sparse-Tests wurden
  rot, weil moderne gits den Schalter per `extensions.worktreeConfig` in der
  **Worktree-Config** ablegen, die `--local` nicht liest — die Erkennung fand nie etwas.
- **Ursache:** Ein plausibles Review-Finding wurde wie ein verifizierter Fakt behandelt;
  die Source-of-Truth-Pflicht (git-Doku **vor** der Änderung abrufen) wurde für den
  vermeintlichen Einzeiler übersprungen.
- **Lernerkenntnis/Präventionsregel:** Review-Vorschläge sind Hypothesen, keine Belege —
  auch Einzeiler erst gegen offizielle Doku plus Empirie prüfen (richtig ist `--worktree`:
  liest die Worktree-Datei, fällt ohne Extension auf `--local` zurück, nie global/system).
  Der Fehler wurde nur sofort sichtbar, weil die Assertions **vor** dem Einbau standen —
  Testabdeckung vor Review-Einarbeitung beibehalten.

### 2026-08-10 — Neue Invariante deckte Altbestand auf; erster Impuls war, sie zu entschärfen

- **Kontext/Aufgabe:** Onsite-Align-Umbau, AP6 — Port der Release-Tag-Invariante
  („jede veröffentlichte CHANGELOG-Version außer der jüngsten ist getaggt").
- **Was schiefging:** Der Test wurde beim ersten Lauf rot, weil `0.3.0` und `0.4.0` nie
  getaggt wurden. Der erste Impuls war, die Regel weicher zu fassen (nur die jüngsten N
  Versionen prüfen), statt den Befund als das zu behandeln, was er ist: ein echter,
  vorbestehender Drift.
- **Ursache:** Eine rote Suite fühlt sich wie ein Bau-Fehler an, obwohl sie hier genau das
  tat, wofür sie portiert wurde. Rot ≠ falsch.
- **Lernerkenntnis/Präventionsregel:** Deckt eine **neu eingeführte** Invariante Altbestand
  auf, wird die Invariante **nicht** aufgeweicht. Richtig ist: Befund melden, Ursache
  benennen, und wenn die Behebung eine rote Linie berührt (hier: Tags setzen braucht
  Maintainer-Freigabe), eine **endliche, namentlich gelistete und kommentierte** Ausnahme
  bauen plus Plan-Nachtrag. Eine unbegrenzte Lockerung hätte die Regel für immer stumpf
  gemacht.

### 2026-08-16 — `git add -A` sammelte parallele Maintainer-Arbeit in den Review-Commit ein

- **Kontext/Aufgabe:** Phase-2-Review-Iteration (Codex-Findings) auf
  `feat/onsite-endstand-phase-2`; der Maintainer arbeitete zeitgleich in einer zweiten
  Session im **selben Worktree** und legte dort den Bauplan
  `2026-08-16-novacore-agent-sdk-gui-architektur.md` samt Index-Zeile ab.
- **Was schiefging:** Der Fix-Commit `1cb346e` wurde mit `git add -A` gestaged — die
  fremden, thematisch unabhängigen Dateien fuhren unbemerkt mit und wurden gepusht.
  Bemerkt erst am `create mode`-Eintrag der Commit-Ausgabe.
- **Ursache:** Pauschales Staging in einem Worktree, von dem **bekannt** war, dass eine
  Parallel-Session darin arbeitet (das AGENTS.md-„modified on disk"-Signal des Editors kam
  sogar vorher). Bequemlichkeit schlug Sorgfalt.
- **Lernerkenntnis/Präventionsregel:** Bei bekannter oder möglicher Parallelarbeit im
  selben Worktree wird **nie** `git add -A`/`-u` benutzt, sondern die explizite Pfadliste
  der selbst geänderten Dateien; vor dem Commit `git status --short` gegen die eigene
  Änderungsliste diffen. Rutscht Fremdarbeit dennoch mit: nicht rückbauen, sondern
  transparent flaggen (PR-Kommentar), Pflicht-Nachzüge (CHANGELOG/Index) nachziehen —
  gepushte Maintainer-Arbeit wird nicht ungefragt entfernt. Strukturell ist das der Fall
  für getrennte Worktrees je Session (`anker-reservierung.md`-Umfeld, Konfliktzonen-Regel).

### 2026-08-16 — PR-Kommentar per Inline-`--body` von der Shell zerschnitten

- **Kontext/Aufgabe:** Abschlusskommentar der Review-Kette auf PR #20 via
  `gh pr comment --body "…"` mit Markdown-Backticks und Klammern im Text.
- **Was schiefging:** Bash interpretierte die Backticks als Kommandosubstitution — der
  Kommentar wurde abgeschnitten gepostet (endete mitten im Text), der Rest der Zeichenkette
  lief als Shell-Zeilen ins Leere (`syntax error near '('`). Reparatur per
  `gh api PATCH -F body=@datei`.
- **Ursache:** Backticks in doppelt gequoteten Shell-Strings sind aktiv; bei langen
  Markdown-Bodies ist Inline-Quoting grundsätzlich fragil.
- **Lernerkenntnis/Präventionsregel:** PR-/Issue-Bodies und -Kommentare mit Markdown
  **immer** über `--body-file <datei>` bzw. `-F body=@datei` übergeben, nie inline —
  Datei zuerst schreiben, dann posten, dann Ergebnis-Länge gegenprüfen.

### 2026-08-16 — Klarname im Fußblock einer AUSGELIEFERTEN Datei (I9-Verstoß, extern gefunden)

- **Kontext/Aufgabe:** Phase 3, AP-E1 — Port der Kern-Referenz `pflege-auspraegung.md`
  (delegierter Opus-Agent), Overseer-Review vor der externen Review-Kette.
- **Was schiefging:** Der Portkopf-Fußblock der ausgelieferten Datei
  `plugins/nc/referenz/pflege-auspraegung.md` nannte den Maintainer mit Klarnamen —
  obwohl derselbe Fußblock zwei Zeilen weiter „Admin als Rolle statt eines Klarnamens"
  als bewusste Abweichung dokumentierte. Mein Abnahme-Review hat den Widerspruch
  übersehen; gefunden hat ihn erst der externe GLM-5.3-Durchgang (MAJOR).
- **Ursache:** Die Fußblock-Konvention der Wissensbasis („Angelegt … auf Weisung
  <Name>") wurde unreflektiert in eine **Plugin**-Datei übernommen; die I9-Regel
  „Rollen statt Klarnamen" wurde beim Review nur auf den Dokument-KÖRPER angewendet,
  nicht auf den Fußblock. Eine testerzwungene Klarnamen-Invariante für `plugins/**`
  existiert nicht — und kann nicht trivial ergänzt werden, weil der Suchbegriff selbst
  in einer ausgelieferten Testdatei stünde (derselbe I9-Verstoß).
- **Lernerkenntnis/Präventionsregel:** In `plugins/**` gilt „Rollen statt Klarnamen"
  für JEDE Zeile inklusive Fußblöcken — Zeichnung dort: „auf Weisung des Maintainers
  (Rolle: Admin)". Review-Handgriff vor jedem Phasen-PR: `grep -ri` mit den
  Klarnamens-Varianten über `plugins/` (Handgriff, bewusst kein testerzwungener
  Baustein — Begründung oben).

### 2026-08-24 — Review-Finding mit dem FALSCHEN Experiment „widerlegt" (PS-Binding: Funktion ≠ Cmdlet)

- **Kontext/Aufgabe:** Nachtschicht Phase G, externes GLM-5.3-Review R1 — Finding MINOR 4:
  `psFlagActive` erkenne die PowerShell-Wertform `-Recurse:1` nicht, `Remove-Item
  -Recurse:1 -Force x` lösche real, das FFG lasse es durch.
- **Was schiefging:** Ich habe das Finding „empirisch widerlegt" — belegt mit einer
  selbstgebauten PS-**Funktion** (`function t([switch]$s){…}; t -s:1`), die einen
  ParameterBindingError wirft. Der GLM-R2-Bestätigungslauf widerlegte MICH mit dem
  richtigen Experiment: **Cmdlets** binden `:1` anstandslos — `Remove-Item -Recurse:1
  -Force <tmp>` löscht auf PS 5.1 real (eigener Nachtest am synthetischen Temp-Verzeichnis:
  `GELOESCHT=True`). Beinahe wäre eine echte Gate-Lücke als „widerlegt" in die
  Review-Kette gewandert.
- **Ursache:** Das Gegen-Experiment prüfte einen ANDEREN Bindungspfad als der Angriffsweg:
  Skript-Funktionen mit `[switch]`-Parametern koerzieren Int32 nicht, kompilierte
  Cmdlet-Parameter schon. Die Verallgemeinerung „PowerShell wirft bei `-Switch:1`" war
  aus einem Sonderfall gezogen.
- **Lernerkenntnis/Präventionsregel:** Ein Review-Finding wird nur mit einem Experiment
  auf **exakt dem behaupteten Angriffsweg** widerlegt (hier: dasselbe Cmdlet, echtes
  Ziel-Objekt, synthetisch) — nie mit einem Analogie-Konstrukt. Vor jedem „widerlegt"
  in einer Review-Kette: den Repro-Befehl des Reviewers wörtlich nachfahren; erst wenn
  DER fehlschlägt, ist die Ablehnung tragfähig.
