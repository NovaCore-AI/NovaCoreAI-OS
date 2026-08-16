---
name: fe-review
description: >-
  Reviewt einen Frontend-Diff entlang vier fester Dimensionen — Semantik und Zugänglichkeit
  (Tastaturbedienbarkeit, Fokus-Zustände, Kontrast, reduced motion), Web-Vitals-Risiken
  (Layout-Shift, Bundle-Wachstum, Bildgrößen, render-blockierende Ressourcen), Design-Qualität
  (hover, focus und active designt, Hierarchie statt Einheitsbrei) und Komponenten-Hygiene
  (explizite Props-Verträge, kein duplizierter Server-State, Ableitung statt Redundanz).
  Liefert Befunde als CRITICAL, HIGH, MEDIUM oder LOW mit Datei und Zeile sowie einen
  Review-Kommentar als Entwurf; der Mensch postet, approved und resolved.
  Trigger-Begriffe: „Frontend-Review", „UI-Diff prüfen", „Komponente reviewen",
  „Zugänglichkeit prüfen", „Web Vitals im Diff".
---

# /nc-development:fe-review — Frontend-Diff-Review

## Zweck

WP6 „Review" aus der `workflow.md` dieser Abteilung, Modul `fe`: prüft einen Frontend-Diff —
eigenen vor dem PR oder fremden im PR — auf Zugänglichkeit, Web-Vitals-Risiken,
Design-Qualität und Komponenten-Hygiene. Der Skill bringt die Prüfung in eine feste Reihenfolge,
damit nicht nur das auffällt, was zuerst ins Auge springt. Er **bewertet**; die Entscheidung
über den PR bleibt beim Menschen.

## Ablauf

1. **Diff erfassen:** Geänderte Dateien und den vollständigen Diff bestimmen (`git diff` gegen
   den Basis-Branch bzw. den PR-Diff). Umfang benennen: Anzahl Dateien, betroffene Komponenten.
   Ohne gelesenen Diff wird nicht reviewt.
2. **Dimension 1 — Semantik und Zugänglichkeit:** semantische Elemente statt generischer
   Container; **Tastaturbedienbarkeit** jedes interaktiven Elements; sichtbare **Fokus-Zustände**;
   ausreichender **Kontrast**; Beschriftungen für Bedienelemente; Verhalten bei **reduced
   motion**.
3. **Dimension 2 — Web-Vitals-Risiken:** **Layout-Shift** durch nachgeladene oder
   dimensionslose Inhalte; **Bundle-Wachstum** durch neue Abhängigkeiten oder statische Importe
   schwerer Bibliotheken; **Bildgrößen und fehlende Dimensionsangaben**;
   **render-blockierende Ressourcen**.
4. **Dimension 3 — Design-Qualität:** sind **hover, focus und active** bewusst gestaltet oder
   Default; entsteht **Hierarchie** durch Kontrast in Größe, Gewicht und Abstand — oder ist
   alles gleich betont; passen Abstände und Zustände zum bestehenden System.
5. **Dimension 4 — Komponenten-Hygiene:** **Props-Verträge explizit** (Typen, Pflicht/Optional,
   keine impliziten Objekt-Durchreichungen); **kein Server-State in Client-Stores dupliziert**;
   **abgeleitete Werte werden abgeleitet**, nicht redundant gespeichert; Zuständigkeiten der
   Komponente klar geschnitten.
6. **Befunde einordnen:** Jeden Befund mit **Severity** und **Fundstelle** `Datei:Zeile`
   festhalten:
   - **CRITICAL** — blockiert: Bedienung für Tastatur- oder Screenreader-Nutzung unmöglich,
     Datenverlust, offensichtlicher Sicherheits- oder Korrektheitsbruch.
   - **HIGH** — sollte vor dem Merge behoben werden: klarer Fehler oder deutliche Regression.
   - **MEDIUM** — Wartbarkeit oder Risiko, das absehbar teuer wird.
   - **LOW** — Hinweis, optional.
7. **Review-Kommentar entwerfen:** Befunde nach Severity gruppieren, je Befund Fundstelle,
   Begründung und konkreten Änderungsvorschlag nennen. Den Entwurf ausgeben und ausdrücklich
   als **Entwurf** kennzeichnen. Entwurfssprache nach `nc-sync.md` §6 des Kern-Plugins `nc`.
8. **Übergabe:** Auf die menschliche Entscheidung hinweisen (posten, approven, resolven) und
   auf `/nc:journal` für festzuhaltende Entscheidungen verweisen.

## Regeln

- **Rote Linie: der Skill approved nie, resolved nie und postet nie selbst.** Er liefert einen
  Entwurf; Posten und Freigabe sind menschliche Handlungen.
- **Review-Kette (Rollen):** Implementierer ≠ Reviewer — geprüft wird von einem zweiten Dev
  oder durch dieses Agenten-Review; **abgenommen und gemergt wird von der Rolle
  Maintainer/Admin**. Ein Eigen-Review ersetzt die Fremdprüfung nicht, es geht ihr voraus.
- **Kein Befund ohne Beleg.** Jeder Befund nennt `Datei:Zeile` aus dem tatsächlich gelesenen
  Diff. Vermutungen über nicht gelesene Dateien werden als offene Frage formuliert, nicht als
  Befund.
- **Keine Stil-Nörgelei ohne Regelbezug.** Ein Befund braucht eine Regel, eine Konvention des
  Arbeits-Repos oder eine belegbare Auswirkung; „gefällt mir nicht" ist kein Befund.
- **Severity wird nicht inflationiert.** CRITICAL ist blockierend und entsprechend selten;
  fehlt der Nachweis für die Schwere, sinkt die Einstufung.
- **Der Skill ändert keinen Code** — er reviewt. Fixes gehören in einen eigenen Durchlauf über
  `/nc-development:flc-commit-prep`.
- **Rote Linie:** kein Merge, kein Push, kein Deployment aus diesem Skill heraus.

## Verifikation

- Der geprüfte Diff ist benannt (Basis, Anzahl Dateien) und die vier Dimensionen sind
  **einzeln** abgehandelt — auch die ohne Befund („keine Befunde" ist ein Ergebnis).
- **Jeder Befund trägt Severity und Fundstelle** `Datei:Zeile`; kein Befund ohne beides.
- Zu jedem Befund liegt ein konkreter Änderungsvorschlag vor, nicht nur eine Beanstandung.
- Der Review-Kommentar liegt als **Entwurf** im Chat und ist als solcher gekennzeichnet.
- Im Review-Werkzeug wurde **keine** Aktion ausgeführt: kein Kommentar gepostet, nichts
  approved, nichts resolved.
