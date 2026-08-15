# Changelog

Technisches Release-Log des NovaCore-OS (Plugin-Familie: Kern `nc`, Abteilung
`nc-development`). Format angelehnt an
[Keep a Changelog](https://keepachangelog.com/); Versionen folgen SemVer und leben
**je Plugin** allein in `plugins/<name>/.claude-plugin/plugin.json` — die Kern-Version ist
die Produkt-Leitversion und wird in `VERSION` und `plugins/nc/module-registry.json`
gespiegelt (testgesichert). Einträge bis einschließlich 0.2.0 beschreiben das frühere
Single-Plugin-Layout und bleiben historisch unverändert.

## [Unreleased]

### Added

- **Bauplan `2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md`** (Weisung
  Maintainer 2026-08-11: „alles zum Bau und zu Standardprozessen aus der Onsite-Wissensbasis
  gilt 1:1 für NovaCore-OS und das Felix-Plugin"). Erhoben gegen
  `onsite-ai-devs/Onsite.ai-OS@5d335a7` und den Satelliten `Onsite.ai-OS-Marketing@a9d8658`;
  erweitert den Onsite-Align-Umbau (2026-08-10) um den **Bau- und Prozesskorpus** und um die
  **Struktur-Vererbung an die Satelliten**. Inhalt: Delta-Tabelle des Prozesskorpus
  (Zweiteilung `plugin-bau`, fehlender Standardprozess `ssot-aufbau`, fehlender
  `sync-nachzug-bauzyklus`, fehlende Vorlage `ssot-grundgeruest`, 10 fehlende Zeilen im
  Aktualisierungs-Index, fehlendes Protokoll `debug-log.md`), der Befund „Felix trägt 0 von 6
  SSOT-Bausteinen" samt Mechanik-Rückstand (fehlendes Gate 2, `process.exit(0)` im FFG-Port),
  die Invarianten **I1–I7** mit Review-Fokus auf der **Isolation der Satelliten-SSOT** und dem
  korrekten Fail-open, elf Arbeitspakete in drei Spuren (Kern · Felix · Biggi), 16 nummerierte
  Testfälle write-first sowie der verbindliche Delegationsschnitt für **externen Parallelbau
  mit Kimi K3** (Plan-Sandwich-Vertrag, Konfliktzonen, Implementierer ≠ Reviewer). Der
  Ausschluss aus dem Vorgängerplan §0.2 gilt unverändert: keine Queue, keine Promotion, kein
  Memory-Share — die SSOT eines Satelliten ist **terminal**; I1 begründet das positiv: ein
  Satellit schreibt nie in Kerndokumente, damit ist eine Queue nicht „später", sondern
  gegenstandslos (auch `bauplan-archiv/` ist Historie, keine Staging-Fläche).
  **Entscheidungen E1–E3 vom 2026-08-11 eingearbeitet:** Onsite-Fünferstruktur wörtlich (neue
  Kategorien `bauplan-archiv/` und `ideen-backlog/` im Kern **und** in den Satelliten,
  Pflicht-Verschiebung abgeschlossener Pläne — **Nachtrag N1** revidiert dafür die „kein eigener
  Ordner"-Regel des Vorgängerplans, ohne ihn in-place umzuschreiben) · Zweiteilung von
  `plugin-bau.md` · Kimi-Pakete K-1 bis K-3 freigegeben mit geführtem Review-Zyklus (§5a) und
  Baureihenfolge (§8a). Verifizierter Nebenbefund: `struktur.test.mjs` kennt heute keine
  `PLATZHALTER.md`-Ausnahme — ohne diesen Nachzug würde die Index-Invariante an leeren
  Kategorien scheitern (AP3.6). — *Claude (Opus 5)*
- **Wissensbasis: zwei neue Kategorien nach dem Vorbild-Schnitt** (Bauplan AP3, Entscheid E1).
  `knowledge-base/bauplan-archiv/` nimmt abgeschlossene oder verworfene Pläne auf — der
  abgeschlossene `2026-07-28-umbau-plan.md` ist per `git mv` (Historie erhalten) dorthin
  gewandert; `knowledge-base/ideen-backlog/` ist angelegt und noch leer (`PLATZHALTER.md`).
  `SSOT-Document-Index`: Mapping-Tabelle, Teil-1-Routing (inkl. **Pflicht-Verschiebung**
  abgeschlossener Pläne und der Terminal-Klarstellung: das Archiv ist **keine**
  Kandidaten-Queue) und Teil-2-Tabellen beider Kategorien nachgezogen. `struktur.test.mjs`:
  `PLATZHALTER.md` von der Indexpflicht ausgenommen (strukturell, kein Wissen) und **neue
  Invariante** „jede Kategorie unter `knowledge-base/` ist in Teil 1 geroutet" — eine
  Kategorie ohne Routing-Zeile ist ein Ablageort ohne Regel. Suite: 93 Tests grün.
  — *Claude (Opus 5)*
- **Prozesskorpus des Vorbilds nachgezogen — vier Standardprozesse statt einem** (Bauplan AP1,
  AP2, AP4; Entscheid E2). Jede Quelldatei wurde aus `origin/main` des Vorbilds gelesen
  (`git show "origin/main:<pfad>"`), nicht rekonstruiert.
  - **`plugin-bau.md` zweigeteilt:** `standardprozesse/kern-plugin-bau.md` und neu
    `standardprozesse/abteilungs-plugin-bau.md` (die Git-Historie des Vorgängers hängt an keiner
    der beiden Hälften — Plan-Nachtrag **N4**). Der Kernteil bekommt die
    **Governance-Zwei-Schichten-Tabelle §1a** (team-shared ↔ individuell, samt Prüfungs-Eigentum
    und der Begründung, warum ein Satellit eigene Gate-Kopien tragen darf, ohne die Regel zu
    verletzen), den **Autosync-Standardprozess §2a** und die **Mindest-Client-Schwellen** als
    einzige Stelle im Repo. Der Abteilungsteil bekommt die **Auslieferungsgrenze §1a**, die
    Zeile „ein eigenständiger Satellit führt eine eigene Wissensbasis" und in §3b.1 den Baustein
    „eigene Wissensbasis samt Wächter".
    Der Autosync-Abschnitt ist **nach dem realen Hook-Code** geschrieben, nicht nach dem
    Vorbild-Text: NovaCore trägt dort zwei Härtungen mehr (atomarer Write über Temp-Datei plus
    `rename`, und eine Sicherung, die nie durch eine schlechtere ersetzt wird). Ebenso bleibt
    „Hooks nur im Kern" die NovaCore-Regel — die Lockerung des Vorbilds (Abteilungs-Hooks nach
    einem Sequenzierungs-Gate) wurde **nicht** übernommen, weil `struktur.test.mjs` sie erzwingt.
  - **Neu `standardprozesse/ssot-aufbau.md`:** Zielbild, die sieben Grundbausteine,
    Aufbau-Ablauf, Anti-Drift-Prinzipien, Replikationsanleitung. Der Abschnitt
    „Plugin-Verknüpfungsvorbereitung" des Vorbilds ist **ersetzt** durch §4 Struktur-Vererbung
    plus **§4a Isolations-Invariante** — Kandidaten-Queue, Promotion-Pipeline, Kurationslauf und
    Cross-Satelliten-Zugriff existieren nicht und werden auch nicht reserviert. Abnahme belegt:
    `grep -in "queue\|promotion\|kuration"` trifft ausschließlich diese Ausschluss-Erklärung.
  - **Neu `standardprozesse/sync-nachzug-bauzyklus.md`:** Nachzüge werden je Bauzyklus
    protokolliert statt verstreut erledigt und am Zyklusende gebündelt abgearbeitet, mit Review
    und deterministischer Gegenprobe. Ergänzt um die **Konfliktzonen-Regel** für Parallelbau
    (welche Dateien kein Paketagent anfasst).
  - **Neu `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage`:** die fünf Pflichtbausteine
    auf den NovaCore-Ordnerschnitt gemappt, beide Protokollköpfe wörtlich, Platzhalter
    `{{ABTEILUNG}}`, `PLATZHALTER.md`-Regel, Auslieferungshinweis und die sieben Pflichten des
    mechanischen Wächters. **Zwei begründete Streichungen** gegenüber dem Vorbild: die Zeile
    „Bauplan-Archiv = einzige Quelle Richtung Kern" und der Abschnitt „Reserviert" — ersetzt
    durch den Absatz „Isolation". `VORLAGE.md` um Inhalts-, Variablen- und Kopierzeile ergänzt.
  - **Verweis-Sweep** über das ganze Repo: `AGENTS.md`, `README.md`, `CLAUDE.md`,
    `os-bau-methode.md`, `aktualisierungs-index.md`, `marketplace.json`, `nc-sync.md`,
    `README.md.vorlage` und der `SSOT-Document-Index` zeigen jetzt auf das jeweils richtige der
    zwei Dokumente. Historische Dokumente (CHANGELOG-Alteinträge, append-only-Protokolle,
    archivierte Pläne) blieben unverändert. Suite: 93 Tests grün · `validate .`,
    `validate plugins/nc --strict` und `validate plugins/nc-development --strict` bestanden.
  — *Claude (Opus 5)*
- **Zweites Protokoll `debugging-findings/debug-log.md`** (Bauplan AP3.2) — Gegenstück zum
  Fehlerprotokoll: dort die **eigenen** Fehler, hier die **gefundenen** Bugs und Fehlbefunde,
  auch an fremdem Material. Append-only, Format Datum · Symptom · Ursache · Fix · Beleg; ein
  widerlegter Eintrag wird nie umgeschrieben, sondern bekommt einen neuen, der auf ihn verweist.
  Index- und `aktualisierungs-index`-Zeilen in derselben Änderung. — *Claude (Opus 5)*
- **Aktualisierungs-Index: zehn neue Änderungsarten** (Bauplan AP3.1) — **Satelliten-SSOT
  geändert** und **Satelliten-Wissensbasis neu angelegt** (beide mit der ausdrücklichen Mechanik
  „kein Nachzug im OS-Repo — die Satelliten-SSOT ist terminal"), Bauplan abgeschlossen oder
  verworfen (Pflicht-Verschiebung ins Archiv), Idee ohne Auftrag, Idee wird beauftragt (die Idee
  bleibt stehen, der Plan verweist auf sie), Abteilungs-/Plugin-CLAUDE geändert,
  Fremdsystem/Konnektor/MCP dokumentiert, Satelliten-Hook/Gate geändert, Protokolleintrag
  fällig, Vorlage `ssot-grundgeruest` geändert. Dazu `debug-log.md` in der Protokoll-Tabelle §4,
  im Prüfzyklus §5 und im Selbsttest §6. — *Claude (Opus 5)*
- **Affiliate `mneme-kimi-code` in den Marketplace aufgenommen** (Bauplan
  `2026-08-10-onsite-align-umbau-bauplan.md`, AP7; Blocker aus dem 0.6.0-Eintrag aufgelöst).
  Der fehlende annotierte Tag `v2.0.24` ist jetzt im externen Repo `ArchiDoxx/mneme-kimi-code`
  gesetzt und gepusht (Maintainer-Freigabe 2026-08-11); der Eintrag pinnt per `ref` + Full-SHA
  auf dessen Commit (`406c9f2`). Damit ist die Konvertierung zum Claude-Code-Plugin
  (`.claude-plugin/plugin.json`, `hooks/hooks.json` mit allen sieben Events, `.mcp.json` für
  den FastMCP-Server) über den Marketplace installierbar. Wie `kimi-code-plugin-cc`: Kategorie
  `affiliate`, keine Registry-Zeile, keine Kern-Dependency; Host-Anforderung `uv` steht in der
  Marketplace-Beschreibung (das Team liest sie im Installationsdialog). `README.md`
  (Statuszeile + Plugin-Tabelle) in derselben Änderung. — *Kimi (K3, Kimi Code CLI)*

### Fixed

- **Falsche Mechanik-Begründung des Vorbilds nicht übernommen** (Plan-Nachtrag **N3**, Eintrag
  im neuen `debug-log.md`). Das Vorbild begründet die Auslieferungsgrenze eines Satelliten
  damit, ein `ref`/`sha`-Pin löse einen **sparse clone nur des Plugin-Subverzeichnisses** aus.
  Gegen die offizielle Doku gehalten (`plugin-marketplaces`, abgerufen 2026-08-11 über
  `code.claude.com` — die alte Adresse antwortet mit `301`): Der sparse clone hängt am
  Source-Typ **`git-subdir`** bzw. am Flag `--sparse`, **nicht** am Pin; ein `github`-Source
  klont das ganze Repo. Die reale Grenze entsteht **beim Install**, der nur **das
  Plugin-Verzeichnis** nach `~/.claude/plugins/cache` kopiert. Die Schlussfolgerungen des
  Bauplans bleiben damit gültig (der Kern liefert `knowledge-base/` nie aus, ein Satellit
  schon), die Begründung ist jetzt belegt statt geerbt. Invariante I3 wird dadurch präziser,
  I1 bleibt unberührt. — *Claude (Opus 5)*
- **Externes Review (Kimi K3, read-only, 2026-08-11): Verdikt `request_changes`**, keine
  CRITICAL/HIGH. Die Invarianten I1 (Isolation, eigener Sweep), I2 („Hooks nur im Kern"
  unverändert testerzwungen), I3 und I5 wurden unabhängig bestätigt, ebenso die Deckungsgleichheit
  des Autosync-Abschnitts §2a mit dem realen Hook-Code. Eingearbeitet:
  **MEDIUM 1** — die Formulierung „diese Schwellen stehen ausschließlich hier" in
  `kern-plugin-bau.md` §3 verbot wörtlich, was die Änderungs-Matrix §2.3 **gebietet**
  (`≥ 2.1.193` gehört als Produktstand nach `README`, `ONBOARDING`, `AGENTS`); der Satz ist
  jetzt gescopet — Einzelschwellen samt Begründung nur hier, die nackte Team-Anforderung bleibt
  gewollter Pflicht-Spiegel. **LOW 2** — der Verweis-Sweep hatte
  `grundwissen/2026-07-28-multi-plugin-architektur-design.md` übergangen, weil datiert; die Spec
  ist aber als **lebend** indiziert. Statt sie in-place umzuschreiben (Norm-Nachtragsprinzip)
  trägt sie jetzt **Nachtrag §12** mit der Lesehilfe alt → neu. **LOW 3/LOW 5** — Kopfzahl
  „fünf Bausteine" gegen sechs Tabellenzeilen erklärt; der Debug-Log-Kopf deklariert die fünf
  Felder als **Minimum** mit erlaubten Zusatzfeldern.
  **Zurückgewiesen: LOW 1** — das Zitat „Git-based marketplaces clone the entire repository"
  sei nicht in der Doku. Es steht dort, im Troubleshooting-Abschnitt „Relative paths don't
  resolve" der am 2026-08-11 abgerufenen Fassung; die Fundstelle ist jetzt im Text benannt,
  zusammen mit dem `git-subdir`-Kontrast als zweitem Beleg. Suite nach den Fixes: 93 Tests grün.
  — Agent: Claude (Opus 5), Review: Kimi K3

### Changed

- **Kern-Bump `0.6.1 → 0.7.0`** (AP5) — Minor, weil vier neue **normative** Standardprozesse
  hinzukommen; ohne Bump erreicht das Team sie nicht. Version an den drei testerzwungenen
  Spiegelstellen: `plugins/nc/.claude-plugin/plugin.json`, `VERSION`,
  `plugins/nc/module-registry.json`. Der Marketplace-Eintrag trägt weiterhin **kein**
  `version`-Feld.
- **Lebende Doku nachgezogen:** `AGENTS.md` (Produktstand-Eintrag v0.7.0, Wissensbasis-Tabelle
  um `bauplan-archiv/` und `ideen-backlog/` ergänzt, Repo-Karte und Pflicht-Einstieg auf die
  vier Standardprozesse umgebogen) · `README.md` (Statuszeile, Plugin-Tabelle, Prozessliste) ·
  `SSOT-Document-Index` (Mapping-Tabelle, Teil-1-Routing, vier neue Teil-2-Zeilen) ·
  `CLAUDE.md`, `os-bau-methode.md`, `marketplace.json`, `nc-sync.md`, `VORLAGE.md`,
  `README.md.vorlage`. Historische Dokumente blieben unverändert; die als **lebend** indizierte
  Design-Spec bekam statt einer In-place-Änderung den **Nachtrag §12** mit der Lesehilfe
  alt → neu. — *Claude (Opus 5)*
- **Adversariales Review des PR (2026-08-12): drei Wächter-Invarianten gehärtet, eine falsche
  Historien-Zusage korrigiert.** Beide Befunde stehen mit Gegenprobe im `debug-log.md`.
  - **`struktur.test.mjs` prüft jetzt, was die Namen zusagen** — vorher grün trotz kaputter
    Datenlage, nachher rot: **(1)** „jede Kategorie ist im Routing erfasst" suchte im **ganzen**
    Index statt in Teil 1 und blieb grün, nachdem die Routing-Zeile für `ideen-backlog/` gelöscht
    war (der Name steht auch in der Mapping-Tabelle, in „gehört nicht hierher" fremder Zeilen und
    in den Teil-2-Überschriften); die Prüfung ist auf den **Abschnitt Teil 1** und eine echte
    **Tabellenzeile** eingeschränkt, mit Guard gegen eine umbenannte Überschrift. **(2)** Die
    `PLATZHALTER.md`-Ausnahme galt **unbedingt**, obwohl sie dreifach **bedingt** dokumentiert ist
    („solange leer"); echtes Wissen entkam der Indexpflicht, indem es so heißt — die Ausnahme gilt
    jetzt nur, wenn die Datei der **einzige** Eintrag ihres Ordners ist. **(3)** Für
    `{{ABTEILUNG}}` in `ssot-grundgeruest.md.vorlage` berief sich der Aktualisierungs-Index auf
    die Invariante „Vorlage ist kein Plugin" — die deckt jetzt **beide** Vorlagendateien ab.
    Keine neue Testdatei, keine neue Testzahl: 93 Tests, weiterhin grün.
  - **Zusage „`kern-plugin-bau.md` trägt per `git mv` die Historie" zurückgenommen** (vier lebende
    Fundstellen). Git speichert kein Rename; die Zuordnung fällt inhaltsbasiert beim Lesen, und
    der größere Textanteil liegt in `abteilungs-plugin-bau.md` (43 %) — bei der Standardschwelle
    erkennt Git gar kein Rename. `git log --follow` auf die Kernhälfte liefert nur den
    Zweiteilungs-Commit. Die Stellen nennen jetzt den Weg, der die Vorgeschichte wirklich liefert
    (`git log --oneline` auf den alten Pfad); die Abweichung von AP1.1/E2 steht als
    **Plan-Nachtrag N4** im Bauplan. Kein History-Rewrite (rote Linie §7).
  - **Kern-Manifest:** `description` sagte „6 Skills", ausgeliefert werden **7**
    (`start`, `save-session`, `journal`, `setup`, `doku-sync`, `os-info`, `skill-builder` — so auch
    Registry, `AGENTS.md` und der neue `kern-plugin-bau.md` §1); das Team liest diesen Text im
    Installationsdialog. Korrigiert, kein zusätzlicher Bump nötig (0.7.0 ist Teil dieses Zyklus).
  — *Claude (Opus 5, Review-Agent)*

### Changed — AP10: Satelliten-Pin auf das Felix-Release

- **`nc-felix` von `v0.2.1` auf `v0.4.1` umgepinnt** — `ref: v0.4.1` plus Full-SHA
  `ed41f224a7451736ad1504f221c1c5b44e2ea20c`. Laut offizieller `plugin-marketplaces`-Doku ist bei
  gesetztem `ref` **und** `sha` der **`sha` der wirksame Pin**; der `ref` bleibt als lesbare
  Herkunft stehen. Die Vorbedingung aus AP10 ist erfüllt: Der Satellit ist am 2026-08-12 als
  **0.4.1** annotiert getaggt (`ed41f22`) und das Release ist erzeugt — Tag und Freigabe lagen wie
  vorgesehen beim Maintainer. **Ohne dieses Umpinnen hätte das Team weiterhin 0.2.1 installiert.**
- **Mitgezogen, wie der Aktualisierungs-Index für „Satellit aktualisiert" (Zeile 65) und
  „Satelliten-Hook/Gate geändert" (Zeile 71) verlangt:** Marketplace-Beschreibung auf den
  Ist-Stand (sieben Kernmodul-Skills inklusive `doku-sync`, Gate 1 **und** Gate 2 markerlos,
  eigene isolierte Wissensbasis) — das Team liest diesen Text im Installationsdialog;
  Registry-Statuszeile und Modul-Skillliste; `README.md`-Statuszeile auf v0.4.1;
  `AGENTS.md`-Produktstand (v0.7.0-Block, AP10); `NovaCore-OS-Gates-Definition.md`, wo der
  Satelliten-Abschnitt bisher „Biggi zusätzlich Gate 2" sagte — **beide** Satelliten tragen es
  jetzt. In `ONBOARDING.md` entfällt an **zwei** Stellen die Marker-Ausnahme des Felix-OS: sie
  behauptete, nur Felix trage noch den marker-gebundenen Begrüßungs-Hook an einer `.nc-os`-Datei
  — mit 0.4.1 ist Felix markerlos. Reiner Pin-Nachzug, deshalb **kein** Kern-Bump: Version und
  Release zählen im Satelliten-Repo. — *Claude (Opus 5)*

## [0.6.1] — 2026-08-11

Onsite-Align-Umbau nach dem Bauplan
`knowledge-base/grundwissen/2026-08-10-onsite-align-umbau-bauplan.md` (Arbeitspakete
AP1–AP8, Auftrag Maintainer 2026-08-10; Plan verfasst von Claude Fable 5, Umsetzung Claude
Opus 5). Vorbild: `Onsite.ai-OS` (Kern `oai` 0.11.1, main `f8cb0fb`, plus PR #22). Jede
Port-Datei wurde beim Bau frisch aus dem Vorbild gelesen. **Bewusst ausgeschlossen**
(Maintainer-Entscheid, nicht verhandelbar): die Queue-Logik/SSOT-Abstufung des Vorbilds
(Onsite-Spec §15.24) und **jeder Memory-Share zwischen Satelliten** — firmenintern
(`nc`, `nc-development`) und affiliate bleiben strikt getrennt. Plan-Nachtrag N1 (§6 des
Bauplans) dokumentiert die einzige Abweichung.

### Added

- **`/nc:setup` — SSOT-Provisionierung** (Bauplan
  `2026-08-10-ssot-provisionierung-bauplan.md`). Schließt eine Lücke, die der Doks-Autosync
  sonst zur aktiv irreführenden Anweisung gemacht hätte: Der Marketplace liefert **nur das
  Plugin** aus, die Wissensbasis liegt außerhalb von `plugins/nc/` und reist nicht mit — der
  Firmen-Block in der globalen `CLAUDE.md` verweist aber auf sie („vor Vermutungen dort
  triagieren"). Ohne lokale Kopie zeigte dieser Router ins Leere. Das Vorbild kennt dieselbe
  Lücke und nennt sie in seinem Folgeplan einen **Rollout-Blocker**.
  **Ein Skill, ein Befehl, ein Ergebnis:** idempotent — fehlt die Kopie, wird **voll**
  geklont; ist sie da, wird per **Fast-Forward** nachgezogen. Nie
  Merge, Rebase, Reset oder Force; eine lokal veränderte Kopie wird **gemeldet, nicht
  überschrieben**. Ablage `~/.nc/ssot/<repo-name>/` (Override `NC_SSOT_DIR`); die
  **Verlinkung ist der feste Pfad**, den der Firmen-Block in der globalen `CLAUDE.md` als
  Einstieg nennt. Arbeits-Repo und globale
  `CLAUDE.md` werden nie angefasst.
  **Registry-getrieben:** der Kern immer, dazu jede Abteilung, die `repository` **und** das
  neue optionale Feld `repoKnowledgePath` führt. Heute löst das auf „nur Kern" auf — bei den
  Satelliten `nc-felix`/`nc-biggi` **ist** das Repo das Plugin, ihr Wissen reist im Paket mit
  und aktualisiert sich über den Marketplace-Pin; dort gibt es nichts zu klonen. Das Feld ist
  der dokumentierte Andockpunkt für künftige Abteilungen, ohne Codeänderung.
  **`/nc:start` bleibt unverändert** (Maintainer-Weisung): Die Verbindung ist eine reine
  Abhängigkeit — `/nc:start` *braucht* die Wissensbasis, `/nc:setup` *liefert* sie. Bewusst
  keine automatische Frischeprüfung, kein Prüf-Modus, kein Frische-Fenster; der Skill wird
  von Hand aufgerufen.
  **Bekannte Grenze, offen benannt:** Das OS-Repo ist privat — ohne `git` und ohne Zugang
  bleibt die Wissensbasis unerreichbar. Der Skill sagt das dann klar, statt einen Erfolg
  vorzutäuschen (robuster für nicht-technische Nutzer wäre, die Wissensbasis ins
  Plugin-Paket auszuliefern; als Nachiteration im Bauplan §6 festgehalten).
  8 Tests gegen ein lokal erzeugtes `file://`-Repo — ohne Netz und ohne Zugangsdaten, damit
  sie auch in der CI eines Forks laufen. Sie fanden beim ersten Lauf **zwei echte Fehler**:
  (a) das Muster für „git fehlt" traf die harmlose git-Warnung „filtering **not recognized**
  by server" und meldete damit jeden git-Fehler — auch eine Divergenz — als fehlende
  Installation; ein fehlendes Binary wird jetzt strukturell über `error.code` erkannt.
  (b) Die Divergenz-Erkennung suchte „diverged", neuere git-Versionen sagen aber
  „**Diverging** branches can't be fast-forwarded". Suite: 82 → 90.
- **Gate 2 — Session-Start-Zwang (AP2), zweiteilig nach dem Zangen-Prinzip:** Ein Hook kann
  keinen Skill starten, nur blocken und injizieren — deshalb sagt
  `hooks/nc-session-start.js` (SessionStart) dem Agenten, was zu tun ist, und
  `hooks/nc-start-gate.js` (PreToolUse auf `Write|Edit|MultiEdit|NotebookEdit|Bash`) macht
  Nicht-Tun zur Sackgasse. Geöffnet wird über den **Fakten-Stempel**
  `hooks/nc-start-stempel.js`, der `--branch`/`--head` gegen `git rev-parse` verifiziert —
  wer stempeln will, muss die Git-Lage wirklich angesehen haben. Die Injektion ersetzt den
  bisherigen 99-Zeilen-Begrüßer und liefert den **lebenden Stand**: `VERSION`, Branch, die
  letzten fünf Commits, Working-Tree-Änderungen (`-c core.quotepath=false`, 2 s Timeout),
  den `[Unreleased]`-Kopf, die jüngsten fünf datierten Dateien aus
  `knowledge-base/grundwissen/` und die Abteilungen aus `module-registry.json`.
  Stempel-State liegt **env-unabhängig** in `os.tmpdir()/nc-start-gate` (Onsite-Lesson
  0.11.1: `CLAUDE_PLUGIN_DATA` divergiert zwischen Hook- und Bash-Prozess → Deadlock trotz
  Erfolgsmeldung); `NC_START_GATE_STATE_DIR` nur als Test-Override. Durchlässe: der
  Stempel-Befehl selbst, Read-only-Git, Subagenten. 30-Min-Verfall, 1-Min-Heartbeat,
  **ein** Opt-out `NC_START_GATE=off` für beide Teile. 21 neue Tests.
- **Doks-Autosync — CLAUDE-Ebene 1 (AP3):** `hooks/nc-doks-autosync.js` hält den
  Firmen-Block in `~/.claude/CLAUDE.md` auf dem Stand des installierten Kerns
  (Payload: `plugins/nc/doks/global-claude-firmenblock.md`). Marker-Chirurgie mit
  `<!-- NC:BLOCK:START/VERSION/ENDE global -->`: fehlt die Datei → anlegen · ohne Marker →
  Block oben, Bestand byte-identisch dahinter · identisch → No-op · abweichend → nur
  zwischen den Markern ersetzen · **defekte Marker → nichts schreiben** (lieber veraltet
  als zerstört). Die Privat-Zone außerhalb der Marker wird nie verändert; vor jedem
  Schreiben entsteht `<ziel>.nc-autosync-backup`. Kein externer State — der
  Versions-Kommentar im Block IST der Stempel. Opt-out `NC_AUTOSYNC=off`, Ziel-Override
  `NC_AUTOSYNC_TARGET` (die Tests laufen ausschließlich dagegen, nie gegen die reale
  globale CLAUDE.md). 10 neue Tests.
- **SSOT-Infrastruktur (AP4), ohne jede Queue-Mechanik:**
  `knowledge-base/SSOT-Document-Index.md` als Master-Index (Teil 1 Ordner-Routing, Teil 2
  Quellen-Triage „Relevant wenn …", inkl. Mapping-Tabelle zur flacheren
  NovaCore-Struktur) — **einzige Datei auf der Wurzelebene**, testerzwungen ·
  `standardprozesse/aktualisierungs-index.md` als Änderungs-Matrix („ich ändere X — was
  muss ich anfassen") mit Prüfzyklus und Selbsttest, bewusst auf die real vorhandenen
  Artefakte reduziert und ohne neue Spiegelstellen · drei Begriffsnormen in
  `grundwissen/`: **Gates-Definition** (Vier-Gates-Tabelle, Klarstellung „FFG 1–3 =
  Sub-Gates von Gate 1", drei Abgrenzungen), **SSOT-Definition** (mit dem Abschnitt
  „firmenintern vs. affiliate" **statt** der Onsite-Abstufung) und
  **CLAUDE-Ebenen-Definition** (Ebenen 0/1/2/3/3b mit ehrlichem Status).
- **Drei Kern-Infrapflege-Skills (AP5):** `/nc:doku-sync` (führt die
  AGENTS.md-Abschluss-Checkliste aus, Stempel `.git/nc/doku-sync.stamp`), `/nc:os-info`
  (erklärt das OS aus der **realen Installation**, inkl. Status aller drei Opt-out-Schalter
  und Koexistenz-Warnung bei parallel installierten Satelliten) und `/nc:skill-builder`.
  Nicht portiert: `firmenwissen-suche` (Atlassian-spezifisch) und die Platzhalter-Skills.
- **CI und Release (AP6):** `.github/workflows/ci.yml` (Ubuntu + Windows × Node 20/22/24,
  `fetch-tags: true`, Testaufruf wortgleich zur Checkliste, Validierung beider Ebenen,
  **Positivkontrolle** — ein absichtlich defekter Wegwerf-Skill muss den Validator rot
  machen, eine intakte Kontrollgruppe grün) und `.github/workflows/release.yml` (Auslöser
  `nc--v*`; vier hart scheiternde Vorbedingungen: annotierter Tag, Tag == Leitversion,
  grüne Suite, vorhandener CHANGELOG-Abschnitt). Actions per Full-SHA gepinnt.
- **Vier neue Struktur-Invarianten (AP6):** SSOT-Index-Vollständigkeit, Linkgültigkeit,
  Wurzel-Regel und die Release-Tag-Invariante (Schema `nc--vX.Y.Z`, Altform
  `novacoreai-os--v*` zählt mit).
- **Marketplace-Kategorie `affiliate` (AP7):** Eintrag `kimi-code-plugin-cc`
  (`ArchiDoxx/Kimi-code-Plugin-CC`, `ref: v1.4.0`, Commit-SHA
  `159cd9d059b5e2e918a0333693a59f3620fdf61a` — das annotierte Tag wurde per `gh api` auf
  den Commit dereferenziert). Affiliate-Plugins sind **keine Abteilungen**: keine
  Registry-Zeile, keine Kern-Dependency, kein Wissens-Share. Host-Anforderungen (`uv` +
  `kimi`-CLI) und die Lizenz (MIT) stehen in der Eintrags-Description, damit sie im
  Installationsdialog sichtbar sind.
- **ONBOARDING §1b — Kollegen-OS installieren:** Installationsweg der Satelliten
  (`nc-felix`, `nc-biggi`) inkl. Koexistenz-Regel und Marker-Unterschied (Biggi-OS
  markerlos, Opt-out `NC_START_GATE=off`); Abschnitt 2 um den Biggi-Hinweis ergänzt.
  Fund des Frische-Instanz-Reviews nach dem 0.5.0-Release: die Ersteinrichtungs-Doku
  kannte die Satelliten bis dahin nicht. — Agent: Claude (Opus 5)
- **ONBOARDING: WSL-Hinweis (§1a)** — WSL zählt als eigener Rechner (getrenntes Home,
  eigene Credentials, eigenes `~/.claude`): Installation und `/nc:setup` dort einmal
  separat ausführen; `NC_SSOT_DIR` nie auf `/mnt/c/…` legen. Eine eigene
  WSL-Spezifikation braucht es nicht — Skript und Pfade sind plattformneutral, die CI
  testet Ubuntu (Bauplan-Nachtrag N2). — Agent: Claude (Fable 5)

### Changed

- **Kern `nc` 0.6.0 → 0.6.1** (`VERSION` + Registry gespiegelt): Fix —
  Sparse-Relikt-Migration in `/nc:setup` plus WSL-Hinweis im ONBOARDING. Der Bump ist
  Pflicht, obwohl 0.6.0 nie getaggt wurde: Die Erstfassung ist im Feld installiert, und
  ohne Bump erreicht kein Fix ein installiertes Plugin (Bauplan-Nachtrag N2 revidiert
  AP5). — Agent: Claude (Fable 5)
- **Kern `nc` 0.5.0 → 0.6.0** (`VERSION` + Registry gespiegelt): Neuerung — Gate 2,
  Doks-Autosync, drei Skills.
- **FFG-Angleich (AP1), ohne Sicherheitsabbau:** Die Session-Schlüssel-Ableitung
  (`hashSessionKey`, `sanitizeSessionKey`, `resolveSessionKey`, `isSubagentInvocation`)
  wandert aus `nc-ffg.js` in die geteilte `hooks/lib/session-key.js` — Start-Gate, Stempel
  und Injektion müssen denselben Schlüssel ableiten, eine zweite Kopie wäre Drift-Risiko in
  Sicherheitscode. **Alle drei NovaCore-Review-Härtungen von 2026-07-28 bleiben unverändert
  erhalten** (voll verankerte Exempt-Globs statt Substring-Match; Case-Folding nur auf
  win32/darwin; Hash bei *jeder* Zeichen-Ersetzung statt nur bei Überlänge) — sie sind
  strenger als das Vorbild, „Onsite gewinnt" gilt für Struktur, nicht für Sicherheit.
- **`process.exit(0)` → `process.exitCode = 0`** in allen Hooks: `exit()` kann auf POSIX den
  gepufferten stdout-Write abschneiden — eine abgeschnittene Deny-JSON hieße, **das Gate
  blockt still nicht**.
- **Read-only-Git-Erkennung erweitert** (`hooks/lib/bash-analyse.js`): `git log -N` (der
  dokumentierte Pflicht-Einstieg `git log --oneline -10`) sowie `git rev-parse --short HEAD`
  und blankes `git rev-parse HEAD` (die Formen des Fakten-Stempels) gelten jetzt als
  lesend. Die Allowlist bleibt eng — mit Negativkontrolle abgesichert.
- **`/nc:start`:** Marker-Schritt entfernt, Fakten-Stempel als letzter Ablaufschritt
  ergänzt; die Regel „rein lesend" ist auf die ephemere Stempeldatei präzisiert.
- **`hooks.json`:** zwei PreToolUse-Blöcke (FFG und Start-Gate mit eigenen Matchern),
  SessionStart mit Injektion + Autosync, überall `timeout: 10`; das `description`-Feld
  trägt jetzt den Prosa-Zustand der **gesamten** Kontroll-Schicht inklusive aller Opt-outs.
- **Doku nachgezogen:** `AGENTS.md` (Pflicht-Einstieg um Index-Triage erweitert, Repo-Karte,
  Glossar, Produktstand, Sync-Matrix um Hook- und Wissensdatei-Zeilen), `README.md`
  (Skill-Tabelle, Kontroll-Schicht-Tabelle, Affiliate-Abschnitt), `ONBOARDING.md`
  (markerloses Setup, Gate-Tabelle, Troubleshooting).

### Fixed

- **`/nc:setup` heilt jetzt Sparse-Relikte der Erstfassung** (Feldbefund 2026-08-11: ein
  Teammitglied behielt nach dem Setup einen Klon, in dem außer `knowledge-base/` fast
  nichts lag). Der Vollklon-Fix aus PR #13 stellte nur den **Erstlauf** um — traf der Lauf
  auf eine bestehende Kopie, gab es nur `pull --ff-only`: `core.sparseCheckout` blieb
  stehen, die Kopie blieb amputiert, und das Skript meldete trotzdem „aktualisiert", weil
  der Wissenspfad-Check im Sparse-Ausschnitt besteht — ein stiller Falscherfolg. Jetzt wird
  ein Sparse-Relikt vor dem Pull per `git sparse-checkout disable` erweitert
  (offizielle git-Doku, abgerufen 2026-08-11: deaktiviert den Schalter und stellt den
  vollen Working Tree wieder her) und im Ergebnis explizit gemeldet — erweitert wird der
  **Arbeitsbaum**; der Partial-Clone-Filter bleibt, Alt-Historie lädt bei Bedarf lazy nach.
  **Review-Iteration (Opus-Review: 0×CRITICAL/HIGH; beide MEDIUM eingearbeitet):** Eine
  lokal **veränderte** Sparse-Kopie wird weiterhin nie angefasst, kommt jetzt aber als
  `lokal-veraendert` **samt Sparse-Hinweis** zurück — vorher blieb genau dieser Fall still
  amputiert; Doku-Zusagen entsprechend präzisiert. Migrations-Meldung testgesichert. Die
  Sparse-Erkennung liest bewusst den `--worktree`-Scope: moderne gits legen den Schalter
  per `extensions.worktreeConfig` in der Worktree-Config ab, die `--local` nicht liest;
  ungescoped hätte ein global gesetztes `core.sparseCheckout` jeden Vollklon als Relikt
  gemeldet (git-Doku + git 2.52 verifiziert). Migrations-Info überlebt einen nachfolgenden
  Pull-Fehler; das Test-Origin erlaubt den Filter (`uploadpack.allowFilter`), damit der
  echte Lazy-Fetch-Pfad geübt wird; Ausgabe-Spalte für `lokal-veraendert` entklemmt.
  Zwei Regressionstests stellen Relikt und Relikt-mit-unversicherter-Arbeit exakt nach
  (Suite: 90 → 92). Bauplan-Nachtrag N2. — Agent: Claude (Fable 5)
- **`/nc:setup` nach dem Livetest korrigiert** (PR #13, Review-Iteration Kimi Code). Zwei
  Fehler der Erstfassung: (a) **„Verlinken" war gar nicht gebaut** — der Zeiger `index.json`
  wurde geschrieben, aber von niemandem gelesen, und alle SSOT-Verweise sind relative Pfade,
  die im Klon nicht auflösen. Die Verlinkung ist jetzt der **feste Pfad plus Firmen-Block**:
  Der Klon liegt deterministisch unter `~/.nc/ssot/<repo-name>/`, und
  `doks/global-claude-firmenblock.md` nennt genau diesen Pfad als Einstieg. (b) **Der
  Sparse-Klon schnitt `plugins/` weg** — genau das, worauf `doku-sync` mit
  `referenz/skill-authoring.md` verweist — und sparte dafür 445 KB. Jetzt **voller Klon**;
  der Regressionstest verlangt, dass Repo-Inhalt außerhalb der Wissensbasis mit ankommt.
  Doku-Spiegel (SKILL-Description, ONBOARDING, README, Bauplan-Nachtrag N1) nachgezogen.
- **Review-Härtungen an Gate 2 und am Autosync** (adversariales Review von PR #10; Details
  und Begründung: Bauplan §6, Nachtrag N2). Zwei davon machen NovaCore **strenger als das
  Vorbild** — dieselbe Linie wie bei den FFG-Härtungen: „Onsite gewinnt für Struktur, nicht
  für Sicherheitsabbau".
  - **Der Fakten-Stempel verifizierte nichts, wenn er aus einem Nicht-Git-Verzeichnis lief**
    (reproduziert): `git rev-parse` schlug fehl, der Prüfblock wurde übersprungen, der
    Stempel wurde gesetzt — und öffnete das Gate für das **echte** Repo. Ein `cd` genügte.
    Jetzt löst der Stempel gegen das **Projektverzeichnis** auf (`CLAUDE_PROJECT_DIR`, sonst
    cwd) und schreibt ein Feld `verified`; das Gate akzeptiert einen unverifizierten Stempel
    nur, wenn auch die gegatete Aktion in keinem Git-Baum läuft. Der legitime
    „außerhalb-von-Git"-Fall bleibt, der Trick nicht.
  - **Der Stempel-Durchlass matchte per Substring** (reproduziert):
    `echo x > /tmp/y # nc-start-stempel.js` passierte Gate 2. Jetzt wird eine **echte,
    verankerte, einzeilige Invokation genau dieses Skripts durch genau `node`** verlangt.
    Der Weg dahin brauchte drei Review-Runden, weil jeder Zwischenstand noch eine Lücke
    ließ — der Reihe nach geschlossen: angehängte Zweitaktionen (`;`, `&&`, `|`, `>`, `#`,
    `$(…)`) · **Zeilenumbruch als Kommandotrenner** (`\n`/`\r`; die zweite Zeile durfte
    beliebiger Code sein und über einen handgeschriebenen `verified: true`-Stempel fiel
    damit auch die H1-Härtung) · **Skript-Identität statt Namenssuffix** (`path.resolve`
    gegen das echte Skript, plus Realpath-Vergleich; vorher war jede
    `*nc-start-stempel.js` an beliebigem Ort ein Kanal) · **Interpreter-Identität statt
    Namensmuster** (Basisname muss `node`/`node.exe` sein; vorher genügte ein gequoteter
    Pfad, der „node" nur *enthielt* — womit in jedem Repo mit `node_modules` jede Datei
    unter `node_modules/.bin` als Interpreter durchging).
  - **Der Autosync schrieb nicht atomar und überschrieb sein einziges Backup.** Zwei
    gleichzeitig startende Sessions konnten die Privat-Zone dauerhaft kürzen. Jetzt
    Temp-Datei + `rename`, und eine intakte Sicherung wird nie durch einen markerlosen
    Torso ersetzt.
  - **Zwei Testsuites waren nicht hermetisch:** Sie erbten `NC_AUTOSYNC`/`NC_START_GATE` aus
    der Umgebung — auf einer Maschine mit dem dokumentierten Opt-out fielen **16 von 77**
    Tests um, obwohl am Code nichts falsch war. Beide filtern die Schalter jetzt heraus.
  - **Die Release-Tag-Invariante wurde still grün**, wenn die Tagliste leer war (Fork,
    Checkout ohne `fetch-tags`). Sie unterscheidet jetzt „kein Repo" von „Repo ohne Tags"
    und schlägt im zweiten Fall fehl.
  - Fünf Regressionstests stellen die reproduzierten Umgehungen nach (Suite: 77 → 82).
- **Tag-Lücke geschlossen:** Die neue Release-Tag-Invariante deckte auf, dass die
  veröffentlichten Stände **0.3.0 und 0.4.0 nie getaggt** wurden. Beide Tags sind
  nachgesetzt — annotiert, mit Begründung im Tag-Text, nach der Konvention von `nc--v0.5.0`
  auf die integrierenden Merge-Commits (`nc--v0.3.0` → `ef9f263`, PR #3; `nc--v0.4.0` →
  `37047f2`, PR #4; Versionsstand dort gegen `VERSION` **und** `plugin.json` geprüft). Die
  Invariante gilt damit **ohne Ausnahme**; ein GitHub-Release entsteht nicht, weil
  `release.yml` an diesen alten Commits nicht existiert. Details: Bauplan §6, Nachtrag N1.

### Removed

- **Der `.nc-os`-Marker hat keine Funktion mehr.** Er scopte bisher den
  Session-Start-*Hinweis*; mit Gate 2 entfällt er ersatzlos — ein Gate, das man vergessen
  kann, ist kein Gate. Bestehende Marker-Dateien stören nicht und können gelöscht werden;
  das Felix-OS trägt den alten Hook weiterhin (dort dokumentiert). Die Export-API von
  `nc-session-start.js` (`buildSessionStartResponse`, `hasNcOsMarker`, `readOsVersion`)
  entfällt damit ebenfalls — der Hook ist reiner Entrypoint.

### Known / offen

- **`mcp__*`-Werkzeuge laufen nicht durch das FFG** — der Matcher deckt sie nicht ab. Für
  lokale Plugins fängt das eine schlafende Invariante ab; externe Affiliate-Plugins (wie
  `kimi-code-plugin-cc`, das einen MCP-Server mitbringt) lösen sie bewusst **nicht** aus.
  Dokumentierte bekannte Grenze, kein stiller Zustand.
- **`NotebookEdit` läuft nicht durch das FFG:** Gate 2 gated es (Matcher
  `Write|Edit|MultiEdit|NotebookEdit|Bash`), Gate 1 nicht (`Write|Edit|MultiEdit|Bash`). Ein
  Notebook-Schreibvorgang verlangt also den erledigten Session-Start, aber keine Fakten je
  Zieldatei. Aus dem Vorbild übernommen und hier bewusst nicht stillschweigend geändert —
  eine Matcher-Angleichung ist eine eigene Entscheidung mit eigenem Test.
- **Der Stempel-Durchlass des Start-Gates bleibt eine Proxy-Grenze:** Wer den Stempel-Befehl
  ausführt, ohne `/nc:start` inhaltlich durchlaufen zu haben, umgeht Gate 2 so bewusst wie
  per `NC_START_GATE=off`. Deterministisch prüfbar ist nur die Git-Lage — und die wird
  geprüft.
- **`mneme-kimi-code` ist vorbereitet, aber nicht eingetragen:** Die Konvertierung zum
  Claude-Code-Plugin liegt lokal bereit (`.claude-plugin/plugin.json`, `hooks/hooks.json`
  mit allen sieben Events inkl. `PostToolUseFailure`, `.mcp.json` für den FastMCP-Server;
  `claude plugin validate --strict` grün). Der Marketplace-Eintrag ist **blockiert bis
  Push + Tag im ArchiDoxx-Repo** — ein Eintrag ohne Tag würde Installs brechen.

*Beitrag: Claude (Opus 5, Claude Code), 2026-08-10 — Umsetzung des Onsite-Align-Umbaus
AP1–AP8 auf Weisung Lucas Vöhringer; Plan und Abnahmemaßstab: Claude Fable 5.*

## [0.5.0] — 2026-08-05

Dritte Abteilung `biggi` angelegt — als **zweites eigenständiges Kollegen-OS** im
Satelliten-Repo `NovaCore-AI/Biggi-OS` (Auftrag Maintainer 2026-08-05, Muster Felix-OS;
Architektur-Leitlinie laut Auftrag: bei Unterschieden zwischen NovaCore- und Onsite-Vorbild
gewinnt Onsite). Der mit Felix pilotierte Ablauf ist jetzt als `plugin-bau.md` **§3b**
formalisiert — die §3b-Verweise aus Felix-CHANGELOG/-AGENTS liefen bisher ins Leere
(Doku-Drift behoben). Spec-Nachtrag:
`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`, §11.

### Added

- **Abteilungsplugin `nc-biggi` 0.1.0 (Satellit, eigenständig):** eigenes privates Repo
  `NovaCore-AI/Biggi-OS` — das Repo IST das Plugin. **Kernmodul** ohne Präfix mit 6 Skills
  (Ports aus dem Felix-OS, auf das markerlose Modell umgestellt), **Kontroll-Schicht als
  Synthese beider Vorbilder**: FFG mit den Felix-Review-Härtungen (verankerte Exempt-Globs,
  Session-Key-Hashing, plattformbewusstes Case-Folding) plus Onsite-`exitCode`-Fix;
  **Session-Start-Zwang** als Onsite-Port (Injektion, markerlos, Opt-out
  `NC_START_GATE=off`). Arbeitsmodul-Konvention reserviert (nicht auf Vollständigkeit
  angelegt): `controlling` (`ctrl`), `medizinisches` (`mdzn`), `dokumentation-daily-work`
  (`doc` + `day` — ein Modul, zwei Präfixe; Registry-Schema mit `praefixe`-Arrays,
  Platzhalter-Ordner je Präfix). 45 Tests grün; CI `ci.yml` (Ubuntu+Windows × Node
  20/22/24, Validator-Positivkontrolle) und `release.yml` (Tag↔Manifest-Abgleich,
  Release-Notes aus dem CHANGELOG) nach Onsite-Standard. Extern reviewt (K3/Kimi) vor dem
  ersten Push; ausgeliefert als 0.1.1 (0.1.0 + BOM-Literal-Patch, Details im
  Satelliten-CHANGELOG).
- **Marketplace-Eintrag `nc-biggi`:** GitHub-Source mit Commit-SHA-Pin (`ref: v0.1.1`);
  kein `version`-Feld im Eintrag — die Version lebt allein in dessen `plugin.json`.
- **Registry:** Abteilung `biggi` (`repository` + satelliten-relatives
  `repoSkillsPath: "skills"`; Modul-SSOT liegt im Satelliten selbst).
- **`plugin-bau.md` §3b:** pilotierter Standardablauf „eigenständiges Kollegen-OS als
  Satellit" ausformuliert — inkl. der vier verifizierten Install-Fallen und des
  CI-/Release-Standards für Satelliten.

### Changed

- **Kern `nc` 0.4.0 → 0.5.0** (`VERSION` + Registry gespiegelt): Registry-Erweiterung um
  die Abteilung `biggi`.
- **Felix-OS-Release-Hygiene nachgezogen:** annotierte Tags `v0.2.0`/`v0.2.1` und
  GitHub-Releases im Satelliten erzeugt — der Marketplace-`ref: v0.2.0` zeigte bisher auf
  einen nicht existierenden Tag (nur der SHA trug); Eintrag `nc-felix` auf `v0.2.1`
  umgepinnt (realer Stand inkl. Repository-URL-Fix). — Agent: Claude (Opus 5)

## [0.4.0] — 2026-07-28

Zweite Abteilung `felix` angelegt — als **erster Satellit** des NovaCore-OS (Muster
`knowledge-base/standardprozesse/plugin-bau.md` §3a, Onsite.ai-OS-erprobt) und auf
Maintainer-Entscheidung als **eigenständiges Felix-OS**: Module statt Abteilungen, keine
Kern-Dependency. Spec-Nachtrag:
`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`, §10.

### Added

- **Abteilungsplugin `nc-felix` 0.2.0 (Satellit, eigenständig):** eigenes privates Repo
  `NovaCore-AI/Felix-OS` — das Repo IST das Plugin (Manifest an der Wurzel).
  **Kernmodul** ohne Präfix mit 6 Skills (`start`, `save-session`, `journal` als angepasste
  Ports der Kern-Skills; `os-info`, `skill-builder` nach Onsite-Vorbild; `code-tour`
  Neubau), **eigene Kontroll-Schicht** (FFG verbatim-Port + angepasster SessionStart-Hook,
  Env-Schalter `NC_FFG*` unverändert), geteilte Anweisung `felix-sync.md`, `wp-rahmen.md`,
  eigene `module-registry.json`, `referenz/skill-authoring.md`; FFG-/Struktur-/
  Frontmatter-Tests (36 grün), CI mit SHA-gepinnten Actions. **Keine Kern-Dependency** —
  nicht parallel zu `nc` betreiben (doppelte Gates).
- **Marketplace-Eintrag `nc-felix`:** GitHub-Source mit Commit-SHA-Pin
  (`dc6f6b98edec2d2c2de44fe2573b30043e3aeaf6`, `ref: v0.2.0`); der Pin greift, sobald der
  Satellit mit exakt diesem Commit gepusht und getaggt ist (kein Squash/Rebase beim Merge).
  Kein `version`-Feld im Eintrag — die Version lebt allein in dessen `plugin.json`.
- **Registry:** Abteilung `felix` (`repository` + satelliten-relatives
  `repoSkillsPath: "skills"`; Modul-SSOT liegt im Satelliten selbst).

### Changed

- **Kern `nc` 0.3.0 → 0.4.0** (`VERSION` + Registry gespiegelt): Registry-Erweiterung um
  die Abteilung `felix` — ohne Bump erhielte das Team die aktualisierte Registry nie per
  Auto-Update.
- **`plugin-bau.md` §1:** dokumentierte Ausnahme von der Kern-Dependency-Pflicht für
  eigenständige Abteilungs-OS in Satelliten-Repos; **§3b neu:** pilotierter Standardablauf
  „eigenständiges Abteilungs-OS direkt als Satellit" inkl. der real getroffenen Fallen
  (Repo-Name = reale Heimat, kein `type: module` bei CommonJS-Hooks, SSH-Falle,
  Plugin-Repo ≠ Marketplace). — Agent: Claude (Fable 5)

## [0.3.0] — 2026-07-28

Multi-Plugin-Umbau: Aus dem Single-Root-Plugin `novacoreai-os` wird die Plugin-Familie des
NovaCore-OS — Marketplace `novacore-os` mit Kern `nc` (0.3.0) und Abteilung
`nc-development` (0.1.0). Architektur-Übertrag aus der produktiv erprobten
Onsite.ai-Ausprägung derselben Produktvision; verbindliche Grundlage:
`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`.

### Added

- **Marketplace `novacore-os`:** Repo-Wurzel ist nur noch Marketplace-Wurzel; zwei
  Einträge (`nc`, `nc-development`), bewusst **ohne** `version`-Feld (Doku
  plugin-marketplaces: der `plugin.json`-Wert gewinnt „without warning").
- **Kern-Plugin `nc` (Namespace `/nc:`):** Skills `start`, `save-session`, `journal`;
  `wp-rahmen.md` (Pflicht-Zyklus WP0–WP8 mit roten Linien — Einlösung des
  Vision-Punkts „für NovaCore AI noch zu definieren"); `module-registry.json`
  (Metadaten-SSOT Abteilung → Plugin → Module → Skills); `referenz/skill-authoring.md`
  (verbindliche Formatregeln, mit ausgeliefert); `nc-sync.md` (aus der Repo-Wurzel in den
  Kern gezogen und auf die neue Architektur aktualisiert).
- **FFG v2 — Fact-Forcing-Gate** (`hooks/nc-ffg.js` + `hooks/lib/bash-analyse.js` +
  `hooks/lib/shell-substitution.js`), Port des Onsite-FFG nach GateGuard-Vorbild:
  Datei-Gate je Zieldatei (getrennte Edit-/Write-Texte, Subagenten übersprungen,
  `.claude/settings*.json` ausgenommen, Ausnahmen per `NC_FFG_EXEMPT_GLOBS`,
  Volltext-Budget `NC_FFG_FULL_DENIALS`), Destruktiv-Gate je Kommando (rm -rf,
  git push --force / reset --hard / clean -f / checkout -- / commit --amend, drop table,
  dd, find -exec, sh -c-Wrapper; quote-aware, Newline-Trenner — GHSA-4v57-ph3x-gf55;
  Zusatzmuster `NC_FFG_EXTRA_DESTRUCTIVE`), Routine-Bash einmal je Session,
  Read-only-Git nie. **Markerlos aktiv**, Opt-out nur per Env `NC_FFG=off`; fail-open.
- **Abteilungsplugin `nc-development`** (Namespace `/nc-development:`,
  `dependencies: ["nc"]` → Kern kommt transitiv): 11 Skills in 4 Modulen — `flc`
  (4 migrierte Lifecycle-Skills), `wzs` (5 migrierte WZS-Skills), `fe`/`be` (neu:
  `fe-review`, `be-review` — WP6-Diff-Reviews mit Severity-Schema, Entwurf statt Post);
  `workflow.md` (WP1–WP7 auf GitHub-Flow, Rote-Linien-Ownership, Trigger-Matrix).
- **Testsuite `plugins/nc/tests/`:** 26 Hook-Tests (FFG-Suite + Session-Start inkl.
  Regressionstest für den 0.1.1-Marker-Verzeichnis-Bug) + Struktur-Invarianten
  (Marketplace↔Platte, kein `version` im Marketplace, Dependencies-Topologie, Hooks nur
  im Kern, `CLAUDE_PLUGIN_ROOT`-Pflicht, MCP-Wächter, Frontmatter-/YAML-Falle,
  Plugin-Grenze, Leitversions-Gleichstand, Registry-Konsistenz, Vorlagen-Hygiene).
- **Vorlage `vorlagen/abteilungsplugin/`** (kein Plugin, `.vorlage`-Endungen) für künftige
  Abteilungen.
- **Wissensbasis `knowledge-base/`:** `grundwissen/` (Produktvision
  `NovaCore-OS-Produktarchitektur.md` ins Heimat-Repo übernommen; Design-Spec und
  Umbau-Plan 2026-07-28), `standardprozesse/` (`plugin-bau.md`, `os-bau-methode.md` —
  die wiederverwendbare, an die Firmenphilosophie anpassbare OS-Bau-Methode),
  `debugging-findings/` (`agent-learnings.md`, append-only Fehlerprotokoll).
- **`AGENTS.md`** als normative Einstiegs-Doku (Pflicht-Einstieg, Repo-Karte, Glossar,
  Standardzyklus mit Abschluss-Checkliste, Sync-Matrix).

### Changed

- **Namespaces:** `/nc:start` statt `/novacoreai-os:nc-start`; Abteilungs-Skills unter
  `/nc-development:<modul>-<name>` (Verzeichnisnamen ohne redundantes `nc-`-Präfix).
- **Session-Start-Hook:** liest die Version aus der `plugin.json` des eigenen Plugins
  statt `../VERSION` (Pfad existiert im Plugin-Cache nicht); Marker-Prüfung
  (`stat.isFile()`) in den Hook gezogen; bleibt bewusst Marker-gebunden (Komfort,
  kein Gate).
- **Versionsmodell:** je Plugin genau eine Versionsquelle (`plugin.json`); `VERSION` +
  Registry spiegeln nur den Kern; `package.json` trägt keine Version mehr — die frühere
  Vier-Dateien-Gleichstand-Regel ist aufgehoben.
- **README/ONBOARDING** vollständig auf Marketplace-Installation, Migration von v0.2.0
  und die neue Architektur umgestellt.
- **Review-Härtungen gegenüber dem Vorbild-FFG** (externes Kimi-Review, 2 MAJOR + Hinweise):
  Exempt-Globs voll verankert und case-gefoldet — kein Substring-Bypass mehr (`*.md`
  exemptete zuvor auch `foo.md.bak` und `x.md/evil.js`; Regressionstest ergänzt);
  Datei-Gate-Key wird nur auf case-insensitiven Plattformen (win32/darwin) gefoldet
  (Linux: getrennte Gates für `Foo.md`/`foo.md`); Session-Key-Sanitisierung hasht bei
  jeder Zeichen-Ersetzung (keine Key-Kollision `a/b` ↔ `a_b`). Fail-open bei
  unbeschreibbarem State und der konditionale MCP-Wächter-Test bleiben dokumentierte
  Design-Entscheidungen. Die drei gehärteten Muster stammen 1:1 aus dem Vorbild —
  Backport-Kandidat für das Onsite.ai-OS.

### Fixed

- **Alle fünf WZS-Skills hatten nicht parsende Frontmatter** (`name` mit Doppelpunkt
  `nc:wzs-…` — unzulässige Zeichen — und `description` als Plain-Scalar mit „Quelle: ").
  Sie luden laut Validator „with empty metadata" und konnten **nie automatisch
  triggern**. Durch die Migration behoben; die Struktur-Tests verhindern die
  Wiederholung mechanisch.

### Removed

- **Eigene CLI-/Deploy-Infrastruktur ersatzlos:** `ncos.js`, `setup.js`/`.sh`/`.ps1`,
  `update.js`/`.sh`/`.ps1`, `install-cli.sh`/`.ps1`, Deploy-Manifest-Mechanik
  (`~/.nc-os/plugin`) — Verteilung und Updates laufen ausschließlich über den
  Marketplace.
- Skills `nc-setup`/`nc-update` (Aufgabe übernimmt die Marketplace-Mechanik; Migration
  in ONBOARDING dokumentiert).
- `hooks/nc-safety-gate.js` — im Destruktiv-Gate des FFG aufgegangen (deny statt ask,
  markerlos, breitere Erkennung); die Vision-Schicht „Safety-Gate" ist damit erfüllt,
  nicht gestrichen.
- Alte Testsuiten `setup-wiring`/`safety-gate`/`plugin-manifest` (ersetzt durch Hook- und
  Struktur-Tests) sowie das Root-Plugin-Manifest `.claude-plugin/plugin.json`.

*Beitrag: Claude (Fable), Nachtschicht 2026-07-28 — Umsetzung mit drei Subagenten
(FFG-Port, Kern-Inhalte, Abteilung development); zur Abnahme als PR vorgelegt.*

## [0.2.0] — 2026-07-12

Offizieller Plugin-Release: NovaCoreAI-OS ist jetzt ein Claude-Code-Plugin
nach offiziellem Schema (analog zum Vorbild `Kimi-code-Plugin-CC`).

### Changed

- **Offizielles Plugin-Manifest:** `.claude-plugin/plugin.json` trägt jetzt
  `$schema`, `repository` und `license` — das Format, das Claude Code für
  `/plugin marketplace add` + `/plugin install` erwartet. Das Plugin lässt
  sich jetzt direkt aus dem Repo-Root installieren, ohne den Umweg über das
  Staging-Verzeichnis.
- **Offizielles Marketplace-Manifest:** `.claude-plugin/marketplace.json`
  trägt `$schema` und eine vollständige Beschreibung — Schema-konform zum
  Claude-Code-Marketplace-Format.
- **Direkte Plugin-Installation:** Neue Installationsvariante
  (`/plugin marketplace add ./` + `/plugin install novacoreai-os@novacoreai`)
  neben dem bestehenden `setup.sh`-Weg.
- Versionsbump 0.1.1 → 0.2.0 ( konsistent über `VERSION`, `plugin.json`,
  `package.json`, `modules/module-registry.json`).

### Added

- **Plugin-Manifest-Tests:** Schema-Konformitäts-Checks für `plugin.json`
  (`$schema`, `repository`, `license`, `author.name`) und `marketplace.json`
  (`$schema`, `owner.name`, Plugin-Source).

### Docs

- README um den offiziellen Plugin-Status und die direkte
  `/plugin install`-Variante ergänzt.
- ONBOARDING um Variante A (offizielles Plugin) ergänzt.
- AGENTS.md um die marketplace.json im Pfad-Überblick ergänzt.

## [0.1.1] — 2026-07-08

Bugfix-Release: Plugin lud in Claude Code teils nicht bzw. das Safety-Gate
griff außerhalb markierter Repos.

### Fixed

- **Duplicate-Hooks-Manifest:** `.claude-plugin/plugin.json` deklarierte
  zusätzlich zum automatisch erkannten `hooks/hooks.json` ein eigenes
  `"hooks"`-Feld — führte bei Claude Code zu `failed to load: Duplicate
  hooks file`. Feld entfernt; Hooks werden ausschließlich über die
  Konvention `hooks/hooks.json` geladen.
- **Marker-Kollision mit `~/.nc-os`:** `nc-safety-gate` prüfte nur
  `fs.existsSync('.nc-os')`, ohne zu verifizieren, dass der Marker eine
  **Datei** ist (`touch .nc-os`, siehe ONBOARDING). Das vom Setup angelegte
  Staging-**Verzeichnis** `~/.nc-os/` zählte dadurch selbst als Marker und
  aktivierte das Gate in jedem Repo unterhalb des Home-Verzeichnisses statt
  nur in explizit markierten Repos. Fix: Marker muss laut `fs.statSync(...)`
  eine reguläre Datei sein.

### Docs

- Root-`README.md` ergänzt — die bisherige README lag nur unter
  `NovaCoreAI-OS/` und wurde von GitHub auf der Repo-Startseite nicht
  gerendert.
- Windows/PowerShell-Ablauf für Setup, CLI-Install und Update dokumentiert.

## [0.1.0] — 2026-07-07

Initialer MVP-Release.

### Added

- Core-Skills im Namespace `nc:`: `nc-start`, `nc-save-session`,
  `nc-journal`, `nc-setup`, `nc-update`.
- Hooks: `nc-session-start` (SessionStart-Begrüßung), `nc-safety-gate`
  (PreToolUse-Faktenpflicht vor destruktiven Bash-Befehlen) — beide
  Repo-scoped über den `.nc-os`-Marker, außerhalb markierter Repos No-Op.
- Modul-System (`modules/module-registry.json`, `minCoreVersion`-Gating):
  `feature-lifecycle` (`nc-feature-start`, `nc-plan`, `nc-commit-prep`,
  `nc-pr`) und `empfehlungssystem-wzs` (`nc-wzs-attribution`,
  `nc-wzs-blocker-gate`, `nc-wzs-reward-guard`, `nc-wzs-share-invariant`,
  `nc-wzs-webhook-contract`) aktiviert; `review-quality`, `architecture`,
  `incident-support` als deaktivierte Platzhalter.
- Setup/Update-Tooling (`setup.js`, `update.js` + `.sh`/`.ps1`-Wrapper):
  staged nach `~/.nc-os/plugin/`, registriert das Plugin bei Claude Code
  (`claude plugin marketplace add` + `claude plugin install
  novacoreai-os@novacoreai`), räumt verwaiste Dateien anhand eines
  Deploy-Manifests auf.
- Test-Suite (`node --test`): Plugin-Manifest-Konsistenz, Safety-Gate,
  Setup-Wiring.
