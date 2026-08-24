---
name: wissen-protokolle
description: >-
  Nennt die beiden append-only Protokolle der Wissensbasis des OS-Repos — das Fehlerprotokoll
  der eigenen Agenten-Fehler und das Debug-Log gefundener oder behobener Bugs — samt
  Eintragspflicht und Eintragsformat, dazu die append-only Register des Wissensflusses
  (Kandidaten-Queue, Queue-Protokolle). Liefert Zeiger auf die Quellen, nie deren Inhalt.
  Einschlägig, wenn ein eigener Fehler passiert ist (Pflichteintrag, sofort), wenn vor einer
  neuen Aufgabe bekannte Fehlermuster geprüft werden, oder wenn ein Bug gefunden bzw. behoben
  wurde — Fragen wie „ist dieses Symptom bekannt", „wo halte ich das fest", „welche Fallen
  sind protokolliert". Trigger-Begriffe: agent-learnings, Fehlerprotokoll, Debug-Log, debug,
  eigener Fehler, falsche Annahme, falscher Pfad, Symptom bekannt, Bug gefunden, Bug behoben,
  Lehre festhalten, Fehlermuster, append-only. Nicht zuständig für den Umfang einer Änderung
  (Router wissen-aendern), für laufende Vorhaben (Router wissen-planen) und für die
  Bestandsfrage (Router wissen-nachschlagen).
---

# /nc:wissen-protokolle — Router: Fehlerprotokoll und Debug-Log

## Zweck

Wissens-Router der ständigen Abteilung `gemeinsam` (Kern-Plugin `nc`): macht die beiden
laufenden Protokolle präsent, die das OS aus eigenen Fehlern lernen lassen. Sie sind der
einzige Ort, an dem eine Lehre dauerhaft haftet — wird ein Fehler nicht eingetragen, ist er in
der nächsten Sitzung verloren. Daneben nennt er die **append-only Register des
Wissensflusses** (Kandidaten-Queue, Queue-Protokolle), die derselben Regel folgen: anhängen,
nie umschreiben. Der Skill liefert **Zeiger, niemals Inhalt** und greift
begleitend zu jedem Arbeitsschritt (WP1–WP8 des Rahmens `wp-rahmen.md` im Kern-Plugin `nc`).

## Ablauf

1. **Wissensbasis lokalisieren.** Der Skill läuft auch in fremden Arbeits-Repos, in denen die
   OS-Wissensbasis nicht existiert. Ihr Pfad steht in der Infra-Registry
   `~/.claude/nc/infra.json`: **zuerst** `kernRepoPfad` (Arbeitsklon des OS-Repos — heute ein
   optionales Feld), **sonst** `kernSsotPfad` (Lesekopie, die `/nc:setup` anlegt). Fehlen
   beide Felder oder das Verzeichnis dahinter, wird das **ausdrücklich als Übergangs-Befund
   gemeldet** und `/nc:setup` als Reparaturweg genannt — nicht raten, keinen Pfad erfinden,
   nicht schweigen. **Geschrieben wird nur im Arbeitsklon, nie in der Lesekopie:** Ein Eintrag
   in der Lesekopie wäre beim nächsten Fast-Forward verloren; steht nur sie zur Verfügung,
   wird der Eintrag dem Menschen als Text zur Übernahme übergeben.
2. **Richtung bestimmen.** *Lesen* vor einer neuen Aufgabe (welche eigenen Fehlermuster sind
   bekannt, ist das Symptom schon dokumentiert) oder *schreiben* nach einem Vorfall.
3. **Protokoll wählen:** eigener Fehler der Arbeit → Fehlerprotokoll; gefundener oder
   behobener Bug, auch an fremdem Material → Debug-Log.
4. **Format aus der Zieldatei übernehmen** — beide Dateien tragen ihr Format im Kopf. Nicht
   raten, nicht eine zweite Form erfinden.
5. **Sofort eintragen, ans Ende.** Nicht sammeln, nicht beschönigen, nicht rückdatieren,
   bestehende Einträge nie umschreiben.

## Zeiger

Alle Pfade sind relativ zur Wissensbasis `knowledge-base/` des **OS-Repos**, sofern nicht als
Kern-Plugin-Datei gekennzeichnet.

| Quelle | Einschlägig wenn … |
|---|---|
| `debugging-findings/agent-learnings.md` | ein **eigener** Fehler passiert ist — falsche Annahme, falscher Pfad, fehlgeschlagener Befehl durch eigenes Verschulden, falsch umgesetztes Format (Pflichteintrag, sofort); oder vor einer neuen Aufgabe bekannte Fehlermuster geprüft werden |
| `debugging-findings/debug-log.md` | ein Bug oder Fehlbefund gefunden bzw. behoben wurde — an eigenem Code, an Konfiguration, an der Doku oder an einem Vorbild, unabhängig vom Verursacher (Kurzinfo was/wann/wie); oder geprüft wird, ob ein Symptom bereits bekannt ist |
| `debugging-findings/` | die Kategorie als Ganzes gebraucht wird — sie führt **genau diese zwei** laufenden Protokolle, kein weiteres |
| `kandidaten-queue/queue.md` | nachgesehen wird, welches Sitzungsergebnis zum Aufstieg in die Kern-SSOT ansteht oder welche Zeile welchen Status trägt — append-only, fünf Spalten; das **Format** steht in `referenz/pflege-auspraegung.md` des Kern-Plugins `nc`, der **Ablauf** im Standardprozess `queue-flow.md` (Router `/nc:wissen-aendern`) |
| `queue-protokolle/` | ein committetes Prüfprotokoll eines Kern-Aufstiegslaufs gesucht oder abgelegt wird — je Lauf ein Dokument, nie rückwirkend geändert |

## Regeln

- **Zeiger statt Inhalt.** Der Skill zählt keine Protokolleinträge in seinem Body auf — sie
  wachsen mit jeder Sitzung und wären hier sofort veraltet.
- **Eintragspflicht ist kein Ermessen.** Jeder einzelne eigene Fehler wird eingetragen, auch
  der kleine und auch der peinliche. Ein nicht eingetragener Fehler wiederholt sich. Die
  Pflicht selbst steht in der Änderungs-Matrix (Zeile „Protokolleintrag fällig"); den Weg
  dorthin nennt der Router `/nc:wissen-aendern`.
- **Append-only.** Einträge werden nie rückdatiert, nie umgeschrieben, nie gelöscht — auch
  nicht „zur Straffung". Ein widerlegter Eintrag bekommt einen **neuen**, der auf ihn verweist.
- **Keine Secrets, keine Tokens, keine personenbezogenen Details** in Protokolleinträgen; die
  Wissensbasis des OS-Repos ist öffentlich.
- **Fehlende Registry wird benannt, nicht überspielt** — mit dem Verweis auf `/nc:setup`.
- **Rote Linien bleiben unberührt:** Der Eintrag entsteht lokal; Commit, Push und PR bleiben
  beim Menschen.

## Verifikation

- Der genannte Wissensbasis-Pfad ist real, oder der Übergangs-Befund samt
  `/nc:setup`-Hinweis ist ausgegeben.
- Nach einem Vorfall: Der Eintrag steht **am Ende** der Zieldatei, im Format der Datei, mit
  Datum — Gegenprobe durch erneutes Lesen der letzten Zeilen.
- Vor einer Aufgabe: Die geprüften Fehlermuster sind benannt (auch „keine einschlägigen
  gefunden" ist ein Ergebnis).
- Kein bestehender Eintrag wurde verändert — Gegenprobe über den Diff der Zieldatei.
