# Kriterien-Pflege — Standardprozess

> **Verbindlich**, sobald die **Kriterienliste „firmenrelevant"** gebaut, geändert oder an
> echten Daten geschärft wird — also Abschnitt 5 von `plugins/nc/referenz/pflege-auspraegung.md`
> (Kriterien a–d, Gegenkriterien GF1–GF4, No-Duplicate-Regel).
> **Das Warum** — was die Liste ist, wer sie wann liest, wogegen sie abzugrenzen ist — steht in
> [`NovaCore-OS-Kriterienliste-Definition.md`](../grundwissen/NovaCore-OS-Kriterienliste-Definition.md).
> Hier stehen nur die Handgriffe.
> **Der harte Punkt:** Die Liste **reist im Kern-Plugin**. Eine Änderung ohne Kern-Bump erreicht
> niemanden; das Team klassifiziert weiter gegen den alten Stand und merkt es nicht.
> Der [`Aktualisierungs-Index`](aktualisierungs-index.md) führt diese Änderungsart als eigene
> Zeile in §2.1 — dieses Dokument ist deren Langform.

## 1. Wann dieser Prozess greift

| Anlass | Weg |
|---|---|
| Ein Grenzfall wurde falsch klassifiziert (Zeile in der Queue, die dort nicht hingehört — oder eine, die fehlt) | **dieser Prozess** |
| Ein Maintainer-Entscheid setzt ein neues Kriterium oder Gegenkriterium | **dieser Prozess** |
| Praxis-Kalibrierung an echten Daten (§5) | **dieser Prozess** |
| Wortlaut einer bestehenden Zeile wird geschärft, ohne die Bedeutung zu ändern | **dieser Prozess**, verkürzt (§2, Schritt 3 bleibt Pflicht) |
| Eine Abteilung will eine **eigene** Liste führen (`kriterienVerweis`) | **dieser Prozess** — zusätzlich der offene Punkt „darf eine eigene Liste abschwächen?" aus dem Definitionsdokument §9; ohne Maintainer-Entscheid nicht bauen |
| Das **Queue-Format** ändert sich (Spalten, Statuswerte, Kopf-Blockquote) | **nicht hier** → Zeile „Pflege-Ausprägung / Queue-Format geändert" im [`Aktualisierungs-Index`](aktualisierungs-index.md) §2.1 |
| Ein **Feld** der `pflege-auspraegung.json` kommt hinzu, entfällt oder ändert seine Bedeutung | **nicht hier** → dieselbe Zeile, **plus** `schemaVersion` hochzählen und **alle** Abteilungen nachziehen |
| Ein Skill soll die Kriterien anders anwenden (Ablauf, Meldungstext) | **nicht hier** → Zeile „Skill inhaltlich geändert" |

**Die Schema-Grenze ist der teuerste Irrtum dieses Prozesses.** Kriterien und Prosa sind
*Inhalt*, nicht *Schema*. **`schemaVersion` zählt ausschließlich bei Feld-Änderungen der
`pflege-auspraegung.json`.** Wer sie mitzählt, obwohl kein Feld sich geändert hat, zwingt jede
Abteilung mit eigenem Repo zu einem eigenen Release — und bis dahin melden die Kern-Skills
„Ausprägung neuer als der installierte Kern" und arbeiten nicht weiter.

## 2. Ablauf

### Schritt 1 — Anlass belegen

Keine Kriterien-Änderung aus dem Bauchgefühl. Der Beleg ist eines von dreien und wird im
Änderungs-Vorschlag genannt:

- eine **konkrete Queue-Zeile** (Datum + Einzeiler), die falsch oder gar nicht entstanden ist,
- ein **Maintainer-Entscheid** mit Datum,
- ein **Kalibrierungsprotokoll** nach §5.

Fehlt der Beleg, ist der Vorgang eine Idee und gehört nach `ideen-backlog/`, nicht in die Liste.

### Schritt 2 — Entwurf schreiben

Form der Liste einhalten, damit die Queue-Zeilen weiter auflösbar bleiben:

- **Kriterium:** Kleinbuchstabe fortlaufend (`a`, `b`, …) + **ein** Satz. Kriterien sind
  **ODER**-verknüpft — ein neues Kriterium *öffnet* also, es schränkt nie ein.
- **Gegenkriterium:** `GF<n>` fortlaufend + Fall + **Ziel-Routing**. Ein Gegenkriterium ohne
  benanntes Ziel ist unbrauchbar: Der klassifizierende Agent weiß dann, dass etwas nicht in die
  Queue gehört, aber nicht wohin. (Testerzwungen: `plugins/nc/tests/queue-os.test.mjs` prüft je
  GF-Zeile ein nicht-leeres Routing-Ziel.)
- **Kürzel nie neu belegen** (§4).
- Grenzfall-Beispiele gehören **nicht** in die ausgelieferte Liste, sondern ins
  Definitionsdokument — die Liste bleibt kurz, weil sie zur Laufzeit gelesen wird.

### Schritt 3 — Maintainer-Abnahme

**Nicht überspringbar, auch nicht bei reinen Wortlaut-Schärfungen.** Die Kriterien binden jede
Abteilung; ihre Änderung ist eine Governance-Entscheidung, kein Agenten-Ermessen. Abgenommen
wird der **Wortlaut**, nicht die Absicht — genau die Formulierung, die ausgeliefert wird.

### Schritt 4 — Kern-Bump

Die Liste reist in `plugins/nc/referenz/pflege-auspraegung.md` mit dem Kern-Plugin:

- Version in `plugins/nc/.claude-plugin/plugin.json`, dazu `VERSION` und
  `plugins/nc/module-registry.json` (Kern-Sonderregel; der Struktur-Test prüft den Gleichstand).
- **Neues Kriterium oder Gegenkriterium** = inhaltliche Neuerung → zweite Stelle
  (`0.9.0` → `0.10.0`). **Reine Wortlaut-Schärfung ohne Bedeutungsänderung** → dritte Stelle.
- `schemaVersion` bleibt unberührt (§1).
- Wechselt die **Versionsbezeichnung der Liste** („v1" → „v2"), zieht sie durch die
  Selbstverweise derselben Datei: Inhaltsverzeichnis, Feldbeschreibung `kriterienVerweis`,
  Beispiel-JSON, Abschnittsüberschrift — und durch die `pflege-auspraegung.json` jeder
  Abteilung, deren `kriterienVerweis` die Bezeichnung nennt.

### Schritt 5 — Nachziehen und verifizieren

Nachzug nach §3, Verifikation nach §6 — beides in **derselben** Arbeitseinheit.

## 3. Nachzug-Matrix

| Ziel | Wann | Anmerkung |
|---|---|---|
| `plugins/nc/referenz/pflege-auspraegung.md` Abschnitt 5 | immer | die Liste selbst |
| dieselbe Datei: Inhaltsverzeichnis, Abschnitt 2 (`kriterienVerweis`) + Beispiel-JSON | wenn die Versionsbezeichnung wechselt | sonst zeigen Feldbeschreibung und Beispielwert auf eine Liste, die es nicht mehr gibt |
| [`NovaCore-OS-Kriterienliste-Definition.md`](../grundwissen/NovaCore-OS-Kriterienliste-Definition.md) | wenn die **Systematik** berührt ist (Aufbau, Grenzfälle, Abgrenzungen, offene Punkte) | nicht bei jeder Wortlaut-Politur |
| lesende Kern-Skills (`end-session`, `journal`, `queue-abteilung`, `queue-kern`) | nur wenn sie Kürzel oder Kriterientext **wörtlich zitieren** | mit `grep` nach dem Kürzel prüfen statt zu vermuten — der Regelfall ist der Verweis, nicht das Zitat |
| [`queue-flow.md`](queue-flow.md) | wenn sich Stationen oder Prüfpunkte des Flows ändern | die Kriterien selbst stehen dort bewusst **nicht** — nur ihre Anwendung |
| `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` | wenn der Queue-/Kriterien-Baustein der Vorlage die Aussage trägt | sonst entsteht die Drift bei der nächsten Abteilung |
| `README.md` (Repo-Wurzel) | wenn dort die Versionsbezeichnung der Liste steht | NovaCore führt **keine** Kern-Plugin-README — die Wurzel-README ist die einzige Stelle |
| `pflege-auspraegung.json` der **Abteilungen** | wenn deren `kriterienVerweis` die Versionsbezeichnung nennt | repo-intern (`plugins/nc-development/`): **derselbe** PR · Abteilungs-Satellit mit eigenem Repo: **eigener PR**, danach im Marketplace per `ref` + Full-SHA umpinnen |
| `CHANGELOG.md` | immer | mit Namenszeichnung des Agenten; teamsichtbar, weil sich die Klassifikation ändert |

## 4. Bestehende Queue-Zeilen — was nicht passiert

Die Queue ist **append-only**. Eine Kriterien-Änderung schreibt **keine** Altzeile um, auch dann
nicht, wenn deren Kürzel nach der Änderung anders hieße (Regel aus dem
[`Aktualisierungs-Index`](aktualisierungs-index.md) §2.1: „Queue bleibt append-only: kein
Format-Wechsel, der Altzeilen umschreiben würde").

Daraus folgt die harte Vergabe-Regel:

- **Ein einmal vergebenes Kürzel wird nie neu belegt.** Wird ein Kriterium zurückgezogen, wird es
  in der Liste als zurückgezogen **markiert**; sein Buchstabe bleibt verbrannt. Andernfalls
  bedeutete dasselbe Zeichen in zwei Queue-Zeilen zwei verschiedene Dinge — und da Zeilen nie
  gelöscht werden, wäre der Fehler dauerhaft.
- **Umdeutung ist eine neue Zeile.** Soll ein Altkandidat neu bewertet werden, entsteht eine neue
  Queue-Zeile, die auf die alte verweist — dieselbe Regel wie bei jeder Korrektur.

## 5. Der Schärfungsfall — Praxis-Kalibrierung

Wenn die Liste an echten Daten geschärft wird, gilt die Reihenfolge **erst messen, dann ändern**:

1. **Stichprobe zusammenstellen** — reale Ergebnisse aus abgeschlossenen Sitzungen und Vorhaben,
   nicht konstruierte Fälle.
2. **Klassifizieren** — je Fall die geltende Liste anwenden und das Ergebnis notieren (Kürzel
   oder „bleibt intern").
3. **Fehlklassifikationen protokollieren** — Fälle, bei denen die Liste ein offensichtlich
   falsches Ergebnis liefert, mit Begründung. Das Protokoll ist der Beleg aus Schritt 1.
4. **Erst danach** den Wortlaut ändern, über den vollen Ablauf aus §2.

**Fremde Arbeits-Repos sind dabei read-only.** Dient ein fremdes Arbeits-Repo als Datenquelle,
wird dort ausschließlich gelesen — keine Datei angefasst, kein Commit, auch kein
Working-Tree-Change. Befunde, die dabei anfallen, gehen in den Ticket-Prozess jenes Repos
(Gegenkriterium GF1), nicht in die Kalibrierung.

## 6. Verifikation und Selbsttest

- [ ] `node --test plugins/nc/tests/*.test.mjs` — **wortgleich**; ein Verzeichnis-Argument
      schlägt fehl
- [ ] `claude plugin validate plugins/nc --strict` fehlerfrei
- [ ] **Plugin-Grenze:** in `pflege-auspraegung.md` kein `../`-Pfad, und jede Nennung von
      `knowledge-base/` trägt die Qualifizierung „OS-Repo" in unmittelbarer Nähe (testerzwungen
      durch `struktur.test.mjs` und, schärfer auf Zeilenebene, `queue-os.test.mjs` T-2 — die
      Datei wird ausgeliefert und sieht nach der Installation keine Repo-Pfade)
- [ ] `grep` nach der **alten** Versionsbezeichnung der Liste über das ganze Repo — jede lebende
      Fundstelle ist nachgezogen
- [ ] Kern-Bump vorhanden (`plugin.json` + `VERSION` + `module-registry.json` im Gleichstand —
      der Struktur-Test prüft ihn)
- [ ] `schemaVersion` **unverändert**, falls kein Feld berührt wurde
- [ ] CHANGELOG-Eintrag mit Namenszeichnung
- [ ] Selbsttest: *Wenn ein Teammitglied morgen die neue Liste anwendet — steht das Ziel-Routing
      jedes Gegenkriteriums da, oder muss es raten?*

---

*Angelegt 2026-08-16 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
[`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md`](../grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md),
Phase 3 / AP-E1). Quelle: Onsite.ai-OS `origin/main@5c2c210`, Datei
`knowledge base/plugin-maintanance-ruleset-source/kriterien-pflege.md`, gemappt nach den Regeln
des Bauplans (§2). **Bewusste Abweichungen vom Vorbild:** (a) Die Nachzug-Zeile
„Betriebshandbuch" entfällt ersatzlos — NovaCore führt keins, seine Funktion tragen `AGENTS.md`
und `README.md` (Bauplan §2); (b) das Vorbild nennt eine **Kern-Plugin-README** als eigenes
Nachzugsziel — NovaCore hat keine, die Wurzel-`README.md` tritt an ihre Stelle; (c) das
firmenspezifische Beispiel-Repo des Vorbilds ist generisch zu „fremdes Arbeits-Repo" abstrahiert;
(d) Onsite-Spec-Randnummern und AP-Kennungen des Vorbild-Bauplans sind durch NC-Verweise
ersetzt; (e) die Schema-Grenze ist gegenüber dem Vorbild **wörtlich verschärft** formuliert
(„`schemaVersion` zählt ausschließlich bei Feld-Änderungen") — dokumentierter Onsite-Irrtum,
Bauplan §4 Phase E.*
