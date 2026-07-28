---
name: start
description: >-
  Startet jede Arbeitssitzung mit geladenem Kontext statt Blind-Start (WP0) — liest den
  konsolidierten Stand und das jüngste Journal aus .nc/erinnerung/, erfasst die Git-Lage des
  Arbeits-Repos, bestimmt die installierten OS-Plugins samt aktiven Modulen und legt den
  nächsten Workflow-Schritt fest. Trigger-Begriffe: „Session starten", „Sitzung beginnen",
  „Wo standen wir", „Kontext laden", „WP0", „Stand laden", „neuer Arbeitstag".
---

# /nc:start — Session-Start mit geladenem Kontext (WP0)

## Zweck

Erster Pflichtschritt jeder Sitzung (WP0 im WP-Rahmen `wp-rahmen.md` dieses Kern-Plugins `nc`;
WP1–WP7 konkretisiert die jeweilige Abteilung in ihrer eigenen `workflow.md`). Der Skill stellt
den Arbeitskontext her, bevor irgendeine inhaltliche Aktion passiert: Stand, jüngstes Journal,
Git-Lage, Projekt-Doku, verfügbare Werkzeuge. Ohne diesen Schritt arbeitet der Agent aus dem
Gedächtnis — genau der Blind-Start, den das OS verhindert.

## Ablauf

1. **Arbeits-Repo erfassen:** `git status --short --branch` und `git log --oneline -10`.
   Unkommittierte Änderungen und der jüngste Commit gehen jeder Doku-Aussage vor — der
   Working Tree ist die Wahrheit.
2. **Marker prüfen:** Liegt im Repo-Root die **Datei** `.nc-os`? Sie steuert allein den
   Begrüßungs-Scope des Session-Start-Hooks, nicht diesen Skill. Fehlt sie, das einmal
   benennen („kein markiertes nc-Arbeits-Repo — die Begrüßung des Hooks bleibt aus") und
   **normal weiterarbeiten**. Ein Verzeichnis gleichen Namens ist kein Marker.
3. **Stand laden:** `.nc/erinnerung/stand.md` lesen — der konsolidierte Gesamtstand. Fehlt die
   Datei, das offen benennen statt zu improvisieren.
4. **Jüngstes Journal laden:** neueste Datei aus `.nc/erinnerung/journal/` (Dateiname
   `<YYYY-MM-DD>.md`) — offene Punkte, Blocker und Entscheidungen des letzten Arbeitstages.
5. **Werkzeuglage bestimmen:** Welche OS-Plugins sind in dieser Session aktiv — der Kern `nc`
   immer, dazu jedes installierte Abteilungsplugin (z. B. `nc-development`)? Die verfügbaren
   Skill-Namespaces zeigen es. `module-registry.json` dieses Kern-Plugins ist die
   Metadaten-Quelle dafür, welche Module (Skill-Präfixe) zu welcher Abteilung gehören; sie
   **steuert nichts aus**, sie beschreibt nur.
6. **Projekt-Doku prüfen:** `CLAUDE.md` bzw. `AGENTS.md` des Arbeits-Repos auf Regeln, die für
   diese Sitzung gelten. Ergänzend gilt `nc-sync.md` dieses Kern-Plugins als globale
   Methodik-Anweisung; bei Widerspruch gewinnt die repo-eigene Fachanweisung für Fachfragen.
7. **Lagebericht ausgeben:** Branch und Git-Lage · Stand in drei bis fünf Zeilen · offene
   Punkte aus dem Journal · aktive Abteilungen/Module · **vorgeschlagener nächster
   Workflow-Schritt** mit dem Skill, der ihn trägt.

## Regeln

- **Keine inhaltliche Arbeit vor abgeschlossenem Lagebericht** — kein Edit, kein Commit,
  keine Recherche „nebenbei".
- **Dieser Skill ist rein lesend.** Er legt nichts an, ändert nichts, committet nichts.
- **Quelle schlägt Gedächtnis:** Widerspricht der geladene Stand dem realen Repo-Zustand,
  gilt das Repo; die Abweichung wird im Lagebericht gemeldet, nicht stillschweigend geglättet.
- **Fehlender Marker ist kein Abbruchgrund** — er verändert nur den Begrüßungs-Scope. Der
  Skill weist einmal darauf hin und arbeitet weiter.
- Fehlt Stand oder Journal vollständig, wird das als **offener Erstlauf** gemeldet — der Stand
  wird **nicht** aus Commits rekonstruiert und als gesicherter Stand ausgegeben.
- **`.nc/` gehört in die `.gitignore` des Arbeits-Repos** und wird nie committet; fehlt der
  Eintrag, weist der Skill darauf hin, ändert die Datei aber nicht selbst.
- **Installation und Aktualisierung sind Marketplace-Sache** — dieser Skill richtet nichts ein
  und aktualisiert nichts. Den Weg beschreibt die ONBOARDING-Doku des OS-Repos.
- Rote Linien gelten ab der ersten Sekunde: keine automatischen Pushes, Merges, Posts,
  Releases oder Deployments ohne explizite Nutzerfreigabe.

## Verifikation

- Der Lagebericht nennt **jede gelesene Datei mit Pfad und Datum** (Stand, Journal,
  Projekt-Doku) oder benennt sie ausdrücklich als fehlend.
- Branch, Anzahl unkommittierter Dateien und jüngster Commit-Hash sind ausgewiesen.
- Der Marker-Zustand ist genannt (Datei vorhanden / fehlt / gleichnamiges Verzeichnis).
- Die aktiven Abteilungen sind mit ihren Namespaces gelistet (mindestens `/nc:`).
- `git status --short` zeigt **keine** `.nc/`-Pfade (Ignore greift) — sonst wird der fehlende
  `.gitignore`-Eintrag im Bericht gemeldet.
- Der Bericht endet mit genau **einem** vorgeschlagenen nächsten Schritt samt zuständigem Skill.
