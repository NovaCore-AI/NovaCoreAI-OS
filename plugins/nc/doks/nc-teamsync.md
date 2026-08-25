# nc-teamsync — Globale Agenten-Anweisung (NovaCore-OS)

> **Was diese Datei ist:** Die **gemeinsame, höchste Instruktion** für alle Agenten, die mit dem
> NovaCore-OS arbeiten. Sie wird mit dem Kern-Plugin `nc` ausgeliefert und gilt in **jeder
> Session**, in jedem Arbeits-Repo, **unabhängig von der CLI** (Claude Code, Kimi Code CLI,
> Codex CLI — die Dateinamen `CLAUDE.md` / `AGENTS.md` sind Synonyme). Source of Truth für
> **Methodik, Conventions, Safety** — nicht für fachliche Use-Case-Inhalte (die liegen im
> jeweiligen Arbeits-Repo). **Sprache: Deutsch — Code-Artefakte in Arbeits-/Kundenrepos
> englisch (§6).**
> **Version:** die des Kern-Plugins `nc` (siehe dessen `plugin.json`).

---

## 1. Verhaltens-Defaults (gelten immer, vor allem anderen)

Vier Prinzipien, abgeleitet aus Karpathys Beobachtungen zu LLM-Coding-Pitfalls. Sie sind
**Defaults**, kein Dogma — bei Trivialia (Tippfehler, offensichtliche Einzeiler) Maß halten.

1. **Erst denken, dann coden.** Annahmen aussprechen, nicht verstecken. Bei mehreren
   Interpretationen diese **vorstellen**, nicht schweigend eine wählen. Wenn ein einfacherer Weg
   existiert: sagen und dagegen halten. Unklarheit = stoppen, benennen, fragen.
2. **Einfachheit zuerst.** Minimaler Code, der das Problem löst. Nichts Spekulatives — keine
   Features jenseits des Auftrags, keine Abstraktionen für Einmal-Verwendung, keine unerbetene
   Konfigurierbarkeit, kein Error-Handling für unmögliche Szenarien. Faustregel: 200 Zeilen, die
   50 sein könnten → neu schreiben. Maß: *„Würde ein erfahrener Engineer das als überkompliziert
   ansehen?"*
3. **Chirurgische Änderungen.** Nur anfassen, was der Task verlangt. Kein adjacent-Refactor, kein
   Umformatieren, kein „Verbessern" funktionierenden Codes. **Lokalen Stil matchen**, auch wenn
   man es selbst anders machen würde. Bemerkter fremder Dead Code: **nennen, nicht löschen**, es
   sei denn, er stammt aus der eigenen Änderung. Test: jede veränderte Zeile muss direkt zum
   Auftrag zurückverfolgbar sein.
4. **Zielgetriebene Ausführung.** Aufgaben in **verifizierbare** Ziele übersetzen — nicht „mach
   es kaputt", sondern „schreib einen Test, der den Bug reproduziert, dann mach ihn grün". Bei
   Mehrschritt-Tasks: kurzen Plan mit Verify-Schritt pro Phase angeben. Starke Erfolgskriterien
   ermöglichen autonomes Loopen; schwache („mach, dass es geht") erzwingen Rückfragen.

---

## 2. Methoden

### 2.1 Fakten aus der Quelle, nie aus dem Gedächtnis

Fachliche Fakten (Schwellenwerte, Datenmodelle, API-Verträge, Geschäftslogik) stammen
**ausschließlich** aus dem jeweiligen Arbeits-Repo (`CLAUDE.md`/`AGENTS.md` des Repos,
Projekt-Doku, echter Quellcode). Selbst generierte Zahlen/Regeln als **KI-Vorschlag** kennzeichnen
und gegen die Quelle plausibilisieren. Bei Widerspruch Gedächtnis vs. Quelle gewinnt **die
Quelle**. Quelle nicht auffindbar → **STOPP**, sagen, fragen — nicht raten.

### 2.2 Test-First auf kritischem Pfad

Für den **kritischen Pfad** (Geldfluss, Auth, Datenschutz/Sicherheit, externe Verträge) gilt
**TDD**: RED → GREEN → REFACTOR. Ziel ≥ 80 % Coverage für diese Pfade (**Default**; das Repo kann
eine abweichende Grenze festlegen — höhere für Geldfluss, niedrigere für reine UI). Trivialer
UI-Code ohne Geld-/Sicherheitsbezug wird nicht künstlich mit Tests erstickt. Ein Test, der nicht
scheitert, wenn sich die Logik ändert, ist **schwach** — Tests prüfen **Absicht**, nicht nur
Verhalten.

### 2.3 Definition of Done (DoD)

Code gilt erst als „fertig", wenn **alle** Punkte erfüllt sind:

- Lint/Format sauber (projekt-eigene Tools) · Tests grün (kritischer Pfad ≥ 80 %) · kein Secret
  im Diff
- Pull Request beschrieben, mit Anforderungs-/Ticket-Referenz · Eigen-Review des Diffs
  durchgeführt
- Review bestanden · **vom Menschen** in `main` gemergt (`main` bleibt lauffähig) · Entscheidung
  im Entscheidungslog (sobald ein Modul `architecture` existiert — geplant; bis dahin im Pull
  Request bzw. im `.nc/`-Journal dokumentiert)

Wird ein Schritt übersprungen, ist das ein Grund einzugreifen — mit einer Zeile Begründung, dann
den Schritt nachholen.

### 2.4 Review-Pflicht

**Verstehen vor Freigabe.** Jeder nicht-triviale Change geht durch Review (Self-Review des Diffs
vor dem Pull Request, Fremd-Review im Pull Request). Der Agent entwirft, der **Mensch liest,
hinterfragt, verantwortet**. Bei kritischem Pfad: adversarielles Dual-Review empfohlen.

### 2.5 Fehlerkultur

Behauptungen nur mit Beweis (grüner Test, Command-Output, beobachtetes Verhalten).
„Funktioniert" ohne Beweis = unbegründet. Bei Unsicherheit: offen sagen, nicht beschönigen.

---

## 3. Pfade & Struktur

### 3.1 Arbeits-Repo

```
<repo-root>/
├── CLAUDE.md / AGENTS.md   # repo-eigene Anweisung (fachliche Source of Truth)
└── <Projekt-Code/Doku>
```

**Kein eigener Dateistrom mehr (BREAKING, seit Kern 0.13.0).** Ohne eigene Wissensbasis trägt
das **Projekt-Memory von Claude Code** (`~/.claude/projects/<projekt-slug>/memory/`) den Stand
allein — kein Verzeichnis, keine Datei im Arbeits-Repo. Führt das Arbeits-Repo selbst eine
eigene Wissensbasis (SSOT-Kategorie mit Master-Index), wohnt das Sitzungswissen dort
**committet** unter `sitzungswissen/` (Struktur wie in §3.2 für das OS-Repo). Der frühere
lokale Strom `.nc/erinnerung/` ist abgeschafft; ein gefundener Altbestand wird von `/nc:start`
gemeldet, nie gelesen.

### 3.2 OS-Repo (NovaCoreAI-OS selbst)

Die Repo-Wurzel ist **Marketplace-Wurzel**, kein Plugin. Jedes Plugin liegt unter `plugins/`:

```
NovaCoreAI-OS/
├── .claude-plugin/marketplace.json     # Marketplace "novacore-os", Einträge OHNE version-Feld
├── plugins/nc/                         # Kern-Plugin: ständige Abteilung "gemeinsam"
│   ├── .claude-plugin/plugin.json      #   Leitversion des Produkts, KEINE dependencies
│   ├── skills/<name>/SKILL.md          #   start, end-session, journal
│   ├── hooks/                          #   FFG + SessionStart — Hooks liegen NUR im Kern
│   ├── tests/*.test.mjs                #   Hook-Tests + Struktur-Invarianten
│   ├── wp-rahmen.md                    #   Pflicht-Zyklus WP0–WP8 (normativ)
│   ├── module-registry.json            #   Metadaten-SSOT Abteilung → Plugin → Module → Skills
│   ├── referenz/skill-authoring.md     #   verbindliche SKILL.md-Formatregeln
│   └── doks/nc-teamsync.md             #   diese Datei
├── plugins/nc-development/             # Abteilungsplugin, dependencies ["nc"]
│   ├── workflow.md                     #   WP1–WP7 auf den NovaCore-Zyklus übersetzt
│   └── skills/<modul>-<name>/SKILL.md  #   flaches Layout, Module = Namenspräfixe
└── knowledge-base/                     # Wissensbasis im OS-Repo: grundwissen,
                                        # standardprozesse, debugging-findings
    └── standardprozesse/vorlagen/abteilungsplugin/
                                        # Vorlage für weitere Abteilungen (kein Plugin)
```

Abteilungen können zusätzlich in **Satelliten-Repos** leben (das Repo IST das Plugin,
Marketplace-Eintrag per Commit-SHA-Pin) — auch als **eigenständiges Kollegen-OS** ohne
Kern-Dependency (erster Fall: `nc-felix`). Verbindlicher Ablauf inklusive der verifizierten
Install-Fallen: `knowledge-base/standardprozesse/abteilungs-plugin-bau.md` §3a/§3b im **OS-Repo**
(Quellenangabe, nicht zur Laufzeit auflösbar).

**Version je Plugin genau an einer Stelle:** in dessen `plugin.json`. Marketplace-Einträge tragen
**kein** `version`-Feld — Claude Code nimmt ohne Warnung den Wert aus `plugin.json`.

### 3.3 Memory-Trennung (streng)

Kunden-/Projekt-Kontext bleibt **ausschließlich** im Arbeits-Repo bzw. dessen Projekt-Memory —
**nie** im OS-Repo. Das OS-Repo bleibt kontextfrei und stack-agnostisch: Sein eigenes
`sitzungswissen/` trägt nur den Baustand des OS selbst, nie Kundenkontext eines fremden
Arbeits-Repos. Journal und Register sind **append-only** — bestehende Einträge nie verändern
oder löschen.

### 3.4 Neue Dateien am richtigen Ort

Vor dem Anlegen jeder neuen Datei die Projekt-/Modul-Convention prüfen und am **richtigen Ort**
ablegen. Kern-Skill → `plugins/nc/skills/<name>/SKILL.md`. Abteilungs-Skill →
`plugins/nc-<abteilung>/skills/<modul>-<name>/SKILL.md`. Hook → **ausschließlich**
`plugins/nc/hooks/`. Passt der Ort nicht → **widersprechen und korrigieren**, statt die Datei
einfach zu erzeugen. Schicht-, Plugin- und Modulgrenzen nicht durchbrechen; in ausgelieferten
Dateien **nie** über die Plugin-Grenze hinweg auf Pfade verweisen — auf Inhalte anderer Plugins
per Name, auf Repo-Dokumente nur als Quellenangabe.

### 3.5 Archiv ist keine Wissensquelle

Jede SSOT führt Archiv-Kategorien — im OS-Repo `knowledge-base/bauplan-archiv/` und die
append-only Protokolle unter `knowledge-base/debugging-findings/`. Sie sind **Log**: für
Debugging, für Nachvollziehbarkeit und für Learning. Für normale operative Arbeit werden sie
**nie** als Quelle herangezogen — operative Basis sind ausschließlich die **lebenden**
Dokumente (Standardprozesse, aktuelle Baupläne, `CLAUDE.md`/`AGENTS.md`, `workflow.md`). Ins
Archiv wird gegriffen, wenn ausdrücklich das **Warum** einer bestehenden Struktur gesucht, ein
Fehler nachvollzogen oder geprüft wird, ob ein Symptom bekannt ist — nie, um eine aktuelle
Frage nach dem Soll zu beantworten. Ein archivierter Bauplan beschreibt den Stand seines
Entstehungstags, nicht die geltende Norm; wer ihn als Beleg für ein Soll zitiert, argumentiert
mit einem abgelaufenen Zustand.

---

## 4. CLI-Layer (welches Harness gilt)

| CLI | Standard? | Datei | Skill-Mechanik |
|---|:--:|---|---|
| **Claude Code** | ja (Default-Harness) | `CLAUDE.md` | echtes Plugin-System: Plugin-Familie aus einem Marketplace, Namespaces `nc:` und `nc-development:` |
| **Kimi Code CLI** | sanktionierte Variante | `AGENTS.md` | Copy-Deploy **geplant (Iteration 2), noch nicht implementiert** |
| **Codex CLI** | sanktionierte Variante | `AGENTS.md` | Text-Guidance (kein Tool-Hook-Enforcement) |

`CLAUDE.md` und `AGENTS.md` sind in diesem OS **Synonyme** und bezeichnen dieselbe repo-lokale
Agenten-Anweisung. **Diese `nc-teamsync.md` gilt identisch in allen drei CLIs.** Implementiert ist
bisher allein die Claude-Code-Plugin-Familie; bis Kimi- und Codex-Support existieren, gilt dort
nur die Text-Guidance aus dieser Datei, ohne Plugin- oder Hook-Enforcement.

> **Ehrlichkeit zum Hook-Status:** Die Gates laufen dort, wo eine CLI PreToolUse-Hooks kennt und
> ein Ergebnis blocken kann — heute Claude Code. Auf Codex CLI gibt es **kein
> Tool-Hook-Enforcement**; dort trägt die Durchsetzung der **Mensch** (Review) plus
> serverseitige Branch Protection. Diese Lücke wird benannt, nicht kaschiert.

---

## 5. Arbeitsweise (Session-Zyklus)

Der verbindliche Rahmen steht in `wp-rahmen.md` des Kern-Plugins `nc` (WP0–WP8); die Abteilung
übersetzt WP1–WP7 in ihrer eigenen `workflow.md`.

1. **Session-Start (WP0):** `/nc:start` — bestimmt den Ablageort, liest das **Projekt-Memory
   zuerst** (commit-unabhängig), dann Stand, letztes Journal, Register und Roll-up des
   Zielorts, dazu Git-Lage und Werkzeuglage. **Kein Blind-Start.**
2. **Feature-Arbeit (WP1–WP5):** `/nc-development:flc-feature-start` → `/nc-development:flc-plan`
   → implementieren → `/nc-development:flc-commit-prep` → `/nc-development:flc-pr`.
3. **Review (WP6):** `/nc-development:fe-review` für Frontend-Diffs,
   `/nc-development:be-review` für Backend-Diffs — der Agent entwirft die Befunde, der Mensch
   postet und entscheidet.
4. **Jederzeit:** `/nc:journal` — einzelne Entscheidungen, Funde und Blocker sofort festhalten,
   statt sie bis zum Sitzungsende zu sammeln.
5. **Session-Ende (WP8):** `/nc:end-session` — append-only ins Journal, Stand konsolidieren,
   Übergabe schreiben.

---

## 6. Verbindliche Regeln

- **Sprache (präzisiert nach Firmenspezifikation N6, 2026-08-15):** Kommunikation, Tickets,
  Doku und Journale auf Deutsch. In **Arbeits- und Kundenrepos** sind **Code-Artefakte**
  (Branch-Namen, Commit-Messages, PR-Titel und -Texte, Code-Kommentare) **englisch**; eine
  abweichende Regel der CLAUDE/AGENTS des jeweiligen Arbeits-Repos gewinnt. Das **OS-Repo
  selbst bleibt durchgängig deutsch** (Bestand).
- **Safety:** Keine automatischen Pushes, Merges, Posts, Releases oder Deployments ohne
  **explizite Nutzerfreigabe**. Durchgesetzt wird das vom **Fact-Forcing-Gate (FFG)** des
  Kern-Plugins mit drei Gates:
  - **Datei-Gate** (Edit/Write/MultiEdit): einmal je Zieldatei Fakten nennen — bei Änderungen
    Importeure und betroffene Verträge, bei Neuanlagen Aufrufer und Duplikat-Prüfung.
  - **Destruktiv-Gate** (Bash): jedes destruktive Kommando **einzeln** begründen —
    `rm -rf`, `git push --force`, `git reset --hard`, `git clean -f`, `git checkout --`,
    `git commit --amend`, `DROP TABLE`, `dd if=` und Verwandte. Zusatzmuster projektspezifisch
    über die Env-Variable `NC_FFG_EXTRA_DESTRUCTIVE` (Regex).
  - **Routine-Bash-Gate:** einmal je Session; reine Read-only-Git-Introspektion nie.

  Das Gate antwortet mit **deny**, nicht mit „ask": Es verschärft nur, es lockert nie. Es ist
  **markerlos aktiv** — überall dort, wo das Kern-Plugin installiert ist. **Opt-out
  ausschließlich per Env `NC_FFG=off`**, gesetzt vom Menschen, nie vom Agenten. Auf CLIs ohne
  Gate-Enforcement gilt dieselbe Disziplin manuell.
- **Branching:** Feature-Branch → Pull Request → Review → Merge. **Kein direkter Push auf
  `main`.** `main` bleibt lauffähig. Der Merge ist eine rote Linie: der Mensch führt ihn aus.
- **Memory:** Kundenkontext bleibt im Arbeits-Repo unter `.nc/` (in `.gitignore`); nichts davon
  ins OS-Repo.
- **Fehlender Kontext:** Nachfragen statt raten; im Zweifel auf `/nc:start` zurückgreifen.
- **Journal:** Append-only — bestehende Einträge nie verändern oder löschen.
- **Secrets:** Keine Secrets/Tokens/Passwörter in Code, Logs, Commits oder Konversation. Wo
  die lokale Secrets-Quelle einer Maschine liegt, sagt allein die Umgebungsvariable
  **`NC_SECRETS_REF`** — sie trägt einen **Verweis, nie einen Wert** (je nach Einrichtung ein
  Dateipfad, der Name eines Passwort-Managers oder ein Kommando, das den Zugang liefert) und
  wird **nie gelesen**. Ist sie nicht gesetzt, ist das kein Fehler — dann fragt der Mensch, kein
  Abbruch. `/nc:setup` prüft das **nicht-blockierend**, `/nc:os-info` meldet ausschließlich
  **gesetzt / nicht gesetzt**, nie den Inhalt.
- **Eigene Fehler protokollieren:** Jeder selbst verursachte Fehler wandert append-only ins
  Fehlerprotokoll (`agent-learnings.md` der Wissensbasis des OS-Repos, sonst nach Konvention des
  Arbeits-Repos) — sofort, nicht am Ende.

---

## 7. Namespace & Koexistenz

Kern-Skills laufen unter `/nc:`, Abteilungs-Skills unter dem Namespace ihres Plugins
(`/nc-development:`). Der Namespace ist der **Name des Marketplace-Eintrags** und nicht frei
wählbar. Die Familie ist kollisionsfrei zu anderen installierten Plugin-Familien; deren Dateien
werden **nie** verändert.

Zum Repo-Scoping gilt seit 2026-08-10 **eine** Regel: **Aktivierungsbedingung ist die
Installation, nicht ein Marker.** Ein Gate, das man vergessen kann, ist kein Gate — die
frühere `.nc-os`-Marker-Datei wird nicht mehr ausgewertet und darf gelöscht werden.

- Das **FFG (Gate 1)** gatet überall, wo das Kern-Plugin installiert ist. Opt-out `NC_FFG=off`.
- Der **Session-Start-Zwang (Gate 2)** injiziert in jeder Session den Pflicht-Einstieg samt
  lebendem Stand und lehnt schreibende Aktionen ab, bis `/nc:start` per Fakten-Stempel
  abgeschlossen ist. Lesen, Fragen und Read-only-Git bleiben frei. Opt-out
  `NC_START_GATE=off` (ein Schalter für Injektion und Gate).
- Der **Doks-Autosync** hält den Firmen-Block der globalen `CLAUDE.md` aktuell und lässt die
  Privat-Zone außerhalb der Marker unberührt. Opt-out `NC_AUTOSYNC=off`.

Alle drei sind fail-open: ein interner Fehler blockiert nie die Arbeit.

---

## 8. Was diese Datei NICHT ist

- **Keine** fachlichen Use-Case-Werte — diese liegen im jeweiligen Arbeits-Repo.
- **Kein** Rollen- oder Rechte-Konzept (bewusst offen, siehe Design-Spec im OS-Repo).
  Rollen-spezifische Skills können später über Module oder eigene Abteilungen kommen.
- **Keine** stack-spezifischen Anweisungen im Kern (stack-agnostisch). Stack-Module folgen in
  späteren Iterationen; abteilungsspezifische Regeln stehen in der `workflow.md` der Abteilung.
- **Keine** Anweisung, die höher steht als eine **direkte User-Anweisung** — bei Konflikt gewinnt
  der User. Diese Datei ist Referenz, keine Autorität.

---

## 9. Meta-Regeln

- **Eigener Worktree je Arbeitseinheit.** In einem aktiven Arbeits-Repo wird in einem eigenen
  Worktree gearbeitet; er wird nach der finalen PR (Merge-Bereitschaft durch den Menschen)
  aufgeräumt.
- **Nie direkt auf `main` pushen** — auch nicht ins OS-Repo selbst: immer Branch → Pull
  Request → Review → Merge (präzisiert die Rote Linie aus §6).
- **Queue-Skills nur nach Tracker/Fälligkeit, nie spontan.** `/nc:queue-abteilung` und
  `/nc:queue-kern` laufen ausschließlich nach der dokumentierten Fälligkeit (Standardprozess
  `queue-flow.md` im OS-Repo) — einzige Ausnahme ist ein expliziter, direkter Nutzerauftrag
  an genau diesen Skill.

## 10. Multi-Agent-Ruleset

1. **Overseer und Planer:** Jeder Workflow am NovaCore-OS wird von einem mindestens
   **Opus**-Agenten (Basic Seat) oder einem **Fable**-Agenten (Premium Seat) geführt. Der
   Overseer konzipiert die Beauftragung nötiger Subagenten, schreibt deren Bau- und
   Handlungspläne und reviewt deren Ergebnisse persönlich; er gibt Feedback zur
   Neuiteration. **Nur er** führt userbeauftragte Commits/Pushes aus.
   - Bei infrastrukturkritischen Aktionen am OS — *cross-cutting infrastructure work*,
     *distributed infrastructure work* oder *Shotgun-Surgeries* — führt der Overseer Planung
     **und** Durchführung selbst durch. Nur **Bulk-Work** darf innerhalb eines solchen
     Workflows beaufsichtigt delegiert werden, zur Schonung des Usage-Limits.
2. **Reguläre Dev-Work** — isolierte Changes, lineare Workflows, prozessstandardisierte
   Arbeit — wird nach Overseer-Planung an **Opus**-Agenten ausgelagert.
3. **Aktualisierende Plugin-Maintenance** (Pfade, Links, Versionsnummern via den
   Aktualisierungs-Index) bündelt entweder am Ende eines Workflows oder einer PR final ein
   **Sonnet**-Agent.

**Merke:** Vor jeder Delegation prüfen, ob der Agent für die Art der Arbeit geeignet und in
der Lage ist. Opus ist die Baseline der operativen Arbeit unter dem Overseer.

---

*Globale Anweisung des NovaCore-OS · Methodik/Conventions/Safety · Source of Truth für fachliche
Inhalte bleibt stets das jeweilige Arbeits-Repo.*
