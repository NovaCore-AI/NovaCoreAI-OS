# Aktualisierungs-Index — was bei welcher Änderung mitgeändert werden muss

> **Zweck:** Die Nachschlageliste gegen Vergessen. Wer im OS etwas ändert, findet hier je
> Änderungsart (a) welche Dokumente **vorher eingelesen** werden und (b) was **in derselben
> Änderung** nachgezogen wird — einschließlich Version, Release, Tag, Protokolle, Indizes,
> Tests und Validierung.
>
> **Abgrenzung zum [`SSOT-Document-Index`](../SSOT-Document-Index.md):** Der SSOT-Index
> beantwortet *„welches Dokument existiert, wohin gehört es, wann brauche ich es"*. Dieses
> Dokument beantwortet *„ich ändere X — was muss ich alles anfassen"*. Beide werden gebraucht:
> zuerst der SSOT-Index (Triage), dann dieser Index (Änderungsumfang).
>
> **Verhältnis zu `AGENTS.md`:** `AGENTS.md` ist der **normative Einstieg** und trägt die
> Kurzform (Standardzyklus, Sync-Matrix, Abschluss-Checkliste). Dieses Dokument ist die
> **Langfassung** derselben Disziplin. Bei Widerspruch gewinnt `AGENTS.md`; wer hier etwas
> ändert, das dort steht, zieht beides gemeinsam nach.
>
> **Benutzung:** Abschnitt 1 gilt immer. Danach in Abschnitt 2 die Zeile(n) zur eigenen
> Änderungsart suchen — mehrere Zeilen dürfen gleichzeitig zutreffen, dann gilt die Vereinigung.
> Abschnitte 3–5 gelten für jede Änderung, die das Team erreichen soll.
>
> **Pflege:** Dieses Dokument ist selbst normativ. Entsteht eine neue Änderungsart (neuer
> Hook-Typ, neues Manifestfeld, neuer Workflow), kommt sie hier als Zeile dazu — sonst
> beginnt die Drift von Neuem.
>
> **Sparsamkeits-Regel (Lehre aus dem Vorbild):** Beim Nachziehen **keine neuen
> Spiegelstellen** erfinden. Zahlen (Skills, Module, Tests) gehören an so wenige Orte wie
> möglich; wer eine Zahl an einen weiteren Ort schreibt, schafft die nächste Drift.

---

## 1. Immer zuerst — unabhängig von der Änderungsart

| # | Pflichtschritt | Quelle |
|---|---|---|
| 1 | **Log-Stand:** `git log --oneline -10` + `git status`, dazu `git worktree list` und in jedem fremden Baum `git status --short`. Der Working Tree ist die Wahrheit, nicht der letzte Commit und nicht die Doku | — |
| 2 | **Produktstand:** `CHANGELOG.md` (autoritativ für gebaut/fehlend) + `VERSION` | Repo-Wurzel |
| 3 | **Planungsstand:** jüngste datierte Datei in `grundwissen/` (Datumspräfix) — sie ist der aktuellste Planungsstand | `knowledge-base/grundwissen/` |
| 4 | **Triage:** [`SSOT-Document-Index`](../SSOT-Document-Index.md) — Teil 1 (wohin gehört ein Dokument), Teil 2 („Relevant wenn …") | `knowledge-base/SSOT-Document-Index.md` |
| 5 | **Standardprozess-Check:** existiert für die Arbeit schon ein Prozess in `standardprozesse/`? Falls ja: ihm folgen. Falls nein und die Tätigkeit ist wiederkehrend: hinterher dort dokumentieren | dieser Ordner, v. a. [`kern-plugin-bau.md`](kern-plugin-bau.md), [`abteilungs-plugin-bau.md`](abteilungs-plugin-bau.md), [`ssot-aufbau.md`](ssot-aufbau.md) und [`sync-nachzug-bauzyklus.md`](sync-nachzug-bauzyklus.md) |
| 6 | **Eigene Fehlermuster prüfen:** [`agent-learnings.md`](../debugging-findings/agent-learnings.md) — bekannte Fallen vor der Arbeit lesen | `debugging-findings/` |
| 7 | **Arbeitsplan ablegen** (bei mehr als einem Trivialschritt): eigenes Dokument in `grundwissen/` mit Datumspräfix — **keine** Ad-hoc-Ablage | `grundwissen/` |

Bei Widersprüchen zwischen Doku-Ebenen: **jüngste Design-Spec/Bauplan (`grundwissen/`) →
Standardprozesse → Produktvision**. Bei Widerspruch zwischen Doku und Platte gilt die Platte
(Glob / `git status`), danach wird die Doku korrigiert.

---

## 2. Änderungs-Matrix — „ich ändere X"

Spalten: **Vorher einlesen** = Pflichtlektüre, sonst wird falsch gebaut · **In derselben
Änderung nachziehen** = Dokumente/Dateien, die sonst driften · **Mechanik** = Version, Tests,
Sonderpflichten. Abschnitt 1 gilt zusätzlich immer, Abschnitte 3–5 ebenso.

### 2.1 Plugin-Inhalt (Skills, Module, Abteilungen, Hooks, Tests)

| Änderung | Vorher einlesen | In derselben Änderung nachziehen | Mechanik |
|---|---|---|---|
| **Skill neu** | `plugins/nc/referenz/skill-authoring.md` (Format, **YAML-Falle**) · `standardprozesse/kern-plugin-bau.md` §2.3 (Kern-Skill) bzw. `abteilungs-plugin-bau.md` §2 (Abteilungs-Skill) · `plugins/nc/wp-rahmen.md` (welches WP der Skill bedient) · `workflow.md` der Abteilung | Skill-Tabelle in `README.md` · Trigger-Matrix in `plugins/nc-development/workflow.md` (bei Abteilungs-Skills) · `plugins/nc/module-registry.json` (Modul-Segment **und** `status`-Text der Abteilung) · `AGENTS.md` Repo-Karte, falls die Skill-Liste dort namentlich steht · `CHANGELOG.md` | Bump des betroffenen Plugins · Suite · Validierung beider Ebenen · **Plugin-Grenze:** in ausgelieferten Dateien keine `../`-Verweise (testerzwungen; ein installiertes Plugin sieht keine Repo-Pfade) |
| **Skill inhaltlich geändert** (Ablauf, Trigger, `description`) | die SKILL.md selbst · `skill-authoring.md` · `wp-rahmen.md`, falls Gates berührt | `README.md`, falls die Kurzbeschreibung dort zitiert wird · `workflow.md`, falls sich die Trigger-Bedingung ändert · `CHANGELOG.md` | Bump (Fix vs. Neuerung nach Schema §3) · Suite · `validate <plugin> --strict` |
| **Skill umbenannt/entfernt** | `skill-authoring.md` · Registry | alle oben genannten **plus** `grep` nach dem alten Skill-Namen über das ganze Repo | Bump · Suite · Validierung · **Umbenennung ist teamsichtbar**: alter Slash-Befehl verschwindet → im CHANGELOG explizit als Breaking notieren |
| **Neues Modul** (Skill-Präfix-Gruppe) | `abteilungs-plugin-bau.md` · `workflow.md` | `plugins/nc/module-registry.json` · `AGENTS.md` Repo-Karte · `README.md` · `CHANGELOG.md` | Bump des Abteilungsplugins · Suite (Struktur-Invarianten prüfen Registry-Konsistenz) |
| **Neues Abteilungsplugin (im Repo)** | **`abteilungs-plugin-bau.md` §3 vollständig** · `vorlagen/abteilungsplugin/` | `.claude-plugin/marketplace.json` (Eintrag **ohne** `version`) · `plugins/nc/module-registry.json` · `AGENTS.md` Repo-Karte · `README.md` · `CHANGELOG.md` | Startversion `0.1.0` in dessen `plugin.json` · `dependencies: ["nc"]` setzen · **Install-Probe** · `validate .` **und** `validate plugins/<neu> --strict` |
| **Eigenständiges Kollegen-OS als Satellit / Satellit aktualisiert** | **`abteilungs-plugin-bau.md` §3b** (pilotierter Ablauf inkl. der vier Install-Fallen) | Marketplace-Eintrag **per `ref` + Full-SHA umpinnen** · `plugins/nc/module-registry.json`: `repository` **und** `repoSkillsPath` (relativ zur Satelliten-Wurzel) · `AGENTS.md` (Produktstand + Karte) · `README.md` · `ONBOARDING.md` (Installationsweg) · `CHANGELOG.md` | Release/Version zählt **im Satelliten-Repo**; hier nur der Pin. Ohne SHA-Umpinnen erreicht die Änderung das Team nicht · **Install-Probe** in isoliertem `CLAUDE_CONFIG_DIR`; bei SSH-Fehlern `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` |
| **Hook neu/geändert** | [`NovaCore-OS-Gates-Definition.md`](../grundwissen/NovaCore-OS-Gates-Definition.md) (Ist-Stand aller Gates) · jüngster Bauplan in `grundwissen/` · bestehender Hook-Code + `plugins/nc/hooks/lib/` | `plugins/nc/hooks/hooks.json` — Matcher **und** das `description`-Feld, das den Prosa-Zustand der GESAMTEN Kontroll-Schicht trägt · Gates-Definition (Statusspalte) · `README.md` (Kontroll-Hook-Tabelle inkl. **Opt-out-Envs**) · `AGENTS.md` (Repo-Karte Hooks-Zeile + Produktstand) · `CHANGELOG.md` **mit den sicherheitsrelevanten Design-Entscheidungen** | **Prüfungs-Eigentum:** jede Prüfung hat genau ein Heimat-Plugin — keine Kern-Prüfung duplizieren oder abschwächen, Matcher frei · Kern-Hook → Kern-Bump + `VERSION` + Registry · Tests für den Hook zwingend, **Negativprobe belegen** · Opt-out-Env an **drei** Orten dokumentieren (Hook-Kopf, `hooks.json`, `README.md`) |
| **Test neu/geändert** | `plugins/nc/tests/*.test.mjs` (bestehende Invarianten nicht doppeln) | `CHANGELOG.md`. **Testzahlen** stehen bewusst nur im CHANGELOG-Eintrag der jeweiligen Version — sie werden **nicht** über README/AGENTS gespiegelt | `node --test plugins/nc/tests/*.test.mjs` — **wortgleich**, Verzeichnis-Argument schlägt fehl · Kern-Bump nur bei Verhaltensänderung des Plugins |
| **Skill-Formatregeln geändert** (`plugins/nc/referenz/skill-authoring.md`) | die Datei selbst · `kern-plugin-bau.md` §2.3 | **alle** vorhandenen `SKILL.md` gegen die neue Regel prüfen (sie wird mit dem Kern ausgeliefert und gilt sofort teamweit) · Verweise in `AGENTS.md` · `CHANGELOG.md` | **Kern-Bump** (+ `VERSION` + Registry) · Achtung: die Datei ist die **einzige Ausnahme** der Plugin-Grenzen-Invariante in `struktur.test.mjs`, und die CI-Positivkontrolle setzt die Frontmatter-Form `description: >-` voraus |
| **Vorlage geändert** (`vorlagen/abteilungsplugin/`) | `abteilungs-plugin-bau.md` §3 · die Vorlagendateien selbst | Repo-Karte in `AGENTS.md` **und** `README.md` · `CHANGELOG.md` | Zwei Invarianten: „Vorlage ist kein Plugin" (kein echtes `plugin.json`, Platzhalter müssen stehenbleiben) und „keine offenen Platzhalter in ausgelieferten Plugins" |
| **Vorlage `ssot-grundgeruest` geändert** (`vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage`) | `ssot-aufbau.md` §4 + §4a · `abteilungs-plugin-bau.md` §3b.1 · die Vorlagendatei selbst | `vorlagen/abteilungsplugin/VORLAGE.md` (Inhaltsliste, Variablen, Kopierzeile) · `CHANGELOG.md` | Platzhalter `{{ABTEILUNG}}` muss stehenbleiben (Invariante „Vorlage ist kein Plugin") · **Kein** Rück-Nachzug in bereits gebaute Satelliten — sie sind eigenständige Repos; dort entsteht ein **eigener** Vorgang · kein Bump (die Vorlage wird nicht ausgeliefert) |
| **Satelliten-Hook/Gate geändert** (Kontroll-Schicht eines eigenständigen OS) | `kern-plugin-bau.md` §1a (Prüfungs-Eigentum) · die **Kern-Fassung** des Hooks als Quelle (`git show`), nie rekonstruiert · [`NovaCore-OS-Gates-Definition.md`](../grundwissen/NovaCore-OS-Gates-Definition.md) | im **Satelliten**: dessen `hooks.json`-`description`, README-Hook-Tabelle, `AGENTS.md`, Tests, `CHANGELOG.md` · **danach hier**: Marketplace-Pin, Registry-Statuszeile, Gates-Definition (Satelliten-Abschnitt), `AGENTS.md` | Der Satellit trägt eine **eigene Kopie**, nie eine abgeschwächte: `process.exitCode = 0` statt `process.exit()` (Truncation-Falle), Opt-out-Env an **drei** Orten, **Negativprobe belegt**. Bump zählt im Satelliten-Repo; hier nur der Pin |
| **Abteilungs-/Plugin-CLAUDE geändert** (Anweisungsdatei **im** Plugin: `plugins/nc/nc-sync.md`, `<name>-sync.md` im Satelliten) | [`NovaCore-OS-CLAUDE-Ebenen-Definition.md`](../grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md) · die Datei selbst | die Datei · `README.md` des betroffenen Plugins · `AGENTS.md`, falls die Ebene dort beschrieben ist · `CHANGELOG.md` | Sie wird **ausgeliefert** → Bump des betroffenen Plugins, sonst erreicht die Änderung niemanden · Plugin-Grenze: keine Repo-Pfade, keine `../`-Verweise (testerzwungen) · nicht mit dem Ebene-1-Firmenblock verwechseln (eigene Zeile in 2.2) |
| **Fremdsystem, Konnektor oder MCP-Server dokumentiert** | `SSOT-Document-Index` Teil 1 · die Zeile „Neue Kategorie/Ordner" in 2.2 · bei einem **lokalen** Plugin zusätzlich die MCP-Zeile unten | Fremdsystemwissen entsteht als **eigene Kategorie**, sobald es den ersten realen Inhalt gibt — nicht auf Vorrat (Mapping-Entscheid 2026-08-11) · Routing-Zeile Teil 1 **und** Triage-Tabelle Teil 2 · `AGENTS.md` Glossar · `CHANGELOG.md` | **Nie Zugangsdaten in die Wissensbasis** — Env oder Secret-Store; in der Doku steht ausschließlich der Variablenname · Host-Anforderungen (CLI, Runtime) gehören in `ONBOARDING.md`, nicht in einen Skill-Text |
| **Plugin/Abteilung entfernt oder stillgelegt** | `abteilungs-plugin-bau.md` | `.claude-plugin/marketplace.json` **und** `plugins/nc/module-registry.json` **gleichzeitig** · Repo-Karte (`AGENTS.md`, `README.md`) · `CHANGELOG.md` (teamsichtbar: Namespace verschwindet) | Zwei Invarianten schlagen sonst an: Marketplace↔`plugins/` und Registry↔`plugins/` |
| **Ein lokales Plugin bekommt einen MCP-Server** (`mcpServers` / `.mcp.json`) | `kern-plugin-bau.md` §1 (Basis-Gate) | `plugins/nc/hooks/hooks.json`: der FFG-Matcher muss `mcp__*` mit abdecken — sonst schreibt ein Werkzeug **am Gate vorbei** · `README.md` · `CHANGELOG.md` | Testerzwungen: die Invariante wird scharf, sobald ein **lokales** Manifest MCP-Server führt (externe/affiliate-Plugins lösen sie nicht aus — dokumentierte Grenze) |
| **WP-Rahmen / `workflow.md` geändert** | `plugins/nc/wp-rahmen.md` (normativ, gilt für **alle** Abteilungen) | jede betroffene SKILL.md (Gate-Bezüge) · `workflow.md` der Abteilungen · `AGENTS.md` Vision-Abschnitt 3 · `CHANGELOG.md` | Kern-Bump (Rahmen liegt im Kern) · Abteilungsplugins prüfen, ob ihr Fachablauf noch passt |

### 2.2 Wissensbasis und Doku

| Änderung | Vorher einlesen | In derselben Änderung nachziehen | Mechanik |
|---|---|---|---|
| **Wissensdatei neu** | `SSOT-Document-Index` **Teil 1** (Zielordner samt „gehört nicht hierher") | **Zeile in `SSOT-Document-Index` Teil 2** in der Tabelle der Zielkategorie: Link, Status (`lebend`/`historisch`), „Relevant wenn …" · `AGENTS.md` Glossar, falls eine neue **Kategorie** entsteht · `CHANGELOG.md` | `struktur.test.mjs` erzwingt Vollständigkeit **und** Linkgültigkeit → ohne Eintrag ist die Suite rot. Kein Plugin-Bump nötig (Wissensbasis wird nicht ausgeliefert), CHANGELOG trotzdem |
| **Wissensdatei verschoben/umbenannt/gelöscht** | `SSOT-Document-Index` Teil 1 | `SSOT-Document-Index` **Teil 1 und Teil 2** · `AGENTS.md` (Repo-Karte + Glossar + Sync-Matrix + Pflicht-Einstieg) · `README.md` · **`grep` nach dem alten Pfad über das ganze Repo** | `git mv` statt löschen+neu (Historie) · Historische Dokumente (CHANGELOG-Alteinträge, `docs/superpowers/specs/`, append-only-Protokolle) werden **nicht** rückwirkend umgeschrieben |
| **Neue Kategorie/Ordner in der Wissensbasis** | `SSOT-Document-Index` Teil 1 · `AGENTS.md` Glossar | `SSOT-Document-Index` Teil 1 (Routing-Zeile: gehört hinein / nicht hinein / Lebenszyklus) **und** eigene Tabelle in Teil 2 · `AGENTS.md` Glossar + Repo-Karte · `CHANGELOG.md` | Invariante: **nur der Index selbst** liegt direkt in `knowledge-base/` — alles andere in eine Kategorie |
| **Satelliten-Wissensbasis neu angelegt** | `ssot-aufbau.md` §4 **und §4a (Isolation)** · `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` · `abteilungs-plugin-bau.md` §3b.1 | im **Satelliten**: alle fünf Bausteine, eigener `SSOT-Document-Index.md` als einzige Wurzeldatei, beide Protokollköpfe, `test/wissensbasis.test.mjs`, `AGENTS.md` (Pflicht-Einstieg + Abschluss-Checkliste + Protokollzwang), `CHANGELOG.md` · **hier** erst beim nächsten Pin-Nachzug: Registry-Statuszeile, `AGENTS.md`, `README.md` | **Isolation ist testerzwungen:** keine Warteschlangen-Mechanik unter `knowledge-base/`, kein Maschinenpfad ins OS-Repo in ausgelieferten Dateien, das OS-Repo nur als **Quellenangabe**. Reine Wissensbasis-Arbeit braucht **keinen** Bump — CHANGELOG-Eintrag trotzdem |
| **Satelliten-SSOT geändert** (Inhalt einer Satelliten-Wissensbasis) | der `SSOT-Document-Index` **des Satelliten**, Teil 1 | **ausschließlich** Dokumente im Satelliten: dessen Index Teil 1 und Teil 2, dessen Protokolle, dessen `CHANGELOG.md` | **Kein Nachzug im OS-Repo.** Die Satelliten-SSOT ist terminal (`ssot-aufbau.md` §4a): kein Weg zurück in Kerndokumente, keine Weitergabe, kein Cross-Satelliten-Zugriff. Wer hier eine Kern-Datei anfasst, verletzt die Isolation |
| **Bauplan abgeschlossen oder verworfen** | der Plan selbst (Statuszeile) · `SSOT-Document-Index` Teil 1 | `git mv` von `grundwissen/` nach `bauplan-archiv/`, **Inhalt unverändert** · Index **Teil 2**: Zeile wandert in die Archiv-Tabelle, Status `historisch`, Verschiebedatum nennen · `grep` nach dem alten Pfad über das **ganze** Repo · `CHANGELOG.md` | **Pflicht, nicht Ermessen** (Entscheid E1, 2026-08-11): Ohne Verschiebung verliert `grundwissen/` die Aussage „das läuft gerade" · Archiv ist **terminal** und wird nie rückwirkend umgeschrieben |
| **Idee ohne Auftrag festhalten** | `SSOT-Document-Index` Teil 1 (`ideen-backlog/`) | ein Dokument **je Idee** in `ideen-backlog/` mit Datumspräfix · Zeile in Teil 2 · `PLATZHALTER.md` entfernen, sobald die erste echte Idee liegt · `CHANGELOG.md` | Kein Bump. Eine Idee ist **kein** Bauplan: keine Arbeitspakete, keine Abnahmekriterien, keine Testfälle — sobald sie die hat, gehört sie nach `grundwissen/` |
| **Idee wird beauftragt** | die Idee selbst · `SSOT-Document-Index` Teil 1 | **neuer Bauplan** in `grundwissen/` mit Datumspräfix, der auf die Idee **verweist** · Index Teil 2: neue Zeile für den Plan — die Zeile der Idee **bleibt** · `CHANGELOG.md` | Die Idee wird **nicht** verschoben und **nicht** gelöscht: Sie ist die Herkunft, der Plan ist die Arbeit. Zwei Dokumente, zwei Lebenszyklen |
| **Protokolleintrag fällig** | `agent-learnings.md` (eigene Fehlermuster) bzw. `debug-log.md` (bekannte Symptome) — **vor** der Fehlersuche, nicht danach | **eigener** Fehler → [`debugging-findings/agent-learnings.md`](../debugging-findings/agent-learnings.md) · **gefundener** Bug oder Fehlbefund, auch an fremdem Material → [`debugging-findings/debug-log.md`](../debugging-findings/debug-log.md) | **Sofort, nicht sammeln.** Append-only: nie rückdatieren, nie umschreiben — ein widerlegter Eintrag bekommt einen **neuen**, der auf ihn verweist · kein Bump, kein Index-Nachzug (beide Dateien stehen bereits im Index) |
| **Design-Entscheidung geändert** | jüngste Spec/Bauplan in `grundwissen/` inkl. aller Nachträge | **zuerst Nachtrag** in `grundwissen/` (Spec wird nie in-place umgeschrieben) · danach die inhaltlich betroffenen Stellen in `AGENTS.md`, `README.md`, betroffene Skills · `CHANGELOG.md` | Der Nachtrag ist Voraussetzung, nicht Nachbereitung — weicht ein Build bewusst von der Spec ab, wird die Spec nachgezogen, nie stillschweigend |
| **Konvention/Prozess geändert** (z. B. Commit-Format, Prüfzyklus) | `AGENTS.md` (Konventionen, Standardzyklus) | `AGENTS.md` · **dieser Aktualisierungs-Index** · ggf. Standardprozess in `standardprozesse/` · `CHANGELOG.md` | Prozessänderungen, die Agenten binden, müssen in `AGENTS.md` landen — sonst wirken sie nicht |
| **Pflicht-Einstieg oder rote Linien geändert** | `AGENTS.md` (Pflicht-Einstieg, rote Linien) · Gates-Definition (Gate 2) | **der Text ist mehrfach gespiegelt und wird ausgeliefert:** `plugins/nc/hooks/nc-session-start.js` (injizierter Briefing-Text), `plugins/nc/skills/start/SKILL.md`, `plugins/nc/doks/global-claude-firmenblock.md` (Ebene-1-Payload), `AGENTS.md` · `CHANGELOG.md` | **Kern-Bump** — wer nur `AGENTS.md` ändert, lässt der Hook dem ganzen Team weiter die alte Pflicht injizieren |
| **Abschluss-Checkliste / Prüfzyklus geändert** | `AGENTS.md` (Abschluss-Checkliste) · Abschnitt 5 dieses Dokuments | `plugins/nc/skills/doku-sync/SKILL.md` (Ablauf **und** Verifikation — der Skill führt die Checkliste aus) · `.github/workflows/ci.yml`, falls die CI denselben Schritt fährt · `CHANGELOG.md` | **Kern-Bump** (der Skill liegt im Kern). Eine Checklistenzeile ohne Gegenstück im Skill ist wirkungslos |
| **Team-globale CLAUDE-Anteile geändert** (Ebene-1-Payload im Kern-Plugin) | [`NovaCore-OS-CLAUDE-Ebenen-Definition.md`](../grundwissen/NovaCore-OS-CLAUDE-Ebenen-Definition.md) | `plugins/nc/doks/global-claude-firmenblock.md` · Ebenen-Definition, falls Regeln berührt · `CHANGELOG.md` | Payload liegt im Kern-Plugin-Paket → **Kern-Bump** (sonst erreicht der Autosync niemanden) · Marker-Konvention einhalten, **Privat-Zone nie anfassen** · Test `nc-doks-autosync.test.mjs` läuft ausschließlich gegen `NC_AUTOSYNC_TARGET` |

### 2.3 Mechanik-Ebene (Manifeste, CI, Versionen)

| Änderung | Vorher einlesen | In derselben Änderung nachziehen | Mechanik |
|---|---|---|---|
| **Marketplace-Manifest** (`.claude-plugin/marketplace.json`) | `abteilungs-plugin-bau.md` §2 (harte Mechanik-Fakten) | Beschreibungstexte müssen zum Ist-Stand passen — **das Team liest sie im Installationsdialog** · `README.md` · `CHANGELOG.md` | **Nie** ein `version`-Feld setzen: Claude Code löst aus `plugin.json` auf und ignoriert den Marketplace-Wert **ohne Warnung** · Externe Quellen (`affiliate`, Satelliten) **immer per `ref` + Full-SHA pinnen** (testerzwungen) · `claude plugin validate .` |
| **Plugin-Manifest** (`plugins/<name>/.claude-plugin/plugin.json`) | `abteilungs-plugin-bau.md` §2 Fakt 6 | bei Kern zusätzlich `VERSION` + `plugins/nc/module-registry.json` · `README.md` (Plugin-Tabelle) · `AGENTS.md` (Produktstand) · `CHANGELOG.md` | **Einzige** Stelle für die Version · Struktur-Test erzwingt den Gleichstand Kern↔`VERSION`↔Registry |
| **CI-Workflow** (`.github/workflows/ci.yml`) | bestehender Workflow · Abschnitt 5 dieses Dokuments (Prüfzyklus muss identisch bleiben) | `README.md` (CI-Absatz) · `AGENTS.md` (Repo-Karte) · `CHANGELOG.md` | Actions **per Full-SHA** pinnen · lokaler Prüfzyklus und CI müssen dieselben Schritte fahren, sonst ist grün lokal wertlos · die **Positivkontrolle** (absichtlich defekter Wegwerf-Skill **muss** rot werden, intakte Kontrollgruppe bleibt grün) nie entfernen |
| **Release-Workflow** (`.github/workflows/release.yml`) | die Datei selbst · Abschnitt 3 dieses Dokuments | Abschnitt 3 dieses Dokuments · `README.md` (Release-Absatz) · `CHANGELOG.md` | Vier Vorbedingungen, die absichtlich hart scheitern: **annotierter** Tag, Tag == Version im Manifest, grüne Suite, vorhandener CHANGELOG-Abschnitt |
| **Mindestversion Claude Code / Node** | `kern-plugin-bau.md` §3 (verifizierte Schwellen — **einzige** Stelle) | `README.md` · `ONBOARDING.md` · `AGENTS.md` (Produktstand) · CI: **beides** — die `node-version`-Matrix **und** der gepinnte `@anthropic-ai/claude-code`-Stand des Validierungsjobs · `CHANGELOG.md` | Teamweite Wirkung → im CHANGELOG als Anforderung benennen, nicht nur als Nebensatz |

---

## 3. Version, Release und Tag — der vollständige Weg ans Team

**Grundregel:** Kein Bump = kein Auto-Update. Eine Änderung, die das Team erreichen soll,
zählt die Version des **betroffenen** Plugins hoch.

1. **Bump-Schema:** inhaltliche Neuerung → Minor (`0.5.0` → `0.6.0`) · Fix → Patch
   (`0.5.0` → `0.5.1`) · Strukturbruch → Major.
2. **Ort:** **ausschließlich** `plugins/<name>/.claude-plugin/plugin.json`. Beim **Kern**
   zusätzlich `VERSION` und `plugins/nc/module-registry.json` spiegeln (Leitversion,
   testerzwungen). Im Marketplace-Eintrag steht **nie** eine Version.
3. **Parallele Arbeitsstränge:** Ist eine Version noch **unveröffentlicht**, dürfen mehrere
   Änderungen sie gemeinsam nutzen — dann kein zweiter Bump. Ist sie getaggt, ist die nächste
   Nummer Pflicht.
4. **Abteilungsplugins zählen eigenständig** — ein Gleichstand über alle Plugins ist
   ausdrücklich **nicht** gefordert.
5. **CHANGELOG:** Eintrag unter `[Unreleased]` nach Keep-a-Changelog, **mit Namenszeichnung
   des Agenten** — Pflicht für **jede** integrierte Änderung, auch kleine.
6. **Release (Leitversion = Kern):**
   1. `[Unreleased]` zu `## [X.Y.Z] — YYYY-MM-DD` schneiden, **frische leere
      `[Unreleased]`-Überschrift** stehen lassen.
   2. Versionsgleichstand prüfen: `VERSION` = Kern-`plugin.json` = `module-registry.json`.
   3. Erst **nach dem Merge auf `main`** annotiert taggen und pushen. Tag-Schema:
      `{plugin-name}--v{version}` (z. B. `nc--v0.6.0`), gesetzt über `claude plugin tag`.
      **Tag und Release nie vom Versions-Commit trennen** — genau daran hing das 0.2.0-Release
      (Tag und GitHub-Release liefen den Versionsdateien hinterher).
   4. `release.yml` erledigt den Rest: Tag-Typ-Prüfung, Tag↔Manifest-Abgleich, Suite,
      Release-Notes aus dem CHANGELOG-Abschnitt, GitHub-Release. Fehlt der Abschnitt zur
      Version, scheitert das Release absichtlich → Schritt 6.1 war nicht erledigt.
7. **Satelliten-Releases** laufen im jeweiligen Satelliten-Repo (`abteilungs-plugin-bau.md`
   §3b); hier
   wird nur der Marketplace-Pin per `ref` + Full-SHA nachgezogen.

---

## 4. Protokolle und Indizes — wer wird wann fortgeschrieben

| Dokument | Art | Auslöser | Regel |
|---|---|---|---|
| [`CHANGELOG.md`](../../CHANGELOG.md) | Historie | **jede** integrierte Änderung | Eintrag unter `[Unreleased]`, Keep-a-Changelog-Muster, **Namenszeichnung**. Alteinträge sind historisch und werden nie umgeschrieben |
| [`agent-learnings.md`](../debugging-findings/agent-learnings.md) | Fehlerprotokoll, append-only | **jeder einzelne eigene Fehler**: falsche Annahme, falscher Pfad, fehlgeschlagener Befehl durch eigenes Verschulden, falsch umgesetztes Format | Sofort, ohne Ausnahme, Format wie in der Datei. Nicht sammeln, nicht beschönigen, nicht rückdatieren |
| [`debug-log.md`](../debugging-findings/debug-log.md) | Debug-Log, append-only | **jeder gefundene Bug oder Fehlbefund** — an eigenem Code, an Konfiguration, an der Doku oder an einem **Vorbild**, unabhängig davon, wer ihn verursacht hat | Sofort, Format wie in der Datei (Datum · Symptom · Ursache · Fix · Beleg). Vor jeder neuen Fehlersuche zuerst hier die Symptome abgleichen. Gegenstück zu `agent-learnings.md`: dort **eigene** Fehler, hier **gefundene** |
| [`SSOT-Document-Index`](../SSOT-Document-Index.md) | Master-Index | jede neue, verschobene, umbenannte oder gelöschte Wissensdatei; jede neue Kategorie | In **derselben** Änderung. Testerzwungen (Vollständigkeit + Linkgültigkeit) |
| [`NovaCore-OS-Gates-Definition.md`](../grundwissen/NovaCore-OS-Gates-Definition.md) | Ist-Inventur der Kontroll-Schicht | jede Änderung an einem Gate (Umfang, Status, Opt-out) | Statusspalte und Opt-out-Spalte mitziehen — eine Gate-Tabelle, die lügt, ist schlimmer als keine |
| jüngste Spec/Bauplan in `grundwissen/` | normativ | Design-Entscheidung geändert | **Nur per Nachtrag**, nie in-place. Jüngster Nachtrag gewinnt |
| `AGENTS.md` / `README.md` / `ONBOARDING.md` | abgeleitet, lebend | Struktur, Pfade, Skills, Module, Versionen, Prozesse, Setup-Ablauf | Gleicher Change, gleiche Pflege — nicht „später". Sync-Matrix in `AGENTS.md` |

---

## 5. Prüf- und Abschlusszyklus (vor **jedem** Commit-Vorschlag)

Ausführender Skill: `/nc:doku-sync` (`plugins/nc/skills/doku-sync/SKILL.md`) — er setzt bei
Erfolg den Stempel `.git/nc/doku-sync.stamp`. Der Zyklus ist auch ohne den Skill
abzuarbeiten:

- [ ] **Doku-Vollständigkeit** nach Abschnitt 2 + Sync-Matrix in `AGENTS.md`
- [ ] **Toter-Pfad-Sweep:** `grep` nach jedem alten Pfad/Namen über das **ganze** Repo
- [ ] **`CHANGELOG.md`**-Eintrag unter `[Unreleased]` mit Namenszeichnung
- [ ] **Version-Bump** des betroffenen Plugins am einzig richtigen Ort (Kern: + `VERSION` + Registry)
- [ ] **Validierung beider Ebenen:** `claude plugin validate .` **und**
      `claude plugin validate plugins/<name> --strict` je berührtem Plugin — die
      Wurzel-Variante allein prüft **keine** Skills. Ein stilles „Validation passed" ist das
      Erfolgssignal (`Validating skill:`-Zeilen erscheinen nur bei Befund)
- [ ] **Tests:** `node --test plugins/nc/tests/*.test.mjs` — wortgleich, Glob statt Verzeichnis
- [ ] **Protokolle** dieser Sitzung geschrieben (Abschnitt 4): eigene Fehler in
      `agent-learnings.md`, gefundene Bugs in `debug-log.md`
- [ ] **Wissensdateien am richtigen Ort**, `SSOT-Document-Index` nachgezogen

**Rote Linien — nie ohne ausdrückliche Freigabe des Maintainers, nie automatisiert:**
Commit · Push · PR-Erstellung · Merge · Force-Push · Tag-Push/Release · destruktive
Git-Operationen · alles Kundensichtbare (PR-Texte posten, Ticket-Kommentare posten) ·
Review-Resolves/Approvals · Deploy-Klicks. Keine Secrets/Tokens in Dateien, Logs oder Commits.

---

## 6. Selbsttest — „habe ich etwas vergessen?"

Sieben Fragen, die die typischen Auslassungen abdecken:

1. **Zahlen:** Habe ich irgendwo eine Zahl geändert (Skills, Module, Version)? Dann steht sie
   an den **wenigen** dafür vorgesehenen Orten korrekt — und ich habe **keinen neuen**
   Spiegelort geschaffen.
2. **Pfade:** Habe ich etwas verschoben oder umbenannt? Dann läuft ein `grep` nach dem alten
   Namen über das ganze Repo — inklusive Skills und Hooks.
3. **Index:** Ist eine Datei unter `knowledge-base/` entstanden, gewandert oder verschwunden?
   Dann ist der `SSOT-Document-Index` in **derselben** Änderung dran (sonst rote Suite).
4. **Teamwirkung:** Soll die Änderung beim Team ankommen? Dann Bump am richtigen Ort **und**
   CHANGELOG — sonst passiert nichts.
5. **Protokolle:** Habe ich in dieser Sitzung einen eigenen Fehler gemacht (→
   `agent-learnings.md`) oder einen Bug gefunden, auch an fremdem Material (→ `debug-log.md`)?
   Pflichteintrag, nicht Ermessen.
6. **Gates:** Berührt die Änderung einen Hook, ein Gate oder einen Opt-out? Dann sind
   Gates-Definition, `hooks.json`-`description` und `README.md` mitzuziehen.
7. **Wahrheit:** Behaupte ich etwas („Suite grün", „Validierung bestanden"), ohne die Ausgabe
   gesehen zu haben? Dann erst ausführen, dann behaupten.

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus (AP4),
auf Weisung Lucas Vöhringer. Struktur-Vorlage: Onsite-`Aktualisierungs-Index.md`; auf die real
vorhandenen NovaCore-Artefakte reduziert (kein Betriebshandbuch, keine Roadmap, kein
CONTRIBUTING/SECURITY — Zeilen weggelassen statt tote Verweise gebaut).*
