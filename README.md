# NovaCoreAI-OS

**NovaCore-OS** — das Team-Betriebssystem für KI-Arbeit von NovaCore AI, ausgeliefert als
**Familie von Claude-Code-Plugins** aus einem Marketplace: eine Methode für alle statt
vieler Privat-Setups.

**Status: Kern `nc` v0.7.0 · Abteilung `nc-development` v0.1.0 · Abteilung `nc-felix`
v0.4.1 (erster Satellit, eigenständiges Felix-OS) · Abteilung `nc-biggi` v0.1.1 (zweiter
Satellit, eigenständiges Biggi-OS) · Affiliate `kimi-code-plugin-cc` v1.4.0 (extern) ·
Affiliate `mneme-kimi-code` v2.0.24 (extern) —
Multi-Plugin-Architektur (Umbau 2026-07-28), Kontroll-Schicht mit Gate 1 + Gate 2
(Onsite-Align-Umbau 2026-08-10).** Historie: [CHANGELOG.md](CHANGELOG.md) · Normativ für
Agenten: [AGENTS.md](AGENTS.md) · Wissens-Triage:
[`knowledge-base/SSOT-Document-Index.md`](knowledge-base/SSOT-Document-Index.md) ·
Design-Spec:
[`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`](knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md)

## Architektur

Ein Marketplace (`novacore-os`), je Abteilung ein Plugin; der Kern ist Dependency der
Abteilungsplugins dieses Repos — eigenständige Satelliten-OS wie `nc-felix` und `nc-biggi`
bringen ihren Kern als **Modul** selbst mit:

| Plugin | Rolle | Namespace | Version |
|---|---|---|---|
| `nc` | **Kern** — ständige Abteilung `gemeinsam`: Session-Zyklus, Infrapflege-Skills, Kontroll-Schicht (Gate 1 + Gate 2), Doks-Autosync, WP-Rahmen, Registry, Formatregeln, `nc-sync.md` | `/nc:` | 0.7.0 (= `VERSION`) |
| `nc-development` | Abteilung development — Module `fe` / `be` / `flc` / `wzs` | `/nc-development:` | 0.1.0 |
| `nc-felix` | Abteilung felix — **eigenständiges Felix-OS** (erster Satellit, privates Repo `NovaCore-AI/Felix-OS`): Kernmodul mit 7 Skills, eigene Kontroll-Schicht mit Gate 1 + Gate 2 (markerlos) und eigene isolierte Wissensbasis, hängt **nicht** am Kern | `/nc-felix:` | 0.4.1 |
| `nc-biggi` | Abteilung biggi — **eigenständiges Biggi-OS** (zweiter Satellit, privates Repo `NovaCore-AI/Biggi-OS`): Kernmodul mit 6 Skills + Kontroll-Schicht (FFG + Session-Start-Zwang nach Onsite-Vorbild), hängt **nicht** am Kern; Arbeitsmodul-Konvention `ctrl` / `mdzn` / `doc`+`day` reserviert | `/nc-biggi:` | 0.1.1 |
| `kimi-code-plugin-cc` | **Affiliate** (keine Abteilung) — externes MIT-Plugin `ArchiDoxx/Kimi-code-Plugin-CC`: bindet headless CLI-Agenten (Kimi Code) als Zweitmeinung ein (Review-/Planning-Loops, adversariale Dual-Reviews). Host-Anforderungen: `uv` + `kimi`-CLI | `/kimi-code-plugin-cc:` | 1.4.0 (extern) |
| `mneme-kimi-code` | **Affiliate** (keine Abteilung) — externes AGPL-3.0-Plugin `ArchiDoxx/mneme-kimi-code`: persistentes Projekt-Gedächtnis über Sessions hinweg (7 Hooks → lokale SQLite, Rückholung per Skill `mem-search` + MCP-Tools; Claude Code und Kimi Code). Host-Anforderung: `uv` | `/mneme-kimi-code:` | 2.0.24 (extern) |

- **Plugin-Grenze = Abteilungsgrenze:** Wer eine Abteilung installiert, bekommt den Kern
  transitiv mit (`dependencies: ["nc"]`). Ausnahme: die eigenständigen Kollegen-OS
  `nc-felix` und `nc-biggi` führen keine Kern-Dependency (Kernmodul + Kontroll-Schicht im
  Plugin selbst).
- **Hooks nur im Kern**, Module sind Skill-Präfixe, die `module-registry.json` ist reiner
  Metadaten-SSOT.
- **Memory** pro Arbeits-Repo unter `.nc/erinnerung/` (Stand + append-only Journal), nie im
  OS-Repo.
- **Satelliten:** `nc-felix` und `nc-biggi` leben in eigenen privaten Repos (das Repo IST
  das Plugin); der Marketplace-Eintrag pinnt per GitHub-Source auf einen Commit-SHA
  (`abteilungs-plugin-bau.md` §3a/§3b — der `sha` ist der effektive Pin).
- **Kategorie `affiliate` — firmenintern vs. affiliate:** Der Marketplace verteilt neben
  Kern und Abteilungen auch persönliche bzw. externe Werkzeuge. Sie sind **keine
  Abteilungen**: keine Zeile in der `module-registry.json`, keine Kern-Dependency, **kein
  Memory-/Wissens-Share** mit Kern oder Satelliten (Begriffsnorm:
  [`NovaCore-OS-SSOT-Definition.md`](knowledge-base/grundwissen/NovaCore-OS-SSOT-Definition.md)).
  Externe Quellen werden wie Satelliten per `ref` **und** vollem Commit-SHA gepinnt
  (testerzwungen). **Bekannte Grenze:** Bringt ein solches Plugin einen MCP-Server mit
  (wie `kimi-code-plugin-cc`), laufen dessen `mcp__*`-Werkzeuge **nicht** durch das FFG —
  der Matcher deckt sie heute nicht ab. Das ist dokumentiert, nicht still.

## Skills

**Kern `nc` (immer dabei):**

| Skill | WP | Zweck |
|---|---|---|
| `/nc:start` | WP0 | Session-Start: Stand, Journal, Git-Lage laden — kein Blind-Start; setzt zum Abschluss den Fakten-Stempel, der Gate 2 öffnet |
| `/nc:save-session` | WP8 | Session-Ende: Journal schreiben, Stand konsolidieren |
| `/nc:journal` | laufend | Einzelne Ereignisse sofort festhalten |
| `/nc:setup` | einmal pro Rechner | Stellt die Wissensbasis lokal bereit (voller Klon nach `~/.nc/ssot/<repo-name>/`, Verlinkung über den festen Pfad im Firmen-Block) und hält sie per Fast-Forward aktuell; Sparse-Relikte der Erstfassung werden automatisch zum vollen Arbeitsbaum erweitert — der Marketplace liefert nur das Plugin aus, nicht die Wissensbasis |
| `/nc:doku-sync` | vor Commit | Lebende Doku nach der Sync-Matrix nachziehen, CHANGELOG + Versions-Gleichstand prüfen, Prüfstempel setzen |
| `/nc:os-info` | jederzeit | Erklärt das OS **auf Basis der realen Installation** — Plugins, Module, nutzbare Skills, Gate-Status |
| `/nc:skill-builder` | jederzeit | Führt durch den Bau eines Skills nach den OS-Regeln (Sandbox oder OS-Beitrag, inkl. Fork-back) |

**Abteilung `nc-development`:**

| Modul | Skills | WP |
|---|---|---|
| `flc` Feature-Lifecycle | `flc-feature-start` · `flc-plan` · `flc-commit-prep` · `flc-pr` | WP1–WP5 |
| `fe` Frontend | `fe-review` | WP6 |
| `be` Backend | `be-review` | WP6 |
| `wzs` Empfehlungssystem WZS | `wzs-attribution` · `wzs-blocker-gate` · `wzs-reward-guard` · `wzs-share-invariant` · `wzs-webhook-contract` | WP3/WP6 |

**Abteilung `nc-felix` (eigenständiges Felix-OS):** Kernmodul ohne Präfix — `start`,
`save-session`, `journal`, `os-info`, `code-tour`, `skill-builder`; Arbeitsmodule folgen
(Satelliten-Repo mit eigener Kontroll-Schicht, siehe Architektur — nicht parallel zu `nc`
betreiben).

**Abteilung `nc-biggi` (eigenständiges Biggi-OS):** Kernmodul ohne Präfix — dieselben
6 Skills als markerlose Ports; Arbeitsmodule als Namenskonvention reserviert:
`controlling` (`ctrl`), `medizinisches` (`mdzn`), `dokumentation-daily-work` (`doc` +
`day` — ein Modul, zwei Präfixe). Satelliten-Repo mit eigener Kontroll-Schicht (FFG +
Session-Start-Zwang) — nicht parallel zu `nc` oder `nc-felix` betreiben.

Fachablauf und Trigger-Matrix: [`plugins/nc-development/workflow.md`](plugins/nc-development/workflow.md);
Rahmen WP0–WP8: [`plugins/nc/wp-rahmen.md`](plugins/nc/wp-rahmen.md).

## Kontroll-Schicht (Hooks, nur im Kern)

| Hook | Event | Verhalten |
|---|---|---|
| `nc-ffg` (Gate 1, Fact-Forcing-Gate) | PreToolUse (Write/Edit/MultiEdit/Bash) | Fakten **vor** der Aktion: Datei-Gate je Zieldatei, Destruktiv-Gate je Kommando (quote-aware), Routine-Bash einmal je Session; Read-only-Git nie. **Markerlos aktiv**, Opt-out nur per Env `NC_FFG=off`; Betreiber-Schalter: `NC_FFG_EXEMPT_GLOBS`, `NC_FFG_FULL_DENIALS`, `NC_FFG_EXTRA_DESTRUCTIVE`. Fail-open bei internen Fehlern. |
| `nc-session-start` (Gate 2, Teil 1) | SessionStart | Injiziert Pflicht-Einstieg, **lebenden Projektstand** (VERSION, Branch, Commits, Working Tree, `[Unreleased]`, laufende Vorhaben, Abteilungen) und den exakten Stempel-Befehl. **Markerlos** — ein Gate, das man vergessen kann, ist kein Gate. Kann laut Doku nicht blocken. |
| `nc-start-gate` (Gate 2, Teil 2) | PreToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash) | Lehnt jede **schreibende** Aktion ab, bis `/nc:start` mit dem Fakten-Stempel abgeschlossen ist. Der Stempel (`nc-start-stempel.js`) verifiziert `--branch`/`--head` gegen die Git-Lage des **Projektverzeichnisses** und vermerkt, ob überhaupt etwas zu prüfen war — ein ungeprüft gesetzter Stempel öffnet nicht in einem Git-Baum. Lesen, Read-only-Git und die Stempel-Invokation selbst bleiben frei; Subagenten ausgenommen. Opt-out `NC_START_GATE=off` — **ein** Schalter für beide Gate-2-Teile. Reichweite und Grenzen: [Gates-Definition](knowledge-base/grundwissen/NovaCore-OS-Gates-Definition.md). |
| `nc-doks-autosync` | SessionStart | Hält den Firmen-Block in `~/.claude/CLAUDE.md` per Marker-Chirurgie (`NC:BLOCK:…`) auf dem Stand des installierten Kerns. **Die Privat-Zone außerhalb der Marker wird nie verändert**; Backup vor jedem Schreiben; bei defekten Markern wird nichts geschrieben. Opt-out `NC_AUTOSYNC=off`, Ziel-Override `NC_AUTOSYNC_TARGET`. |

Gate 3 (Safety-Gate mit echtem Freigabedialog) und Gate 4 (Sitzungsabschluss) sind **nicht
gebaut** — Übersicht und Abgrenzungen:
[`NovaCore-OS-Gates-Definition.md`](knowledge-base/grundwissen/NovaCore-OS-Gates-Definition.md).
Das frühere marker-gebundene Safety-Gate ist im Destruktiv-Gate des FFG aufgegangen
(deny statt ask, breitere Erkennung); der `.nc-os`-Marker hat seit dem Umbau 2026-08-10
**keine Funktion mehr**.

## Installation

Voraussetzungen: Claude Code **≥ 2.1.193**, Node.js ≥ 18 (Hooks). In Claude Code:

```
/plugin marketplace add NovaCore-AI/NovaCoreAI-OS
/plugin install nc-development@novacore-os
```

Der Kern `nc` kommt automatisch als Dependency mit. Die eigenständigen Kollegen-OS
installieren sich analog per `/plugin install nc-felix@novacore-os` bzw.
`/plugin install nc-biggi@novacore-os` (Satelliten — auf Maschinen ohne geladenen SSH-Key
vorher `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` setzen); sie bringen eine eigene
Kontroll-Schicht mit und laufen **nicht** parallel zu `nc`/`nc-development` oder
zueinander in derselben Session. Details, Migration von v0.2.0 und
Arbeits-Repo-Einrichtung: [ONBOARDING.md](ONBOARDING.md).

## Update

Marketplace-Mechanik: Versions-Bump in `plugin.json` → `/plugin update` bzw. Auto-Update.
Es gibt **keine** eigene CLI mehr (`ncos`/Setup-Skripte sind mit 0.3.0 entfallen).

## Entwicklung

```bash
npm test                                        # node --test plugins/nc/tests/*.test.mjs
claude plugin validate .                        # Marketplace-Manifest
claude plugin validate plugins/nc --strict      # Manifest + Skills (je Plugin!)
claude plugin validate plugins/nc-development --strict
```

Verbindliche Prozesse: [`kern-plugin-bau.md`](knowledge-base/standardprozesse/kern-plugin-bau.md)
(Kern-Plugin) · [`abteilungs-plugin-bau.md`](knowledge-base/standardprozesse/abteilungs-plugin-bau.md)
(Abteilungen und Satelliten) · [`ssot-aufbau.md`](knowledge-base/standardprozesse/ssot-aufbau.md)
(Wissensbasis) · [`sync-nachzug-bauzyklus.md`](knowledge-base/standardprozesse/sync-nachzug-bauzyklus.md)
(Nachzüge je Bauzyklus) · [`os-bau-methode.md`](knowledge-base/standardprozesse/os-bau-methode.md)
(Gesamt-Methode). Skill-Format: `plugins/nc/referenz/skill-authoring.md`.

## Versionsmodell

Je Plugin **eine** Version, genau an einer Stelle: `plugins/<name>/.claude-plugin/plugin.json`
— die Marketplace-Einträge tragen bewusst **kein** `version`-Feld. Kern-Version =
Produkt-Leitversion (`VERSION` + Registry gespiegelt, testgesichert). Kein Bump = kein
Auto-Update.

## Koexistenz

Eigene Namespaces `nc:`/`nc-development:`/`nc-felix:`/`nc-biggi:`, keine Kollision mit
`uni:` oder ECC. Die Kontroll-Schicht des Kerns ist **markerlos** in jeder Session aktiv,
in der der Kern installiert ist: FFG (`NC_FFG=off`), Session-Start-Zwang
(`NC_START_GATE=off`), Doks-Autosync (`NC_AUTOSYNC=off`). Die eigenständigen `nc-felix` und
`nc-biggi` tragen eigene Kopien dieser Hooks mit denselben Env-Schaltern — deshalb `nc`,
`nc-felix` und `nc-biggi` **nie parallel** in derselben Session betreiben (die Gates feuern
sonst doppelt). Affiliate-Plugins wie `kimi-code-plugin-cc` bringen keine Gates mit und
sind von dieser Regel nicht betroffen.

---

*Pflege: NovaCore AI · Sprache aller Artefakte: Deutsch*
