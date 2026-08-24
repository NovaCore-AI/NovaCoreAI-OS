# Queue-Flow — Standardprozess

> **Der Weg eines Wissensstücks von der Sitzung in die Kern-SSOT.** Verbindlich für alle
> Abteilungen **mit Kern-Dependency** — heute allein `development`. Format und Kriterien:
> `plugins/nc/referenz/pflege-auspraegung.md` des Kern-Plugins.
> **Das Warum** — warum Kuration kein Skill ist — steht im Definitionsdokument
> [`NovaCore-OS-Kriterienliste-Definition.md`](../grundwissen/NovaCore-OS-Kriterienliste-Definition.md).
> Hier stehen Stationen, Takt und Prüfpunkte.
>
> **Geltungsbereich (Entscheid E1, hart — [Bauplan 2026-08-15](../grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md)
> §8 E1, Invariante I8):** Der Flow verbindet **ausschließlich** den Kern mit **internen
> Abteilungen**. Die eigenständigen **Kollegen-OS-Satelliten** (Felix-OS, Biggi-OS) sind
> **terminal** und werden **niemals** angeschlossen: keine Queue, keine Promotion, kein
> Cross-Read über die Repo-Grenze. Das ist kein „noch nicht", sondern gegenstandslos
> ([`ssot-aufbau.md`](ssot-aufbau.md) §4a).
>
> **Bauzustand (Stand 2026-08-16, Kern 0.10.0):** Referenz, Format, Kriterienapparat,
> Übergangs-Queue (AP-E1), beide Skills `/nc:queue-abteilung`/`/nc:queue-kern` (AP-E2) und der
> Fälligkeits-Hook `nc-queue-faelligkeit.js` (AP-E3) sind **gebaut**. Die **Praxisprobe steht
> aus** (Dry-Run von `/nc:queue-kern` zuerst, §6); im heutigen Übergangszustand ohne
> Abteilungs-Satelliten laufen beide Skills in den Übergangs-Befund und der Hook schweigt
> (Entscheid E1).

## 1. Der Flow auf einen Blick

```
Sitzung  (lokale Stufe = SCOPE, kein Ort: Projekt · User · Scratchpad)
  └─ /nc:end-session   Stufe 1 — erst GL1–GL5 (darf es den Scope verlassen?),
                       dann Kriterien a–d + Gegenkriterien GF1–GF4
       └─ Queue-Zeile (append-only) in der Abteilungs-Wissensbasis   [Agent]
            └─ /nc:queue-abteilung   Zyklus-Lauf (14-tägig), bündelt zu EINEM
               Abteilungs-PR                                          [Agent]
                 └─ Review + Merge des Abteilungs-PR                  [MENSCH — Admin]
                      └─ /nc:queue-kern   +1 Tag: prüft die GEMERGTE Queue, entwirft
                         Kern-Dokument + Index-Zeile, committet das PRÜFPROTOKOLL
                         und stellt den Promotions-PR                 [Agent]
                           └─ Review + Merge des Promotions-PR = DIE KURATION
                                                                      [MENSCH — Admin]
                              (eine Datei im Review streichen = Einzelablehnung)
                                └─ Folgelauf queue-kern: liest Protokoll + Merge-Stand,
                                   setzt je Zeile den Marker           [Agent]
                                   (`befördert (PR #n)` / `abgelehnt (PR #n)`)
```

**Der Flow ist dreistufig** (lokal → Abteilung → Kern). Die **untere** Stufengrenze liegt in
`/nc:end-session` und ist **kein Speicher**, sondern ein Klassifikations- und
Kriterien-Apparat: Eine eigene Queue-Datei auf lokaler Ebene gibt es bewusst **nicht**.
Die Achsen-Einordnung steht in der
[Systemachsen-Definition](../grundwissen/NovaCore-OS-Systemachsen.md) (Achse 1).

**Die eine Regel, die den Flow trägt:** Agenten bereiten bis zum fertigen PR vor, Menschen
entscheiden. Merge, Review-Resolves und alles Kundensichtbare bleiben rote Linie. Ob die
PR-**Erstellung** eine stehende Freigabe bekommt oder je Lauf einzeln freizugeben ist, ist
offen (§6).

## 2. Stationen, Verantwortliche, Prüfpunkte

| # | Station | Wer | Was geprüft wird (QS) |
|---|---|---|---|
| 1 | **Klassifikation an der unteren Stufengrenze** (`/nc:end-session`, Schritte 8 und 9a–9d) | Agent | **Zuerst die Freigabe-Prüfungen GL1–GL5** (`pflege-auspraegung.md` Abschnitt 5.5): Darf das Ergebnis den lokalen Scope überhaupt verlassen? Sie sind **Vetos mit Ziel-Routing** und stehen **nie** in der Spalte `erfülltes Kriterium` — **GL2 (ausdrückliches Verbot des Menschen) sticht immer**, auch über GF3. **Danach** die Eintrittsfrage: Kriterium **belegt** benannt (a–d), Gegenkriterien GF1–GF4 geprüft; im Zweifel **nicht** eintragen (Ausnahme GF3: im Zweifel eintragen). Erfasst werden **alle drei lokalen Scopes** — Projekt, User und **Scratchpad** (Schritt 9a: jeder Fund wird entschieden, gerettet oder bewusst verworfen). Zurückgehaltene Kandidaten erscheinen in der Übergabe als **„bewusst nicht eingetragen"** mit dem greifenden Kürzel, ohne den geschützten Inhalt |
| 2 | **Queue-Zeile** | Agent | Fünf Spalten, ISO-Datum, Einzeiler ohne Kontextbedarf, Verweis statt Volltext, Status `offen`; keine Secrets/Kundendaten |
| 3 | **Abteilungs-PR** (`/nc:queue-abteilung`) | Agent | Nur-Wissensbasis-Pfadbedingung (hart) · Standardbranch-Sync: Divergenz ⇒ Abbruch, und **`behind > 0` ⇒ kein neuer Commit** (sonst entstünde die Divergenz erst durch den eigenen Commit) · Queue-Format als **strukturierter Tabellenvergleich** (Multimengen je Schlüssel aus den ersten vier Spalten, one-to-one-Verbrauch, einzig erlaubte Transition `offen → befördert/abgelehnt (PR #n)`; doppeldeutige Zeilen-Identität ist selbst ein Befund) · **ein** PR je Lauf |
| 4 | **Merge des Abteilungs-PR** | **Mensch (Admin)** | fachliche Richtigkeit der Abteilungs-Einträge |
| 5 | **Aufstiegs-Prüfung** (`/nc:queue-kern`) | Agent | **Vorab-Abgleich** gegen die Protokolle aller entschiedenen PRs (bereits Entschiedenes wird nie neu klassifiziert); dann je Zeile: Kriterien **und** No-Duplicate gegen die Kern-SSOT (GF4) |
| 6 | **Kern-Entwurf + Protokoll** | Agent | „Kern verlinkt, Abteilung dokumentiert" — Einzeiler + Verweis, nie Volltext-Kopie; Zielkategorie nach `SSOT-Document-Index` Teil 1, Index-Zeile Teil 2 ist Pflicht. Dazu die **committete Protokolldatei** in `queue-protokolle/` mit Entscheid, Begründung und Ziel-Dokumentpfad je geprüfter Zeile |
| 7 | **Merge des Promotions-PR = die Kuration** | **Mensch (Admin)** | Verdichtung, Ablehnung, Umformulierung. **Eine Datei zu streichen ist die Einzelablehnung** — mehr muss der Admin nicht tun; sein Merge bestätigt zugleich die Ablehnungen des Agenten |
| 8 | **Marker-Rückschreibung** (Folgelauf) | Agent — **im Verdichtungsfall Mensch** | **je Zeile dreiwertig** aus Protokoll + Merge-Stand: Dokument da → `befördert (PR #n)` · Dokument fehlt → `abgelehnt (PR #n)` · Widerspruch → **melden, nie raten**. Reiner Statuswechsel, keine Zeile gelöscht oder umgeschrieben |

## 3. Takt

- **14-Tage-Zyklus, ein Tag Versatz** (Firmenspezifikation, Bauplan-Nachtrag N6).
  `queue-abteilung` zuerst, `queue-kern` einen Tag später. Der Versatz ist Voraussetzung, kein
  Komfort: `queue-kern` liest ausdrücklich den **gemergten** Stand.
- **Erinnert wird, nicht gestartet.** Der SessionStart-Hook `nc-queue-faelligkeit.js` meldet je
  Skill „Arbeit vorhanden **und** letzter Lauf älter als 14 Tage". Er kann nichts auslösen —
  SessionStart kann laut offizieller Hooks-Doku nur Kontext injizieren, nie blockieren oder
  ausführen.
- **Der Lauf-Marker schließt den Kreis.** Beide Skills stempeln als letzten Schritt
  `nc-queue-faelligkeit.js --lauf <skill>` (Takt-Datei `~/.claude/nc/queue-lauf.json` — bewusst
  außerhalb von `tmp`, damit sie einen Reboot überlebt). **Ohne Stempel erinnert der Hook nach
  einem erledigten Lauf weiter** — und ein Hinweis, der auch nach getaner Arbeit kommt, erzieht
  zum Abschalten. Ein **Dry-Run stempelt nie**.
- **Kein Cron, kein Scheduler** — je Maschine wäre das eine Setup-Abhängigkeit und widerspräche
  der Verteilannahme.

## 4. Was der Flow bewusst NICHT tut

- **Kein Auto-Merge**, an keiner Station.
- **Kein Kurations-Skill.** Die Entscheidung fällt im GitHub-Review eines Menschen; ein Skill,
  der sie simuliert, wurde ausdrücklich verworfen. Wer einen bauen will, liest zuerst das
  Definitionsdokument
  [`NovaCore-OS-Kriterienliste-Definition.md`](../grundwissen/NovaCore-OS-Kriterienliste-Definition.md).
- **Kein Anschluss der Kollegen-OS-Satelliten.** Felix-OS und Biggi-OS bleiben terminal (E1/I8).
  Ein „reservierter Andockpunkt" wäre eine halbe Warteschlange und lädt zum Auffüllen ein.
- **Kein Schreiben in fremde Arbeits-Repos.** Findings aus einem fremden Arbeits-Repo gehen in
  dessen Ticket-Prozess (GF1), nie in die OS-Queue.
- **Keine zweite Wissensschiene.** Das Projekt-Memory ist maschinenlokaler Roh-Stand; sein
  einziger Weg in Firmen-Artefakte ist diese Queue.

## 5. Bekannte Eigenschaften, die kein Fehler sind

- **Die Marker-Rückschreibung überspannt zwei Zyklen (28 Tage).** `queue-kern` setzt den Status
  lokal im Abteilungs-Klon; eingereicht wird er erst mit dem nächsten `queue-abteilung`-Lauf. Bis
  dahin sieht ein zweiter Rechner den alten Status. Das ist der Preis der Regel „ein Schreibweg je
  Repo" und bewusst so. **Ein Korrektheitsproblem ist es nicht:** Weil der Vorab-Abgleich gegen
  die Protokolle aller entschiedenen PRs läuft (Station 5), wird eine bereits entschiedene Zeile
  nie erneut klassifiziert — auch wenn sie remote noch `offen` steht. Übrig bleibt ein reiner
  Anzeige-Lag.
- **Die Verdichtung ist der einzige halbmanuelle Fall.** Lässt der Admin Dokument A in B
  aufgehen, sagt das Protokoll „angenommen", A fehlt aber im Merge-Stand. Der Folgelauf **meldet
  das und rät nicht**; der Mensch setzt genau diesen einen Marker von Hand. Das ist bewusst so
  verteilt: Es ist der einzige Fall, in dem die Entscheidung mechanisch nicht rekonstruierbar
  ist — und Raten wäre in einer append-only-Queue teurer als Nachfragen.
- **Fälligkeit 1 bleibt nach dem PR bestehen**, bis der Merge da ist — die Commits stehen weiter
  vor dem Standardbranch. Gedämpft wird das durch Lauf-Marker und den 14-Tage-Takt; die
  Alternative wäre eine GitHub-Abfrage im Sitzungsstart und damit Netz im Startpfad.
- **Der Hook liest den zuletzt geholten Stand**, nicht den Live-Stand: kein `fetch` im
  Sitzungsstart. Ein hängender Netzaufruf beim Start wäre der teuerste Fehlerfall.

## 6. Offene Punkte (vor der Praxisprobe zu klären)

| Punkt | Warum er offen ist |
|---|---|
| **Push-Recht auf das Kern-Repo** | `queue-kern` pusht einen Branch ins Kern-Repo. Zugesichert ist heute nur die Org-Aufnahme mit Lese-/PR-Rechten. Ohne Push-Recht scheitert der Lauf **am Push, nicht am PR**; ein Fork-Weg ist nirgends spezifiziert. **Maintainer-Entscheid nötig.** |
| **Darf eine Abteilungsliste die Kern-Kriterien abschwächen?** | `journalSonderregeln` und `roteLinienDomaene` dürfen ausdrücklich nur verschärfen; für `kriterienVerweis` fehlt die entsprechende Regel. Insbesondere: Sind GF1 und GF4 abwählbar? **Maintainer-Entscheid nötig.** |
| **Sofort-Pfad × GF1** | Ein Sicherheitsvorfall in einem *fremden* Arbeits-Repo wird gemeldet (Sofort-Pfad) — aber bekommt er auch eine Queue-Zeile, obwohl GF1 fremde Repo-Findings ausschließt? Konservative Lesart bis zum Entscheid: melden ja, Queue-Zeile nein. |
| **Stehende Freigabe für die PR-Erstellung** | Das Vorbild hat sie in seiner Ebene-1-Payload. NovaCore hat sie **nicht**: Die rote Linie „kein Push/PR ohne ausdrückliche Freigabe" gilt unverändert (Bauplan §7). Ohne Entscheid ist jeder Lauf einzeln freizugeben — funktioniert, ist aber langsamer. |
| **Praxisprobe steht aus (Dry-Run zuerst)** | Noch nicht gelaufen — beide Skills sind gegen eine echte Queue ungetestet. „Dry-Run zuerst" meint `/nc:queue-kern` (Station 2), das den Modus trägt; Station 1 ist über die Freigabepflicht der Schritte 5/9 abgesichert, ein eigener Dry-Run-Modus ist nicht gebaut (bei Bedarf nachrüsten). Befunde gehören ins Fehlerprotokoll und in den Debug-Log. |

## 7. Verhältnis zu anderen Prozessen

- **Kriterien ändern** → [`kriterien-pflege.md`](kriterien-pflege.md) (nie hier, nie ad hoc im
  Skill).
- **Queue-Format oder Pflege-Ausprägung ändern** → Zeile „Pflege-Ausprägung / Queue-Format
  geändert" im [`Aktualisierungs-Index`](aktualisierungs-index.md) §2.1; eine **Feld**-Änderung
  zieht `schemaVersion` **und** alle Abteilungen nach (die Status-Werteliste ist **kein**
  Schema-Feld).
- **Neue Abteilung** → [`abteilungs-plugin-bau.md`](abteilungs-plugin-bau.md); die
  Queue-Kategorie ist Pflichtbaustein jeder Abteilungs-SSOT **mit Kern-Dependency** und
  ausdrücklich **kein** Baustein eines Kollegen-OS.
- **Wissensbasis aufbauen oder vererben** → [`ssot-aufbau.md`](ssot-aufbau.md), insbesondere §4a
  (Isolations-Invariante der eigenständigen Satelliten).

---

*Angelegt 2026-08-16 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
[`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md`](../grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md),
Phase 3 / AP-E1). Quelle: Onsite.ai-OS `origin/main@5c2c210`, Datei
`knowledge base/plugin-maintanance-ruleset-source/queue-flow.md`, gemappt nach den Regeln des
Bauplans (§2) und der Firmenspezifikation aus Nachtrag N6. **Bewusste Abweichungen vom
Vorbild:** (a) Takt **14-tägig** statt des Vorbild-Wochentakts, Fälligkeit nach 14 Tagen, +1 Tag
Versatz (N6); (b) Kurator und Merger beider Stationen werden als **Rolle „Admin"** benannt —
dieses Repo ist öffentlich, ausgelieferte und geteilte Artefakte tragen keine Klarnamen (I9);
(c) der Geltungsbereich ist auf **interne Abteilungen mit Kern-Dependency** verschärft, die
Kollegen-OS-Satelliten sind ausdrücklich ausgenommen (E1/I8) — das Vorbild spricht dort
unspezifisch von „Satelliten"; (d) Onsite-Spec-Randnummern sind durch Bauplan- und
Prozessverweise ersetzt, ein Betriebshandbuch führt NovaCore nicht; (e) die **stehende Freigabe
für die PR-Erstellung** wurde nicht mitportiert, sondern als offener Punkt geführt — bei
NovaCore gilt die rote Linie „kein Push/PR ohne Freigabe" unverändert fort.*
