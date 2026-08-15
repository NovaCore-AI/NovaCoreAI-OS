---
name: flc-plan
description: >-
  Zerlegt eine geklärte Anforderung in 2 bis 7 vertikale, PR-große Slices, die jeweils
  eigenständig testbar, reviewbar und mergebar sind, ordnet sie nach Abhängigkeiten, markiert
  Risiken je Slice und holt vor der Implementierung die Freigabe des Plans ein. Richtwert je
  Slice unter 400 geänderte Zeilen; kein Slice ohne Testanteil.
  Trigger-Begriffe: „Task slicen", „Aufgabe zerlegen", „Umsetzung planen", „PR-Schnitt
  festlegen", „Implementierungsplan".
---

# /nc-development:flc-plan — Task slicen

## Zweck

WP2 „Planen" aus der `workflow.md` dieser Abteilung: Zerlegt eine geklärte Anforderung in
kleine, vertikale Slices, die jeweils in einen eigenen, gut reviewbaren PR passen. Kleine PRs
sind der wichtigste Hebel gegen lange, ungleichmäßige Reviews. Der Skill läuft nach
`/nc-development:flc-feature-start` (WP1) und vor der Umsetzung (WP3).

## Ablauf

1. **Voraussetzung prüfen:** Die Anforderung muss geklärt und abgegrenzt sein (Ergebnis aus
   `/nc-development:flc-feature-start`). Ist sie es nicht, dorthin zurückverweisen statt auf
   unklarer Basis zu planen.
2. **Slices schneiden:** Die Aufgabe in 2–7 vertikale Slices zerlegen. Jeder Slice
   - liefert für sich genommen sichtbaren Wert oder abgeschlossene Funktionalität,
   - ist unabhängig testbar (Tests gehören **zum** Slice, nicht ans Ende),
   - passt in einen PR überschaubarer Größe (Richtwert: unter 400 geänderte Zeilen),
   - schneidet durch alle Schichten — kein „erst das ganze Backend, dann das ganze Frontend".
3. **Reihenfolge und Abhängigkeiten:** Slices ordnen und Abhängigkeiten explizit benennen
   (welcher Slice setzt welchen voraus).
4. **Risiken markieren:** Je Slice unklare oder riskante Punkte notieren — insbesondere
   Berührungen des kritischen Pfads (Geldfluss, Auth, Datenschutz, externe Verträge), weil dort
   Test-First gilt.
5. **Plan bestätigen lassen:** Den Plan als nummerierte Liste präsentieren und die Freigabe
   einholen, **bevor** implementiert wird.
6. **Übergabe:** Nach Freigabe je Slice umsetzen und mit `/nc-development:flc-commit-prep`
   (WP4) abschließen; der fertige Slice geht über `/nc-development:flc-pr` (WP5) in Review.

## Regeln

- **Kein Slice ohne Testanteil.** Ein Slice, dessen Tests „später" kommen, ist nicht geschnitten,
  sondern verschoben.
- **Bei mehr als etwa 7 Slices ist der Task zu groß** — Rückschnitt des Auftragsumfangs
  vorschlagen statt den Plan aufzublähen.
- **Nicht implementieren, solange der Plan nicht freigegeben ist.** Der Skill plant, er baut
  nicht.
- Slice-Grenzen nur entlang real vorhandener Strukturen ziehen; Module, Endpunkte oder Tabellen
  nur benennen, wenn sie im Arbeits-Repo belegt sind.
- Der bestätigte Plan wird von `/nc:end-session` ins Journal übernommen — ihn deshalb in einer
  zitierbaren, nummerierten Form hinterlassen.

## Verifikation

- Der Plan liegt als nummerierte Liste mit 2–7 Slices im Chat vor.
- Zu jedem Slice sind Testanteil, Abhängigkeiten und Risiken ausdrücklich genannt — keine
  Leerstellen.
- Die geschätzte Größe je Slice ist benannt und der Richtwert unter 400 geänderten Zeilen ist
  begründet eingehalten oder die Abweichung ist erklärt.
- Die Freigabe des Nutzers zum Plan ist im Verlauf dokumentiert, bevor Code entsteht.
