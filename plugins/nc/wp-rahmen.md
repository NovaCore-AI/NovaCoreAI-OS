# WP-Rahmen WP0–WP8 — der Pflicht-Zyklus aller Abteilungen

> **Normative Metastruktur des NovaCore-OS.** Sie liegt im Kern-Plugin `nc`, weil sie für
> **jede** Abteilung gilt. Jedes Abteilungsplugin übersetzt WP1–WP7 in seinen realen
> Arbeitszyklus und legt diese Übersetzung in seiner eigenen `workflow.md` ab (Beispiel:
> `workflow.md` des Abteilungsplugins `nc-development` für den NovaCore-Entwicklungszyklus).
> Bei Widerspruch gilt für die Rahmenpunkte diese Datei, für den Fachablauf die
> Abteilungs-`workflow.md`. Grundlage: Design-Spec vom 2026-07-28, §4 (OS-Repo).

## Grundsatz

Der Agent leistet die operative Arbeit, **der Mensch versteht, prüft und verantwortet.**
Überspringt der Nutzer einen Pflichtpunkt, greift der Agent ein: eine Zeile Begründung, dann
den Schritt nachholen. KI verstärkt vorhandene Disziplin oder vorhandenes Chaos — der Rahmen
liefert die Disziplin als Prozessbestandteil, nicht als Appell.

## Die neun Punkte

| WP | Punkt | Was der Punkt verlangt | Träger |
|---|---|---|---|
| WP0 | Session-Start | Kontext laden (Stand, Journal, Git-Lage, Werkzeuglage) — kein Blind-Start | Kern: `/nc:start` |
| WP1 | Verstehen | Auftrag erfassen, Definition-of-Ready prüfen, Arbeitsraum anlegen | Abteilung |
| WP2 | Planen | Vorhaben in prüfbare Scheiben schneiden, bevor Artefakte entstehen | Abteilung |
| WP3 | Umsetzen | Arbeit leisten — Test-First auf kritischem Pfad, nichts dazuerfinden | Abteilung |
| WP4 | Quality-Gate | Prüfungen der Abteilung vor jeder Übergabe; rot → erst grün machen | Abteilung |
| WP5 | Selbst-Review + Übergabe | Eigenen Diff prüfen, Übergabe vorbereiten | Abteilung |
| WP6 | Review | Fremdprüfung vorbereiten, durchführen, einarbeiten | Abteilung |
| WP7 | QS & Abnahme | Ergebnis in der Realität prüfen, Feedback-Schleife bis zur Abnahme | Abteilung |
| WP8 | Session-Ende | Stand sichern, Entscheidungen protokollieren, Übergabe schreiben | Kern: `/nc:end-session` |

Ergänzend jederzeit: **`/nc:journal`** hält **einzelne** Ereignisse fest, sobald sie anfallen,
statt sie bis WP8 zu sammeln — Entscheidung, Fund, Blocker, Erledigtes, jeweils mit Beleg.

**Warum WP0/WP8 im Kern liegen:** Sie sind abteilungsunabhängig und arbeiten auf dem
Sitzungsgedächtnis: im **OS-Repo** selbst unter `knowledge-base/sitzungswissen/`
(`stand.md` konsolidiert, `journal/<YYYY-MM-DD>.md` append-only); in einem fremden
Arbeits-Repo ohne eigene Wissensbasis trägt stattdessen dessen Projekt-Memory den Stand
allein — dort entsteht kein Dateistrom mehr. Der Kern ist über `dependencies` jedes
Abteilungsplugins immer aktiv — der Rahmen kann damit nicht fehlen.

## Globale Freigabe-Politik

Keine automatischen **Pushes, Merges, Posts, Releases oder Deployments** ohne explizite
Nutzerfreigabe — in **jedem** Skill jeder Abteilung, ausdrücklich auch für Folge-Aktionen in
Feedback-Schleifen, nicht nur für die erste.

## Rote Linien (abteilungsübergreifend)

Der Agent **bereitet vor**, der Mensch handelt. Nie automatisiert:

- **Pushes** auf geteilte Branches auslösen; `main` bleibt lauffähig, kein direkter Push darauf
- **Merges** ausführen
- **Reviews resolven oder approven**
- **Releases** schneiden oder veröffentlichen
- **Deployments** auslösen (jeder Klick in einer Deploy-Oberfläche)
- **Kundensichtbares posten** (Pull-Request-Texte, Ticket-Kommentare, Kundenkommunikation)

Jede Abteilung benennt in ihrer `workflow.md`, welcher Skill welche Linie trägt („Ownership") —
der Skill trägt das **Verbot** und führt durch den sicheren Ablauf, statt die Aktion selbst
auszuführen. Firmen- oder projektspezifische Zusatzmuster für das Destruktiv-Gate des
Fact-Forcing-Gates kommen über die Env-Variable **`NC_FFG_EXTRA_DESTRUCTIVE`** (Regex).

## Verifikation statt Behauptung

Jeder Punkt endet mit einem prüfbaren Artefakt: Befehl plus erwartetes Ergebnis,
Pipeline-Status, Ticket-Status, Datei-Existenz, grüner Test. „Sollte passen" ist kein
Abschluss — Evidence statt Zusicherung.

## Für Abteilungsplugins verbindlich

1. WP1–WP7 in der eigenen `workflow.md` auf den realen Zyklus abbilden, mit mindestens einem
   auto-triggerbaren Skill je Punkt und **disjunkten** Trigger-Begriffen.
2. WP0/WP8 **nicht** nachbauen — sie kommen aus dem Kern-Plugin `nc`.
3. Rote-Linien-Ownership je Skill benennen.
4. Diese Datei per Namen verlinken, ihre Inhalte **nicht** duplizieren.
5. **Keine Hooks mitbringen** — die Kontroll-Schicht liegt ausschließlich im Kern, sonst feuern
   Gates mehrfach.
