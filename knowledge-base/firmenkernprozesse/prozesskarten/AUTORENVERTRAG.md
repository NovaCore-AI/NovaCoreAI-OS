# Autorenvertrag — Prozesskarten

Gilt für jede Datei in diesem Ordner. Die Karten erklären die Standardprozesse in
`knowledge base/plugin-maintanance-ruleset-source/`. Sie sind **nicht normativ**.

## Vorbild

`C:\Users\LucasVöhringer\Desktop\Onsite.ai-OS-Featurekarte.md`

Ton: direkt, deutsch, keine Floskeln. Viele Mermaid-Grafiken. Tabellen für Inventar.
Jede Karte steht allein lesbar — keine Abhängigkeit von einer anderen Karte außer
einem Verweis auf `00-FAMILIE-UND-VERDRAHTUNG.md`.

## Pflichtkopf jeder Karte

```markdown
# <Prozessname> — Prozesskarte

> **Was das ist:** Visuelle Landkarte des Standardprozesses …
> **Quelle (normativ):** `Onsite.ai-OS/knowledge base/plugin-maintanance-ruleset-source/<datei>.md`
> **Stand der Karte:** 2026-08-15 · gegen die Quelldatei auf der Platte
> **Nicht normativ.** Bei Widerspruch gewinnt die Quelldatei.
```

## Was die Karte leisten muss

1. Zweck in einem Satz + einem Übersichtsdiagramm.
2. Wann der Prozess greift (Trigger / Nicht-Trigger).
3. Ablauf als State- oder Sequence-Diagramm, Schritte nummeriert wie in der Quelle.
4. Artefakte: was gelesen, was geschrieben, was nie angefasst wird.
5. Kopplungen zu anderen Prozessen, Skills, Hooks, Tests — nur wenn die Quelle sie nennt.
6. Fallen / bekannte Fehler, falls die Quelle welche hat.
7. Verifikation / Abschluss, falls die Quelle welche hat.
8. Anhang mit Dateizeigern zurück in die Quelle.

## Harte Verbote

- **Nichts erfinden.** Kein Schritt, keine Datei, kein Env, keine Versionszahl, die nicht
  in der Quelldatei (oder einer von ihr ausdrücklich verwiesenen Datei) steht.
- **Nicht glätten.** Ist die Quelle veraltet (z. B. `kern-plugin-bau.md` §5 nennt Gate 2
  als offen, obwohl Gate 2 gebaut ist), die Karte sagt das offen: „so im Prozessdokument,
  Ist-Stand steht im Betriebshandbuch / in der Featurekarte". Nicht still korrigieren.
- **Keine Spekulation** über Controlling-Skills, Mneme, Web-GUI, Gate-3-Details.
- **Nicht ins OS-Repo schreiben.** Nur in diesen Desktop-Ordner.
- **Kein Commit, kein Push.**
- **Keine Secrets.**
- Keine leeren Abschnitte, keine TODOs, keine „TBD".

## Grafik-Regeln

- Mermaid: `flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `mindmap` — je nachdem, was der
  Inhalt verlangt. Mindestens **5 Diagramme** pro Karte, bei kurzen Quellen mindestens **4**.
- Knotenbeschriftungen in Anführungszeichen, wenn Sonderzeichen vorkommen.
- Keine Node-IDs namens `end`, `subgraph`, `graph`.
- Keine HTML in Mermaid-Labels außer `<br/>`.
- Nach jedem Diagramm 2–6 Sätze, die es lesbar machen — Grafik allein reicht nicht.

## Umfang

| Quelllänge | Zielumfang der Karte |
|---|---|
| unter 80 Zeilen | 180–280 Zeilen |
| 80–160 Zeilen | 280–450 Zeilen |
| über 160 Zeilen | 400–700 Zeilen |

Nicht aufblähen. Jede Grafik muss eine echte Relation zeigen.

## Sprache

Deutsch. Process-Begriffe aus der Quelle unverändert (`Aktualisierungs-Index`,
`Prüfungs-Eigentum`, `reserve/*`, `sparse clone`). Keine neuen Kunstnamen.
