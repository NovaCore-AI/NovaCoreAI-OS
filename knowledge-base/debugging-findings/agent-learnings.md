# Agent-Learnings — Fehlerprotokoll des Agenten

> Source of truth für Reflexion, späteres Lernen und Nachschärfen des Agenten.
> **Pflicht (Standardzyklus in `CLAUDE.md`):** Jeder einzelne Fehler und Bug, den ein
> Agent selbst bei der Arbeit an diesem Repo macht, wird hier festgehalten — ohne Ausnahme,
> append-only. Bei neuen Aufgaben zuerst hier auf bekannte eigene Fehlermuster prüfen.
>
> Format pro Eintrag: **Datum · Kontext/Aufgabe · Was schiefging · Ursache ·
> Lernerkenntnis/Präventionsregel**

## Einträge

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
