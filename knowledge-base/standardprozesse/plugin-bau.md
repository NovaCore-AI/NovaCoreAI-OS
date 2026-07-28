# Plugin-Bau — Standardprozess für Agenten

> **Verbindlich** für jedes Anlegen, Füllen oder Umbauen eines Plugins in diesem Repo (Kern wie
> Abteilung). Ergänzt `skill-authoring.md` (liegt im Kern-Plugin unter
> `plugins/nc/referenz/skill-authoring.md`), das das **SKILL.md-Format** regelt — hier geht es
> um die **Plugin- und Marketplace-Ebene**. Alle Mechanik-Aussagen sind gegen die offizielle
> Claude-Code-Doku verifiziert (abgerufen **2026-07-28**: `plugins-reference`,
> `plugin-marketplaces`, `skills`). Vor Format-Änderungen erneut abrufen — nie aus dem
> Gedächtnis.

## 1. Architektur, die du nicht verletzen darfst

Ein Marketplace (`novacore-os`), Plugins aus dem OS-Repo **plus** künftig mögliche
Satelliten-Repos:

```
NovaCoreAI-OS/                       = Marketplace-Wurzel (enthält .claude-plugin/)
  .claude-plugin/marketplace.json    ein Eintrag je Plugin: source "./plugins/<name>" (lokal)
                                     oder github-Source mit sha-Pin (Satellit)
  plugins/nc/                        Kern: skills/ hooks/ tests/ wp-rahmen.md
                                     module-registry.json referenz/ nc-sync.md
  plugins/nc-development/            Dev-Abteilung (Kernheimat): skills/ workflow.md README.md
  vorlagen/abteilungsplugin/         Vorlage für neue Abteilungen (kein Plugin)

NovaCore-AI/NovaCoreAI-OS-<Abteilung>    je ein PRIVATES Satelliten-Repo pro ausgelagerter
  .claude-plugin/plugin.json             Abteilung — das Repo IST das Plugin (Manifest an
  README.md CHANGELOG.md tests/          der Wurzel); Release-Tag + SHA-Pin im Marketplace
```

- **Ein Plugin je Abteilung.** Die Plugin-Grenze **ist** die Abteilungsgrenze: Das
  Plugin-System kennt keinen Per-Skill-Schalter, Aktivierung läuft ausschließlich je Plugin.
- **Jedes Abteilungsplugin führt `dependencies: ["nc"]`.** Installieren oder Aktivieren zieht
  den Kern automatisch mit; Deaktivieren des Kerns wird blockiert, solange eine Abteilung aktiv
  ist. Damit ist die ständige Abteilung technisch erzwungen.
- **Hooks nur im Kern.** Abteilungsplugins bringen keine Hooks mit — sonst feuert die
  Kontroll-Schicht mehrfach.
- **Namespace ist nicht wählbar:** Er ist der Name des **Marketplace-Eintrags**. Kern-Skills
  laufen unter `/nc:<name>`, Abteilungs-Skills unter `/nc-<abteilung>:<name>`.
- **Plugin-Namen kebab-case**, keine Großbuchstaben, keine Leerzeichen.

## 2. Harte Mechanik-Fakten (die häufigsten Fehlerquellen)

1. **Manifest-Ort:** `plugin.json` gehört in `<plugin>/.claude-plugin/`. **Alle** Komponenten
   (`skills/`, `hooks/`, `agents/`, …) liegen im **Plugin-Wurzelverzeichnis**, nie in
   `.claude-plugin/`. Falsch platzierte Komponenten laden still nicht.
2. **Default-Scan nutzen:** Liegen die Skills in `<plugin>/skills/<name>/SKILL.md`, braucht das
   Manifest **kein** `skills`-Feld. Ordner ohne `SKILL.md` ignoriert der Scanner — so bleiben
   Platzhalter-Ordner unausgeliefert.
3. **Hook-Pfade absolut über die Variable:** in `hooks/hooks.json` immer
   `"${CLAUDE_PLUGIN_ROOT}/hooks/<datei>.js"`. Relative Pfade brechen im Plugin-Cache.
4. **Keine Pfade über die Plugin-Grenze.** Installierte Plugins werden nach
   `~/.claude/plugins/cache` kopiert; `../` oder Repo-Pfade wie `knowledge-base/…` existieren
   dort **nicht**. Auf fremde Inhalte per **Name** verweisen („`wp-rahmen.md` des Kern-Plugins
   `nc`"). Was ein Skill zur Laufzeit wirklich lesen muss, muss **in seinem Plugin liegen**.
5. **`source`-Pfade im Marketplace** beginnen mit `./` und lösen gegen die Marketplace-Wurzel
   auf (das Verzeichnis mit `.claude-plugin/`), nicht gegen `.claude-plugin/` selbst. Dieses
   Repo nutzt bewusst **explizite** Pfade, damit kein Zweifel am Präfix entsteht.
6. **Version = Update-Schlüssel, und nur an EINER Stelle:** Ohne Bump in `plugin.json` erhält
   das Team kein Auto-Update. Fehlt `version` ganz, gilt der Commit-SHA — dann ist jeder Commit
   eine neue Version. **Version niemals zusätzlich in den Marketplace-Eintrag schreiben:** Die
   Doku warnt ausdrücklich davor („Avoid setting `version` in both `plugin.json` and the
   marketplace entry. Claude Code always uses the `plugin.json` value **without warning**, so a
   stale manifest version can mask a version you set in `marketplace.json`"). Deshalb tragen die
   Einträge dieses Repos kein `version`-Feld.
   **Mindest-Client:** Das Abteilungsmodell hängt an der Dependency-Mechanik — transitives
   Enable/Disable-Blocking ab Claude Code **2.1.143**, `defaultEnabled` ab 2.1.154, `renames` ab
   2.1.193. Das Team fordert **≥ 2.1.193**; ältere Clients melden nur ein nachgelagertes
   `dependency-unsatisfied`, statt den Kern zu erzwingen.
7. **Versionsbereiche nur mit Tags:** Ein `dependencies`-Eintrag mit `version` löst gegen
   Git-Tags im Schema `{plugin-name}--v{version}` auf (`claude plugin tag --push`). Solange die
   Abhängigkeit als bloßer Name (`"nc"`) notiert ist, sind **keine** Tags nötig — genau
   deshalb ist es hier so gelöst.

## 3. Ablauf: neues Abteilungsplugin anlegen

1. **Pflicht-Einstieg** laut `CLAUDE.md` erledigen (Log, Status, CHANGELOG, jüngste Spec).
2. **Vorlage kopieren:** `vorlagen/abteilungsplugin/` → `plugins/nc-<abteilung>/`. Die
   Vorlagendateien tragen `.vorlage`-Endung; beim Kopieren umbenennen.
3. **Variablen setzen** (Tabelle in `vorlagen/abteilungsplugin/VORLAGE.md`): Plugin-Name,
   Abteilung, Beschreibung, Startversion `0.1.0`, `dependencies: ["nc"]`.
4. **Marketplace-Eintrag ergänzen** in `.claude-plugin/marketplace.json`: `name`, `source`
   `./plugins/nc-<abteilung>`, `description`, `category: "abteilung"` — **kein `version`**
   (siehe Mechanik-Fakt 6).
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
8. **Testsuite** laufen lassen: `node --test plugins/nc/tests/*.test.mjs`
   (Verzeichnisargumente funktionieren nicht — Node erwartet Dateien bzw. Glob-Muster).
9. **Install-Probe** lokal, in isoliertem `CLAUDE_CONFIG_DIR` (Beleg im Ergebnis
   dokumentieren):
   ```
   /plugin marketplace add <pfad-zum-repo>
   /plugin install nc-<abteilung>@novacore-os
   ```
   Erwartung: Der Kern `nc` erscheint als mitinstallierte Dependency, und kein Skill einer
   **nicht** installierten Abteilung ist sichtbar.
10. **Doku-Sync + Version-Bump** nach der Sync-Matrix in `CLAUDE.md`, CHANGELOG-Eintrag mit
    Namenszeichnung.
11. **Kein Commit/Push ohne explizite Freigabe des Maintainers.**

## 3a. Abteilung in ein Satelliten-Repo auslagern (Extraktion)

Für jede Abteilung außer `development` (Kernheimat) möglich, sobald sie ein eigenes Team oder
eigene Vertraulichkeit braucht. Muster aus dem Onsite.ai-OS übernommen (dort produktiv
erprobt):

1. **Satellit bauen:** Inhalt von `plugins/nc-<abteilung>/` an die **Repo-Wurzel** des neuen
   Repos (das Repo IST das Plugin): `.claude-plugin/plugin.json`, `README.md`, `CHANGELOG.md`,
   Tests (`node --test`), CI mit SHA-gepinnten Actions, `.gitignore`. Keine Hooks,
   `dependencies: ["nc"]` unverändert, Version nur in `plugin.json` (Mechanik-Fakt 6).
2. **Verifizieren:** `node --test`, `claude plugin validate .`, `git diff --check`.
3. **Externe Review vor dem ersten Push** (Implementierer ≠ Reviewer).
4. **Veröffentlichen (nur mit Maintainer-Freigabe):** privates Repo
   `NovaCore-AI/NovaCoreAI-OS-<Abteilung>` anlegen, pushen, annotierten Tag `v<version>`
   pushen, GitHub Release erzeugen; danach Sichtbarkeit/Org/Tag/Release per `gh` belegen.
5. **Marketplace umpinnen:** Eintrag von `"./plugins/nc-<abteilung>"` auf
   `{"source":"github","repo":"NovaCore-AI/NovaCoreAI-OS-<Abteilung>","ref":"v<version>","sha":"<40-stelliger Commit-SHA>"}`
   — der `sha` ist der effektive Pin, `ref` dient der Lesbarkeit (Doku plugin-marketplaces).
6. **Registry:** bei der Abteilung `repository` ergänzen und `repoSkillsPath` auf `skills`
   (relativ zur Satelliten-Wurzel) setzen.
7. **OS-Repo aufräumen:** `plugins/nc-<abteilung>/` entfernen (der Satellit ist die einzige
   Quelle), Doku-Sync, dann `node --test plugins/nc/tests/*.test.mjs` — die Invarianten
   prüfen SHA-Pin und Registry↔Pin-Konsistenz.
8. **Install-Probe** in isoliertem `CLAUDE_CONFIG_DIR`. **SSH-Falle (beim Vorbild verifiziert
   2026-07-27):** GitHub-Shorthand-Sources klonen per Default über SSH — auf Maschinen ohne
   geladenen SSH-Key schlägt die Installation mit `Permission denied (publickey)` fehl;
   Abhilfe: `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` setzen (nutzt die gh/git-Credentials) oder
   SSH-Key einrichten. Für den Team-Rollout dokumentieren.
9. Zentral: eigener Branch → PR → Maintainer-Merge (kein direkter main-Push).

## 4. Bekannte Fehler — nicht wiederholen

| Fehler | Folge | Vermeidung |
|---|---|---|
| Nur `claude plugin validate .` geprüft | Skill-Fehler bleiben unsichtbar, Frontmatter-Bruch fällt nie auf | immer zusätzlich je Plugin validieren |
| `description` mit `Trigger-Begriffe: …` als unquotierter Plain-Scalar | Frontmatter parst nicht, Skill lädt ohne `name`/`description` und triggert nie | `>-`-Block verwenden (`skill-authoring.md`) |
| Repo-Pfad (`knowledge-base/…`) als Leseanweisung im Skill | Nach Installation nicht auflösbar | Datei ins Plugin legen oder als Quellenangabe („OS-Repo") kennzeichnen |
| Komponenten in `.claude-plugin/` gelegt | Plugin lädt, Komponenten fehlen still | alles außer `plugin.json` ins Plugin-Wurzelverzeichnis |
| Hooks zusätzlich im Abteilungsplugin | Gates feuern doppelt | Hooks bleiben im Kern |
| Version nicht gebumpt | kein Auto-Update im Team | Bump + CHANGELOG als Teil derselben Änderung |
| Version in `plugin.json` **und** Marketplace-Eintrag gesetzt | Der Marketplace-Wert wird ohne Warnung ignoriert; eine veraltete Manifest-Version maskiert ihn still | `version` gehört **nur** in `plugin.json` |
| Marker-Existenz statt Marker-**Datei** geprüft | `~/.nc-os/`-Staging-Verzeichnis zählte als Marker — Gate feuerte in jedem Repo unterm Home (Bug 0.1.1) | Marker immer mit `stat.isFile()` prüfen; neue Scoping-Mechanik nur mit Regressionstest |
| Struktur-Invarianten nur ad hoc geprüft | Regression fällt erst beim Nutzer auf | `plugins/nc/tests/struktur.test.mjs` prüft Manifeste, Namespaces, Frontmatter, „Hooks nur im Kern" und die Plugin-Grenze bei jedem Testlauf |
| Struktur-Umbau ohne Blick in fremde Worktrees | ungemergte Arbeit wird überfahren | `git worktree list` und in jedem Baum `git status` **vor** dem ersten Schreiben |
