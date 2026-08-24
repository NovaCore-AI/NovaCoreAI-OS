---
name: wissen-planen
description: >-
  Nennt die Knotendokumente zum Stand laufender und abgeschlossener Vorhaben — datierte
  Baupläne und dauerhafte Referenzen der Wissensbasis des OS-Repos, Bauplan-Archiv,
  Ideen-Backlog, Anker-Reservierung bei paralleler Arbeit — sowie das Sitzungswissen des
  Arbeits-Repos mit Offene-Stränge-Register, Roll-up, Stand und Journal. Liefert Zeiger auf
  die Quellen, nie deren Inhalt, und schreibt nichts. Einschlägig, wenn ein Vorhaben geplant,
  aufgenommen oder fortgesetzt wird — Fragen wie „was läuft gerade", „gibt es dazu schon einen
  Plan", „was ist noch offen", „wo blieb Strang X", „ist die Idee schon notiert", „welcher
  Anker ist frei". Trigger-Begriffe: Bauplan, Design-Spec, Roadmap, laufendes Vorhaben, offene
  Stränge, Übergabe, Anker reservieren, parallele Arbeitseinheit, Bauplan-Archiv,
  Ideen-Backlog, Sitzungsstand, Roll-up, Journal. Nicht zuständig für den Umfang einer
  Änderung (Router wissen-aendern) und für die Frage, welches Dokument überhaupt existiert
  (Router wissen-nachschlagen).
---

# /nc:wissen-planen — Router: was läuft, was offen ist, was schon geplant war

## Zweck

Wissens-Router der ständigen Abteilung `gemeinsam` (Kern-Plugin `nc`): macht die
**Knotendokumente des Arbeitsstands** präsent — laufende Baupläne, bereits Erarbeitetes, der
Mehrtagesstand und die offenen Stränge. Er beugt der teuersten Doppelarbeit vor: etwas neu
herleiten, das längst geplant ist. Der Skill liefert **Zeiger, niemals Inhalt** und greift bei
WP0/WP1 des Rahmens `wp-rahmen.md` im Kern-Plugin `nc`.

## Ablauf

1. **Quellen lokalisieren.** Zwei Orte, zwei Wege. Die Wissensbasis des OS-Repos steht in der
   Infra-Registry `~/.claude/nc/infra.json`: **zuerst** `kernRepoPfad` (Arbeitsklon des
   OS-Repos — aktueller Stand; heute ein optionales Feld), **sonst** `kernSsotPfad`
   (Lesekopie, die `/nc:setup` anlegt). Fehlen beide Felder oder das Verzeichnis dahinter,
   wird das **ausdrücklich als Übergangs-Befund gemeldet** und `/nc:setup` als Reparaturweg
   genannt — nicht raten, keinen Pfad erfinden, nicht schweigen. Das Sitzungswissen liegt
   dagegen **im aktuellen Arbeits-Repo** unter
   `.nc/erinnerung/`; fehlt es dort, ist das kein Registry-Problem, sondern ein noch nicht
   eingerichtetes Repo.
2. **Vom Groben ins Feine.** Erst die Kategorie der laufenden Vorhaben sichten (Dateinamen
   tragen ein Datumspräfix), dann das einschlägige Dokument öffnen. Bei mehreren Ständen
   gewinnt der **jüngste Nachtrag**; Versionsnummern sind kein Aktualitätsnachweis.
3. **Offene Stränge prüfen,** bevor ein neuer Strang geöffnet wird — das Register nennt, wo
   ein ausgelagerter Punkt verblieben ist und was sein nächster Schritt wäre.
4. **Anker klären,** wenn parallel gearbeitet wird: reservierte Namen und Zielversionen stehen
   als `reserve/*`-Refs im Remote, nicht in einem Dokument.
5. **Ergebnis übergeben:** einschlägige Dokumente mit Pfad und Einzeiler, plus die explizite
   Aussage „dazu existiert kein Plan", wenn nichts gefunden wurde.

## Zeiger

Pfade der ersten Gruppe sind relativ zur Wissensbasis `knowledge-base/` des **OS-Repos**; die
Pfade unter `.nc/erinnerung/` liegen im **aktuellen Arbeits-Repo**.

| Quelle | Einschlägig wenn … |
|---|---|
| `grundwissen/` | zu klären ist, was gerade läuft — datierte Baupläne und Design-Specs mit Präfix `YYYY-MM-DD-`, je Vorhaben ein Dokument; **Arbeitsplatz**, eigene Pläne kommen hierher. Im selben Ordner liegen die dauerhaften Referenzen ohne Datumspräfix (Produktvision, Begriffsnormen) |
| `bauplan-archiv/` | das **Warum** einer bestehenden Struktur gebraucht wird — abgeschlossene und verworfene Pläne, unverändert übernommen, terminal |
| `ideen-backlog/` | eine Idee auftaucht (ablegen statt vergessen) oder Kandidaten für die nächste Iteration gesucht werden — je Idee ein Dokument mit Datumspräfix; eine Idee ist **kein** Bauplan |
| `.nc/erinnerung/offene-straenge-register.md` | gesucht wird, wo ein ausgelagerter, geplanter oder delegierter Strang verblieben ist — append/update, erledigte Zeilen bleiben mit Datum stehen |
| `.nc/erinnerung/roll-up.md` | der Mehrtagesstand gestreift wird — eine Zeile je Arbeitstag (Datum · Thema · Ergebnis), jüngster Tag oben |
| `.nc/erinnerung/stand.md` | der konsolidierte Sitzungsstand gebraucht wird |
| `.nc/erinnerung/journal/` | der Verlauf eines bestimmten Arbeitstags gebraucht wird — je Tag eine Datei |
| `standardprozesse/anker-reservierung.md` | ein knapper Anker vor Baubeginn zu vergeben ist (parallele Arbeitseinheiten, Freigabe-Regel, Aufräum-Pflicht) |
| `grundwissen/NovaCore-OS-Anker-Reservierung-Definition.md` | begründet werden soll, **warum** Anker vor dem Bau reserviert werden |
| `standardprozesse/sync-nachzug-bauzyklus.md` | mehrere Arbeitseinheiten parallel bauen und Konfliktzonen zu schneiden sind |

## Regeln

- **Zeiger statt Inhalt.** Pläne werden geöffnet, nicht nacherzählt; dieser Skill kopiert
  keinen Planinhalt in seinen Body.
- **Der Skill schreibt nichts.** Stand, Tagesjournal, Roll-up und Register pflegen `/nc:start`,
  `/nc:journal` und `/nc:end-session` — hier wird nur gelesen.
- **Datum schlägt Version.** Aktualität eines Plans ergibt sich aus Datumsstempel und Status
  (`lebend`/`historisch`), nie aus einer Produktversion.
- **Ein abgeschlossener Plan gehört ins Archiv** — wird ein erledigter Plan noch bei den
  laufenden Vorhaben gefunden, wird das gemeldet, nicht stillschweigend geduldet.
- **Fehlende Registry wird benannt, nicht überspielt** — mit dem Verweis auf `/nc:setup`.
- **Rote Linien bleiben unberührt:** kein Commit, kein Push, keine PR-Erstellung, kein Merge,
  nichts Kundensichtbares.

## Verifikation

- Der genannte Wissensbasis-Pfad ist real, oder der Übergangs-Befund samt
  `/nc:setup`-Hinweis ist ausgegeben; für das Sitzungswissen ist die Existenz von
  `.nc/erinnerung/` im Arbeits-Repo geprüft.
- Jedes genannte Dokument wurde geöffnet; Datum und Status stehen in der Antwort.
- Wurde nichts gefunden, steht der Satz „dazu existiert kein Plan" ausdrücklich da — statt
  einer stillen Leerantwort.
- Wird parallel gearbeitet, ist die Anker-Lage genannt (reserviert oder frei), belegt über die
  `reserve/*`-Refs des Remotes.
