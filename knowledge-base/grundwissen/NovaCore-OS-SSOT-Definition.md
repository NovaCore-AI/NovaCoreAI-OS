# SSOT — Definition und Umfang (Grundsatzdokument)

> **Zweck:** die **normative Begriffsquelle** für „SSOT" im NovaCore-OS. Angelegt 2026-08-10
> im Zuge des Onsite-Align-Umbaus (Bauplan AP4); Struktur nach dem Onsite-Vorbild, Inhalt auf
> NovaCore gemappt. Begriffshoheit liegt beim Maintainer.

## Wortbedeutung und Umfang

SSOT (= Single Source of Truth) bezeichnet im NovaCore-OS **die SSOT-Infrastruktur**: die
Dokumente, die Wissen speichern und verknüpfen — globale, projektspezifische und
teamsynchronisierte `CLAUDE.md`-Dateien (Ebenen-Norm:
[NovaCore-OS-CLAUDE-Ebenen-Definition.md](NovaCore-OS-CLAUDE-Ebenen-Definition.md)); die
Ordnerstruktur der Wissensbasis (`knowledge-base/`) im OS-Repo samt aller dort abgelegten
Dokumente; sowie drittanbieter- oder firmenspezifisches Wissen bzw. dessen Einbindung.

## Definition

Die SSOT fasst **alle Wissenssammlungen zusammen, mit denen das OS kooperiert** — es ist
darauf ausgelegt, sich daran anzupassen und externes Firmenwissen einzubinden. Die
entstehende Infrastruktur aus diesen (externen) Quellen und Dokumenten **plus ihrer
Orchestrierung und Automatisierung im OS** beschreibt die SSOT. Sie ist also ein **Hybrid**
aus:

1. den **physischen Quellen** (Dokumente, Wissensbasen, Fremdsysteme),
2. der **Methode**, wie sie aufgebaut und verknüpft werden, und
3. ihrer **technischen Einbindung** in das OS über Hooks und standardisierte Arbeitsabläufe.

Sie umfasst damit alle drei Ebenen des Wissens im OS — die Wissensbasis des OS-Repos, das
Laufzeit-Gedächtnis in den Arbeits-Repos (`.nc/erinnerung/`) und die verteilten Doks
(Global-/Projekt-CLAUDEs, seit 2026-08-10 per Doks-Autosync) — **und deren Orchestrierung
miteinander**.

## Naheliegende Themen

Die Hooks und Skills rund um die SSOT-Pflege: `/nc:start`, `/nc:save-session`, `/nc:journal`,
`doku-sync`, der Doks-Autosync (`nc-doks-autosync.js`) und die Struktur-Tests, die den
Master-Index gegen die Platte prüfen.

## Namensgebung

Die Hauptinfrastruktur der Wissensverarbeitung des OS liegt in **einem** Kernrepo. Die
SSOT-Infrastruktur beschreibt **ein** zusammenhängendes methodisches Netz, das Wissensbasen
und Standardprozesse — im Ziel das gesamte Firmenwissen für KI — in **einem** System bündelt:
dem OS.

## Idee dahinter

Die SSOT kann sich über Skills, Hooks und die Definition standardisierter methodischer
Arbeitsabläufe in der Firma **automatisch spezialisieren, individualisieren und wachsen** —
sie wird damit zum firmenspezifischen neuronalen Netzwerk der KI-Agenten im OS.

## Funktionen

- stellt Claude-Code-Agenten das firmeninterne Wissen zur Verfügung → deutlich bessere
  Qualität und Effizienz der KI-Agenten;
- ermöglicht **Lernen der KI aus eigenen Fehlern** (Fehlerprotokoll
  `debugging-findings/agent-learnings.md`), wachsenden dokumentierten Abläufen und
  Prozesserfahrungen;
- erschafft mit der Zeit eine firmeninterne KI-Infrastruktur, die User und Agent bei deutlich
  erhöhter Effizienz kooperieren lässt, Prozesse (teil-)automatisiert und Firmenabläufe
  effizienter macht;
- macht KI-Output in **heterogenen Teams skalierbar** und sorgt für eine klare aktuelle und
  historische Datenlage.

## Kurzfassung

Die SSOT ist eine Wissensbasis, die für höhere Qualität und Effizienz des Outputs von KI und
User sorgt. Sie stellt eine **lebendige, wachsende und transparente Infrastruktur** für die
operative und skalierbare Integration von KI-Agenten in Firmen und Teams dar — sie
spezialisiert und individualisiert sich selbst und hält sich dabei selbst instand.

## Abgrenzung Satelliten-Wissen: firmenintern vs. affiliate

**Kein Memory-Share zwischen Satelliten, keine Queue/Promotion** (Maintainer-Entscheid
2026-08-10; bewusste Abweichung vom Onsite-Vorbild §15.24). Die Unterscheidung ist
verbindlich:

| Klasse | Plugins | SSOT-Zugehörigkeit |
|---|---|---|
| **firmenintern** | Kern `nc`, `nc-development` | teilen die SSOT dieses Repos |
| **affiliate** | Satelliten-/Kollegen-OS (`nc-felix`, `nc-biggi`) und persönliche Tools (Marketplace-Kategorie `affiliate`) | **eigene, getrennte Wissensbasis im jeweiligen Repo** |

Konkret ausgeschlossen: Kandidaten-Queue, Kurationslauf, „Aufrücken" von Abteilungswissen in
den Kern, Cross-Abteilungs-GitHub-Reads. Wird ein Austausch später gewollt, ist das eine
eigene Nachiteration mit eigener Konzeption — kein Nebenbei-Schritt.

Was aus dem Vorbild **trotzdem** gilt, als reine Redaktionsdisziplin ohne jede Mechanik:
**„Kern verlinkt, Abteilung dokumentiert"** — dieselbe Sache wird nicht an zwei Orten
ausformuliert (Doppelpflege-Verbot); der Kern verweist, die Abteilung beschreibt.

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus, auf
Weisung Lucas Vöhringer; Begriffshoheit: Lucas Vöhringer.*
