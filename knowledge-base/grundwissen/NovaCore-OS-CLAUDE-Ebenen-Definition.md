# CLAUDE-Ebenen — Definition und Umfang (Grundsatzdokument)

> **Zweck:** die verbindliche normative Begriffsquelle für die **CLAUDE-Ebenen** als
> Steuerungselemente der SSOT — Schwester der
> [`SSOT-Definition`](NovaCore-OS-SSOT-Definition.md) und der
> [`Gates-Definition`](NovaCore-OS-Gates-Definition.md). Grundlage: Bauplan
> `2026-08-10-onsite-align-umbau-bauplan.md` (AP3/AP4), Norm-Vorlage: Onsite-Ebenen-Definition.
> Abgeleitetes Dokument — bei Widerspruch gewinnt der jüngste Bauplan in `grundwissen/`.

## Das Ebenen-Modell

Die SSOT (`NovaCore-OS-SSOT-Definition.md`) besteht aus drei Wissensebenen **plus**
Orchestrierung. Die CLAUDE-Ebenen sind Teil dieser Orchestrierung — Steuerungselemente, kein
davon getrenntes System. Leitprinzip: **Jede CLAUDE routet und bindet, die SSOT-Ebene
dokumentiert** — Verweis-Überschneidung ja, Text-Kopie nie (Doppelpflege-Verbot, auch auf
Instruktionsebene).

| Ebene | Träger | Update-Kanal | Routet in | Owner | Status |
|---|---|---|---|---|---|
| **0 — Org-Instructions** | Team-Plan-Admin-Settings (server-managed) | zentral, ohne Sync-Mechanik | die SSOT (Verweis) | Admin | **nicht genutzt** |
| **1 — Globale CLAUDE.md** | `~/.claude/CLAUDE.md` | firmengeführter Block per SessionStart-Autosync + Privat-Zone | Kern-SSOT | Firma (Block) / Mitarbeiter (Zone) | **gebaut** (2026-08-10, AP3) |
| **1b — Team-Sync-Datei** | `~/.claude/nc-teamsync.md` | SessionStart-Autosync als **Ganzdatei** (Versions-Stempel Zeile 1, keine Marker, keine Privat-Zone); geladen per `@`-Import im Firmen-Block | Kern-SSOT (Methodik/Conventions) | Firma (vollständig) | **gebaut** (2026-08-15, Bauplan Onsite-Endstand AP-B2) |
| **2 — Abteilungs-CLAUDE** | im Abteilungsplugin-Verzeichnis | Marketplace-Auto-Update (Plugin-Cache) | Abteilungs-SSOT | Abteilung | **gebaut** (2026-08-16: `development-abteilungs-claude.md` + Lese-Verdrahtung in `/nc:start`) |
| **3 — Projekt-CLAUDE** | Arbeitsrepo (`CLAUDE.md`/`AGENTS.md`) | Git | Repo-Wissen (`.nc/erinnerung/`) | Repo-Team | aktiv |
| **3b — OS-Repo-Doku** | dieses Repo: getrackte `AGENTS.md` + un-getrackte lokale `CLAUDE.md` | Git (nur `AGENTS.md`) | Aktualisierungs-Index, SSOT-Document-Index, CHANGELOG | Kern-Maintainer | aktiv |

## Ebene 0 — Org-Instructions

- **Ort:** Team-Plan-Admin-Oberfläche (server-managed settings), nicht im Repo.
- **Funktion in der SSOT:** Bootstrap + die wenigen absoluten Invarianten — SSOT-Verweis,
  Marketplace-/Install-Hinweis, harte rote Linien. Wirkt in CLI **und** Desktop-App
  („clients fetch these settings automatically").
- **Owner:** Admin. **Update-Kanal:** zentral, ohne Sync-Mechanik — nicht git-versioniert,
  nicht getestet, nicht agent-pflegbar, ein Text für die ganze Org (nicht abteilungsfähig),
  keine Privat-Zone.
- **Status/Grenzen:** in NovaCore **heute nicht genutzt**. Ebene 0 ersetzt Ebene 1 nicht;
  wenn sie eingeführt wird: klein halten, selten ändern, keine Duplikation von Ebene-1-Inhalt.

## Ebene 1 — Globale CLAUDE.md

- **Ort:** `~/.claude/CLAUDE.md`.
- **Funktion in der SSOT:** firmengeführt in Aufbau und Funktion (Dienstgeräte/Dienstaccounts).
  Enthält die Master-Regeln + das Master-Routing in die Kern-SSOT. Der Mitarbeiter behält eine
  abgegrenzte, markierte **Privat-Zone** — Updates verändern nur den Firmen-Block, nie die
  Privat-Zone.
- **Owner:** Firma (Firmen-Block) / Mitarbeiter (Privat-Zone).
- **Update-Kanal:** SessionStart-Autosync `nc-doks-autosync.js`; Payload
  `plugins/nc/doks/global-claude-firmenblock.md`; Versions-Stempel im Block ist der einzige
  State; Backup `<ziel>.nc-autosync-backup` vor jedem Schreiben; Opt-out `NC_AUTOSYNC=off`,
  Ziel-Override `NC_AUTOSYNC_TARGET`.
- **Grenzen:** „Höchste CLAUDE-Anweisungsebene" ist **normative Konvention, keine
  Harness-Mechanik** — siehe Präzedenzregel.

## Ebene 1b — Team-Sync-Datei (seit 2026-08-15)

- **Ort:** `~/.claude/nc-teamsync.md` — maschinenweit im Home-`.claude`-Ordner, **nicht**
  im projektlokalen `.claude/`.
- **Funktion in der SSOT:** die vollständig firmengeführte Methodik-/Conventions-/
  Safety-Anweisung (Verhaltens-Defaults, DoD, Review-Pflicht) für alle Agenten — ohne
  Privat-Zone; wer eigene Regeln braucht, nutzt die Privat-Zone der Ebene 1.
- **Owner:** Firma (vollständig). **Update-Kanal:** derselbe SessionStart-Autosync
  `nc-doks-autosync.js` als **Ganzdatei-Ersatz**: Versions-Stempel
  `<!-- NC:TEAMSYNC:VERSION <kern-version> -->` in der ersten Zeile, No-op bei
  (zeilenenden-normalisiert) identischem Stand, Backup vor jedem Schreiben; beide Ziele
  (1 und 1b) laufen unabhängig — ein defektes nimmt das andere nicht mit. Opt-out
  `NC_AUTOSYNC=off` (ein Schalter für beide), Test-Override `NC_AUTOSYNC_TEAMSYNC_TARGET`.
- **Payload:** `plugins/nc/nc-sync.md` — bewusst **keine** Kopie unter `doks/`
  (Doppelpflege-Verbot; Bauplan 2026-08-15, Nachtrag N2). Geladen wird die Zieldatei über
  die `@`-Import-Zeile `@~/.claude/nc-teamsync.md` im Firmen-Block und als Lese-Schritt
  in `/nc:start`.
- **Grenzen:** In der Präzedenzkette wird 1b nicht gesondert gerankt — sie ordnet sich im
  Update-Kanal zwischen 1 und 2 ein und trägt denselben Methodik-Rang wie der
  Firmen-Block.

## Ebene 2 — Abteilungs-CLAUDE

- **Ort:** eine Datei **im Abteilungsplugin-Verzeichnis** (nicht an der Repo-Wurzel eines
  Satelliten).
- **Funktion in der SSOT:** Kanal ist Marketplace-Auto-Update in den lokalen Plugin-Cache;
  gelesen beim Session-Start aus dem Plugin-Root — in JEDEM Arbeitsrepo, egal wo die Session
  läuft. Löst das Problem einer Abteilung, die in fremden Repos arbeitet.
- **Owner:** Abteilung. **Update-Kanal:** Marketplace-Auto-Update bei Plugin-Bump.
- **Status/Grenzen:** **gebaut** (2026-08-16, Phase 3/AP-F2: erstes ausgeliefertes Exemplar
  `development-abteilungs-claude.md` in `nc-development`; die **Lese-Verdrahtung** liest die
  Datei seitdem in `/nc:start` Schritt 7 aus dem Plugin-Root — Auslieferung ≠ Wirkung ist
  damit geschlossen). Zielname `<abteilung>-abteilungs-claude.md` an der Plugin-Wurzel,
  zweigeteilt (Teil 1 für alle Sessions der Abteilung, Teil 2 Werkstatt); verbindliche Vorlage
  `vorlagen/abteilungsplugin/abteilungs-claude.md.vorlage`, Bauprozess
  [`claude-netz-bau.md`](../standardprozesse/claude-netz-bau.md). Kein
  Memory-Share zwischen affiliate-Satelliten (siehe SSOT-Definition).

## Ebene 3 — Projekt-CLAUDE

- **Ort:** Arbeitsrepo. **Funktion:** Fachfakten des Repos; routet ins Repo-Wissen
  (`.nc/erinnerung/`). **Owner:** Repo-Team. **Update-Kanal:** Git.
- **Grenzen:** keine Kern- oder Abteilungsinhalte duplizieren — nur Fachfakten des Repos.

## Ebene 3b — OS-Repo-Doku (Sonderfall von Ebene 3)

- **Ort:** dieses Repo. **Besonderheit NovaCore:** Die Zweiteilung liegt nicht in einer
  gesplitteten CLAUDE, sondern in der Trennung **getrackt/un-getrackt**: `AGENTS.md` ist die
  normative Einstiegs-Doku für alle Agenten (Repo-Karte, Standardzyklus, Sync-Matrix), die
  lokale `CLAUDE.md` ist in `.gitignore` und trägt nur maschinenlokale Ergänzungen.
- **Owner:** Kern-Maintainer. **Update-Kanal:** Git (nur `AGENTS.md`).

## Begriffsklärung: Repo-Doku ≠ Plugin-CLAUDE

Der Kern ist per Definition die ständige Abteilung `gemeinsam` — also trägt das Kern-Plugin
den **ausgelieferten** Anteil (heute: `nc-sync.md` und die Autosync-Payload unter
`plugins/nc/doks/`), und daraus wird Ebene 1 materialisiert. Ein Repo, das mehrere Plugins
hostet (heute `nc`, `nc-development`), hat entsprechend je Plugin ausgelieferte Doku und
**eine** Repo-Doku (`AGENTS.md`, nicht ausgeliefert). Die Artefakt-Arten haben verschiedene
Leser: **ausgelieferte Plugin-Doku** = alle Nutzer des Plugins, überall; **Repo-Doku** = wer
IM Repo baut.

## Präzedenzregel (normative Konvention, keine Harness-Mechanik)

- **Methodik/Prozess/Safety:** Ebene 0 > 1 > 2.
- **Fachfakten:** Projekt-Doku (3/3b) vor allen.
- Konflikte werden durch **Umformulierung** aufgelöst, nicht durch Mechanik erzwungen — es
  gibt keinen Harness-Mechanismus, der eine Ebene automatisch über eine andere stellt.

## Marker-Konvention der Privat-Zone (Ebene 1)

Firmen-Blöcke stehen zwischen HTML-Kommentar-Markern:

```
<!-- NC:BLOCK:START name -->
<!-- NC:BLOCK:VERSION <kern-version> -->
…
<!-- NC:BLOCK:ENDE name -->
```

Alles außerhalb dieser Marker ist Privat-Zone und wird von Updates nie berührt. Bei
**defekten** Markern (START ohne ENDE, ENDE vor START, Mehrfach-Marker) schreibt der Autosync
**nichts** und warnt auf stderr — lieber veraltet als zerstört.

## Kanal-Regel

Je schneller sich ein Inhalt ändert, desto automatischer muss sein Kanal sein:
SessionStart-Injektion (auto, jede Session) > Plugin-Paket via Marketplace-Auto-Update (auto
bei Bump) > Autosync-Doks (auto bei erster Session nach Update) > Git-Dateien (bei Pull). Die
Kanal-Regel entscheidet je Inhaltsart die Schicht — nicht umgekehrt. Lebender Stand →
Injektion/Skill; stehende Ordnung → CLAUDE-Ebenen; Fachwissen → SSOT-Repos.

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus, auf
Weisung Lucas Vöhringer.*
