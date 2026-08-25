# Bauplan 2026-08-24 — Onsite-Delta Phase I (Wissens-Schicht und Sitzungswissen)

> **Status:** Entwurf zur Maintainer-Freigabe. Auftrag Lucas Vöhringer, 2026-08-24
> („ich möchte dass du es gemeinsam mit einem Agenten Planst, ja."). Overseer-Planung nach
> Org-Ruleset Punkt 1 — Phase I ist *cross-cutting infrastructure work* (drei Fugen-Dateien,
> siehe §3), Planung und Durchführung liegen daher beim Overseer; delegierbar ist allein
> der Fundstellen-Sweep in AP-B3 und das Nachzugs-Bündel §7.
>
> **Erhoben gegen:** Onsite.ai-OS `origin/main@2530ced`, Kern **0.26.0** (Release `2ba58bb`,
> 2026-08-24) — **nicht** gegen den Nacht-Anker `51e230f`. NovaCore-Basis: `main@388f0f3`,
> Kern **0.12.0** (Phasen G+H gemergt, PR #22/#23). Quellenarbeit durch Opus-Ko-Planer am
> 2026-08-24 (Dossier, 41 Werkzeugläufe); Overseer-Gegenprobe der drei tragenden Befunde
> bestanden (Onsite-`VERSION` = 0.26.0 · `.nc/` getrackt und **nicht** in `.gitignore` ·
> `pflege-auspraegung.md` trägt „Kriterienliste v1" ohne §5.5).
>
> **Vorgänger:** [Onsite-Delta-Mapping 2026-08-23](2026-08-23-onsite-delta-mapping.md) —
> geltender Rahmenplan der Phasen G–K. Dieser Bauplan schneidet dessen Phase I aus und
> ergänzt sie um die vier Posten D27–D30, die beim Mapping noch nicht existierten.

---

## 1. Ausgangslage — was sich seit dem Mapping geändert hat

Das Vorbild hat während unserer Phase-G/H-Nacht ein volles Release geschnitten: **0.25.0 →
0.26.0**, 22 Commits, 33 Dateien, +1.095/−67. Der Mapping-Kopf („0.23.0 → 0.25.0") ist damit
überholt. Vier Posten fehlen im Inventar:

| Neu | Inhalt | Klasse | Einordnung |
|---|---|---|---|
| **D27** | **Scratchpad-Norm R1–R3** — Session-Scratchpad als **dritter lokaler Scope**; `end-session` Schritt 9a („jeder Fund wird entschieden: retten oder bewusst verwerfen"); Standardprozess `scratchpad-nutzung.md`; zwei Suite-Invarianten. Auslöser: Havarie 2026-08-17 („Gebaut gilt erst nach Push") | N | **Phase I, Teil von D14** — nicht aufschiebbar |
| **D28** | Queue-Fälligkeit ist **Anweisung zum Handeln**, nicht nur Meldung | N | Phase J (Nachzug zu D6) |
| **D29** | Standardprozess `jira-workflow.md` | E | Phase J/K, berührt das offene Jira-Vorhaben |
| **D30** | `workflow.md` ist abteilungsoptional + `workflow-md-implementierung.md` | P | Phase J |

**D27 ist der Grund, warum dieser Plan nicht gegen den alten Anker gebaut werden darf.**
§15.48.2 kannte zwei lokale Scopes (Projekt, User); seit 0.26.0 sind es drei. Ein D14-Port
gegen `51e230f` würde eine bereits überholte Fassung festschreiben — und zwar in genau den
zwei Skills, die danach niemand mehr freiwillig anfasst.

### 1.1 Produktfehler, der mit dieser Phase geheilt wird

`plugins/nc/skills/end-session/SKILL.md` verlangt in Zeile 177 als Verifikationsschritt:

> `git status --short` zeigt **keine** `.nc/`-Pfade (Ignore greift) — sonst wird der fehlende
> `.gitignore`-Eintrag samt Vorschlag gemeldet

Das ist gegen den heutigen Repo-Zustand **falsch**: Commit `242b9e7` trackt `.nc/` bewusst,
und `.gitignore` enthält den Eintrag nicht. Der ausgelieferte Skill prüft eine Bedingung, die
der Maintainer-Entscheid aufgehoben hat, und schlägt dem Nutzer eine Änderung vor, die diesem
Entscheid widerspricht. Mit AP-B1/AP-B2 verschwindet die Grundlage des Widerspruchs, mit
AP-C4 der Text.

---

## 2. Maintainer-Entscheide dieser Phase (2026-08-24, verbindlich)

| # | Frage | Entscheid |
|---|---|---|
| **P-E1** | Laufende vs. abgeschlossene Baupläne | **Kategorie `aktive-bauplaene/` anlegen** (Onsite-Parität). `grundwissen/` behält nur dauerhafte Referenzen und Design-Specs |
| **P-E2** | Tag-Schema unter dem Waypoint-Modell | **Tags entstehen nur noch als Teil eines Release.** Schema bleibt in sich einheitlich (`nc--v{version}`, kein `release.yml`-Eingriff); **Reserve-/Anker-Tags entfallen** |
| **P-E3** | Multi-Agent-Ruleset: Ebene 0 oder Payload | **Vollspiegelung nach Onsite.** Org-Instructions weichen den Leitplanken; der Text zieht zusätzlich in die Ebene-1b-Payload |
| **P-E4** | Abteilungsordner im Sitzungswissen | **`gemeinsam/`** (Onsite-Parität). **Die Ebene `erinnerung/` entfällt ersatzlos** — wie beim Vorbild |
| **P-E5** | Einstufung `plugins/nc/referenz/` (EN6) | **Review-Beleg je Datei aus der PR-Historie fordern**; wo keiner auffindbar ist, Registerzeile „Review offen". **Kein** pauschaler `unreviewed`-Stempel |
| **P-E6** | Wortlaut GL1–GL5 | Onsite-Wortlaut, **GL5(i) ergänzt um die Affiliate-Abgrenzung** (P-E7) |
| **P-E7** | Affiliate-Status | `kimi-code-plugin-cc` und `mneme-kimi-code` sind **isolierte Abteilungen ohne SSOT-Anbindung**, mit eigenen, persönlich gepflegten Payloads und Dokumenten. Befunde an ihnen gehen **nie** in die Queue |
| **P-E8** | `.nc/commit-msg-phase3.txt`, `.nc/pr-body-phase3.md` | **Ersatzlos löschen** (Arbeitsartefakte, Scratchpad-Norm R1) |
| **P-E9** | Anker-Fortschreibung | Mapping-Kopf auf `2530ced` / Kern 0.26.0, D27–D30 als **Nachtrag N4** — im selben PR |

**Folgen von P-E2 und P-E3, die über Phase I hinausreichen** (in §8 als Stränge geführt):

- P-E2 macht `reserve/nc-0.9.0`, `reserve/abteilung-ui-ux`, `reserve/abteilung-automation`
  zu Altbestand und erledigt zwei Registerzeilen (nachzuholende Reserve-Tags; vertagter
  Entscheid E4). `anker-reservierung.md` und
  `NovaCore-OS-Anker-Reservierung-Definition.md` brauchen eine Überarbeitung — **AP-A5**.
- P-E3 setzt voraus, dass es bei uns **Leitplanken der Ebene 0** gibt. Onsites Statuslegende
  verweist normativ auf sie („SSOT-Leitplanken der Ebene 0, hier bewusst nicht kopiert").
  Phase I **verankert** sie (AP-A1), **baut** sie aber nicht aus — das ist ein eigener
  Vorgang.

---

## 3. Der Abhängigkeitsgraph — warum ein PR und keine Parallelität

Drei Dateien sind die **Fugen**. Jeder große Posten dieser Phase muss sie anfassen:

```
knowledge-base/SSOT-Document-Index.md                    ← D10, D14, EN7
plugins/nc/tests/struktur.test.mjs                       ← D10, D14, EN7
knowledge-base/standardprozesse/aktualisierungs-index.md ← D10, D11, D14, EN7
```

Ein Schnitt, bei dem zwei Pakete gleichzeitig laufen, existiert nicht — jeder Versuch erzeugt
Merge-Konflikte in genau den Dateien, deren Konsistenz die gesamte Wissensbasis trägt.
Parallelität wird erst ab Phase J wieder sinnvoll (D19/D22 sind echt unabhängig).

**Ein PR, nicht zwei.** Ein halb umgezogenes Sitzungswissen ist der Zustand, den §15.48.3
ausdrücklich als Schaden benennt („von niemandem zurückgelesen"). Ein PR, der die Kategorie
anlegt, und ein zweiter, der die Skills umstellt, erzeugen genau dieses Fenster. Stacked-PRs
haben wir in Phase G/H bereits bezahlt.

**Vier harte Reihenfolge-Zwänge:**

1. **Testinvarianten vor jedem Umzug.** Die Indexpflicht in `struktur.test.mjs` erfasst
   *jede* Datei unter `knowledge-base/`. Ohne vorab gesetzte Ausnahme-Regex schlägt der erste
   migrierte Journal-Tag die Suite rot — und jede Zwischenverifikation wird wertlos.
2. **P-E5 vor der Kriterienlisten-Erweiterung.** Sonst erweitert derselbe PR eine Datei
   normativ, die er als unreviewed markiert.
3. **D26 (Systemachsen) vor den Skill-Neufassungen.** §15.48 stützt sich begrifflich auf die
   Achsen-Definition; ohne sie zitieren unsere Skills eine Norm, die es bei uns nicht gibt.
4. **Der Waypoint-Schnitt zuletzt.** Wer mitten in den Umbau schneidet, schneidet einen
   Zwischenstand.

---

## 4. Paket I-A — „Die Fugen" (Overseer, nicht delegierbar)

**Berührt:** `knowledge-base/SSOT-Document-Index.md` · `plugins/nc/tests/struktur.test.mjs` ·
`knowledge-base/standardprozesse/aktualisierungs-index.md` · `.gitignore` ·
`plugins/nc/hooks/{pfad-aenderungsindex.json, wissen-sucheindex.json}` ·
`knowledge-base/standardprozesse/anker-reservierung.md`

**No-Diff-Zone:** keine Skill-Datei · kein Hook-*Code* · kein `git mv`.

| AP | Inhalt | Herkunft |
|---|---|---|
| **A1** | **Statuslegende** in den Index-Kopf (binär `lebend`/`historisch`, „Klammerzusätze haben keine Normwirkung") + normativer Verweis auf die **Leitplanken der Ebene 0**. Die heutigen Hybrid-Werte in Teil 2 (`lebend (Idee offen)`, `lebend (teils erledigt)`, …) auflösen: Statusspalte binär, der informative Rest wandert in die Spalte „Relevant wenn …" — **nicht** streichen | D10, P-E3 |
| **A2** | **Kategorie `aktive-bauplaene/`** in Teil 1 (Routing-Zeile) und Teil 2 (Tabelle) anlegen; `grundwissen/` auf „dauerhafte Referenzen + Design-Specs" zurückschneiden; `bauplan-archiv/`-Zugangsregel auf die neue Quelle umstellen | D10, P-E1 |
| **A3** | **§0 Zwei-Klassen-Buchführung** im Aktualisierungs-Index: Produktklasse (`plugins/**`, `.claude-plugin/**`, `.github/workflows/**`) vs. Wissensklasse (`knowledge-base/**`). Kurzregel wörtlich: „Welche Version bumpe ich? — keine, niemals im Strang." **Plus Affiliate-Zeile nach P-E7** | D11/EN5 |
| **A4** | **§3 neu fassen:** vierte Bump-Stelle streichen (bei Onsite aufgehoben, bei uns bereits als riskant markiert) · „im Strang wird nie gebumpt" · PR-Ergebnismemo als Wissensträger des Strangs · **§3.6 Release-Zug-Runbook** (8 Schritte, Auslöser ausschließlich Maintainer-Kommando, kein `[Unreleased]`-Dauerbestand) | D11/EN5 |
| **A5** | **Tag-Norm nach P-E2:** Tags nur als Teil eines Release; Reserve-/Anker-Tags entfallen. `anker-reservierung.md` und die Anker-Definition entsprechend überarbeiten (Begriffsnorm bleibt, das Git-Ref-Mittel entfällt) | P-E2 |
| **A6** | **Bagatellgrenze** (§1) und **Batch-Kadenzen** (§4): Produktarchitektur/Featurekarte 1× alle 2 Wochen · Design-Spec nur per datums-geschlüsseltem Nachtrag, nie in-place | D10 |
| **A7** | **Spec-Governance:** Fußzeilen-Kette und Spec-Versionszählung abschaffen; Matrix-Zeile „Design-Entscheidung geändert" umschreiben (bestehende §-Nummern bleiben zitierfähig, §-Anker-Reservierung entfällt, Namens-Anker bleiben). Betrifft `docs/superpowers/specs/2026-07-06-novacoreai-os-design.md` | D10 |
| **A8** | **Alle Testinvarianten vorab:** Journal-Ausnahme (`^sitzungswissen/[^/]+/journal/`) · Vorlage-Ausnahme (`\.vorlage$`, Sammel-`VORLAGE.md` bleibt indexpflichtig) · `sitzungswissen/`-Struktur (Kategorie existiert · Teil-1-Routing · `offene-straenge-register.md` existiert und ist indiziert · **`stand.md` je Abteilungsordner Pflicht**) · Kategorie `aktive-bauplaene/` · hartkodierte Vorlagen-Pfade korrigieren | D10, D14, EN7 |
| **A9** | **Matrix-Zeilen** ergänzen: Secrets-Referenz · Vorlagen-Ort · Sitzungswissen-Ort · Skillzahl in Beschreibungen · **„Keine Testzahl mehr nachziehen — nirgends"** | D10, D15, D18, EN7 |
| **A10** | `.gitignore`: **`.nc/` wieder aufnehmen** — mit dem Onsite-Wortlaut als Altstand-Schutz, ausdrücklich **nicht** als zugesagter Ablageort. *(Wirkt erst nach AP-B1, steht aber hier, weil AP-B1 sonst gegen eine fehlende Regel migriert.)* | D14, §15.48.3 |

**Abnahme A:** Suite grün · `validate` grün · kein `git mv` im Diff · Index-Teil-1-Routing
deckt alle Kategorien inkl. der beiden neuen.

---

## 5. Paket I-B — „Der Umzug" (Overseer plant, Sweep delegierbar)

**Berührt:** die beiden `git mv` · ~40 Doku-Fundstellen · `plugins/nc/nc-sync.md` ·
`plugins/nc/wp-rahmen.md` · `plugins/nc-development/{workflow.md,
development-abteilungs-claude.md}` · Archivierungs-Sweep

**No-Diff-Zone:** `struktur.test.mjs` (steht aus I-A) · Teil-1-**Struktur** des Index (nur
Zeileninhalte und Links nachziehen) · `aktualisierungs-index.md` · `end-session/SKILL.md` und
`start/SKILL.md` (das ist I-C).

| AP | Inhalt |
|---|---|
| **B1** | **`git mv .nc/erinnerung/*` → `knowledge-base/sitzungswissen/`** mit Einzug der Abteilungsebene nach P-E4: `sitzungswissen/roll-up.md`, `sitzungswissen/offene-straenge-register.md`, `sitzungswissen/gemeinsam/stand.md`, `sitzungswissen/gemeinsam/journal/YYYY-MM-DD.md`. **Die Ebene `erinnerung/` entfällt.** Zweistufig ausführen (erst `mv`, dann restrukturieren) — Windows, Dot-Directory, case-insensitive FS |
| **B2** | `.nc/commit-msg-phase3.txt` und `.nc/pr-body-phase3.md` löschen (P-E8). Danach ist `.nc/` leer und die Regel aus A10 greift ohne Restbestand |
| **B3** | **Fundstellen-Sweep** — 27 Dateien nennen `.nc/erinnerung`, 17 nennen `vorlagen/`. *Delegierbar an einen Opus-Agenten mit Plan-Sandwich-Vertrag; Overseer reviewt.* Zwei der Fundstellen sind **ausgelieferte Payload** (`nc-sync.md`, `wp-rahmen.md`) und zwei liegen in `nc-development` |
| **B4** | **`git mv vorlagen/` → `knowledge-base/standardprozesse/vorlagen/`** — als **Unterordner**, nicht als eigene Kategorie (so löst Onsite es; umgeht die Kategoriepflicht). Danach die hartkodierten Testpfade und die Prefixe der Pfadklassen `vorlage`/`vorlage-ssot` nachziehen |
| **B5** | **Archivierungs-Sweep:** abgeschlossene Baupläne per `git mv` nach `bauplan-archiv/`, laufende nach `aktive-bauplaene/` (P-E1); Index-Zeilen auf `historisch`. Sicher abgeschlossen: `2026-08-15-onsite-endstand-nachbau-bauplan.md` (Phasen A–F fertig). Je Plan einzeln entscheiden, **nicht** pauschal |
| **B6** | **Dieser Bauplan** zieht mit nach `aktive-bauplaene/` |

**Abnahme B:** Suite grün · `git status` sauber · **kein** Eintrag im Index zeigt ins Leere ·
`grep -r "\.nc/erinnerung"` liefert nur noch historische Journaltexte · `grep -r "^vorlagen/"`
liefert nichts außerhalb von Archiv und Historie.

---

## 6. Paket I-C — „Die Mechanik" (Overseer, infrastrukturkritisch)

**Berührt:** `plugins/nc/referenz/pflege-auspraegung.md` · `plugins/nc/skills/end-session/` ·
`plugins/nc/skills/start/` · `plugins/nc/hooks/nc-session-start.js` +
`session-start.test.mjs` · `knowledge-base/standardprozesse/queue-flow.md` ·
`knowledge-base/grundwissen/NovaCore-OS-SSOT-Definition.md` · **neu:**
`NovaCore-OS-Systemachsen.md` · **neu:** `standardprozesse/scratchpad-nutzung.md`

**No-Diff-Zone:** alles aus I-A und I-B · `nc-ffg.js`, `nc-safety-gate.js`,
`nc-start-gate.js`, `nc-queue-faelligkeit.js` (Phase-G-Härtungen) · `nc-pfad-hinweis.js`,
`nc-wissens-hinweis.js` (Phase-H-Härtungen). **Härtungs-Erhalt, Invariante I-1:** keine
dieser Dateien wird „bei der Gelegenheit" vereinfacht.

| AP | Inhalt |
|---|---|
| **C1** | **D26 — `NovaCore-OS-Systemachsen.md`** anlegen (Port von Onsites Systemachsen inkl. Abschnitt „Die lokale Ebene"). Vorbedingung für C4/C5, weil §15.48 begrifflich darauf steht |
| **C2** | **D13/EN6 — `referenz/`-Einstufung** nach P-E5: Review-Belege aus der PR-Historie je Datei (`agent-authoring.md`, `pflege-auspraegung.md`, `skill-authoring.md`); Fehlanzeige ⇒ Registerzeile „Review offen". Nachtrag in `NovaCore-OS-SSOT-Definition.md`, **angepasst**: freigegebene Instruktions-Träger sind bei uns `doks/` **und** `nc-sync.md` (dokumentierte Abweichung, `nc-doks-autosync.js` Z. 46–48). Norm „keine weiteren `referenz/`-Neuanlagen ohne Abnahme" |
| **C3** | **D14 — Kriterienliste v1 → v2** in `pflege-auspraegung.md`: Überschrift, Übergangssatz, Gegenkriterien GF1–GF4, No-Duplicate-Regel, **§5.5 vollständig** (5.5.1 Eintrittsfrage · 5.5.2 Tabelle GL1–GL5 als *Vetos mit Ziel-Routing*, nie in der Spalte „erfülltes Kriterium" · 5.5.3 Vorrang, „GL2 sticht immer") · Prüfliste Abschnitt 6 · Schema-Beispiel `kriterienVerweis`. **`schemaVersion` bleibt `1`.** GL5(i) mit Affiliate-Abgrenzung nach P-E6/P-E7. **Maintainer-Wortlaut-Abnahme ist Pflicht** (`kriterien-pflege.md` §2) |
| **C4** | **`end-session` Neufassung:** Zwei-Fall-Logik am Argument `nachzug` (Heuristik ausdrücklich unzulässig) · Zielort-Entscheid (eigene Wissensbasis ⇒ dort; sonst Projekt-Memory; **kein lokaler Dateistrom in fremden Repos**) · Konsolidierungspflicht `stand.md` bei jedem Lauf · Schritt **9a–9d** inkl. **Scratchpad-Erfassung (D27)** · Übergabe mit „bewusst nicht eingetragen" · **Zeile 177 und der `.gitignore`-Vorschlag entfallen** (§1.1) |
| **C5** | **`start` Neufassung:** Ablage-Entscheid + **Altstand-Meldung statt Altstand-Nutzung** · Projekt-Memory **vor** der Repo-SSOT · Erkennung fehlenden Abschlusses (Schritt 6) und Nachholen **nach** dem Stempel (Schritt 15) · 30-Sekunden-Briefing mit **20-Zeilen-Deckel** und Quellen-Fußblock · Erstlauf-Anlagen hinter den Stempel |
| **C6** | **Session-Start-Injektion:** Textbaustein „führe `/nc:end-session nachzug` aus, wenn …" in `nc-session-start.js`. **Kein neuer Hook, kein Gate, keine dritte Fälligkeit, kein zweiter Speicherort** (§15.48.7). Test in `session-start.test.mjs` |
| **C7** | **D27 — `standardprozesse/scratchpad-nutzung.md`** anlegen (R1–R3: Arbeiten erlaubt, nie Finalitäts-Ort; jeder Fund wird entschieden). Sucheindex-Zeile + Router-Zeiger; zwei Suite-Invarianten. **Kein** Eintrag im Pfad-Änderungsindex (bewusste Nicht-Erweiterung, Onsite-Parität) |
| **C8** | **Queue-Flow-Stationen** in `queue-flow.md` gegen die dreistufige Norm prüfen; Stufe-1-Station (`end-session`) ergänzen oder korrigieren |

**Abnahme C:** Suite grün · `end-session` und `start` gegen die Onsite-Fassung Schritt für
Schritt gegengelesen · **Kontext-Deckel geprüft:** wächst `end-session` über den Router-Deckel
(6.000 Zeichen, D7), wird gekürzt statt überschritten · Maintainer-Wortlaut-Abnahme für C3
liegt vor.

---

## 7. Nachzugs-Bündel (Sonnet-Executor, am PR-Ende)

Nach Org-Ruleset Punkt 3 gebündelt, nicht je Schritt:

- **D12** — Payload-Blöcke in `nc-sync.md`: „Ein Archiv ist keine Wissensquelle" (auf
  `bauplan-archiv/` und `debugging-findings/` gemappt) · **Meta-Regeln** (eigener Worktree,
  nie auf `main` pushen, Queue-Skills nur nach Tracker) · **Multi-Agent-Ruleset** (P-E3) ·
  Ebene-1-Block „SSOT-Änderungen: erst Aktualisierungs-Index" in
  `doks/global-claude-firmenblock.md`
- **D15** — `NC_SECRETS_REF` an genau **drei** Berührungspunkten: Payload-Abschnitt (ohne
  jeden Beispielpfad) · Prüfpunkt in `/nc:setup` (nicht-blockierend, Wert wird nie gelesen) ·
  Ausgabezeile „gesetzt / nicht gesetzt" in `/nc:os-info`. **Kein Hook, kein Gate, kein
  Secrets-Speicher, kein vorgeschlagener Ort**
- **D18** — Zähl-Regel „gebaute Skills zählen, Platzhalter nicht" als Matrix-Zeile; Gegenprobe
  der Zahlen in `module-registry.json` und `AGENTS.md` (`marketplace.json` ist geprüft:
  `nc-development` „15 Skills" stimmt)
- **`os-info`** — Zeile „wo Sitzungswissen" auf den neuen Ort
- **P-E9** — Mapping-Kopf auf `2530ced` / 0.26.0, **Nachtrag N4** mit D27–D30
- Registerzeilen: PR #22/#23 auf erledigt · Reserve-Tag-Stränge nach P-E2 schließen ·
  Ketten-Zeilen aus Phase H
- `AGENTS.md`, `README.md`, `ONBOARDING.md`, Registry
- **Ein** Kern-Bump (0.12.0 → 0.13.0) · **ein** Waypoint-CHANGELOG-Schnitt

**Der Waypoint schneidet den aufgelaufenen `[Unreleased]`-Bestand von 0.7.x bis 0.13.0.** Das
ist nach der Maintainer-Weisung vom 2026-08-23 die **einzige** erlaubte CHANGELOG-Zeremonie
dieses Umbaus.

---

## 8. Bewusst nicht in Phase I

| Posten | Grund |
|---|---|
| **D16** `skill-builder` + `os-info`-Feinschnitt | Hängt an EN5, D14 und D15. Die `os-info`-Zeile zum Sitzungswissen-Ort läuft in §7 mit; der Rest gehört in den K-Sweep |
| **D17** Fit-Prüfung | Die Rubrik spiegelt den Ruleset-Ordner testerzwungen — D10/EN7 verändern dessen Bestand. Vor Phase-I-Abschluss gebaut, spiegelt sie einen überholten Stand |
| **D28/D29/D30** | Neue Posten aus 0.26.0, Phase J |
| **Leitplanken der Ebene 0** ausbauen | P-E3 verankert sie normativ (AP-A1); der Aufbau des Leitplanken-Korpus ist ein eigener Vorgang |
| **Verifikationslücke** `skill-builder`/`os-info` | Der Ko-Planer hat beide nur per Grep geprüft, nicht im Volltext. Vor Phase K im Volltext gegen die Onsite-Fassung stellen |

---

## 9. Invarianten (Review-Fokus)

| # | Invariante |
|---|---|
| **I-1** | **Härtungs-Erhalt.** Keine Phase-G/H-Härtung wird bei Gelegenheit vereinfacht. Betroffen: die vier Bypass-Härtungen des Safety-Gates, die FFG-Windows-Muster, die Router-Kontext-Deckel, die Tag-Lücken-Invariante aus der 0.2.0-Lehre |
| **I-2** | **Kein halber Umzug.** `.nc/erinnerung/` und `knowledge-base/sitzungswissen/` existieren nie gleichzeitig als bespielte Orte. Migration und Skill-Umbau landen im selben PR |
| **I-3** | **Invarianten vor Umzügen.** Kein `git mv` vor der zugehörigen Testausnahme |
| **I-4** | **Kein zweiter Speicherort, kein neuer Hook, keine dritte Fälligkeit** (§15.48.7) |
| **I-5** | **Ein Bump, ein Waypoint.** Keine Zwischen-Bumps, keine Einzel-CHANGELOG-Einträge, keine Zahlen-/Versionsspiegel in der Doku |
| **I-6** | **Affiliate-Isolation** (P-E7): keine SSOT-Anbindung, kein Queue-Weg, keine Fit-Prüfung, keine gemeinsame Payload |
| **I-7** | **Nichts erfinden.** Wo die Onsite-Quelle schweigt, wird die Lücke benannt, nicht gefüllt |
| **I-8** | **Verhaltensbruch benennen.** „In fremden Arbeits-Repos wird nichts angelegt" ändert das Kern-Verhalten auf allen Team-Maschinen. Gehört als *Breaking* ins PR-Memo |

---

## 10. Testfälle

| # | Fall | Erwartung |
|---|---|---|
| T1 | Journal-Datei unter `sitzungswissen/gemeinsam/journal/` | Suite grün ohne Einzelzeile im Index |
| T2 | Abteilungsordner ohne `stand.md` | Suite **rot** |
| T3 | `sitzungswissen/` fehlt komplett | Suite **rot** |
| T4 | `.vorlage`-Datei unter `standardprozesse/vorlagen/` | grün ohne Einzelzeile |
| T5 | `vorlagen/abteilungsplugin/VORLAGE.md` ohne Index-Zeile | Suite **rot** (Sammelzeile bleibt pflichtig) |
| T6 | Index-Zeile zeigt auf verschobene Datei | Suite **rot** |
| T7 | Datei in `aktive-bauplaene/` ohne Routing-Zeile | Suite **rot** |
| T8 | `end-session` ohne Argument bei offenem Vortag | Zwei-Fall-Logik greift, keine Heuristik |
| T9 | `end-session nachzug` | schreibt den Vortag, nicht den heutigen Tag |
| T10 | Arbeits-Repo ohne eigene Wissensbasis | Projekt-Memory, **kein** Dateistrom im Fremd-Repo |
| T11 | Altbestand `.nc/erinnerung/` in einem Fremd-Repo | wird **gemeldet**, nicht als Quelle gelesen |
| T12 | Scratchpad mit ungerettetem Fund bei `end-session` | Schritt 9a erzwingt die Entscheidung |
| T13 | `/nc:start` nach abgebrochener Vorsitzung | Rückstand erkannt, Nachholen **nach** dem Stempel |
| T14 | Briefing überschreitet 20 Zeilen | gekürzt, Quellen-Fußblock bleibt |
| T15 | `NC_SECRETS_REF` nicht gesetzt | Hinweis, **kein** Abbruch; Wert taucht nirgends auf |
| T16 | GL2 trifft und GF3 trifft | GL2 sticht |
| T17 | Befund an einem Affiliate-Satelliten | **kein** Queue-Eintrag (GL5(i)) |
| T18 | Produktklassen-Änderung im Strang | **kein** Bump, **kein** CHANGELOG-Eintrag |
| T19 | `end-session` gegen den Router-Kontext-Deckel | unter 6.000 Zeichen |

---

## 11. Abnahme

1. Suite grün (aktuell 312; Zielzahl wird **nicht** in die Doku gespiegelt — A9)
2. `claude plugin validate` je Plugin grün
3. T1–T19 belegt
4. Maintainer-Wortlaut-Abnahme für C3 (GL1–GL5) liegt vor
5. Kein Eintrag im SSOT-Index zeigt ins Leere
6. `grep` auf Altpfade sauber (§5, Abnahme B)
7. PR-Memo trägt den Breaking-Hinweis aus I-8
8. Ein Bump, ein Waypoint-Schnitt, ein Tag — kein Zwischenstand

---

*Angelegt 2026-08-24 durch Claude (Opus 5, Claude Code) als Overseer auf Weisung Lucas
Vöhringer. Quellenarbeit: Opus-Ko-Planer-Dossier vom 2026-08-24 gegen
Onsite.ai-OS `origin/main@2530ced` (Kern 0.26.0); Overseer-Gegenprobe der tragenden Befunde
bestanden. Entscheide P-E1 bis P-E9 vom Maintainer am 2026-08-24.*
