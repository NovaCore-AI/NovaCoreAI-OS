---
name: start
description: >-
  Startet jede Arbeitssitzung mit geladenem Kontext statt Blind-Start (WP0) — bestimmt den
  Ablageort des Sitzungswissens, liest das Projekt-Memory von Claude Code als
  commit-unabhängige Pflichtquelle VOR der commit-getakteten Repo-SSOT, dazu konsolidierten
  Stand, jüngstes Journal, Offene-Stränge-Register und Mehrtages-Roll-up, erfasst die Git-Lage
  des Arbeits-Repos, bestimmt die installierten OS-Plugins samt aktiven Modulen, erkennt einen
  nicht abgeschlossenen Vortag und gibt ein 30-Sekunden-Briefing mit dem nächsten
  Workflow-Schritt aus. Trigger-Begriffe: „Session starten", „Sitzung beginnen",
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
2. **Ablageort bestimmen — und einen Altstand melden, nicht benutzen.** Hat das Arbeits-Repo
   eine eigene Wissensbasis (SSOT-Kategorie mit Master-Index — im OS-Repo `knowledge-base/`),
   liegt das Sitzungswissen unter `sitzungswissen/`: `roll-up.md` und
   `offene-straenge-register.md` direkt dort, `<abteilung>/stand.md` und
   `<abteilung>/journal/<YYYY-MM-DD>.md` auf der Abteilungsebene. Hat es **keine** eigene
   Wissensbasis, trägt das **Projekt-Memory den Stand allein** — dann entfallen die
   Schritte 4 bis 7 ersatzlos, und das wird im Briefing als solches benannt.
   **Altstand-Regel:** Findet sich ein `.nc/erinnerung/`-Bestand, wird er **gemeldet und
   NICHT gelesen**. Er stammt aus einem aufgehobenen Stand; ihn als Quelle zu benutzen,
   hieße einen veralteten Stand als aktuellen auszugeben. Der Skill nennt den Fund, nennt
   `/nc:end-session` als Weg zur Migration — und liest ihn nicht.
3. **Projekt-Memory lesen — commit-unabhängige Pflichtquelle, VOR der Repo-SSOT:** Das
   Memory ist commit-unabhängig und damit regelmäßig frischer als alles Committete. Es wird
   deshalb **zuerst** gelesen; die Schritte 4 bis 7 ergänzen es, sie ersetzen es nicht.
   Das persistente Projekt-Memory
   von Claude Code (`~/.claude/projects/<projekt-slug>/memory/`, Index `MEMORY.md`) wird
   **unabhängig vom Commit-Zyklus** geschrieben und überlebt damit genau die Fälle, in denen der
   reguläre Sitzungsabschluss ausfiel (Abbruch, Kompaktierung, Nachtarbeit). Deshalb wird es
   **vor** der commit-getakteten Repo-Ablage gelesen.
   - **Pfad bestimmen:** den Projekt-Slug aus dem Arbeitsverzeichnis vorwärts ableiten — der
     Slug ist der **absolute Projektpfad, in dem jedes Trennzeichen (`\`, `/`, `:`) durch `-`
     ersetzt ist** (Beispiel: `C:\Users\x\Repo` → `C--Users-x-Repo`). Schlägt das fehl, kommt
     als Rückfallweg nur ein Verzeichnis unter `~/.claude/projects/` in Frage, **dessen Name
     den Repo-Namen des Arbeitsverzeichnisses enthält** — davon das mit der jüngsten
     `memory/`-Änderung; ein fremdes Projekt-Memory wird **nie** geladen (fremdes Wissen
     dürfte sonst den Repo-Stand überstimmen). Ist beides nicht möglich, wird das
     **gemeldet**, nicht geraten.
   - **Das jüngste, nicht irgendeins:** Stand-Dateien lösen sich per Verweis ab. Maßgeblich ist
     die jüngste Fassung; abgelöste Vorgänger bleiben liegen und werden ignoriert.
   - **Den Dateikörper lesen, nicht nur `MEMORY.md`:** Der Index-Einzeiler ist verlustbehaftet —
     der Arbeitsstand steht in der Datei.
   - **Widerspruch benennen, nie glätten:** Ist das Memory jünger als der Repo-Stand, gewinnt die
     frischere Quelle, und der Lagebericht sagt es ausdrücklich („Repo-Stand vom X ist älter als
     das Memory vom Y").
   - Fehlt das Memory ganz, ist das **kein Fehler**: als „nicht vorhanden" ausweisen und
     weiterarbeiten.
4. **Stand laden:** `sitzungswissen/<abteilung>/stand.md` lesen — der konsolidierte Gesamtstand.
   Fehlt die Datei, das offen benennen statt zu improvisieren.
5. **Jüngstes Journal laden:** neueste Datei aus `sitzungswissen/<abteilung>/journal/` (Dateiname
   `<YYYY-MM-DD>.md`) — offene Punkte, Blocker und Entscheidungen des letzten Arbeitstages.
6. **Offene Stränge zurücklesen:** `sitzungswissen/offene-straenge-register.md` lesen (falls
   vorhanden) und die **offenen** Zeilen aktiv ins Einstiegs-Briefing aufnehmen — kein
   ausgelagerter, geplanter oder delegierter Strang bleibt unerwähnt.
7. **Roll-up streifen und fehlenden Abschluss erkennen:** `sitzungswissen/roll-up.md` lesen
   (falls vorhanden) — der verdichtete Mehrtages-Überblick über dem Tagesjournal. Nur die Zeilen
   der letzten Arbeitstage, nicht die Historie in voller Länge.
   **Abschluss-Prüfung:** Trägt der jüngste Arbeitstag ein Journal, aber keine Roll-up-Zeile
   bzw. keinen konsolidierten Stand, endete jene Sitzung **ohne Abschluss**. Das wird im
   Briefing als eigener Punkt genannt — **nachgeholt wird es erst nach dem Stempel**
   (Schritt 15). Der Skill entscheidet das nie selbst: Er nennt den Aufruf
   `/nc:end-session nachzug`, der Mensch löst ihn aus.
8. **Werkzeuglage bestimmen:** Welche OS-Plugins sind in dieser Session aktiv — der Kern `nc`
   immer, dazu jedes installierte Abteilungsplugin (z. B. `nc-development`)? Die verfügbaren
   Skill-Namespaces zeigen es. `module-registry.json` dieses Kern-Plugins ist die
   Metadaten-Quelle dafür, welche Module (Skill-Präfixe) zu welcher Abteilung gehören; sie
   **steuert nichts aus**, sie beschreibt nur. **Abteilungs-CLAUDE (Ebene 2) laden:** Für
   jedes installierte Abteilungsplugin die Datei `<abteilung>-abteilungs-claude.md` an dessen
   **Plugin-Root** lesen (heute: `development-abteilungs-claude.md` von `nc-development`) —
   **Teil 1** gilt für jede Sitzung der Abteilung, **Teil 2** nur für Sitzungen, die am
   Plugin bzw. Abteilungs-Repo selbst bauen. Fehlt die Datei (Plugin-Stand vor ihrer
   Auslieferung), ist das **kein Fehler**: als „Ebene 2 nicht vorhanden" ausweisen. Ohne
   diesen Lese-Schritt wirkt die ausgelieferte Datei nicht — Auslieferung ≠ Wirkung
   (`claude-netz-bau.md` des OS-Repos).
9. **Infra-Registry lesen (falls vorhanden):** `~/.claude/nc/infra.json` hält die maschinenlokal
   registrierten Repo-Pfade (Kern-Klon, Satelliten). Existiert sie, löst der Skill Repo-Verweise
   darüber auf statt zu raten; fehlt sie, ist das **kein Fehler** — sie wird als „nicht
   vorhanden" ausgewiesen und der Skill arbeitet ohne sie weiter.
10. **Projekt-Doku prüfen:** `AGENTS.md` bzw. `CLAUDE.md` des Arbeits-Repos auf Regeln, die für
   diese Sitzung gelten. Ergänzend gilt `nc-sync.md` dieses Kern-Plugins als globale
   Methodik-Anweisung; bei Widerspruch gewinnt die repo-eigene Fachanweisung für Fachfragen.
11. **Team-Sync beachten (Ebene 1b):** `nc-teamsync.md` im `.claude`-Ordner des
    Home-Verzeichnisses trägt die firmenweiten Instruktionen und ist über den Firmen-Block der
    globalen `CLAUDE.md` per `@`-Import bereits geladen — sie gilt ohne erneutes Lesen. Den
    **Stempel** prüft der Skill dagegen ausdrücklich: die **erste Dateizeile per `Read` lesen**
    (`<!-- NC:TEAMSYNC:VERSION x.y.z -->`). Grund: Block-HTML-Kommentare werden vor der
    Kontext-Injektion gestrippt — im injizierten Text ist der Stempel **unsichtbar**, „steht ja
    im Kontext" ist hier keine Prüfung. Liegt die Version unter der Kern-Version aus
    `/nc:os-info` oder fehlt die Datei, das im Lagebericht nennen; der Autosync zieht sie sonst
    beim nächsten Session-Start selbst nach.
12. **30-Sekunden-Briefing ausgeben — höchstens 20 Zeilen.** Der Lagebericht wird gelesen,
    nicht überflogen: Er ist auf **30 Sekunden Lesezeit** geschnitten und **hart auf 20
    Zeilen gedeckelt** (Quellen-Fußblock nicht mitgezählt). Reicht der Platz nicht, wird
    **gekürzt, nie überschritten** — zuerst fallen Details, nie ganze Punkte: Ein
    weggelassener offener Strang ist ein verlorener Strang, eine verkürzte Beschreibung
    nur eine kürzere.
    Inhalt: Branch und Git-Lage · **Frischestand des Projekt-Memory** (jünger oder älter als
    der Repo-Stand, Widerspruch ausdrücklich benannt) · Stand in drei bis fünf Zeilen ·
    offene Punkte aus dem Journal · **offene Stränge aus dem Register** · ein etwaiger
    **nicht abgeschlossener Vortag** (Schritt 7) · ein etwaiger **`.nc/`-Altstand** als
    Fundsache (Schritt 2) · aktive Abteilungen/Module samt **geladener Abteilungs-CLAUDE
    (Ebene 2)** je Abteilung (bzw. „nicht vorhanden") · **vorgeschlagener nächster
    Workflow-Schritt** mit dem Skill, der ihn trägt.
    **Quellen-Fußblock (Pflicht, außerhalb des Deckels):** eine Zeile je tatsächlich
    gelesener Quelle mit Pfad und Stand-Datum — und je nicht vorhandener Quelle die
    ausdrückliche Fehlanzeige. Ohne ihn ist nicht unterscheidbar, ob eine Aussage auf einer
    Quelle beruht oder auf dem Modell.
13. **Start-Stempel setzen (Gate 2):** Nach dem Lagebericht den Stempel-Befehl ausführen, den
   die Session-Start-Injektion (bzw. die Ablehnung des Start-Gates) wörtlich nennt —
   `node "<hooks-Pfad>/nc-start-stempel.js" --session <key> --branch <branch> --head <head>`,
   Branch und HEAD aus Schritt 1 (reale Git-Lage; das Skript verifiziert beides). Erst der
   Stempel öffnet das Start-Gate für schreibende Aktionen dieser Session.
14. **Erstlauf-Anlagen — erst jetzt, nie vorher.** Fehlt in einem Repo mit eigener
    Wissensbasis ein Sitzungswissen-Baustein (`sitzungswissen/`-Kategorie, `roll-up.md`,
    `offene-straenge-register.md`, `<abteilung>/stand.md`), wird er **nach** dem Stempel
    angelegt — nicht davor. Grund: Das Anlegen ist eine **schreibende** Aktion, und vor dem
    Stempel lehnt das Start-Gate sie zu Recht ab; ein Skill, der sein eigenes Gate umgehen
    müsste, wäre falsch geschnitten. **In einem Repo ohne eigene Wissensbasis wird nichts
    angelegt** — dort trägt das Projekt-Memory den Stand allein.
15. **Fehlenden Abschluss nachholen — auf Ansage, nicht eigenmächtig.** Hat Schritt 7 einen
    nicht abgeschlossenen Vortag gemeldet, ist **jetzt** der Zeitpunkt, ihn nachzutragen:
    per `/nc:end-session nachzug`. Der Skill führt das **nicht selbst** aus — er hat den
    Befund im Briefing genannt, die Auslösung liegt beim Menschen. Wird nachgetragen,
    beschreibt der Nachzug den **damaligen** Tag, nicht den heutigen.

## Regeln

- **Keine inhaltliche Arbeit vor abgeschlossenem Lagebericht** — kein Edit, kein Commit,
  keine Recherche „nebenbei".
- **Dieser Skill ist rein lesend** — bis auf den Start-Stempel (Schritt 12), der ausschließlich
  die ephemere Gate-2-Stempeldatei im Temp-Verzeichnis schreibt. Er legt im Repo nichts an,
  ändert nichts, committet nichts.
- **Der Stempel wird nie vorgezogen:** Er ist der Abschluss des Ablaufs, nicht die Abkürzung.
  Wer ihn ohne durchgeführten Ablauf setzt, umgeht Gate 2 so bewusst wie per
  `NC_START_GATE=off`.
- **Quelle schlägt Gedächtnis:** Widerspricht der geladene Stand dem realen Repo-Zustand,
  gilt das Repo; die Abweichung wird im Lagebericht gemeldet, nicht stillschweigend geglättet.
- **Reichweite dieser Regel — das Projekt-Memory ist ausgenommen:** Sie gilt für die geladenen
  Stand-Dokumente (`stand.md`, Journal, Register, Roll-up) gegen den realen Repo-Zustand. Das
  **Projekt-Memory** (Schritt 2) ist selbst Quelle, kein Gedächtnis im Sinne der Regel — ist es
  **jünger** als die commit-getaktete Repo-Ablage, gewinnt es, und der Widerspruch wird benannt.
  Gegen den realen Working Tree gewinnt auch das Memory nie: Was auf der Platte liegt, schlägt
  jede Stand-Aussage.
- Fehlt Stand oder Journal vollständig, wird das als **offener Erstlauf** gemeldet — der Stand
  wird **nicht** aus Commits rekonstruiert und als gesicherter Stand ausgegeben.
- **Altstand wird gemeldet, nicht gelesen.** Ein `.nc/erinnerung/`-Bestand stammt aus einem
  aufgehobenen Stand; er ist Fundsache, nie Quelle. Der Skill nennt ihn im Briefing und
  fasst weder ihn noch die `.gitignore` des Arbeits-Repos an.
- **In fremden Arbeits-Repos wird nichts angelegt.** Ohne eigene Wissensbasis trägt das
  Projekt-Memory den Stand allein — kein Verzeichnis, keine Datei, kein Dateistrom.
- **Installation und Aktualisierung sind Marketplace-Sache** — dieser Skill richtet nichts ein
  und aktualisiert nichts. Den Weg beschreibt die ONBOARDING-Doku des OS-Repos.
- Rote Linien gelten ab der ersten Sekunde: keine automatischen Pushes, Merges, Posts,
  Releases oder Deployments ohne explizite Nutzerfreigabe.

## Verifikation

- Der Lagebericht nennt **jede gelesene Datei mit Pfad und Datum** (Projekt-Memory, Stand,
  Journal, Register, Roll-up, Projekt-Doku) oder benennt sie ausdrücklich als fehlend.
- Das **Projekt-Memory** ist mit Pfad und Änderungsdatum ausgewiesen — gelesen (jüngste Fassung,
  Dateikörper) oder ausdrücklich als „nicht vorhanden" bzw. „Pfad nicht auflösbar" benannt. Ist
  es jünger als der Repo-Stand, nennt der Bericht den Widerspruch beim Namen.
- Offene Stränge aus dem Register sind aufgezählt oder das Register ist ausdrücklich als
  fehlend/leer benannt; ebenso der Befund zum Team-Sync-Stempel, falls er auffällig war.
- Branch, Anzahl unkommittierter Dateien und jüngster Commit-Hash sind ausgewiesen.
- Die aktiven Abteilungen sind mit ihren Namespaces gelistet (mindestens `/nc:`), und je
  Abteilungsplugin ist die **Abteilungs-CLAUDE (Ebene 2)** als gelesen ausgewiesen — oder
  ausdrücklich als „nicht vorhanden" benannt (Plugin-Stand vor ihrer Auslieferung).
- Das **Briefing hält den 20-Zeilen-Deckel** ein (Quellen-Fußblock nicht mitgezählt) und
  trägt den **Quellen-Fußblock**: je gelesener Quelle Pfad und Stand-Datum, je fehlender
  Quelle die ausdrückliche Fehlanzeige.
- Der **Ablageort ist benannt** — entweder die gelesenen `sitzungswissen/`-Pfade oder
  ausdrücklich „keine eigene Wissensbasis, Projekt-Memory trägt allein". Ein gefundener
  `.nc/`-Altbestand ist als Fundsache **gemeldet und nicht gelesen** worden.
- Ein **nicht abgeschlossener Vortag** ist entweder als Befund im Briefing genannt (mit dem
  Aufruf `/nc:end-session nachzug`) oder ausdrücklich ausgeschlossen.
- Erstlauf-Anlagen liegen **hinter** dem Stempel — vor ihm wurde nichts geschrieben.
- Der Bericht endet mit genau **einem** vorgeschlagenen nächsten Schritt samt zuständigem Skill.
- Der **Start-Stempel ist gesetzt** (Bestätigungszeile des Stempel-Skripts liegt vor) — ohne
  ihn lehnt das Start-Gate jede schreibende Aktion der Session ab.
