# nc-sync — Globale Agenten-Anweisung (NovaCoreAI-OS)

> **Was diese Datei ist:** Die **gemeinsame, höchste Instruktion** für alle Agenten in Repos mit
> `.nc-os`-Marker. Gilt in **jeder Session**, in jedem Arbeits-Repo, **unabhängig von CLI** (Claude
> Code, Kimi Code CLI, Codex CLI — die Dateinamen `CLAUDE.md` / `AGENTS.md` sind Synonyme). Source of
> Truth für **Methodik, Conventions, Safety** — nicht für fachliche Use-Case-Inhalte (die liegen im
> jeweiligen Arbeits-Repo). **Sprache aller Artefakte: Deutsch.**
> **Pflege:** Lucas Vöhringer · **Version:** siehe `VERSION`.

---

## 1. Verhaltens-Defaults (gelten immer, vor allem anderen)

Vier Prinzipien, abgeleitet aus Karpathys Beobachtungen zu LLM-Coding-Pitfalls. Sie sind **Defaults**,
kein Dogma — bei Trivialia (Tippfehler, offensichtliche Einzeiler) Maß halten.

1. **Erst denken, dann coden.** Annahmen aussprechen, nicht verstecken. Bei mehreren Interpretationen
   diese **vorstellen**, nicht schweigend eine wählen. Wenn ein einfacherer Weg existiert: sagen und
   dagegen halten. Unklarheit = stoppen, benennen, fragen.
2. **Einfachheit zuerst.** Minimaler Code, der das Problem löst. Nichts Spekulatives — keine Features
   jenseits des Auftrags, keine Abstraktionen für Einmal-Verwendung, keine unerbetene Konfigurierbarkeit,
   kein Error-Handling für unmögliche Szenarien. Faustregel: 200 Zeilen, die 50 sein könnten → neu
   schreiben. Maß: *„Würde ein erfahrener Engineer das als überkompliziert ansehen?"*
3. **Chirurgische Änderungen.** Nur anfassen, was der Task verlangt. Kein adjacent-Refactor, kein
   Umformatieren, kein „Verbessern" funktionierenden Codes. **Lokalen Stil matchen**, auch wenn man es
   selbst anders machen würde. Bemerkter fremder Dead Code: **nennen, nicht löschen**, es sei denn, er
   stammt aus der eigenen Änderung. Test: jede veränderte Zeile muss direkt zum Auftrag zurückverfolgbar
   sein.
4. **Zielgetriebene Ausführung.** Aufgaben in **verifizierbare** Ziele übersetzen — nicht „mach es
   kaputt", sondern „schreib einen Test, der den Bug reproduziert, dann mach ihn grün". Bei Mehrschritt-
   Tasks: kurzen Plan mit Verify-Schritt pro Phase angeben. Starke Erfolgskriterien ermöglichen
   autonomes Loopen; schwache („mach, dass es geht") erzwingen Rückfragen.

---

## 2. Methoden

### 2.1 Fakten aus der Quelle, nie aus dem Gedächtnis
Fachliche Fakten (Schwellenwerte, Datenmodelle, API-Verträge, Geschäftlogik) stammen **ausschließlich**
aus dem jeweiligen Arbeits-Repo (`CLAUDE.md`/`AGENTS.md` des Repos, Projekt-Doku, echter Quellcode).
Selbst generierte Zahlen/Regeln als **KI-Vorschlag** kennzeichnen und gegen die Quelle plausibilisieren.
Bei Widerspruch Gedächtnis vs. Quelle gewinnt **die Quelle**. Quelle nicht auffindbar → **STOPP**, sagen,
fragen — nicht raten.

### 2.2 Test-First auf kritischem Pfad
Für **kritischen Pfad** (Geldfluss, Auth, Datenschutz/Sicherheit, externe Verträge) gilt **TDD**:
RED → GREEN → REFACTOR. Ziel ≥ 80 % Coverage für diese Pfade (**Default**; das Repo kann eine abweichende
Grenze festlegen — z. B. höhere für Geldfluss, niedrigere für reine UI). Triviale/UI-Code ohne Geld-/
Sicherheitsbezug nicht künstlich mit Tests erstickt. Ein Test, der nicht scheitert, wenn sich die Logik
ändert, ist **schwach** — Tests prüfen **Absicht**, nicht nur Verhalten.

### 2.3 Definition of Done (DoD)
Code gilt erst als „fertig", wenn **alle** Punkte erfüllt:
- Lint/Format sauber (projekt-eigene Tools) · Tests grün (kritischer Pfad ≥ 80 %) · kein Secret im Diff
- PR beschrieben, mit Anforderungs-/Ticket-Referenz · Eigen-Review des Diffs durchgeführt
- Review bestanden · in `main` gemergt (`main` bleibt lauffähig) · Entscheidung im Entscheidungslog
  (sobald Modul `architecture` aktiv; bis dahin im PR bzw. `.nc/`-Journal dokumentiert)

Wird ein Schritt übersprungen, ist das ein Grund einzugreifen — mit einer Zeile Begründung, dann den
Schritt nachholen.

### 2.4 Review-Pflicht
**Verstehen vor Freigabe.** Jeder nicht-triviale Change geht durch Review (Self-Review des Diffs vor dem
PR, Fremd-Review im PR). Der Agent entwirft, der **Mensch liest, hinterfragt, verantwortet**. Bei
kritischem Pfad: adversarielles Dual-Review empfohlen.

### 2.5 Fehlerkultur
Behauptungen nur mit Beweis (grüner Test, Command-Output, beobachtetes Verhalten). „Funktioniert" ohne
Beweis = unbegründet. Bei Unsicherheit: offen sagen, nicht beschönigen.

---

## 3. Pfade & Struktur

### 3.1 Arbeits-Repo (mit `.nc-os`-Marker)
```
<repo-root>/
├── .nc-os                  # Marker — aktiviert nc-Hooks & Begrüßung
├── .nc/                    # lokales nc-Memory (in .gitignore, nie committen)
│   └── erinnerung/
│       ├── stand.md        # konsolidierter Gesamtstand
│       └── journal/<YYYY-MM-DD>.md   # append-only Tagesprotokoll
├── CLAUDE.md / AGENTS.md   # repo-eigene Anweisung (fachliche Source of Truth)
└── <Projekt-Code/Doku>
```

### 3.2 OS-Repo (NovaCoreAI-OS selbst)
```
NovaCoreAI-OS/
├── nc-sync.md              # diese Datei (Methodik/Conventions, CLI-agnostisch)
├── skills/<name>/SKILL.md  # Core-Skills, je Skill ein Ordner
├── modules/<modul>/        # eigenständige Module (Skills/Hooks/Agents)
│   └── module-registry.json
├── hooks/*.js              # SessionStart, Safety-Gate
└── .claude-plugin/         # Claude-Code-Plugin-Manifest
```

### 3.3 Memory-Trennung (streng)
Kunden-/Projekt-Kontext liegt **ausschließlich** im Arbeits-Repo unter `.nc/` (in `.gitignore`).
**Nichts** davon ins OS-Repo. Das OS-Repo bleibt kontextfrei undstack-agnostisch. Journal ist
**append-only** — bestehende Einträge nie verändern oder löschen.

### 3.4 Neue Dateien am richtigen Ort
Vor dem Anlegen jeder neuen Datei: Projekt-/Modul-Convention präfen und am **richtigen Ort** ablegen.
Skill zu einem Modul → `modules/<modul>/skills/`. Core-Skill → `skills/`. Hook → `hooks/`. Passt der
Ort nicht → **widersprechen und korrigieren**, statt die Datei einfach erzeugen. Schicht-/Modulgrenzen
nicht durchbrechen.

---

## 4. CLI-Layer (welches Harness gilt)

| CLI | Standard? | Datei | Skill-Mechanik |
|---|:--:|---|---|
| **Claude Code** | ja (Default-Harness) | `CLAUDE.md` | echtes Plugin-System, Namespace `nc:` |
| **Kimi Code CLI** | sanktionierte Variante | `AGENTS.md` | Copy-Deploy nach `~/.kimi-code/skills/` |
| **Codex CLI** | sanktionierte Variante | `AGENTS.md` | Text-Guidance (kein Tool-Hook-Enforcement) |

`CLAUDE.md` und `AGENTS.md` sind in diesem OS **Synonyme** und bezeichnen dieselbe repo-lokale
Agenten-Anweisung. **Diese `nc-sync.md` gilt identisch in allen drei CLIs.** Achtung: in **v0.1.0** ist
nur das **Claude-Code-Plugin** implementiert (Spec §11). Kimi-/Codex-Support (Copy-Deploy +
Datei-Mapping auf den CLI-Namen) ist **Iteration 2, noch nicht implementiert** — bis dahin gilt dort
nur die Text-Guidance aus dieser Datei, ohne Plugin/Hook-Enforcement.

> **Ehrlichkeit zum Hook-Status:** Das Safety-Gate läuft auf Claude Code und Kimi Code (PreToolUse
> blockbar). Auf Codex CLI gibt es **kein Tool-Hook-Enforcement** — dort gilt nur die Text-Guidance aus
> dieser Datei. Bis Hooks dort verfügbar sind, trägt die Durchsetzung der **Mensch** (Review) +
> serverseitige Branch Protection.

---

## 5. Arbeitsweise (Session-Zyklus)

1. **Session-Start:** `/nc:start` — lädt Stand (`.nc/erinnerung/stand.md`), letztes Journal und
   Git-Status. **Kein Blind-Start.**
2. **Feature-Arbeit:** `/nc:flc-feature-start` → `/nc:flc-plan` → implementieren → `/nc:flc-commit-prep` → `/nc:flc-pr`.
3. **Session-Ende:** `/nc:save-session` — append-only ins Journal, Stand konsolidieren, Entscheidungen
   ins Log.

---

## 6. Verbindliche Regeln

- **Sprache:** Alle Artefakte (Commits, PRs, Doku, Journal) auf Deutsch.
- **Safety:** Keine automatischen Pushes, Merges, Posts oder Deployments ohne **explizite
  Nutzerfreigabe**. Vor destruktiven Befehlen (`git push --force`, `git reset --hard`, `git clean -fd`,
  `rm -rf`, `DROP TABLE`, `deploy`, `terraform destroy`) **Fakten nennen** — das Safety-Gate erzwingt
  dies. Auf CLIs ohne Gate-Enforcement: manuell dieselbe Disziplin.
- **Branching:** Feature-Branch → PR → Review → Merge. **Kein direkter Push auf `main`.** `main` bleibt
  lauffähig.
- **Memory:** Kundenkontext bleibt im Arbeits-Repo unter `.nc/` (in `.gitignore`); nichts davon ins
  OS-Repo.
- **Fehlender Kontext:** Nachfragen statt raten; im Zweifel auf `/nc:start` zurückgreifen.
- **Journal:** Append-only — bestehende Einträge nie verändern oder löschen.
- **Secrets:** Keine Secrets/Tokens/Passwörter in Code, Logs, Commits oder Konversation. Im Zweifel:
  Platzhalter + Umgebungsvariable.

---

## 7. Namespace & Koexistenz

Alle Skills dieses Team-OS laufen unter dem Namespace `nc:`. **Kollisionsfrei** zu `uni:` und `ecc:`;
deren Dateien werden **nie** verändert. Repo-Scoping: Hooks und SessionStart-Begrüßung greifen nur, wenn
im aktuellen Repo eine Datei `.nc-os` existiert. Außerhalb markierter Repos sind alle nc-Hooks **no-op**.

---

## 8. Was diese Datei NICHT ist

- **Keine** fachlichen Use-Case-Werte — diese liegen im jeweiligen Arbeits-Repo.
- **Kein** Rollen-Konzept im MVP (bewusst offen, siehe Design-Spec §13.1). Rollen-spezifische Skills
  können später über Module kommen.
- **Keine** stack-spezifischen Anweisungen im Core (stack-agnostisch, siehe Design-Spec §1.3).
  Stack-Module (TypeScript/Node, Python/FastAPI) folgen in späteren Iterationen.
- **Keine** Anweisung, die höher steht als eine **direkte User-Anweisung** — bei Konflikt gewinnt der
  User. Diese Datei ist Referenz, keine Autorität.

---

*Globale Anweisung des NovaCoreAI-OS · Methodik/Conventions/Safety · Source of Truth für fachliche
Inhalte bleibt stets das jeweilige Arbeits-Repo.*
