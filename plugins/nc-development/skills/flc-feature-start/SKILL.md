---
name: flc-feature-start
description: >-
  Beginnt die Arbeit an einem Feature, einer Änderung oder einem Ticket, indem der Skill die
  Anforderung in eigenen Worten klärt, die Abgrenzung bestätigen lässt, den Repo-Kontext lädt,
  die betroffenen Dateien und Tests benennt und einen Feature-Branch vorschlagen lässt.
  Implementiert nichts, sondern bereitet vor und empfiehlt den nächsten Schritt.
  Trigger-Begriffe: „Feature beginnen", „neue Änderung anfangen", „Ticket bearbeiten",
  „Anforderung klären", „Feature-Branch anlegen".
---

# /nc-development:flc-feature-start — Feature beginnen

## Zweck

WP1 „Verstehen" aus der `workflow.md` dieser Abteilung: Startpunkt jeder Änderung. Der Skill
stellt sicher, dass vor der Implementierung die Anforderung verstanden, der Kontext geladen und
ein sauberer Arbeitszweig vorbereitet ist — ein Feature beginnt nie blind. Überspringt der
Nutzer diesen Punkt, greift der Skill ein (kurze Begründung, dann den Schritt nachholen) statt
stillschweigend weiterzumachen. Danach übernimmt `/nc-development:flc-plan` (WP2) oder — bei
Kleinständerungen — direkt die Umsetzung.

## Ablauf

1. **Anforderung klären:** Die Aufgabe in eigenen Worten zusammenfassen. Unklare Punkte als
   konkrete Rückfragen stellen — nachfragen statt raten. Erst fortfahren, wenn Ziel **und**
   Abgrenzung („was gehört NICHT dazu") vom Nutzer bestätigt sind.
2. **Kontext laden:** Falls in dieser Sitzung noch nicht geschehen, `/nc:start` ausführen
   (Stand, Journal, Git-Status). Ohne geladenen Kontext nicht weiterarbeiten.
3. **Betroffene Stellen finden:** Relevante Dateien, Module und Tests im Arbeits-Repo
   identifizieren und kurz benennen — mit Pfad, nicht als Vermutung.
4. **Branch vorbereiten:** Von einem aktuellen `main` einen Feature-Branch nach dem Muster
   `feat/<kurzbeschreibung>` vorschlagen — der Branch-Name ist ein Code-Artefakt,
   Entwurfssprache nach `nc-teamsync.md` §6 des Kern-Plugins `nc`. Kein direkter `main`-Push: Feature-Branch → PR →
   Review → Merge.
5. **Branch-Namen freigeben lassen:** Vorschlag zeigen, Freigabe einholen, erst danach den
   Branch anlegen.
6. **Nächsten Schritt empfehlen:** Bei nicht-trivialen Aufgaben `/nc-development:flc-plan` zum
   Slicing; bei Kleinständerungen direkt implementieren und mit
   `/nc-development:flc-commit-prep` abschließen.
7. **Ergebnis festhalten:** Anforderung, offene Fragen und Branch-Name kompakt zusammenfassen,
   damit `/nc:end-session` sie ins Journal übernehmen kann.

## Regeln

- **Keine Implementierung in diesem Skill** — er bereitet ausschließlich vor.
- **Nicht weiterarbeiten, solange Ziel oder Abgrenzung unbestätigt sind.** Widersprüchliche
  oder fehlende Angaben führen zur Rückfrage, nicht zu einer Annahme.
- Fachliche Fakten (Schwellenwerte, Datenmodelle, Verträge) stammen ausschließlich aus dem
  Arbeits-Repo — aus dessen Projekt-Doku und echtem Quellcode, nie aus dem Gedächtnis.
- **Rote Linie:** Kein Push, kein PR, kein Merge in diesem Skill — auch nicht „vorbereitend".
  Der Branch bleibt lokal, bis `/nc-development:flc-pr` mit Nutzerfreigabe übergibt.
- Betroffene Stellen nur benennen, wenn sie tatsächlich gelesen wurden; Vermutungen als
  Vermutung kennzeichnen.

## Verifikation

- Die Zusammenfassung der Anforderung inklusive expliziter Abgrenzung liegt im Chat vor und ist
  vom Nutzer bestätigt.
- Offene Rückfragen sind als Liste benannt oder es ist ausdrücklich festgehalten, dass keine
  offen sind.
- Die betroffenen Dateien/Module/Tests sind mit Pfad genannt.
- `git branch --show-current` zeigt den freigegebenen Feature-Branch; `git status` zeigt keine
  ungewollt mitgeschleppten Änderungen.
- Der empfohlene nächste Skill ist ausgesprochen (`/nc-development:flc-plan` oder direkte
  Umsetzung mit anschließendem `/nc-development:flc-commit-prep`).
