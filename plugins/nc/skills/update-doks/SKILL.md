---
name: update-doks
description: >-
  Maintainer-Werkzeug für die geteilten Doks — bringt die lokalen CLAUDE-Doks wieder auf
  Stand, wenn der Doks-Autosync nicht greift (defekte NC-Marker, veralteter Versions-Stempel,
  fehlende Team-Sync-Datei), und fährt den index-geführten Konsistenzlauf über die lebende
  Doku des OS-Repos mit Drift-Bericht je Fund (Ist, Soll, Quelle). Fixes ausschließlich nach
  ausdrücklicher Freigabe des Maintainers. Kein Alltagsbefehl — den Normalweg fährt der
  Doks-Autosync des Kerns automatisch beim Session-Start. Trigger-Begriffe: „Doks
  reparieren", „update-doks", „Marker defekt", „Sync erzwingen", „Doku auf Stand ziehen",
  „Konsistenzlauf", „Doku-Drift", „Drift prüfen".
---

# /nc:update-doks — Doks reparieren & Doku-Konsistenz prüfen (Maintainer)

## Zweck

Manuelles Wartungswerkzeug der ständigen Abteilung `gemeinsam` (Kern-Plugin `nc`) mit zwei
Funktionen. **F1** heilt die lokalen, firmengeführten CLAUDE-Doks in den Fällen, die der
automatische Doks-Autosync bewusst auslässt (defekte Marker) oder in denen er in dieser
Session nicht gelaufen ist. **F2** ist der index-geführte Konsistenzlauf über die lebende
Doku des OS-Repos. Der Skill ist **nicht** für den Team-Alltag gedacht: dort hält der
SessionStart-Autosync beide Ziele ohne Zutun aktuell. Er läuft nach `/nc:start` (WP0,
Rahmen `wp-rahmen.md` des Kern-Plugins `nc`) — alle Schreibschritte liegen hinter dem
Fakten-Stempel. Herleitung und Auftrag: Bauplan 2026-08-15 „Onsite-Endstand-Nachbau",
AP-A4 (OS-Repo, `knowledge-base/grundwissen/`); die Ebenen-Konvention steht in der
CLAUDE-Ebenen-Definition desselben Ordners.

## Ablauf

1. **Einstiegs-Triage:** Ist das Start-Gate aktiv und die Session ungestempelt, abbrechen
   mit „erst `/nc:start`, dann erneut". Ruft ein normaler Team-Kontext ohne konkreten
   Befund auf, zuerst auf den Normalweg hinweisen (Autosync beim nächsten Session-Start)
   und nur auf ausdrücklichen Wunsch weiterfahren.
2. **Funktion wählen:** F1 (Lokal-Doks), F2 (Repo-Konsistenzlauf) oder beides — bei
   unklarem Auftrag fragen, nicht raten.

### F1 — Lokal-Doks reparieren / Sync erzwingen

3. **Zielinventur — zwei Ziele mit unterschiedlicher Mechanik.** **Ebene 1** ist der
   Firmen-Block in `~/.claude/CLAUDE.md` (Marker-Chirurgie; alles außerhalb der Marker ist
   Privat-Zone des Mitarbeiters). **Ebene 1b** ist die Team-Sync-Datei `nc-teamsync.md` im
   `.claude`-Ordner des Home-Verzeichnisses — **Ganzdatei**, vollständig firmengeführt, ohne
   Marker und ohne Privat-Zone. Payloads sind `doks/global-claude-firmenblock.md` (Ebene 1)
   und die ausgelieferte `nc-sync.md` (Ebene 1b) des Kern-Plugins, die Soll-Version steht im
   Manifest `.claude-plugin/plugin.json` desselben Plugins (alles vom Plugin-Wurzel-
   verzeichnis aus auflösen). Fehlt eine Payload, gilt das Ziel als **„noch nicht
   ausgeliefert"** — melden, nichts anlegen.
4. **Befund je Ziel erheben (nur lesend).**
   **Ebene 1:** Anzahl von `<!-- NC:BLOCK:START global -->` und
   `<!-- NC:BLOCK:ENDE global -->`, ihre Reihenfolge und der Stempel
   `<!-- NC:BLOCK:VERSION <kern-version> -->` als erste Zeile im Block. Vier Lagen:
   **intakt + aktuell** → No-op melden · **intakt + alter Stempel** → Sync fahren
   (Schritt 5) · **gar kein Marker** → Sync fahren, der Hook setzt den Block oben ein ·
   **defekt** (START ohne ENDE, ENDE vor START, Mehrfach-Marker) → Reparatur vorlegen
   (Schritt 6). Zusätzlich prüfen, ob der Block die Import-Zeile
   `@~/.claude/nc-teamsync.md` enthält — ohne sie lädt Ebene 1b in keiner Sitzung.
   **Ebene 1b:** nur der Stempel `<!-- NC:TEAMSYNC:VERSION <kern-version> -->` in der
   **ersten Zeile**. Drei Lagen: **aktuell** → No-op melden · **alter oder fehlender
   Stempel** → Sync fahren · **Datei fehlt** → Sync fahren, der Hook legt sie an. Eine
   Reparatur von Hand gibt es hier nicht: die Datei wird immer als Ganzes ersetzt, es ist
   nichts zu schützen.
5. **Sync fahren — denselben Code, keinen Nachbau.** Die Chirurgie wird **nie** im Skill
   nachgebildet, sondern der Autosync des Kerns gefahren:

   ```
   echo '{}' | node "<plugin-pfad>/hooks/nc-doks-autosync.js"     # bash
   '{}'  | node "<plugin-pfad>/hooks/nc-doks-autosync.js"         # PowerShell
   ```

   Das leere JSON-Objekt auf stdin ist Pflicht (der Hook liest sein Event von dort). Er ist
   idempotent, verarbeitet beide Ziele unabhängig, legt vor jedem Schreiben die rollierende
   Sicherung `<ziel>.nc-autosync-backup` an und schreibt atomar. Vergleiche laufen über
   **zeilenenden-normalisierte** Texte — ein inhaltsgleiches CRLF-Ziel bleibt unangetastet.
   Vorher prüfen, dass `NC_AUTOSYNC` **nicht** auf einem Aus-Wert steht (`off`/`0`/`false`/
   `disabled`), sonst ist der Lauf ein stiller No-op. Danach den Befund aus Schritt 4 neu
   erheben.
6. **Defekte Marker (Ebene 1) — Vorlage statt Eingriff.** Diesen Fall lässt der Hook
   fail-safe aus, und **dieser Skill schreibt dort ebenfalls nicht**. Stattdessen dem
   Menschen vorlegen: den Befund (Marker-Zählung, Positionen), die vorhandene Sicherung
   `~/.claude/CLAUDE.md.nc-autosync-backup` als letzten guten Stand und den exakten
   Reparaturvorschlag — entweder **ein** wohlgeformtes Marker-Paar wiederherstellen
   (START vor ENDE, genau einmal) oder die defekten Marker-Reste vollständig entfernen,
   dann setzt der Hook den Block oben neu ein. Der Mensch führt die Änderung aus, danach
   Schritt 5 und erneut Schritt 4. Ist die Blockgrenze nicht eindeutig rekonstruierbar,
   wird auch **kein** Vorschlag als fertig ausgegeben, sondern die Mehrdeutigkeit benannt.
7. **Ergebnis je Ziel belegen:** Pfad, Lage vorher/nachher, Stempel-Zitat (bei Ebene 1 samt
   Marker-Paar, bei Ebene 1b die erste Zeile), Backup-Pfad — oder „No-op, bereits aktuell".

### F2 — Repo-Doku-Konsistenzlauf (index-geführt)

8. **Arbeitsgegenstand auflösen:** Läuft die Sitzung im OS-Repo selbst, direkt dort
   arbeiten. Sonst gilt die lokale SSOT-Kopie `~/.nc/ssot/NovaCoreAI-OS/` (Zeiger
   `~/.nc/ssot/index.json`). Fehlt sie, melden und `/nc:setup` vorschlagen — **keine Pfade
   raten**, keine fremden Arbeitsklone annehmen.
9. **Soll-Quellen zur Laufzeit lesen** (nie aus dem Gedächtnis; sie **sind** das Regelwerk):
   der Master-Index `SSOT-Document-Index.md` der Wissensbasis (Routing + Quellen-Triage) ·
   der Aktualisierungs-Index unter `standardprozesse/` (Änderungs-Matrix, Version/Release/
   Tag, Protokoll- und Indexpflichten) · die Sync-Matrix der `AGENTS.md`. Alle drei liegen
   im OS-Repo, die ersten beiden unterhalb `knowledge-base/`.
10. **Prüfumfang je Lauf:** Versions-Spiegel (`VERSION` ↔ `plugin.json` ↔
    `module-registry.json` ↔ Versionsnennungen der lebenden Doku) · Skill- und
    Modul-Tabellen (README, `AGENTS.md`, Registry) gegen die realen `skills/`-Ordner ·
    Statusaussagen (Gates, Platzhalter, Test-Anzahl) gegen den CHANGELOG-Stand · tote Pfade
    per Grep über die lebende Doku · Index-Vollständigkeit deterministisch per
    `node --test plugins/nc/tests/*.test.mjs` im OS-Repo.
11. **Drift-Bericht ausgeben:** je Fund Datei und Stelle, **Ist**, **Soll** und die
    **Quelle** der Soll-Aussage. Keine stille Korrektur während der Erhebung.
12. **Fixes vorbereiten:** nur nach Freigabe, ausschließlich in einem Arbeits-Branch,
    Abschluss über `/nc:doku-sync` (Commit-Reife) — dieser Skill liefert den Befund,
    `doku-sync` die Commit-Vorbereitung.

## Regeln

- **Die Privat-Zone außerhalb der NC-Marker wird nie verändert** — kein Reformatieren, kein
  Umsortieren, keine Whitespace-Kosmetik. **Der Skill schreibt selbst überhaupt nicht in
  `~/.claude/CLAUDE.md`:** die inhaltliche Chirurgie gehört allein dem Autosync-Hook (eine
  Implementierung, kein zweiter Pfad), die Marker-Reparatur allein dem Menschen.
- **Keine automatischen Fixes.** F2 erhebt und berichtet; jede Änderung an der Doku braucht
  die ausdrückliche Freigabe des Maintainers im laufenden Lauf.
- **Rote Linien:** kein `git commit`, `push`, `merge` oder Tag ohne explizite Freigabe des
  Maintainers; nichts wird an Dritte gesendet.
- **Nur lebende Dokumente:** CHANGELOG-Alteinträge, das Bauplan-Archiv und append-only-
  Protokolle werden nie umgeschrieben; Definitionsdokumente ändern sich per Nachtrag.
- **Widersprüche werden gemeldet, nie stillschweigend geglättet.** Quellen-Hierarchie:
  jüngster Bauplan bzw. Definitionsdokument → Standardprozesse → lebende Doku; bei Pfaden
  gewinnt die Platte (Glob/Grep/`git status`).
- **Maintainer-Werkzeug:** Wer nur aktuelle Doks braucht, braucht diesen Skill nicht — dann
  auf den Autosync verweisen statt Schreibaktionen zu starten.
- Keine personenbezogenen Pfade annehmen; Zielorte kommen aus dem Home-Verzeichnis, dem
  Plugin-Verzeichnis oder dem SSOT-Zeiger — nie aus Annahmen über den Rechner.

## Verifikation

- **F1:** Je berührtes Ziel steht im Ergebnis das Stempel-Zitat mit der Version aus dem
  Kern-Manifest — bei Ebene 1 zusätzlich das vollständige Marker-Paar
  (`NC:BLOCK:START`/`ENDE`) und der Nachweis der Import-Zeile auf Ebene 1b, bei Ebene 1b die
  erste Zeile (`NC:TEAMSYNC:VERSION`) — plus der Backup-Pfad jeder geschriebenen Datei. Ein
  direkter Zweitlauf meldet für beide Ziele **No-op** (nichts geschrieben, kein neues
  Backup).
- **F1-Privat-Zone:** Der Bereich außerhalb der Marker ist gegen die Sicherung
  byte-identisch (Diff-Nachweis: nur der Blockbereich unterscheidet sich).
- **F1-Defektfall:** Solange die Marker defekt sind, existiert **kein** Schreibvorgang des
  Skills — belegt durch den unveränderten Zeitstempel der Zieldatei plus vorgelegten
  Reparaturvorschlag.
- **F2:** Der Drift-Bericht listet jeden Fund mit Datei, Ist, Soll und Quellenbeleg; ein
  leerer Bericht wird als „keine Drift gefunden" mit Nennung der geprüften Punkte
  ausgegeben.
- **Abschluss-Gegenprobe:** `node --test plugins/nc/tests/*.test.mjs` ist im OS-Repo grün;
  bei berührten Manifesten oder Skills zusätzlich
  `claude plugin validate plugins/<name> --strict`.
