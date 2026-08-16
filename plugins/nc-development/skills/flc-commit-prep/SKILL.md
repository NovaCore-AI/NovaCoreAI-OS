---
name: flc-commit-prep
description: >-
  Führt die Pre-Commit-Routine aus, bevor Änderungen committet werden: sichtet Status und Diff,
  hält nicht zum Task gehörende Änderungen heraus, lässt die im Repo definierten Formatter-,
  Linter- und Test-Befehle laufen, prüft den Diff auf hartkodierte Secrets und schlägt eine
  Commit-Message im Conventional-Commits-Format vor. Committet erst nach Bestätigung und
  pusht nie automatisch.
  Trigger-Begriffe: „committen", „Commit vorbereiten", „Quality-Gate vor dem Commit",
  „Lint und Tests vor dem Commit", „Commit-Message vorschlagen".
---

# /nc-development:flc-commit-prep — Commit vorbereiten

## Zweck

WP4 „Quality-Gate" aus der `workflow.md` dieser Abteilung: Automatisiert die Routinearbeit vor
einem Commit und sorgt für gleichmäßige, aussagekräftige Commit-Messages. Der Skill ist das
letzte Netz vor dem Festschreiben — ein roter Zustand wird hier sichtbar, nicht erst im Review
(WP6) oder in der QS (WP7).

## Ablauf

1. **Änderungen sichten:** `git status` und `git diff` ausführen und zusammenfassen, was sich
   geändert hat. Nicht zum Task gehörende Änderungen ausdrücklich benennen und aus dem Commit
   heraushalten.
2. **Checks ausführen:** Die im Repo definierten Checks in dieser Reihenfolge laufen lassen,
   sofern vorhanden: **Formatter → Linter → Tests**. Die konkreten Befehle aus `package.json`,
   `Makefile` oder vergleichbarer Projekt-Konfiguration ermitteln — **nichts erfinden**.
3. **Roten Zustand behandeln:** Schlägt ein Check fehl, den Fehler beheben oder melden. Nicht
   mit rotem Zustand committen und keinen Check überspringen.
4. **Secrets-Check:** Den Diff auf hartkodierte Secrets prüfen (API-Keys, Passwörter, Tokens,
   Zugangsdaten in Konfigurationsdateien). Fund → **STOPP** und melden, bevor irgendetwas
   festgeschrieben wird.
5. **Commit-Message vorschlagen:** Format `<typ>: <beschreibung>` mit einem Typ aus `feat`,
   `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`. Ein optionaler Body erklärt das
   **Warum**, nicht das Was. Entwurfssprache nach `nc-sync.md` §6 des Kern-Plugins `nc`.
6. **Freigabe einholen:** Vorschlag zeigen und erst nach Bestätigung committen.
7. **Übergabe:** Ist der Slice fertig, auf `/nc-development:flc-pr` (WP5) verweisen.

## Regeln

- **Niemals `--no-verify` verwenden** und keinen Check überspringen — auch nicht „nur diesmal".
- **Ein Commit = eine zusammengehörige Änderung.** Vermischtes wird aufgeteilt, nicht
  zusammengefasst.
- **Kein automatischer Push.** Der Skill endet beim Commit; Push und PR sind
  `/nc-development:flc-pr` vorbehalten und brauchen dort eine eigene Freigabe.
- **Rote Linie:** Kein Commit ohne ausdrückliche Bestätigung des Nutzers, kein Merge, kein
  Release.
- Gefundene Secrets werden gemeldet, **nicht** stillschweigend aus dem Diff entfernt — ein
  bereits geschriebenes Secret muss der Mensch bewerten und gegebenenfalls rotieren.

## Verifikation

- `git status` und der zusammengefasste Diff liegen im Chat vor; fremde Änderungen sind benannt
  und ausgeschlossen.
- Für Formatter, Linter und Tests ist je der **tatsächlich ausgeführte Befehl** samt Ergebnis
  genannt; alle laufen grün oder das Fehlschlagen ist explizit gemeldet.
- Das Ergebnis des Secrets-Checks ist ausgesprochen („kein Fund" oder konkrete Fundstelle).
- Die vorgeschlagene Commit-Message entspricht dem Format `<typ>: <beschreibung>` mit einem der
  zugelassenen Typen.
- Nach Bestätigung zeigt `git log -1 --oneline` den erzeugten Commit; `git status` ist sauber
  bis auf bewusst zurückgehaltene Änderungen.
