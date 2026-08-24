# NovaCore-OS — Design-Spec Multi-Plugin-Architektur

> **Status:** verbindliche Planungsgrundlage für den Umbau v0.2.0 → v0.3.0 (Prototyp).
> **Vorgänger:** `docs/superpowers/specs/2026-07-06-novacoreai-os-design.md` (v0.1.0-Spec, historisch —
> bleibt unverändert liegen). Diese Spec ersetzt deren Architekturteil; das Memory-Konzept (§5) und
> die Safety-Grundsätze (§9) des Vorgängers gelten fort.
> **Referenz-Implementierung:** Onsite.ai-OS (Multi-Plugin-Schnitt Spec §15.16/§15.18/§15.19,
> FFG v2 §15.12/§15.14) — die dort in Produktion erprobte Ausprägung derselben Produktvision.
> **Produktvision:** `knowledge-base/grundwissen/NovaCore-OS-Produktarchitektur.md` (sechs Schichten).
> **Mechanik-Fakten:** gegen die offizielle Claude-Code-Doku verifiziert am **2026-07-28**
> (`plugins-reference`, `plugin-marketplaces`, `skills`) — u. a. wörtlich: „Avoid setting `version`
> in both `plugin.json` and the marketplace entry. Claude Code always uses the `plugin.json` value
> without warning."
> **Stand:** 2026-07-28 · Status: lebend · Pflege: Lucas Vöhringer · Sprache: Deutsch.
> **Aktualität bestimmt der jüngste datierte Nachtrag**, nicht eine Versionsnummer — die
> Spec-Versionszählung ist seit 2026-08-24 abgeschafft (Spec-Governance,
> [Aktualisierungs-Index §4](../standardprozesse/aktualisierungs-index.md)). Änderungen laufen
> ausschließlich über Nachträge „Nachtrag YYYY-MM-DD — Thema"; §-Nummern bleiben zitierfähig.

---

## 1. Warum dieser Umbau

NovaCore-OS v0.2.0 ist ein **einzelnes Root-Plugin** mit eigener Setup-/Update-CLI (`ncos`),
Marker-Datei-Scoping und Modulen als Unterordnern, die technisch **nicht** einzeln aktivierbar
sind (der Plugin-Scanner kennt keinen Per-Modul-Schalter). Die Onsite.ai-Ausprägung derselben
Produktvision hat diese Konstruktion durchlaufen und drei strukturelle Erkenntnisse produziert,
die dieser Umbau übernimmt:

1. **Die Plugin-Grenze ist die einzige echte Aktivierungsgrenze.** Ein Marketplace mit mehreren
   Plugins (Kern + je Abteilung eines) macht Abteilungen installier- und abwählbar — die
   `module-registry.json` steuert nichts aus, sie ist reiner Metadaten-SSOT.
2. **Eine eigene CLI ist überflüssige Parallel-Infrastruktur.** Marketplace + Versionsfeld in
   `plugin.json` leisten Verteilung und Auto-Update; `setup.js`/`update.js`/`ncos` entfallen
   ersatzlos (Onsite-Entscheidung „Es gibt KEINE eigene CLI", Spec §15).
3. **Die Kontroll-Schicht gehört markerlos in den Kern.** Das Fact-Forcing-Gate v2 gatet überall,
   wo der Kern installiert ist; Marker-Dateien haben sich als Fehlerquelle erwiesen
   (NovaCore-Bug 0.1.1: `~/.nc-os`-Verzeichnis zählte als Marker) und als Schlupfloch
   (unmarkiertes Repo = ungeschützt).

## 2. Zielbild (Schicht 1: Verteilung)

Ein Marketplace **`novacore-os`**, Repo-Wurzel = Marketplace-Wurzel (kein Root-Plugin mehr):

```
NovaCoreAI-OS/                          = Marketplace-Wurzel
  .claude-plugin/marketplace.json       zwei Einträge, source je "./plugins/<name>", KEIN version-Feld
  plugins/nc/                           Kern: ständige Abteilung "gemeinsam"
    .claude-plugin/plugin.json          name "nc", Leitversion, KEINE dependencies
    skills/{start,save-session,journal}/SKILL.md
    hooks/hooks.json                    SessionStart + PreToolUse (FFG)
    hooks/nc-ffg.js  hooks/nc-session-start.js  hooks/lib/{bash-analyse,shell-substitution}.js
    tests/*.test.mjs                    FFG-Tests + Struktur-Invarianten + Session-Start
    wp-rahmen.md                        Pflicht-Zyklus WP0–WP8 (normativ, für alle Abteilungen)
    module-registry.json                Metadaten-SSOT Abteilung → Plugin → Module → Skills
    referenz/skill-authoring.md         verbindliche SKILL.md-Formatregeln (zur Laufzeit dabei)
    nc-sync.md                          globale Agenten-Anweisung (Methodik/Conventions/Safety)
  plugins/nc-development/               Abteilung development
    .claude-plugin/plugin.json          name "nc-development", dependencies ["nc"]
    workflow.md                         WP1–WP7 auf den NovaCore-Entwicklungszyklus übersetzt
    skills/<modul>-<name>/SKILL.md      flaches Layout, Module = Namenspräfixe
  vorlagen/abteilungsplugin/            Vorlage für weitere Abteilungen (kein Plugin, .vorlage)
  knowledge-base/                       Wissensbasis (bewusst OHNE Leerzeichen im Pfad)
    grundwissen/                        Vision, Specs, Pläne (Datumspräfix)
    standardprozesse/                   plugin-bau.md, os-bau-methode.md
    debugging-findings/                 agent-learnings.md (Fehlerprotokoll, append-only)
  CLAUDE.md AGENTS.md README.md ONBOARDING.md CHANGELOG.md VERSION package.json
```

- **Namespace = Name des Marketplace-Eintrags** (nicht wählbar): Kern-Skills `/nc:<name>`,
  Abteilungs-Skills `/nc-development:<name>`. Der bisherige Doppel-Präfix
  (`/novacoreai-os:nc-start`) entfällt — Verzeichnisnamen verlieren das redundante `nc-`.
- **`dependencies: ["nc"]`** in jedem Abteilungsplugin: Installation/Aktivierung einer Abteilung
  zieht den Kern transitiv mit (verifiziert: `plugin enable` „enables them transitively"); damit
  ist die ständige Abteilung technisch erzwungen, nicht appellativ.
- **Version je Plugin genau an einer Stelle:** `plugins/<name>/.claude-plugin/plugin.json`.
  Marketplace-Einträge tragen **kein** `version`-Feld. Kern-Version = Produkt-Leitversion,
  gespiegelt in `VERSION` und `module-registry.json` (durch Struktur-Test erzwungen).
  `package.json` verliert sein `version`-Feld (private Repo-Tooling, keine Versionsquelle).
- Installation im Team: `/plugin marketplace add NovaCore-AI/NovaCoreAI-OS` →
  `/plugin install nc-development@novacore-os` (Kern kommt transitiv).

## 3. Abteilungen und Module (Schichten 2–4)

| Abteilung | Plugin | Module (Skill-Präfix) | Inhalt |
|---|---|---|---|
| `gemeinsam` (ständig) | `nc` (Kern) | core (ohne Präfix) | `start`, `save-session`, `journal` — Session-Zyklus WP0/WP8 |
| `development` | `nc-development` | `fe` · `be` · `flc` · `wzs` | s. u. |

**Module der Abteilung development** (Modul = Namenspräfix, flaches Skill-Layout):

- **`fe` (Frontend):** Start-Skill `fe-review` (Frontend-Review: Zugänglichkeit, Web Vitals,
  Design-Qualität, Komponenten-Hygiene). Weitere fe-Skills nach Bedarf (Sandbox → Fork-back).
- **`be` (Backend):** Start-Skill `be-review` (Backend-Review: API-Verträge, Fehlerpfade,
  Sicherheit, Datenzugriff, Testtiefe kritischer Pfade).
- **`flc` (Feature-Lifecycle, stack-übergreifend):** die vier bestehenden Skills, migriert und
  auf das verbindliche Format gehoben: `flc-feature-start`, `flc-plan`, `flc-commit-prep`,
  `flc-pr` (WP1–WP5).
- **`wzs` (Empfehlungssystem WZS, produktspezifisch):** die fünf bestehenden Skills migriert:
  `wzs-attribution`, `wzs-blocker-gate`, `wzs-reward-guard`, `wzs-share-invariant`,
  `wzs-webhook-contract`. **Kandidat für spätere Extraktion** in ein eigenes Abteilungs- oder
  Satelliten-Plugin, sobald WZS-Arbeit nicht mehr primär Entwicklungsarbeit ist (Onsite-Muster
  §15.19); für den Prototyp bleibt es Modul der Kernheimat development.

Die früheren Registry-Platzhalter `review-quality`, `architecture`, `incident-support` werden
**nicht** als leere Module mitgeschleppt: Review-Inhalte gehen in `fe-review`/`be-review` auf,
`architecture`/`incident-support` sind künftige Module oder Abteilungen und stehen als
„geplant" nur in der Registry. Skill-Rollen aus der v0.1.0-Spec bleiben gültige Roadmap.

**Kern-Skills, die entfallen:** `nc-setup` und `nc-update` (CLI-Ablösung, §1.2). Ihre Aufgabe
übernimmt die Marketplace-Mechanik; die ONBOARDING.md beschreibt den neuen Weg.

## 4. Pflicht-Workflow (Schicht 3): WP-Rahmen WP0–WP8

Die Produktvision nennt den Pflicht-Workflow ausdrücklich als „für NovaCore AI noch zu
definieren — Vorbild ist der 9-stufige Workflow (WP0–WP8)". Dieser Umbau definiert ihn:

- **`plugins/nc/wp-rahmen.md`** (normativ, für alle Abteilungen): WP0 Session-Start (`/nc:start`)
  → WP1 Verstehen → WP2 Planen → WP3 Umsetzen (Test-First auf kritischem Pfad) → WP4 Quality-Gate
  → WP5 Selbst-Review + Übergabe → WP6 Review → WP7 QS/Live-Test → WP8 Session-Ende
  (`/nc:save-session`). WP0/WP8 liegen im Kern und arbeiten auf `.nc/erinnerung/`.
- **`plugins/nc-development/workflow.md`**: übersetzt WP1–WP7 auf den realen
  NovaCore-Zyklus (GitHub-Flow: Issue/Auftrag → Feature-Branch → PR → Review → Merge; Modul
  `flc` trägt WP1–WP5, `fe`/`be` tragen WP6, `wzs` liefert Produkt-Invarianten in WP3/WP6) und
  benennt die Rote-Linien-Ownership je Skill.
- **Rote Linien** (aus v0.1.0-Spec §9.2 fortgeschrieben, jetzt im Rahmen verankert): keine
  automatischen Pushes, Merges, Posts, Releases oder Deployments ohne explizite Nutzerfreigabe;
  der Agent bereitet vor, der Mensch handelt. Firmenspezifische Zusatzmuster fürs Destruktiv-Gate
  über `NC_FFG_EXTRA_DESTRUCTIVE` (Regex).

## 5. Kontroll-Schicht (Schicht 5): Hooks nur im Kern

**Hooks liegen ausschließlich im Kern** — Abteilungsplugins bringen keine mit (sonst feuern
Gates mehrfach; die Plattform verhindert das nicht, der Struktur-Test schon).

1. **FFG — Fact-Forcing-Gate (`nc-ffg.js` + `lib/`):** 1:1-Port des Onsite-FFG v2
   (GateGuard-Vorbild) mit umbenannten Env-Schaltern. Drei Gates:
   - **Datei-Gate** (Edit/Write/MultiEdit): Fakten einmal je Zieldatei, getrennte Texte für
     Änderung (Importer/API) und Neuanlage (Aufrufer/Duplikat-Check); Subagenten übersprungen;
     `.claude/settings*.json` ausgenommen; Betreiber-Ausnahmen per `NC_FFG_EXEMPT_GLOBS`;
     Volltext-Budget per `NC_FFG_FULL_DENIALS` (Default 3, danach kondensierter Einzeiler).
   - **Destruktiv-Gate** (Bash): jedes destruktive Kommando einzeln (rm -rf, git push --force /
     reset --hard / clean -f / checkout -- / commit --amend, drop table, dd if=, find -exec rm,
     sh -c-Wrapper, quote-aware Erkennung, Newline-Trenner — GHSA-4v57-ph3x-gf55-Abdeckung);
     Zusatzmuster per `NC_FFG_EXTRA_DESTRUCTIVE`.
   - **Routine-Bash-Gate:** einmal je Session; Read-only-Git-Introspektion nie.
   Markerlos aktiv, **Opt-out nur per Env `NC_FFG=off`**; State unter `CLAUDE_PLUGIN_DATA`
   bzw. `NC_FFG_STATE_DIR`; fail-open bei internen Fehlern; deny verschärft nur, lockert nie.
2. **Safety-Gate ist im FFG aufgegangen:** Das bisherige `nc-safety-gate.js` (permissionDecision
   „ask", Marker-gebunden, vier Regex) wird ersetzt — das Destruktiv-Gate des FFG deckt dieselben
   Muster strenger ab (deny + Fakten, quote-aware, markerlos). Die Vision-Schicht „Safety-Gate"
   ist damit erfüllt, nicht gestrichen.
3. **Session-Start-Hook (`nc-session-start.js`):** bleibt — Begrüßung, Versionsnennung,
   `/nc:start`-Hinweis. Er bleibt **Marker-gebunden** (`.nc-os`-Datei), denn er ist Komfort, kein
   Gate: außerhalb von nc-Arbeits-Repos wäre die Begrüßung Rauschen. Die Marker-Hilfsfunktion
   (isFile-Prüfung aus dem 0.1.1-Fix) zieht in den Hook um; die Versionsanzeige liest künftig
   `plugin.json` des eigenen Plugins statt `../VERSION` (Pfad existiert im Plugin-Cache nicht).

## 6. Wissensbasis und lebende Doku (Schicht 2)

- **`knowledge-base/`** (bewusst ohne Leerzeichen — Onsite-Lehre: Pfade mit Leerzeichen sind
  ein Dauer-Quoting-Risiko) mit drei Startkategorien: `grundwissen/` (Vision, Specs, Pläne,
  Datumspräfix im Namen, jüngste Spec = Planungsstand), `standardprozesse/` (verbindliche
  Abläufe: `plugin-bau.md`, `os-bau-methode.md`), `debugging-findings/`
  (`agent-learnings.md`, append-only Fehlerprotokoll — Pflicht für jeden Agenten-Fehler).
- **Produktvision einziehen:** `NovaCore-OS-Produktarchitektur.md` (maschinenlesbare Fassung)
  wird aus dem Onsite-Repo in `grundwissen/` übernommen — sie ist NovaCores eigene
  Master-Vision und gehört ins eigene Repo.
- **Lebende Doku:** `CLAUDE.md` (Pflicht-Einstieg, Repo-Karte, Konventionen, Sync-Matrix,
  Standardzyklus für Agenten), `README.md` (Team-Sicht), `AGENTS.md` (Kurz-Einstieg für
  Fremd-Agenten), `ONBOARDING.md` (Marketplace-Installation statt Setup-Skript),
  `CHANGELOG.md` (Keep a Changelog, Namenszeichnung). `nc-sync.md` zieht in den Kern
  (`plugins/nc/nc-sync.md`), damit sie mit ausgeliefert wird; CLI-/Setup-Passagen werden
  durch die Marketplace-Realität ersetzt.
- **Historisch bleibt historisch:** v0.1.0-Spec, CHANGELOG-Alteinträge und die
  `_wzs-*-backup`-Verzeichnisse werden nicht angefasst (Backups sind Aufräum-Kandidat für den
  Maintainer, nicht für diesen Umbau).

## 7. Qualitätssicherung

1. **Struktur-Invarianten als Tests** (`plugins/nc/tests/struktur.test.mjs`, Port des
   Onsite-Musters): Marketplace-Einträge ↔ Platte, kein `version` im Marketplace,
   Dependencies-Topologie (Kern hängt an niemandem, Abteilungen am Kern), Hooks nur im Kern,
   `${CLAUDE_PLUGIN_ROOT}` in Hook-Kommandos, MCP-Wächter (FFG-Matcher muss `mcp__*` decken,
   sobald ein Plugin einen MCP-Server mitbringt), Frontmatter-Regeln (name = Verzeichnis,
   YAML-Plain-Scalar-Falle, description ≤ 1024), keine Pfade über die Plugin-Grenze,
   Leitversions-Gleichstand, Registry ↔ Marketplace ↔ Platte, Vorlagen-Invarianten.
2. **FFG-Testsuite** (`nc-ffg.test.mjs`, Port) + **Session-Start-Tests** (Marker-Logik,
   Versionsquelle). Aufruf dokumentiert als `node --test plugins/nc/tests/*.test.mjs`
   (Verzeichnis-Argumente sind unter Node Glob-Muster — bekannte Falle).
3. **Validierung beider Ebenen, immer:** `claude plugin validate .` (nur Marketplace-Manifest)
   **und** `claude plugin validate plugins/<name> --strict` je Plugin (Manifest + Skills).
   Die Wurzel-Variante allein hat bei Onsite 19 von 22 kaputte Frontmatter übersehen.
4. **Externes Review** (Implementierer ≠ Reviewer) vor dem PR; Install-Probe in isoliertem
   `CLAUDE_CONFIG_DIR` als dokumentierter Folgeschritt nach dem Merge.

## 8. Nicht-Ziele dieses Umbaus

- Keine neuen Fachmodule jenseits `fe-review`/`be-review` (Architektur vor Skill-Masse).
- Kein Kimi-/Codex-Copy-Deploy (bleibt Iteration-2-Punkt der v0.1.0-Spec; `nc-sync.md`
  behält die Ehrlichkeits-Passage zum Hook-Status je CLI).
- Keine Satelliten-Repos (Muster ist in `standardprozesse/plugin-bau.md` dokumentiert und
  wird erst bei der zweiten Abteilung relevant).
- Kein Session-Start-**Zwang** als Hook (Vision-Schicht 5.1): Der Begrüßungs-Hook bleibt
  Hinweis; ein blockierender Start-Zwang ist Folge-Iteration (wie bei Onsite offen).
- Keine Rollen-/Rechte-Logik, keine MCP-Server im OS (Integrationen bleiben Produkt-Setup).

## 9. Versionsfolge und Migration

- Kern `nc`: **0.3.0** (Strukturbruch gegenüber 0.2.0: neue Install-Identität
  `nc@novacore-os` statt `novacoreai-os@novacoreai`). `nc-development`: **0.1.0**.
- Bestandsinstallationen: altes Plugin deinstallieren, alten Marketplace-Eintrag entfernen,
  neu hinzufügen (ONBOARDING.md, Abschnitt „Migration von v0.2.0"). Ein Auto-Upgrade-Pfad
  über die alte Identität existiert nicht und wird nicht vorgetäuscht.
- `repository`-Feld im Manifest korrigiert auf `https://github.com/NovaCore-AI/NovaCoreAI-OS`
  (bisheriger Wert nannte eine falsche Org ohne Bindestrich).

## 10. Nachtrag 2026-07-28 — zweite Abteilung `felix`: erster Satellit, eigenständiges OS

Auftrag des Maintainers (2026-07-28, nach dem Umbau, zweistufig präzisiert): Für den
Kollegen Felix entsteht die zweite Abteilung `felix` — direkt als **Satellit** (eigenes
privates Repo `NovaCore-AI/Felix-OS`, das Repo IST das Plugin), nicht als
lokales `plugins/`-Verzeichnis. Damit tritt genau der in §8 benannte Fall ein („wird erst
bei der zweiten Abteilung relevant"); das Nicht-Ziel „Keine Satelliten-Repos" ist erledigt.

**Design-Entscheidung Eigenständigkeit:** Das Felix-OS unterteilt in **Module statt
Abteilungen** — „kein Kern notwendig als Plugin, das reicht als Modul" (Maintainer). Es
führt daher **keine** `dependencies: ["nc"]`; die Kern-Strukturen sind als angepasste Ports
ins Plugin übernommen: **Kernmodul** ohne Präfix (`start`, `save-session`, `journal`,
`os-info`, `code-tour`, `skill-builder`), **eigene Kontroll-Schicht** (FFG verbatim,
SessionStart-Hook auf `/nc-felix:` angepasst, Env-Schalter `NC_FFG*` und Marker `.nc-os`
unverändert), `felix-sync.md` (Port der `nc-sync.md`), `wp-rahmen.md`, eigene
`module-registry.json` als Modul-SSOT, `referenz/skill-authoring.md`. **Koexistenz-Regel:**
`nc-felix` läuft nicht parallel zum Kern `nc` in derselben Session (doppelte Gates).
Mechanik nach Standardprozess `plugin-bau.md` §3a (Ausnahme zur Dependency-Pflicht dort in
§1 dokumentiert): Marketplace-Eintrag mit GitHub-Source und Commit-SHA-Pin, Registry-Eintrag
mit `repository` und satelliten-relativem `repoSkillsPath`, Kern-Bump 0.3.0 → 0.4.0
(Registry-Erweiterung). Arbeitsmodule folgen gemeinsam mit dem Fachbereich.

## 11. Nachtrag 2026-08-05 — dritte Abteilung `biggi`: zweiter Satellit, Onsite-Leitlinie

Auftrag des Maintainers (2026-08-05): Für Biggi entsteht die dritte Abteilung `biggi` als
**zweites eigenständiges Kollegen-OS** im Satelliten-Repo `NovaCore-AI/Biggi-OS` (das Repo
IST das Plugin), nach dem mit `nc-felix` pilotierten Ablauf — mit diesem Nachtrag als
**§3b** in `standardprozesse/plugin-bau.md` formalisiert (die §3b-Verweise aus
Felix-CHANGELOG/-AGENTS liefen bis dahin ins Leere — Doku-Drift behoben).
**Architektur-Leitlinie laut Auftrag: bei Unterschieden zwischen NovaCore- und
Onsite-Vorbild gewinnt das Onsite.ai-OS.**

Konsequenzen gegenüber dem Felix-Stand (§10):

- **Session-Start-Zwang statt Marker-Begrüßung:** `nc-biggi` portiert den
  Onsite-Injektionshook (markerlos — „ein Gate, das man vergessen kann, ist kein Gate";
  Opt-out `NC_START_GATE=off`); der `.nc-os`-Marker entfällt dort vollständig.
- **FFG-Synthese beider Vorbilder:** Felix-Port (trägt die Review-Härtungen 2026-07-28
  gegenüber dem Onsite-Original: verankerte Exempt-Globs, Session-Key-Hashing,
  plattformbewusstes Case-Folding) plus Onsite-Fix 2026-08-04 (`process.exitCode = 0`
  statt `process.exit(0)` — gepufferte stdout-Pipes).
- **CI-/Release-Standard nach Onsite:** `ci.yml` (Ubuntu+Windows × Node 20/22/24,
  Validator-Positivkontrolle) und `release.yml` (annotierter Tag ↔ Manifest-Abgleich,
  Notes aus dem CHANGELOG) — für künftige Satelliten verbindlich (§3b Nr. 2).
- **Module:** Kernmodul (6 Skills, Ports) plus reservierte Arbeitsmodul-Konvention ohne
  Vollständigkeitsanspruch: `controlling` (`ctrl`), `medizinisches` (`mdzn`),
  `dokumentation-daily-work` (`doc` + `day` — **ein** Modul, **zwei** Präfixe; das
  Registry-Schema des Satelliten führt dafür `praefixe`-Arrays). Platzhalter-Ordner
  (`PLATZHALTER.md`) reservieren die Namen.

Mechanik wie §10: Marketplace-Eintrag mit GitHub-Source und Commit-SHA-Pin,
Registry-Eintrag mit `repository` und satelliten-relativem `repoSkillsPath`, Kern-Bump
0.4.0 → 0.5.0 (Registry-Erweiterung). Zusätzlich Release-Hygiene im Felix-Satelliten
nachgezogen (annotierte Tags `v0.2.0`/`v0.2.1` + GitHub-Releases; Pin auf `v0.2.1`).

## §12 — Nachtrag 2026-08-11: `plugin-bau.md` ist zweigeteilt

**Anlass:** Der Bauplan `2026-08-11-prozesskorpus-nachzug-und-satelliten-ssot-bauplan.md` (AP1,
Entscheid E2) hat den Standardprozess `knowledge-base/standardprozesse/plugin-bau.md` in zwei
Dokumente geteilt. Der Text oberhalb nennt an mehreren Stellen noch den alten Dateinamen; er
wird nach dem **Norm-Nachtragsprinzip nicht in-place umgeschrieben** — stattdessen gilt dieser
Nachtrag.

**Der alte Name ist in diesem Dokument wie folgt zu lesen:**

| Alte Nennung | Gilt heute |
|---|---|
| `plugin-bau.md` §1, §2 (Architektur, Mechanik-Fakten) | `abteilungs-plugin-bau.md` §1, §2 |
| `plugin-bau.md` §3, §3a, §3b (neue Abteilung, Extraktion, eigenständiges Kollegen-OS) | `abteilungs-plugin-bau.md` §3, §3a, §3b |
| `plugin-bau.md` als Ordnerinhalt von `standardprozesse/` (Baumdarstellungen, Aufzählungen) | `kern-plugin-bau.md` **und** `abteilungs-plugin-bau.md`, dazu neu `ssot-aufbau.md` und `sync-nachzug-bauzyklus.md` |
| Regeln, die den **Kern** binden (Leitversion, Basis-Gate, Mindest-Client) | `kern-plugin-bau.md` — dieser Stoff war vorher mit dem Abteilungsteil vermischt |

**Was inhaltlich neu ist** und im Text oberhalb deshalb noch fehlt: die
Governance-Zwei-Schichten-Tabelle (`kern-plugin-bau.md` §1a), der Autosync-Standardprozess
(§2a), die belegte **Auslieferungsgrenze** (`abteilungs-plugin-bau.md` §1a — Kopie des
Plugin-Verzeichnisses in den Cache, **nicht** sparse clone; Begründung im Bauplan-Nachtrag N3)
sowie der Baustein „ein eigenständiger Satellit führt eine eigene Wissensbasis" (§3b.1).

**Unberührt bleibt** die Architektur-Entscheidung dieses Dokuments: ein Marketplace, ein Plugin
je Abteilung, Version nur in `plugin.json`, Satelliten per `ref` + Full-SHA gepinnt.

---

*Angelegt 2026-07-28 · erstellt in der Nachtschicht-Session (Fable), Review durch
Maintainer steht aus — dieser Umbau ist als PR zur Abnahme vorgelegt, nicht gemergt.
Nachtrag §10 ergänzt 2026-07-28 (Abteilung felix, erster Satellit).
Nachtrag §11 ergänzt 2026-08-05 (Abteilung biggi, zweiter Satellit, Onsite-Leitlinie).
Nachtrag §12 ergänzt 2026-08-11 (Zweiteilung `plugin-bau.md`) — Claude (Opus 5), veranlasst
durch das externe Review von Kimi K3 (Befund LOW 2).*
