# Abteilungs-Plugin-Bau — Standardprozess für Agenten

> **Verbindlich** für jedes Anlegen, Füllen oder Umbauen eines **Abteilungsplugins** in diesem
> Repo oder einem Satelliten. Den Bau und die Pflege des **Kern-Plugins** regelt daneben
> [`kern-plugin-bau.md`](<kern-plugin-bau.md>); wer welche Struktur trägt (Sicherheitsnetz,
> Infrastruktur), steht in der Scope-Tabelle in §1. Ergänzt `skill-authoring.md` (liegt im
> Kern-Plugin unter `plugins/oai/referenz/skill-authoring.md`), das das **SKILL.md-Format**
> regelt — hier geht es um die **Plugin- und Marketplace-Ebene**. Alle Mechanik-Aussagen sind
> gegen die offizielle Claude-Code-Doku verifiziert (abgerufen **2026-07-26**:
> `plugins-reference`, `plugin-marketplaces`, `plugin-dependencies`). Vor Format-Änderungen
> erneut abrufen — nie aus dem Gedächtnis. *(Bis 2026-08-09 hieß diese Datei `plugin-bau.md`.)*
> **Kette:** **dieser Prozess** → `sync-nachzug-bauzyklus.md`

## 1. Architektur, die du nicht verletzen darfst

Ein Marketplace (`onsite-ai-os`), Plugins aus dem OS-Repo **plus Satelliten-Repos**
(Entscheidung 2026-07-27, Spec §15.19):

```
<repo-wurzel>                        = Marketplace-Wurzel (enthält .claude-plugin/)
  .claude-plugin/marketplace.json    Kern: source "./plugins/oai" (lokal, dauerhaft)
                                     Abteilung: github-Source mit sha-Pin (Regelfall)
                                     "./plugins/oai-<abteilung>" NUR im Sonderfall §3.2
  plugins/oai/                       Kern: skills/ hooks/ tests/ wp-rahmen.md
                                     module-registry.json referenz/
  knowledge base/plugin-maintanance-ruleset-source/
    vorlagen/abteilungsplugin/       Vorlage für neue Abteilungen (kein Plugin; SSOT)

onsite-ai-devs/Onsite.ai-OS-<Abteilung>   je ein PRIVATES Satelliten-Repo pro weiterer
  .claude-plugin/plugin.json              Abteilung — das Repo IST das Plugin (Manifest an
  README.md CHANGELOG.md test/            der Wurzel); Release-Tag + SHA-Pin im Marketplace
```

- **Eine Abteilung, die Inhalt trägt, wohnt nie im OS-Repo** (Spec §15.33/§15.53). Dort
  verbleiben Kern und Marketplace-Katalog; ein `plugins/oai-<abteilung>/`-Verzeichnis ist
  entweder eine **inhaltsleere Reservierung** (§3.2) oder ein **Norm-Verstoß**. Welcher
  Anlageweg gilt, entscheidet der Eingangsentscheid **§3.0** — **vor** dem ersten Artefakt.

- **Ein Plugin je Abteilung.** Die Plugin-Grenze **ist** die Abteilungsgrenze: Das
  Plugin-System kennt keinen Per-Skill-Schalter (`skillOverrides` wirkt laut Doku nicht auf
  Plugin-Skills), Aktivierung läuft ausschließlich je Plugin. Spec §15.16.
- **Jedes Abteilungsplugin führt `dependencies: ["oai"]`.** Installieren oder Aktivieren zieht
  den Kern automatisch mit; Deaktivieren des Kerns wird blockiert, solange eine Abteilung aktiv
  ist. Damit ist die ständige Abteilung technisch erzwungen.
- **Zwei Governance-Schichten — wer trägt welche Struktur** (Spec §15.22, neu gefasst
  2026-08-09). Der Unterschied ist nicht *was*, sondern *für wen*:

  | | Kern `oai` (team-shared) | Abteilungsplugin (individuell) |
  |---|---|---|
  | **Sicherheitsnetz** | **Basis-Gate**: universelle Destruktiv-Liste, Datei-Gate, Routine-Bash — domänen-frei, einmal gepflegt (das heutige FFG) | **Domänen-FFG** mit eigenen Fragen auf eigenen Mustern (development → Branch-/Merge-/Deploy-Kommandos, marketing → kundensichtbare Schreibwege) · Gate-3-Ausprägung der Abteilung |
  | **Infrastruktur** | Session-Start (Injektion + Erzwingungs-Begleiter), Sitzungsabschluss, SSOT-/Wissens-Pflege, Shared-Skills, geteilter Fehlerlog | Fach-SSOT · eigene Konnektoren · eigene Pflege-Hooks · Abteilungs-Skills |
  | **Verbot** | keine Abteilungs-Fachprüfungen im Kern | **keine Kern-Prüfung duplizieren oder abschwächen** |

  **Standalone-Abteilungen bekommen ihre eigene FFG- und Hook-Architektur** — ein Satellit
  kann Kern-Hookdateien ohnehin nicht erreichen.
- **Prüfungs-Eigentum statt Matcher-Eigentum** (Kollisionsregel, Spec §15.22): Jede Prüfung hat
  genau ein Heimat-Plugin; Matcher sind frei wählbar, auch `Edit`/`Write`/`MultiEdit`/`Bash` —
  Überlappung ist zulässig, solange nicht dieselbe Prüfung doppelt existiert. Verteilannahme:
  Kern + genau **ein** Abteilungsplugin je Mitarbeiter.
  **Hook-Norm (W4, Maintainer-Entscheid 2026-08-21 — löst das frühere Sequenzierungs-Gate ab):**
  Bei der Auslieferung trägt **nur der Kern Hooks**. Ein Satellit, der **eine Weile steht**
  (etabliert ist), darf **eigene, nicht-redundante, nicht-kollidierende, spezialisierte**
  Hooks bekommen — **nichts anderes**. Das Prüfungs-Eigentum (keine Kern-Prüfung duplizieren
  oder abschwächen) gilt unverändert; den Bauweg nennt die Zeile „Abteilungs-Hook/FFG bauen"
  im `Aktualisierungs-Index`.
- **Namespace ist nicht wählbar:** Er ist der Name des **Marketplace-Eintrags**. Kern-Skills
  laufen unter `/oai:<name>`, Abteilungs-Skills unter `/oai-<abteilung>:<name>`.
- **Plugin-Namen kebab-case**, keine Großbuchstaben, keine Leerzeichen.

### Abteilungs-CLAUDE und Sparse-Clone-Regel (Spec §15.28)

1. Jedes Abteilungsplugin führt künftig eine **Abteilungs-CLAUDE-Datei IM Plugin-Verzeichnis**
   (wird von Gate 2 aus dem Plugin-Root gelesen; Dateiname/Format werden mit AP3 festgelegt).
2. **Verbindliche Regel:** Alles Auszuliefernde liegt IM **Plugin-Verzeichnis**. Grund: Bei
   ref/SHA-Pin macht Claude Code einen **sparse clone NUR des Plugin-Subverzeichnisses**
   (offizielle Doku `plugin-marketplaces`, verifiziert 2026-08-10) — Dateien außerhalb davon
   kommen nicht mit.
   **Präzisierung 2026-08-14 (löst den Widerspruch zu §3a.1 auf):** Welches Verzeichnis das
   ist, entscheidet das **`path`-Feld des Marketplace-Eintrags**. Setzen unsere Satelliten
   es nicht (so bei `oai-marketing` und `oai-development`), dann ist **Plugin-Wurzel =
   Repo-Wurzel** — der Sparse-Clone holt das ganze Repo, und §3a.1 („Inhalt an die
   Repo-Wurzel") ist die korrekte Anweisung. Scharf wird diese Regel erst, sobald ein Eintrag
   ein `path` bekommt: dann liegt alles Auszuliefernde unterhalb dieses Pfades und **nichts**
   Ausgeliefertes an der Repo-Wurzel. Frühere Formulierungen, die pauschal „nie an der
   Satelliten-Repo-Wurzel" sagten, sind damit überholt.
3. Die Vorlage `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/` bekommt einen `abteilungs-claude.md`-Baustein (Bau
   nach AP3). Details der Ebenen-Architektur: `Onsite.ai-OS-CLAUDE-Ebenen-Definition.md`.

## 2. Harte Mechanik-Fakten (die häufigsten Fehlerquellen)

1. **Manifest-Ort:** `plugin.json` gehört in `<plugin>/.claude-plugin/`. **Alle** Komponenten
   (`skills/`, `hooks/`, `agents/`, …) liegen im **Plugin-Wurzelverzeichnis**, nie in
   `.claude-plugin/`. Falsch platzierte Komponenten laden still nicht.
2. **Default-Scan nutzen:** Liegen die Skills in `<plugin>/skills/<name>/SKILL.md`, braucht das
   Manifest **kein** `skills`-Feld. Ordner ohne `SKILL.md` ignoriert der Scanner — so bleiben
   `PLATZHALTER.md`-Ordner unausgeliefert. Ein zusätzlich gesetztes `skills`-Feld ergänzt den
   Default-Scan (Ausnahme: Marketplace-Einträge, deren `source` auf die Marketplace-Wurzel
   zeigt — dort ersetzt es ihn).
3. **Hook-Pfade absolut über die Variable:** in `hooks/hooks.json` immer
   `"${CLAUDE_PLUGIN_ROOT}/hooks/<datei>.js"`. Relative Pfade brechen im Plugin-Cache.
4. **Keine Pfade über die Plugin-Grenze.** Installierte Plugins werden nach
   `~/.claude/plugins/cache` kopiert; `../` oder Repo-Pfade wie `knowledge base/…` existieren
   dort **nicht**. Auf fremde Inhalte per **Name** verweisen („`wp-rahmen.md` des Kern-Plugins
   `oai`"). Was ein Skill zur Laufzeit wirklich lesen muss, muss **in seinem Plugin liegen**.
5. **`source`-Pfade im Marketplace** beginnen mit `./` und lösen gegen die Marketplace-Wurzel
   auf (das Verzeichnis mit `.claude-plugin/`), nicht gegen `.claude-plugin/` selbst. Die
   Alternative `metadata.pluginRoot` erlaubt Kurzformen ohne `./`; dieses Repo nutzt bewusst
   **explizite** Pfade, damit kein Zweifel am Präfix entsteht. Nie beides kombinieren.
6. **Version = Update-Schlüssel, und nur an EINER Stelle:** Ohne Bump in `plugin.json` erhält
   das Team kein Auto-Update. Fehlt `version` ganz, gilt der Commit-SHA — dann ist jeder Commit
   eine neue Version. **Version niemals zusätzlich in den Marketplace-Eintrag schreiben:** Die
   Doku warnt ausdrücklich davor („Avoid setting `version` in both `plugin.json` and the
   marketplace entry. Claude Code always uses the `plugin.json` value **without warning**, so a
   stale manifest version can mask a version you set in `marketplace.json`"). Deshalb tragen die
   Einträge dieses Repos kein `version`-Feld; die Auflösungsreihenfolge ist `plugin.json` →
   Marketplace-Eintrag → Commit-SHA.
   **Mindest-Client:** Das Abteilungsmodell hängt an der Dependency-Mechanik — transitives
   Enable/Disable-Blocking ab Claude Code **2.1.143**, `defaultEnabled` ab 2.1.154, `renames` ab
   2.1.193. Das Team fordert **≥ 2.1.193**; ältere Clients melden nur ein nachgelagertes
   `dependency-unsatisfied`, statt den Kern zu erzwingen.
7. **Versionsbereiche nur mit Tags:** Ein `dependencies`-Eintrag mit `version` löst gegen
   Git-Tags im Schema `{plugin-name}--v{version}` auf (`claude plugin tag --push`). Solange die
   Abhängigkeit als bloßer Name (`"oai"`) notiert ist, sind **keine** Tags nötig — genau
   deshalb ist es hier so gelöst.
8. **Jede Beschreibung unter 500 Zeichen (serverseitige Marktplatz-Grenze):** Der
   Org-Marktplatz auf claude.ai weist jede `description` über 500 Zeichen ab — im
   Marketplace-Eintrag **und** in der `plugin.json` des Plugins. Das Plugin synchronisiert
   trotzdem, aber **ohne** Beschreibung: Das Team sieht im Installationsdialog einen leeren
   Eintrag. Weder `claude plugin validate` noch die offizielle Doku kennen diese Grenze
   (verifiziert an CLI 2.1.260 am 2026-09-04, code.claude.com/docs `plugins-reference`) — die
   lokale Prüfung bleibt also **grün, während der Team-Sync warnt**. Deshalb: ein Zwecksatz
   plus Kurzkatalog, Details gehören in `README.md`. Gegenprobe vor dem Push:
   `node -e "for(const p of require('./.claude-plugin/marketplace.json').plugins)console.log(p.name,(p.description||'').length)"`.
   Dieselbe Grenze gilt fremdgepinnten Satelliten und Affiliates gegenüber — deren
   Marketplace-Eintrag liegt in diesem Repo und ist hier zu kürzen, ihre eigene
   `plugin.json` nur im jeweiligen Satelliten-Repo.

## 3. Ablauf: neues Abteilungsplugin anlegen

### 3.0 Eingangsentscheid — welcher Anlageweg gilt (verbindlich, vor dem ersten Artefakt)

**Eine Frage, zwei Wege:** *Trägt die Abteilung beim Anlegen bereits Inhalt?*

**Inhalt** ist alles, was über das leere Gerüst hinausgeht: mindestens ein Skill, eine
Referenzdatei, ein Modul, ein Hook, ein Subagent oder ein Fachartefakt. **Kein** Inhalt sind
die Gerüstbausteine selbst — Manifest, README, Abteilungs-CLAUDE, `pflege-auspraegung.json`.

| Trägt Inhalt? | Weg | Marketplace-`source` | Heimat |
|---|---|---|---|
| **ja** — Regelfall | **§3.1 Direktanlage als Satellit** | github-Source mit SHA-Pin, **von Anfang an** | Satelliten-Repo |
| **nein** — Sonderfall | **§3.2 Reservierungsanlage** | `./plugins/oai-<abteilung>` — **befristet** | OS-Repo |

**Der Regelfall ist die Direktanlage.** Eine Abteilung mit Inhalt wird **nie** über das
OS-Repo angelegt — auch nicht „kurz", auch nicht „bis wir fertig sind". Die Reservierungsanlage
ist allein für den Fall gedacht, dass eine Abteilung **beschlossen, aber noch inhaltsleer** ist
und lediglich Abteilungsgrenze und Namespace belegen soll.

**Warum die Weiche normativ ist** (Spec §15.53): Der Weg über das OS-Repo erzeugt bei einer
inhaltstragenden Abteilung Arbeit, die er anschließend selbst wieder zurücknehmen muss —
Anlegen, Umpinnen, Rückbau, Doku-Sweep — und hält bis dahin einen Zustand, den §15.33
ausschließt („im OS-Repo verbleiben Kern und Marketplace-Katalog, sonst nichts
Abteilungsspezifisches"). **Prüffrage vor dem ersten Artefakt:** *Wenn ich das hier baue —
müsste es morgen wieder herausgezogen werden?* Lautet die Antwort ja, ist §3.1 der Weg.

**Weichenwechsel während des Baus:** Kippt die Antwort — die inhaltsleer angelegte Abteilung
bekommt ihren ersten Skill —, ist **§3a fällig, bevor dieser Inhalt gebaut wird**. Ein „erst
fertig bauen, dann extrahieren" ist kein zulässiger Zwischenzustand.

### 3.1 Regelweg: Direktanlage als Satellit

Ziel-Repo ist von Anfang an `onsite-ai-devs/Onsite.ai-OS-<Abteilung>`; im OS-Repo entsteht
**kein** `plugins/oai-<abteilung>/`. Die Bausteine sind dieselben wie bei der Extraktion —
sie werden hier bewusst **nicht zweitgeschrieben**, sondern referenziert.

1. **Pflicht-Einstieg** laut `CLAUDE.md`; bei paralleler Arbeit **fremde Worktrees prüfen**
   (`git worktree list`, in jedem Baum `git status`) — vor dem ersten Artefakt.
2. **Repo anlegen — Grundeigener Schritt mit Beauftragungszwang.** Privates Repo
   `onsite-ai-devs/Onsite.ai-OS-<Abteilung>` unter `github.com/onsite-ai-devs` anlegen. Die
   Anlage ist **keine rote Linie**, sondern einer der **ersten Standardschritte** des Baus —
   sie wird **grundsätzlich an den bauenden Agenten delegiert** (Maintainer-Freigabe
   2026-08-21; belegt im Bauplan `Aktive Baupläne/2026-08-21-satelliten-extraktion-
   mikrobiologie-ssot-anschluss.md` §0). Pflichten dabei: **explizite Freigabe des
   Maintainers zur Beauftragung** (sie erteilt die Planung mit — ein Bauplan ohne
   Repo-Anlage-Schritt ist unvollständig) · Anlage **privat** in der Org
   `onsite-ai-devs` · Sichtbarkeit, Org-Zugehörigkeit und URL unmittelbar per `gh` belegen ·
   Name vor der Anlage mit dem Maintainer abstimmen (Namensschema:
   `Onsite.ai-OS-<Abteilung>`). Was **rote Linie bleibt:** alles, was nach der Anlage
   publiken Charakter bekommt — Push auf `main`, Tag-Push, GitHub-Release und jede
   kundensichtbare Änderung (unverändert §3a.4).
3. **Plugin aus der Vorlage an die Repo-Wurzel** — `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/` in die Wurzel
   des Satelliten (das Repo IST das Plugin), `.vorlage`-Endungen entfernen, Variablen nach
   `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/VORLAGE.md`, Startversion `0.1.0`, `dependencies: ["oai"]`.
   Pflichtinhalte und Wurzel-`CLAUDE.md` als `@`-Import-Zeiger: **§3a.1a**.
4. **Satelliten-Testsuite** im Mindestumfang **§3a.1b** + `.github/workflows/quality.yml` mit
   SHA-gepinnten Actions.
5. **Abteilungs-SSOT als Neuanlage** aus `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage`
   (**§3a.1c**, Zweig „Neuanlage"). Die Kandidaten-Queue entsteht **direkt** in der
   Norm-Kategorie `Kandidaten-Queue/queue.md`; ein Übergangsfeld `uebergang` in der
   `pflege-auspraegung.json` entsteht auf diesem Weg **nie** — es gibt keinen Übergang.
   **Sichtbarkeit (Spec-Nachtrag 2026-08-25):** Die Abteilungs-SSOT ist **privat** und bleibt
   es. In den Kern steigt je Kandidat ein **konzentriertes Fakten-Dokument** auf; das
   Vollprotokoll bleibt hier, Zugriff darauf wird bei Bedarf angefragt — kein Umzug, keine
   Kopie. Deshalb trägt jede Queue-Zeile in „Verweis" einen **auflösbaren Ort**
   (repo-relativer Pfad, PR oder Commit), nie einen Prosa-Befund: Ohne Fundstelle ist die
   Zugriffsanfrage nicht formulierbar.
6. **Skills nach `skill-authoring.md`** bauen.
7. **Validieren, beide Ebenen:** `claude plugin validate .` in der Marketplace-Wurzel des
   OS-Repos **und** `claude plugin validate <satelliten-wurzel>` **ohne `--strict`**.
   Satelliten mit Wurzel-`CLAUDE.md` (Ebene-2-`@`-Import) erzeugen unter `--strict` das
   Advisory „CLAUDE.md at the plugin root is not loaded as project context" — bekannt und
   toleriert (Marketing/Development identisch).
8. **Externe Review vor dem ersten Push** (Implementierer ≠ Reviewer) — wie **§3a.3**.
9. **Veröffentlichen (nur mit Maintainer-Freigabe):** pushen, annotierten Tag `v0.1.0` pushen,
   GitHub-Release erzeugen; Sichtbarkeit/Org/Tag/Release per `gh` belegen — wie **§3a.4**.
10. **Marketplace-Ersteintrag im OS-Repo** — sofort als
    `{"source":"github","repo":"onsite-ai-devs/Onsite.ai-OS-<Abteilung>","ref":"v0.1.0","sha":"<40-hex>"}`,
    dazu `name`, `description`, `category: "abteilung"` — **kein `version`** (Mechanik-Fakt 6).
    Pin-Regel und **Tag-Objekt-SHA-Falle** aus **§3a.5** gelten unverändert. **Reihenfolge-
    Invariante:** erst Schritt 9, dann dieser — der zu pinnende Commit existiert vorher nicht.
    Ein lokaler `./plugins/…`-Eintrag entsteht nie, also entfällt das Umpinnen ersatzlos.
11. **Registry-Metadaten** in `plugins/oai/module-registry.json` nach der Feldtabelle **§3a.6**:
    `repository`, `repoSkillsPath: "skills"`, `staendig: false`, `minCoreVersion`, Status —
    **kein** `rahmen`-Feld (das trägt nur `gemeinsam`), `workflow` relativ zur Satelliten-Wurzel
    oder weglassen.
12. **Install-Probe** in isoliertem `CLAUDE_CONFIG_DIR` samt **SSH-Falle** (§3a.8); danach je
    Maschine `/oai:init`, damit `abteilungsRepoPfad` in `~/.claude/oai/infra.json` steht.
13. **Doku-Nachzug** nach der Änderungs-Matrix des `Aktualisierungs-Index` + **PR-Ergebnismemo** mit
    gekennzeichnetem Produktanteil. **Kein Bump, kein CHANGELOG im Strang** (Aktualisierungs-Index §0/§3.6).
14. **Kein Commit/Push ohne Freigabe des Maintainers.** Zentral: eigener Branch → PR → Merge.

**Was auf diesem Weg entfällt:** Umzug (§3a.1c-Zweig „Umzug"), Umpinnen (§3a.5-Wechsel),
OS-Repo-Rückbau (§3a.7) und der Übergangs-Doku-Sweep. Genau das ist der Gewinn.

### 3.2 Sonderfall: Reservierungsanlage im OS-Repo (nur ohne Inhalt)

Zulässig **ausschließlich**, solange die Abteilung keinen Inhalt trägt (§3.0). Zweck ist allein,
Abteilungsgrenze und Namespace zu belegen, bis die fachliche Planung mit dem Fachbereich steht
(§15.10). **Befristet:** Der Zustand endet mit dem ersten Inhalt — dann greift §3a, **bevor**
dieser Inhalt gebaut wird.

1. **Pflicht-Einstieg** laut `CLAUDE.md` erledigen (Log, Status, CHANGELOG, jüngste Spec).
2. **Vorlage kopieren:** `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/` → `plugins/oai-<abteilung>/`. Die
   Vorlagendateien tragen `.vorlage`-Endung; beim Kopieren umbenennen.
3. **Variablen setzen** (Tabelle in `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/VORLAGE.md`): Plugin-Name,
   Abteilung, Beschreibung, Startversion `0.1.0`, `dependencies: ["oai"]`.
4. **Marketplace-Eintrag ergänzen** in `.claude-plugin/marketplace.json`: `name`, `source`
   `./plugins/oai-<abteilung>`, `description`, `category: "abteilung"` — **kein `version`**
   (siehe Mechanik-Fakt 6). Die `description` benennt den Zustand als **Reservierung**, damit
   der Installationsdialog niemanden über den Ausbaustand täuscht.
5. **Registry-Metadaten ergänzen** in `plugins/oai/module-registry.json` (Abteilung, Plugin,
   Namespace, `staendig: false`, `minCoreVersion`, Status, `repoSkillsPath`).
6. **Keine Skills.** Ein Plugin ohne `skills/`-Inhalt ist gültig und reserviert Abteilungsgrenze
   und Namespace — das ist der **einzige** Grund, diesen Weg zu gehen. Entsteht der erste Skill,
   ist die Weiche gekippt (§3.0) und §3a fällig.
7. **Validieren, beide Ebenen:**
   ```
   claude plugin validate .                       # nur das Marketplace-Manifest
   claude plugin validate plugins/<name>           # Manifest UND Skills
   ```
   **Die Wurzel-Variante allein genügt nie** — sie prüft keine Skills. Genau diese Lücke ließ
   19 von 22 Skills mit nicht parsender Frontmatter unentdeckt (2026-07-26).
8. **Testsuite** des Kerns laufen lassen, wenn Hooks berührt wurden:
   `node --test plugins/oai/tests/*.test.mjs` (Verzeichnisargumente funktionieren nicht —
   Node erwartet Dateien bzw. Glob-Muster).
9. **Install-Probe** lokal (Beleg im Ergebnis dokumentieren):
   ```
   /plugin marketplace add <pfad-zum-repo>
   /plugin install oai-<abteilung>@onsite-ai-os
   ```
   Erwartung: Der Kern `oai` erscheint als mitinstallierte Dependency, `/oai:os-info` listet
   beide Plugins, und kein Skill einer **nicht** installierten Abteilung ist sichtbar.
10. **Doku-Nachzug** nach der Änderungs-Matrix des `Aktualisierungs-Index` und **PR-Ergebnismemo** mit
    gekennzeichnetem Produktanteil. **Kein Bump, kein CHANGELOG-Eintrag im Strang** — beides
    vergibt der Release-Zug aus den Memos (Aktualisierungs-Index §0/§3.6): die Startversion steht im
    Manifest, geschnitten wird sie am Zug. Einen ausführenden
    Skill gibt es seit 2026-08-17 nicht mehr (§15.43) — den mechanisch prüfbaren Teil fährt
    der CI-Prüfzyklus, alles Übrige das Maintainer-Review am PR.
11. **Kein Commit/Push ohne Freigabe des Maintainers.**

## 3a. Abteilung in ein Satelliten-Repo auslagern (Extraktion)

**Anwendungsbereich seit Spec §15.53:** Dieser Abschnitt ist der **Nachzugsweg**, nicht der
Anlageweg. Er greift in genau zwei Lagen:

- eine nach **§3.2** inhaltsleer angelegte Abteilung bekommt ihren ersten Inhalt — dann ist die
  Extraktion fällig, **bevor** dieser Inhalt gebaut wird (§3.0, Weichenwechsel);
- **Altbestand**, der vor der Weiche im OS-Repo entstanden ist.

Für eine **neue Abteilung mit Inhalt** ist er nicht der Weg — die läuft über **§3.1**
(Direktanlage) und braucht weder Umzug noch Umpinnen noch Rückbau.

Gilt seit der Entscheidung 2026-07-27 (Spec §15.19) für **jede** Abteilung — die frühere
Ausnahme für `development` („Kernheimat") ist mit **Spec §15.33** (2026-08-14) aufgehoben; im
OS-Repo verbleiben nur noch Kern und Marketplace-Katalog. Referenzen: `oai-marketing` →
`onsite-ai-devs/Onsite.ai-OS-Marketing` (seit 2026-08-09 v0.3.x, Stand v0.4.1) und
`oai-development` → `onsite-ai-devs/Onsite.ai-OS-Development` (seit 2026-08-14, Start v0.11.0,
Stand v0.13.0 — erste Extraktion mit **SSOT-Umzug** statt Neuanlage). Die Schritte unten tragen seit dem
2026-08-17 die Lehren dieser ersten Durchführung (Herkunft: Bauplan
[`2026-08-17-satelliten-extraktion-dev-controlling.md`](<../Bauplan-archiv/2026-08-17-satelliten-extraktion-dev-controlling.md>)
§2–§4, gegen den Ist-Stand von Registry, Marketplace und Testsuite nachgemessen).

1. **Satellit bauen** — drei Teile in dieser Reihenfolge: Plugin-Inhalt (1a), Testsuite (1b),
   Abteilungs-SSOT (1c).

   **1a · Plugin-Inhalt an die Repo-Wurzel.** Inhalt von `plugins/oai-<abteilung>/` an die
   **Repo-Wurzel** des neuen Repos (das Repo IST das Plugin):
   `.claude-plugin/plugin.json`, `README.md`, `CHANGELOG.md`, `test/` mit
   Manifest-/Struktur-Tests (`node --test`, Mindestumfang unter 1b),
   `.github/workflows/quality.yml` mit SHA-gepinnten Actions, `.gitignore`. Mit umziehen
   **alles, was das Plugin ausmacht**: `<abteilung>-abteilungs-claude.md` an der Plugin-Wurzel
   samt Wurzel-`CLAUDE.md` als `@`-Import-Zeiger und `pflege-auspraegung.json` (§1,
   „Abteilungs-CLAUDE und Sparse-Clone-Regel"). Eigene Hooks sind nach der Hook-Norm W4
   (§1: Auslieferung startet kern-hookfrei; etablierte Satelliten dürfen spezialisierte,
   nicht-redundante, nicht-kollidierende Hooks tragen) **erlaubt** (der Satellit könnte
   Kern-Hooks ohnehin nicht erreichen) — die Prüfungs-Eigentums-Regel (keine Kern-Prüfung
   duplizieren oder abschwächen) gilt unverändert; `dependencies: ["oai"]` unverändert, Version
   nur in `plugin.json` (Mechanik-Fakt 6).

   **Startversions-Regel: die Zählung der Abteilung setzt fort, sie beginnt nie bei `0.1.0`
   zurück.** Der dev-Satellit startete deshalb bei **`0.11.0`** — `0.10.3` war die letzte
   Kern-Repo-Fassung. Ein Reset wäre ein echtes Auslieferungsproblem: kein Auto-Update-Signal,
   und bereits installierte `0.10.3`-Stände blieben stehen (Auto-Update kennt kein Downgrade).
   Eine Abteilung ohne Vorgeschichte setzt ihre eigene Zählung ebenso fort (`oai-controlling`
   steht bei `0.1.0`), sie beginnt keine neue. Vergeben wird die Nummer wie jede Version am
   **Release-Zug** des Satelliten (`Aktualisierungs-Index` §3.6) — hier steht nur, **welche** Nummer gilt.

   **1b · Satelliten-Testsuite, Mindestumfang.** Ein plattenbasierter Scan endet an der
   Repo-Grenze: Zieht ein geprüftes Artefakt in ein anderes Repo, wird die im Kern
   zurückgebliebene Prüfung **nicht rot** — sie findet nur nichts mehr und meldet grün
   (Herleitung und die Agenten-Ausprägung dieser Regel: `subagenten-bau.md` §7). Die Suite des
   Satelliten prüft deshalb mindestens:
   - **Frontmatter-Parsbarkeit jeder `SKILL.md`** — nicht bloß deren Existenz. Genau diese
     Lücke ließ am 2026-07-26 **19 von 22 Skills** mit nicht parsender Frontmatter unentdeckt;
     das erste Satelliten-Testmuster (`oai-marketing`) prüfte nur Existenz und hätte den
     Vorfall wiederholt.
   - **Kern-Hook-Invariante (W4):** ein frisch ausgelieferter Satellit trägt keine Hooks —
     Hooks kommen erst in einen etablierten Satelliten (spezialisiert, nicht-redundant,
     nicht-kollidierend; §1 Hook-Norm).
   - **Platzhalter-Invariante:** keine offenen Vorlagen-Platzhalter im ausgelieferten Plugin.
   - **Release-Tag-Invariante:** jede veröffentlichte CHANGELOG-Version außer der jüngsten ist
     getaggt.
   - Bringt der Satellit ein `agents/`-Verzeichnis mit, wandert der portable Prüfbaustein
     `agenten.test.mjs` im selben Zug mit (`subagenten-bau.md` §7).

   Prüffrage bei jedem Umzug und jedem Rückbau: **„Welche Prüfung verliert hier ihren
   Gegenstand?"**

   **1c · Abteilungs-SSOT überführen.** Zuerst die Entscheidung **Umzug oder Neuanlage**:
   - **Umzug**, wenn die Abteilung im OS-Repo bereits Sitzungswissen führt
     (`knowledge base/sitzungswissen/<abteilung>/` mit `stand.md` und Journalen) oder eine
     gefüllte Kandidaten-Queue hat — dann werden die Inhalte **übernommen**, nicht neu
     angelegt. Die Historie bleibt im OS-Repo nachlesbar: **kein History-Rewrite**.
   - **Neuanlage** nur bei einer Abteilung ohne eigenes Sitzungswissen (Platzhalter) — dann aus
     `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/ssot-grundgeruest.md.vorlage`.

   **Queue-Normierung — der Fallstrick des Umzugs:** Die Kandidaten-Queue landet im Satelliten
   in der **Norm-Kategorie `Kandidaten-Queue/queue.md`** (§15.31.1), nicht dort, wo sie im
   Kern-Repo lag. Ein 1:1-Mitumzug unter `sitzungswissen/` wäre **test-grün, aber norm-widrig**.
   In derselben Änderung: `queuePfad` der `pflege-auspraegung.json` auf die Norm-Kategorie
   ziehen, das Übergangsfeld `uebergang` entfernen (der Übergangszustand endet mit der
   Extraktion) und die mitreisenden Übergangs-Texte tilgen (`workflow.md`, Abteilungs-CLAUDE).
   Die Queue bleibt **append-only** — Altzeilen werden dabei nicht umgeschrieben.

   Der **satelliteneigene SSOT-Document-Index** führt danach jede übernommene Datei
   (testerzwungenes Muster). **Umzugs-Beleg erzeugen, nicht behaupten:** `diff -r` über die
   übernommenen Verzeichnisse und `shasum -a 256` auf Referenzdateien — dieser Beleg ist die
   Voraussetzung für das Löschen in Schritt 7.
2. **Verifizieren:** `node --test`, `claude plugin validate .`, `git diff --check`.
3. **Externe Review vor dem ersten Push** (Implementierer ≠ Reviewer).
4. **Veröffentlichen (nur mit Maintainer-Freigabe):** privates Repo
   `onsite-ai-devs/Onsite.ai-OS-<Abteilung>` anlegen — nach §3.1 Schritt 2 grundsätzlich
   **delegiert an den bauenden Agenten** (freigabepflichtige Beauftragung, kein roter-
   Linien-Schritt) —, pushen, annotierten Tag `v<version>` pushen, GitHub Release erzeugen;
   danach Sichtbarkeit/Org/Tag/Release per `gh` belegen. Push auf `main`, Tag-Push und
   Release bleiben **rote Linie**.
5. **Marketplace umpinnen:** Eintrag von `"./plugins/oai-<abteilung>"` auf
   `{"source":"github","repo":"onsite-ai-devs/Onsite.ai-OS-<Abteilung>","ref":"v<version>","sha":"<40-stelliger Commit-SHA>"}`
   — der `sha` ist der effektive Pin, `ref` dient der Lesbarkeit (Doku plugin-marketplaces).
   **Reihenfolge-Invariante:** Dieser Schritt ist erst nach Schritt 4 möglich — der zu pinnende
   Commit existiert erst mit dem veröffentlichten Tag. Zwischen Release und Merge liegen die
   Dateien deshalb zwangsläufig doppelt; eindeutig ist in diesem Fenster allein die
   Installationsquelle, und die wechselt atomar mit Schritt 7.

   **Pin-Regel — der SHA wird ermittelt, nicht abgeschrieben:**
   ```
   git rev-parse v<version>^{commit}                       # im Satelliten-Klon
   git ls-remote <satelliten-remote> "refs/tags/v<version>^{}"   # Gegenprobe vor dem Merge
   ```
   ⚠️ **Tag-Objekt-SHA-Falle:** Ein **annotierter** Tag ist ein eigenes Git-Objekt mit eigenem
   SHA. `git rev-parse v<version>` **ohne** `^{commit}` liefert genau diesen Tag-Objekt-SHA —
   er besteht die 40-Hex-Formatprüfung der Testsuite anstandslos, **bricht aber die
   Installation**. Beide Kommandos müssen denselben SHA liefern; tun sie es nicht, wird nicht
   gepinnt.
6. **Registry** (`plugins/oai/module-registry.json`): Beim Eintrag der Abteilung **jedes Feld
   durchgehen, dessen Wert wie ein Pfad aussieht** (`/` oder `.md`) — nach der Extraktion sind
   Kern-Repo-Pfade dort tot:

   | Feld | bei der Extraktion |
   |---|---|
   | `repository` | **ergänzen**: `onsite-ai-devs/Onsite.ai-OS-<Abteilung>` |
   | `repoSkillsPath` | `plugins/oai-<abteilung>/skills` → **`skills`** (relativ zur Satelliten-Wurzel) |
   | `workflow` | `plugins/oai-<abteilung>/workflow.md` → **`workflow.md`** — oder entfernen, wenn der Satellit keine führt (`oai-marketing` führt das Feld nicht); Anlass-Test in `workflow-md-implementierung.md` |
   | `rahmen` | trägt **nur** die ständige Abteilung `gemeinsam` (`plugins/oai/wp-rahmen.md`); in einem Satelliten-Eintrag hat ein OS-Repo-Pfad nichts zu suchen |
   | `status` (Freitext) | nennt Pfade und Zustände (Norm-Kategorie, Skill-/Modulzahl, Satelliten-Version) — mitziehen |
   | `agents` | Segment bleibt **hier** gepflegt, die Dateien liegen im Satelliten (Registry-Kopf) |

   **Warum die Liste und nicht zwei Beispiele:** Testerzwungen sind nur `repository`,
   `repoSkillsPath` und der Abgleich Registry↔Marketplace-Pin (`struktur.test.mjs`).
   `workflow`, `rahmen` und `status` prüft **kein** Test — bei der dev-Extraktion wäre
   `workflow` deshalb beinahe als toter Kern-Repo-Pfad stehengeblieben.
7. **OS-Repo aufräumen:** `plugins/oai-<abteilung>/` entfernen (der Satellit ist die einzige
   Quelle) und — im Umzugsfall — `knowledge base/sitzungswissen/<abteilung>/` samt Queue, aber
   **erst nach dem Umzugs-Beleg aus 1c**. Pin (Schritt 5) und Rückbau gehören **atomar in einen
   PR**: sonst zeigt die Auslieferung zeitweise auf zwei Quellen, und der Rollback ist nicht
   mehr ein einziges `git revert`.

   **Doku-Sweep als Suche, nicht als Gedächtnisleistung:** `grep -rn` über das ganze Repo nach
   `oai-<abteilung>` **und** nach den Übergangs-Begriffen `Übergang`, `bis zur Extraktion`,
   `kernRepoPfad`. *Welche* Dokumente in derselben Änderung nachzuziehen sind, führt der
   [`Aktualisierungs-Index`](<Aktualisierungs-Index.md>), Zeile „Abteilung in Satelliten-Repo
   auslagern" — hier bewusst nicht zweitgeschrieben. Die bei der dev-Durchführung **nicht
   offensichtlichen** Fundstellen, die dort nicht einzeln stehen:
   - **Kern-Skills:** `plugins/oai/skills/end-session/SKILL.md` trug einen
     abteilungsspezifischen Übergangs-Queue-Absatz.
   - **Kern-Referenzen:** `plugins/oai/skills/init/infra-registry.md` und
     `plugins/oai/referenz/pflege-auspraegung.md` (Beispiel- und Regeltexte je Abteilung).
   - **Kern-Wissensbasis:** `SSOT-Document-Index.md` (Zeilen der Kategorie `sitzungswissen/`),
     Roll-up-Index, Offene-Stränge-Register, `knowledge base/plugin-maintanance-ruleset-source/vorlagen/abteilungsplugin/*`.
   - **Historisches bleibt unangetastet** (Drift-Regel `CLAUDE.md`): CHANGELOG-Alteinträge,
     Design-Spec, `Bauplan-archiv/`, die append-only-Protokolle.

   **Test-Anpassung:** `node --test plugins/oai/tests/*.test.mjs` — die Kern-Invarianten prüfen
   SHA-Pin und Registry↔Pin-Konsistenz. Achtung: Der Rückbau macht die Suite **nicht** rot, er
   nimmt ihr nur Gegenstände (1b). Was der Kern dabei verliert, muss vorher im Satelliten
   stehen.

   **Buchführung:** Der Rückbau fasst Produktklassen-Pfade an (`plugins/**`,
   `.claude-plugin/**`) — der Strang baut trotzdem **versionslos** und schreibt **kein
   CHANGELOG**; Version und CHANGELOG vergibt der Release-Zug aus dem PR-Ergebnismemo
   (`Aktualisierungs-Index` §0/§3.6). Ältere Formulierungen, die hier einen Bump im Strang verlangen, sind
   damit überholt.
8. **Install-Probe** in isoliertem `CLAUDE_CONFIG_DIR` (wie §3.2.9): Kern kommt transitiv,
   nicht installierte Abteilungen bleiben unsichtbar. **SSH-Falle (verifiziert 2026-07-27):**
   GitHub-Shorthand-Sources klonen per Default über SSH — auf Maschinen ohne geladenen
   SSH-Key schlägt die Installation mit `Permission denied (publickey)` fehl; Abhilfe:
   `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` setzen (nutzt die gh/git-Credentials) oder SSH-Key
   einrichten. Für den Team-Rollout dokumentieren.
   **Infra-Registry nachziehen (je Maschine, nach dem Merge):** einmal `/oai:init` laufen
   lassen, damit `abteilungsRepoPfad` in `~/.claude/oai/infra.json` auf den Satelliten-Klon
   zeigt — das ist **nicht** die `module-registry.json` aus Schritt 6, sondern der
   maschinenlokale Zustand. Bis dahin meldet `/oai:end-session` Kandidaten als *nicht abgelegt*
   und verweist auf `/oai:init`; das ist der vorgesehene Befund, **kein** Sonder-Patch.
9. Zentral: eigener Branch → PR → Maintainer-Merge (kein direkter main-Push).

## 4. Bekannte Fehler — nicht wiederholen

| Fehler | Folge | Vermeidung |
|---|---|---|
| Nur `claude plugin validate .` geprüft | Skill-Fehler bleiben unsichtbar, Frontmatter-Bruch fällt nie auf | immer zusätzlich je Plugin validieren |
| `description` mit `Trigger-Begriffe: …` als unquotierter Plain-Scalar | Frontmatter parst nicht, Skill lädt ohne `name`/`description` und triggert nie | `>-`-Block verwenden (`skill-authoring.md`) |
| Repo-Pfad (`knowledge base/…`) als Leseanweisung im Skill | Nach Installation nicht auflösbar | Datei ins Plugin legen oder als Quellenangabe kennzeichnen |
| Komponenten in `.claude-plugin/` gelegt | Plugin lädt, Komponenten fehlen still | alles außer `plugin.json` ins Plugin-Wurzelverzeichnis |
| Version nicht gebumpt | kein Auto-Update im Team | **Nicht im Strang nachholen** — den Bump und die CHANGELOG-Sektion vergibt der Release-Zug (Aktualisierungs-Index §3.6). Sorge stattdessen für ein gutes PR-Ergebnismemo mit gekennzeichnetem Produktanteil; der Zug liest daraus. Die CI erinnert an den fälligen Zug (Detektor, Aktualisierungs-Index §3.6) |
| Kern-Prüfung im Abteilungs-Hook dupliziert | dasselbe Gate feuert doppelt | Prüfungs-Eigentum (§15.22): jede Prüfung hat genau ein Heimat-Plugin; Hooks in einen Satelliten erst nach Etablierung, spezialisiert und nicht-kollidierend (Hook-Norm W4, §1) |
| Version in `plugin.json` **und** Marketplace-Eintrag gesetzt | Der Marketplace-Wert wird ohne Warnung ignoriert; eine veraltete Manifest-Version maskiert ihn still | `version` gehört **nur** in `plugin.json` |
| Struktur-Invarianten nur ad hoc geprüft | Regression fällt erst beim Nutzer auf | `plugins/oai/tests/struktur.test.mjs` prüft Manifeste, Namespaces, Frontmatter, die Kern-Hook-Invariante (W4: Auslieferung trägt nur Kern-Hooks) und die Plugin-Grenze bei jedem `node --test` |
| Struktur-Umbau ohne Blick in fremde Worktrees | ungemergte Arbeit wird überfahren | `git worktree list` und in jedem Baum `git status` **vor** dem ersten Schreiben |
