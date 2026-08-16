# Kriterienliste „firmenrelevant" — Definition und Rolle (Grundsatzdokument)

> **Zweck:** die verbindliche Erklärung, was die **Kriterienliste** ist, welche Rolle sie im
> Queue-Flow spielt, wer sie wann liest, woraus sie besteht und wie verbindlich sie ist.
> Sie ist der einzige Filter zwischen Abteilungs-SSOT und Kern-SSOT — ohne sie entscheidet jeder
> Session-Agent selbst, was die Firma wissen muss.
> **Die geltende Liste steht hier nicht.** Sie steht in Abschnitt 5 von
> `plugins/nc/referenz/pflege-auspraegung.md` und reist mit dem Kern-Plugin. Dieses Dokument
> erklärt das *Warum* und die *Rolle*; es kopiert die Liste bewusst nicht (Doppelpflege-Verbot,
> „Kern verlinkt, Abteilung dokumentiert").
> **Den Änderungsweg** — Anlass, Entwurf, Abnahme, Bump, Nachzug — beschreibt der Standardprozess
> [`kriterien-pflege.md`](../standardprozesse/kriterien-pflege.md); die **Stationen** des Flows
> stehen in [`queue-flow.md`](../standardprozesse/queue-flow.md).
> Abgeleitetes Dokument: Bei Widerspruch gewinnen die normativen Quellen (jüngster Bauplan in
> `grundwissen/` zuerst, dann die Standardprozesse — Quellen-Hierarchie der `AGENTS.md`).

## 1. Was die Kriterienliste ist

Die Kriterienliste beantwortet **eine** Frage: *Muss die Firma dieses Sitzungsergebnis kennen —
oder genügt es der Abteilung?*

Sie ist damit ausdrücklich **kein Qualitäts- und kein Wahrheitsmaßstab**. Ein Ergebnis kann
richtig, wichtig und gut belegt sein und trotzdem abteilungsintern bleiben; die Liste misst
**Reichweite**, nicht Wert. Umgekehrt kann ein kleiner Befund firmenrelevant sein, weil eine
andere Abteilung ohne ihn falsch handeln würde.

Diese Trennung ist die Voraussetzung der SSOT-Abstufung: Die Abteilungs-SSOT loggt **alles**, die
Kern-SSOT bleibt bewusst kompakt. Kompaktheit ist eine redaktionelle Eigenschaft — sie entsteht
nur, wenn am Eingang gefiltert wird, und sie verschwindet, sobald jeder Strang direkt in den Kern
schreiben darf.

**Wofür sie ausdrücklich nicht gilt:** Die eigenständigen **Kollegen-OS-Satelliten** (Felix-OS,
Biggi-OS) sind terminal und haben keinen Aufstiegspfad in die Kern-SSOT (Entscheid E1,
Invariante I8; [`ssot-aufbau.md`](../standardprozesse/ssot-aufbau.md) §4a). Für sie gibt es
keine Kriterienliste, weil es nichts zu filtern gibt — ein Filter setzt einen Durchfluss voraus.

## 2. Rolle im Queue-Flow — wer liest sie wann

Der Flow trägt die Liste an **zwei** Stellen, nicht an einer. Das ist Absicht:

| Station | Leser | Was gegen die Liste geprüft wird | Ergebnis | Stand (2026-08-16) |
|---|---|---|---|---|
| Sitzungsende | `/nc:end-session` (Kern) | Klassifikation jedes Sitzungsergebnisses gegen a–d und GF1–GF4 | Queue-Zeile in der Abteilungs-Queue mit dem erfüllten Kürzel — oder gar nichts (Normalfall) | gebaut — Klassifikationsschritt seit Kern 0.10.0 scharf (AP-E3, Schritt 8 des Skills) |
| Zyklus-PR der Abteilung (14-tägig) | `/nc:queue-abteilung` | **nur formal:** ist das Kriterien-Feld gefüllt und auflösbar, ist das Queue-Format eingehalten? | Queue-Zeilen wandern in den Zyklus-PR des Abteilungs-Repos | gebaut (AP-E2, Kern 0.10.0); Praxisprobe steht aus (`queue-flow.md` §6) |
| Kern-Aufstieg, ein Tag später | `/nc:queue-kern` | **inhaltlich, erneut:** (i) Kriterien bestanden, (ii) No-Duplicate gegen die Kern-SSOT | Promotions-PR ins Kern-Repo je angenommener Zeile; Marker-Rückschreibung beim Folgelauf | gebaut (AP-E2, Kern 0.10.0); Praxisprobe steht aus (`queue-flow.md` §6) |
| GitHub-Review | **der Mensch (Admin)** | die Liste ist sein **Maßstab**, nicht sein Ersatz | Annahme, Verdichtung oder Ablehnung mit nachlesbarer Begründung im PR | Kuration ist kein Skill und wird keiner |

**Warum zweimal geprüft wird.** Der klassifizierende Agent am Sitzungsende ist die schlechteste
denkbare letzte Instanz: Er kennt nur seine eigene Sitzung, hat keinen Aggregat-Blick und
überschätzt die Relevanz des gerade Erarbeiteten systematisch. Die erste Prüfung darf deshalb
großzügig sein — sie kostet eine Zeile. Die zweite Prüfung im Aufstiegslauf sieht den
Zyklus-Kontext und den Kern-Bestand und ist die eigentliche Hürde. Die Entscheidung selbst fällt
danach im Review; ein Skill, der sie simuliert, wurde ausdrücklich verworfen.

**Was die Liste nicht steuert:** Sie entscheidet nie über das Schreiben in die Kern-SSOT — das
tut ausschließlich der Merge eines Menschen. Sie entscheidet, was überhaupt zur Entscheidung
vorgelegt wird.

## 3. Aufbau — drei Bestandteile

| Bestandteil | Funktion | Verknüpfung |
|---|---|---|
| **Kriterien a–d** | Einschluss: Wann *darf* ein Ergebnis in die Queue? | **ODER** — eines genügt |
| **Gegenkriterien GF1–GF4** | Routing: Wohin gehört ein Ergebnis, das nicht (nur) in die Queue gehört? | je Fall ein eigenes Ziel |
| **Grenzfall-Beispiele** | Kalibrierung: Wie sieht die Anwendung an realen Fällen aus? | illustrativ, nicht normativ — sie stehen **hier** (§4), nicht in der ausgelieferten Liste |

**Kriterien und Gegenkriterien sind nicht symmetrisch** — das ist der häufigste Lesefehler. Ein
Gegenkriterium ist kein „Nein" gegen ein „Ja", sondern eine Wegweisung, und die zeigt in
verschiedene Richtungen:

- **GF1 schließt aus** und nennt ein anderes System (Ticket-Prozess des fremden Arbeits-Repos).
- **GF2 lässt zu** und erklärt einen Endzustand für gültig („abteilungsintern behalten").
- **GF3 verschärft in Richtung Aufnahme** — die einzige Klasse, in der im Zweifel **ein**getragen
  wird, entgegen der sonst geltenden Zurückhaltung.
- **GF4 fügt eine Bedingung hinzu** (No-Duplicate), hebt die Kriterien aber nicht auf.

Ein Verständnis als „vier Ausschlussgründe" würde GF2 und GF3 ins Gegenteil verkehren.

## 4. Grenzfall-Beispiele

Fälle, an denen die Anwendung ablesbar ist. Sie sind generisch gehalten: Dieses Repo ist
öffentlich, deshalb stehen hier keine Kundennamen, keine fremden Organisationen und keine
Klarnamen.

| Fall | Einordnung | Warum |
|---|---|---|
| Doku-Fehler in einem **fremden Arbeits-Repo** gefunden, Patch vorbereitet | **GF1** — keine Queue-Zeile | Der Befund gehört in den Ticket-/PR-Prozess jenes Repos: Finding → Ticket → Branch → PR, nie über die OS-Queue. Die OS-Queue führt Wissen über die eigene Arbeitsweise, keine Fremd-Backlogs |
| Zwei parallele Stränge belegen denselben Anker (Versionsnummer, Skill-Name) | **GF3 + a + c** — Queue-Zeile | Eigener Agenten-Fehler (GF3, immer Queue), zusätzlich abteilungsübergreifend wirksam (a) und in eine teamweite Regel gemündet (c) — daraus wurde der Standardprozess [`anker-reservierung.md`](../standardprozesse/anker-reservierung.md) |
| Handgriff beim Einrichten eines **abteilungseigenen Konnektors** | **GF2** — Zeile zulässig, Verbleib in der Abteilung ist ein gültiges Ergebnis | Nützlich, aber ohne Wirkung auf andere Abteilungen. Über die Firmenweite entscheidet erst der Aufstiegslauf, nicht der Session-Agent |
| Ein Kern-Release wurde geschnitten und getaggt | **b** + **Sofort-Pfad** | Ausgelieferter Stand mit Firmenwirkung. Der Sofort-Pfad meldet zusätzlich; die Queue-Zeile entfällt dadurch **nicht**, weil Aufstiegslauf und Review den Zyklus-Kontext brauchen |
| Ein **Projektfakt** wird notiert, der bereits in der Team-Sync-Datei (Ebene 1b) steht | **GF4 → keine Zeile** | Kriterium a wäre erfüllt, aber der Inhalt ist über die Ebene-1b-Payload bereits teamweit verteilt. No-Duplicate greift: Der Kandidat wird mit Verweis auf die vorhandene Stelle geschlossen |
| Ein laufender Bauplan in `grundwissen/` erreicht einen Meilenstein | **noch kein Kandidat** | Kriterium b nennt ausdrücklich das **abgeschlossene** Vorhaben; Bauplan-Wissen speist die Queue ausschließlich aus dem `bauplan-archiv/`. Der Kandidat entsteht mit der Pflicht-Verschiebung ins Archiv, nicht mit dem Zwischenstand |

## 5. Verbindlichkeit, Träger und Owner

- **Verbindlich für alle Abteilungen mit Kern-Dependency.** Die Liste ist keine Empfehlung: Ohne
  sie gäbe es keinen gemeinsamen Maßstab, und die Kern-SSOT würde je nach klassifizierendem
  Agenten unterschiedlich gefüllt.
- **Träger ist das Kern-Plugin.** Die Liste liegt in `plugins/nc/referenz/pflege-auspraegung.md`
  und **reist im Plugin-Paket**, nicht über die Wissensbasis — die Kern-Skills brauchen sie zur
  Laufzeit, und ein installiertes Plugin sieht keine Repo-Pfade. Konsequenz: **Jede Änderung
  braucht einen Kern-Bump.** Ohne Bump kein Auto-Update — das Team klassifiziert weiter gegen den
  alten Stand, ohne es zu merken.
- **Abteilungs-Ausprägung.** Das Feld `kriterienVerweis` der `pflege-auspraegung.json` zeigt auf
  die geltende Liste. Ohne eigene Abteilungsliste ist das die Kern-Liste; das ist der Regelfall
  und für die heutige Abteilung `development` der Ist-Zustand.
- **Owner ist der Maintainer (Rolle: Admin, Abnahme + Merge).** Die Kriterien binden jede
  Abteilung — ihre Änderung ist deshalb kein Agenten-Ermessen, sondern eine Abnahme.

## 6. Änderungsweg (Kurzfassung)

Anlass belegen → Entwurf → **Maintainer-Abnahme** → Kern-Bump → Nachzug + Verifikation. Die
Handgriffe je Schritt, die Nachzug-Matrix und der Umgang mit bereits geschriebenen Queue-Zeilen
stehen im Standardprozess [`kriterien-pflege.md`](../standardprozesse/kriterien-pflege.md); sie
werden hier absichtlich nicht wiederholt.

Zwei Grenzen, die dort ausgeführt sind und hier nur benannt werden:

- **Kriterien-Änderungen berühren `schemaVersion` nicht.** Das Schema sind die *Felder* der
  `pflege-auspraegung.json`, nicht der Inhalt der Liste. Ein unnötig hochgezähltes Schema zwingt
  alle Abteilungen zum Nachzug und lässt die Kern-Skills sonst „Ausprägung neuer als der Kern"
  melden.
- **Die Queue bleibt append-only.** Eine Kriterien-Änderung schreibt nie Altzeilen um.

## 7. Abgrenzungen

- **Kriterienliste vs. Queue-Format:** Die Liste sagt, **was** aufgenommen wird; das Queue-Format
  (Abschnitt 4 derselben Referenz) sagt, **wie eine Zeile aussieht**. Beide leben in einer Datei,
  ändern sich aber aus verschiedenen Anlässen.
- **Kriterienliste vs. Sofort-Pfad:** Der Sofort-Pfad ist eine **Melderegel** für vier harte
  Fälle, keine Aufnahmeregel. Er ersetzt die Queue-Zeile nicht, sondern kommt hinzu.
- **Kriterienliste vs. rote Linien:** Rote Linien begrenzen **Handlungen** (Merges, Deploys,
  Review-Resolves, Kundensichtbares). Die Kriterienliste begrenzt **Wissensfluss**. Sie können
  nicht gegeneinander abgewogen werden.
- **Kriterienliste vs. `SSOT-Document-Index` Teil 1:** Teil 1 routet ein Dokument **innerhalb**
  einer Wissensbasis (welche Kategorie?). Die Kriterienliste entscheidet über den Aufstieg
  **zwischen** den SSOT-Ebenen (Abteilung → Kern). Wer sie verwechselt, legt Abteilungswissen im
  Kern ab, weil die Kategorie dort auch existiert.
- **Kriterienliste vs. Kuration:** Die Liste ist der Maßstab, die Kuration ist die Entscheidung.
  Die Entscheidung fällt ausschließlich im GitHub-Review eines Menschen.

## 8. Belegter Anlass für die Normierung

Der Anlass ist **beim Vorbild belegt und bei NovaCore vorbeugend übernommen**: Dort entstand die
Liste zuerst als vorläufige Vierer-Aufzählung, ohne Warum-Dokument und ohne Pflegeprozess.
Zwei Dinge fehlten, die eine vorläufige Regel gefährlich machen:

1. **Kein Ort für das Warum.** Wer die Liste anwendet, sah vier Buchstaben ohne Systematik — und
   konnte weder Grenzfälle ableiten noch erkennen, dass a–d ODER-verknüpft sind.
2. **Kein Änderungsweg.** Eine Regel ohne Pflegeprozess wird irgendwann in dem Skill geändert,
   der sie gerade liest. Genau gegen dieses Muster existiert der `Aktualisierungs-Index`.

NovaCore baut deshalb beides **von Anfang an zusammen**: Liste, Definitionsdokument und
Pflegeprozess entstehen in derselben Arbeitseinheit (AP-E1). Eine v1→v2-Historie gibt es hier
nicht — die Erstfassung führt Kriterien, Gegenkriterien und No-Duplicate-Regel bereits gemeinsam.

## 9. Offene Punkte

- **Praxis-Kalibrierung steht aus.** Die Buchstaben a–d sind aus dem Vorbild übernommen und an
  keinem Bestand realer NovaCore-Fälle gemessen. Erst eine Kalibrierung an echten Daten zeigt, ob
  sie zu großzügig oder zu eng schneiden (Ablauf: `kriterien-pflege.md` §5).
- **Eigene Abteilungslisten sind ungeregelt.** `kriterienVerweis` erlaubt, auf eine eigene Liste
  zu zeigen. Ob eine solche Liste — analog zu `journalSonderregeln` und `roteLinienDomaene` — nur
  **verschärfen** darf, ist normativ **nicht** entschieden; die Prüfliste der Kern-Referenz
  verlangt bisher nur, dass sie erreichbar ist. Ebenso offen: ob GF1 und GF4 als
  Kern-Gegenkriterien überhaupt abwählbar sein dürfen. Zu entscheiden über den Prozess aus §6.
- **Der Sofort-Pfad ist nicht gegen die Gegenkriterien geprüft.** Er nennt vier harte Fälle; ob
  GF1 ihn schlägt (Sicherheitsvorfall in einem **fremden** Arbeits-Repo — sofort melden, aber
  keine Queue-Zeile?), ist nirgends entschieden. Bis dahin gilt die konservative Lesart: melden
  immer, Queue-Zeile nach GF1.
- **Push-Recht auf das Kern-Repo** (Aufstiegslauf) ist ein offener Maintainer-Entscheid —
  geführt in [`queue-flow.md`](../standardprozesse/queue-flow.md) §6, hier nur benannt.

---

*Angelegt 2026-08-16 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
[`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md`](2026-08-15-onsite-endstand-nachbau-bauplan.md),
Phase 3 / AP-E1). Quelle: Onsite.ai-OS `origin/main@5c2c210`, Datei
`knowledge base/project-meta-infos/Onsite.ai-OS-Kriterienliste-Definition.md`, gemappt nach den
Regeln des Bauplans (§2) und der Firmenspezifikation aus Nachtrag N6. **Bewusste Abweichungen
vom Vorbild:** (a) Die Liste ist **v1 (Erstfassung)** — die v1→v2-Historie des Vorbilds und
dessen Kompatibilitätssätze entfallen ersatzlos, weil NovaCore keinen Vorläufer hatte; §8 nennt
den Anlass deshalb ausdrücklich als **vorbeugend übernommene Lehre des Vorbilds**, nicht als
eigene Historie; (b) alle firmenspezifischen Grenzfälle sind generisch abstrahiert (fremdes
Arbeits-Repo statt Repo-Name, abteilungseigener Konnektor statt Plattformname, Projektfakt in der
Team-Sync-Datei statt Kunden-/Dienstleisternennung) — dieses Repo ist öffentlich (Invariante I9);
(c) der Owner wird als **Rolle** geführt (Maintainer/Admin), nicht als Klarname; (d) der
Geltungsbereich ist um die ausdrückliche Ausnahme der **Kollegen-OS-Satelliten** ergänzt (E1/I8);
(e) Onsite-Spec-Randnummern und AP-Kennungen des Vorbild-Bauplans sind durch NC-Verweise
ersetzt; (f) der Takt in den Stationsnamen ist **14-tägig** (N6).*
