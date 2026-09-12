# Idee: Terminal-Cockpit für NovaCore-OS (Beobachter-CLI „ncpit")

> **Status:** beauftragt am 2026-09-05 — der Bauplan liegt in
> [`aktive-bauplaene/2026-09-05-ncpit-cli-bauplan.md`](../aktive-bauplaene/2026-09-05-ncpit-cli-bauplan.md);
> diese Idee bleibt als Herkunft liegen (Lebenszyklus laut `SSOT-Document-Index` Teil 1:
> Herkunft ≠ Arbeit).
> **Herkunft:** Eigenidee, Planungs-Session 2026-09-05; Datenquellen, Historie und Grenzen
> gegen dieses Repo verifiziert (Plan-Review Revision 2 durch den Maintainer).

## Problem

Das OS ist im Wesentlichen nur **innerhalb laufender Claude-Code-Sessions** beobachtbar:
Gates-Zustand, Setup-Beleg (S0–S6), Queue-Fälligkeit, PR-Sichtbarkeit und Journal sieht
man nur, während eine Session läuft und die Hooks feuern. Zwischen den Sessions gibt es
keine schnelle Ampel über den Installations- und Wissensstand — obwohl alle Daten bereits
lokal vorliegen (Infra-Registry `~/.claude/nc/infra.json`, Plugin-Cache, Sitzungswissen,
PR-Cache `~/.claude/nc/pr-sichtbarkeit.json`).

## Idee

Eine eigenständige CLI (**„ncpit"**, eigenes Projekt `nc-cli`, Schwester des
Cockpit-Prototyps nc-cockpit) als reines **Beobachter-Cockpit**: scriptbare Befehle
(`status`, `doctor`, `journal`, `stand`, `queue`, `prs`, `familie`, `gates`) plus
interaktives Terminal-Dashboard (Ink-TUI mit MiniOrbit). Rollenteilung zum Cockpit:
**das Cockpit bedient, die CLI beobachtet.**

## Grenzen (bewusst)

- **Kein Verteiler:** Die CLI installiert, updated und bootstrapt nichts — Verteilung
  bleibt allein dem Marketplace vorbehalten (Onsite-Beobachtungspunkt D24
  „init-cli-bootstrap-und-auto-update", Status B, bleibt gesperrt). Damit wiederholt sie
  nicht den Fehler der alten `ncos`, die an der Doppelung der Marketplace-Verteilung
  scheiterte (Spec-Erkenntnis 2, präzisiert durch Nachtrag 2026-09-05).
- **Kein Schreiber:** OS-Zustandsdateien (`infra.json`, Sitzungswissen, Queue, Stempel,
  Marker) werden nur gelesen — die Invariante „ein Beleg, ein Schreiber" bleibt
  unberührt; eigene Daten nur im eigenen Cache unter `~/.cache/ncpit/`.
- **Windows in V1 ausdrücklich ausgeschlossen** (Pfad-Code trotzdem `node:path`-sicher);
  Team-Verteilung erst nach séparater Entscheidung (Empfehlung: GitHub-Release-Tarball
  mit vorgebautem `dist`, unschädlich gegenüber global gesetztem npm `ignore-scripts`).
