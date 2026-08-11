# Bauplan 2026-08-11 — Prozesskorpus-Nachzug (Onsite → NovaCore) + isolierte Satelliten-SSOT

> **Status:** beschlossen dem Grundsatz nach (Maintainer-Weisung Lucas Vöhringer, 2026-08-11:
> „alles was du beim Onsite-OS in der Knowledge Base findest zum Bau und Standardprozessen gilt
> 1 zu 1 für das NovaCore-OS und Felix-Plugin und sollte in dieser Weisung umgebaut und
> angepasst werden"). **Entscheidungen E1–E3 sind getroffen** (§8, 2026-08-11): Onsite-Fünfer-
> struktur wörtlich · `plugin-bau.md` wird geteilt · Kimi-Pakete K-1 bis K-3 freigegeben mit
> geführtem Review-Zyklus (§5a). Baureihenfolge in §8a. Dieser Plan ist der jüngste
> Planungsstand in `grundwissen/` und **administriert** den Nachzug. Abweichungen → erst
> Plan-Nachtrag (§9), dann bauen.
>
> **Verhältnis zum Vorgänger:** Der [Onsite-Align-Umbau
> 2026-08-10](2026-08-10-onsite-align-umbau-bauplan.md) hat die **Kontroll-Schicht** und die
> **SSOT-Infrastruktur des Kerns** geholt. Dieser Plan holt den **Bau- und Prozesskorpus** nach
> und zieht die **Satelliten** an dieselbe Architektur — die Mapping- und Ausschlussregeln jenes
> Plans (§0.2, §2) gelten hier unverändert weiter.
>
> **Vorbild (gelesen, nicht erinnert):** `onsite-ai-devs/Onsite.ai-OS`, `origin/main` =
> `5d335a7` (lokaler Klon lag auf `f8cb0fb` — maßgeblich ist `origin/main`), Satellit
> `onsite-ai-devs/Onsite.ai-OS-Marketing` = `a9d8658` (lokal deckungsgleich).
> **Ziel-Repos:** dieses Repo (Kern `nc` 0.6.1) · `NovaCore-AI/Felix-OS` (`nc-felix` 0.2.1,
> `main` = `a8407fa`) · `NovaCore-AI/Biggi-OS` (`nc-biggi` 0.1.1) nachgelagert.

---

## 0. Auftrag und harte Ausschlüsse

1. **Prozesskorpus 1:1 übernehmen, auf NovaCore gemappt:** Der Onsite-Ordner
   `knowledge base/plugin-maintanance-ruleset-source/` (5 Dokumente) und die Bau-Vorlagen
   (`vorlagen/abteilungsplugin/`) sind die Weisungsquelle für `standardprozesse/` und
   `vorlagen/` dieses Repos. „1:1" heißt **inhaltsgleich in der Substanz**, nicht
   zeichengleich: Namen, Pfade und Ordner werden nach den Mapping-Regeln in §2 übersetzt.
2. **Satelliten erben die SSOT-Struktur:** Jeder eigenständige Satellit (`nc-felix`, danach
   `nc-biggi`) führt seine **eigene Wissensbasis samt Master-Index, Protokollen und
   mechanischem Wächter** — gepflegt von seinen **eigenen** Hooks und Skills. Onsite-Begriff:
   „Struktur-Vererbung" (`kern-ssot-aufbau.md` §4, dort *entschieden und erstmals vollzogen* am
   Satelliten `oai-marketing`).
3. **EINZIGER AUSSCHLUSS, unverändert aus dem Vorgängerplan §0.2 (nicht verhandelbar):**
   Keine Queue-Logik, keine Kuration, kein „Aufrücken" von Satellitenwissen in den Kern, keine
   Cross-Satelliten-Reads. **Die SSOT eines Satelliten ist terminal.** Was aus dem Vorbild
   trotzdem gilt, als reine Redaktionsdisziplin ohne Mechanik: „Kern verlinkt, Abteilung
   dokumentiert" (Doppelpflege-Verbot).
4. **Parallelbau mit externem Kimi-K3-Agenten ist zugelassen** und in §5 verbindlich geregelt
   (welche Pakete, welcher Vertrag, welche Konfliktzonen).

## 1. Verifizierte Ausgangslage (Quellstudium 2026-08-11)

### 1a. Prozesskorpus: Vorbild ↔ NovaCore-Ist

| Onsite-Dokument | NovaCore-Ist | Delta = Bauauftrag |
|---|---|---|
| `kern-plugin-bau.md` | in `standardprozesse/plugin-bau.md` **vermischt** mit dem Abteilungsteil | Zweiteilung nachziehen (Onsite hat sie 2026-08-09 vollzogen); Kernteil ergänzen um Governance-Zwei-Schichten-Tabelle, Autosync-Standardprozess, Mindest-Client-Schwellen |
| `abteilungs-plugin-bau.md` | dito; §3/§3a/§3b vorhanden und inhaltlich stark | fehlt: **Sparse-Clone-Regel**, Governance-Tabelle, Baustein „Satellit führt eigene Wissensbasis" |
| `Aktualisierungs-Index.md` (35 Änderungsarten) | `standardprozesse/aktualisierungs-index.md` (23 Änderungsarten) | 10 fehlende Zeilen (AP3), v. a. **Satelliten-SSOT**, „Bauplan abgeschlossen", „Idee ohne Auftrag / wird beauftragt", „Abteilungs-/Plugin-CLAUDE geändert", „Fremdsystem/Konnektor" |
| `kern-ssot-aufbau.md` (7 Grundbausteine + Andockpunkte) | nur mittelbar in `os-bau-methode.md` Phase 6 | eigener Standardprozess `ssot-aufbau.md` — **ohne** Queue-Andockpunkte, **mit** Isolations-Invariante |
| `sync-nachzug-bauzyklus.md` (Protokoll + Executor) | **fehlt vollständig** | portieren; ist zugleich die Konflikt-Mechanik für §5 |
| `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` | **fehlt** (`vorlagen/` hat nur plugin.json/README/VORLAGE) | anlegen, auf den NovaCore-Ordnerschnitt gemappt |
| Protokoll `debug-log.md` neben `agent-learnings.md` | **fehlt** — `debugging-findings/` führt nur das Fehlerprotokoll | anlegen (gefundene/behobene Bugs dieses Repos) |

### 1b. Satelliten-SSOT: Vorgabe ↔ Felix-Ist

Vorgabe (`ssot-grundgeruest.md.vorlage`, vollzogen in `Onsite.ai-OS-Marketing` samt
`test/wissensbasis.test.mjs`): eigene Wissensbasis, eigener Master-Index als **einzige**
Wurzeldatei, zwei append-only-Protokolle, Kategorien für laufende und abgeschlossene Pläne
sowie Ideen, mechanischer Wächter.

**Felix-Ist: 0 von 6 Bausteinen.** Kein `knowledge-base/`, kein Index, keine Protokolle, keine
Kategorien, kein Wächter (`test/` führt `manifest`, `nc-ffg`, `session-start`). `AGENTS.md`
(55 Z.) trägt Repo-Ordnung, aber keinen Pflicht-Einstieg über eine eigene Wissensbasis, keine
Änderungs-Matrix und keine Abschluss-Checkliste.

### 1c. Mechanik-Rückstand Felix (blockiert die Pflege durch Hooks/Skills)

| Befund | Beleg | Wirkung |
|---|---|---|
| `hooks/nc-ffg.js` endet auf `process.exit(0)` | Kern und `nc-biggi` haben `process.exitCode = 0` | POSIX-Pipe-Falle: gepufferte Deny-JSON kann abgeschnitten werden → **Gate blockt still nicht** |
| `hooks/lib/session-key.js` fehlt | Kern hat die Extraktion (Vorgängerplan AP1) | Gate 2 kann den Session-Schlüssel nicht teilen |
| `lib/bash-analyse.js` ohne Kern-Erweiterung 2026-08-10 | `git log --oneline -10`, `rev-parse --short HEAD`, `rev-parse HEAD` fehlen in der read-only-Liste | die Pflicht-Einstiegsbefehle laufen ins Routine-Bash-Gate |
| Gate 2 fehlt komplett (kein `nc-start-gate.js`, kein Stempel, `NC_START_GATE` 0 Treffer) | `nc-session-start.js` 90 Z., marker-gebunden an `.nc-os` | kein Session-Start-Zwang; die Injektion nennt keinen lebenden Stand |
| `.github/` führt nur `quality.yml` (ubuntu, Node 24) | `plugin-bau.md` §3b.2 fordert seit `nc-biggi` `ci.yml` + `release.yml` | keine Matrix, keine `--strict`-Validierung, keine Positivkontrolle, kein Release-Gate |

### 1d. Umgebungsbefunde

- Fremder Worktree `.worktrees/flatten-repo-root` (`refactor/flatten-repo-root`): Working Tree
  clean, **keine Commits außerhalb `main`**, Inhalt ist der überholte v0.1-Baum (`modules/`,
  `ncos.js`). Kein Risiko für diesen Plan; Aufräum-Kandidat → §8 E4.
- Marketplace-Pin `nc-felix` steht korrekt auf `a8407fa` + `ref v0.2.1`; Registry-Zeile
  (`repository`, `repoSkillsPath`) stimmt. Die Pin-Mechanik ist **nicht** Teil dieses Plans.
- **Sparse-Clone-Asymmetrie** (Onsite `abteilungs-plugin-bau.md` §1, gegen die offizielle Doku
  `plugin-marketplaces` verifiziert 2026-08-10): Bei ref/SHA-Pin klont Claude Code **nur das
  Plugin-Subverzeichnis**. Für den Kern (`source: ./plugins/nc`) heißt das: `knowledge-base/`
  wird **nie** ausgeliefert — dafür existiert `/nc:setup`. Für Felix (Repo **ist** Plugin) heißt
  es: die Wissensbasis **fährt im Paket mit**. Sie ist deshalb Arbeitsmaterial des Repos und
  **nie** Laufzeit-Abhängigkeit eines Skills (Invariante I3).

## 2. Mapping-Regeln (erben §2 des Vorgängerplans, hier ergänzt)

| Vorbild | NovaCore / Felix |
|---|---|
| `knowledge base/` (mit Leerzeichen) | `knowledge-base/` |
| `project-meta-infos/` | `grundwissen/` |
| `plugin-maintanance-ruleset-source/` | `standardprozesse/` |
| `Debugging + findings/` | `debugging-findings/` |
| `Aktive Baupläne/` | `grundwissen/` — laufende, datierte Pläne `YYYY-MM-DD-*.md`; dauerhafte Referenzdokumente ohne Datumspräfix liegen im selben Ordner (Bestandsschnitt, Ordner wird **nicht** umbenannt: `nc-session-start.js`, der Firmenblock, AGENTS und der Index zeigen darauf) |
| `Bauplan-archiv/` | `bauplan-archiv/` — **neu, Entscheid E1 vom 2026-08-11**: abgeschlossene oder verworfene Pläne, unverändert übernommen, **Pflicht-Verschiebung nach Abschluss**. Rein historisch und **terminal** — die Onsite-Begründung „einzige Quelle Richtung Kern (Kandidaten-Queue)" wird ausdrücklich **nicht** übernommen (§3 I1) |
| `Feature-idea-backlog/` | `ideen-backlog/` — **neu, Entscheid E1**: je Idee ein Dokument; wird eine Idee beauftragt, entsteht ein Bauplan in `grundwissen/`, der auf sie verweist. Leerer Ordner wird mit `PLATZHALTER.md` in Git gehalten (nicht indexpflichtig) |
| `feature-manuals/`, `sitzungswissen/` | nicht übernommen: Fremdsystemwissen entsteht erst mit Inhalt; Sitzungswissen lebt in `.nc/erinnerung/` des **Arbeits-Repos** (Bestandsentscheid) |
| `oai` / `OAI_*` / `/oai:` | `nc` / `NC_*` / `/nc:` — im Satelliten `/nc-felix:` bei **unverändertem** `NC_*`-Envnamen (Port-Kompatibilität, Bestand) |
| Onsite-Spec-§-Referenzen | Verweis auf dieses Repo (Bauplan + Definitionsdokumente) |

**Satelliten-Wissensbasis (Zielschnitt, gilt für Felix und später Biggi):**

```
knowledge-base/
  SSOT-Document-Index.md          einzige Datei auf Wurzelebene (Teil 1 Routing, Teil 2 Triage)
  grundwissen/                    laufende datierte Baupläne + eigene Referenzdokumente
  bauplan-archiv/                 abgeschlossen/verworfen, unverändert, terminal (PLATZHALTER.md solange leer)
  debugging-findings/
    agent-learnings.md            Fehlerprotokoll, append-only
    debug-log.md                  Debug-Log, append-only
  ideen-backlog/                  je Idee ein Dokument (PLATZHALTER.md solange leer)
```

Damit trägt jeder Satellit die **fünf Pflichtbausteine des Vorbilds** (laufende Pläne ·
Archiv · zwei Protokolle · Ideen-Backlog · Master-Index), benannt nach den NovaCore-Regeln.
Was das Vorbild **zusätzlich** zentral hält, bleibt zentral: `standardprozesse/` (für alle
Plugins normativ), die Produktdefinitionen in `grundwissen/` des Kerns und Fremdsystemwissen.
Der Satellit dokumentiert sein eigenes Vorhaben-, Fehler- und Ideenwissen — nichts davon
wandert nach oben.

## 3. Harte Invarianten (Review gated hierauf)

- **I1 — Isolation der Satelliten-SSOT (REVIEW-FOKUS).** Ein Satellit **schreibt nie in
  Kerndokumente** — weder direkt noch über eine Vorstufe. Daraus folgt zwingend, was hier
  **nicht** gebaut wird: keine Kandidaten-Queue, keine Kriterienliste, kein Kurationslauf,
  keine Promotion-Pipeline, kein Cross-Satelliten-Read. Eine Queue ist die Warteschlange **vor
  einem Schreibvorgang in den Kern**; fällt der Schreibvorgang weg, ist die Queue kein
  „später", sondern gegenstandslos. Konkret heißt das:
  - **`bauplan-archiv/` ist Historie, keine Staging-Fläche.** Das Vorbild begründet den Ordner
    als „einzige Quelle für Bauplan-Wissen Richtung Kern (Kandidaten-Queue)" — diese
    Begründung wird gestrichen, der Ordner bleibt aus eigenem Recht (Nachvollziehbarkeit
    abgeschlossener Vorhaben im Satelliten).
  - **Kein Feld, kein Format, kein Ablageort** für Kandidaten-Einträge (Datum · Einzeiler ·
    Verweis · Kriterium) entsteht — auch nicht „reserviert". Ein reservierter Platz ist eine
    halbe Queue und lädt zum Auffüllen ein.
  - **Keine Leseanweisung über die Repo-Grenze.** Ausgelieferte Satelliten-Dateien dürfen
    keinen Kern-Checkout als Pfad benutzen (Maschinenpfade wie `C:\…\NovaCoreAI-OS\…` sind
    verboten — Onsite hat genau das als „stärksten Drift-Punkt" seines Satelliten
    protokolliert); der Kern wird ausschließlich als **Quellenangabe** („OS-Repo") genannt.
  - **Umgekehrt genauso:** kein Kern-Artefakt liest eine Satelliten-Wissensbasis; der Kern
    kennt vom Satelliten nur Marketplace-Pin und Registry-Zeile.
  - **Was bleibt, ist Redaktionsdisziplin ohne Mechanik:** „Kern verlinkt, Abteilung
    dokumentiert" — dieselbe Sache wird nicht zweimal ausformuliert. Braucht der Kern später
    doch Satellitenwissen, ist das eine eigene Nachiteration mit eigener Konzeption, kein
    Nebenbei-Schritt.
- **I2 — Prüfungs-Eigentum.** Jede Prüfung hat genau ein Heimat-Plugin; keine Kern-Prüfung wird
  dupliziert oder abgeschwächt. Standalone-Satelliten tragen **eigene Kopien** der Gates, weil
  sie Kern-Hooks technisch nicht erreichen — das ist keine Duplikation im Sinne der Regel.
- **I3 — Plugin-Grenze.** In ausgelieferten Dateien keine `../`-Verweise und keine Repo-Pfade;
  was ein Skill zur Laufzeit braucht, liegt im Plugin. Die Wissensbasis eines Satelliten ist
  Arbeitsmaterial, nie Laufzeit-Abhängigkeit.
- **I4 — Index-Pflicht und Wurzel-Regel, beidseits.** Nur der Index liegt direkt in
  `knowledge-base/`; jede Wissensdatei bekommt ihre Index-Zeile in **derselben** Änderung.
  Testerzwungen im Kern (`struktur.test.mjs`) und künftig im Satelliten
  (`test/wissensbasis.test.mjs`).
- **I5 — Version nur an einer Stelle.** `plugin.json`; beim Kern zusätzlich `VERSION` +
  `module-registry.json`. Nie `version` im Marketplace-Eintrag. Satelliten-Pin per `ref` +
  40-stelligem `sha`.
- **I6 — Quelle schlägt Gedächtnis.** Jede Port-Datei wird beim Bau aus `origin/main` des
  Vorbilds gelesen (`git -C Onsite.ai-OS show "origin/main:<pfad>"`), nie rekonstruiert.
- **I7 — Fail-open korrekt (REVIEW-FOKUS).** Jeder Hook endet auf `process.exitCode = 0`;
  `process.exit()` ist verboten (Truncation-Falle). Opt-out-Env je Gate an drei Orten
  dokumentiert (Hook-Kopf, `hooks.json`, README).

## 4. Arbeitspakete

**Spur T1 = Kern-Repo** (dieses Repo, Branch `feat/prozesskorpus-nachzug-satelliten-ssot`) ·
**Spur T2 = Felix-Repo** · **Spur T3 = Biggi-Repo**. T1 und T2 laufen in **verschiedenen Repos**
und damit echt parallel; T3 folgt den Lehren aus T2.

### AP1 (T1) — `plugin-bau.md` zweiteilen und ergänzen

Quelle lesen: Onsite `kern-plugin-bau.md`, `abteilungs-plugin-bau.md`.
1. `standardprozesse/plugin-bau.md` → `standardprozesse/kern-plugin-bau.md` (`git mv`, Historie)
   und `standardprozesse/abteilungs-plugin-bau.md` neu; der heutige §1/§2/§3/§3a/§3b-Stoff wird
   sinnrichtig verteilt, §3b (Satelliten-OS) bleibt vollständig im Abteilungsdokument.
2. Kernteil ergänzen: Governance-Zwei-Schichten-Tabelle (team-shared ↔ individuell),
   Autosync-Standardprozess als eigener Abschnitt (Mechanik, Idempotenz über den Versions-Stempel
   im Block, Backup, fail-safe bei defekten Markern, kein Cron), Mindest-Client-Schwellen.
3. Abteilungsteil ergänzen: **Sparse-Clone-Regel** (§1d), Zeile „Satellit führt eine eigene
   Wissensbasis nach `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage`", und in §3b.1 den
   Baustein „eigene Wissensbasis + Wächter" neben Kontroll-Schicht und CI.
4. `grep -rn "plugin-bau.md"` über dieses Repo — jede Fundstelle auf das richtige der zwei
   Dokumente umbiegen. Satelliten-Repos zählen nicht dazu (T2/T3).

**Abnahme:** `node --test plugins/nc/tests/*.test.mjs` grün · kein toter Verweis auf den alten
Dateinamen · Index-Zeilen für beide Dateien.

### AP2 (T1) — `ssot-aufbau.md` als Standardprozess

Quelle lesen: Onsite `kern-ssot-aufbau.md`.
Übernommen werden Zielbild, die **7 Grundbausteine**, der Aufbau-Ablauf (Kategorien und Routing
zuerst, Index sofort testerzwingen, Protokolle, Änderungs-Matrix, Norm-Nachtragsprinzip, Rituale,
Verifikation), die Anti-Drift-Prinzipien und die Replikationsanleitung. **Ersetzt** wird der
Abschnitt „Plugin-Verknüpfungsvorbereitung": statt Queue/Promotion/Cross-Reads trägt er die
**Struktur-Vererbung plus Isolations-Invariante I1** und verweist auf die Vorlage aus AP4. Die
Zweistufigkeit „Kern kompakt, Satellit vollständig" bleibt als Redaktionsregel.

**Abnahme:** `grep -in "queue\|promotion\|kuration"` im neuen Dokument trifft ausschließlich die
Ausschluss-Erklärung · Index-Zeile gesetzt.

### AP3 (T1) — Aktualisierungs-Index, zweites Protokoll, zwei neue Kategorien

1. Neue Zeilen in `standardprozesse/aktualisierungs-index.md` §2, auf NovaCore-Artefakte
   bezogen: **Satelliten-SSOT geändert** · **Satelliten-Wissensbasis neu angelegt** · Bauplan
   abgeschlossen · Idee ohne Auftrag · Idee wird beauftragt · Abteilungs-/Plugin-CLAUDE geändert ·
   Fremdsystem/Konnektor/MCP · Satelliten-Hook/Gate geändert · Protokolleintrag fällig · Vorlage
   `ssot-grundgeruest` geändert.
2. `debugging-findings/debug-log.md` anlegen (append-only-Kopf: Datum · Symptom · Ursache · Fix ·
   Beleg) und in §4 der Protokoll-Tabelle führen.
3. **Zwei neue Kategorien anlegen** (Entscheid E1): `knowledge-base/bauplan-archiv/` und
   `knowledge-base/ideen-backlog/`, je mit `PLATZHALTER.md`, solange leer. Dazu die
   Lebenszyklus-Regel: **abgeschlossene oder verworfene datierte Pläne werden nach Abschluss
   aus `grundwissen/` nach `bauplan-archiv/` verschoben** (`git mv`, Inhalt unverändert, nicht
   rückwirkend umschreiben). Der Archiv-Ordner ist terminal (I1). Die Änderungsarten „Bauplan
   abgeschlossen", „Idee ohne Auftrag" und „Idee wird beauftragt" aus Schritt 1 tragen genau
   diese Bewegungen.
4. **Bestand einsortieren:** Die heute in `grundwissen/` liegenden abgeschlossenen Pläne
   (`2026-07-28-umbau-plan.md`, Status *historisch* im Index) nach `bauplan-archiv/`
   verschieben; laufende Pläne (Status *lebend*) bleiben. Index Teil 1 und Teil 2 in derselben
   Änderung nachziehen, `grep -rn` nach den alten Pfaden über das ganze Repo.
5. **Sparsamkeitsregel:** keine neuen Spiegelstellen für Zahlen.

6. **Wächter nachziehen — sonst rote Suite:** `plugins/nc/tests/struktur.test.mjs` kennt heute
   **keine** `PLATZHALTER.md`-Ausnahme (verifiziert 2026-08-11: Grep ohne Treffer), die
   Index-Vollständigkeitsprüfung würde jede Platzhalterdatei einfordern. Ausnahme nach dem
   Muster des Marketing-Satelliten ergänzen (`rel.endsWith('PLATZHALTER.md')` → `continue`,
   Begründung im Kommentar: strukturell, bewusst unindiziert) **plus** eine neue Invariante
   „jede Kategorie unter `knowledge-base/` ist im Index Teil 1 geroutet".

**Abnahme:** jede neue Zeile nennt Pflichtlektüre, Nachzüge und Mechanik · Index-Zeilen für
`debug-log.md` und die verschobenen Pläne · `PLATZHALTER.md`-Ausnahme im Test belegt (Suite
läuft mit beiden neuen, leeren Kategorien grün) · kein toter Pfad · Suite grün.

### AP4 (T1) — Vorlage `ssot-grundgeruest.md.vorlage`

Quelle lesen: Onsite-Vorlage. Die **fünf Pflichtbausteine bleiben vollständig** (Entscheid E1),
benannt nach §2: `grundwissen/` · `bauplan-archiv/` · `debugging-findings/` mit beiden
Protokollen · `ideen-backlog/` · `SSOT-Document-Index.md` als einzige Wurzeldatei. Tabelle
„Ordner/Datei · Zweck · Lebenszyklus" übernehmen, Protokollköpfe wörtlich mitliefern,
Platzhalter `{{ABTEILUNG}}` beibehalten, `PLATZHALTER.md`-Regel nennen.
**Zwei Streichungen gegenüber dem Vorbild, beide begründet:** die Zeile „Bauplan-archiv =
einzige Quelle Richtung Kern (Kandidaten-Queue)" fällt weg (Archiv ist Historie), und der
Abschnitt „Reserviert" (Kandidaten-Queue, Pflege-Ausprägung) wird **nicht** übernommen —
ersetzt durch den Absatz „Isolation: die SSOT dieses Satelliten ist terminal; er schreibt nie
in Kerndokumente, deshalb existiert keine Queue und kein reservierter Platz für eine".
`vorlagen/abteilungsplugin/VORLAGE.md` um Variablen- und Kopierzeile ergänzen.

**Abnahme:** Invariante „Vorlage ist kein Plugin" bleibt grün (Platzhalter stehen) · Index- und
Repo-Karten-Zeilen nachgezogen.

### AP5 (T1) — Nachzug und Abschluss

`AGENTS.md` (Repo-Karte, Glossar, Sync-Matrix, Produktstand), `README.md`, `ONBOARDING.md`,
`knowledge-base/SSOT-Document-Index.md` (Teil-1-Routing-Zeilen für `bauplan-archiv/` und
`ideen-backlog/` inkl. „gehört nicht hierher" und Lebenszyklus, Teil 2 für alle neuen
Dokumente, Mapping-Tabelle zum Vorbild aktualisieren — die heutige Zeile „kein eigener Ordner"
ist mit E1 überholt), `CHANGELOG.md` unter `[Unreleased]` mit Namenszeichnung, **Kern-Bump
0.6.1 → 0.7.0** (Neuerung; nur `plugin.json` + `VERSION` + Registry).

**Abnahme:** `node --test plugins/nc/tests/*.test.mjs` · `claude plugin validate .` ·
`claude plugin validate plugins/nc --strict` · `claude plugin validate plugins/nc-development --strict`.

### AP6 (T2) — Felix: Kontroll-Schicht auf Kern-Stand

Quelle lesen: `plugins/nc/hooks/nc-ffg.js`, `hooks/lib/session-key.js`, `lib/bash-analyse.js`
**dieses** Repos (nicht Onsite — der Kern trägt die NC-Härtungen).
1. `hooks/lib/session-key.js` anlegen (Inhalt = Kern-Fassung), die lokalen Kopien in `nc-ffg.js`
   entfernen und die Lib requiren.
2. `process.exit(0)` → `process.exitCode = 0` in **allen** `hooks/*.js`.
3. `lib/bash-analyse.js`: read-only-Git um die `-N`-Kurzform bei `log` sowie
   `rev-parse --short HEAD` und blankes `HEAD` erweitern; NC-Härtungen nicht abschwächen.

**No-diff-Zone:** `skills/**`, `module-registry.json`, `.claude-plugin/plugin.json` (außer
Version), `wp-rahmen.md`. **Abnahme:** `node --test test/*.test.mjs` grün, Testfälle T-10 bis
T-12 aus §6 · Patch-Bump 0.2.1 → 0.2.2.

### AP7 (T2) — Felix: Gate 2 portieren

Quelle lesen: `plugins/nc/hooks/nc-session-start.js`, `nc-start-gate.js`, `nc-start-stempel.js`,
`hooks/hooks.json` dieses Repos; Satelliten-Zuschnitt vergleichend aus `Biggi-OS`.
1. Drei Hookdateien portieren; die Marker-Bindung an `.nc-os` **entfällt** („ein Gate, das man
   vergessen kann, ist kein Gate"), Opt-out `NC_START_GATE=off`, Subagenten ausgenommen,
   Stempelpfad `os.tmpdir()/nc-felix-start-gate`.
2. `hooks/hooks.json`: zweiten PreToolUse-Block mit Matcher
   `Write|Edit|MultiEdit|NotebookEdit|Bash` ergänzen; `description` auf den Ist-Stand der
   **gesamten** Kontroll-Schicht heben.
3. Die Session-Start-Injektion nennt den lebenden Stand aus **Felix' eigener**
   `knowledge-base/grundwissen/` (jüngste fünf datierte Dateien) — der inhaltliche Grund, warum
   AP8 vor dem Abschluss von AP7 stehen muss.
4. `skills/start/SKILL.md`: Marker-Schritt entfernen, Schritt „Start-Stempel setzen (Gate 2)"
   ergänzen, Abnahme-Zeilen anpassen.

**Abnahme:** Negativproben T-13 bis T-16 mit **zitierter Ausgabe** belegt · Minor-Bump
0.2.2 → 0.3.0 · `claude plugin validate . --strict`.

### AP8 (T2) — Felix: eigene isolierte Wissensbasis

Vorlage: AP4 (falls T1 vorausläuft), sonst direkt Onsite-Vorlage + Marketing-Satellit als
vollzogene Instanz.
1. Struktur nach §2 anlegen — alle **fünf** Bausteine, `bauplan-archiv/` und `ideen-backlog/`
   mit `PLATZHALTER.md`, solange leer. `SSOT-Document-Index.md` mit Kopf (Zweck, Benutzung,
   Verhältnis zum OS-Repo **als Quellenangabe**, Pflege/testerzwungen, Auslieferungshinweis
   „Arbeitsmaterial des Repos, nie Laufzeit-Abhängigkeit eines Skills"), Teil 1 Routing mit
   Lebenszyklus je Ordner (inkl. Pflicht-Verschiebung ins Archiv), Teil 2 Triage.
   **Kein „Teil 0"** nach Marketing-Vorbild („Kategorien, die bewusst im OS-Repo bleiben"): Der
   Satellit führt alle fünf Bausteine selbst, zentral bleiben nur die Standardprozesse und die
   Produktdefinitionen — das steht im Kopf als Quellenangabe, nicht als eigene Tabelle.
2. Beide Protokolle mit append-only-Kopf; kein Vorbefüllen — der erste Eintrag in
   `agent-learnings.md` entsteht beim ersten echten Fehler.
3. Ersten eigenen Bauplan in `grundwissen/` ablegen: die Modul-Definition mit Felix
   (`/nc-felix:skill-builder`) — damit ist der Ordner ab Tag 1 nicht leer.
4. `test/wissensbasis.test.mjs` anlegen (Fälle T-1 bis T-9), inklusive der Isolationsprüfungen
   T-7 und T-8.
5. `AGENTS.md` erweitern: Pflicht-Einstieg (Log-Stand → CHANGELOG/Version → eigener Index →
   `agent-learnings.md`), Abschluss-Checkliste, Protokollzwang, Verweis auf die Standardprozesse
   des OS-Repos **als Quellenangabe** (kein Maschinenpfad — I1).
6. `felix-sync.md` um den Pflegeabsatz ergänzen (welche Datei wann nachgezogen wird).

**Abnahme:** `node --test test/*.test.mjs` grün · `grep -rn` findet keinen Kern-Maschinenpfad in
ausgelieferten Dateien · reine Wissensbasis-Änderungen brauchen keinen Bump, CHANGELOG-Eintrag
trotzdem.

### AP9 (T2) — Felix: Pflege-Skill und CI/Release

1. `skills/doku-sync/SKILL.md` portieren (Quelle: `plugins/nc/skills/doku-sync/SKILL.md`),
   Checkliste = Abschluss-Checkliste aus AP8.5, Stempelpfad `.git/nc-felix/doku-sync.stamp`,
   Aufrufform `/nc-felix:doku-sync`; Registry-Statuszeile und README nachziehen.
2. `.github/workflows/ci.yml` + `release.yml` nach §3b.2 (Vorlage: `Biggi-OS`): Matrix
   ubuntu+windows × Node 20/22/24, Bash-Glob-Testaufruf, `validate . --strict` mit
   **Positivkontrolle**, Actions per Full-SHA, Release-Vorbedingungen (annotierter Tag,
   Tag↔Manifest, Suite grün, CHANGELOG-Abschnitt). `quality.yml` entfällt.

**Abnahme:** CI grün auf allen sechs Matrix-Feldern · Positivkontrolle rot bei absichtlich
defektem Wegwerf-Skill · Minor-Bump auf 0.4.0.

### AP10 (T1) — Kern: Satelliten-Stand nachziehen

Nach jedem Felix-Release: Marketplace-Pin (`ref` + Full-SHA), `module-registry.json`
(Statuszeile: eigene Wissensbasis + Gate 2), `AGENTS.md`, `README.md`, `ONBOARDING.md`,
Gates-Definition (Satelliten-Abschnitt: Felix trägt jetzt Gate 1 **und** 2), `CHANGELOG.md`.

### AP11 (T3) — Biggi nach demselben Muster

Reihenfolge wie AP6/AP8/AP9. Biggi hat Gate 2 im Injektionsteil bereits; es fehlen der
`exitCode`-Fix, die `bash-analyse`-Erweiterung, der Erzwingungs-Begleiter, die Wissensbasis und
`doku-sync`. Erst nach abgeschlossenem Felix-Pilot.

## 5. Kimi-K3-Parallelbau (verbindlicher Schnitt)

**Werkzeug:** Plugin `kimi-code-plugin-cc@novacoreai` (Host-Anforderung: `uv` + `kimi`-CLI).
Loops: `/kimi-code-review` (Einzelpass), `/kimi-review` bzw. `santa-loop` (adversarial — zwei
unabhängige Reviewer müssen zustimmen).

**Vertragsform je Kimi-Paket (Plan-Sandwich, ohne Ausnahme):** ① Warum/Nicht-Ziele · ② die harten
Invarianten aus §3 mit benanntem Review-Fokus · ③ exakte Dateien plus **No-diff-Zonen** · ④ die
nummerierten Testfälle aus §6, write-first · ⑤ Abnahmebefehle · ⑥ Escape-Hatch: widerspricht der
Code dem Plan, gewinnt der Code — Abweichung melden, nicht erzwingen.

| Paket | Inhalt | Vergabe | Begründung |
|---|---|---|---|
| **K-1** | AP1 + AP2 + AP3 + AP4 (Prozesskorpus als ein Paket) | **Kimi** | Textarbeit gegen feste Vorlage und Mapping-Tabelle; großer Umfang, geringes Risiko. Ein Paket, weil die vier APs sich gegenseitig verlinken |
| **K-2** | AP8.1–AP8.3 + AP8.6 (Felix-Wissensbasis + Doku) | **Kimi** | strukturell vorgegeben, mechanisch prüfbar |
| **K-3** | AP9.2 (Felix CI/Release-Port) | **Kimi** | 1:1-Port mit Vorlage `Biggi-OS`; die CI belegt das Ergebnis selbst |
| **O-1** | AP6 + AP7 (FFG-Härtung, Gate 2, Stempel) | **Opus, nicht delegieren** | sicherheitskritisch mit stillem Ausfallmodus (I7); die A/B-Messung 2026-07-26 belegt Opus für merge-kritische Erstqualität |
| **O-2** | AP8.4 (`wissensbasis.test.mjs`, insb. T-7/T-8) | **Opus** | der Wächter der Review-Fokus-Invariante I1 darf nicht von der delegierten Seite geschrieben werden |
| **O-3** | AP5 + AP10 (Nachzüge, Bumps, Pins) | **Opus** | Versions- und Pin-Mechanik, Spiegelstellen-Disziplin |

**Regeln des Parallelbetriebs:**

1. **Implementierer ≠ Reviewer.** Was Kimi baut, reviewt Opus; AP6/AP7 gehen zusätzlich durch
   `santa-loop` (Kimi als heterogener Zweitreviewer). Kein Paket geht ohne Fremdreview weiter.
2. **Ein Paket = ein Branch/Worktree.** T1-Pakete im Kern-Repo, T2-Pakete im Felix-Repo — die
   Spuren kollidieren dateiweise nicht.
3. **Konfliktzone strikt ausgenommen:** `CHANGELOG.md`, `AGENTS.md`, `README.md`,
   `SSOT-Document-Index.md`, `module-registry.json` und alle Versionsdateien fasst **kein**
   Paketagent an. Diese Nachzüge werden **protokolliert und am Zyklusende gebündelt** von O-3
   erledigt — genau der Prozess, den AP2/AP3 gerade portieren (`sync-nachzug-bauzyklus.md`).
   Ausnahme, weil testerzwungen: die Index-Zeile einer **neu angelegten** Wissensdatei entsteht
   sofort mit ihr; sie gehört ins Paket, nicht ins Protokoll.
4. **Protokollpflicht:** je inhaltliche Änderung eine Zeile `Änderungsart · was geändert · fällige
   Nachzüge` in `sync-protokoll.md` im jeweiligen Worktree — **nicht committen**, vor dem
   Commit-Vorschlag löschen.
5. **Kostenlage** (A/B-Messung 2026-07-26): Kimi lag bei rund einem Drittel weniger Input und
   unter der Hälfte Output — der Grund für diesen Zuschnitt, nicht für eine Ausweitung auf
   sicherheitskritische Pfade.
6. **Kein delegierter Agent erhält Schreibrecht auf `main`**, keine Freigabe für Commit/Push.

**Status: K-1 bis K-3 sind freigegeben** (Maintainer-Entscheid E3 vom 2026-08-11) — mit einem
abschließenden, **von Claude (Opus 5) geführten Review-Zyklus**.

### 5a. Geführter Review-Zyklus (verbindlich vor jedem Commit-Vorschlag)

Ein Zyklus je Paket, danach ein Integrations-Durchgang über alle Pakete:

1. **Vertrag zuerst:** Vor dem Start erhält jedes Kimi-Paket seinen Plan-Sandwich-Auftrag
   (①–⑥ oben) als Text — die Testfälle aus §6 **write-first**, die No-diff-Zonen wörtlich.
2. **Mechanische Vorprüfung** (führender Agent, ohne Modell-Urteil): `git diff` gegen die
   No-diff-Zonen · Abnahmebefehle des Pakets ausführen und Ausgabe zitieren ·
   Testfall-Abgleich (Präsenz **und** Bedeutung jedes Falls, nicht nur die Zählung).
3. **Inhaltliches Review** durch den führenden Agenten gegen die Invarianten I1–I7, mit
   ausdrücklichem Fokus auf I1 (Isolation) und I7 (Fail-open).
4. **Adversariale Runde nur für O-1** (FFG-Härtung, Gate 2): `santa-loop` mit Kimi als
   heterogenem Zweitreviewer — grün erst, wenn beide unabhängig zustimmen.
5. **Befundbehandlung:** CRITICAL/HIGH werden vor dem nächsten Paket behoben, nicht gesammelt;
   jeder eigene Fehler wandert **sofort** nach `debugging-findings/agent-learnings.md`, jeder
   gefundene Bug nach `debug-log.md`.
6. **Integrations-Durchgang:** über alle Pakete gemeinsam — Nachzugs-Protokolle einsammeln,
   Nachzüge gebündelt durch O-3 ausführen, dann Volllauf: `node --test` je Repo,
   `claude plugin validate` beider Ebenen, `grep`-Sweep nach Alt-Pfaden, Matrix-Selbsttest
   („habe ich etwas vergessen?").
7. **Vorlage an den Maintainer:** Zusammenfassung je Paket (was gebaut, was gefunden, was
   offen) plus Commit-Vorschlag. **Freigabe bleibt beim Menschen** (§7).

## 6. Nummerierte Testfälle (write-first)

**Felix-Wissensbasis (`test/wissensbasis.test.mjs`, O-2):**
T-1 Index existiert · T-2 nur der Index liegt als `.md` direkt in `knowledge-base/`
(Wurzel-Regel) · T-3 jede `.md` unterhalb hat eine Index-Zeile (`PLATZHALTER.md` ausgenommen) ·
T-4 jeder Index-Link zeigt auf eine existierende **Datei** · T-5 **alle vier** Kategorien
existieren (`grundwissen/`, `bauplan-archiv/`, `debugging-findings/`, `ideen-backlog/`) und
jede ist im Index Teil 1 geroutet · T-6 beide Protokolle existieren und tragen den
append-only-Kopf · **T-7 Isolation:** kein Pfad oder Dateiname in `knowledge-base/` matcht
`queue|kandidat|promotion|kuration` · **T-8 Isolation:** keine ausgelieferte Datei (`skills/**`,
`hooks/**`, `*.md` der Wurzel) enthält einen Kern-Maschinenpfad oder
`knowledge-base/standardprozesse/` als Leseanweisung — Nennung nur mit „OS-Repo" in
unmittelbarer Nähe · T-9 Plugin-Grenze: keine `../`-Verweise in `skills/**` und `hooks/**`.

**Felix-Kontroll-Schicht (`test/nc-ffg.test.mjs`, `test/start-gate.test.mjs`, O-1):**
T-10 jede Datei in `hooks/` endet auf `process.exitCode = 0` und enthält kein `process.exit(` ·
T-11 `git log --oneline -10` gilt als read-only-Git (kein Routine-Gate) · T-12
`git rev-parse --short HEAD` **und** `git rev-parse HEAD` gelten als read-only · T-13 das
Start-Gate lehnt `Write` ohne Stempel ab · T-14 ein Stempel mit falschem `--head` öffnet nicht ·
T-15 der Stempel-Durchlass verwirft angehängte Zweitaktionen (`;`, `&&`, `|`, `$(…)`,
Zeilenumbruch) · T-16 der Session-Start injiziert **ohne** `.nc-os`-Marker und nennt die jüngsten
datierten Dateien aus `knowledge-base/grundwissen/`.

## 7. Rote Linien

**Kein Commit, kein Push, kein PR, kein Merge, kein Tag/Release ohne ausdrückliche
Maintainer-Freigabe** — in keinem der drei Repos, auch nicht durch delegierte Agenten. Arbeit
nur auf Feature-Branches. `~/.claude/CLAUDE.md` des Entwicklers wird nicht beschrieben
(Autosync-Tests laufen ausschließlich gegen `NC_AUTOSYNC_TARGET`). Keine Secrets in Dateien,
Logs oder Commits. Behauptung nur mit gesehener Ausgabe.

## 8. Maintainer-Entscheidungen (2026-08-11 — nicht neu verhandeln)

- **E1 — ENTSCHIEDEN: Onsite-Fünferstruktur wörtlich.** Kern **und** Satelliten führen alle fünf
  Bausteine; `bauplan-archiv/` und `ideen-backlog/` kommen hinzu, abgeschlossene Pläne werden
  pflichtgemäß ins Archiv verschoben. Namen folgen den NovaCore-Mapping-Regeln (§2). Das
  revidiert die „kein eigener Ordner"-Regel des Vorgängerplans → Nachtrag N1.
- **E2 — ENTSCHIEDEN: teilen.** `kern-plugin-bau.md` + `abteilungs-plugin-bau.md` per `git mv`
  plus Verweis-Sweep (AP1).
- **E3 — ENTSCHIEDEN: K-1 bis K-3 an Kimi K3 freigegeben**, mit abschließendem geführten
  Review-Zyklus nach §5a. O-1 bis O-3 bleiben bei Opus.
- **E4 — offen (blockiert nichts):** stale Worktree/Branch `refactor/flatten-repo-root` und die
  Alt-Backups `_wzs-*-backup-*/` entfernen?
- **E5 — offen, Empfehlung steht:** Pflege-Ausprägungsdatei im Satelliten in v1 **weglassen**
  (Felix ist sein eigener Kern, die Pfade stehen fest; Onsite hat das Format selbst noch nicht
  definiert). Ohne Gegenrede wird so gebaut.

### 8a. Baureihenfolge (aus E3 abgeleitet, nicht separat entschieden)

Die Startspur-Frage blieb offen; aus der Kimi-Freigabe folgt der parallele Anlauf:

1. **sofort parallel:** K-1 (Prozesskorpus im Kern-Repo) **und** O-1/AP6 (Felix-FFG-Härtung —
   der stille Gate-Ausfall wirkt heute, er wartet nicht auf Doku).
2. **danach:** O-1/AP7 (Gate 2 in Felix, braucht `session-key.js` aus AP6) · K-3 (Felix
   CI/Release, unabhängig).
3. **nach AP4:** K-2 (Felix-Wissensbasis gegen die dann fertige Vorlage) + O-2 (Wächter mit den
   Isolationsprüfungen).
4. **zuletzt:** O-3 (gebündelte Nachzüge, Bumps, Pin) → Integrations-Durchgang §5a.6 →
   Vorlage an den Maintainer. AP11 (Biggi) erst nach dem Felix-Pilot.

## 9. Plan-Nachträge aus der Umsetzung

> Regel: Abweichungen werden **erst hier dokumentiert, dann gebaut**. Jeder Nachtrag nennt Anlass,
> Entscheidung und Begründung; der jüngste gewinnt.

### N1 — Revision der „kein eigener Ordner"-Regel des Vorgängerplans

**Anlass:** Der Bauplan 2026-08-10 §2 hat entschieden, **keinen** Ordner für aktive/archivierte
Baupläne anzulegen (datierte Dateien in `grundwissen/`, nichts wird archiviert) und Backlog-
sowie Manual-Kategorien erst „bei Inhalt" entstehen zu lassen.

**Entscheidung (Maintainer, 2026-08-11, E1):** Diese Regel wird **revidiert**. Kern und
Satelliten führen die Onsite-Fünferstruktur vollständig: `bauplan-archiv/` und `ideen-backlog/`
kommen hinzu, abgeschlossene oder verworfene Pläne werden pflichtgemäß aus `grundwissen/` ins
Archiv verschoben. `grundwissen/` bleibt der Ort laufender Pläne **und** der dauerhaften
Referenzdokumente — der Ordner wird **nicht** umbenannt, weil `nc-session-start.js`, der
Firmenblock-Payload, `AGENTS.md`, die Skills und der Index auf ihn zeigen (unnötiger
Blast-Radius ohne inhaltlichen Gewinn).

**Begründung:** Ohne Archiv verliert `grundwissen/` die Aussage „das läuft gerade" — dieselbe
Erfahrung, die das Vorbild zur Pflicht-Verschiebung geführt hat. Der Vorgängerplan wird **nicht**
in-place umgeschrieben (Norm-Nachtragsprinzip); die Mapping-Tabelle des
`SSOT-Document-Index` wird in AP5 auf den neuen Stand gezogen und verweist auf diesen Nachtrag.

**Grenze:** Die Revision betrifft **nur** die Ordnerstruktur. Der harte Ausschluss aus
§0.2/§0.3 des Vorgängerplans bleibt unberührt — insbesondere ist `bauplan-archiv/` **keine**
Kandidaten-Queue und **keine** Quelle Richtung Kern (I1).

### N2 — Kimi kann nicht bauen: Rollenwechsel von Implementierer zu Reviewer

**Anlass:** §5 hat die Pakete K-1 bis K-3 als **Bauaufträge** an Kimi K3 geschnitten. Beim
Anlauf am 2026-08-11 gegen den realen Werkzeugvertrag geprüft: Das MCP-Werkzeug
`run_agent` des Plugins `kimi-code-plugin-cc` erzwingt `approval_policy: read-only` —
wörtlich „In v1.0 only `read-only` is enforced; any higher policy raises a structured error
(the adapter refuses it rather than recording an unenforced grant)". Der externe Agent kann
Dateien **lesen und beurteilen, aber nicht schreiben**. Host-Voraussetzungen sind erfüllt
(`uv` und `kimi` liegen im PATH), die Grenze ist also die Adapter-Politik, nicht das Setup.

**Entscheidung:** Die **Rollen tauschen**, der Zuschnitt bleibt. Opus baut alle Pakete
(K-1 bis K-3 werden zu O-4 bis O-6); Kimi übernimmt in denselben Grenzen die **externe
Zweitmeinung**: `run_review_loop` je fertiges Paket und `run_santa_loop` für die
sicherheitskritischen Pakete (FFG-Härtung, Gate 2). Damit bleibt die tragende Regel
„Implementierer ≠ Reviewer" erhalten — sie war der eigentliche Zweck des Schnitts, nicht die
Arbeitsteilung beim Schreiben.

**Begründung:** Ein Bauauftrag, dessen Ergebnis der Auftragnehmer nicht schreiben kann, würde
den ganzen Text durch den Kontext des führenden Agenten schleifen — der Effizienzgewinn
entfällt, das Drift-Risiko bleibt. Die A/B-Messung vom 2026-07-26 hat für merge-kritische
Erstqualität ohnehin Opus belegt und als bewährte Paarung „Opus implementiert, Kimi reviewt
extern" festgehalten; N2 stellt genau diese Paarung her.

**Wirkung auf §5/§5a:** Die Pakettabelle gilt inhaltlich weiter (gleiche Grenzen, gleiche
No-diff-Zonen, gleiche Testfälle), nur die Spalte „Vergabe" ist für K-1 bis K-3 auf Opus
umgestellt. §5a bleibt vollständig in Kraft; Schritt 4 (adversariale Runde) wird von der
Ausnahme zur Regel für O-1, O-4 und die Isolationsprüfungen.

### N3 — „Sparse-Clone-Regel": richtige Schlussfolgerung, falsche Begründung

**Anlass:** §1d und AP1.3 stützen die Auslieferungsgrenze auf die Aussage, Claude Code klone bei
ref/SHA-Pin „**nur das Plugin-Subverzeichnis**" (übernommen aus Onsite `abteilungs-plugin-bau.md`
§1, dort belegt mit `plugin-marketplaces`, verifiziert 2026-08-10). Vor dem Bau von AP1 erneut
gegen die offizielle Doku gehalten (`code.claude.com/docs/en/plugin-marketplaces`, abgerufen
2026-08-11 — die alte Adresse `docs.claude.com/en/docs/claude-code/…` antwortet mit `301` auf
diesen Host): **Die Aussage trifft in dieser Form nicht zu.**

- Der sparse/partial clone hängt am **Source-Typ `git-subdir`**, nicht am Pin: „Use `git-subdir`
  to point to a plugin that lives inside a subdirectory of a git repository. Claude Code uses a
  sparse, partial clone to fetch only the subdirectory". Daneben gibt es das **Opt-in-Flag**
  `claude plugin marketplace add … --sparse <paths…>` („Limit checkout to specific directories
  via git sparse-checkout").
- Ein `github`-Source mit `ref`/`sha` — die Pin-Form **beider** Satelliten — klont das **ganze**
  Repo: „Git-based marketplaces clone the entire repository, making relative paths work
  correctly."
- Die reale Auslieferungsgrenze entsteht **einen Schritt später**, beim Install: „when users
  install a plugin, Claude Code copies **the plugin directory** to a cache location" bzw. „it
  copies the plugin into the local versioned plugin cache at `~/.claude/plugins/cache`".

**Entscheidung:** Die Regel wird mit der **richtigen Mechanik** gebaut und heißt nicht mehr
„Sparse-Clone-Regel", sondern **Auslieferungsgrenze (Kopie des Plugin-Verzeichnisses)**. An den
Schlussfolgerungen ändert sich nichts — sie werden nur tragfähig:

| Fall | Plugin-Verzeichnis | Folge für die Wissensbasis |
|---|---|---|
| Kern `nc` (`source: "./plugins/nc"`) | `plugins/nc/` | `knowledge-base/` an der Marketplace-Wurzel wird **nie** mitkopiert → `/nc:setup` bleibt der Weg (bestätigt den Weg B des Bauplans 2026-08-10) |
| Satellit (`github`, Repo **ist** Plugin) | Repo-Wurzel | alles fährt mit, **auch** eine künftige `knowledge-base/` → Arbeitsmaterial im Paket, nie Laufzeit-Abhängigkeit (I3) |

**Wirkung auf die Invarianten:** keine Abschwächung. **I3 wird präziser** — nicht der Klon-Umfang
begründet die Plugin-Grenze, sondern die Verzeichnis-Kopie in den Cache; genau die Begründung,
die `plugin-bau.md` §2 Mechanik-Fakt 4 bereits trug. **I1 bleibt unberührt.** Auch die
NovaCore-Pins bleiben unberührt: Es kommt kein `git-subdir`-Source vor (Kern relativ, Satelliten
`github` — verifiziert in `.claude-plugin/marketplace.json`).

**Begründung:** Eine normative Regel mit falscher Mechanik-Begründung hält dem ersten Widerspruch
nicht stand und verleitet dazu, bei einem Wechsel des Source-Typs die falsche Konsequenz zu
ziehen. Der Onsite-Text wird an dieser Stelle bewusst **nicht** wörtlich übernommen — §0.1
verlangt Inhaltsgleichheit **in der Substanz**, und die Substanz ist die Auslieferungsgrenze,
nicht der Klon-Mechanismus. Der Befund gehört zusätzlich ins `debug-log.md` (AP3.2), weil er ein
Fremdbefund am Vorbild ist, kein eigener Fehler.

---

*Angelegt 2026-08-11 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer.
Quellstudium gegen `onsite-ai-devs/Onsite.ai-OS@5d335a7` und
`onsite-ai-devs/Onsite.ai-OS-Marketing@a9d8658`; Ausschluss- und Mapping-Regeln geerbt aus
`2026-08-10-onsite-align-umbau-bauplan.md`. Delegationsvertrag nach dem gelernten Muster
Plan-Sandwich (Belegfall Kimi-code-Plugin-CC, 2026-07-26).*
