# Pflege-Ausprägung einer Abteilung — Schema v1

> Verbindliches Format der Datei `pflege-auspraegung.json`, die **jedes Abteilungsplugin mit
> Kern-Dependency** an seiner Plugin-Wurzel mitliefert. Normative Grundlage: der Bauplan „Onsite-Endstand-Nachbau"
> vom 2026-08-15, Phase E / AP-E1 (Referenz + Format), Entscheid **E1** (Queue-Flow
> ausschließlich zwischen Kern und **internen Abteilungen mit Kern-Dependency**) und
> Nachtrag **N6** (Firmenspezifikation: 14-tägiger Takt, Rollen statt Klarnamen).
>
> **Geltungsbereich (E1, hart):** Der hier beschriebene Apparat gilt für den Kern `nc` und für
> **Abteilungen mit Kern-Dependency** — heute allein `development`. **Eigenständige
> Kollegen-OS-Satelliten** (Felix-OS, Biggi-OS) sind **terminal**: Sie hängen an keiner
> Kern-Mechanik, führen keine Kandidaten-Queue, keine Kriterienliste und keine Promotion, und
> sie werden auch künftig nicht angeschlossen. Wer für ein Kollegen-OS eine Ausprägung anlegen
> will, hat den Geltungsbereich missverstanden.
>
> **Ablageort:** Diese Referenz liegt im Kern-Plugin (`referenz/pflege-auspraegung.md`) und
> reist mit ihm — die Kern-Skills `end-session`, `journal`, `queue-abteilung` und `queue-kern`
> brauchen sie **zur Laufzeit**, nicht nur im Repo-Checkout. Ein installiertes Plugin sieht
> keine Repo-Pfade; Repo-Dateien werden hier deshalb ausschließlich als **Quellenangabe** mit
> der Qualifizierung „OS-Repo" genannt, nie als Leseanweisung.

## Inhalt

1. [Zweck und Ablageort der Ausprägung](#1-zweck-und-ablageort-der-ausprägung)
2. [Schema v1 — Felder](#2-schema-v1--felder)
3. [Auflösungsregel für Kern-Skills](#3-auflösungsregel-für-kern-skills)
4. [Queue-Format v1](#4-queue-format-v1)
5. [Kriterienliste v2 (firmenrelevant)](#5-kriterienliste-v2-firmenrelevant)
6. [Prüfliste für Abteilungen](#6-prüfliste-für-abteilungen)

## 1. Zweck und Ablageort der Ausprägung

Die Pflege-Skills des Kerns (`end-session` und `journal`) sind **domänenfrei**: Sie kennen den
Mechanismus (klassifizieren, anhängen, konsolidieren), nicht die Fachlage einer Abteilung. Was je
Abteilung abweicht — wo die Kandidaten-Queue liegt, welche Kriterien gelten, welche
Journal-Sonderregeln und welche domänen-spezifischen roten Linien — steht **deklarativ** in einer
Datei der Abteilung, nicht als Sonderfall im Kern-Skill. Ein Bump des Abteilungsplugins erreicht
damit alle Nutzer der Abteilung; der Kern bleibt einmal gepflegt.

**Ort:** `pflege-auspraegung.json` an der **Wurzel des Abteilungsplugins** (neben
`.claude-plugin/`), analog zur Abteilungs-CLAUDE der Ebene 2. Der Kern liest sie aus dem
Plugin-Root des **installierten** Abteilungsplugins — nie aus einem Repo-Pfad, den ein
installiertes Plugin ohnehin nicht sehen würde.

## 2. Schema v1 — Felder

| Feld | Pflicht | Inhalt |
|---|---|---|
| `schemaVersion` | ja | `1`. Ein Kern-Skill, der eine höhere Version liest, arbeitet **nicht** einfach weiter, sondern meldet „Ausprägung neuer als der installierte Kern". |
| `abteilung` | ja | Abteilungsname wie in der Abteilungs-Registry `module-registry.json` an der Wurzel des Kern-Plugins (`development`, …). Muss zum Plugin passen, sonst Abbruch mit Meldung. |
| `queuePfad` | ja | Pfad der Queue-Datei **relativ zur Wurzel des Abteilungs-Repos**. Standard `knowledge-base/kandidaten-queue/queue.md` — dieselbe Kategorie-Konvention wie in der Wissensbasis des OS-Repos. |
| `kriterienVerweis` | ja | Wo die geltende Kriterienliste steht. Ohne eigene Abteilungsliste: Verweis auf die Kriterienliste v2 in Abschnitt 5 dieser Kern-Referenz. |
| `journalSonderregeln` | ja (Liste, darf leer sein) | Zusätzliche Regeln für Journal-/Sitzungseinträge dieser Abteilung — z. B. Pflichtfelder, Freigabevermerke, Aufbewahrungshinweise. Sonderregeln **verschärfen** nur; Kern-Regeln (append-only, Belegpflicht, keine Secrets) sind nicht abwählbar. |
| `roteLinienDomaene` | ja (Liste, darf leer sein) | Domänen-spezifische rote Linien der Abteilung (z. B. „Deploys am Produktivsystem führt nur der Mensch aus"). Ergänzt die roten Linien des OS, ersetzt sie nie. |
| `uebergang` | nein | Übergangsregel, solange die Abteilung noch keinen eigenen Satelliten hat: ein Satz, wohin Queue-Einträge stattdessen gehören. Wirksam, solange der Registry-Eintrag der Abteilung kein `repository` führt (Abschnitt 3). **Einreichungsweg:** Liegt die Übergangs-Queue in einem Arbeits- oder OS-Repo, wird sie über den **regulären Branch/PR-Fluss dieses Repos** eingebracht — `/nc:queue-abteilung` gilt ausschließlich für Abteilungs-Satelliten-Klone und ist hier nicht der Weg. |

Beispiel (die reale Datei enthält **keine** Kommentare — striktes JSON):

```jsonc
{
  "schemaVersion": 1,
  "abteilung": "development",
  "queuePfad": "knowledge-base/kandidaten-queue/queue.md", // Konvention wie im OS-Repo
  "kriterienVerweis": "Kriterienliste v2, referenz/pflege-auspraegung.md des Kern-Plugins nc",
  "journalSonderregeln": [
    "Einträge zum Produktivsystem nennen immer Umgebung und Freigabestand."
  ],
  "roteLinienDomaene": [
    "Deploys am Produktivsystem führt ausschließlich der Mensch aus."
  ],
  "uebergang": "Solange kein Satellit existiert: Queue-Zeile im OS-Repo anlegen, über dessen regulären Branch/PR-Fluss einbringen (nicht über queue-abteilung) und im Ergebnis melden."
}
```

## 3. Auflösungsregel für Kern-Skills

1. **Ausprägung finden:** Plugin-Root des installierten Abteilungsplugins →
   `pflege-auspraegung.json`. Sind mehrere Abteilungsplugins installiert (nicht die
   Verteilannahme), gilt die Ausprägung der Abteilung, die der Skill ohnehin bestimmt hat; die
   zweite wird benannt.
2. **Repo-Wurzel finden:** Ob die Abteilung überhaupt ein eigenes Satelliten-Repo führt, sagt
   das Feld `repository` ihres Eintrags in `module-registry.json` an der Wurzel des
   Kern-Plugins (das **Satelliten-Signal**). Die **maschinenlokale Klon-Wurzel** kommt aus der
   optionalen Map `abteilungsRepoPfade` der Infra-Registry (`~/.claude/nc/infra.json`,
   Schema v1 — Referenz `skills/setup/infra-registry.md` dieses Kern-Plugins); der absolute
   Queue-Pfad ist diese Klon-Wurzel + `queuePfad`. **Abweichung vom Vorbild:** Onsites
   Einzelfeld `abteilungsRepoPfad` ist bei NovaCore eine **Map** passend zur
   `abteilungen`-Liste der Registry. Heute setzt sie keine Maschine — NovaCore kennt noch
   keine Abteilungs-Arbeitsklone, die Wissensbasis liegt als Lesekopie unter `~/.nc/ssot/`;
   das Feld ist der dokumentierte Andockpunkt und wird mit dem ersten realen
   Abteilungs-Satelliten befüllt. Bis dahin greift durchgehend Punkt 4.
3. **Platte schlägt Registry:** Existiert der aufgelöste Pfad nicht, wird **nichts** geraten und
   nichts an einem Ersatzort angelegt — der Skill meldet den Ist-Zustand und verweist auf
   `/nc:setup`.
4. **Übergangszustand:** Führt der Registry-Eintrag der Abteilung kein `repository` (heute jede
   interne Abteilung), greift `uebergang`. Fehlt das Feld, wird der Kandidat im Ergebnis der
   Sitzung ausgewiesen und als **nicht abgelegt** gemeldet — Verlust ist sichtbar, nicht still.
   **In derselben Meldung wird `/nc:setup` genannt:** Nach einer Satelliten-Extraktion ist genau
   diese Kombination — Registry noch ohne `repository`, `uebergang` bereits entfallen — der
   erwartete Zwischenzustand, und ein Setup-Lauf behebt ihn. Ohne den Zeiger bekäme der Nutzer
   einen Befund ohne Handlungsschritt.
5. **Fehlt die Ausprägung ganz** (oder die Registry), ist das ein **Setup-Befund**, kein
   Skill-Fehler: als fehlendes Setup melden, `/nc:setup` nennen, weiterarbeiten ohne Queue.

## 4. Queue-Format v1

Die Queue ist eine **append-only** Markdown-Datei (`queue.md`) mit einer Tabelle. Sie ist
Sammelstelle, nicht Archiv: Der 14-tägige Abteilungs-Lauf `/nc:queue-abteilung` hebt die
aufgelaufenen Zeilen in den Zyklus-PR (14-tägig) des Abteilungs-Repos, der Kern-Aufstiegslauf
`/nc:queue-kern` liest einen Tag später den **gemergten** Stand und stellt den Promotions-PR ins
Kern-Repo. **Kuriert wird im GitHub-Review des Admins — einen Kurations-Skill gibt es nicht**;
dort fällt die Annahme-, Verdichtungs- und Ablehnungsentscheidung, und dort steht auch der
Ablehnungsgrund nachlesbar.

```markdown
# Kandidaten-Queue <Abteilung> — append-only

> Kandidaten für die Kern-SSOT. Eintrag = Einzeiler + Verweis, nie Volltext
> („Kern verlinkt, Abteilung dokumentiert"). Zeilen werden nie gelöscht; befördert
> wird durch Statuswechsel.

| Datum | Einzeiler | Verweis | erfülltes Kriterium | Status |
|---|---|---|---|---|
| 2026-08-16 | Beispielzeile beim Anlegen entfernen | Pfad oder Ticket | a | offen |
```

**Regeln:**

- **Eine Zeile je Kandidat.** `Datum` = Tag des Eintrags (ISO). `Einzeiler` = ein Satz, der auch
  ohne Kontext verständlich ist. `Verweis` = Pfad, Ticket, Commit oder PR — die Quelle bleibt in
  der Abteilung. `erfülltes Kriterium` = Buchstabe **der per `kriterienVerweis` geltenden Liste**
  — ohne eigene Abteilungsliste ist das Abschnitt 5 dieser Referenz, mit eigener Liste deren
  Kürzel (mehrere: `a,c`).
  `Status` = `offen` · `befördert (PR #n)` · `abgelehnt (PR #n)`. Neue Zeilen entstehen immer als
  `offen`; die Marker mit PR-Nummer setzt `/nc:queue-kern`, nachdem er Prüfprotokoll und
  gemergten Stand des Promotions-PR gegeneinander gehalten hat. **Eine Ausnahme:** Im
  **Verdichtungsfall** (der Admin lässt ein Dokument in einem anderen aufgehen) meldet der Skill
  den Widerspruch und rät nicht — dort setzt der **Mensch** genau einen Marker von Hand. Das ist
  dieselbe erlaubte Transition und **kein** Formatverstoß.
- **Nie löschen, nie umschreiben.** Beförderte Zeilen bleiben mit Datum stehen; eine Korrektur
  ist eine neue Zeile, die auf die alte verweist.
- **Kein Volltext.** Sobald ein Eintrag mehr als eine Zeile bräuchte, gehört der Inhalt in ein
  Abteilungsdokument, und die Queue trägt den Verweis darauf.
- **Nur Belegtes.** Vermutungen werden als Vermutung gekennzeichnet oder gar nicht eingetragen.
- **Keine Secrets, Tokens, Kundendaten oder personenbezogenen Pfade.**

## 5. Kriterienliste v2 (firmenrelevant)

**Stand v2 (2026-08-24).** Bis Kern 0.12.x hieß dieselbe Liste **„Kriterienliste v1"**;
Verweise auf v1 meinen sie weiterhin. Der Inhalt von v1 — Kriterien **a–d**, Gegenkriterien
**GF1–GF4**, **No-Duplicate-Regel** — bleibt **unverändert** gültig. **v2 ergänzt genau eines:
den Abschnitt 5.5 mit den Stufen-Prüfungen GL1–GL5** an der unteren Stufengrenze. Es entfällt
nichts, es wird nichts umbenannt, und **`schemaVersion` bleibt `1`** — es ändert sich kein Feld,
nur Text.

**Zwei Stufen, zwei Fragen — eine Datei.** Der Wissensfluss ist dreistufig (lokal → Abteilung →
Kern; OS-Repo: `knowledge-base/grundwissen/NovaCore-OS-Systemachsen.md`, Achse 1).
Die Abschnitte **5.1–5.4**
gehören der **oberen** Stufe (Abteilung → Kern) und beantworten *„ist das firmenweit
relevant?"*. Abschnitt **5.5** gehört der **unteren** Stufe (lokal → Abteilung) und beantwortet
*„darf das den lokalen Scope überhaupt verlassen?"*. Beide Stufen führen **eigene
Kürzel-Namensräume** (`a–d`/`GF…` oben, `GL…` unten), damit nie zweideutig wird, welche Prüfung
ein Kürzel meint.

Ausdrücklich offen bleibt die **Praxis-Kalibrierung an echten Daten** — die Buchstaben a–d sind
aus dem Vorbild übernommen und plausibel, aber an keinem Bestand realer NovaCore-Grenzfälle
gemessen.

**Geändert wird diese Liste nie im Vorbeigehen.** Anlass, Entwurf, Maintainer-Abnahme,
Kern-Bump und Nachzug regelt der Standardprozess Kriterien-Pflege
(OS-Repo: `knowledge-base/standardprozesse/kriterien-pflege.md`). Warum es die Liste gibt,
wer sie wann liest und wogegen sie abzugrenzen ist, erklärt das Definitionsdokument
(OS-Repo: `knowledge-base/grundwissen/NovaCore-OS-Kriterienliste-Definition.md`).

### 5.1 Kriterien a–d — wann ein Ergebnis Queue-Kandidat ist

Ein Sitzungsergebnis ist Queue-Kandidat, wenn **mindestens eines** zutrifft:

| Kürzel | Kriterium |
|---|---|
| **a** | Es **wirkt über die eigene Abteilung hinaus** — andere Abteilungen müssten es kennen, um richtig zu handeln. |
| **b** | Es ist ein **Release, Meilenstein oder Feature mit Firmenwirkung** (ausgelieferter Stand, Tag, abgeschlossenes Vorhaben aus dem Bauplan-Archiv). |
| **c** | Es **ändert eine teamweite Regel oder einen teamweiten Prozess** (Konvention, Pflichtschritt, Freigabeweg). |
| **d** | Es ist ein **Risiko mit Firmenwirkung** — Sicherheitsbefund, Datenverlust-Gefahr, teamweit wirksamer Bug, Verstoß gegen eine rote Linie. |

Trifft **keines** zu, bleibt das Ergebnis abteilungsintern — das ist der Normalfall.
Session-Agenten überschätzen die eigene Relevanz systematisch; im Zweifel **nicht** eintragen.

### 5.2 Gegenkriterien GF1–GF4 — wohin ein Ergebnis stattdessen gehört

Die Kriterien a–d **öffnen** den Weg in die Queue. Die Gegenkriterien beantworten die zweite
Frage: Was geschieht mit Ergebnissen, die dort nicht hingehören oder eine Zusatzbedingung tragen?
Sie sind deshalb **Routing-Regeln, kein zweites Ja/Nein** — jede nennt ihr Ziel.

| Kürzel | Fall | Routing |
|---|---|---|
| **GF1** | Bug oder Finding eines **fremden Arbeits-Repos** | **Nie** in die OS-Queue, sondern in den Ticket-Prozess des betreffenden Repos. Der Befund gehört dorthin, wo er behoben wird; die OS-Queue führt Wissen über die eigene Arbeitsweise, keine Fremd-Backlogs. |
| **GF2** | Arbeitsgriff, Muster, Kniff | Queue-Zeile ist zulässig, **„abteilungsintern behalten" ist ein gültiger Endzustand**. Über die Firmenweite entscheidet erst der Aufstiegslauf mit dem Review — nicht der Session-Agent, der den Griff gerade gefunden hat. |
| **GF3** | **eigener Agenten-Fehler** (falsche Annahme, falscher Pfad, falsch umgesetzte Regel) | **Immer** Queue — zusätzlich zum Pflichteintrag im Fehlerprotokoll `debugging-findings/agent-learnings.md` der zuständigen Wissensbasis. Einziger Fall, in dem die Zweifelsregel aus 5.1 **nicht** greift: hier wird im Zweifel **ein**getragen. |
| **GF4** | Kunden- oder Projektfakt | Nur, wenn **eines der Kriterien a–d** zutrifft **und** der Inhalt in der Kern-SSOT noch nicht existiert (No-Duplicate, 5.3). |

### 5.3 No-Duplicate-Regel (Pflichtprüfung beim Aufstieg)

GF4 begründet sie, sie gilt aber für **jede** Zeile: Bevor ein Kandidat in die Kern-SSOT
aufsteigt, wird geprüft, ob der Inhalt dort **inhaltlich** schon steht — über die **Index-Triage
der Kern-Wissensbasis** (Master-Index Teil 1 Routing, Teil 2 Quellen-Triage). Steht er dort,
steigt die Zeile **nicht** auf; sie wird mit Verweis auf die vorhandene Stelle geschlossen.

Die Prüfung ist Pflichtbestandteil des Kern-Aufstiegslaufs `/nc:queue-kern` und nicht durch
„sieht ähnlich aus" ersetzbar. Grund ist die Kern-Regel **„Kern verlinkt, Abteilung
dokumentiert"**: Eine zweite Fassung desselben Inhalts im Kern erzeugt genau die Doppelpflege,
welche die SSOT-Abstufung verhindern soll.

### 5.4 Sofort-Pfad

**Sofort-Pfad (hart begrenzt):** Major-Bug mit Teamwirkung · Sicherheitsvorfall · Release/Tag ·
Verstoß gegen rote Linien werden **zusätzlich sofort gemeldet** — die Queue-Zeile entfällt
dadurch **nicht**, sofern nach GF1–GF4 überhaupt ein Queue-Kandidat verbleibt: Bis zum
Maintainer-Entscheid („Sofort-Pfad × GF1", `queue-flow.md` §6 des OS-Repos) schlägt **GF1**
die Meldung — ein Sicherheitsvorfall in einem *fremden* Arbeits-Repo wird gemeldet, bekommt
aber **keine** Queue-Zeile. Aufstiegslauf und Review brauchen den Zyklus-Kontext.

### 5.5 Stufen-Prüfungen lokal → Abteilung (Stufe 1)

Diese Prüfungen gelten an der **unteren** Stufengrenze und werden von `/nc:end-session`
angewendet, **bevor** eine Zeile in die `queue.md` geschrieben wird. Die lokale Stufe ist dabei
ein **Scope, kein Ort**: **Projekt-Scope** = Arbeits-Repo samt uncommitteten Änderungen +
Projekt-Memory · **User-Scope** = Erinnerungen und Notizen auf User-Ebene · **Scratchpad-Scope**
= das Session-Scratchpad (Standardprozess `scratchpad-nutzung.md` des OS-Repos).

**5.5.1 Die Eintrittsfrage — unverändert die Kriterien der Abteilung.** Ein lokales Ergebnis ist
Kandidat, wenn **mindestens eines** der Kriterien **a–d** (5.1) zutrifft; **GF3** (eigener
Agenten-Fehler, 5.2) begründet die Zeile auch **ohne** a–d-Treffer. Es entsteht **kein neues
Kriterien-Kürzel** und **keine neue Spalte**: Die Queue-Zeile trägt weiter das Kürzel aus
5.1/5.2, das Queue-Format aus Abschnitt 4 bleibt unverändert.

**5.5.2 Die Freigabe-Prüfungen GL1–GL5 — darf es den lokalen Scope verlassen?** Sie sind
**Vetos mit Ziel-Routing**, keine Kriterien: Sie erscheinen **nie** in der Spalte
`erfülltes Kriterium`, sondern verhindern die Zeile oder begrenzen ihren Inhalt.

| Kürzel | Prüfung | Routing, wenn sie greift |
|---|---|---|
| **GL1** | **Sicherheitsbedenken beim Teilen** — trägt der Kandidat Zugangsdaten, Tokens, Schlüssel, Kundendaten oder interne Auszüge, die die Maschine nicht verlassen dürfen? | Der Inhalt geht **nicht** in die Queue. Zulässig ist allein die verallgemeinerte Lehre **ohne** Auszug; trägt sie ohne den Inhalt nicht, entfällt die Zeile. Ein Vorfall geht zusätzlich sofort und vollständig an den Menschen (5.4). |
| **GL2** | **Ausdrückliches Verbot des Menschen** — hat der Mensch, der die Sitzung führt, für diesen Gegenstand gesagt, dass er lokal bleibt bzw. nicht remote gebracht wird? | **Keine Zeile.** Bindend ohne Abwägung und **ohne Überredungsversuch**, bis derselbe Mensch es aufhebt. Der Kandidat wird im Sitzungsergebnis als **bewusst nicht eingetragen** ausgewiesen — die Entscheidung bleibt sichtbar, der Inhalt bleibt lokal. |
| **GL3** | **Personenbezogene Daten und Privatsphäre** — Namen, Kontaktdaten, personenbezogene Pfade; Inhalte des **User-Scopes** (persönliche Notizen, Erinnerungen) | In die SSOT geht die **Information ÜBER** ein Artefakt — Existenz, Ort, getragene Entscheidung —, **nie das Artefakt selbst**. Rollen statt Personen. Trägt die Zeile ohne die geschützte Angabe nicht, entfällt sie. |
| **GL4** | **Duplikat** — steht der Inhalt inhaltlich schon in der Abteilungs-SSOT oder erkennbar in der Kern-SSOT? | Keine neue Zeile; stattdessen Verweis auf die vorhandene Stelle im Sitzungsergebnis. Die **Pflichtprüfung** gegen die Kern-SSOT bleibt beim Aufstiegslauf (5.3) — hier ist sie die günstige Vorprüfung, die eine Zeile spart. |
| **GL5** | **Direkte Gegengründe** — (i) Befund an einem **fremden Repo** · (ii) unbelegte Vermutung · (iii) noch laufender, unabgeschlossener Strang | (i) → **GF1**: Ticket- bzw. Issue-Prozess des betreffenden Repos, **nie** die OS-Queue · (ii) → nicht eintragen oder ausdrücklich als Vermutung kennzeichnen · (iii) → **Offene-Stränge-Register**, nicht die Queue |

**GL5(i) — was „fremdes Repo" bei NovaCore umfasst** (Abgrenzung nach den Maintainer-Entscheiden
vom 2026-08-24). Drei Fälle, ein Ergebnis — **keine Queue-Zeile**:

1. **Kunden- und Arbeits-Repos** außerhalb des OS: der Befund gehört dorthin, wo er behoben wird.
2. **Affiliate-Plugins** (Marketplace-Kategorie `affiliate`, heute `kimi-code-plugin-cc` und
   `mneme-kimi-code`): Sie sind **isolierte Abteilungen ohne SSOT-Anbindung** mit eigenen,
   persönlich gepflegten Payloads und Dokumenten. Ein Befund an ihnen geht **nie** in die
   Queue — auch dann nicht, wenn er inhaltlich interessant wäre.
3. **Eigenständige Kollegen-OS-Satelliten** (`nc-felix`, `nc-biggi`): terminal, kein Queue-Weg,
   kein Memory-Share.

Wer hier eine Ausnahme bauen will, baut einen Queue-Weg, den es nicht geben darf.

**5.5.3 Vorrang und Zweifelsregel.**

- **GL2 sticht immer** — auch über GF3 („eigene Agenten-Fehler gehören immer in die Queue"). Ein
  ausdrückliches Verbot des Menschen ist die **stärkste Regel dieser Stufe**.
- **GL1 und GL3 begrenzen den Inhalt, nicht die Pflicht.** GF3 verlangt weiterhin eine Zeile —
  lässt sich der Fehler nicht ohne den geschützten Inhalt beschreiben, entfällt sie. Der
  **Pflichteintrag im Fehlerprotokoll** der Abteilung bleibt davon unberührt.
- **Im Zweifel nicht eintragen** (unverändert 5.1). Für GF3 gilt die Umkehrung weiter — im
  Zweifel eintragen —, aber erst **nachdem** GL1–GL3 durch sind.
- **Kürzel-Vergabe:** `GL…` ist ein eigener, fortlaufender Namensraum. Ein einmal vergebenes
  Kürzel wird **nie** neu belegt (gleiche Begründung wie in Abschnitt 4: die Queue ist
  append-only, ein wiederverwendetes Kürzel würde Alt-Zeilen umdeuten). Abteilungslisten dürfen
  auch diese Prüfungen nur **verschärfen** — **GL1, GL2 und GL3 sind unabänderlich**.

## 6. Prüfliste für Abteilungen

- [ ] `pflege-auspraegung.json` liegt an der Plugin-Wurzel, `schemaVersion` ist `1`
- [ ] `abteilung` stimmt mit der Abteilungs-Registry des Kerns überein
- [ ] `queuePfad` ist relativ zur Wurzel des Abteilungs-Repos und zeigt auf eine existierende
      Queue-Kategorie (Wurzel-Invariante der Wissensbasis: nur der Index liegt oben)
- [ ] Die Queue-Datei trägt Kopf-Blockquote und den Tabellenkopf aus Abschnitt 4
- [ ] `kriterienVerweis` zeigt auf eine erreichbare Liste (eigene oder diese Kern-Referenz) —
      Beispielwert für die Kern-Referenz: `"kriterienVerweis": "nc:referenz/pflege-auspraegung.md#5"`;
      eine eigene Liste wird **plugin-relativ** angegeben, nie über eine Repo-Pfad-Angabe
- [ ] Sonderregeln, rote Linien **und eine eigene Kriterienliste verschärfen** nur, schwächen
      nichts ab; **GF1 und GF4 stehen unverändert** (Abschnitt 5.2), ebenso **GL1–GL3**
      (Abschnitt 5.5.3)
- [ ] Solange die Abteilung kein eigenes `repository` in der Registry führt: `uebergang` gesetzt
- [ ] Die Abteilung hängt wirklich am Kern (`dependencies`) — für eigenständige Kollegen-OS gibt
      es diese Datei nicht und darf es sie nicht geben

---

*Angelegt 2026-08-16 durch Claude (Opus 5, Claude Code) auf Weisung des Maintainers (Rolle:
Admin) (Bauplan
2026-08-15 „Onsite-Endstand-Nachbau", Phase 3 / AP-E1). Quelle: Onsite.ai-OS
`origin/main@5c2c210`, Datei `plugins/oai/referenz/pflege-auspraegung.md`, gemappt nach den
Regeln des Bauplans (§2) und den Firmenspezifika aus Nachtrag N6. **Bewusste Abweichungen
vom Vorbild:** (a) Die Liste heißt **v1 (Erstfassung)** — Onsites v1→v2-Historie,
Kompatibilitätssätze und die Alt-Statusform `befördert <YYYY-MM-DD>` entfallen ersatzlos, weil
NovaCore keinen Vorläufer und keine Altzeilen hat; (b) die No-Duplicate-Prüfung läuft allein
über die Index-Triage der Kern-Wissensbasis — der Onsite-Skill `firmenwissen-suche` ist
firmenspezifisch und wird **nicht** portiert (Entscheid E5). Die Regel ist damit vollständig,
nicht halb: kein toter Verweis, kein „kommt später"; (c) Takt und Rollen nach N6: **14-tägig** statt des Vorbild-Wochentakts, **Admin** als
Rolle statt eines Klarnamens; (d) Onsites Einzelfeld `abteilungsRepoPfad` ist bei NovaCore die optionale Map
`abteilungsRepoPfade` der Infra-Registry (dokumentierter Andockpunkt, heute unbefüllt); das
Satelliten-Signal trägt `repository` der Abteilungs-Registry (Abschnitt 3.2); (e) Onsite-Spec-Randnummern sind durch Bauplan- und Prozessverweise ersetzt,
ein Betriebshandbuch führt NovaCore nicht.*
