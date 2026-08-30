# Aktualisierungs-Index — was bei welcher Änderung mitgeändert werden muss

> **Zweck:** Die Nachschlageliste gegen Vergessen. Wer im OS etwas ändert, findet hier je
> Änderungsart (a) welche Dokumente **vorher eingelesen** werden und (b) was **in derselben
> Änderung** nachgezogen wird — einschließlich Version, Release, Tag, Protokolle, Indizes,
> Tests und Validierung.
> **Abgrenzung zum [`SSOT-Document-Index`](<../SSOT-Document-Index.md>):** Der SSOT-Index
> beantwortet *„welches Dokument existiert, wohin gehört es, wann brauche ich es"*. Dieses
> Dokument beantwortet *„ich ändere X — was muss ich alles anfassen"*. Beide werden gebraucht:
> zuerst der SSOT-Index (Triage), dann dieser Index (Änderungsumfang).
> **Benutzung:** Abschnitt 1 gilt immer. Danach in Abschnitt 2 die Zeile(n) zur eigenen
> Änderungsart suchen — mehrere Zeilen dürfen gleichzeitig zutreffen, dann gilt die Vereinigung.
> Abschnitte 3–5 gelten für jede Änderung, die das Team erreichen soll.
> **Pflege:** Dieses Dokument ist selbst normativ. Entsteht eine neue Änderungsart (neuer
> Hook-Typ, neues Manifestfeld, neuer Workflow), kommt sie hier als Zeile dazu — sonst
> beginnt die Drift von Neuem.
> **Zweite Rolle — Datengrundlage von `/oai:update-doks`:** Der Maintainer-Skill der
> Systemachse 3 liest die Änderungs-Matrix **zur Laufzeit im Kern-Repo-Klon** und bezieht sein
> **Soll** allein von hier; er trägt bewusst keine Kopie (Spec §15.47,
> [Systemachsen-Definition](<../project-meta-infos/Onsite.ai-OS-Systemachsen.md>) Achse 3).
> Daraus folgt für die Pflege oben eine schärfere Konsequenz: Wer eine neue Änderungsart
> einführt und die Matrix nicht ergänzt, macht sie nicht nur für Lesende unsichtbar, sondern
> auch für den maschinellen Konsistenzlauf.
> **Dritte Rolle — das eine Maintenance-Dokument:** Seit 2026-08-21 trägt dieser Index auch
> die Zwei-Klassen-Buchführung (§0) und das Release-Zug-Runbook (§3.6) — überführt aus dem
> aufgelösten Zwischendokument `metaflow.md` (Maintainer-Entscheid 2026-08-21: das Dokument
> war als Platzhalter für den *fertigen*, erprobten Gesamtfluss gedacht; ein Thema, ein
> Dokument — Leitplanke 4). Messprotokoll des damaligen Übergangs:
> [`Bauplan-archiv/2026-08-21-metaflow-uebergangsregister-messprotokoll.md`](<../Bauplan-archiv/2026-08-21-metaflow-uebergangsregister-messprotokoll.md>).

---

## 0. Zwei-Klassen-Buchführung — die erste Frage vor jeder Änderung

*(Maintainer-Entscheide E1–E8 vom 2026-08-15; Herleitung im archivierten Bauplan
`Bauplan-archiv/2026-08-14-metaflow-parallelitaet-buchfuehrung-release.md`.)*

**Grundsätze:** Stränge liefern Substanz — die Bücher führt der Release-Zug (§3.6).
Versioniert wird nur das Produkt; Wissen trägt ein Datum und einen Status. Eine Version ist
ein Waypoint: der Maintainer setzt sie am Release-Zug, sie fasst die Features des Batches
zusammen.

| | **Produktklasse** | **Wissensklasse** |
|---|---|---|
| Pfade | `plugins/**` · `.claude-plugin/**` · `.github/workflows/**` | `knowledge base/**` · SSOT-Kategorien der Satelliten |
| Version | ja — aber **nur am Release-Zug** (§3.6), nie im Strang | **nie** |
| CHANGELOG | ja — geschrieben **vom Zug** aus den PR-Memos | **nie** |
| Aktualität | Versionsstand (`VERSION`, Tags) | **Datumsstempel** („jüngster Nachtrag gewinnt") + Status `lebend`/`historisch` |
| Auffindbarkeit | Repo-Karten, Betriebshandbuch | **SSOT-Index-Zeile** (testerzwungen, unverändert Pflicht) |

- **Mischfall** (ein PR ändert beides): CHANGELOG-relevant ist nur der Produktanteil — im
  PR-Ergebnismemo kennzeichnen.
- **Repo-Doku** (`CLAUDE.md`, `README.md`, `AGENTS.md`, `CONTRIBUTING.md`): weder Version noch
  CHANGELOG — gepflegt gemäß dieser Änderungs-Matrix.
- **Was in keiner Klasse wegfällt:** Fehlerprotokoll (sofort, append-only) · Register-Pflege ·
  SSOT-Index-Zeile je neuer Wissensdatei · Spec-Nachtrag bei Design-Entscheidungen (im
  2-Wochen-Batch, Zeile „Design-Entscheidung geändert").
- **Kurzregeln für Agenten:** „Muss mein PR ins CHANGELOG?" — nur Produktklasse, und auch dann
  schreibst du nichts: Das macht der Zug aus deinem PR-Memo. Schreib das Memo gut. · „Welche
  Version bumpe ich?" — keine, niemals im Strang. · „Ist ein Dokument aktuell?" —
  Datumsstempel + Status im SSOT-Index, nie über Versionsnummern schließen. · „Wann wird
  released?" — wenn der Maintainer es sagt; die CI erinnert (Detektor, §3.6).

---

## 1. Immer zuerst — unabhängig von der Änderungsart

| # | Pflichtschritt | Quelle |
|---|---|---|
| 1 | **Log-Stand:** `git log --oneline -10` + `git status`. Der Working Tree ist die Wahrheit, nicht der letzte Commit und nicht die Doku (mehrere Sitzungen/Worktrees sind real) | — |
| 2 | **Produktstand:** `CHANGELOG.md` (autoritativ für gebaut/fehlend) + `VERSION` | Repo-Wurzel |
| 3 | **Planungsstand:** laufende Vorhaben in `Aktive Baupläne/`, verbindliche Grundlage ist die Design-Spec (jüngster Nachtrag gewinnt) | `knowledge base/` |
| 4 | **Triage:** [`SSOT-Document-Index`](<../SSOT-Document-Index.md>) — Teil 1 (wohin gehört ein Dokument), Teil 2 („Relevant wenn …") | `knowledge base/SSOT-Document-Index.md` |
| 5 | **Standardprozess-Check:** existiert für die Arbeit schon ein Prozess in `plugin-maintanance-ruleset-source/`? Falls ja: ihm folgen. Falls nein und die Tätigkeit ist wiederkehrend: hinterher dort dokumentieren | dieser Ordner, v. a. [`abteilungs-plugin-bau.md`](<abteilungs-plugin-bau.md>) und [`kern-plugin-bau.md`](<kern-plugin-bau.md>) |
| 6 | **Eigene Fehlermuster prüfen:** [`agent-learnings.md`](<../Debugging + findings/agent-learnings.md>) — bekannte Fallen vor der Arbeit lesen | `Debugging + findings/` |
| 7 | **Arbeitsplan ablegen** — **nur bei mehrtägigen oder mehrsträngigen Vorhaben** (Bagatellgrenze, Maintainer 2026-08-21): eigenes Dokument in `Aktive Baupläne/` mit Datumspräfix. Kleinere Aufgaben brauchen **keinen** Bauplan; ihr Wissensträger ist das PR-Ergebnismemo. Baupläne erhalten genau **ein** konsolidiertes Update am Tages-/Aufgabenende (Leitplanke 9) — **keine** Ad-hoc-Ablage außerhalb der Norm-Ordner | `Aktive Baupläne/` |
| 8 | **Fremde Worktrees prüfen** vor dem ersten Schreiben: `git worktree list`, in jedem Baum `git status`. Ein Struktur-Umbau, der einen parallelen Arbeitsstand übersieht, erzeugt Konflikte, die niemand mehr auflösen kann | bekannter Fehler in [`abteilungs-plugin-bau.md`](<abteilungs-plugin-bau.md>) §4 |

Bei Widersprüchen zwischen Doku-Ebenen: **Design-Spec (jüngster Nachtrag) → Feature-Manuals →
Produktarchitektur**. Bei Widerspruch zwischen Doku und Platte gilt die Platte (Glob /
`git status`), danach wird die Doku korrigiert.

---

## 2. Änderungs-Matrix — „ich ändere X"

Spalten: **Vorher einlesen** = Pflichtlektüre, sonst wird falsch gebaut · **In derselben
Änderung nachziehen** = Dokumente/Dateien, die sonst driften · **Mechanik** = Version, Tests,
Sonderpflichten. Abschnitt 1 gilt zusätzlich immer, Abschnitte 3–5 ebenso.

Die Klassenzuordnung (Version/CHANGELOG je Pfad) regelt §0 — die Zeilen unten nennen den
Zielzustand direkt, ohne Umdeutungs-Filter (Leitplanke 4).

### 2.1 Plugin-Inhalt (Skills, Module, Abteilungen, Hooks, Tests)

| Änderung | Vorher einlesen | In derselben Änderung nachziehen | Mechanik |
|---|---|---|---|
| **Skill neu** | **Standardprozess [`skill-bau.md`](<skill-bau.md>)** (Ebene, Skript-Entscheid, Anschlussart, Gate-Anschluss — **vor** dem ersten Artefakt) · `plugins/oai/referenz/skill-authoring.md` (Format, YAML-Falle) · `abteilungs-plugin-bau.md` · `wp-rahmen.md` (welches WP der Skill bedient) · `workflow.md` der Abteilung | Skill-Tabelle in `README.md` **und** Plugin-`README.md` · Trigger-Matrix in `workflow.md` · `plugins/oai/module-registry.json` (Skill-Segment **und** `status`-Text der Abteilung) · **Skillzahl** in der `description` des betroffenen `plugin.json`, im Marketplace-Eintrag, in den Überschriften von Betriebshandbuch §3/§3.1/§3.2 und in der Plugin-`README.md` · Betriebshandbuch §3 + Fortschritts-Tracker · `CLAUDE.md` Repo-Karte, falls die Skill-Liste dort namentlich steht | Bump des betroffenen Plugins · Suite · Validierung beider Ebenen · **Plugin-Grenze:** in ausgelieferten `.md` keine `../`-Verweise, und jede Nennung von `knowledge base/` braucht die Qualifizierung „OS-Repo" in unmittelbarer Nähe (testerzwungen; ein installiertes Plugin sieht keine Repo-Pfade) |
| **Skill inhaltlich geändert** (Ablauf, Trigger, `description`) | die SKILL.md selbst · `skill-authoring.md` · [`skill-bau.md`](<skill-bau.md>), falls Ebene, Skript oder Fremdsystem-Anschluss berührt sind · `wp-rahmen.md`, falls Gates berührt | Betriebshandbuch §3 (Auslöser-Beschreibung) · Plugin-`README.md`, falls die Kurzbeschreibung dort zitiert wird · `workflow.md`, falls sich die Trigger-Bedingung ändert | Bump (Fix vs. Neuerung nach Schema §3) · Suite · `validate <plugin> --strict` |
| **Skill umbenannt/entfernt** | `skill-authoring.md` · Registry | alle oben genannten **plus** `grep` nach dem alten Skill-Namen über das ganze Repo (Querverweise in Skills, `workflow.md`, Betriebshandbuch, READMEs) | Bump · Suite · Validierung · **Umbenennung ist teamsichtbar**: alter Slash-Befehl verschwindet → im PR-Memo explizit als Breaking kennzeichnen (der Release-Zug übernimmt es ins CHANGELOG) |
| **Neues Modul** (Skill-Präfix-Gruppe) | `abteilungs-plugin-bau.md` · Spec §15.8 (Begriffsmodell) · `workflow.md` | `plugins/oai/module-registry.json` · `CLAUDE.md` Repo-Karte · `README.md` · Plugin-`README.md` · Betriebshandbuch | Bump des Abteilungsplugins · Suite (Struktur-Invarianten prüfen Registry-Konsistenz) |
| **Neues Abteilungsplugin (im Repo)** — Regelfall: die Abteilung **trägt Inhalt** → Direktanlage als Satellit | **`abteilungs-plugin-bau.md` §3.0 (Eingangsentscheid) + §3.1 (Direktanlage)** · Spec **§15.53** (Weiche) · §15.33 (Zielzustand OS-Repo) · §15.16 (Plugin-Schnitt) · `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/` | **Im Satelliten:** Plugin an der Repo-Wurzel · Testsuite im Mindestumfang (§3a.1b) · SSOT als **Neuanlage** (Queue direkt in `Kandidaten-Queue/queue.md`) · `quality.yml` mit SHA-gepinnten Actions. **Im OS-Repo:** `.claude-plugin/marketplace.json` (**github-Source mit `ref` + 40-Hex-Commit-SHA**, Eintrag **ohne** `version`) · `plugins/oai/module-registry.json` (`repository`, `repoSkillsPath: "skills"`, **kein** `rahmen`) · `CLAUDE.md` Repo-Karte · `README.md` · `AGENTS.md` (Plugin-Aufzählung) · Betriebshandbuch (§3 + Tracker) | **Repo-Anlage, Push, Tag und Release sind Maintainer** (rote Linie) · **Reihenfolge-Invariante:** Release **vor** Marketplace-Pin — der zu pinnende Commit existiert vorher nicht · Pin per `git rev-parse v<tag>^{commit}` **und** `git ls-remote`-Gegenprobe (**Tag-Objekt-SHA-Falle**) · Startversion `0.1.0` in dessen `plugin.json` · `dependencies: ["oai"]` · **Install-Probe** (SSH-Falle) · `validate .` **und** `validate <satelliten-wurzel>` **ohne `--strict`** — Satelliten mit Wurzel-`CLAUDE.md` (Ebene-2-`@`-Import) erzeugen unter `--strict` das Advisory „CLAUDE.md at the plugin root is not loaded as project context" (bekannt, toleriert; Marketing/Development identisch) · **es entsteht kein `plugins/oai-<abteilung>/` im OS-Repo** — kein Umpinnen, kein Rückbau |
| **Neue Abteilung — Sonderfall: inhaltsleere Reservierung** | **`abteilungs-plugin-bau.md` §3.0 + §3.2** · Spec **§15.53** · §15.10 (fachliche Planung mit dem Fachbereich) · `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/` | `.claude-plugin/marketplace.json` (Eintrag **ohne** `version`, `source` `./plugins/oai-<abteilung>`, `description` benennt den **Reservierungs**-Zustand) · `plugins/oai/module-registry.json` · `CLAUDE.md` Repo-Karte · `README.md` · `AGENTS.md` (Plugin-Aufzählung) · Betriebshandbuch (§3 + Tracker) | **Nur zulässig, solange kein Inhalt vorliegt** — keine Skills, Referenzdateien, Module, Hooks oder Subagenten (Inhaltsbegriff §15.53) · Der Zustand ist **befristet:** der erste Inhalt macht **§3a fällig, bevor er gebaut wird** · Startversion `0.1.0` · `dependencies: ["oai"]` · **Install-Probe** · `validate .` **und** `validate plugins/<neu> --strict` |
| **Abteilung in Satelliten-Repo auslagern / Satellit aktualisiert** | **`abteilungs-plugin-bau.md` §3a** (Satelliten-Extraktion) · Spec §15.19 **+ §15.33** (gilt ausnahmslos für jede Abteilung; Pin = **Commit**-SHA via `git rev-parse v<tag>^{commit}`, vor dem Merge per `git ls-remote` verifizieren; Startversion setzt die Zählung der Abteilung fort, nie zurück) · `claude-team-distribution.md` | Marketplace-Eintrag **per `ref` + Full-SHA umpinnen** · `plugins/oai/module-registry.json`: Felder `repository` **und** `repoSkillsPath` (relativ zur Satelliten-Wurzel) · lokales `plugins/oai-<abteilung>/` entfernen · **Spec-Nachtrag** · `CLAUDE.md` Repo-Karte (Satelliten-Zeile) · `README.md` · `AGENTS.md` · Betriebshandbuch (§3 + Tracker) · `SECURITY.md` (Pin-Garantie) | Release/Version zählt **im Satelliten-Repo**; hier nur der Pin. Ohne SHA-Umpinnen erreicht die Änderung das Team nicht · Registry↔Pin-Konsistenz ist testerzwungen · **Install-Probe** in isoliertem `CLAUDE_CONFIG_DIR`; bei SSH-Fehlern `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` (verifizierte Falle, §3a) · Satelliten-Validierung **ohne `--strict`** — das Advisory „CLAUDE.md at the plugin root is not loaded as project context" ist bekannt und toleriert (Marketing/Development identisch; Wurzel-`CLAUDE.md` ist der beabsichtigte Ebene-2-`@`-Import) |
| **Secrets-Referenz geändert** (`OAI_SECRETS_REF`, §15.41) | Spec §15.41 (ENV-Referenz statt Textkapitel — Zugangsdaten nie als Wert im Repo) · Betriebshandbuch (os-info/init-Prüfpunkte) | betroffene Skills (`os-info`, `init` — nur „gesetzt / nicht gesetzt", nie den Wert nennen) · `SECURITY.md` (Garantie-Zeile „Secrets liegen nie im Repo") · `plugins/oai/doks/oai-teamsync.md`-Payload, falls die Referenz dort erklärt wird · Satelliten nur, falls deren Doku die ENV nennt (eigenes Repo, eigener PR, danach SHA-Umpinnen) | Der Wert wird in keinem Fall gelesen, geloggt oder in Kontext/Cache/Marker geschrieben — nur die Existenzprüfung ist erlaubt · `grep -rn "OAI_SECRETS_REF"` über das Repo als Sweep · Suite + `validate plugins/oai --strict` |
| **Hook neu/geändert** | Spec-Abschnitt des Gates (§15.12/§15.14/§15.38 FFG, §15.20/§15.25 Session-Start, §4.7/§15.21/§15.26 Safety-Gate — **ein Gate 4 gibt es nicht**, §15.44) · `project-meta-infos/Onsite.ai-OS-Gates-Definition.md` (Ist-Stand aller Gates; die Herleitung steht historisch in `Bauplan-archiv/2026-07-30-zielplan-kontrollschicht.md`) · bestehender Hook-Code + `hooks/lib/` | `plugins/oai/hooks/hooks.json` — Matcher **und** das `description`-Feld, das den Prosa-Zustand der Kontroll-Schicht trägt · `SECURITY.md` (Garantie-Tabelle: Hook-Datei, Gate-Umfang, Destruktivmuster, **Opt-out-Envs**) · `CLAUDE.md` (Repo-Karte Hooks-Zeile + Produktstand-Absatz) · `README.md` (Kontroll-Hook-Absatz) · Kern-Plugin-`README.md` (`plugins/oai/README.md`: Inhalt-Tabelle + Kontroll-Schicht-Abschnitt — wird **ausgeliefert**; Lücke belegt im Debug-Log 2026-08-10) · `plugins/oai/skills/os-info/SKILL.md` (der Orientierungs-Skill erklärt Hook-Bestand und Opt-outs dem Nutzer — ohne diesen Nachzug driftet er, Fund 2026-08-18 im Debug-Log) · Betriebshandbuch (Kontroll-Schicht + Tracker) **mit den sicherheitsrelevanten Design-Entscheidungen** **Prüfungs-Eigentum statt Matcher-Exklusivität** (Spec §15.22, neu gefasst): jede Prüfung hat genau ein Heimat-Plugin — keine Kern-Prüfung duplizieren oder abschwächen, Matcher frei; Kern-Hook → Kern-Bump + `VERSION` + Registry; Abteilungs-Hook → eigene Zeile unten (Hook-Norm W4) · Tests für den Hook zwingend, Negativprobe belegen · Opt-out-Env an **allen** vier Orten dokumentieren (Hook-Kopf, `hooks.json`, `SECURITY.md`, `README.md`) · **bei FFG-Engine-Änderung** (`oai-ffg.js`/`hooks/lib/`): Drift-Falltabelle `oai-ffg-drift.test.mjs` mitdenken und Upstream-Ritual fahren (`kern-plugin-bau.md` §2b) · **greift der Hook aufs Netz zu** (erstmals seit §15.39): Zeitgrenze mit stummem Abbruch, Cache-Mindestabstand, Schweigen bei fehlendem/unauthentifiziertem Werkzeug und **eigener** Opt-out-Env sind Pflicht und gehören namentlich in `SECURITY.md`; der Kindprozess-stderr wird verworfen (Auth-Diagnosen), und **kein Test darf echtes Netz brauchen** — der Aufruf wird per Env-Umleitung gestubbt und ist in der Suite standardmäßig aus |
| **Abteilungs-Hook/FFG bauen** (in einem Satelliten) | Spec §15.22 (Prüfungs-Eigentum, Verteilannahme) · `abteilungs-plugin-bau.md` §1 (Scope-Tabelle + **Hook-Norm W4**, 2026-08-21: Auslieferung trägt nur Kern-Hooks; etablierter Satellit darf eigene spezialisierte, nicht-redundante, nicht-kollidierende Hooks) · Basis-Gate-Code des Kerns (`plugins/oai/hooks/`) — was der Kern schon prüft, wird **nicht** dupliziert · Zielplan Kontroll-Schicht | `hooks/hooks.json` des Abteilungsplugins (Pfade über `${CLAUDE_PLUGIN_ROOT}`) · `SECURITY.md` (Garantie-Zeile) · Betriebshandbuch (Kontroll-Schicht + Tracker) · **PR-Ergebnismemo** | Bump des Abteilungsplugins · Tests je Hook zwingend, Fehlalarm-Schutz belegen · Opt-out-Env an allen vier Orten dokumentieren |
| **Upstream-Abgleich FFG-Engine** (extern getriggert: ECC-Release im Plugin-Cache, Änderung an `hooks/lib/` oder Halbjahres-Check — keine eigene Hook-Änderung) | `kern-plugin-bau.md` §2b (Ritual: Pin-Stand ecc@2.0.0, Schritte, Dauer-Abweichungen) | `plugins/oai/tests/oai-ffg-drift.test.mjs` — neue/ändernte Upstream-Fälle eintragen · ggf. `hooks/lib/bash-analyse.js` + `shell-substitution.js` · Übernahme-Entscheidung je Punkt im PR-Memo (auch „bewusst nicht übernommen" — der Zug übernimmt sie ins CHANGELOG) | Suite laufengelassen (`node --test plugins/oai/tests/*.test.mjs`) · Kern-Bump nur, wenn Engine-Verhalten sich ändert |
| **Test neu/geändert** | `plugins/oai/tests/*.test.mjs` (bestehende Invarianten nicht doppeln) | **Keine Testzahl mehr nachziehen — nirgends.** Seit 2026-08-15 (E4-Quick-Win, protokolliert im metaflow-Übergangsregister-Messprotokoll) nennt die Zahl **der Suite-Lauf selbst**; `CLAUDE.md`, Betriebshandbuch §7 und die Roadmap führen sie nicht mehr, `README.md` führte sie nie. Nachzuziehen ist nur die **Zusammensetzung** (was prüft welche Datei — ohne Zahl): Betriebshandbuch §7 Dateiliste, `CONTRIBUTING.md` (Kommentarzeile des Prüfzyklus), `CLAUDE.md` Repo-Karte (Dateinamen). Eine Zahl in einem Dokument ist ab jetzt ein Fund, kein Pflegepunkt | `node --test plugins/oai/tests/*.test.mjs` — **wortgleich**, Verzeichnis-Argument schlägt fehl · Kern-Bump nur bei Verhaltensänderung des Plugins, sonst Fix-Stelle |
| **Skill-Formatregeln geändert** (`plugins/oai/referenz/skill-authoring.md`) | die Datei selbst · `abteilungs-plugin-bau.md` · Spec §15.18 (warum sie im Kern liegt) | **alle** vorhandenen `SKILL.md` gegen die neue Regel prüfen (sie wird mit dem Kern ausgeliefert und gilt sofort teamweit) · Verweise in `CONTRIBUTING.md`, `AGENTS.md`, `abteilungs-plugin-bau.md` · das Verifikationsdatum („verifizierter Stand") in `README.md` | **Kern-Bump** (+ `VERSION` + Registry) · Achtung zwei Kopplungen: die Datei ist die **einzige Ausnahme** der Plugin-Grenzen-Invariante in `struktur.test.mjs`, und die **CI-Positivkontrolle** setzt die Frontmatter-Form `description: >-` voraus |
| **Pflege-Ausprägung / Queue-Format geändert** (`plugins/oai/referenz/pflege-auspraegung.md`) | die Datei selbst · Spec §15.24 (Promotion-Pipeline) + §15.30.3 (Pflege-Schnitt V2) + §15.31 + §15.36 (Queue-Flow) · die lesenden Kern-Skills `end-session`, `journal`, `queue-abteilung`, `queue-kern` | **alle** Abteilungsplugins müssen ihre `pflege-auspraegung.json` erfüllen (Schema-Änderung = `schemaVersion` hochzählen und die Satelliten nachziehen, sonst melden die Kern-Skills „Ausprägung neuer als der Kern") · die drei lesenden `SKILL.md` · `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` (Queue-Baustein + Pflichtbestandteil Plugin-Wurzel) · Betriebshandbuch §3.1 (Queue-Absatz) · Kern-Plugin-`README.md` (Inhalt-Tabelle + Queue-Abschnitt) | **Kern-Bump** (+ `VERSION` + Registry), weil die Referenz mit dem Kern ausgeliefert wird · Suite · `validate plugins/oai --strict` · **Plugin-Grenze:** jede Nennung von `knowledge base/` braucht die „OS-Repo"-Qualifizierung in unmittelbarer Nähe (testerzwungen) · Queue bleibt **append-only**: kein Format-Wechsel, der Altzeilen umschreiben würde |
| **Kriterienliste geändert oder geschärft** (Abschnitt 5 von `plugins/oai/referenz/pflege-auspraegung.md`: Kriterien a–d, Gegenkriterien GF1–GF4, No-Duplicate) | **Standardprozess [`kriterien-pflege.md`](<kriterien-pflege.md>)** (Ablauf, Nachzug-Matrix, Kürzel-Vergabe) · `project-meta-infos/Onsite.ai-OS-Kriterienliste-Definition.md` (Rolle im Flow, Abgrenzungen) · Spec §15.24 Entscheidung 2 + §15.31.1 + **§15.36.7** (Gegenkriterien, No-Duplicate) · die Datei selbst | Liste in `pflege-auspraegung.md` · dort zusätzlich Inhaltsverzeichnis, Feldbeschreibung `kriterienVerweis` und Beispiel-JSON, **falls die Versionsbezeichnung der Liste wechselt** · Definitionsdokument, falls die **Systematik** berührt ist · lesende Kern-Skills **nur**, wenn sie Kürzel/Kriterientext wörtlich zitieren (`grep` statt vermuten) · `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` (Queue-/Kriterien-Baustein) · Kern-Plugin-`README.md` · Betriebshandbuch (Queue-Absatz + Tracker) · `pflege-auspraegung.json` der **Satelliten**, falls deren `kriterienVerweis` die Versionsbezeichnung nennt (eigenes Repo, eigener PR, danach SHA-Umpinnen) | **Maintainer-Abnahme des Wortlauts ist Pflicht** — die Kriterien binden jede Abteilung · **Kern-Bump** (+ `VERSION` + Registry), weil die Liste im Plugin-Paket reist; neues Kriterium/Gegenkriterium = zweite Stelle, reine Wortlaut-Schärfung = dritte · **`schemaVersion` bleibt unberührt** (Schema = Felder der `pflege-auspraegung.json`, nicht Listeninhalt) — ein unnötiger Schema-Bump zwingt alle Satelliten zum Release und lässt die Kern-Skills „Ausprägung neuer als der Kern" melden · **Kürzel nie neu belegen**, Altzeilen der append-only-Queue werden nie umgeschrieben · Suite · `validate plugins/oai --strict` · Plugin-Grenze („OS-Repo"-Qualifizierung, testerzwungen) |
| **Vorlage geändert** (`knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/`) | `abteilungs-plugin-bau.md` §3 · die Vorlagendateien selbst | Variablentabelle der Vorlage · Repo-Karte in `CLAUDE.md` **und** `README.md` | Zwei Invarianten: „Vorlage ist kein Plugin" (kein echtes `plugin.json`, Platzhalter müssen stehenbleiben, `dependencies: ["oai"]` vorgegeben) und „keine offenen Platzhalter in ausgelieferten Plugins" — beide werden rot, wenn die Vorlage versehentlich ausgefüllt oder zum Plugin gemacht wird |
| **Agent neu/geändert** | `plugins/oai/referenz/agent-authoring.md` · `subagenten-bau.md` (inkl. §7 Testschutz) · Overlap-Prüfung gegen Agents **und** Skills | `plugins/oai/module-registry.json` (`agents`-Segment — auch für Satelliten-Abteilungen, deren Dateien im eigenen Repo liegen) · Betriebshandbuch (Subagenten-Abschnitt + Tracker) · Repo-Karte in `CLAUDE.md`/`README.md`/`AGENTS.md` · Plugin-`README.md`, falls Agenten dort aufgeführt sind · `plugins/oai/skills/os-info/SKILL.md` (Orientierungs-Skill scannt `agents/` der Installation — ohne diesen Nachzug driftet der Subagenten-Bestand, Fund 2026-08-18 im Debug-Log) | Bump des betroffenen Plugins · Suite: **beide** Agenten-Testdateien — `agenten.test.mjs` (portabler Baustein) und `agenten-os.test.mjs` (Registry + Vorlage, OS-Repo-gebunden) · `validate plugins/<name> --strict` · Werkzeuggrenzen-Regel (Allowlist-Prinzip) beachten (Grenze steht in der `tools`-Allowlist, Marker `<!-- oai:schreibend -->` ist Autoren-/Test-Vertrag, keine Laufzeitgrenze; `disallowedTools` nur Zusatzsicherung) · `isolation` gesperrt bis Mindestversion ≥ 2.1.210 · **Ändert sich der portable Baustein:** Baustein-Version im Dateikopf hochzählen **und** die Kopien in allen Satelliten mit `agents/`-Verzeichnis nachziehen (Testschutz-Regel `subagenten-bau.md` §7) |
| **Plugin/Abteilung entfernt oder stillgelegt** | `abteilungs-plugin-bau.md` · Spec §15.16 | `.claude-plugin/marketplace.json` **und** `plugins/oai/module-registry.json` **gleichzeitig** · Repo-Karte (`CLAUDE.md`, `README.md`) · `AGENTS.md` (Plugin-Aufzählung) · Betriebshandbuch §3 + Tracker (teamsichtbar: Namespace verschwindet) | Zwei Invarianten schlagen sonst an: Marketplace↔`plugins/` und Registry↔`plugins/` |
| **Ein Plugin bekommt einen MCP-Server** (`mcpServers` / `.mcp.json`) | `feature-manuals/` (betroffenes Manual) · Spec §15.18 (Auflage) | `plugins/oai/hooks/hooks.json`: der FFG-Matcher muss `mcp__*` mit abdecken — sonst schreibt ein Werkzeug **am Gate vorbei** · Manual · Betriebshandbuch (Konnektoren) · `SECURITY.md` (Garantie-Tabelle) | Testerzwungen: die Invariante wird scharf, sobald ein Manifest MCP-Server führt |
| **WP-Rahmen / `workflow.md` geändert** | `plugins/oai/wp-rahmen.md` (normativ, gilt für **alle** Abteilungen) · Spec | jede betroffene SKILL.md (Gate-Bezüge) · `workflow.md` der Abteilungen · Betriebshandbuch (WP-Kurzreferenz) · `CLAUDE.md` Vision-Abschnitt 3 | Kern-Bump (Rahmen liegt im Kern) · Abteilungsplugins prüfen, ob ihr Fachablauf noch passt |

### 2.2 Wissensbasis und Doku

| Änderung | Vorher einlesen | In derselben Änderung nachziehen | Mechanik |
|---|---|---|---|
| **Standardprozess neu oder inhaltlich geändert** (`plugin-maintanance-ruleset-source/*.md`) | `standardprozess-authoring.md` (verbindliche Gliederung samt Rubrik **Ergebnis/Output**) · das nächstverwandte Bestandsdokument als Stilvorbild | Zeile im `SSOT-Document-Index` Teil 2 · **Ruleset-Liste in `plugins/oai/skills/fit-pruefung/rubrik.md`** · die `Kette:`-Zeilen der Nachbarprozesse, falls sich die Kette ändert · diese Matrix, wenn der Prozess eine **neue Änderungsart** bedient | Zwei testerzwungene Spiegel derselben Dateimenge (Index **und** Rubrik) — beide in derselben Änderung, sonst ist die Suite rot. Reine Wortlaut-Politur ohne Struktur- oder Bedeutungsänderung löst nichts davon aus |
| **Wissensdatei neu** | `SSOT-Document-Index` **Teil 1** (Zielordner samt „gehört nicht hierher") | **Zeile in `SSOT-Document-Index` Teil 2** in der Tabelle der Zielkategorie: Link, Status (`lebend`/`historisch`), „Relevant wenn …" · **prüfen, ob ein Wissens-Router oder der Sucheindex den neuen Knoten nennen muss** (Zeile „Wissens-Router/Sucheindex" unten) | `struktur.test.mjs` erzwingt Vollständigkeit **und** Linkgültigkeit → ohne Eintrag ist die Suite rot. **Zweiter testerzwungener Spiegel, wenn die Datei in `plugin-maintanance-ruleset-source/` liegt:** die Ruleset-Liste in `plugins/oai/skills/fit-pruefung/rubrik.md` (`agenten-os.test.mjs`, Invariante „Ruleset-Menge driftet nicht“). Kein Bump, **kein CHANGELOG** (Wissensklasse, §0) |
| **Wissensdatei verschoben/umbenannt/gelöscht** | `SSOT-Document-Index` Teil 1 | `SSOT-Document-Index` **Teil 1 und Teil 2** · `CLAUDE.md` (Repo-Karte + Glossar + Pflicht-Einstieg) · `AGENTS.md` · `README.md` · `CONTRIBUTING.md` · Betriebshandbuch §9 · **Wissens-Router-Tabellen und `plugins/oai/hooks/wissen-sucheindex.json`** (Zeile unten — ein Zeiger auf ein verschobenes Dokument ist schlimmer als kein Zeiger) · **`grep` nach dem alten Pfad über das ganze Repo** | `git mv` statt löschen+neu (Historie) · Historische Dokumente (CHANGELOG-Alteinträge, Spec, `Bauplan-archiv/`, append-only-Protokolle) werden **nicht** rückwirkend umgeschrieben · die Pfad-Invariante der Router in `struktur.test.mjs` wird sonst rot |
| **Wissens-Router oder Sucheindex geändert** (`plugins/oai/skills/wissen-*/SKILL.md`, `plugins/oai/referenz/wissens-router.md`, `plugins/oai/hooks/wissen-sucheindex.json`) | Spec **§15.40** (Schnitt nach Arbeitsanlass, Zeiger-statt-Inhalt-Regel, Kontext-Ökonomie) · `plugins/oai/referenz/wissens-router.md` · `skill-authoring.md`, falls eine `description` berührt ist | die betroffene `SKILL.md` **und** den Sucheindex gemeinsam (Router-Tabelle und Index dürfen nicht auseinanderlaufen) · Betriebshandbuch §3 (Skill-Katalog) · `plugins/oai/module-registry.json` (Modul `wissen`) · Plugin-`README.md` · **berührt eine Zeile dieser Matrix selbst Abschnitt oder Nummerierung, zusätzlich `plugins/oai/hooks/pfad-aenderungsindex.json`** nachziehen — der Pfad-Zeiger-Hook (§15.49) zeigt auf genau diese Zeilen, der Index verweist damit auf sich selbst (Bauplan §5.1) | **Zeiger, nie Inhalt** — kopierter Quelltext ist sofort Doppelpflege · `description` + `when_to_use` zusammen ≤ 1.536 Zeichen (Plattform-Kürzung, `skill-authoring.md`) **und** Summe im Kontext-Budget (beides testerzwungen) · Sucheindex-Stichworte kleingeschrieben, ohne Umlaute (der Hook faltet ae/oe/ue/ss), mindestens vier Zeichen; **Umlaut-Plural braucht ein eigenes Stichwort** (`bauplaene` enthält kein `bauplan`) · jeder Pfad existiert und ist im Master-Index geführt (`struktur.test.mjs`) · Suite + `validate plugins/oai --strict` |
| **Neue Kategorie/Ordner in der Wissensbasis** | `SSOT-Document-Index` Teil 1 · `CLAUDE.md` Glossar | `SSOT-Document-Index` Teil 1 (Routing-Zeile: gehört hinein / nicht hinein / Lebenszyklus) **und** eigene Tabelle in Teil 2 · `CLAUDE.md` Glossar + Repo-Karte · Betriebshandbuch §9 | Invariante: **nur der Index selbst** liegt direkt in `knowledge base/` — alles andere in eine Kategorie |
| **Bauplan abgeschlossen** | der Plan selbst (Restpunkte?) | `git mv` aus `Aktive Baupläne/` nach `Bauplan-archiv/` · `SSOT-Document-Index`: Zeile in die Archiv-Tabelle, Status `historisch`, Link auf den neuen Pfad | Pflichtschritt, nicht optional: sonst verliert `Aktive Baupläne/` die Aussage „das läuft gerade" |
| **Idee ohne Auftrag** | `SSOT-Document-Index` Teil 1 | eigenes Dokument in `Feature-idea-backlog/` (je Idee eins) · Index-Zeile Teil 2 | keine Version, kein Release — aber Index-Zeile ist testerzwungen |
| **Design-Entscheidung geändert** | Design-Spec inkl. **aller** Nachträge (jüngster datierter Nachtrag gewinnt) | **zuerst Spec-Nachtrag**, datums-geschlüsselt („Nachtrag YYYY-MM-DD — Thema"), nie in-place: keine neue §-Nummer nötig (bestehende §-Nummern bleiben zitierfähig, Anker werden nicht reserviert — §3.3) · **keine Versions-Hochzählung, keine Drei-Fach-Spiegelung** — beides entfällt ersatzlos · danach die inhaltlich betroffenen Stellen in `CLAUDE.md`, `README.md`, Betriebshandbuch, betroffene Skills nachziehen | Die Wissensklasse trägt **kein Versionszählwerk** (§0): Datumsstempel + Status statt Versionsnummer, „jüngster Nachtrag gewinnt" läuft über das Datum, geschrieben im 2-Wochen-Batch (Zwischenträger: PR-Ergebnismemo + Register-Zeile). Spec-Versions-Fußzeile und Drei-Fach-Spiegelung (CLAUDE.md/README/Betriebshandbuch §9) sind seit dem Spec-Nachtrag 2026-08-21 „Spec-Governance" abgeschafft — die 2026-08-04-Drift (Spec 0.14.0, Doku noch 0.13.0), die diese Zeile ursprünglich auslöste, ist damit historisch erledigt, keine laufende Warnung mehr |
| **offsite-Fachwissen neu** (Branch-Regel, CI-Job, Jira-Feld) | Spec **§4/§5** (verifizierte Quelle) · Quellen-Hierarchie §5.2: Code/CI > READMEs > offsite-`CLAUDE.md` > Confluence | Spec-Nachtrag mit **Quellenbeleg** · betroffene Skills der Abteilung `development` · `workflow.md` | Ohne Belegstelle wird nichts aufgenommen. **Nie** direkt im offsite-Repo ändern — Finding + Patch außerhalb, dann Ticket-Prozess |
| **Fremdsystem/Konnektor/MCP** | `feature-manuals/` (betroffenes Manual) · Spec §15.11 (Atlassian zentral) | Manual in `feature-manuals/` aktualisieren · Betriebshandbuch (Konnektoren) | Auslieferung: der Marketplace liefert **keine** Doks — geteilte Doks kommen seit Kern 0.12.0 über den **SessionStart-Autosync** (`oai-doks-autosync.js`, Normalweg, §15.28); `/oai:update-doks` ist nur der manuelle Reparatur-/Erstlauf-Befehl |
| **Konvention/Prozess geändert** (z. B. Commit-Format, Prüfzyklus) | `CLAUDE.md` (Konventionen) · `CONTRIBUTING.md` | `CLAUDE.md` · `CONTRIBUTING.md` · dieser Aktualisierungs-Index · ggf. Standardprozess in `plugin-maintanance-ruleset-source/` | Prozessänderungen, die Agenten binden, müssen in `CLAUDE.md` landen — sonst wirken sie nicht |
| **Pflicht-Einstieg oder rote Linien geändert** | `CLAUDE.md` (Pflicht-Einstieg, rote Linien) · Spec §15.20 (Injektionsmechanik) | **der Text ist mehrfach gespiegelt und wird ausgeliefert:** `plugins/oai/hooks/oai-session-start.js` (injizierter Briefing-Text), `plugins/oai/skills/start/SKILL.md`, `AGENTS.md`, `SECURITY.md`, Betriebshandbuch (rote Linien) | **Kern-Bump** — wer nur `CLAUDE.md` ändert, lässt der Hook dem ganzen Team weiter die alte Pflicht injizieren |
| **Abschluss-Checkliste / Prüfzyklus geändert** | `CLAUDE.md` (Abschluss-Checkliste) · dieser Index (Abschnitt 5) | `.github/workflows/ci.yml` (Träger des mechanisch prüfbaren Teils — §15.43) · `CONTRIBUTING.md` (Prüfzyklus) · Betriebshandbuch (Prozess-QS) | Kein Kern-Bump nötig, solange kein ausgelieferter Skill berührt ist. Eine Checklistenzeile, die weder die CI prüft noch das Maintainer-Review abfragt, ist wirkungslos — jede neue Zeile bekommt einen benannten Träger |
| **Idee wird beauftragt** (aus dem Backlog in die Umsetzung) | das Ideendokument · `SSOT-Document-Index` Teil 1 (Lebenszyklus) | neuer Bauplan in `Aktive Baupläne/` mit Datumspräfix, der **auf das Ideendokument verweist** · das Ideendokument wandert per `git mv` **in derselben Änderung** ins `Bauplan-archiv/` · Index-Zeilen Teil 2 für Bauplan **und** verschobene Idee (Status `historisch`) | Lineares Lebenszyklus-Prinzip (Ebene-0-Leitplanke 1): ab Beauftragung ist der Bauplan die einzige lebende Spur; das archivierte Ideendokument trägt keine Referenz-Ansprüche mehr (Leitplanke 2) |
| **Team-globale CLAUDE-Anteile geändert** (Payload der **Ebene 1** `doks/global-claude-firmenblock.md` oder der **Ebene 1b** `doks/oai-teamsync.md` im Kern-Plugin) | `Onsite.ai-OS-CLAUDE-Ebenen-Definition.md` (Ebenen-Abschnitt **und** Pfad-/Verknüpfungs-Matrix) · Spec §15.28/§15.32 · `kern-plugin-bau.md` (Standardprozess Autosync) | Definitionsdokument (falls Regeln berührt) · Betriebshandbuch §6.3 · Hook-`description` in `hooks.json`, falls die Mechanik berührt ist · `README.md` + Kern-Plugin-`README.md` (Autosync-Absatz) | Payload liegt im Kern-Plugin-Paket → **Kern-Bump** (sonst erreicht der Autosync niemanden). **Ebene 1:** Marker-Konvention einhalten, Privat-Zone nie anfassen. **Ebene 1b:** Ganzdatei, kein Marker, keine Privat-Zone — Disziplin-Regel **unter 200 Zeilen** (lädt vollständig in jede Sitzung), Quellen referenzieren statt kopieren, Personen nur mit dem Präfix „aktuell" nennen |
| **Abteilungs-/Plugin-CLAUDE geändert** (`<abteilung>-abteilungs-claude.md` an der Plugin-Wurzel) | Definitionsdokument (AP3-Format, Zweiteilung, Zeiger-Regel) · Spec §15.32 · `abteilungs-plugin-bau.md` (Sparse-Clone-Regel, Pflichtbestandteil) | Plugin-`README.md` der Abteilung · `pflege-auspraegung.json`, falls rote Linien oder Queue-Angaben betroffen sind (beide Artefakte, dieselbe Änderung) · Definitionsdokument, falls das **Format** berührt ist · Betriebshandbuch §6.3 | Datei liegt IM Plugin-Verzeichnis; solange der Marketplace-Eintrag **kein `path`-Feld** setzt, ist das beim Satelliten die Repo-Wurzel selbst (dann trägt die Wurzel-`CLAUDE.md` zusätzlich den `@`-Import-Zeiger) — Präzisierung `abteilungs-plugin-bau.md` §1.2, 2026-08-14 → **Bump des betroffenen Plugins**; bei Satelliten zusätzlich SHA-Umpinnen. Teil 1 ist der von Gate 2 gelesene Teil — was dort steht, gilt in **jedem** Arbeits-Repo |
| **CLAUDE-Netz-Ebene/Payload neu oder geändert** (Ebenen-Prinzip, Kanal, Marker-/Import-Verdrahtung) | `Onsite.ai-OS-CLAUDE-Ebenen-Definition.md` · [`claude-netz-bau.md`](<claude-netz-bau.md>) (Standardprozess: Bau-Reihenfolge, Anti-Drift, Verifikation) | Payload-Datei · Autosync-/Lese-Hook · Hook-Tests (Erstlauf · No-op · Privat-Zone unverändert · defekte Marker) · **Ebenen-Tabelle + Pfad-/Verknüpfungs-Matrix im Definitionsdokument** | Payload reist im Plugin-Paket → **Kern-Bump bei jeder Payload-Änderung** (kein Bump = kein Auto-Update); Marker-Konvention und Privat-Zone unangetastet; neue Ebene ⇒ **diese Matrix um ihre Zeile ergänzen**; Gegenprobe `/context` („Memory files") + Zwei-Lauf-No-op |
| **Org-Instructions geändert** (Ebene 0, Admin-Oberfläche) | `Onsite.ai-OS-CLAUDE-Ebenen-Definition.md` (Abgrenzung §2.1a) | nichts im Repo außer ggf. Definitionsdokument-Hinweis | außerhalb von Git/Versionierung — Änderung im Tagesjournal vermerken, wenn sie Regeln des OS berührt; keine Duplikation von Ebene-1-Inhalt |
| **Sitzungswissen-Artefakt geändert** (Register / Roll-up / `stand.md` / Tagesjournal, §15.29) | Spec §15.29 · `SSOT-Document-Index` (Tabelle `sitzungswissen/`) | Register: Zeile **append/update, nie löschen** (Erledigt-Datum statt Entfernen) · Roll-up-Indexzeile der Abteilung mitziehen · `stand.md`-Datum aktualisieren · **kein CHANGELOG** (Wissensklasse, §0); strukturelle Änderungen (neue Spalte, Abteilung, Formatregel) trägt das PR-Memo | Kein Plugin-Bump (Wissensbasis). Schreiber ist `end-session`/`journal`, Leser `start` — ändert sich deren Pflichten-Schnitt, greift zusätzlich die Zeile „Pflicht-Einstieg oder rote Linien geändert" (Kern-Bump) |

### 2.3 Mechanik-Ebene (Manifeste, CI, Versionen)

| Änderung | Vorher einlesen | In derselben Änderung nachziehen | Mechanik |
|---|---|---|---|
| **Marketplace-Manifest** (`.claude-plugin/marketplace.json`) | `abteilungs-plugin-bau.md` §2 (harte Mechanik-Fakten) · Spec §15.18 | Beschreibungstexte müssen zum Ist-Stand passen — **das Team liest sie im Installationsdialog** (Skill-/Modulzahlen, Hook-Namen) · `README.md` | **Nie** ein `version`-Feld setzen: Claude Code löst aus `plugin.json` auf und ignoriert den Marketplace-Wert **ohne Warnung** · `claude plugin validate .` |
| **Plugin-Manifest** (`plugins/<name>/.claude-plugin/plugin.json`) | `abteilungs-plugin-bau.md` §2 · Spec §15.18 | bei Kern zusätzlich `VERSION` + `plugins/oai/module-registry.json` · `README.md` (Plugin-Tabelle) · `CLAUDE.md` (Produktstand) | **Einzige** Stelle für die Version · Struktur-Test erzwingt den Gleichstand Kern↔`VERSION`↔Registry |
| **CI-Workflow** (`.github/workflows/ci.yml`) | bestehender Workflow · `CONTRIBUTING.md` (Prüfzyklus muss identisch bleiben) | `CONTRIBUTING.md` (Prüfzyklus-Block) · `CLAUDE.md` (CI-Zeile der Repo-Karte) · `README.md` (CI-Absatz + Repo-Karte) · `SECURITY.md` (die CI-Positivkontrolle ist dort als Garantie zugesagt) | Actions **per Full-SHA** pinnen · lokaler Prüfzyklus und CI müssen dieselben Schritte fahren, sonst ist grün lokal wertlos · die Positivkontrolle (absichtlich defekter Skill **muss** rot werden) nie entfernen |
| **Release-Workflow** (`.github/workflows/release.yml`) | die Datei selbst · `CONTRIBUTING.md` §Release | `CONTRIBUTING.md` (Release-Schritte) · `README.md` (Release-Absatz) · `SECURITY.md` · Abschnitt 3 dieses Dokuments | Vorbedingungen, die absichtlich hart scheitern: **annotierter** Tag, Tag == `VERSION`, grüne Suite, vorhandener CHANGELOG-Abschnitt |
| **Mindestversion Claude Code / Node** | `abteilungs-plugin-bau.md` §2 (verifizierte Schwellen) · `claude-team-distribution.md` | `CLAUDE.md` (Produktstand) · `README.md` · `CONTRIBUTING.md` · **`.claude-plugin/marketplace.json`** (die Top-Level-`description` nennt die Team-Mindestversion) · `AGENTS.md` · CI: **beides** — die `node-version`-Matrix **und** der gepinnte `@anthropic-ai/claude-code`-Stand des Validierungsjobs (dessen Kommentar verlangt die gemeinsame Pflege) | Teamweite Wirkung → im PR-Memo als Anforderung benennen, nicht nur als Nebensatz (der Release-Zug übernimmt sie ins CHANGELOG) |

---

## 3. Version, Release und Tag — der vollständige Weg ans Team

**Grundregel:** Kein Bump = kein Auto-Update. Eine Änderung, die das Team erreichen soll, muss
über den **Release-Zug** laufen — nur er zählt die Version des betroffenen Plugins hoch
(Runbook: §3.6). **Im Arbeitsstrang wird nie gebumpt.**

1. **Bump-Schema (SemVer, dreistellig):** inhaltliche Neuerung → zweite Stelle (`0.1.0` →
   `0.2.0`) · Fix → dritte Stelle (`0.1.0` → `0.1.1`) · große Versionsexpansion → Major.
   Vergeben wird **eine** Waypoint-Version je Batch und Plugin, am Release-Zug (§3.6).
   **Die vierte Stelle („reiner Versionsnummern-Nachzug", Spec §15.23) ist aufgehoben**
   (Spec-Nachtrag §15.37): Der Fall existiert nach der Entdublizierung der
   Spiegelstellen nicht mehr, und vierstellig war ohnehin kein SemVer — die Plugin-Doku
   verlangt `MAJOR.MINOR.PATCH`. Wer eine vierstellige Version in einem Altdokument findet,
   liest einen historischen Stand.
2. **Ort:** **ausschließlich** `plugins/<name>/.claude-plugin/plugin.json`. Beim **Kern**
   zusätzlich `VERSION` und `plugins/oai/module-registry.json` spiegeln (Leitversion).
   Im Marketplace-Eintrag steht **nie** eine Version.
3. **Parallele Arbeitsstränge:** **Es wird nichts reserviert.** Versionen und Tags gehören
   ausschließlich zum Release-Zug (§3.6), Spec-Nachträge sind datums-geschlüsselt statt
   nummern-vergeben, und für Skill-/Agent-/Hook-**Namen** gibt es seit 2026-08-25 keine
   Reservierung mehr (Maintainer-Entscheid; der Standardprozess `anker-reservierung.md`
   und seine Herleitung sind mit demselben Entscheid entfallen). Kollisionen fängt, wo sie
   wirklich schaden, die Mechanik: gleiche Datei zweimal angelegt → Merge-Konflikt · doppelte
   Spec-Abschnittsnummer → Suite-Invariante in `struktur.test.mjs`. Was bleibt, ist
   Pflichtschritt 8 in Abschnitt 1: **fremde Worktrees vor dem ersten Schreiben prüfen.**
4. **Abteilungsplugins zählen eigenständig** — ein Gleichstand über alle Plugins ist
   ausdrücklich **nicht** gefordert.
5. **CHANGELOG:** **Der Strang schreibt keinen CHANGELOG-Eintrag.** Sein Wissensträger ist das
   **PR-Ergebnismemo** (was, warum, Verifikation, Produktanteil gekennzeichnet); die
   CHANGELOG-Sektion schreibt der **Release-Zug** aus den Memos des Batches, unter der neuen
   Version und nach Keep-a-Changelog (§0/§3.6). **Wissensklassen-Änderungen
   erscheinen in keinem CHANGELOG** — sie tragen Datum, Status und SSOT-Index-Zeile.
6. **Release-Zug — das Runbook** (Auslöser: **ausschließlich Maintainer-Kommando** „schneide
   ein Release", typischerweise nach mehreren Merges; keine Fälligkeit je PR — der
   Wochen-Rhythmus ist Maintainer-Kadenz, Leitplanke 9):
   1. **Batch erheben:** gemergte PRs seit dem letzten `v*`-Tag listen (`gh pr list
      --state merged` / GitHub-Compare); Produktanteile aus den PR-Memos ziehen.
   2. **Waypoint-Version wählen** (Maintainer + Overseer) nach Schema §3.1 — **eine** Version
      je Batch und Plugin.
   3. **CHANGELOG-Sektion schreiben** aus den PR-Memos des Batches, unter der neuen Version
      (kein `[Unreleased]`-Dauerbestand; was nicht im Batch ist, steht in keinem CHANGELOG).
   4. **Bump:** `plugins/<name>/.claude-plugin/plugin.json` (+ beim Kern `VERSION` +
      `module-registry.json`).
   5. **Verifikation:** Testsuite + `claude plugin validate` beider Ebenen.
   6. **Release-Schnitt-PR** → Maintainer merged (seine Merge-Freigabe deckt Tag und Release
      mit ab — Entscheid 2026-08-10).
   7. **Tag `v<Version>` + GitHub-Release** (Notes = die CHANGELOG-Sektion; `release.yml`
      prüft Tag ↔ `VERSION`).
   8. **Satelliten-Variante:** Bump + Tag + Release im Satelliten-Repo, dann SHA-Umpinnen des
      Marketplace-Eintrags im Kern (`abteilungs-plugin-bau.md` §3a) — als Zug-Schritt, nicht
      als Sonderprozess.

   **Auslieferungs-Takt:** Das Auto-Update des Teams hängt am Versionsfeld — **das Team
   bekommt Produktänderungen erst mit dem Release-Zug**; ein Merge auf `main` allein liefert
   nichts aus. **Frühwarn-Detektor:** die CI meldet git-basiert „Release-Zug fällig", wenn
   seit dem letzten `v*`-Tag Produktklassen-Pfade geändert wurden und kein neuer Tag
   existiert (Warnung, kein Block — das Kommando bleibt beim Maintainer).
7. **Satelliten-Releases** laufen im jeweiligen Satelliten-Repo (`abteilungs-plugin-bau.md` §3a); hier
   wird nur der Marketplace-Pin per Full-SHA nachgezogen.

---

## 4. Protokolle und Indizes — wer wird wann fortgeschrieben

| Dokument | Art | Auslöser | Regel |
|---|---|---|---|
| [`CHANGELOG.md`](<../../CHANGELOG.md>) | Historie | **nur der Release-Zug**, aus den PR-Memos des Batches (§0/§3.6) | Sektion unter der neuen Version nach Keep-a-Changelog; **nur Produktklassen-Anteile**. Der Strang schreibt hier nichts — sein Wissensträger ist das PR-Ergebnismemo. Alteinträge sind historisch und werden nie umgeschrieben |
| **PR-Ergebnismemo** (PR-Body) | Wissensträger des Strangs | **jeder** PR | Was geändert, warum, welche Entscheidungen, Verifikations-Ausgabe, **Produktanteil gekennzeichnet**. Ersetzt den früheren CHANGELOG-Eintrag je Änderung; der Release-Zug liest daraus |
| [`agent-learnings.md`](<../Debugging + findings/agent-learnings.md>) | Fehlerprotokoll, append-only | **jeder einzelne eigene Fehler**: falsche Annahme, falscher Pfad, fehlgeschlagener Befehl durch eigenes Verschulden, falsch umgesetztes Format | Sofort, ohne Ausnahme, Format wie in der Datei. Nicht sammeln, nicht beschönigen, nicht rückdatieren |
| [`debug-log.md`](<../Debugging + findings/debug-log.md>) | Debug-Log, append-only | Bug im Repo **gefunden** oder **behoben** (auch fremde Versäumnisse) | Kurzinfo was/wann/wie. Vor der Fehlersuche prüfen, ob das Symptom bekannt ist |
| [`SSOT-Document-Index`](<../SSOT-Document-Index.md>) | Master-Index | jede neue, verschobene, umbenannte oder gelöschte Wissensdatei; jede neue Kategorie | In **derselben** Änderung. Testerzwungen (Vollständigkeit + Linkgültigkeit) |
| [Betriebshandbuch](<../project-meta-infos/Onsite.ai-OS-Betriebshandbuch.md>) | Ist-Inventur | **Batch: 1× alle 2 Wochen** oder nach großen Features (Maintainer-Kadenz 2026-08-21, Leitplanke 9) — nie je Einzeländerung; Zwischenstände trägt das PR-Ergebnismemo | Beim Batch: betroffene Abschnitte **plus** Fortschritts-Tracker; Kopfzeile `Stand:` mitziehen |
| Design-Spec | Normativ (Wissensklasse: Datum + Status, keine Version — Leitplanke 7) | Design-Entscheidung geändert | **Nur per Nachtrag**, nie in-place — geschrieben im **2-Wochen-Batch** (Maintainer-Kadenz 2026-08-21); Zwischenträger bis zum Batch: PR-Ergebnismemo + Register-Zeile. Jüngster Nachtrag (Datum) gewinnt |
| `CLAUDE.md` / `AGENTS.md` / `README.md` / `CONTRIBUTING.md` | abgeleitet, lebend | Struktur, Pfade, Skills, Module, Versionen, Prozesse | Gleicher Change, gleiche Pflege — nicht „später". Umfang: diese Änderungs-Matrix |
| `SECURITY.md` | lebend, teamsichtbare Zusage | jede Änderung an Hooks, Gate-Umfang, Opt-out-Envs, Satelliten-Pins, CI-Positivkontrolle oder nur-manuellen Skills | Die Datei sagt zu, **was das OS garantiert und was ausdrücklich nicht** — eine Garantie, die der Code nicht mehr hält, ist schlimmer als keine |

---

## 5. Prüf- und Abschlusszyklus (vor **jedem** Commit-Vorschlag)

Träger sind zwei Instanzen (Maintainer-Entscheid 2026-08-17, Spec §15.43): den **mechanisch
prüfbaren Teil** fährt der **CI-Prüfzyklus** (`.github/workflows/ci.yml`), alles Übrige trägt
das **Maintainer-Review am PR**. Einen ausführenden Skill gibt es nicht mehr, und einen
Pre-Commit-Hook wird es nie geben (mehrere Abteilungen committen gar nicht). Der Zyklus ist
darum von Hand abzuarbeiten und wird von der CI nur nachgeprüft:

- [ ] **Doku-Vollständigkeit** nach Abschnitt 2
- [ ] **Toter-Pfad-Sweep:** `grep` nach jedem alten Pfad/Namen über das **ganze** Repo
- [ ] **PR-Ergebnismemo** geschrieben, Produktanteil gekennzeichnet — **kein** CHANGELOG-Eintrag
      und **kein** Bump im Strang (beides macht der Release-Zug, §0/§3.6)
- [ ] **Versions-Gleichstand geprüft** (nicht gebumpt): Kern-`plugin.json` = `VERSION` = Registry
- [ ] **Validierung beider Ebenen:** `claude plugin validate .` **und**
      `claude plugin validate plugins/<name> --strict` je berührtem Plugin — die
      Wurzel-Variante allein prüft **keine** Skills (genau diese Lücke ließ 19 von 22 Skills
      mit nicht parsender Frontmatter durch)
- [ ] **Tests:** `node --test plugins/oai/tests/*.test.mjs` — wortgleich, Glob statt Verzeichnis
- [ ] **Protokolle** dieser Sitzung geschrieben (Abschnitt 4: eigene Fehler, gefundene Bugs)
- [ ] **Wissensdateien am richtigen Ort**, `SSOT-Document-Index` nachgezogen, abgeschlossene
      Baupläne verschoben
- [ ] **Git-Hygiene:** bei Remote-Repos in einem eigenen Worktree gearbeitet; Branch-Basis
      bewusst gewählt (steht ein anderer PR kurz vor dem Merge, auf dessen Kopf aufsetzen statt
      auf `main`, um Kollisionen und Doppel-Bumps zu vermeiden)
- [ ] **Review-Kette + Integration:** Erstbau → externes Zweitreview (PENDING/Report, nie
      submitten) → Overseer-Finalabnahme · vor dem Merge aktuelles `main` einziehen, Konflikte
      lösen, Suite + CI auf dem **integrierten** Stand fahren und die Finalabnahme dort
      erneuern

**Rote Linien — nie ohne ausdrückliche Freigabe des Maintainers, nie automatisiert:**
Commit · Push · PR-Erstellung · Merge · Force-Push · Tag-Push/Release · destruktive
Git-Operationen · alles Kundensichtbare (MR-Texte posten, Jira-Kommentare posten) ·
Review-Resolves/Approvals · Deploy-Klicks. Team-Repos (z. B. `offsite`) werden nie direkt
geändert. Keine Secrets/Tokens in Dateien, Logs oder Commits.

---

## 6. Selbsttest — „habe ich etwas vergessen?"

Sieben Fragen, die die typischen Auslassungen abdecken:

1. **Zahlen:** Habe ich irgendwo eine Zahl geändert (Skills, Module, Tests, Version)? Dann steht
   dieselbe Zahl auch in `CLAUDE.md`, `README.md`, Betriebshandbuch, Roadmap,
   `marketplace.json`-Beschreibung und ggf. `CONTRIBUTING.md`.
2. **Pfade:** Habe ich etwas verschoben oder umbenannt? Dann läuft ein `grep` nach dem alten
   Namen über das ganze Repo — inklusive Skills und Hooks.
3. **Index:** Ist eine Datei unter `knowledge base/` entstanden, gewandert oder verschwunden?
   Dann ist der `SSOT-Document-Index` in **derselben** Änderung dran (sonst rote Suite).
4. **Teamwirkung:** Soll die Änderung beim Team ankommen? Dann muss sie über den Release-Zug
   (§3.6) — ein Merge auf `main` allein liefert nichts aus.
5. **Protokolle:** Habe ich in dieser Sitzung einen eigenen Fehler gemacht oder einen Bug
   gefunden? Beides ist Pflichteintrag, nicht Ermessen.
6. **Garantien:** Berührt die Änderung einen Hook, ein Gate, einen Opt-out, einen Satelliten-Pin
   oder einen nur-manuellen Skill? Dann steht in `SECURITY.md` eine Zusage dazu, die mitzuziehen
   ist.
7. **Wahrheit:** Behaupte ich etwas („Suite grün", „Validierung bestanden"), ohne die Ausgabe
   gesehen zu haben? Dann erst ausführen, dann behaupten.

---

*Angelegt 2026-08-04 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer —
Auftrag: eine Liste, „auf die zurückgegriffen werden kann, wenn bearbeitet wird, um alle
notwendigen Dokumente zur Änderung einzulesen".*
