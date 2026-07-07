---
name: nc-commit-prep
description: Pre-Commit-Routine — Lint, Format und Tests prüfen, Diff reviewen und eine Commit-Message im Conventional-Commits-Format vorschlagen. Nutze diesen Skill, bevor Änderungen committet werden.
---

# /nc:commit-prep — Commit vorbereiten

## Zweck

Automatisiert die Routinearbeit vor einem Commit und sorgt für gleichmäßige,
aussagekräftige Commit-Messages.

## Ablauf

1. **Änderungen sichten:** `git status` und `git diff` ausführen; zusammenfassen, was sich geändert hat. Nicht zum Task gehörende Änderungen benennen und aus dem Commit heraushalten.
2. **Checks ausführen:** Die im Repo definierten Checks laufen lassen (in dieser Reihenfolge, sofern vorhanden): Formatter, Linter, Tests. Die konkreten Befehle aus `package.json`, `Makefile` o.ä. ermitteln — nichts erfinden.
   - Schlägt ein Check fehl → Fehler beheben oder melden; nicht mit rotem Zustand committen.
3. **Secrets-Check:** Diff auf hartkodierte Secrets (API-Keys, Passwörter, Tokens) prüfen. Fund → STOPP und melden.
4. **Commit-Message vorschlagen:** Format `<typ>: <beschreibung>` mit Typ aus `feat, fix, refactor, docs, test, chore, perf, ci`; optionaler Body erklärt das Warum.
5. **Freigabe einholen:** Erst nach Bestätigung committen. Kein automatischer Push.

## Regeln

- Niemals `--no-verify` verwenden oder Checks überspringen.
- Ein Commit = eine zusammengehörige Änderung.
