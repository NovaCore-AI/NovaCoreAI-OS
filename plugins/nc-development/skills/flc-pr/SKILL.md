---
name: flc-pr
description: >-
  Erstellt einen Pull Request aus dem aktuellen Feature-Branch: prüft, dass nicht auf `main`
  gearbeitet wird, analysiert den Gesamtdiff gegen `main` samt vollständiger Commit-Historie
  des Branches und entwirft eine PR-Beschreibung aus Zusammenfassung, Änderungen, Testplan und
  offenen Punkten. Push und PR-Anlage erfolgen erst nach expliziter Freigabe.
  Trigger-Begriffe: „Pull Request erstellen", „PR anlegen", „Slice zum Review geben",
  „Feature bereit für Review", „PR-Beschreibung entwerfen".
---

# /nc-development:flc-pr — Pull Request erstellen

## Zweck

WP5 „Selbst-Review + PR" aus der `workflow.md` dieser Abteilung: Erstellt einen vollständigen,
gut beschriebenen PR und wahrt dabei die Sicherheitsregel **kein Push ohne explizite
Freigabe**. Der Skill übergibt das Ergebnis an WP6 — dort prüfen `/nc-development:fe-review`
bzw. `/nc-development:be-review` den Diff.

## Ablauf

1. **Branch prüfen:** Der aktuelle Branch darf nicht `main` sein. Prüfen, ob alle gewünschten
   Commits vorhanden sind (`git log`, `git status`) — keine vergessenen oder ungewollt
   mitgeschleppten Änderungen.
2. **Gesamtdiff analysieren:** `git diff main...HEAD` **und** die komplette Commit-Historie des
   Branches betrachten, nicht nur den letzten Commit. Der Selbst-Review bezieht sich auf den
   Gesamtdiff, nicht auf den zuletzt geänderten Ausschnitt.
3. **PR-Beschreibung entwerfen** mit vier Teilen:
   - **Zusammenfassung:** Was ändert sich und warum (1–3 Sätze).
   - **Änderungen:** Stichpunkte der wesentlichen Änderungen.
   - **Testplan:** Wie wurde getestet und wie kann der Reviewer es nachvollziehen.
   - **Offene Punkte:** Bekannte Einschränkungen und Folgearbeiten.
4. **Freigabe einholen:** Den Entwurf zeigen. Erst nach explizitem „Ja" pushen
   (`git push -u origin <branch>`) und den PR anlegen (z. B. `gh pr create`).
5. **Ergebnis melden:** Die PR-URL nennen und den nächsten Schritt empfehlen (Review anfordern;
   je nach Änderungsart `/nc-development:fe-review` oder `/nc-development:be-review`).

## Regeln

- **Rote Linie: kein Push und kein PR ohne explizite Nutzerfreigabe.** Der Entwurf wird gezeigt,
  der Mensch entscheidet.
- **Rote Linie: der Skill merged nicht** und fordert keinen Merge an — Feature-Branch → PR →
  Review → Merge, niemals direkt auf `main`.
- Basis-Branch ist `main`, sofern nicht ausdrücklich anders vereinbart.
- **Bestehende PRs werden aktualisiert, nicht gelöscht und neu angelegt** — die Review-Historie
  bleibt erhalten.
- Der PR-Text ist kundensichtbarer Text: Der Agent **entwirft**, der Mensch verantwortet ihn.
  Keine Behauptung im Testplan ohne Beleg (grüner Testlauf, Command-Output, beobachtetes
  Verhalten).

## Verifikation

- `git branch --show-current` zeigt einen Feature-Branch, nicht `main`.
- Der analysierte Gesamtdiff ist benannt (Umfang, betroffene Dateien) und deckt sich mit
  `git diff main...HEAD`.
- Der PR-Entwurf enthält alle vier Abschnitte — Zusammenfassung, Änderungen, Testplan, offene
  Punkte — und keiner ist leer.
- Die Freigabe des Nutzers zu Push und PR-Anlage ist im Verlauf dokumentiert, **bevor** der Push
  ausgeführt wurde.
- Nach der Anlage ist die PR-URL genannt; `git status` zeigt den Branch als gepusht
  (Remote-Tracking gesetzt).
