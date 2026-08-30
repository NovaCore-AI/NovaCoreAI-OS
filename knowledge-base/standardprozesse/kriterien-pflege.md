# Kriterien-Pflege — Standardprozess

> **Verbindlich**, sobald die **Kriterienliste „firmenrelevant"** gebaut, geändert oder an
> echten Daten geschärft wird — also Abschnitt 5 von `plugins/oai/referenz/pflege-auspraegung.md`.
> Der Abschnitt trägt seit Spec §15.48 **zwei Stufen-Listen** in **getrennten
> Kürzel-Namensräumen**, und dieser Prozess gilt für **beide**:
> **Stufe 2 — Abteilung → Kern** (5.1–5.4: Kriterien `a–d`, Gegenkriterien `GF1–GF4`,
> No-Duplicate-Regel) · **Stufe 1 — lokal → Abteilung** (5.5: Eintrittsfrage ohne eigenes
> Kürzel plus die Freigabe-Prüfungen `GL1–GL5`).
> **Das Warum** — was die Liste ist, wer sie wann liest, wogegen sie abzugrenzen ist — steht in
> `project-meta-infos/Onsite.ai-OS-Kriterienliste-Definition.md`. Hier stehen nur die Handgriffe.
> **Der harte Punkt:** Die Liste **reist im Kern-Plugin**. Eine Änderung ohne Kern-Bump erreicht
> niemanden; das Team klassifiziert weiter gegen den alten Stand und merkt es nicht.
> Der [`Aktualisierungs-Index`](<Aktualisierungs-Index.md>) führt diese Änderungsart als eigene
> Zeile in §2.1 — dieses Dokument ist deren Langform.
> **Kette:** Praxis-Kalibrierung an echten Daten (§5) → **dieser Prozess** → Queue-Flow unverändert (`queue-flow.md`)

## 1. Wann dieser Prozess greift

| Anlass | Weg |
|---|---|
| Ein Grenzfall wurde falsch klassifiziert (Zeile in der Queue, die dort nicht hingehört — oder eine, die fehlt) | **dieser Prozess** |
| Ein Maintainer-Entscheid setzt ein neues Kriterium oder Gegenkriterium | **dieser Prozess** |
| Praxis-Kalibrierung an echten Daten (§5) | **dieser Prozess** |
| Wortlaut einer bestehenden Zeile wird geschärft, ohne die Bedeutung zu ändern | **dieser Prozess**, verkürzt (§2, Schritt 3 bleibt Pflicht) |
| Eine Abteilung will eine **eigene** Liste führen (`kriterienVerweis`) | **dieser Prozess** — die **Grenze ist entschieden** (Maintainer-Entscheid 2026-08-16): eine eigene Liste darf nur **verschärfen**, GF1/GF4 sind unabänderlich. Norm: Abschnitt 5.2 der Kern-Referenz; Begründung: [`queue-flow.md`](<queue-flow.md>) §6 |
| Das **Queue-Format** ändert sich (Spalten, Statuswerte, Kopf-Blockquote) | **nicht hier** → Zeile „Pflege-Ausprägung / Queue-Format geändert" im `Aktualisierungs-Index` §2.1 |
| Ein **Feld** der `pflege-auspraegung.json` kommt hinzu, entfällt oder ändert seine Bedeutung | **nicht hier** → dieselbe Zeile, **plus** `schemaVersion` hochzählen und **alle** Satelliten nachziehen |
| Ein Skill soll die Kriterien anders anwenden (Ablauf, Meldungstext) | **nicht hier** → Zeile „Skill inhaltlich geändert" |

**Die Schema-Grenze ist der teuerste Irrtum dieses Prozesses.** Kriterien und Prosa sind
*Inhalt*, nicht *Schema*. Wer `schemaVersion` mitzählt, obwohl kein Feld sich geändert hat,
zwingt jeden Satelliten zu einem eigenen Release — und bis dahin melden die Kern-Skills
„Ausprägung neuer als der installierte Kern" und arbeiten nicht weiter.

## 2. Ablauf

### Schritt 1 — Anlass belegen

Keine Kriterien-Änderung aus dem Bauchgefühl. Der Beleg ist eines von dreien und wird im
Änderungs-Vorschlag genannt:

- eine **konkrete Queue-Zeile** (Datum + Einzeiler), die falsch oder gar nicht entstanden ist,
- ein **Maintainer-Entscheid** mit Datum,
- ein **Kalibrierungsprotokoll** nach §5.

Fehlt der Beleg, ist der Vorgang eine Idee und gehört nach `Feature-idea-backlog/`, nicht in
die Liste.

### Schritt 2 — Entwurf schreiben

Form der Liste einhalten, damit die Queue-Zeilen weiter auflösbar bleiben:

- **Kriterium:** Kleinbuchstabe fortlaufend (`a`, `b`, …) + **ein** Satz. Kriterien sind
  **ODER**-verknüpft — ein neues Kriterium *öffnet* also, es schränkt nie ein.
- **Gegenkriterium:** `GF<n>` fortlaufend + Fall + **Ziel-Routing**. Ein Gegenkriterium ohne
  benanntes Ziel ist unbrauchbar: Der klassifizierende Agent weiß dann, dass etwas nicht in die
  Queue gehört, aber nicht wohin.
- **Freigabe-Prüfung der Stufe 1:** `GL<n>` fortlaufend + Prüfung + **Ziel-Routing**. Dieselbe
  Form wie beim Gegenkriterium, aber **anderer Namensraum und andere Wirkung**: `GL…` erscheint
  **nie** in der Spalte `erfülltes Kriterium` einer Queue-Zeile — es verhindert die Zeile oder
  begrenzt ihren Inhalt. Wer eine Prüfung der unteren Stufe als `GF` schreibt, macht sie
  zweideutig.
- **Stufe benennen.** Jede Änderung sagt, welche Stufe sie betrifft (5.1–5.4 oder 5.5). Eine
  Änderung „an der Kriterienliste" ohne Stufenangabe ist unvollständig.
- **Kürzel nie neu belegen** (§4) — **über beide Namensräume hinweg**.
- Grenzfall-Beispiele gehören **nicht** in die ausgelieferte Liste, sondern ins
  Definitionsdokument — die Liste bleibt kurz, weil sie zur Laufzeit gelesen wird.

### Schritt 3 — Maintainer-Abnahme

**Nicht überspringbar, auch nicht bei reinen Wortlaut-Schärfungen.** Die Kriterien binden jede
Abteilung; ihre Änderung ist eine Governance-Entscheidung, kein Agenten-Ermessen. Abgenommen
wird der **Wortlaut**, nicht die Absicht — genau die Formulierung, die ausgeliefert wird.

### Schritt 4 — Kern-Bump

Die Liste reist in `plugins/oai/referenz/pflege-auspraegung.md` mit dem Kern-Plugin:

- Version **nur** in `plugins/oai/.claude-plugin/plugin.json`, dazu `VERSION` und
  `plugins/oai/module-registry.json` (Kern-Sonderregel).
- **Neues Kriterium oder Gegenkriterium** = inhaltliche Neuerung → zweite Stelle
  (`0.21.0` → `0.22.0`). **Reine Wortlaut-Schärfung ohne Bedeutungsänderung** → dritte Stelle.
- `schemaVersion` bleibt unberührt (§1).
- Wechselt die **Versionsbezeichnung der Liste** („v1" → „v2"), zieht sie durch die
  Selbstverweise derselben Datei: Inhaltsverzeichnis, Feldbeschreibung `kriterienVerweis`,
  Beispiel-JSON, Abschnittsüberschrift. Ein Kompatibilitätssatz („Verweise auf v1 meinen
  dieselbe Liste") bleibt stehen, bis alle Satelliten nachgezogen haben.

### Schritt 5 — Nachziehen und verifizieren

Nachzug nach §3, Verifikation nach §6 — beides in **derselben** Arbeitseinheit.

## 3. Nachzug-Matrix

| Ziel | Wann | Anmerkung |
|---|---|---|
| `plugins/oai/referenz/pflege-auspraegung.md` Abschnitt 5 | immer | die Liste selbst — Unterabschnitt nach Stufe (5.1–5.4 oben, 5.5 unten) |
| `plugins/oai/skills/end-session/SKILL.md` (Schritt 9) | wenn die **Stufe-1-Prüfungen** (5.5) berührt sind | dort stehen `GL1`–`GL5` als **Handlungsanweisung**, nicht nur als Verweis — der Skill ist die einzige Stelle, die sie anwendet (Spec §15.48.4) |
| dieselbe Datei, Abschnitt 2 + Beispiel-JSON | wenn die Versionsbezeichnung wechselt | `kriterienVerweis`-Beschreibung und Beispielwert |
| `project-meta-infos/Onsite.ai-OS-Kriterienliste-Definition.md` | wenn die **Systematik** berührt ist (Aufbau §3, Grenzfälle §4, Abgrenzungen §7, offene Punkte §9) | nicht bei jeder Wortlaut-Politur |
| lesende Kern-Skills (`end-session`, `journal`, Queue-Skills) | nur wenn sie Kürzel oder Kriterientext **wörtlich zitieren** | mit `grep` nach dem Kürzel prüfen statt zu vermuten — der Regelfall ist der Verweis, nicht das Zitat |
| `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` | wenn der Queue-/Kriterien-Baustein der Vorlage die Aussage trägt | sonst entsteht die Drift bei der nächsten Abteilung |
| `plugins/oai/README.md` (Inhalt-Tabelle + Queue-Absatz) | wenn dort die Versionsbezeichnung der Liste steht | wird **ausgeliefert** — belegte Lückenklasse |
| Betriebshandbuch (Queue-/Promotion-Absatz + Fortschritts-Tracker) | immer | Ist-Inventur |
| `pflege-auspraegung.json` der **Satelliten** | wenn deren `kriterienVerweis` die Versionsbezeichnung nennt | **eigenes Repo, eigener PR** — danach im Marketplace per `ref` + Full-SHA umpinnen; die Bestandsdatei bleibt bis dahin gültig (Kompatibilitätssatz aus Schritt 4) |
| `CHANGELOG.md` | immer | mit Namenszeichnung; teamsichtbar, weil sich die Klassifikation ändert |

## 4. Bestehende Queue-Zeilen — was nicht passiert

Die Queue ist **append-only**. Eine Kriterien-Änderung schreibt **keine** Altzeile um, auch
dann nicht, wenn deren Kürzel nach der Änderung anders hieße (Regel aus dem
`Aktualisierungs-Index` §2.1: „Queue bleibt append-only: kein Format-Wechsel, der Altzeilen
umschreiben würde").

Daraus folgt die harte Vergabe-Regel:

- **Ein einmal vergebenes Kürzel wird nie neu belegt — über beide Stufen-Namensräume hinweg**
  (`a–d`/`GF…` und `GL…`). Wird ein Kriterium zurückgezogen, wird
  es in der Liste als zurückgezogen **markiert**; sein Buchstabe bleibt verbrannt. Andernfalls
  bedeutete dasselbe Zeichen in zwei Queue-Zeilen zwei verschiedene Dinge — und da Zeilen nie
  gelöscht werden, wäre der Fehler dauerhaft.
- **Umdeutung ist eine neue Zeile.** Soll ein Altkandidat neu bewertet werden, entsteht eine
  neue Queue-Zeile, die auf die alte verweist — dieselbe Regel wie bei jeder Korrektur.

## 5. Der Schärfungsfall — Praxis-Kalibrierung

Wenn die Liste an echten Daten geschärft wird (AP-K3 des Bauplans), gilt die Reihenfolge
**erst messen, dann ändern**:

1. **Stichprobe zusammenstellen** — reale Ergebnisse aus abgeschlossenen Sitzungen und
   Vorhaben, nicht konstruierte Fälle.
2. **Klassifizieren** — je Fall die geltende Liste anwenden und das Ergebnis notieren
   (Kürzel oder „bleibt intern").
3. **Fehlklassifikationen protokollieren** — Fälle, bei denen die Liste ein offensichtlich
   falsches Ergebnis liefert, mit Begründung. Das Protokoll ist der Beleg aus Schritt 1.
4. **Erst danach** den Wortlaut ändern, über den vollen Ablauf aus §2.

**Fremde Arbeits-Repos sind dabei read-only.** Dient ein Team-Repo wie `offsite` als
Datenquelle, wird dort ausschließlich gelesen — keine Datei angefasst, kein Commit, auch kein
Working-Tree-Change. Befunde, die dabei anfallen, gehen in den Ticket-Prozess jenes Repos
(Gegenkriterium GF1), nicht in die Kalibrierung.

## 6. Sofort-Pfad × GF1 — Verfahrensregel für fremde Arbeits-Repos

**Maintainer-Entscheid 2026-08-16.** Ein Sofort-Pfad-Fall (Abschnitt 5.4 der Kern-Referenz:
Major-Bug mit Teamwirkung · Sicherheitsvorfall · Release/Tag · Verstoß gegen rote Linien),
der ein **fremdes** Arbeits-Repo betrifft, kollidiert mit GF1 („nie in die OS-Queue"). Der
Entscheid löst die Kollision, **ohne GF1 aufzuheben**. Die Begründung steht einmalig im
Standardprozess [`queue-flow.md`](<queue-flow.md>) §6 — hier steht das Verfahren.

### 6.1 Reihenfolge (nicht vertauschbar)

1. **Melden zuerst, vollständig.** Der Vorfall geht **sofort** und ungekürzt an den Menschen,
   der die Sitzung führt: Repo, Pfad, Auszug, Einschätzung. Diese Meldung ist keine
   Queue-Zeile und wartet auf keinen Wochenlauf.
2. **Befund routen.** Der Befund selbst folgt GF1 in den Ticket-Prozess des betroffenen
   Repos — dort wird er behoben, nicht bei uns dokumentiert.
3. **Erst danach fragen: Gibt es eine Lehre?** Nur wenn sich eine **verallgemeinerbare
   Aussage über die eigene Arbeitsweise** ziehen lässt, entsteht eine Queue-Zeile — und
   ausschließlich in der Abstraktion aus §6.2.

### 6.2 Was in die Queue-Zeile darf — und was nie

| erlaubt | nie |
|---|---|
| die verallgemeinerte Lehre („Konfigurationsdateien mit Tokens gehören nicht in den Build-Kontext") | **Repo-Identifikation**: Name, Organisation, URL, Ticket-Nummer |
| Kriterienbuchstabe, Datum, Status wie bei jeder Zeile | **Pfade und Dateinamen** aus dem fremden Repo |
| ein Verweis auf die **eigene** Meldung bzw. Sitzung | **Auszüge**: Code, Logs, Konfiguration, Secrets |
| | Personen, die den Vorfall verursacht haben |

**Abstraktionsprobe vor dem Anhängen:** Ließe sich die Zeile jemandem vorlegen, der das fremde
Repo nicht kennen darf, ohne dass er es identifizieren kann? Lautet die Antwort nein — oder
ist die Lehre ohne den Vorfall gar nicht formulierbar —, **entfällt die Zeile**. Die Meldung
aus Schritt 1 ist dann der vollständige Vorgang; eine halb anonymisierte Zeile ist schlechter
als keine.

**Warum das GF1 nicht aufweicht:** GF1 schließt den **Befund** des fremden Repos aus, nicht
die Erkenntnis über die eigene Arbeitsweise. Die abstrahierte Zeile trägt kein Fremdwissen
mehr — sie trägt unser eigenes.

## 7. Verifikation und Selbsttest

- [ ] `node --test plugins/oai/tests/*.test.mjs` — **wortgleich**; ein Verzeichnis-Argument
      schlägt fehl
- [ ] `claude plugin validate plugins/oai --strict` fehlerfrei
- [ ] **Plugin-Grenze:** in `pflege-auspraegung.md` kein `../`-Pfad, und jede Nennung von
      `knowledge base/` trägt die Qualifizierung „OS-Repo" in unmittelbarer Nähe
      (testerzwungen — die Datei wird ausgeliefert und sieht nach der Installation keine
      Repo-Pfade)
- [ ] `grep` nach der **alten** Versionsbezeichnung der Liste über das ganze Repo — jede
      lebende Fundstelle ist entweder nachgezogen oder trägt bewusst den Kompatibilitätssatz
- [ ] Kern-Bump vorhanden (`plugin.json` + `VERSION` + `module-registry.json` im Gleichstand —
      der Struktur-Test prüft ihn)
- [ ] `schemaVersion` **unverändert**, falls kein Feld berührt wurde
- [ ] CHANGELOG-Eintrag mit Namenszeichnung
- [ ] Selbsttest: *Wenn ein Teammitglied morgen die neue Liste anwendet — steht das Ziel-Routing
      jedes Gegenkriteriums da, oder muss es raten?*
