---
name: nc-save-session
description: Session-Ende für NovaCoreAI-OS-Repos — sichert Stand, Journal und Entscheidungen nach .nc/erinnerung/. Nutze diesen Skill am Ende jeder Arbeitssession, bevor die Session geschlossen wird.
---

# /nc:save-session — Session sichern

## Zweck

Sichert den Arbeitsstand der Session, damit `/nc:start` in der nächsten Session
nahtlos anknüpfen kann. Kundenkontext bleibt im Arbeits-Repo unter `.nc/` und
wird nie in das OS-Repo geschrieben.

## Ablauf

1. **Marker prüfen:** Ohne `.nc-os`-Marker im Repo-Root abbrechen und auf `/nc:setup` verweisen.
2. **Verzeichnis sicherstellen:** `.nc/erinnerung/journal/` anlegen, falls nicht vorhanden; prüfen, dass `.nc/` in `.gitignore` steht (sonst ergänzen und darauf hinweisen).
3. **Journal schreiben (append-only):** An `.nc/erinnerung/journal/<YYYY-MM-DD>.md` einen neuen Block anhängen:
   - Uhrzeit, bearbeitete Aufgabe(n)
   - getroffene Entscheidungen mit kurzer Begründung
   - offene Punkte / nächste Schritte
   - Bestehende Einträge niemals verändern oder löschen.
4. **Stand aktualisieren:** `.nc/erinnerung/stand.md` neu konsolidieren — aktueller Gesamtstand des Repos, aktive Branches, offene PRs, bekannte Risiken.
5. **Bestätigen:** Kurz zusammenfassen, was gesichert wurde.

## Regeln

- Journal ist strikt append-only.
- Keine Kunden-Interna committen: `.nc/` gehört in `.gitignore` des Arbeits-Repos.
- Kein Push, kein Commit ohne explizite Freigabe der Nutzerin/des Nutzers.
