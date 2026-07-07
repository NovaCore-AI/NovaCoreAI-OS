---
name: nc-start
description: Session-Start für NovaCoreAI-OS-Repos — lädt Projekt- und Session-Kontext aus .nc/erinnerung/, ermittelt Git-Status und aktives Modul. Nutze diesen Skill zu Beginn jeder Arbeitssession in einem Repo mit .nc-os-Marker.
---

# /nc:start — Session-Start

## Zweck

Lädt zu Session-Beginn den gesamten relevanten Kontext, damit die Arbeit nahtlos
dort weitergeht, wo die letzte Session endete.

## Ablauf

1. **Marker prüfen:** Existiert im Repo-Root eine Datei `.nc-os`?
   - Nein → Hinweis geben, dass dies kein nc-Repo ist, und fragen, ob `/nc:setup` gewünscht ist. Ende.
2. **Stand laden:** `.nc/erinnerung/stand.md` lesen (konsolidierter Gesamtstand).
   - Datei fehlt → melden, dass noch kein Stand existiert, und mit leerem Kontext fortfahren.
3. **Letztes Journal laden:** Neueste Datei unter `.nc/erinnerung/journal/` lesen (Format `<YYYY-MM-DD>.md`).
4. **Git-Status ermitteln:** `git status` und `git log --oneline -5` ausführen; aktuellen Branch und offene Änderungen nennen.
5. **Aktives Modul erkennen:** `modules/module-registry.json` der OS-Installation lesen und die aktivierten Module nennen.
6. **Zusammenfassung geben:** Kompakter Überblick — Stand, letzte Session, Git-Zustand, verfügbare `nc:`-Skills — und den passenden nächsten Skill empfehlen (z.B. `/nc:feature-start` für neue Features).

## Regeln

- Kein Rollen-Konzept: Der Kontext wird ohne Abteilungs-/Rollenbestimmung geladen.
- Bei fehlendem Kontext nachfragen statt raten.
- Nichts committen, pushen oder verändern — dieser Skill ist rein lesend.
