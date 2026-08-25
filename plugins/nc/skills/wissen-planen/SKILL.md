---
name: wissen-planen
description: >-
  Nennt die Knotendokumente zum Stand laufender und abgeschlossener Vorhaben — datierte
  Baupläne und dauerhafte Referenzen der Wissensbasis des OS-Repos, Bauplan-Archiv,
  Ideen-Backlog — sowie das Sitzungswissen des Arbeits-Repos mit Offene-Stränge-Register,
  Roll-up, Stand und Journal. Liefert Zeiger auf die Quellen, nie deren Inhalt, und schreibt
  nichts. Einschlägig, wenn ein Vorhaben geplant, aufgenommen oder fortgesetzt wird — Fragen
  wie „was läuft gerade", „gibt es dazu schon einen Plan", „was ist noch offen", „wo blieb
  Strang X", „ist die Idee schon notiert". Trigger-Begriffe: Bauplan, Design-Spec, Roadmap,
  laufendes Vorhaben, offene Stränge, Übergabe, parallele Arbeitseinheit, Bauplan-Archiv,
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
   dagegen **im aktuellen Arbeits-Repo**: Führt es eine eigene Wissensbasis (im OS-Repo
   `knowledge-base/`), wohnt es dort unter `sitzungswissen/`; sonst entsteht **kein
   Dateistrom** — das Projekt-Memory von Claude Code trägt den Stand allein (`/nc:start`
   bestimmt den zutreffenden Fall). Der frühere lokale Strom `.nc/erinnerung/` ist
   abgeschafft.
2. **Vom Groben ins Feine.** Erst die Kategorie der laufenden Vorhaben sichten (Dateinamen
   tragen ein Datumspräfix), dann das einschlägige Dokument öffnen. Bei mehreren Ständen
   gewinnt der **jüngste Nachtrag**; Versionsnummern sind kein Aktualitätsnachweis.
3. **Offene Stränge prüfen,** bevor ein neuer Strang geöffnet wird — das Register nennt, wo
   ein ausgelagerter Punkt verblieben ist und was sein nächster Schritt wäre.
4. **Fremde Worktrees prüfen,** wenn parallel gearbeitet wird (`git worktree list` + Status
   in jedem fremden Baum) — das frühere Anker-Reservierungsmittel ist aufgehoben
   (`os-bau-methode.md`, Begriffsnorm „Anker").
5. **Ergebnis übergeben:** einschlägige Dokumente mit Pfad und Einzeiler, plus die explizite
   Aussage „dazu existiert kein Plan", wenn nichts gefunden wurde.

## Zeiger

Pfade der ersten Gruppe sind relativ zur Wissensbasis `knowledge-base/` des **OS-Repos**; die
`sitzungswissen/`-Pfade liegen dort ebenfalls, sofern das aktuelle Arbeits-Repo eine eigene
Wissensbasis führt — sonst gibt es keinen Pfad, das Projekt-Memory trägt den Stand allein.

| Quelle | Einschlägig wenn … |
|---|---|
| `grundwissen/` | ein Begriff (SSOT, Gate, CLAUDE-Ebene) erklärt oder ein Design begründet werden soll — dauerhafte Begriffsnormen und Design-Specs ohne Datumspräfix. Laufende Baupläne liegen seit Phase I **nicht mehr** hier, sondern in `aktive-bauplaene/` |
| `aktive-bauplaene/` | zu klären ist, was gerade läuft — datierte Baupläne (inkl. Delta-Mappings, Ausführungsplänen) mit Präfix `YYYY-MM-DD-`, je Vorhaben ein Dokument; **Arbeitsplatz**, eigene Pläne kommen hierher |
| `bauplan-archiv/` | das **Warum** einer bestehenden Struktur gebraucht wird — abgeschlossene und verworfene Pläne, unverändert übernommen, terminal |
| `ideen-backlog/` | eine Idee auftaucht (ablegen statt vergessen) oder Kandidaten für die nächste Iteration gesucht werden — je Idee ein Dokument mit Datumspräfix; eine Idee ist **kein** Bauplan |
| `sitzungswissen/offene-straenge-register.md` | gesucht wird, wo ein ausgelagerter, geplanter oder delegierter Strang verblieben ist — append/update, erledigte Zeilen bleiben mit Datum stehen |
| `sitzungswissen/roll-up.md` | der Mehrtagesstand gestreift wird — eine Zeile je Arbeitstag (Datum · Thema · Ergebnis), jüngster Tag oben |
| `sitzungswissen/<abteilung>/stand.md` | der konsolidierte Sitzungsstand gebraucht wird |
| `sitzungswissen/<abteilung>/journal/` | der Verlauf eines bestimmten Arbeitstags gebraucht wird — je Tag eine Datei |
| `standardprozesse/os-bau-methode.md` | begründet werden soll, was ein „Anker" ist und wie eine Doppelvergabe verhindert wird (Mechanik statt Reservierung) |
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
  `/nc:setup`-Hinweis ist ausgegeben; für das Sitzungswissen ist geprüft, ob das Arbeits-Repo
  eine eigene Wissensbasis führt — dann die Existenz von `sitzungswissen/`, sonst der
  ausdrückliche Befund „kein Dateistrom, Projekt-Memory trägt allein".
- Jedes genannte Dokument wurde geöffnet; Datum und Status stehen in der Antwort.
- Wurde nichts gefunden, steht der Satz „dazu existiert kein Plan" ausdrücklich da — statt
  einer stillen Leerantwort.
- Wird parallel gearbeitet, ist die Worktree-Prüfung (`git worktree list` + Status)
  ausdrücklich erfolgt.
