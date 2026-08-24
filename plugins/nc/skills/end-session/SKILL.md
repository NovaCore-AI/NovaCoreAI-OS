---
name: end-session
description: >-
  Sichert am Sitzungsende den Arbeitsstand (WP8) — bestimmt zuerst den Zielort (eigene
  Wissensbasis oder Projekt-Memory), schreibt den append-only Journal-Eintrag des Tages,
  konsolidiert den Stand neu, spiegelt ihn commit-unabhängig ins Projekt-Memory von Claude
  Code, aktualisiert den Mehrtages-Roll-up, pflegt das Offene-Stränge-Register, schließt die
  lokale Stufe über alle drei Scopes ab (Projekt, User, Scratchpad), klassifiziert
  firmenrelevante Ergebnisse gegen Kriterien und Stufen-Prüfungen in die Kandidaten-Queue der
  Abteilung (Queue-Flow, Station 1), übergibt offene Punkte samt empfohlenem Einstieg an die
  nächste Sitzung und setzt den Abschluss-Stempel. Mit dem Argument „nachzug" schreibt er
  stattdessen den nicht abgeschlossenen Vortag nach.
  Trigger-Begriffe: „Session beenden", „end-session", „Sitzungsabschluss", „Sitzung beenden",
  „Feierabend", „Stand sichern", „WP8", „Sitzung abschließen", „Übergabe", „für heute fertig",
  „vor dem Kompaktieren", „nachzug", „Vortag nachtragen".
---

# /nc:end-session — Sitzungsabschluss (WP8)

## Zweck

Letzter Pflichtschritt jeder Sitzung (WP8 im WP-Rahmen `wp-rahmen.md` dieses Kern-Plugins `nc`).
Der Skill überführt das, was in dieser Sitzung passiert ist, an den in Schritt 2 bestimmten
Zielort, damit die nächste Sitzung mit `/nc:start` nahtlos daran anknüpfen kann. Er
sichert **Wissen** — er stellt keine Commit-Reife her und ersetzt kein Review: den
mechanischen Teil des Prüfzyklus trägt die CI-Suite, den urteilsabhängigen das
Maintainer-Review am PR. Welche Doks eine Änderung mitziehen muss, beantwortet
`/nc:wissen-aendern`. Der Skill trug bis zu dieser Fassung einen anderen Aufrufnamen; dieser existiert
nicht mehr — `/nc:end-session` ist der einzige gültige Aufruf.

Zweiter Auslöser neben dem Sitzungsende: die **Kontext-Kompaktierung** — die PreCompact-Mahnung
des Kerns fordert den Skill an, damit Sitzungswissen nicht am Erinnerungsvermögen des Nutzers
hängt. Die Mahnung blockt **höchstens einmal je Sitzung**: danach laufen weitere
Kompaktierungen durch, ob gestempelt oder nicht (Loop-Schutz — eine Dauerblockade bei
Auto-Compact wäre eine Sackgasse mit vollem Kontextfenster). Dass nicht mehr gemahnt wird, hebt
die Pflicht **nicht** auf: Abschluss samt Stempel bleibt Pflichtschritt jeder Sitzung.

## Zwei Fälle — das Argument entscheidet, nie eine Heuristik

Der Skill kennt genau zwei Läufe. **Welcher gilt, sagt allein das Argument beim Aufruf:**

| Aufruf | Fall | Beschriebener Tag |
|---|---|---|
| `/nc:end-session` | **Regellauf** — schließt die **laufende** Sitzung ab | **heute** |
| `/nc:end-session nachzug` | **Nachzug** — trägt eine frühere Sitzung nach, die ohne Abschluss endete | **der nachzutragende Tag**, nicht heute |

**Eine Heuristik ist ausdrücklich unzulässig.** Der Skill schließt **nie** aus einem fehlenden
Stempel, einem alten Journaldatum oder einer Kontextlage selbst auf den Nachzugsfall. Fällt
einem Lauf auf, dass ein Vortag ohne Abschluss blieb, **meldet** er das in der Übergabe und
nennt den Aufruf `/nc:end-session nachzug` — er führt ihn nicht eigenmächtig aus. Grund: Ein
falsch geratener Nachzug schreibt die Arbeit von heute unter das Datum von gestern und
verfälscht damit genau die Chronologie, die das Sitzungswissen tragen soll.

Im **Nachzugsfall** gilt zusätzlich: Journal-Eintrag und Roll-up-Zeile tragen das Datum des
**nachgetragenen** Tages; `stand.md` wird trotzdem auf den **heutigen** Kenntnisstand
konsolidiert (er ist der aktuelle Stand, kein historischer); die Übergabe weist den Lauf
ausdrücklich als Nachzug aus.

## Ablauf

1. **Sitzung erfassen:** `git status --short` und `git log --oneline` seit Sitzungsbeginn; dazu
   die eigenen Arbeitsschritte — was wurde entschieden, gefunden, gebaut, verworfen.
2. **Zielort bestimmen — zwei Fälle, kein dritter:**
   - **Das Arbeits-Repo hat eine eigene Wissensbasis** (eine SSOT-Kategorie mit Master-Index —
     im OS-Repo heißt sie `knowledge-base/`): Das Sitzungswissen wohnt **committet**
     dort, unter `sitzungswissen/` — `sitzungswissen/roll-up.md`,
     `sitzungswissen/offene-straenge-register.md` sowie je Abteilung
     `sitzungswissen/<abteilung>/stand.md` und
     `sitzungswissen/<abteilung>/journal/<YYYY-MM-DD>.md`. Fehlt ein Baustein, wird er
     angelegt. Ist keine Abteilung bestimmbar, gilt `gemeinsam/`.
   - **Das Arbeits-Repo hat keine eigene Wissensbasis** (der Regelfall bei Kunden- und
     Fremd-Repos): Der Stand wird **allein** ins Projekt-Memory geschrieben (Schritt 5).
     **In einem fremden Arbeits-Repo entsteht kein Dateistrom** — es wird dort **kein**
     Verzeichnis angelegt, **keine** Datei geschrieben und **keine** `.gitignore` angefasst.

   **Der frühere lokale Strom `.nc/erinnerung/` ist aufgehoben.** Findet sich ein Altbestand
   unter `.nc/`, wird er **gemeldet, nicht benutzt und nicht weitergeschrieben**: Er ist eine
   Fundsache aus einem früheren Stand, keine Quelle. Ob er migriert oder gelöscht wird,
   entscheidet der Mensch — der Skill schlägt es vor und tut es nicht.
3. **Journal fortschreiben:** Eintrag an `sitzungswissen/<abteilung>/journal/<YYYY-MM-DD>.md`
   **anhängen** (Datei mit Datumsüberschrift anlegen, falls sie fehlt). Ohne eigene
   Wissensbasis entfällt dieser Dateistrom ersatzlos — der Inhalt geht dann allein in
   Schritt 5. Inhalt: Uhrzeit, bearbeitete
   Aufgaben, getroffene Entscheidungen mit Begründung, offene Punkte, nächste Schritte.
   Bestehende Zeilen werden nie geändert.
4. **Stand konsolidieren (Pflicht bei JEDEM Lauf, auch beim Nachzug):**
   `sitzungswissen/<abteilung>/stand.md` **neu schreiben** — nicht anhängen.
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
6. **Roll-up aktualisieren:** `sitzungswissen/roll-up.md` ist der verdichtete
   **Mehrtages-Überblick** über dem Tagesjournal — je Arbeitstag eine Zeile (Datum · Thema ·
   Ergebnis in einem Satz), jüngster Tag oben. Heutige Zeile ergänzen oder aktualisieren, ältere
   Zeilen bleiben unangetastet; fehlt die Datei, mit Kopfzeile und dieser Struktur anlegen.
7. **Offene-Stränge-Register pflegen (Pflichtschritt):** `sitzungswissen/offene-straenge-register.md`
   — **jeder** in dieser Sitzung ausgelagerte, geplante oder delegierte Strang (Pull Request,
   Bauplan, Backlog-Idee, vertagte Entscheidung, offener Praxistest, Folge-Session) wird
   eingetragen oder aktualisiert; Erledigtes bekommt ein Erledigt-Datum, Zeilen werden nie
   gelöscht. Fehlt die Datei, wird sie mit Kopf-Blockquote (Zweck + Pflege-Regeln) und der
   Tabelle `Datum · Strang · Verbleib · Nächster Schritt · Status` angelegt.
8. **Klassifikation + Kandidaten-Queue (Queue-Flow, Station 1).**
   **Zuerst die Freigabe-Prüfungen GL1–GL5** (Abschnitt 5.5 der Kern-Referenz
   `referenz/pflege-auspraegung.md`): Sie beantworten, ob ein Ergebnis den lokalen Scope
   überhaupt **verlassen darf**, und sind **Vetos mit Ziel-Routing** — sie stehen **nie** in
   der Spalte `erfülltes Kriterium`. **GL1** Sicherheitsbedenken (Zugangsdaten, Tokens,
   Kundendaten) → nur die verallgemeinerte Lehre ohne Auszug, sonst keine Zeile. **GL2**
   ausdrückliches Verbot des Menschen → **keine Zeile, ohne Abwägung und ohne
   Überredungsversuch**; **GL2 sticht immer**, auch über GF3. **GL3** personenbezogene Daten
   und User-Scope → Information **über** das Artefakt, nie das Artefakt; Rollen statt
   Personen. **GL4** Duplikat → Verweis statt neuer Zeile. **GL5** direkte Gegengründe →
   (i) Befund an einem fremden Repo, an einem **Affiliate-Plugin** oder an einem
   eigenständigen Kollegen-OS-Satelliten → **nie** die OS-Queue; (ii) unbelegte Vermutung →
   nicht eintragen oder als Vermutung kennzeichnen; (iii) laufender Strang → ins
   **Offene-Stränge-Register**, nicht in die Queue.
   **Danach** die Sitzungsergebnisse gegen die **Kriterien a–d** der Pflege-Ausprägung des installierten Abteilungsplugins halten
   (`pflege-auspraegung.json` an dessen Plugin-Wurzel; Format und Kriterienliste v2:
   `referenz/pflege-auspraegung.md` dieses Kern-Plugins `nc`) — **und vor dem Anhängen die
   Gegenkriterien GF1–GF4 anwenden** (Abschnitt 5.2 der Kern-Referenz), sie sind
   Handlungsanweisung, nicht nur Verweis: **GF1** — Bug/Finding eines **fremden Arbeits-Repos**
   → **nie** in die OS-Queue, sondern in den Ticket-Prozess des betreffenden Repos; **GF3** —
   **eigener Agenten-Fehler** → **immer** eine Queue-Zeile, auch ohne a–d-Treffer und
   zusätzlich zum Fehlerprotokoll-Eintrag (einziger Fall, in dem die Zweifelsregel nicht
   greift: im Zweifel **ein**tragen); **GF2/GF4** nach Abschnitt 5.2. Je verbleibendem Treffer
   **eine Zeile** an die `queue.md` der Abteilung **anhängen** — Pfad aus `queuePfad` der
   Ausprägung, aufgelöst gegen die Klon-Wurzel aus `abteilungsRepoPfade` der Infra-Registry
   (`~/.claude/nc/infra.json`); append-only, nie umschreiben. **Führt der Registry-Eintrag der
   Abteilung kein `repository`** (Abteilung ohne eigenen Satelliten — heute jede interne
   Abteilung), gilt die Regel `uebergang` der Ausprägung: Die Queue-Zeile wandert an den dort
   genannten Übergangsort und wird über den **regulären Branch/PR-Fluss des betreffenden
   Repos** eingebracht — **nicht** über `/nc:queue-abteilung`, der ausschließlich
   Abteilungs-Satelliten-Klone einreicht. Lässt sich der Übergangsort auf dieser Maschine
   nicht auflösen (kein Arbeitsklon des Ziel-Repos), wird der Kandidat als **nicht abgelegt**
   mit ausdrücklichem Handlungsbedarf in der Übergabe gemeldet — Verlust ist sichtbar, nicht
   still; dasselbe gilt, wenn `uebergang` fehlt. **Löst sich `queuePfad` nicht zu einer
   existierenden Datei auf** (Pfad ins Leere, Kategorie fehlt): **nichts anlegen**, nichts an
   einem Ersatzort ablegen und nichts raten — der Ist-Zustand wird als Befund gemeldet und auf
   `/nc:setup` verwiesen (Regel „Platte schlägt Registry" der Kern-Referenz, Abschnitt 3).
   **Sofort-Pfad-Fälle** (Major-Bug mit Teamwirkung · Sicherheitsvorfall · Release/Tag ·
   Verstoß gegen rote Linien) kommen zusätzlich als **eigener, deutlich markierter Block in
   die Übergabe (Schritt 10)** — mit ausdrücklich benanntem Handlungsbedarf an den Menschen;
   die Queue-Zeile entfällt dadurch **nicht**, sofern nach GF1–GF4 überhaupt ein
   Queue-Kandidat verbleibt — bis zum offenen Maintainer-Entscheid („Sofort-Pfad × GF1",
   `queue-flow.md` §6) schlägt **GF1**: Ein Sicherheitsvorfall in einem *fremden* Arbeits-Repo
   wird gemeldet, bekommt aber **keine** Queue-Zeile. Fehlt die Ausprägung oder die Registry: als
   **fehlendes Setup** melden und auf `/nc:setup` verweisen — nicht raten, keinen Ersatzort
   erfinden. Trifft **kein** Kriterium: kein Eintrag — das ist der Normalfall; Session-Agenten
   überschätzen die eigene Relevanz systematisch.
9. **Lokale Stufe abschließen — alle drei Scopes, keiner wird übersprungen.** Die lokale Ebene
   ist ein **Scope-Begriff, kein Ort** (OS-Repo: `knowledge-base/grundwissen/NovaCore-OS-Systemachsen.md`).
   Wer nur den Projekt-Scope
   abschließt, verliert regelmäßig genau das, was nirgends committet wurde.
   - **9a — Scratchpad-Scope erfassen (Pflicht):** Den Bestand des Session-Scratchpads
     überblicken. **Jeder Fund wird entschieden:** entweder **gerettet** (Journal, Stand,
     Memory — bei Firmenrelevanz zusätzlich die Queue-Zeile aus Schritt 8) **oder bewusst
     verworfen**, und dann in der Übergabe als „bewusst verworfen" ausgewiesen. **Nichts
     bleibt unbesehen liegen** — ein stiller Verlust ist ein Ausführungsfehler, kein
     Schicksal. Regeln: Standardprozess `scratchpad-nutzung.md` des OS-Repos (R1–R3).
     Existiert kein Scratchpad mehr (Aufräumlauf), wird **das** gemeldet.
   - **9b — Projekt-Scope:** uncommittete Änderungen und der Working Tree gehören zur
     Wissenslage. Was von ihnen erklärungsbedürftig ist, steht im Stand — nicht nur im Diff.
   - **9c — User-Scope:** maschinenweite Notizen und Erinnerungen. Sie sind durch **GL3**
     geschützt: In die SSOT geht die Information **über** ein Artefakt, nie das Artefakt.
   - **9d — Fehlerprotokoll prüfen:** Sind alle eigenen Fehler dieser Sitzung festgehalten?
     Im OS-Repo greift dessen append-only Fehlerprotokoll (`agent-learnings.md` der
     Wissensbasis), in jedem anderen Arbeits-Repo die dort geltende Konvention. Fehlt ein
     Eintrag: nachholen.
10. **Übergabe ausgeben:** geschriebene Dateien mit Pfad (Repo-Ablage **und** Projekt-Memory),
   Kern des Stands, offene Punkte und Register-Änderungen, das Ergebnis der
   Queue-Klassifikation (angehängte Zeilen mit Kriterium bzw. der Befund „keine Kandidaten";
   nicht abgelegte Kandidaten mit Handlungsbedarf), **jeder durch GL1–GL5 zurückgehaltene
   Kandidat als „bewusst nicht eingetragen"** — mit dem greifenden Kürzel, ohne den
   geschützten Inhalt selbst (die Entscheidung bleibt sichtbar, der Inhalt bleibt lokal),
   jeder Scratchpad-Fund aus Schritt 9a mit seiner Entscheidung (gerettet oder bewusst
   verworfen), ein eventueller **Sofort-Pfad-Block**
   (Schritt 8), der empfohlene Einstieg der nächsten
   Sitzung — plus, falls ein Commit ansteht, der Hinweis auf `/nc:wissen-aendern` für den
   Änderungsumfang und darauf, dass dieser Commit die Freigabe des Menschen braucht.
11. **Abschluss-Stempel setzen:** Als **letzten** Schritt den Stempel-Befehl ausführen, den die
    Mahn-Ausgabe des PreCompact-Hooks wörtlich nennt —
    `node "<hooks-Pfad>/nc-end-stempel.js" --session <key>`. Er markiert den Sitzungsabschluss;
    die PreCompact-Mahnung dieser Sitzung entfällt damit. `<key>` ist **derselbe
    `--session`-Schlüssel wie beim Start-Stempel**: Er steht in der Session-Start-Injektion und
    wird in jeder Gate-Ablehnung wörtlich wiederholt — er wird nie geraten und nie neu erfunden.
    Ohne vorangegangene Mahnung liegt das Skript im `hooks/`-Verzeichnis dieses Kern-Plugins `nc`.
    Erst **nach** den Schritten 3–10 stempeln — der Stempel ist der letzte Handgriff der Sitzung
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
  die Schritte 3–9 nicht wirklich erledigt sind — wer ohne Abschluss stempelt, hebelt den
  Verlustschutz genauso bewusst aus wie per Opt-out. Umgekehrt darf er nie fehlen, und die
  ausbleibende Mahnung ist kein Freibrief: Gemahnt wird nur die **erste** Kompaktierung einer
  Sitzung, danach geht ungesichertes Wissen still verloren.
- **Kein `.nc-os`-Repo-Marker nötig** (Altbestand vor Kern 0.6.0) — die Kontroll-Schicht ist
  markerlos aktiv, wo der Kern installiert ist. Der Skill sichert den Stand in jedem
  Arbeits-Repo; mit den Stempel-Dateien der Gates hat diese Regel nichts zu tun.

## Verifikation

- Der Journal-Eintrag ist per `tail -20 <zielort>/journal/<YYYY-MM-DD>.md` sichtbar und die
  Datei ist **länger** als vorher — Zeilenzahl vorher/nachher im Ergebnis ausweisen.
- Kein bestehender Journal-Block wurde verändert (per Diff oder Zeilenzahl-Vergleich belegen).
- `stand.md` des Zielorts existiert, ist unter 60 Zeilen und nennt einen konkreten nächsten
  Schritt.
- Die **Memory-Stand-Datei** ist mit Pfad und Änderungszeit ausgewiesen, ihre Indexzeile steht in
  `MEMORY.md`, und die abgelöste Vorgängerfassung ist in ihr als überholt benannt (nicht
  gelöscht). Ließ sich der Pfad nicht auflösen, liegt stattdessen die Meldung vor.
- Die heutige Roll-up-Zeile trägt das heutige Datum; die übrigen Zeilen sind unverändert (per
  Diff belegen).
- Das Register enthält für jeden in der Übergabe genannten ausgelagerten Strang eine Zeile mit
  Verbleib und nächstem Schritt.
- Die **Queue-Klassifikation ist belegt**: je Kandidat die angehängte Zeile (Diff der
  Queue-Datei zeigt ausschließlich Anhänge — append-only) samt erfülltem Kriterium — oder der
  ausdrückliche Befund „keine Kandidaten" bzw. der Übergangs-/Setup-Befund mit
  Handlungsschritt. Ein Sofort-Pfad-Fall steht als markierter Block in der Übergabe.
- **Der Zielort ist ausgewiesen** — entweder die geschriebenen `sitzungswissen/`-Pfade der
  eigenen Wissensbasis, oder ausdrücklich „kein Dateistrom, Projekt-Memory trägt allein".
  Ein gefundener `.nc/`-Altbestand ist als Fundsache **gemeldet**, nicht benutzt worden.
- **Jeder Scratchpad-Fund trägt eine Entscheidung** (gerettet oder bewusst verworfen) —
  Schritt 9a lässt nichts unbesehen liegen.
- Die Übergabe listet jede geschriebene Datei mit vollem Pfad.
- Der **Abschluss-Stempel ist gesetzt** (Bestätigungszeile „Abschluss-Stempel gesetzt" des
  Stempel-Skripts liegt vor) — er ist der einzige Nachweis, dass WP8 lief; die Mahnung kommt
  höchstens einmal je Sitzung und ersetzt die Prüfung nicht.
