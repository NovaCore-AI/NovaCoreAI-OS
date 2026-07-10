---
name: nc-flc-feature-start
description: "[FLC] Feature-Arbeit beginnen — Anforderung klären, Repo-Kontext laden, Feature-Branch vorbereiten und den nächsten nc-Skill empfehlen. Nutze diesen Skill, wenn ein neues Feature, eine Änderung oder ein Ticket bearbeitet werden soll."
---

# /nc:flc-feature-start — Feature beginnen

## Zweck

Stellt sicher, dass vor der Implementierung die Anforderung verstanden, der
Kontext geladen und ein sauberer Arbeitszweig vorhanden ist.

## Ablauf

1. **Anforderung klären:** Die Aufgabe in eigenen Worten zusammenfassen. Unklare Punkte als konkrete Rückfragen stellen — nachfragen statt raten. Erst fortfahren, wenn Ziel und Abgrenzung („was gehört NICHT dazu") bestätigt sind.
2. **Kontext laden:** Falls noch nicht geschehen, `/nc:start` ausführen (Stand, Journal, Git-Status).
3. **Betroffene Stellen finden:** Relevante Dateien, Module und Tests im Repo identifizieren und kurz nennen.
4. **Branch vorbereiten:** Von `main` (aktuell) einen Feature-Branch vorschlagen (`feat/<kurzbeschreibung>`). Kein direkter `main`-Push — Feature-Branch → PR → Review → Merge.
5. **Nächsten Schritt empfehlen:** Bei nicht-trivialen Aufgaben `/nc:flc-plan` zum Slicing; bei Kleinständerungen direkt implementieren und mit `/nc:flc-commit-prep` abschließen.

## Regeln

- Keine Implementierung in diesem Skill — er bereitet nur vor.
- Ergebnis (Anforderung, offene Fragen, Branch-Name) kompakt festhalten, damit `/nc:save-session` es ins Journal übernehmen kann.
