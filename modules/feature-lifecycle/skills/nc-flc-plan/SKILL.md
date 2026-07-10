---
name: nc-flc-plan
description: "[FLC] Task in vertikale, PR-große Slices zerlegen — jeder Slice ist eigenständig testbar, reviewbar und mergebar. Nutze diesen Skill nach /nc:flc-feature-start für nicht-triviale Aufgaben."
---

# /nc:flc-plan — Task slicen

## Zweck

Zerlegt eine geklärte Anforderung in kleine, vertikale Slices, die jeweils in
einen eigenen, gut reviewbaren PR passen. Kleine PRs sind der wichtigste Hebel
gegen lange, ungleichmäßige Reviews.

## Ablauf

1. **Voraussetzung prüfen:** Die Anforderung muss geklärt sein (aus `/nc:flc-feature-start`). Falls nicht, dorthin zurückverweisen.
2. **Slices schneiden:** Aufgabe in 2–7 vertikale Slices zerlegen. Jeder Slice:
   - liefert für sich genommen sichtbaren Wert oder abgeschlossene Funktionalität
   - ist unabhängig testbar (Tests gehören zum Slice, nicht ans Ende)
   - passt in einen PR von überschaubarer Größe (Richtwert: < 400 geänderte Zeilen)
   - schneidet durch alle Schichten (kein „erst das ganze Backend, dann das ganze Frontend")
3. **Reihenfolge und Abhängigkeiten:** Slices ordnen, Abhängigkeiten explizit benennen.
4. **Risiken markieren:** Pro Slice unklare oder riskante Punkte notieren.
5. **Plan bestätigen lassen:** Plan als nummerierte Liste präsentieren und Freigabe einholen, bevor implementiert wird.

## Regeln

- Kein Slice ohne Testanteil.
- Bei mehr als ~7 Slices ist der Task zu groß — Rückschnitt vorschlagen.
- Der bestätigte Plan wird von `/nc:save-session` ins Journal übernommen.
