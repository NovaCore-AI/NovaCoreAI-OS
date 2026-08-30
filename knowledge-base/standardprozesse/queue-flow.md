# Queue-Flow — Standardprozess

> **Der Weg eines Wissensstücks von der Sitzung in die Kern-SSOT** — in drei Stufen:
> **lokal → Abteilung → Kern** (Spec §15.48.1; die untere Stufengrenze tragen die
> Stufen-Prüfungen GL1–GL5, §15.48.5). Verbindlich für alle
> Abteilungen. Normative Grundlage: Spec **§15.36** (löst den Kurationslauf aus §15.24/§15.31
> ab), Format und Kriterien: `referenz/pflege-auspraegung.md` des Kern-Plugins.
> **Das Warum** — warum Kuration kein Skill ist — steht in Spec §15.36.1 und im
> Definitionsdokument `project-meta-infos/Onsite.ai-OS-Kriterienliste-Definition.md`.
> Hier stehen Stationen, Takt und Prüfpunkte.
> **Kette:** `/oai:end-session` klassifiziert → **dieser Prozess** → Marker-Rückschreibung schließt den Zyklus (Folgelauf `queue-kern`)

## 1. Der Flow auf einen Blick

```
Sitzung
  └─ /oai:end-session   klassifiziert gegen Kriterien a–d + Gegenkriterien GF1–GF4
       │                 + Freigabe-Prüfungen GL1–GL5 — untere Stufengrenze lokal → Abteilung
       └─ Queue-Zeile (append-only) in der Abteilungs-Wissensbasis   [Agent]
            ↑ ab hier Stufe Abteilung: die Queue-Datei ist der Eintrittspunkt in die SSOT (§15.48.1)
            └─ /oai:queue-abteilung   Wochenlauf, bündelt zu EINEM Abteilungs-PR   [Agent]
                 └─ Review + Merge des Abteilungs-PR                 [MENSCH]
                      └─ /oai:queue-kern   +1 Tag: prüft die GEMERGTE Queue, entwirft
                         Kern-Dokument + Index-Zeile, committet das PRÜFPROTOKOLL
                         und stellt den Promotions-PR                 [Agent]
                           ↑ obere Stufengrenze Abteilung → Kern (§15.48.1)
                           └─ Review + Merge des Promotions-PR = DIE KURATION        [MENSCH]
                              (eine Datei im Review streichen = Einzelablehnung)
                                └─ Folgelauf queue-kern: liest Protokoll + Merge-Stand,
                                   setzt je Zeile den Marker                          [Agent]
                                   (`befördert (PR #n)` / `abgelehnt (PR #n)`)
```

**Die eine Regel, die den Flow trägt:** Agenten bereiten bis zum fertigen PR vor, Menschen
entscheiden. Die stehende Freigabe für die PR-**Erstellung** steht in der Ebene-1-Payload
(§15.36.6); Merge, Review-Resolves und alles Kundensichtbare bleiben rote Linie.

## 2. Stationen, Verantwortliche, Prüfpunkte

| # | Stufe (§15.48) | Station | Wer | Was geprüft wird (QS) |
|---|---|---|---|---|
| 1 | **lokal** — trägt die untere Stufengrenze lokal → Abteilung | **Klassifikation** (`/oai:end-session`, Schritt 9) | Agent | Kriterium **belegt** benannt (a–d), Gegenkriterien GF1–GF4 **und** Freigabe-Prüfungen GL1–GL5 geprüft (§15.48.5); im Zweifel **nicht** eintragen — Session-Agenten überschätzen die eigene Relevanz systematisch |
| 2 | ab hier **Abteilung** — die Queue-Datei ist der Eintrittspunkt in die SSOT | **Queue-Zeile** | Agent | Fünf Spalten, ISO-Datum, Einzeiler ohne Kontextbedarf, Verweis statt Volltext, Status `offen`; keine Secrets/Kundendaten |
| 3 | Abteilung | **Abteilungs-PR** (`/oai:queue-abteilung`) | Agent | Nur-Wissensbasis-Pfadbedingung (hart) · Standardbranch-Sync: Divergenz ⇒ Abbruch, und **`behind > 0` ⇒ kein neuer Commit** (sonst entstünde die Divergenz erst durch den eigenen Commit) · Queue-Format als **strukturierter Tabellenvergleich** (Multimengen je Schlüssel aus den ersten vier Spalten, one-to-one-Verbrauch, einzig erlaubte Transition `offen → befördert/abgelehnt (PR #n)`; doppeldeutige Zeilen-Identität ist selbst ein Befund) · **ein** PR je Lauf |
| 4 | Abteilung | **Merge des Abteilungs-PR** | **Mensch** | fachliche Richtigkeit der Abteilungs-Einträge |
| 5 | trägt die **obere** Stufengrenze Abteilung → Kern | **Aufstiegs-Prüfung** (`/oai:queue-kern`) | Agent | **Vorab-Abgleich** gegen die Protokolle aller entschiedenen PRs (bereits Entschiedenes wird nie neu klassifiziert); dann je Zeile: Kriterien **und** No-Duplicate gegen die Kern-SSOT (GF4) |
| 6 | Kern | **Kern-Entwurf + Protokoll** | Agent | „Kern verlinkt, Abteilung dokumentiert" — Einzeiler + Verweis, nie Volltext-Kopie; Zielkategorie nach SSOT-Index Teil 1, Index-Zeile Teil 2 ist Pflicht. Dazu die **committete Protokolldatei** in `Queue-Protokolle/` mit Entscheid, Begründung und Ziel-Dokumentpfad je geprüfter Zeile |
| 7 | Kern | **Merge des Promotions-PR = die Kuration** | **Mensch** | Verdichtung, Ablehnung, Umformulierung. **Eine Datei zu streichen ist die Einzelablehnung** — mehr muss der Kurator nicht tun; sein Merge bestätigt zugleich die Ablehnungen des Agenten |
| 8 | Kern → Abteilung (Rückschreibung in den Abteilungs-Klon) | **Marker-Rückschreibung** (Folgelauf) | Agent — **im Verdichtungsfall Mensch** | **je Zeile dreiwertig** aus Protokoll + Merge-Stand: Dokument da → `befördert (PR #n)` · Dokument fehlt → `abgelehnt (PR #n)` · Widerspruch → **melden, nie raten**. Reiner Statuswechsel, keine Zeile gelöscht oder umgeschrieben |

## 3. Takt

- **Wochenzyklus, ein Tag Versatz.** `queue-abteilung` zuerst, `queue-kern` einen Tag später.
  Der Versatz ist Voraussetzung, kein Komfort: `queue-kern` liest ausdrücklich den **gemergten**
  Stand (§15.36.4).
- **Angewiesen wird, nicht nur erinnert** (Maintainer-Entscheid 2026-08-24 — vorher: „erinnert,
  nicht gestartet"). Der SessionStart-Hook `oai-queue-faelligkeit.js` meldet je
  Skill „Arbeit vorhanden **und** letzter Lauf > 7 Tage" als **Anweisung zum Handeln**: Die
  Session, die die Meldung liest, bereitet den Lauf direkt vor — sie führt den Skill aus oder
  beauftragt einen Subagenten damit. Technisch kann SessionStart nur Kontext injizieren, nie
  blockieren oder ausführen — die Ausführung liegt deshalb bei der lesenden Session, und der
  erste Session-Start nach Ablauf der sieben Tage ist der reale Auslöser (ein
  Kalenderzeitpunkt, auf dem alle Nutzer einer Abteilung gleichzeitig online sein müssten,
  existiert bewusst nicht). Begründung: Nicht-technische Nutzer können keine PRs stellen; die
  Maschine bereitet vor, der Mensch merged (§15.36.6).
- **Der Lauf-Marker schließt den Kreis.** Beide Skills stempeln als letzten Schritt
  `oai-queue-faelligkeit.js --lauf <skill>` (Takt-Datei `~/.claude/oai/queue-lauf.json`).
  **Ohne Stempel meldet der Hook nach einem erledigten Lauf weiter** — und eine Meldung, die
  auch nach getaner Arbeit kommt, erzieht zum Abschalten. Ein **Dry-Run stempelt nie**.
- **Kein Cron, kein Scheduler** — je Maschine wäre das eine Setup-Abhängigkeit und widerspräche
  der Verteilannahme.

## 4. Was der Flow bewusst NICHT tut

- **Kein Auto-Merge**, an keiner Station.
- **Kein Kurations-Skill.** Wer einen bauen will, liest zuerst §15.36.1.
- **Kein Schreiben in fremde Arbeits-Repos.** Findings aus `offsite` & Co. gehen in deren
  Ticket-Prozess (GF1), nie in die OS-Queue.
- **Keine zweite Wissensschiene.** Das Projekt-Memory (§15.36.8) ist maschinenlokaler Roh-Stand;
  sein einziger Weg in Firmen-Artefakte ist diese Queue.

## 5. Bekannte Eigenschaften, die kein Fehler sind

- **Die Marker-Rückschreibung ist ein Zwei-Wochen-Kreis.** `queue-kern` setzt den Status lokal
  im Abteilungs-Klon; eingereicht wird er erst mit dem nächsten `queue-abteilung`-Lauf. Bis dahin
  sieht ein zweiter Rechner den alten Status. Das ist der Preis der Regel „ein Schreibweg je
  Repo" und bewusst so. **Ein Korrektheitsproblem ist es nicht mehr:** Seit der Vorab-Abgleich
  gegen die Protokolle aller entschiedenen PRs läuft (Station 5), wird eine bereits entschiedene
  Zeile nie erneut klassifiziert — auch wenn sie remote noch `offen` steht. Übrig bleibt ein
  reiner Anzeige-Lag.
- **Die Verdichtung ist der einzige halbmanuelle Fall.** Lässt der Kurator Dokument A in B
  aufgehen, sagt das Protokoll „angenommen", A fehlt aber im Merge-Stand. Der Folgelauf **meldet
  das und rät nicht**; der Mensch setzt genau diesen einen Marker von Hand. Das ist bewusst so
  verteilt: Es ist der einzige Fall, in dem die Entscheidung mechanisch nicht rekonstruierbar
  ist — und Raten wäre in einer append-only-Queue teurer als Nachfragen.
- **Fälligkeit 1 bleibt nach dem PR bestehen**, bis der Merge da ist — die Commits stehen weiter
  vor dem Standardbranch. Gedämpft wird das durch Lauf-Marker und Wochen-Takt; die Alternative
  wäre eine GitHub-Abfrage im Sitzungsstart und damit Netz im Startpfad.
- **Der Hook liest den zuletzt geholten Stand**, nicht den Live-Stand: kein `fetch` im
  Sitzungsstart. Ein hängender Netzaufruf beim Start wäre der teuerste Fehlerfall.
- **Der Kern-Beitrag ist ein Fakten-Dokument — kein Einzeiler, keine Kopie, kein Umzug**
  (Spec-Nachtrag 2026-08-25): `queue-kern` verdichtet auf die firmenweit handlungsnötigen
  Fakten und nennt Datum, Herkunftsabteilung und die **auflösbare** Fundstelle; das
  Vollprotokoll bleibt in der **privaten** Abteilungs-SSOT, Zugriff darauf wird bei Bedarf
  angefragt. Eine Queue-Zeile ohne auflösbaren „Verweis" (Pfad/PR/Commit) ist deshalb ein
  **Befund für den Kurator** im Prüfprotokoll, kein Formfehler, den der Skill still heilt.

## 6. Entschiedene Punkte — und was vor der Praxisprobe bleibt

Die drei Fragen, die dieser Abschnitt bis zum 2026-08-16 als offen führte, sind
**entschieden** (Maintainer-Entscheid 2026-08-16, normiert im Nachtlauf 2026-08-17). Hier
stehen Entscheid und **Begründung**; die geltende **Norm** wohnt je Entscheid an genau einer
Stelle — die Spalte „Norm steht in" nennt sie. Wer die Regel anwenden will, liest dort, nicht
hier.

| Frage | Entscheid (2026-08-16) | Begründung | Norm steht in |
|---|---|---|---|
| **Push-Recht auf das Kern-Repo** für `/oai:queue-kern` | **Ja — Push auf den Branch-Namensraum `queue-kern/**`**, kein Fork-Weg (Pattern am gebauten Skill nachgemessen 2026-08-17, siehe §6.1). Der **Merge bleibt rote Linie** | Ziel des Skills ist der PR, nicht der Push. Ein Fork-Weg wäre ein zweiter, ungetesteter Codepfad für denselben Zweck. Der Namensraum begrenzt den Schaden eines Fehllaufs auf wegwerfbare Branches | **diese Zeile** — der Entscheid betrifft eine Repo-Einstellung, kein ausgeliefertes Artefakt. Rest siehe unten |
| Darf eine **Abteilungs-Kriterienliste** die Kern-Kriterien abschwächen (speziell GF1/GF4)? | **Nein.** Abteilungen dürfen **verschärfen, nie abschwächen**; **GF1 und GF4 sind unabänderlich** | Wortgleich zum Prüfungs-Eigentum der Hooks (Spec §15.22): keine Kern-Prüfung duplizieren oder abschwächen. Eine Sicherheits-Gegenprüfung, die je Abteilung verhandelbar ist, ist keine | `plugins/oai/referenz/pflege-auspraegung.md` §5.2 (reist im Kern-Plugin) |
| **Sofort-Pfad × GF1** — Sicherheitsvorfall in einem **fremden** Arbeits-Repo | **Meldung an den Menschen sofort; Queue-Zeile nur abstrahiert** — die verallgemeinerbare Lehre, ohne Repo-Identifikation, ohne Pfade, ohne Auszüge | Firmenrelevant ist die Lehre, nicht der Vorfall. Fremde Repo-Details in unserer SSOT wären eine Datenweitergabe, die niemand freigegeben hat | Verfahren: [`kriterien-pflege.md`](<kriterien-pflege.md>) §6 · ausgelieferte Kurznorm: `plugins/oai/referenz/pflege-auspraegung.md` §5.4 |

### 6.1 Push-Weg: gemessen, nicht angenommen

**Es gibt heute keine Push-Beschränkung, die zu vergeben wäre.** Am 2026-08-17 gegen die
GitHub-API geprüft: Sowohl `repos/onsite-ai-devs/Onsite.ai-OS/rulesets` als auch
`…/branches/main/protection` antworten mit **HTTP 403 — „Upgrade to GitHub Pro or make this
repository public to enable this feature"**. Branch-Rulesets und klassische Branch-Protection
sind auf dem aktuellen Plan für private Repos **nicht verfügbar**.

Daraus folgt dreierlei:

1. **`/oai:queue-kern` läuft.** Wer Schreibrecht auf dem Kern-Repo hat, pusht jeden Branch —
   also auch den Queue-Branch. **AP-K10 ist dadurch nicht blockiert;** die Praxisprobe hängt
   allein an der Isolations-/Authentifizierungsfrage der Testumgebung.
2. **Der Namensraum ist `queue-kern/**`, nicht `queue/*`.** Verbindlich ist, was der gebaute
   Skill anlegt: `queue-kern/<abteilung>/<YYYY-MM-DD>`
   (`plugins/oai/skills/queue-kern/SKILL.md` Schritt 12, Abteilungs-Filter in Schritt 6).
   Die Schreibweise `queue/*` in E-Q1 war eine **geratene Pattern-Angabe ohne Nachmessung**
   und ist hiermit korrigiert. Der Skill bleibt unverändert — er ist gebaut, reviewt und
   gemergt; die Norm folgt dem Artefakt, nicht umgekehrt.
3. **Die Schutzwirkung des Entscheids bleibt bestehen**, sie ist nur nicht technisch
   erzwungen: Der Namensraum hält Fehlläufe in wegwerfbaren Branches, und der **Merge bleibt
   rote Linie**.

**Wiedervorlage — genau ein Auslöser:** Wechselt die Organisation auf einen Plan mit
Rulesets (Pro/Team) oder wird das Repo öffentlich, dann — und nur dann — wird das Pattern
`queue-kern/**` beim Einrichten der Branch-Protection ausgenommen. Vorher gibt es nichts
einzustellen.

### 6.2 Was offen bleibt

| Punkt | Warum er offen ist |
|---|---|
| **Praxisprobe (AP-K10)** | Erster realer Lauf von `queue-kern` am 2026-08-25 (OS-Repo PR #133, Abteilung `development`, 4 Zeilen) — die Probe läuft, ist aber erst mit dem Merge, dem Marker-Folgelauf und dem nächsten `queue-abteilung`-Lauf geschlossen. Befunde ins Fehlerprotokoll und in den Debug-Log. **§6.1 ist keine Vorbedingung mehr** — es gibt keine Push-Beschränkung. |
| **Anfrageweg für das Vollprotokoll (AP3, neue Deutung)** | Entschieden ist das **Modell** (Spec-Nachtrag 2026-08-25: Fakten-Dokument im Kern, Vollprotokoll privat in der Abteilung, Zugriff auf Anfrage), nicht sein **Bau**: Was ein Kern-Skill bei fehlendem Zugriff antwortet, wie eine Anfrage formuliert und an wen sie gerichtet wird, ob `/oai:firmenwissen-suche` einen Schritt dafür bekommt. Bis dahin gilt die definierte Antwort aus dem Nachtrag von Hand — nie Raten, nie ein Ersatzort. |

## 7. Verhältnis zu anderen Prozessen

- **Kriterien ändern** → `kriterien-pflege.md` (nie hier, nie ad hoc im Skill).
- **Queue-Format oder Pflege-Ausprägung ändern** → Zeile „Pflege-Ausprägung / Queue-Format
  geändert" im `Aktualisierungs-Index`; eine Schema-Änderung zieht `schemaVersion` **und** alle
  Satelliten nach (die Status-Werteliste ist **kein** Schema-Feld).
- **Neue Abteilung** → `abteilungs-plugin-bau.md`; die Queue-Kategorie ist einer der sieben
  Pflichtbausteine der Abteilungs-SSOT (§15.36, mitgezogene Präzisierung).
