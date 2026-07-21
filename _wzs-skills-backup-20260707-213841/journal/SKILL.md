---
name: journal
description: Tages-Journal-Eintrag für das Empfehlungssystem-Projekt entwerfen. Am Ende eines Arbeitstags nutzen ("Journal-Eintrag für heute", "/journal"). Sammelt Git-Log und Jira-Aktivität (Projekt EP) des Tages und ergänzt die aktuelle Kalenderwochen-Datei unter Empfehlungssystem-dev/Dokumente/Journal/.
---

# Tages-Journal entwerfen

Ziel: Eintrag für HEUTE in `Empfehlungssystem-dev/Dokumente/Journal/<JAHR>-KW<NN>.md` anhängen. Regeln + Vorlage: `Empfehlungssystem-dev/Dokumente/Journal/README.md` (max. ~8 Zeilen, Jira-Keys statt Prosa, leere Felder weglassen).

## Ablauf

1. Datum + ISO-Kalenderwoche bestimmen: Bash `date +%G-KW%V` und `date +%F`.
2. Quellen sammeln:
   - Git: `git log --since="today 00:00" --oneline` und `git status --short` (uncommitted Arbeit gehört unter „Hakt" oder „Fertig" mit Vermerk).
   - Jira: Atlassian-MCP-Tool `searchJiraIssuesUsingJql` (falls Schema nicht geladen: per ToolSearch laden) mit JQL `project = EP AND updated >= startOfDay() ORDER BY updated DESC` — erledigte/verschobene Tickets und neue Blocker-Stände extrahieren. Cloud: novacore-ai.atlassian.net.
   - Session-Kontext: heute getroffene fachliche Entscheidungen.
3. Ziel-Datei öffnen; existiert die KW-Datei nicht, neu anlegen mit Header `# Journal <JAHR> — KW<NN> (<Mo.>–<So.>)`.
4. Eintrag **ans Dateiende anhängen**, exakt im Vorlagen-Format (Felder: Fertig / Entscheidungen / Wartet auf Kunde / Hakt / Nächster Zug).
5. Entwurf dem Nutzer zeigen; fehlende Angaben (Stunden, zweite Person) kurz erfragen statt raten.
6. Steht etwas unter „Entscheidungen": daran erinnern, es auch im Projektplan nachzutragen (§11.C Entscheidungsstand bzw. §16 Änderungsprotokoll) — das Journal ist nur der Zeiger.
7. **Nicht committen/pushen**, außer der Nutzer bittet ausdrücklich darum (Repo-Regel: Git-Aktionen nur nach Freigabe durch Lucas).
