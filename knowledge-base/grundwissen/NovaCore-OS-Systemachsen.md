# Systemachsen des NovaCore-OS — Definition (Grundsatzdokument)

> **Zweck:** Die drei **Systemachsen** des OS an einem Ort benennen und gegeneinander
> abgrenzen — plus die **Definition der lokalen Wissensebene**. Normative Begriffsquelle: Wer
> einen Skill, einen Hook oder ein Dokument einer Achse zuordnen muss, entscheidet das hier und
> nicht neu im Einzelfall.
>
> **Herkunft:** Port der Onsite-Systemachsen (`project-meta-infos/Onsite.ai-OS-Systemachsen.md`,
> live gelesen gegen `origin/main@2530ced`, Kern 0.26.0), beauftragt als **D26** im
> [Delta-Mapping](../aktive-bauplaene/2026-08-23-onsite-delta-mapping.md) (Nachtrag N2) und
> gebaut als AP-C1 des
> [Phase-I-Bauplans](../aktive-bauplaene/2026-08-24-onsite-delta-phase-i-bauplan.md).
> Die Achsen-Systematik ist übernommen; **der Ist-Stand je Achse ist der NovaCore-eigene** und
> weicht an zwei Stellen bewusst vom Vorbild ab (unten je Achse benannt).
>
> **Verhältnis zu den Nachbardokumenten:** Was „SSOT" bedeutet, steht in der
> [SSOT-Definition](NovaCore-OS-SSOT-Definition.md); *welche* Dokumente es gibt, im
> [SSOT-Document-Index](../SSOT-Document-Index.md); *was* eine Änderung anfassen muss, im
> [Aktualisierungs-Index](../standardprozesse/aktualisierungs-index.md); *welche* Dokumente
> Knoten sind, in der [Node-Doks-Definition](NovaCore-OS-Node-Doks-Definition.md). Dieses
> Dokument sagt, **welche Maschinerie wofür zuständig ist**.

## Warum dieses Dokument

Das OS trägt Skills, Hooks und Standardprozesse, die alle irgendwie „mit der SSOT zu tun
haben". Ohne benannte Achsen wird die Zuordnung eines Werkzeugs bei **jeder** Frage neu
hergeleitet — und fällt jedes Mal anders aus: mal gilt `/nc:update-doks` als Verteilwerkzeug,
mal als Prüfwerkzeug; mal zählt das Projekt-Memory zur SSOT, mal als Privatnotiz. Die Folge
sind widersprüchliche Doku-Aussagen, doppelt gebaute Mechanik und Entscheidungen, die niemand
mehr nachvollziehen kann.

## Die drei Achsen auf einen Blick

| # | Achse | Frage, die sie beantwortet | Bewegt sich … | Kernwerkzeuge |
|---|---|---|---|---|
| **1** | **Wissensfluss (SSOT)** | Wie kommt ein Wissensstück von der Sitzung ins Firmenwissen? | **nach oben** (lokal → Abteilung → Kern) | `/nc:end-session` · `/nc:queue-abteilung` · `/nc:queue-kern` · **zweimal Mensch** |
| **2** | **Auslieferung der Firmen-Doks** | Wie kommt fertiges Firmenwissen auf **eine Maschine**? | **nach außen/unten** (Kern → jede Maschine) | `nc-doks-autosync.js` (CLAUDE-Ebenen 1 und 1b) · `/nc:setup` als Reconciler der Infrastruktur |
| **3** | **Instandhaltung der SSOT-Dokumente** | Wie bleiben die Dokumente selbst korrekt und widerspruchsfrei? | **in sich** (Bestand → geprüfter Bestand) | `/nc:update-doks` · der `Aktualisierungs-Index` als Datengrundlage · die vier `wissen-*`-Router als Zeiger |

Merksatz: **Achse 1 sammelt ein, Achse 2 liefert aus, Achse 3 hält instand.**

**Jedes Werkzeug gehört zu genau einer Achse.** Beantwortet ein Skill zwei dieser Fragen, ist
er falsch geschnitten und wird **geteilt**, nicht in Funktionen zerlegt. Genau daran ist die
frühere F1/F2-Zweiteilung von `/nc:update-doks` gescheitert — ein Skill, der reparierte *und*
prüfte, gehörte zwei Achsen gleichzeitig an.

---

## Achse 1 — Wissensfluss (SSOT)

**Der Weg ist dreistufig:** lokale Stufe → Abteilungs-SSOT → Kern-SSOT.

| Stufe | Übergang | Wer entscheidet | Prüfapparat |
|---|---|---|---|
| **lokal → Abteilung** | `/nc:end-session` klassifiziert und schreibt die Queue-Zeile | **Agent**, gebunden an Kriterien und Vetos | Kriterien **a–d** und Gegenkriterien **GF1–GF4** als Eintrittsfrage; **GL1–GL5** als Freigabe-Vetos (`plugins/nc/referenz/pflege-auspraegung.md` Abschnitt 5.5) |
| **Abteilung → Kern** | `/nc:queue-abteilung` stellt den PR, `/nc:queue-kern` prüft den Aufstieg | **zweimal Mensch** — beide Merges sind Maintainer-Sache | No-Duplicate-Regel, Protokoll je Lauf (`queue-protokolle/`) |

**Die lokale Stufe ist kein Speicher.** Sie ist ein Klassifikations- und Kriterien-Apparat in
`/nc:end-session`; eine eigene Queue-Datei auf lokaler Ebene gibt es bewusst **nicht**.

**Affiliate-Ausnahme (hart, Entscheid P-E7 / Affiliate-Invariante N1.1):** Affiliate-Plugins
(Marketplace-Kategorie `affiliate`) sind **keine Abteilungen** und hängen an **keiner** Stufe
dieser Achse. Ein Befund an einem Affiliate-Satelliten erzeugt **nie** eine Queue-Zeile — er
gehört in dessen eigenes Repo. Dasselbe gilt für die eigenständigen Kollegen-OS-Satelliten
(`nc-felix`, `nc-biggi`): terminal, kein Queue-Weg, kein Memory-Share.

### Ist-Stand

Gebaut sind alle drei Stationen. **Übergangszustand:** Die Abteilung `development` liegt
repo-intern ohne eigenen Satelliten; ihre Queue läuft deshalb über den regulären
Branch/PR-Fluss dieses Repos, nicht über `/nc:queue-abteilung`. Beide Queue-Skills werden erst
mit dem ersten Abteilungs-Satelliten wirksam — die **Praxisprobe steht damit aus**.

---

## Achse 2 — Auslieferung der Firmen-Doks auf eine Maschine

Diese Achse verteilt **Instruktions-Payloads**, nicht Wissen: Der Doks-Autosync-Hook schreibt
die CLAUDE-Ebene 1 (`doks/global-claude-firmenblock.md` als Markerblock) und die Ebene 1b
(`nc-sync.md` als Ganzdatei nach `~/.claude/nc-teamsync.md`) auf die Maschine. Die
**Wissensbasis selbst wird nie ausgeliefert** — sie wird von `/nc:setup` nach
`~/.nc/ssot/<repo-name>/` **geklont** und per Fast-Forward aktuell gehalten.

### Ist-Stand und Abweichung vom Vorbild

Onsite trennt den Maschinen-Teil in einen eigenen Maintenance-Skill („CLAUDE-Netz-Aktualisierer",
dort Entscheid A3 — **geplant, nicht gebaut**). **Bei NovaCore gibt es diesen Skill nicht, und
es gibt auch keinen Entscheid dafür** — die Reparatur- und Erstlauf-Rolle trägt heute
`/nc:setup` als Reconciler (S0–S6). Ob wir Onsites Trennung übernehmen, ist ein **offener
Punkt**; dieses Dokument benennt ihn und entscheidet ihn nicht.

---

## Achse 3 — Instandhaltung der SSOT-Dokumente selbst

Gegenstand ist der **Bestand der Wissensbasis**: Kreuzverweise, Pfade, Konsistenz zwischen den
Knotendokumenten. Werkzeug ist `/nc:update-doks` mit dem `Aktualisierungs-Index` als
Datengrundlage; die vier `wissen-*`-Router zeigen auf die zuständigen Knoten, statt Inhalt zu
kopieren.

**Nicht Gegenstand dieser Achse** ist das **ausgelieferte Laufzeit-Regelwerk** unter
`plugins/<name>/referenz/` (`skill-authoring.md`, `agent-authoring.md`,
`pflege-auspraegung.md`). Es gehört zur **Produktklasse**, nicht zur Wissensklasse
(Aktualisierungs-Index §0), wird mit dem Plugin versioniert und ausgeliefert und bekommt
deshalb **keine** SSOT-Index-Zeile — Begründung in der
[SSOT-Definition](NovaCore-OS-SSOT-Definition.md).

### Ist-Stand und Abweichung vom Vorbild

`/nc:update-doks` ist bei uns **bereits** der Ein-Aufgaben-Skill: Die F1/F2-Zweiteilung wurde
mit Phase H (Mapping D9, Kern 0.12.0) entfernt. Onsites Dokument trägt an dieser Stelle eine
Ist-Klammer („der Maschinen-Teil wohnt heute noch mit"); **bei uns ist sie gegenstandslos** —
was dort Zielbild ist, ist hier gebauter Zustand.

---

## Die lokale Ebene — Definition

**Die lokale Ebene ist ein SCOPE-Begriff, kein einzelner Ort.** Sie bezeichnet nicht ein
Verzeichnis, sondern die Reichweite „gilt hier, auf dieser Maschine, in diesem Kontext" — und
zerfällt in **drei** Scopes.

### Projekt-Scope

Alles, was an **ein Projekt** gebunden ist:

- **das lokal liegende Arbeits-Repo einschließlich seiner uncommitteten Änderungen** — der
  Working Tree ist Teil der lokalen Wissenslage, nicht erst der Commit; und
- **das Projekt-Memory** — der maschinenlokale Roh-Stand. `/nc:end-session` schreibt ihn,
  `/nc:start` liest die **jüngste** Fassung als Pflichtquelle **vor** der commit-getakteten
  Repo-SSOT und **benennt Widersprüche, statt sie zu glätten**. Der **einzige Aufstiegsweg**
  von dort in Firmen-Artefakte ist die Queue (Achse 1) — nichts wird still zu Firmenwissen.

Hier liegt der überwiegende Teil der lokalen Wissensbestände. Eine Quote wird bewusst **nicht**
genannt — sie wurde nie erhoben.

### User-Scope

Erinnerungen und Notizen auf **User-Ebene**: maschinenweit gültig, **nicht** projektgebunden —
das, was über alle Repos hinweg für diesen Arbeitsplatz gilt.

### Scratchpad-Scope

Das **Session-Scratchpad** von Claude Code: flüchtig (der Session-Aufräumlauf kann es jederzeit
löschen), sitzungslokal, **nicht indizierbar**. Es ist **kein Finalitäts-Ort**: Die Nutzung als
freier Arbeitsplatz bleibt erlaubt — Leitplanke statt Verbot, **Arbeiten ja, Finalität nein**.
Die Verwendungsregeln R1–R3 stehen im Standardprozess
[`scratchpad-nutzung.md`](../standardprozesse/scratchpad-nutzung.md); am Sitzungsabschluss
behandelt `/nc:end-session` den Bestand als **klassifizierende Quelle** (Schritt 9a).

Der Scratchpad-Scope hat bewusst **keinen** Eintrag im Pfad-Änderungsindex: Dort stehen
Pfadklassen mit stabilem Inhaltssinn, und genau den hat ein sitzungsephemeres Verzeichnis
nicht.

### Was **nicht** mehr existiert

**`.nc/erinnerung/` existiert nicht mehr** — der lokale Dateistrom ist mit Phase I
(2026-08-24, Entscheide EN1/P-E4) aufgehoben. Er war un-getrackt, veraltete unbemerkt und wurde
von niemandem zurückgelesen.

- **In Repos mit eigener Wissensbasis** wohnt das Sitzungswissen in deren
  `sitzungswissen/`-Kategorie (**Residenzpflicht**, unangetastet).
- **In fremden Arbeits-Repos** trägt das **Projekt-Memory** den Stand **allein** — dort
  entsteht **kein** Dateistrom. Das ist ein **Verhaltensbruch** gegenüber allen früheren
  Ständen und gilt auf jeder Team-Maschine.
- Der `.gitignore`-Eintrag `.nc/` bleibt als **Schutz gegen Altstände**, ausdrücklich **nicht**
  als zugesagter Ablageort.
- Nennungen in **historischen** Dokumenten (Bauplan-Archiv, CHANGELOG-Alteinträge,
  append-only-Protokolle, datierte Specs) werden **nicht rückwirkend umgeschrieben**.

---

## Verwechslungen, die diese Definition verhindern soll

- **Die lokale Ebene ist kein Ordner.** Wer sie als Pfad sucht, findet entweder zu wenig
  (Working Tree vergessen) oder das Falsche (`.nc/erinnerung/`).
- **Die lokale Stufe ist kein Speicher**, sondern ein Klassifikations-Apparat in
  `/nc:end-session`.
- **Achse 2 ist nicht „die SSOT".** Sie verteilt Instruktions-Payloads; die Wissensbasis selbst
  wird geklont, nie ausgeliefert.
- **`/nc:update-doks` gehört zu Achse 3**, nicht zu Achse 2 — er hält Dokumente instand, er
  verteilt nichts.
- **Ein Affiliate ist keine Abteilung.** Wer ihn in Achse 1 einsortiert, baut einen Queue-Weg,
  den es nicht geben darf (P-E7).
- **Das ausgelieferte `referenz/`-Regelwerk ist Produktklasse**, nicht Wissensklasse — es
  bekommt keine SSOT-Index-Zeile und wird mit dem Plugin versioniert.

---

*Angelegt 2026-08-24 durch Claude (Opus 5, Claude Code) als Overseer auf Weisung Lucas
Vöhringer — AP-C1 des Phase-I-Bauplans, Mapping-Position D26. Quelle: Onsite.ai-OS
`origin/main@2530ced` (Kern 0.26.0), live gelesen. Normative Begriffsquelle für die
Systemachsen und die lokale Ebene; bei Widerspruch zu einem späteren datierten Nachtrag gewinnt
der Nachtrag, und dieses Dokument wird in derselben Änderung nachgezogen.*
