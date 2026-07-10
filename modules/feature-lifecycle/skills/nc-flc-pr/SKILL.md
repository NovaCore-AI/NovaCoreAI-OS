---
name: nc-flc-pr
description: "[FLC] Pull Request aus dem aktuellen Feature-Branch erstellen — Beschreibung aus der gesamten Commit-Historie, Push erst nach expliziter Freigabe. Nutze diesen Skill, wenn ein Slice oder Feature bereit für Review ist."
---

# /nc:flc-pr — Pull Request erstellen

## Zweck

Erstellt einen vollständigen, gut beschriebenen PR und wahrt dabei die
Sicherheitsregel: kein Push ohne explizite Freigabe.

## Ablauf

1. **Branch prüfen:** Aktueller Branch darf nicht `main` sein. Alle gewünschten Commits vorhanden? (`git log`, `git status` — keine vergessenen Änderungen).
2. **Gesamtdiff analysieren:** `git diff main...HEAD` und die komplette Commit-Historie des Branches betrachten — nicht nur den letzten Commit.
3. **PR-Beschreibung entwerfen:**
   - **Zusammenfassung:** Was ändert sich und warum (1–3 Sätze)
   - **Änderungen:** Stichpunkte der wesentlichen Änderungen
   - **Testplan:** Wie wurde getestet / wie kann der Reviewer testen
   - **Offene Punkte:** Bekannte Einschränkungen oder Folgearbeiten
4. **Freigabe einholen:** Entwurf zeigen. Erst nach explizitem „Ja" pushen (`git push -u origin <branch>`) und den PR anlegen (z.B. `gh pr create`).
5. **Ergebnis melden:** PR-URL nennen und nächsten Schritt empfehlen (Review anfordern).

## Regeln

- Kein Push, kein PR ohne explizite Nutzerfreigabe.
- Basis-Branch ist `main`, sofern nicht anders vereinbart.
- Feature-Branch → PR → Review → Merge; niemals direkt auf `main`.
