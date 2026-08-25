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
Laufzeit-Gedächtnis der Arbeits-Repos (**Projekt-Memory**; der frühere lokale Dateistrom
`.nc/erinnerung/` ist seit 2026-08-24 aufgehoben — [Systemachsen](NovaCore-OS-Systemachsen.md),
Abschnitt „Die lokale Ebene") und die verteilten Doks
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

## Nachtrag 2026-08-24 — SSOT-Wissen vs. ausgeliefertes Laufzeit-Regelwerk

*(Entscheid EN6 „übernehmen, angepasst" + P-E5; AP-C2 des Phase-I-Bauplans, Mapping D13.)*

**Die Frage:** Gehört ein Inhalt in die Wissensbasis (`knowledge-base/`) oder als ausgeliefertes
Laufzeit-Regelwerk nach `plugins/<name>/referenz/`?

**Der Schnitt:** Ein installiertes Plugin sieht **keine** Repo-Pfade — nur, was im
Plugin-Verzeichnis mitkopiert wurde. Regelwerk, das **zur Laufzeit auf der Maschine des
Nutzers** gelten muss (SKILL.md-Formatregeln, Subagenten-Formatregeln, Queue-Format und
Kriterienliste), liegt deshalb unter `plugins/<name>/referenz/` und wird ausgeliefert. Es ist
damit **Produktklasse**, nicht Wissensklasse (Aktualisierungs-Index §0): Es wird mit dem Plugin
versioniert, erscheint im CHANGELOG — und bekommt **keine** SSOT-Index-Zeile.

**Freigegebene Instruktions-Träger — Abweichung vom Vorbild seit 2026-08-25 aufgehoben.** Onsite
kennt genau einen freigegebenen Träger im Paket: `doks/`. **Bei uns ist es seit 2026-08-25 ebenfalls
nur noch `doks/`** — die frühere Zweitausnahme (`plugins/nc/nc-sync.md` außerhalb von `doks/`, belegt
im damaligen Code `plugins/nc/hooks/nc-doks-autosync.js`, Z. 45–48) ist mit dem Umzug der
Ebene-1b-Payload nach `plugins/nc/doks/nc-teamsync.md` entfallen: dieselbe Datei, derselbe Inhalt,
jetzt am selben Ort wie Onsites `doks/oai-teamsync.md`. Der Fundstellen-Sweep zog alle Referenzen
(Skills, `workflow.md`, Standardprozesse) auf den neuen Pfad nach — weiterhin **eine** Quelle, keine
Doppelpflege.

**Einstufung des Bestands (P-E5 — Beleg je Datei, kein pauschaler Stempel).** Geprüft wurde die
PR-Historie je Datei:

| Datei | Eingeführt in | Review-Beleg | Einstufung |
|---|---|---|---|
| `referenz/skill-authoring.md` | PR #3 | PR-Body führt ein **externes Kimi-Review (read-only)** mit Ergebnisabschnitt | belegt review**t** — durch Agenten-Review |
| `referenz/agent-authoring.md` | PR #20 | PR-Body führt die **Review-Kette N1** (Selbstreview + deterministische Gegenproben, GLM-Review) | belegt reviewt — durch Agenten-Review |
| `referenz/pflege-auspraegung.md` | PR #21 | PR-Body führt **zwei GLM-5.3-Runden** mit Befundzählung und eingearbeiteten Fixes | belegt reviewt — durch Agenten-Review |

**Der ehrliche Rest:** Alle drei PRs stehen auf GitHub bis heute auf `REVIEW_REQUIRED` mit
**null aufgezeichneten Reviews**. Es gibt also je Datei einen **dokumentierten Review-Vorgang**,
aber **kein aufgezeichnetes Maintainer-Approval**. Ein pauschaler `unreviewed`-Stempel wäre
falsch (die Vorgänge sind belegt); ein „vom Maintainer abgenommen" wäre es ebenso. Der Rest
steht als eigene Zeile im
[Offene-Stränge-Register](../sitzungswissen/offene-straenge-register.md).

**Norm ab sofort:** **Keine weitere `referenz/`-Neuanlage ohne ausdrückliche Abnahme.** Wer eine
neue Datei unter `plugins/<name>/referenz/` anlegen will, begründet in derselben Änderung, warum
der Inhalt zur **Laufzeit beim Nutzer** gebraucht wird und deshalb nicht in die Wissensbasis
gehört — und holt die Abnahme ein, bevor die Datei ausgeliefert wird.

---

*Angelegt 2026-08-10 durch Claude (Opus 5, Claude Code) im Zuge des Onsite-Align-Umbaus, auf
Weisung Lucas Vöhringer; Begriffshoheit: Lucas Vöhringer. Nachtrag 2026-08-24 (Phase I, AP-C2)
durch Claude (Opus 5) als Overseer.*
