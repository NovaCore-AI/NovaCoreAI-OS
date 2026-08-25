# Abteilungs-Plugin-Bau — Standardprozess für Agenten

> **Verbindlich** für jedes Anlegen, Füllen oder Umbauen eines **Abteilungsplugins** in diesem
> Repo oder in einem **Satelliten-Repo**. Den Bau und die Pflege des **Kern-Plugins** regelt
> daneben [`kern-plugin-bau.md`](kern-plugin-bau.md); wer welche Struktur trägt, steht dort in
> der Governance-Tabelle §1a. Ergänzt `skill-authoring.md` (liegt im Kern-Plugin unter
> `plugins/nc/referenz/skill-authoring.md`), das das **SKILL.md-Format** regelt — hier geht es um
> die **Plugin- und Marketplace-Ebene**. Die Wissens-Seite eines Satelliten regelt
> [`ssot-aufbau.md`](ssot-aufbau.md) §4 samt Vorlage
> `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage`.
>
> Alle Mechanik-Aussagen sind gegen die offizielle Claude-Code-Doku verifiziert
> (`plugin-marketplaces` zuletzt **2026-08-11**, `plugins-reference`/`skills` **2026-07-28**).
> Vor Format-Änderungen erneut abrufen — nie aus dem Gedächtnis.
> *(Bis 2026-08-11 war dieser Stoff Teil der gemeinsamen Datei `plugin-bau.md`; die Zweiteilung
> folgt Entscheid E2 des Bauplans 2026-08-11.)*

## 1. Architektur, die du nicht verletzen darfst

Ein Marketplace (`novacore-os`), Plugins aus dem OS-Repo **plus** Satelliten-Repos:

```
NovaCoreAI-OS/                       = Marketplace-Wurzel (enthält .claude-plugin/)
  .claude-plugin/marketplace.json    ein Eintrag je Plugin: source "./plugins/<name>" (lokal)
                                     oder github-Source mit ref + sha-Pin (Satellit)
  plugins/nc/                        Kern: skills/ hooks/ tests/ wp-rahmen.md
                                     module-registry.json referenz/ doks/ (inkl. nc-teamsync.md)
  plugins/nc-development/            Dev-Abteilung (Kernheimat): skills/ workflow.md README.md
  knowledge-base/                    Wissensbasis des OS-Repos — wird NICHT ausgeliefert (§1a)
    standardprozesse/vorlagen/abteilungsplugin/
                                     Vorlage für neue Abteilungen (kein Plugin) —
                                     inkl. ssot-grundgeruest.md.vorlage für Satelliten

NovaCore-AI/<Name>-OS                    je ein PRIVATES Satelliten-Repo (Felix-OS, Biggi-OS)
  .claude-plugin/plugin.json             das Repo IST das Plugin (Manifest an der Wurzel);
  README.md CHANGELOG.md test/           Release-Tag + 40-stelliger SHA-Pin im Marketplace
  knowledge-base/                        eigene, isolierte Wissensbasis des Satelliten
```

- **Ein Plugin je Abteilung.** Die Plugin-Grenze **ist** die Abteilungsgrenze: Das Plugin-System
  kennt keinen Per-Skill-Schalter, Aktivierung läuft ausschließlich je Plugin.
- **Jedes repo-interne Abteilungsplugin führt `dependencies: ["nc"]`.** Installieren oder
  Aktivieren zieht den Kern automatisch mit; Deaktivieren des Kerns wird blockiert, solange eine
  Abteilung aktiv ist. Damit ist die ständige Abteilung technisch erzwungen.
  **Ausnahme (Maintainer-Entscheidung 2026-07-28):** Eigenständige Abteilungs-OS in
  Satelliten-Repos (`nc-felix`, `nc-biggi`) führen **keine** Kern-Dependency — sie bringen
  Kernmodul und Kontroll-Schicht selbst mit und werden nicht parallel zum Kern betrieben (sonst
  doppelte Gates). Ablauf für diesen Fall: §3b.
- **Hooks nur im Kern — für repo-interne Abteilungen.** Ein Abteilungsplugin im OS-Repo bringt
  keine Hooks mit, sonst feuert die Kontroll-Schicht mehrfach (testerzwungen in
  `struktur.test.mjs`). Ein **eigenständiger Satellit** trägt seine eigene Kopie, weil er
  Kern-Hooks technisch nicht erreichen kann — die Ausnahme ist in der Governance-Tabelle
  `kern-plugin-bau.md` §1a dokumentiert und gilt nur dort.
- **Ein eigenständiger Satellit führt eine eigene Wissensbasis** nach
  `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` — eigener Master-Index, zwei
  append-only-Protokolle, eigener mechanischer Wächter, gepflegt von seinen **eigenen** Hooks und
  Skills. Sie ist **terminal**: kein Weg zurück in Kerndokumente, keine Queue, keine Promotion
  (`ssot-aufbau.md` §4). Repo-interne Abteilungen bekommen **keine** eigene Wissensbasis — für
  sie ist die Wissensbasis des OS-Repos zuständig.
- **Namespace ist nicht wählbar:** Er ist der Name des **Marketplace-Eintrags**. Kern-Skills
  laufen unter `/nc:<name>`, Abteilungs-Skills unter `/nc-<abteilung>:<name>`.
- **Plugin-Namen kebab-case**, keine Großbuchstaben, keine Leerzeichen.

### 1a. Auslieferungsgrenze: was beim Nutzer wirklich ankommt

**Verbindliche Regel: Alles Auszuliefernde liegt IM Plugin-Verzeichnis.** Für einen Satelliten,
dessen Repo das Plugin **ist**, heißt das: an der Repo-Wurzel und darunter.

Die Grenze entsteht nicht beim Klonen, sondern **beim Install** (offizielle Doku
`plugin-marketplaces`, abgerufen 2026-08-11): „when users install a plugin, Claude Code copies
**the plugin directory** to a cache location" — kopiert wird nach `~/.claude/plugins/cache`. Der
Klon selbst ist vollständig; die Doku sagt das an zwei Stellen: der **einzige** sparse Source
ist `git-subdir` („Claude Code uses a sparse, partial clone to fetch only the subdirectory"),
und der Troubleshooting-Abschnitt „Relative paths don't resolve" nennt als Abhilfe ausdrücklich
„Git-based marketplaces clone the entire repository, making relative paths work correctly".

| Fall | `source` | Plugin-Verzeichnis | Folge |
|---|---|---|---|
| Kern `nc` | `"./plugins/nc"` | `plugins/nc/` | `knowledge-base/` an der Marketplace-Wurzel wird **nie** mitkopiert — dafür existiert `/nc:setup` |
| Abteilung im Repo | `"./plugins/nc-<abteilung>"` | `plugins/nc-<abteilung>/` | dito |
| Satellit | `github` + `ref` + `sha` | **Repo-Wurzel** | alles fährt mit, **auch** die eigene `knowledge-base/` — sie ist Arbeitsmaterial des Repos, nie Laufzeit-Abhängigkeit eines Skills |

**Zwei verbreitete Irrtümer, ausdrücklich ausgeräumt:**

1. Ein `ref`/`sha`-Pin löst **keinen** sparse clone aus. Der sparse/partial clone hängt am
   Source-Typ **`git-subdir`** („Claude Code uses a sparse, partial clone to fetch only the
   subdirectory") bzw. am Opt-in-Flag `claude plugin marketplace add … --sparse <paths…>`.
   NovaCore benutzt keinen `git-subdir`-Source.
2. „Das Repo wird ja ganz geklont, also sieht der Skill die Datei" — nein: Ausgeliefert wird die
   **Kopie im Cache**, und die reicht nur so weit wie das Plugin-Verzeichnis.

## 2. Harte Mechanik-Fakten (die häufigsten Fehlerquellen)

1. **Manifest-Ort:** `plugin.json` gehört in `<plugin>/.claude-plugin/`. **Alle** Komponenten
   (`skills/`, `hooks/`, `agents/`, …) liegen im **Plugin-Wurzelverzeichnis**, nie in
   `.claude-plugin/`. Falsch platzierte Komponenten laden still nicht.
2. **Default-Scan nutzen:** Liegen die Skills in `<plugin>/skills/<name>/SKILL.md`, braucht das
   Manifest **kein** `skills`-Feld. Ordner ohne `SKILL.md` ignoriert der Scanner — so bleiben
   `PLATZHALTER.md`-Ordner unausgeliefert und reservieren trotzdem den Namen.
3. **Hook-Pfade absolut über die Variable:** in `hooks/hooks.json` immer
   `"${CLAUDE_PLUGIN_ROOT}/hooks/<datei>.js"`. Relative Pfade brechen im Plugin-Cache.
4. **Keine Pfade über die Plugin-Grenze.** Installierte Plugins werden nach
   `~/.claude/plugins/cache` kopiert; `../` oder Repo-Pfade wie `knowledge-base/…` existieren
   dort **nicht** (§1a). Auf fremde Inhalte per **Name** verweisen („`wp-rahmen.md` des
   Kern-Plugins `nc`", „Standardprozesse im OS-Repo"). Was ein Skill zur Laufzeit wirklich lesen
   muss, muss **in seinem Plugin liegen**.
5. **`source`-Pfade im Marketplace** beginnen mit `./` und lösen gegen die Marketplace-Wurzel auf
   (das Verzeichnis mit `.claude-plugin/`), nicht gegen `.claude-plugin/` selbst. Dieses Repo
   nutzt bewusst **explizite** Pfade, damit kein Zweifel am Präfix entsteht.
6. **Version = Update-Schlüssel, und nur an EINER Stelle:** Ohne Bump in `plugin.json` erhält das
   Team kein Auto-Update. Fehlt `version` ganz, gilt der Commit-SHA — dann ist jeder Commit eine
   neue Version. **Version niemals zusätzlich in den Marketplace-Eintrag schreiben:** Die Doku
   warnt ausdrücklich davor („Avoid setting `version` in both `plugin.json` and the marketplace
   entry. Claude Code always uses the `plugin.json` value **without warning**, so a stale
   manifest version can mask a version you set in `marketplace.json`"). Deshalb tragen die
   Einträge dieses Repos kein `version`-Feld.
   **Mindest-Client:** Das Abteilungsmodell hängt an der Dependency-Mechanik; die verifizierten
   Schwellen und die Team-Anforderung stehen in `kern-plugin-bau.md` §3 — dort nachschlagen,
   nicht hier spiegeln.
7. **Versionsbereiche nur mit Tags:** Ein `dependencies`-Eintrag mit `version` löst gegen
   Git-Tags im Schema `{plugin-name}--v{version}` auf (`claude plugin tag --push`). Solange die
   Abhängigkeit als bloßer Name (`"nc"`) notiert ist, sind **keine** Tags nötig — genau deshalb
   ist es hier so gelöst.

## 3. Ablauf: neues Abteilungsplugin im OS-Repo anlegen

1. **Pflicht-Einstieg** laut `AGENTS.md` erledigen (Log, Status, CHANGELOG, jüngster Bauplan).
2. **Vorlage kopieren:** `vorlagen/abteilungsplugin/` → `plugins/nc-<abteilung>/`. Die
   Vorlagendateien tragen `.vorlage`-Endung; beim Kopieren umbenennen.
   `ssot-grundgeruest.md.vorlage` wird hier **nicht** mitkopiert — sie gilt nur für Satelliten
   (§3b).
3. **Variablen setzen** (Tabelle in `vorlagen/abteilungsplugin/VORLAGE.md`): Plugin-Name,
   Abteilung, Beschreibung, Startversion `0.1.0`, `dependencies: ["nc"]`.
4. **Marketplace-Eintrag ergänzen** in `.claude-plugin/marketplace.json`: `name`, `source`
   `./plugins/nc-<abteilung>`, `description`, `category: "abteilung"` — **kein `version`**
   (Mechanik-Fakt 6).
5. **Registry-Metadaten ergänzen** in `plugins/nc/module-registry.json` (Abteilung, Plugin,
   Namespace, `staendig: false`, `minCoreVersion`, Status, `repoSkillsPath`).
6. **Skills nach `skill-authoring.md`** bauen — oder bewusst keine: Ein Platzhalter-Plugin ohne
   `skills/`-Inhalt ist gültig und reserviert Abteilungsgrenze und Namespace.
7. **Validieren, beide Ebenen:**
   ```
   claude plugin validate .                          # nur das Marketplace-Manifest
   claude plugin validate plugins/<name> --strict    # Manifest UND Skills
   ```
   **Die Wurzel-Variante allein genügt nie** — sie prüft keine Skills. Genau diese Lücke ließ
   beim Vorbild-System 19 von 22 Skills mit nicht parsender Frontmatter unentdeckt.
8. **Testsuite** laufen lassen: `node --test plugins/nc/tests/*.test.mjs` (Verzeichnisargumente
   funktionieren nicht — Node erwartet Dateien bzw. Glob-Muster).
9. **Install-Probe** lokal, in isoliertem `CLAUDE_CONFIG_DIR` (Beleg im Ergebnis dokumentieren):
   ```
   /plugin marketplace add <pfad-zum-repo>
   /plugin install nc-<abteilung>@novacore-os
   ```
   Erwartung: Der Kern `nc` erscheint als mitinstallierte Dependency, und kein Skill einer
   **nicht** installierten Abteilung ist sichtbar.
10. **Doku-Sync + Version-Bump** nach dem `aktualisierungs-index.md`, CHANGELOG-Eintrag mit
    Namenszeichnung.
11. **Kein Commit/Push ohne explizite Freigabe des Maintainers.**

## 3a. Abteilung in ein Satelliten-Repo auslagern (Extraktion)

Für jede Abteilung außer `development` (Kernheimat) möglich, sobald sie ein eigenes Team oder
eigene Vertraulichkeit braucht. Muster aus dem Onsite.ai-OS übernommen (dort produktiv erprobt):

1. **Satellit bauen:** Inhalt von `plugins/nc-<abteilung>/` an die **Repo-Wurzel** des neuen
   Repos (das Repo IST das Plugin): `.claude-plugin/plugin.json`, `README.md`, `CHANGELOG.md`,
   Tests (`node --test`), CI mit SHA-gepinnten Actions, `.gitignore`. Version nur in
   `plugin.json` (Mechanik-Fakt 6).
2. **Verifizieren:** `node --test`, `claude plugin validate .`, `git diff --check`.
3. **Externes Review vor dem ersten Push** (Implementierer ≠ Reviewer).
4. **Veröffentlichen (nur mit Maintainer-Freigabe):** privates Repo anlegen, pushen, annotierten
   Tag `v<version>` pushen, GitHub-Release erzeugen; danach Sichtbarkeit, Org, Tag und Release
   per `gh` belegen.
5. **Marketplace umpinnen:** Eintrag von `"./plugins/nc-<abteilung>"` auf
   `{"source":"github","repo":"<org>/<repo>","ref":"v<version>","sha":"<40-stelliger Commit-SHA>"}`
   — der `sha` ist der effektive Pin, `ref` dient der Lesbarkeit.
6. **Registry:** bei der Abteilung `repository` ergänzen und `repoSkillsPath` auf `skills`
   (relativ zur Satelliten-Wurzel) setzen.
7. **OS-Repo aufräumen:** `plugins/nc-<abteilung>/` entfernen (der Satellit ist die einzige
   Quelle), Doku-Sync, dann `node --test plugins/nc/tests/*.test.mjs` — die Invarianten prüfen
   SHA-Pin und Registry↔Pin-Konsistenz.
8. **Install-Probe** in isoliertem `CLAUDE_CONFIG_DIR`. **SSH-Falle (beim Vorbild verifiziert
   2026-07-27):** GitHub-Shorthand-Sources klonen per Default über SSH — auf Maschinen ohne
   geladenen SSH-Key schlägt die Installation mit `Permission denied (publickey)` fehl; Abhilfe:
   `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` setzen (nutzt die gh/git-Credentials) oder SSH-Key
   einrichten. Für den Team-Rollout dokumentieren.
9. Zentral: eigener Branch → PR → Maintainer-Merge (kein direkter main-Push).

## 3b. Eigenständiges Kollegen-OS als Satellit (pilotiert mit Felix-OS, bestätigt mit Biggi-OS)

Variante von §3a für **persönliche Abteilungs-OS** (erster Fall: `nc-felix`, zweiter Fall:
`nc-biggi`): Das Satelliten-Repo ist ein **eigenständiges** OS — EIN Plugin mit **Modulen**
(Skill-Präfixen) statt Abteilungen, **ohne** Kern-Dependency (Ausnahme in §1 dokumentiert). Nicht
parallel zum Kern `nc` oder zu einem anderen eigenständigen OS der Familie betreiben (doppelte
Gates) — die Koexistenz-Regel gehört in README, AGENTS und Sync-Anweisung des Satelliten.

1. **Struktur:** Das Repo IST das Plugin (Manifest an der Wurzel). Kernmodul ohne Präfix (Ports
   der Kern-Skills `start`, `save-session`, `journal` plus Maintenance-Basics `os-info`,
   `code-tour`, `skill-builder`), **eigene Kontroll-Schicht unter `hooks/`** (FFG-Port,
   Env-Schalter `NC_FFG*` unverändert; seit `nc-biggi` zusätzlich der Session-Start-Zwang,
   markerlos, Opt-out `NC_START_GATE=off`), **eigene Wissensbasis unter `knowledge-base/` samt
   mechanischem Wächter** (`test/wissensbasis.test.mjs`) nach
   `vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage` und `ssot-aufbau.md` §4, geteilte
   Anweisung `<name>-sync.md`, `wp-rahmen.md`, eigene `module-registry.json` (Modul-SSOT; ein
   Modul kann **mehrere** Präfixe führen — Biggi-Fall `dokumentation-daily-work`: `doc` + `day`),
   `referenz/skill-authoring.md`, Tests (`node --test test/*.test.mjs`). Namen reservieren
   Platzhalter-Ordner mit `PLATZHALTER.md` (der Scanner liefert Ordner ohne `SKILL.md` nie aus).
2. **CI-/Release-Standard (seit `nc-biggi` verbindlich):** `ci.yml` (Testsuite Ubuntu+Windows ×
   Node 20/22/24 mit Bash-Glob, Plugin-Validierung `--strict` mit **Positivkontrolle** des
   Validators, Actions per Full-SHA gepinnt) und `release.yml` (annotierter Tag `v<version>` →
   Tag-Typ-Prüfung, Tag↔Manifest-Abgleich gegen `plugin.json`, Testsuite, GitHub-Release mit den
   CHANGELOG-Notes).
3. **Weiter wie §3a** ab Schritt 2: Verifizieren, externes Review **vor** dem ersten Push,
   Veröffentlichen (privates Repo, Push, annotierter Tag `v<version>`, GitHub-Release),
   Marketplace-Pin (`ref` + 40-stelliger `sha`), Registry-Eintrag (`repository`,
   `repoSkillsPath: "skills"`), Install-Probe in isoliertem `CLAUDE_CONFIG_DIR`.
4. **Vier verifizierte Fallen (Pilot 2026-07-28 — nicht wiederholen):**
   - **Repo-Name = reale Heimat**, nie aus dem Namensschema raten (Felix-Fall:
     `NovaCore-AI/Felix-OS`, nicht `NovaCoreAI-OS-<Abteilung>`).
   - **Kein `type: module` in der `package.json`**, solange die Hooks CommonJS sind (`require`) —
     sie laufen im Plugin-Cache mit dieser `package.json` im Scope.
   - **SSH-Falle:** GitHub-Sources klonen per Default über SSH — ohne geladenen Key schlägt die
     Installation mit `Permission denied (publickey)` fehl; Abhilfe
     `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` (für den Rollout dokumentieren).
   - **Plugin-Repo nie als Marketplace adden** — installiert wird über den Marketplace des
     OS-Repos (`/plugin install nc-<name>@novacore-os`).

## 4. Bekannte Fehler — nicht wiederholen

| Fehler | Folge | Vermeidung |
|---|---|---|
| Nur `claude plugin validate .` geprüft | Skill-Fehler bleiben unsichtbar, Frontmatter-Bruch fällt nie auf | immer zusätzlich je Plugin validieren, mit `--strict` |
| `description` mit `Trigger-Begriffe: …` als unquotierter Plain-Scalar | Frontmatter parst nicht, Skill lädt ohne `name`/`description` und triggert nie | `>-`-Block verwenden (`skill-authoring.md`) |
| Repo-Pfad (`knowledge-base/…`) als Leseanweisung im Skill | Nach Installation nicht auflösbar (§1a) | Datei ins Plugin legen oder als Quellenangabe („OS-Repo") kennzeichnen |
| Komponenten in `.claude-plugin/` gelegt | Plugin lädt, Komponenten fehlen still | alles außer `plugin.json` ins Plugin-Wurzelverzeichnis |
| Hooks zusätzlich im **repo-internen** Abteilungsplugin | Gates feuern doppelt | Hooks bleiben im Kern; nur eigenständige Satelliten tragen eigene Kopien (§1) |
| Kern-Prüfung im Satelliten abgeschwächt statt portiert | zwei Sicherheitsniveaus in derselben Familie, stiller Rückschritt | Port heißt **inhaltsgleich**: Quelle lesen (`git show`), nicht rekonstruieren; Härtungen des Kerns übernehmen |
| Version nicht gebumpt | kein Auto-Update im Team | Bump + CHANGELOG als Teil derselben Änderung |
| Version in `plugin.json` **und** Marketplace-Eintrag gesetzt | Der Marketplace-Wert wird ohne Warnung ignoriert; eine veraltete Manifest-Version maskiert ihn still | `version` gehört **nur** in `plugin.json` |
| Marker-Existenz statt Marker-**Datei** geprüft | `~/.nc-os/`-Staging-Verzeichnis zählte als Marker — Gate feuerte in jedem Repo unterm Home (Bug 0.1.1) | Marker vermeiden; wo unvermeidbar, immer mit `stat.isFile()` prüfen und neue Scoping-Mechanik nur mit Regressionstest |
| Struktur-Invarianten nur ad hoc geprüft | Regression fällt erst beim Nutzer auf | `plugins/nc/tests/struktur.test.mjs` prüft Manifeste, Namespaces, Frontmatter, „Hooks nur im Kern" und die Plugin-Grenze bei jedem Testlauf |
| Struktur-Umbau ohne Blick in fremde Worktrees | ungemergte Arbeit wird überfahren | `git worktree list` und in jedem Baum `git status` **vor** dem ersten Schreiben |

---

*Angelegt 2026-08-11 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer als
Abteilungshälfte der Zweiteilung des früheren `plugin-bau.md` (Bauplan
`grundwissen/2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md`, AP1 /
Entscheid E2). Struktur-Vorbild: `Onsite.ai-OS@5d335a7` `abteilungs-plugin-bau.md`. §1a ersetzt
die dortige „Sparse-Clone-Regel" durch die belegte Auslieferungsgrenze — Begründung im
Plan-Nachtrag N3.*
