---
name: doku-sync
description: >-
  Führt vor einem Commit den übergreifenden Doku-Workflow aus — prüft zuerst auf
  Redundanzen, zieht die lebende Doku nach der Sync-Matrix der AGENTS.md nach (AGENTS.md,
  README, ONBOARDING, Glossar, Registry, SSOT-Index), stellt den signierten
  CHANGELOG-Eintrag unter [Unreleased] sicher, prüft den Versions-Gleichstand (Bump und Tag
  nur bei Release-Entscheid) und schreibt abschließend den Prüfstempel für den künftigen
  Pre-Commit-Hook. Trigger-Begriffe: „Doku nachziehen", „Doku-Sync", „CHANGELOG-Eintrag",
  „Version bumpen", „Release-Tag", „Abschluss-Checkliste".
---

# /nc:doku-sync — Lebende Doku nachziehen & Commit-Reife herstellen

## Zweck

Infrapflege-Skill der ständigen Abteilung `gemeinsam` (Kern-Plugin `nc`). Er macht die
**Abschluss-Checkliste aus `AGENTS.md`** (Standardzyklus, Punkt 5) ausführbar: Nach
inhaltlicher Arbeit und **vor jedem Commit** zieht er die lebende Doku nach, sichert den
CHANGELOG-Eintrag, prüft die Versionslogik und stellt die Commit-Reife her — bezeugt durch
einen Prüfstempel für einen **künftigen** Pre-Commit-Hook (noch nicht verdrahtet); bis dahin
tragen Mensch und Review die Durchsetzung.

## Ablauf

1. Änderungsumfang erfassen: `git status --short` und `git diff --stat` — welche Dateien,
   Pfade und Themen sind betroffen?
2. **Redundanz-Vorprüfung:** Vor jedem Schreiben per Grep prüfen, ob die Ziel-Doku die
   Information bereits enthält — Bestehendes konsolidieren statt doppeln. Keine neuen
   Spiegelstellen für Zahlen erfinden.
3. **Sync-Matrix abarbeiten** (normiert in `AGENTS.md`, Abschnitt „Pflegeprozess"): je
   Änderungstyp die betroffenen lebenden Dokumente nachziehen; danach per Grep nach
   Altpfaden/Altbegriffen über das ganze Repo verifizieren, dass keine Live-Verweise
   zurückbleiben (historische Dokumente ausgenommen). Im OS-Repo führt die
   **Änderungs-Matrix des Aktualisierungs-Index** den vollständigen Umfang je Änderungsart
   (`knowledge-base/standardprozesse/aktualisierungs-index.md`, Abschnitt 2 und 5); sonst
   gilt die Sync-Konvention des Arbeits-Repos.
4. **Wissensbasis-Index:** Im OS-Repo gilt zusätzlich — ist eine Datei unter
   `knowledge-base/` entstanden, gewandert oder verschwunden, wird der Master-Index
   `knowledge-base/SSOT-Document-Index.md` in **derselben** Änderung nachgezogen
   (Vollständigkeit und Linkgültigkeit sind testerzwungen). In anderen Arbeits-Repos gilt
   deren eigene Index-Konvention.
5. `CHANGELOG.md`: Eintrag unter `[Unreleased]` nach Keep-a-Changelog-Muster sicherstellen —
   Pflicht für jede integrierte Änderung, **mit Namenszeichnung des Agenten**.
6. **Versionslogik (je Plugin eine Version):** Die Version des betroffenen Plugins steht
   **ausschließlich** in dessen `plugins/<name>/.claude-plugin/plugin.json` — der
   Marketplace-Eintrag trägt **nie** ein `version`-Feld; beim Kern `nc` zusätzlich den
   Gleichstand mit `VERSION` und `plugins/nc/module-registry.json` prüfen. Nur bei
   **explizitem Release-Entscheid des Maintainers**: Bump nach Schema (Fix = Patch,
   Neuerung = Minor, Strukturbruch = Major), `[Unreleased]` in einen Versionsabschnitt
   überführen und den annotierten Tag nach Schema `{plugin-name}--v{version}` vorbereiten.
7. Bei Struktur-/Manifest-/Skill-Änderungen validieren — **beide Ebenen, nicht nur die
   Wurzel**: `claude plugin validate .` prüft ausschließlich das Marketplace-Manifest,
   `claude plugin validate plugins/<name> --strict` je berührtem Plugin prüft Manifest
   **und** Skills. Ein stilles „Validation passed" ist das Erfolgssignal.
   Skill-Änderungen zusätzlich gegen die Checkliste in `referenz/skill-authoring.md` des
   Kern-Plugins `nc` prüfen. Im OS-Repo danach die Testsuite ausführen:
   `node --test plugins/nc/tests/*.test.mjs` (Gate- **und** Struktur-Invarianten müssen grün
   sein); sonst gilt die Test-Konvention des Arbeits-Repos.
8. **Fehlerprotokoll-Check:** Sind alle eigenen Fehler dieser Session im Fehlerprotokoll
   eingetragen? Im OS-Repo ist das `knowledge-base/debugging-findings/agent-learnings.md`,
   sonst gilt die Konvention des Arbeits-Repos. Falls nein: nachholen.
9. **Prüfstempel schreiben** (nur nach vollständigem Durchlauf): gewünschten Stand stagen,
   dann `git write-tree`-Hash mit ISO-Datum nach `.git/nc/doku-sync.stamp` schreiben. Ein
   künftiger Pre-Commit-Hook wird den Stempel-Hash mit dem tatsächlich committeten Stand
   vergleichen.
10. Ergebnis an den Nutzer: nachgezogene Doks, CHANGELOG-Eintrag, Versions-/Tag-Status,
    Stempel-Bestätigung — als Grundlage für die Commit-Freigabe.

## Regeln

- **Der Agent committet, pusht und taggt nie selbst ohne explizite Freigabe des
  Maintainers** — dieser Skill stellt Commit-Reife her, mehr nicht.
- Version-Bump und Tag **nur bei explizitem Release-Entscheid** — laufende Arbeiten sammeln
  sich unter `[Unreleased]` (kein Bump = kein Auto-Update, das ist gewollt).
- **Historisch bleibt historisch:** CHANGELOG-Alteinträge, Spec-Alttext (Änderung nur per
  Nachtrag) und Findings werden **nie** rückwirkend umgeschrieben; nachgezogen wird
  ausschließlich lebende Doku.
- Der Prüfstempel wird **nie „auf Vorrat"** geschrieben — nur nach vollständigem Durchlauf;
  er liegt unter `.git/` und wird nie versioniert.
- Bei Widerspruch zwischen Doku und Platte gewinnt die Platte: realen Zustand verifizieren
  (Glob/Grep/`git status`), Doku korrigieren, Abweichung im Ergebnis melden —
  **nachfragen statt raten**, wenn die Intention unklar ist.

## Verifikation

- Grep nach den geänderten Altpfaden/Altbegriffen liefert **null** Treffer in lebender Doku
  (verbleibende Treffer sind benannte historische Dokumente).
- `CHANGELOG.md`-Diff zeigt den `[Unreleased]`-Eintrag inkl. Namenszeichnung.
- Die Version des betroffenen Plugins steht nur in dessen `plugin.json`; beim Kern sind
  `VERSION`, `plugin.json` und `module-registry.json` identisch (Werte im Ergebnis
  nebeneinander ausgewiesen), kein Marketplace-Eintrag trägt ein `version`-Feld.
- Bei Manifest-/Skill-Änderungen melden **beide** Ebenen „Validation passed":
  `claude plugin validate .` **und** `claude plugin validate plugins/<name> --strict`;
  im OS-Repo ist zusätzlich `node --test plugins/nc/tests/*.test.mjs` grün.
- `.git/nc/doku-sync.stamp` existiert und enthält den aktuellen `git write-tree`-Hash plus
  Datum.
