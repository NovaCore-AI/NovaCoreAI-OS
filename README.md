# NovaCoreAI-OS

**NovaCore-OS** — das Team-Betriebssystem für KI-Arbeit von NovaCore AI, ausgeliefert als
**Familie von Claude-Code-Plugins** aus einem Marketplace: eine Methode für alle statt
vieler Privat-Setups.

**Status: Kern `nc` v0.4.0 · Abteilung `nc-development` v0.1.0 · Abteilung `nc-felix`
v0.1.0 (erster Satellit, angelegt) — Multi-Plugin-Architektur (Umbau 2026-07-28).** Historie: [CHANGELOG.md](CHANGELOG.md) · Normativ für Agenten:
[AGENTS.md](AGENTS.md) · Design-Spec:
[`knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md`](knowledge-base/grundwissen/2026-07-28-multi-plugin-architektur-design.md)

## Architektur

Ein Marketplace (`novacore-os`), je Abteilung ein Plugin, der Kern ist Dependency von allem:

| Plugin | Rolle | Namespace | Version |
|---|---|---|---|
| `nc` | **Kern** — ständige Abteilung `gemeinsam`: Session-Zyklus, Kontroll-Hooks, WP-Rahmen, Registry, Formatregeln, `nc-sync.md` | `/nc:` | 0.4.0 (= `VERSION`) |
| `nc-development` | Abteilung development — Module `fe` / `be` / `flc` / `wzs` | `/nc-development:` | 0.1.0 |
| `nc-felix` | Abteilung felix — **angelegt** (erster Satellit, eigenes privates Repo `NovaCore-AI/NovaCoreAI-OS-Felix`, noch keine Skills) | `/nc-felix:` | 0.1.0 |

- **Plugin-Grenze = Abteilungsgrenze:** Wer eine Abteilung installiert, bekommt den Kern
  transitiv mit (`dependencies: ["nc"]`).
- **Hooks nur im Kern**, Module sind Skill-Präfixe, die `module-registry.json` ist reiner
  Metadaten-SSOT.
- **Memory** pro Arbeits-Repo unter `.nc/erinnerung/` (Stand + append-only Journal), nie im
  OS-Repo.
- **Satelliten:** `nc-felix` lebt in einem eigenen privaten Repo (das Repo IST das Plugin);
  der Marketplace-Eintrag pinnt per GitHub-Source auf einen Commit-SHA
  (`plugin-bau.md` §3a — der `sha` ist der effektive Pin).

## Skills

**Kern `nc` (immer dabei):**

| Skill | WP | Zweck |
|---|---|---|
| `/nc:start` | WP0 | Session-Start: Stand, Journal, Git-Lage laden — kein Blind-Start |
| `/nc:save-session` | WP8 | Session-Ende: Journal schreiben, Stand konsolidieren |
| `/nc:journal` | laufend | Einzelne Ereignisse sofort festhalten |

**Abteilung `nc-development`:**

| Modul | Skills | WP |
|---|---|---|
| `flc` Feature-Lifecycle | `flc-feature-start` · `flc-plan` · `flc-commit-prep` · `flc-pr` | WP1–WP5 |
| `fe` Frontend | `fe-review` | WP6 |
| `be` Backend | `be-review` | WP6 |
| `wzs` Empfehlungssystem WZS | `wzs-attribution` · `wzs-blocker-gate` · `wzs-reward-guard` · `wzs-share-invariant` · `wzs-webhook-contract` | WP3/WP6 |

**Abteilung `nc-felix`:** angelegt, noch keine gebauten Skills — Modul- und Skill-Planung
erfolgt separat mit dem Fachbereich (Satelliten-Repo, siehe Architektur).

Fachablauf und Trigger-Matrix: [`plugins/nc-development/workflow.md`](plugins/nc-development/workflow.md);
Rahmen WP0–WP8: [`plugins/nc/wp-rahmen.md`](plugins/nc/wp-rahmen.md).

## Kontroll-Schicht (Hooks, nur im Kern)

| Hook | Event | Verhalten |
|---|---|---|
| `nc-ffg` (FFG, Fact-Forcing-Gate) | PreToolUse (Write/Edit/MultiEdit/Bash) | Fakten **vor** der Aktion: Datei-Gate je Zieldatei, Destruktiv-Gate je Kommando (quote-aware), Routine-Bash einmal je Session; Read-only-Git nie. **Markerlos aktiv**, Opt-out nur per Env `NC_FFG=off`; Betreiber-Schalter: `NC_FFG_EXEMPT_GLOBS`, `NC_FFG_FULL_DENIALS`, `NC_FFG_EXTRA_DESTRUCTIVE`. Fail-open bei internen Fehlern. |
| `nc-session-start` | SessionStart | Begrüßung + `/nc:start`-Hinweis + Version — **nur** in Repos mit `.nc-os`-Marker-**Datei** (Komfort, kein Gate) |

Das frühere marker-gebundene Safety-Gate ist im Destruktiv-Gate des FFG aufgegangen
(deny statt ask, breitere Erkennung).

## Installation

Voraussetzungen: Claude Code **≥ 2.1.193**, Node.js ≥ 18 (Hooks). In Claude Code:

```
/plugin marketplace add NovaCore-AI/NovaCoreAI-OS
/plugin install nc-development@novacore-os
```

Der Kern `nc` kommt automatisch als Dependency mit. Weitere Abteilungen analog, z. B.
`/plugin install nc-felix@novacore-os` (Satellit — auf Maschinen ohne geladenen SSH-Key
vorher `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` setzen). Details, Migration von v0.2.0 und
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

Verbindliche Prozesse: [`knowledge-base/standardprozesse/plugin-bau.md`](knowledge-base/standardprozesse/plugin-bau.md)
(Plugin-Ebene) und [`knowledge-base/standardprozesse/os-bau-methode.md`](knowledge-base/standardprozesse/os-bau-methode.md)
(Gesamt-Methode). Skill-Format: `plugins/nc/referenz/skill-authoring.md`.

## Versionsmodell

Je Plugin **eine** Version, genau an einer Stelle: `plugins/<name>/.claude-plugin/plugin.json`
— die Marketplace-Einträge tragen bewusst **kein** `version`-Feld. Kern-Version =
Produkt-Leitversion (`VERSION` + Registry gespiegelt, testgesichert). Kein Bump = kein
Auto-Update.

## Koexistenz

Eigene Namespaces `nc:`/`nc-development:`/`nc-felix:`, keine Kollision mit `uni:` oder ECC. Das FFG
gatet markerlos in jeder Session, in der der Kern installiert ist (Opt-out `NC_FFG=off`);
die SessionStart-Begrüßung bleibt auf `.nc-os`-markierte Repos beschränkt.

---

*Pflege: NovaCore AI · Sprache aller Artefakte: Deutsch*
