# AGENTS.md — NovaCoreAI-OS

> **Dieses Repo IST das Produkt.** NovaCore-OS ist eine **Familie von Claude-Code-Plugins**
> (Kern `nc` plus je Abteilung ein Plugin; Skills, Hooks), die aus einem Marketplace als
> „Betriebssystem für KI-Arbeit" an das NovaCore-Team verteilt wird — eine Methode für alle
> statt vieler Privat-Setups. Wer hier arbeitet, baut am Werkzeug der Firma, nicht an einer
> Anwendung. Diese Datei ist die **normative Einstiegs-Doku für alle Agenten** (die lokale
> `CLAUDE.md` ist bewusst un-getrackt und verweist hierher).

## Pflicht-Einstieg für jede Session (kein Blind-Start)

**Vor der ersten inhaltlichen Aktion, in dieser Reihenfolge:**

1. **Log-Stand abrufen:** `git log --oneline -10` und `git status` — was zuletzt geschah und
   ob gerade ein Umbau läuft. Zusätzlich `git worktree list` und in jedem fremden Baum
   `git status --short`: **der Working Tree ist die Wahrheit**, nicht der letzte Commit und
   nicht diese Datei.
2. **Produktstand:** `CHANGELOG.md` (autoritativ für „was ist gebaut / was fehlt") + `VERSION`.
3. **Planungsstand:** Specs/Pläne liegen final in `knowledge-base/grundwissen/` mit
   Datumspräfix — die jüngste Spec ist der aktuellste Planungsstand; die Produktvision
   (`NovaCore-OS-Produktarchitektur.md`) ist die Referenz für Vision-Abgleiche.
4. **Triage über den Master-Index:** `knowledge-base/SSOT-Document-Index.md` — Teil 1 sagt,
   wohin ein Dokument gehört, Teil 2 („Relevant wenn …") nennt je Quelle die
   Abruf-Situation. Vor Vermutungen dort nachsehen.
5. **Vor jeder Änderung:** `knowledge-base/standardprozesse/aktualisierungs-index.md` —
   die Änderungs-Matrix nennt je Änderungsart, was vorher zu lesen und was in derselben
   Änderung nachzuziehen ist.
6. **Aufgabenspezifisch nachladen** (Glossar unten): Skill-Arbeit →
   `plugins/nc/referenz/skill-authoring.md` · Plugin-/Marketplace-Arbeit →
   `knowledge-base/standardprozesse/plugin-bau.md` (neue Abteilung §3 · Satellit-Extraktion
   §3a · **eigenständiges Kollegen-/Abteilungs-OS §3b** — pilotiert 2026-07-28 mit
   `nc-felix`, inkl. Install-Fallen) · Workflow-Logik →
   `plugins/nc/wp-rahmen.md` (Rahmen WP0–WP8) und `plugins/nc-development/workflow.md`
   (Fachablauf) · Methodenfragen → `knowledge-base/standardprozesse/os-bau-methode.md`.

## Vision (Kurzfassung)

Sechs Schichten (Detail: `knowledge-base/grundwissen/NovaCore-OS-Produktarchitektur.md`):

1. **Verteilung** — ein Marketplace (`novacore-os`), mehrere Plugins (Kern + Abteilungen),
   versioniert je Plugin, Auto-Update fürs Team
2. **Wissen (SSOT)** — `nc-sync.md` (Global-Anweisung, im Kern ausgeliefert),
   Projekt-CLAUDEs, Projekt-Memory `.nc/erinnerung/` je Arbeits-Repo
3. **Pflicht-Workflow** — `/nc:start` → WP-Gates → `/nc:save-session`; Rahmen WP0–WP8
   normativ in `plugins/nc/wp-rahmen.md`, Fachablauf je Abteilung in deren `workflow.md`
4. **Abteilungen** — **je Abteilung ein Plugin** (`plugins/nc-<abteilung>/`, Kern als
   Dependency); Module = Skill-Präfix-Gruppen. Ständig: `gemeinsam` im Kern; fachlich zuerst:
   `development` mit Modulen `fe`/`be`/`flc`/`wzs`
5. **Kontrolle (deterministisch)** — Hooks nur im Kern: FFG (Fact-Forcing-Gate, markerlos);
   hier hat die KI kein Mitspracherecht
6. **Sandbox** — jeder baut eigene Skills nach den OS-Regeln; Bewährtes wandert per
   Fork-back ins OS

## Repo-Karte

| Pfad | Inhalt |
|---|---|
| `AGENTS.md` | diese Datei — normativer Einstieg, Regeln, Karte, Pflegeprozess |
| `README.md` | Team-/Contributor-Sicht: Architektur, Skill-Katalog, Installation |
| `ONBOARDING.md` | Ersteinrichtung + Migration von v0.2.0 |
| `CHANGELOG.md` | autoritative Änderungshistorie (Keep a Changelog) |
| `VERSION` | Produkt-Leitversion (SemVer) = Version des Kern-Plugins |
| `.claude-plugin/marketplace.json` | Marketplace `novacore-os` — Einträge ohne `version`-Feld (die steht allein in der jeweiligen `plugin.json`); die Repo-Wurzel ist **nur** Marketplace-Wurzel, kein Plugin |
| `.github/workflows/` | `ci.yml` (Ubuntu+Windows × Node 20/22/24, Suite + Validator-Positivkontrolle) und `release.yml` (Tag `nc--v*` → GitHub-Release aus dem CHANGELOG-Abschnitt) |
| `plugins/nc/` | **Kern-Plugin** (Namespace `/nc:`), Dependency jedes Abteilungsplugins — Skills `start`/`save-session`/`journal`/`setup`/`doku-sync`/`os-info`/`skill-builder`, Hooks (Gate 1: `nc-ffg.js`; Gate 2: `nc-session-start.js` + `nc-start-gate.js` + `nc-start-stempel.js`; dazu `nc-doks-autosync.js`) mit geteilter `hooks/lib/` (`session-key.js`, `bash-analyse.js`, `shell-substitution.js`), `doks/global-claude-firmenblock.md` (Ebene-1-Payload), `wp-rahmen.md`, `module-registry.json` (Metadaten-SSOT), `referenz/skill-authoring.md`, `nc-sync.md`, `tests/` |
| `plugins/nc-development/` | Abteilung `development` (Namespace `/nc-development:`): 11 Skills in 4 Modulen (`fe`/`be`/`flc`/`wzs`, flaches Layout) + `workflow.md` (Fachablauf WP1–WP7) |
| `vorlagen/abteilungsplugin/` | Vorlage für neue Abteilungsplugins — **kein Plugin** (`.vorlage`-Endungen) |
| `knowledge-base/` | Wissensbasis — Glossar im nächsten Abschnitt |
| `docs/superpowers/specs/` | historische v0.1.0-Design-Spec (unverändert lassen) |
| `_wzs-*-backup-*/` | Alt-Backups vom 2026-07-07 (Aufräum-Kandidat für den Maintainer, nicht anfassen) |

## Glossar der Wissensbasis (`knowledge-base/`)

| Kategorie | Zweck | Wann konsultieren |
|---|---|---|
| **`SSOT-Document-Index.md`** (Wurzel) | **Master-Index** der Wissensbasis: Teil 1 Ordner-Routing (wohin gehört ein Dokument), Teil 2 Quellen-Triage („Relevant wenn …") über alle Bestandsdateien. **Einzige Datei auf Wurzelebene** (testerzwungen) | **zuerst** — vor dem Griff in eine Kategorie und vor dem Anlegen/Verschieben/Löschen einer Wissensdatei |
| `grundwissen/` | Produktvision, Begriffsnormen (SSOT-, Gates-, CLAUDE-Ebenen-Definition), Design-Specs und Pläne (Datumspräfix; jüngste Datei = Planungsstand) | Vision-/Architektur-Fragen; vor Design-Entscheidungen; Planungsarbeit; wenn ein Begriff (SSOT, Gate, CLAUDE-Ebene) erklärt oder abgegrenzt werden muss |
| `standardprozesse/` | verbindliche Abläufe: `aktualisierungs-index.md` (**„ich ändere X — was muss ich anfassen"**, Langfassung der Sync-Matrix + Prüfzyklus + Selbsttest), `plugin-bau.md` (Plugin-/Marketplace-Ebene), `os-bau-methode.md` (Gesamt-Methode, an die Firmenphilosophie anpassbar) | vor **jeder** inhaltlichen Änderung am Plugin oder Repo — zuerst prüfen, ob ein Standardprozess existiert |
| `debugging-findings/` | `agent-learnings.md` — Agenten-Fehlerprotokoll (append-only Pflicht) | bei Debugging; nach jedem eigenen Fehler; vor neuen Aufgaben (eigene Fehlermuster) |

**Zwei Indizes, zwei Fragen** — beide gehören zum Ablauf, in dieser Reihenfolge:
`SSOT-Document-Index.md` beantwortet *„welches Dokument existiert, wohin gehört es, wann
brauche ich es"*; `standardprozesse/aktualisierungs-index.md` beantwortet *„ich ändere X — was
muss ich alles mitändern"*.

Die **SKILL.md-Formatregeln** (`skill-authoring.md`) liegen **nicht** hier, sondern im
Kern-Plugin (`plugins/nc/referenz/`), weil sie zur Laufzeit mit ausgeliefert werden — ein
installiertes Plugin kann nicht auf Repo-Pfade zugreifen.

## Produktstand & Versionslogik

- **Gebaut (Kern v0.3.0, Umbau 2026-07-28):** Multi-Plugin-Schnitt umgesetzt — Marketplace
  `novacore-os` mit Kern `nc` (3 Skills, FFG v2 + Session-Start-Hook, WP-Rahmen, Registry,
  Formatregeln, Testsuite) und `nc-development` 0.1.0 (11 Skills in 4 Modulen,
  `dependencies: ["nc"]`). Die frühere eigene CLI (`ncos`, setup/update-Skripte) ist
  **ersatzlos abgeschafft** — Verteilung und Updates laufen ausschließlich über den
  Marketplace. Das alte marker-gebundene Safety-Gate ist im Destruktiv-Gate des FFG
  aufgegangen (markerlos, deny statt ask); der `.nc-os`-Marker scopte damals nur noch den
  Session-Start-**Hinweis** — seit 0.6.0 hat er **gar keine Funktion mehr** (siehe unten). Team-Mindestversion Claude Code ≥ 2.1.193.
- **Gebaut (Kern v0.4.0, 2026-07-28):** Zweite Abteilung `felix` als **erster Satellit**
  angelegt — Plugin `nc-felix` 0.2.0 im eigenen privaten Repo
  `NovaCore-AI/Felix-OS` (das Repo IST das Plugin), Marketplace-Eintrag per
  GitHub-Source mit Commit-SHA-Pin, Registry-Eintrag (Kern-Bump 0.3.0 → 0.4.0 wegen
  Registry-Erweiterung). **Eigenständiges Felix-OS:** Module statt Abteilungen, keine
  Kern-Dependency — Kernmodul (start, save-session, journal, os-info, code-tour,
  skill-builder) und eigene Kontroll-Schicht (FFG-Port) liegen im Plugin; nicht parallel
  zu `nc` betreiben. Arbeitsmodule folgen mit dem Fachbereich. Spec-Nachtrag: jüngste
  Design-Spec, §10.
- **Gebaut (Kern v0.5.0, 2026-08-05):** Dritte Abteilung `biggi` als **zweiter Satellit**
  angelegt — Plugin `nc-biggi` 0.1.1 im eigenen privaten Repo `NovaCore-AI/Biggi-OS`
  (das Repo IST das Plugin), Marketplace-Eintrag per GitHub-Source mit Commit-SHA-Pin,
  Registry-Eintrag (Kern-Bump 0.4.0 → 0.5.0 wegen Registry-Erweiterung). Eigenständiges
  Biggi-OS nach dem Felix-Muster, architektonisch am Onsite-Vorbild ausgerichtet
  (Maintainer-Leitlinie: bei Unterschieden gewinnt Onsite): Session-Start-Zwang statt
  Marker-Begrüßung, FFG mit Felix-Härtungen + Onsite-`exitCode`-Fix, CI/`release.yml`
  nach Onsite-Standard. Arbeitsmodul-Konvention reserviert: `controlling` (`ctrl`),
  `medizinisches` (`mdzn`), `dokumentation-daily-work` (`doc` + `day` — ein Modul, zwei
  Präfixe). Pilotierter Ablauf als `plugin-bau.md` **§3b** formalisiert; Felix-Tags/
  -Releases nachgezogen, Pin auf `v0.2.1`. Spec-Nachtrag: jüngste Design-Spec, §11.
- **Gebaut (Kern v0.6.0, 2026-08-10): Onsite-Align-Umbau** nach Bauplan
  `grundwissen/2026-08-10-onsite-align-umbau-bauplan.md` (AP1–AP8). **Gate 2
  (Session-Start-Zwang) ist jetzt gebaut** — zweiteilig nach dem Zangen-Prinzip:
  `nc-session-start.js` injiziert Pflicht-Einstieg + lebenden Projektstand,
  `nc-start-gate.js` lehnt jede schreibende Aktion ab, bis `/nc:start` per Fakten-Stempel
  (`nc-start-stempel.js`, verifiziert Branch/HEAD gegen die reale Git-Lage) abgeschlossen
  ist; **der `.nc-os`-Marker hat keine Funktion mehr**. Dazu: FFG-Angleich (geteilte
  `hooks/lib/session-key.js`, `process.exitCode` statt `process.exit`, erweiterte
  Read-only-Git-Erkennung) unter Beibehaltung aller NC-Review-Härtungen · **Doks-Autosync**
  (`nc-doks-autosync.js` + `doks/global-claude-firmenblock.md`, CLAUDE-Ebene 1) ·
  **SSOT-Infrastruktur** (Master-Index + Aktualisierungs-Index + drei Begriffsnormen) ·
  drei Kern-Infrapflege-Skills · CI/Release-Workflows · Marketplace-Kategorie `affiliate`.
  Nachtrag 2026-08-11: **`/nc:setup` — SSOT-Provisionierung** (Bauplan
  `grundwissen/2026-08-10-ssot-provisionierung-bauplan.md`): klont die Wissensbasis voll
  nach `~/.nc/ssot/<repo-name>/`, Verlinkung über den festen Pfad im Firmen-Block, per
  Fast-Forward aktuell; nach dem Livetest korrigiert (PR #13, Nachtrag N1).
  **Bewusst ausgeschlossen:** Queue-Logik/SSOT-Abstufung des Vorbilds und jeder
  Memory-Share zwischen Satelliten (Maintainer-Entscheid; siehe SSOT-Definition).
- **Gebaut (Kern v0.6.1, 2026-08-11):** `/nc:setup` heilt **Sparse-Relikte der
  Erstfassung** — eine bestehende Sparse-Kopie wird vor dem Pull per
  `git sparse-checkout disable` zum Vollklon erweitert und explizit gemeldet (vorher:
  stiller Falscherfolg „aktualisiert"). ONBOARDING um den WSL-Hinweis ergänzt („WSL zählt
  als eigener Rechner"). Patch-Bump, weil die Erstfassung im Feld installiert ist — ohne
  Bump erreicht kein Fix ein installiertes Plugin (Bauplan-Nachtrag N2).
- **Noch nicht gebaut:** Gate 3 (Safety-Gate mit echtem Freigabedialog), Gate 4
  (Sitzungsabschluss als Hook), CLAUDE-Ebene 0 und 2, weitere fe-/be-Skills, Module
  `architecture`/`incident-support`. Übersicht:
  `grundwissen/NovaCore-OS-Gates-Definition.md`.
- **Versionsmodell:** **Je Plugin eine Version, genau an einer Stelle:**
  `plugins/<name>/.claude-plugin/plugin.json`. Marketplace-Einträge tragen **kein**
  `version`-Feld (Claude Code nutzt den `plugin.json`-Wert „without warning" — Doku
  plugin-marketplaces, verifiziert 2026-07-28). Die **Kern-Version ist die
  Produkt-Leitversion**, gespiegelt in `VERSION` und `plugins/nc/module-registry.json`
  (Struktur-Test erzwingt Gleichstand). Abteilungsplugins zählen eigenständig
  (`nc-development` startet bei 0.1.0, der Kern steht bei 0.3.0) — die frühere
  Vier-Dateien-Gleichstand-Regel ist aufgehoben; `package.json` trägt bewusst keine Version
  mehr. Kein Bump = kein Auto-Update. Schema: Neuerung → Minor · Fix → Patch ·
  Strukturbruch → groß. Git-Tags sind optional und folgen, wenn genutzt, dem Schema
  `{plugin-name}--v{version}` (`claude plugin tag`) — nötig werden sie erst für
  versionsbeschränkte Dependencies.

## Quellen-Hierarchie

Bei Widersprüchen zwischen Doku-Ebenen: **1.** jüngste Design-Spec (`grundwissen/`) →
**2.** Standardprozesse → **3.** Produktvision (Visionsebene). Gebaute Artefakte müssen der
Spec folgen; weicht ein Build bewusst ab, wird die Spec per Nachtrag nachgezogen — nie
stillschweigend. **Pfad-Angaben:** Bei Widersprüchen zwischen Doku und realer Struktur gilt
die Platte (Glob / `git status`) — danach diese Datei korrigieren (Pflegeprozess unten).
Stand-Aussagen immer gegen **drei** Ebenen prüfen: Vision ↔ Spec ↔ gebaute Artefakte.

## Verbindliche Konventionen

- **Deutsch** für alle Artefakte.
- **Keine personenbezogenen Pfade/Annahmen** — Team-Tool, nicht Einzelperson-Setup.
- **SKILL.md-Format:** strikt nach `plugins/nc/referenz/skill-authoring.md` (inkl.
  **YAML-Falle**: `description` mit „Trigger-Begriffe: …" immer als `>-`-Block).
- **Plugin-/Marketplace-Arbeit:** strikt nach `knowledge-base/standardprozesse/plugin-bau.md`.
- **Version-Bump:** ausschließlich in `plugins/<name>/.claude-plugin/plugin.json` (beim Kern
  zusätzlich `VERSION` + Registry) + CHANGELOG-Eintrag.
- **Kleine Dateien:** eine Datei pro Skill; Detailwissen als Referenzdatei daneben.
- **Rote Linien** (aus `wp-rahmen.md` des Kerns) gelten auch für Agenten, die IN diesem Repo
  arbeiten: keine Pushes, Merges, Releases oder Kundensichtbares ohne explizite Freigabe.

## Standardzyklus für Agenten in diesem Repo (verbindlich)

1. **Einstieg:** Pflicht-Einstieg oben vollständig ausführen.
2. **Source-of-Truth-Pflicht:** Vor Änderungen an Plugin-/Skill-/Marketplace-Format die
   offizielle Claude-Code-Doku abrufen (code.claude.com/docs: `skills`, `plugins-reference`,
   `plugin-marketplaces`) — nie aus dem Gedächtnis.
3. **Standardprozess-Check:** in `knowledge-base/standardprozesse/` prüfen, ob ein Prozess
   existiert — falls ja, ihm folgen; fehlt er und die Tätigkeit ist wiederkehrend, ihn dort
   im Anschluss dokumentieren.
4. **Fehlerprotokoll (ohne Ausnahme):** Jeder selbst gemachte Fehler sofort nach
   `knowledge-base/debugging-findings/agent-learnings.md` (Format in der Datei); vor neuen
   Aufgaben dort eigene Fehlermuster prüfen.
5. **Abschluss-Checkliste vor jedem Commit(-Vorschlag) und vor jedem Push — nie überspringen**
   (Doku, die nicht bei jedem relevanten Push mitgezogen wird, verrottet unbemerkt und lügt
   dann über den Stand — Lehre aus dem 0.2.0-Release, als Tag und GitHub-Release den
   Versionsdateien hinterherhinkten):
   - [ ] Doku gemäß Sync-Matrix nachgezogen (README bei Installation/Nutzung/Features,
         ONBOARDING bei Setup-Ablauf, diese Datei bei Pfaden/Architektur); Live-Verweise
         geprüft (`grep` nach alten Pfaden)
   - [ ] `CHANGELOG.md`-Eintrag unter `[Unreleased]` — Pflicht für jede Änderung, **mit
         Namenszeichnung des Agenten**; bei Release wandert `[Unreleased]` in einen
         `## [X.Y.Z] — Datum`-Block
   - [ ] Version-Bump des betroffenen Plugins (nur `plugin.json`; Kern: + `VERSION` + Registry)
   - [ ] Validierung beider Ebenen: `claude plugin validate .` **und**
         `claude plugin validate plugins/<name> --strict` je berührtem Plugin. Achtung
         (empirisch, CLI 2.1.220): Der Validator druckt `Validating skill:`-Zeilen nur bei
         **Befund** — ein stilles „Validation passed" ist das Erfolgssignal; die
         Frontmatter-Abdeckung sichern die Struktur-Tests.
   - [ ] Tests: `node --test plugins/nc/tests/*.test.mjs`
   - [ ] Fehlerprotokoll-Einträge der Session geschrieben
6. **Kein Commit/Push ohne explizite Freigabe des Maintainers.**

## Pflegeprozess dieser Datei und der lebenden Doku (verbindlich)

`AGENTS.md` und `README.md` sind **abgeleitete** Dokumente — Quelle der Wahrheit sind
Repo-Struktur, Manifeste, `CHANGELOG.md` und Spec.

1. **Gleicher Change, gleiche Pflege:** Wer Struktur, Pfade, Skills, Module oder Versionen
   ändert, zieht die betroffenen Doku-Abschnitte **in derselben Änderung** nach.
2. **Sync-Matrix:**

   | Änderung | Nachziehen in |
   |---|---|
   | Datei/Ordner verschoben/umbenannt/gelöscht | `knowledge-base/SSOT-Document-Index.md` (Teil 1 **und** Teil 2); Repo-Karte + Glossar (hier); README; alle Live-Verweise per `grep` |
   | Neue Wissensdatei in `knowledge-base/` | `knowledge-base/SSOT-Document-Index.md` Teil 2 (**testerzwungen**: Vollständigkeit + Linkgültigkeit); Glossar (hier) nur bei neuer Kategorie |
   | Hook / Gate geändert | `plugins/nc/hooks/hooks.json` (`description` trägt den Prosa-Zustand der ganzen Kontroll-Schicht), `grundwissen/NovaCore-OS-Gates-Definition.md`, README (Hook-Tabelle inkl. Opt-out-Envs), CHANGELOG — Details: `standardprozesse/aktualisierungs-index.md` §2.1 |
   | Pflicht-Einstieg / rote Linien geändert | der Text ist gespiegelt in `nc-session-start.js`, `skills/start/SKILL.md`, `doks/global-claude-firmenblock.md` und hier — alle vier gemeinsam, **plus Kern-Bump** |
   | Agent macht selbst einen Fehler | `debugging-findings/agent-learnings.md` (sofort, append-only) |
   | Skill neu / entfernt / umbenannt | Skill-Tabelle (README + Plugin-README), Trigger-Matrix (`workflow.md`), CHANGELOG, Registry |
   | Neues Modul | Registry, README, CHANGELOG, Repo-Karte (hier) |
   | **Neues Abteilungsplugin** | Standardprozess `plugin-bau.md` befolgen (Marketplace, Registry, hier, README, CHANGELOG, Install-Probe) |
   | Version-Bump | nur `plugin.json` (Kern: + `VERSION` + Registry) + CHANGELOG — **nie** im Marketplace-Eintrag |
   | Design-Entscheidung geändert | **zuerst** Spec-Nachtrag in `grundwissen/`, dann hier/README |

3. **Drift-Regel:** Toter Pfad oder falsche Angabe in dieser Datei → realen Zustand
   verifizieren (Glob / `git log`), sofort korrigieren, Korrektur im Ergebnis melden.
4. **Historisch bleibt historisch:** CHANGELOG-Alteinträge, die v0.1.0-Spec und Findings
   werden nie rückwirkend umgeschrieben; nachgezogen werden nur lebende Dokumente.
