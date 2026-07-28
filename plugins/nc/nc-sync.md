# nc-sync — Globale Agenten-Anweisung (NovaCore-OS)

> **Was diese Datei ist:** Die **gemeinsame, höchste Instruktion** für alle Agenten, die mit dem
> NovaCore-OS arbeiten. Sie wird mit dem Kern-Plugin `nc` ausgeliefert und gilt in **jeder
> Session**, in jedem Arbeits-Repo, **unabhängig von der CLI** (Claude Code, Kimi Code CLI,
> Codex CLI — die Dateinamen `CLAUDE.md` / `AGENTS.md` sind Synonyme). Source of Truth für
> **Methodik, Conventions, Safety** — nicht für fachliche Use-Case-Inhalte (die liegen im
> jeweiligen Arbeits-Repo). **Sprache aller Artefakte: Deutsch.**
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

### 3.1 Arbeits-Repo (mit `.nc-os`-Marker)

```
<repo-root>/
├── .nc-os                  # Marker-DATEI — schaltet die Begrüßung des SessionStart-Hooks frei
├── .nc/                    # lokales nc-Memory (in .gitignore, nie committen)
│   └── erinnerung/
│       ├── stand.md        # konsolidierter Gesamtstand
│       └── journal/<YYYY-MM-DD>.md   # append-only Tagesprotokoll
├── CLAUDE.md / AGENTS.md   # repo-eigene Anweisung (fachliche Source of Truth)
└── <Projekt-Code/Doku>
```

### 3.2 OS-Repo (NovaCoreAI-OS selbst)

Die Repo-Wurzel ist **Marketplace-Wurzel**, kein Plugin. Jedes Plugin liegt unter `plugins/`:

```
NovaCoreAI-OS/
├── .claude-plugin/marketplace.json     # Marketplace "novacore-os", Einträge OHNE version-Feld
├── plugins/nc/                         # Kern-Plugin: ständige Abteilung "gemeinsam"
│   ├── .claude-plugin/plugin.json      #   Leitversion des Produkts, KEINE dependencies
│   ├── skills/<name>/SKILL.md          #   start, save-session, journal
│   ├── hooks/                          #   FFG + SessionStart — Hooks liegen NUR im Kern
│   ├── tests/*.test.mjs                #   Hook-Tests + Struktur-Invarianten
│   ├── wp-rahmen.md                    #   Pflicht-Zyklus WP0–WP8 (normativ)
│   ├── module-registry.json            #   Metadaten-SSOT Abteilung → Plugin → Module → Skills
│   ├── referenz/skill-authoring.md     #   verbindliche SKILL.md-Formatregeln
│   └── nc-sync.md                      #   diese Datei
├── plugins/nc-development/             # Abteilungsplugin, dependencies ["nc"]
│   ├── workflow.md                     #   WP1–WP7 auf den NovaCore-Zyklus übersetzt
│   └── skills/<modul>-<name>/SKILL.md  #   flaches Layout, Module = Namenspräfixe
├── vorlagen/abteilungsplugin/          # Vorlage für weitere Abteilungen (kein Plugin)
└── knowledge-base/                     # Wissensbasis im OS-Repo: grundwissen,
                                        # standardprozesse, debugging-findings
```

**Version je Plugin genau an einer Stelle:** in dessen `plugin.json`. Marketplace-Einträge tragen
**kein** `version`-Feld — Claude Code nimmt ohne Warnung den Wert aus `plugin.json`.

### 3.3 Memory-Trennung (streng)

Kunden-/Projekt-Kontext liegt **ausschließlich** im Arbeits-Repo unter `.nc/` (in `.gitignore`).
**Nichts** davon ins OS-Repo. Das OS-Repo bleibt kontextfrei und stack-agnostisch. Das Journal ist
**append-only** — bestehende Einträge nie verändern oder löschen.

### 3.4 Neue Dateien am richtigen Ort

Vor dem Anlegen jeder neuen Datei die Projekt-/Modul-Convention prüfen und am **richtigen Ort**
ablegen. Kern-Skill → `plugins/nc/skills/<name>/SKILL.md`. Abteilungs-Skill →
`plugins/nc-<abteilung>/skills/<modul>-<name>/SKILL.md`. Hook → **ausschließlich**
`plugins/nc/hooks/`. Passt der Ort nicht → **widersprechen und korrigieren**, statt die Datei
einfach zu erzeugen. Schicht-, Plugin- und Modulgrenzen nicht durchbrechen; in ausgelieferten
Dateien **nie** über die Plugin-Grenze hinweg auf Pfade verweisen — auf Inhalte anderer Plugins
per Name, auf Repo-Dokumente nur als Quellenangabe.

---

## 4. CLI-Layer (welches Harness gilt)

| CLI | Standard? | Datei | Skill-Mechanik |
|---|:--:|---|---|
| **Claude Code** | ja (Default-Harness) | `CLAUDE.md` | echtes Plugin-System: Plugin-Familie aus einem Marketplace, Namespaces `nc:` und `nc-development:` |
| **Kimi Code CLI** | sanktionierte Variante | `AGENTS.md` | Copy-Deploy **geplant (Iteration 2), noch nicht implementiert** |
| **Codex CLI** | sanktionierte Variante | `AGENTS.md` | Text-Guidance (kein Tool-Hook-Enforcement) |

`CLAUDE.md` und `AGENTS.md` sind in diesem OS **Synonyme** und bezeichnen dieselbe repo-lokale
Agenten-Anweisung. **Diese `nc-sync.md` gilt identisch in allen drei CLIs.** Implementiert ist
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

1. **Session-Start (WP0):** `/nc:start` — lädt Stand (`.nc/erinnerung/stand.md`), letztes Journal,
   Git-Lage und Werkzeuglage. **Kein Blind-Start.**
2. **Feature-Arbeit (WP1–WP5):** `/nc-development:flc-feature-start` → `/nc-development:flc-plan`
   → implementieren → `/nc-development:flc-commit-prep` → `/nc-development:flc-pr`.
3. **Review (WP6):** `/nc-development:fe-review` für Frontend-Diffs,
   `/nc-development:be-review` für Backend-Diffs — der Agent entwirft die Befunde, der Mensch
   postet und entscheidet.
4. **Jederzeit:** `/nc:journal` — einzelne Entscheidungen, Funde und Blocker sofort festhalten,
   statt sie bis zum Sitzungsende zu sammeln.
5. **Session-Ende (WP8):** `/nc:save-session` — append-only ins Journal, Stand konsolidieren,
   Übergabe schreiben.

---

## 6. Verbindliche Regeln

- **Sprache:** Alle Artefakte (Commits, Pull Requests, Doku, Journal) auf Deutsch.
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
  **markerlos aktiv** — überall dort, wo das Kern-Plugin installiert ist, unabhängig von der
  `.nc-os`-Datei. **Opt-out ausschließlich per Env `NC_FFG=off`**, gesetzt vom Menschen, nie vom
  Agenten. Auf CLIs ohne Gate-Enforcement gilt dieselbe Disziplin manuell.
- **Branching:** Feature-Branch → Pull Request → Review → Merge. **Kein direkter Push auf
  `main`.** `main` bleibt lauffähig. Der Merge ist eine rote Linie: der Mensch führt ihn aus.
- **Memory:** Kundenkontext bleibt im Arbeits-Repo unter `.nc/` (in `.gitignore`); nichts davon
  ins OS-Repo.
- **Fehlender Kontext:** Nachfragen statt raten; im Zweifel auf `/nc:start` zurückgreifen.
- **Journal:** Append-only — bestehende Einträge nie verändern oder löschen.
- **Secrets:** Keine Secrets/Tokens/Passwörter in Code, Logs, Commits oder Konversation. Im
  Zweifel: Platzhalter plus Umgebungsvariable.
- **Eigene Fehler protokollieren:** Jeder selbst verursachte Fehler wandert append-only ins
  Fehlerprotokoll (`agent-learnings.md` der Wissensbasis des OS-Repos, sonst nach Konvention des
  Arbeits-Repos) — sofort, nicht am Ende.

---

## 7. Namespace & Koexistenz

Kern-Skills laufen unter `/nc:`, Abteilungs-Skills unter dem Namespace ihres Plugins
(`/nc-development:`). Der Namespace ist der **Name des Marketplace-Eintrags** und nicht frei
wählbar. Die Familie ist kollisionsfrei zu anderen installierten Plugin-Familien; deren Dateien
werden **nie** verändert.

Zum Repo-Scoping gelten zwei verschiedene Regeln — bewusst:

- Die **SessionStart-Begrüßung** greift nur, wenn im Repo-Root die **Datei** `.nc-os` liegt. Ein
  gleichnamiges *Verzeichnis* zählt nicht (bekannter Bug aus 0.1.1, seither per isFile-Prüfung
  abgedeckt). Außerhalb markierter Repos ist die Begrüßung ein No-op — sie ist Komfort, kein Gate.
- Das **FFG ist markerlos** und gatet überall, wo das Kern-Plugin installiert ist. Ein
  unmarkiertes Repo war früher ein ungeschütztes Repo; genau dieses Schlupfloch ist geschlossen.

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

*Globale Anweisung des NovaCore-OS · Methodik/Conventions/Safety · Source of Truth für fachliche
Inhalte bleibt stets das jeweilige Arbeits-Repo.*
