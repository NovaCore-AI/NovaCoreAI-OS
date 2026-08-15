---
name: end-session
description: >-
  Sichert am Sitzungsende den Arbeitsstand (WP8) — schreibt den append-only Journal-Eintrag
  des Tages nach .nc/erinnerung/journal/, konsolidiert .nc/erinnerung/stand.md neu, spiegelt
  den Stand commit-unabhängig ins Projekt-Memory von Claude Code, aktualisiert den
  Mehrtages-Roll-up, pflegt das Offene-Stränge-Register, übergibt offene Punkte samt
  empfohlenem Einstieg an die nächste Sitzung und setzt den Abschluss-Stempel.
  Trigger-Begriffe: „Session beenden", „end-session", „Sitzungsabschluss", „Sitzung beenden",
  „Feierabend", „Stand sichern", „WP8", „Sitzung abschließen", „Übergabe", „für heute fertig",
  „vor dem Kompaktieren".
---

# /nc:end-session — Sitzungsabschluss (WP8)

## Zweck

Letzter Pflichtschritt jeder Sitzung (WP8 im WP-Rahmen `wp-rahmen.md` dieses Kern-Plugins `nc`).
Der Skill überführt das, was in dieser Sitzung passiert ist, in das Sitzungsgedächtnis unter
`.nc/erinnerung/`, damit die nächste Sitzung mit `/nc:start` nahtlos daran anknüpfen kann. Er
sichert **Wissen** — er stellt keine Commit-Reife her und ersetzt kein Review; das leistet
`/nc:doku-sync`. Der Skill trug bis zu dieser Fassung einen anderen Aufrufnamen; dieser existiert
nicht mehr — `/nc:end-session` ist der einzige gültige Aufruf.

Zweiter Auslöser neben dem Sitzungsende: die **Kontext-Kompaktierung** — die PreCompact-Mahnung
des Kerns fordert den Skill an, damit Sitzungswissen nicht am Erinnerungsvermögen des Nutzers
hängt. Die Mahnung blockt **höchstens einmal je Sitzung**: danach laufen weitere
Kompaktierungen durch, ob gestempelt oder nicht (Loop-Schutz — eine Dauerblockade bei
Auto-Compact wäre eine Sackgasse mit vollem Kontextfenster). Dass nicht mehr gemahnt wird, hebt
die Pflicht **nicht** auf: Abschluss samt Stempel bleibt Pflichtschritt jeder Sitzung.

## Ablauf

1. **Sitzung erfassen:** `git status --short` und `git log --oneline` seit Sitzungsbeginn; dazu
   die eigenen Arbeitsschritte — was wurde entschieden, gefunden, gebaut, verworfen.
2. **Ablage sicherstellen:** Wohnort des Sitzungswissens ist `.nc/erinnerung/` des
   Arbeits-Repos; `.nc/erinnerung/journal/` anlegen, falls es fehlt. Prüfen, dass `.nc/` in der
   `.gitignore` des Arbeits-Repos steht; fehlt der Eintrag, ihn **vorschlagen und ausdrücklich
   darauf hinweisen — geändert wird die Datei nur nach Zustimmung** (dieselbe Politik wie in
   `/nc:start` und `/nc:setup`: die `.gitignore` gehört dem Arbeits-Repo). *(Ausnahme nach
   Maintainer-Entscheid E2a, Bauplan 2026-08-15: Ein **privates** Arbeits-Repo mit eigener
   Wissensbasis darf sein Sitzungswissen als versionierte Kategorie `sitzungswissen/` führen —
   für dieses **öffentliche** OS-Repo ist der Weg ausgeschlossen und hier nicht gebaut.)*
3. **Journal fortschreiben:** Eintrag an `.nc/erinnerung/journal/<YYYY-MM-DD>.md` **anhängen**
   (Datei mit Datumsüberschrift anlegen, falls sie fehlt). Inhalt: Uhrzeit, bearbeitete
   Aufgaben, getroffene Entscheidungen mit Begründung, offene Punkte, nächste Schritte.
   Bestehende Zeilen werden nie geändert.
4. **Stand konsolidieren:** `.nc/erinnerung/stand.md` **neu schreiben** — nicht anhängen.
   Erledigtes ersetzt Offenes, überholte Punkte fliegen raus. Struktur: aktueller Arbeitsstand ·
   offene Punkte · zuletzt getroffene Entscheidungen · aktive Branches und offene Pull Requests ·
   bekannte Risiken · nächster Schritt.
5. **Projekt-Memory schreiben — der commit-unabhängige Stand:** Denselben konsolidierten Stand
   zusätzlich in das persistente Projekt-Memory von Claude Code schreiben
   (`~/.claude/projects/<projekt-slug>/memory/`, dazu die Indexzeile in dessen `MEMORY.md`).
   Grund: Die Repo-Ablage aus Schritt 4 ist **commit-getaktet** — bricht die Sitzung vor dem
   Commit ab oder kompaktiert der Kontext, ist sie nicht eingereicht. Das Memory überlebt genau
   diese Fälle und ist die Quelle, die `/nc:start` zuerst liest.
   - **Jüngste Fassung ersetzt, Vorgänger bleiben liegen** — die abgelöste Datei wird nicht
     gelöscht, sondern in der neuen als überholt benannt (Nachvollziehbarkeit).
   - **Maschinenlokal, nicht geteilt:** Das Memory ist der frischeste Roh-Stand **einer**
     Maschine; die Repo-Ablage bleibt der kuratierte Stand, den das Team sieht.
   - **Keine Secrets, Tokens, Kundendaten oder personenbezogenen Pfade.**
   - Lässt sich der Memory-Pfad nicht auflösen, wird das **gemeldet**, nicht geraten; der
     Sitzungsabschluss läuft weiter (die Ablage aus Schritt 4 ist geschrieben).
6. **Roll-up aktualisieren:** `.nc/erinnerung/roll-up.md` ist der verdichtete
   **Mehrtages-Überblick** über dem Tagesjournal — je Arbeitstag eine Zeile (Datum · Thema ·
   Ergebnis in einem Satz), jüngster Tag oben. Heutige Zeile ergänzen oder aktualisieren, ältere
   Zeilen bleiben unangetastet; fehlt die Datei, mit Kopfzeile und dieser Struktur anlegen.
7. **Offene-Stränge-Register pflegen (Pflichtschritt):** `.nc/erinnerung/offene-straenge-register.md`
   — **jeder** in dieser Sitzung ausgelagerte, geplante oder delegierte Strang (Pull Request,
   Bauplan, Backlog-Idee, vertagte Entscheidung, offener Praxistest, Folge-Session) wird
   eingetragen oder aktualisiert; Erledigtes bekommt ein Erledigt-Datum, Zeilen werden nie
   gelöscht. Fehlt die Datei, wird sie mit Kopf-Blockquote (Zweck + Pflege-Regeln) und der
   Tabelle `Datum · Strang · Verbleib · Nächster Schritt · Status` angelegt.
   *(Klassifikation firmenrelevanter Ergebnisse folgt mit dem Queue-Flow.)*
8. **Fehlerprotokoll prüfen:** Sind alle eigenen Fehler dieser Sitzung festgehalten? Im OS-Repo
   greift dessen append-only Fehlerprotokoll (`agent-learnings.md` der Wissensbasis), in jedem
   anderen Arbeits-Repo die dort geltende Konvention. Fehlt ein Eintrag: nachholen.
9. **Übergabe ausgeben:** geschriebene Dateien mit Pfad (Repo-Ablage **und** Projekt-Memory),
   Kern des Stands, offene Punkte und Register-Änderungen, der empfohlene Einstieg der nächsten
   Sitzung — plus der Hinweis auf `/nc:doku-sync`, falls ein Commit ansteht, und darauf, dass
   dieser Commit die Freigabe des Menschen braucht.
10. **Abschluss-Stempel setzen:** Als **letzten** Schritt den Stempel-Befehl ausführen, den die
    Mahn-Ausgabe des PreCompact-Hooks wörtlich nennt —
    `node "<hooks-Pfad>/nc-end-stempel.js" --session <key>`. Er markiert den Sitzungsabschluss;
    die PreCompact-Mahnung dieser Sitzung entfällt damit. `<key>` ist **derselbe
    `--session`-Schlüssel wie beim Start-Stempel**: Er steht in der Session-Start-Injektion und
    wird in jeder Gate-Ablehnung wörtlich wiederholt — er wird nie geraten und nie neu erfunden.
    Ohne vorangegangene Mahnung liegt das Skript im `hooks/`-Verzeichnis dieses Kern-Plugins `nc`.
    Erst **nach** den Schritten 3–9 stempeln — der Stempel ist der letzte Handgriff der Sitzung
    und bezeugt den erledigten Abschluss samt ausgegebener Übergabe.

## Regeln

- **Journal ist append-only.** Vergangene Einträge werden nie umgeschrieben oder gelöscht —
  auch nicht, wenn sie sich als falsch erwiesen haben; Korrekturen kommen als neuer Eintrag,
  der auf den alten verweist.
- **`stand.md` ist konsolidiert, nicht kumulativ** — Zielgröße unter 60 Zeilen. Historie gehört
  ins Journal, nicht in den Stand.
- **Register ist append/update, nie delete** — erledigte Stränge bleiben mit Erledigt-Datum
  stehen; Detailwissen wohnt am Verbleib-Ort, das Register ist der Zeiger.
- **Nur Belegtes festhalten.** Vermutungen werden als Vermutung markiert, nicht als Stand
  geschrieben. „Läuft" ohne Beweis ist kein Stand.
- **Keine Secrets, Tokens, Kundendaten oder personenbezogenen Pfade** ins Gedächtnis —
  Dateipfade und Ticket-Bezüge des Arbeits-Repos ja, Zugangsdaten nie.
- **Kundenkontext bleibt im Arbeits-Repo** unter `.nc/` und wandert nie ins OS-Repo.
- **Der Agent committet und pusht nie selbst.** Keine automatischen Pushes, Merges, Posts,
  Releases oder Deployments ohne explizite Nutzerfreigabe — auch nicht „nur schnell den
  Journal-Eintrag".
- **Der Abschluss-Stempel ist eine Selbstauskunft, kein Nachweis.** Er wird nie gesetzt, solange
  die Schritte 3–8 nicht wirklich erledigt sind — wer ohne Abschluss stempelt, hebelt den
  Verlustschutz genauso bewusst aus wie per Opt-out. Umgekehrt darf er nie fehlen, und die
  ausbleibende Mahnung ist kein Freibrief: Gemahnt wird nur die **erste** Kompaktierung einer
  Sitzung, danach geht ungesichertes Wissen still verloren.
- **Kein `.nc-os`-Repo-Marker nötig** (Altbestand vor Kern 0.6.0) — die Kontroll-Schicht ist
  markerlos aktiv, wo der Kern installiert ist. Der Skill sichert den Stand in jedem
  Arbeits-Repo; mit den Stempel-Dateien der Gates hat diese Regel nichts zu tun.

## Verifikation

- Der Journal-Eintrag ist per `tail -20 .nc/erinnerung/journal/<YYYY-MM-DD>.md` sichtbar und die
  Datei ist **länger** als vorher — Zeilenzahl vorher/nachher im Ergebnis ausweisen.
- Kein bestehender Journal-Block wurde verändert (per Diff oder Zeilenzahl-Vergleich belegen).
- `.nc/erinnerung/stand.md` existiert, ist unter 60 Zeilen und nennt einen konkreten nächsten
  Schritt.
- Die **Memory-Stand-Datei** ist mit Pfad und Änderungszeit ausgewiesen, ihre Indexzeile steht in
  `MEMORY.md`, und die abgelöste Vorgängerfassung ist in ihr als überholt benannt (nicht
  gelöscht). Ließ sich der Pfad nicht auflösen, liegt stattdessen die Meldung vor.
- Die heutige Roll-up-Zeile trägt das heutige Datum; die übrigen Zeilen sind unverändert (per
  Diff belegen).
- Das Register enthält für jeden in der Übergabe genannten ausgelagerten Strang eine Zeile mit
  Verbleib und nächstem Schritt.
- `git status --short` zeigt **keine** `.nc/`-Pfade (Ignore greift) — sonst wird der fehlende
  `.gitignore`-Eintrag samt Vorschlag gemeldet (geändert nur nach Zustimmung).
- Die Übergabe listet jede geschriebene Datei mit vollem Pfad.
- Der **Abschluss-Stempel ist gesetzt** (Bestätigungszeile „Abschluss-Stempel gesetzt" des
  Stempel-Skripts liegt vor) — er ist der einzige Nachweis, dass WP8 lief; die Mahnung kommt
  höchstens einmal je Sitzung und ersetzt die Prüfung nicht.
