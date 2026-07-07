---
name: nc-journal
description: Tages-Journal-Eintrag entwerfen — sammelt Git-Log und (optional) Jira-Aktivität des Tages und hängt einen Eintrag im Format des Repos an. Nutze diesen Skill am Ende eines Arbeitstags ("Journal-Eintrag für heute", "/nc:journal"). Arbeiten im Team-Modus (committet, Wochen-Datei) oder persönlichen Modus (.nc/erinnerung, Tages-Datei).
---

# /nc:journal — Tages-Journal entwerfen

## Zweck

Entwirft aus Git-Aktivität, optional Jira und Session-Kontext einen kompakten
Tages-Journal-Eintrag und hängt ihn ans Dateiende an. **Entwurf, nicht Commit** —
die Nutzerin/der Nutzer prüft und passt an.

Dieser Skill ergänzt `/nc:save-session`: save-session sichert die **Session**
(technisch, was war gemacht), `/nc:journal` sichert den **Arbeitstag** (team-
Facing, Entscheidungen, „Wartet auf Kunde"). Beide können am Tag genutzt werden.

## Modus-Erkennung (zwei Pfade)

**Schritt 0 — Marker prüfen:** Ohne `.nc-os`-Marker im Repo-Root abbrechen und auf
`/nc:setup` verweisen.

**Schritt 1 — Team-Modus vs. persönlicher Modus bestimmen** (in dieser Reihenfolge):

1. **Konfiguration im Repo:** Steht in der repo-eigenen `CLAUDE.md`/`AGENTS.md`
   ein Journal-Pfad (Suchmuster `nc-journal:` oder ein Abschnitt „Journal")? Dann
   diesen Pfad als Team-Journal-Verzeichnis nehmen → **Team-Modus**.
2. **Konvention erkennen:** Existiert irgendwo im Repo (nicht unter `.nc/`) ein
   Verzeichnis `Journal/` mit `README.md`? Dann dieses als Team-Journal nehmen →
   **Team-Modus**. (Typisch: `Dokumente/Journal/`, `docs/Journal/`.)
3. **Sonst:** → **persönlicher Modus**, Datei `.nc/erinnerung/journal/<YYYY-MM-DD>.md`.

Im Team-Modus ist das Journal **committet und team-geteilt** (Wochen-Datei). Im
persönlichen Modus ist es **lokal und gitignored** (Tages-Datei, wie save-session).

## Ablauf

1. **Datum & Kalenderwoche bestimmen:**
   ```bash
   date +%G-KW%V    # z. B. 2026-KW28 (Team-Modus: Wochen-Datei)
   date +%F         # z. B. 2026-07-07 (persönlicher Modus: Tages-Datei)
   ```

2. **Quellen sammeln:**
   - **Git:** `git log --since="today 00:00" --oneline` und `git status --short`
     (uncommitted Arbeit → unter „Hakt" oder „Fertig" mit Vermerk).
   - **Jira (optional, nur wenn Atlassian-MCP verfügbar):** Jira-Projekt-Key aus
     der repo-eigenen Anweisung lesen (z. B. `EP`); falls nicht konfiguriert,
     Nutzerin fragen oder überspringen. JQL:
     `project = <KEY> AND updated >= startOfDay() ORDER BY updated DESC`.
     Erledigte/verschobene Tickets und neue Blocker-Stände extrahieren.
   - **Session-Kontext:** heute getroffene fachliche Entscheidungen (aus Verlauf
     oder `.nc/erinnerung/stand.md`).

3. **Ziel-Datei öffnen bzw. anlegen:**
   - **Team-Modus:** `<Journal-Verz>/<JAHR>-KW<NN>.md`. Existiert sie nicht, neu
     anlegen mit Header `# Journal <JAHR> — KW<NN> (<Mo.>–<So.>)`. Gibt es eine
     `README.md` mit Vorlage/Regeln im Journal-Verzeichnis, **diese** Vorlage
     verwenden (Projekt-spezifisch) — sie gewinnt über die Default-Vorlage unten.
   - **Persönlicher Modus:** `.nc/erinnerung/journal/<YYYY-MM-DD>.md`. Verzeichnis
     anlegen falls nötig; `.nc/` muss in `.gitignore` stehen (sonst ergänzen und
     darauf hinweisen).

4. **Eintrag ans Dateiende anhängen** (append-only — bestehende Zeilen nie ändern).

5. **Entwurf zeigen**, fehlende Angaben (Stunden, wer) kurz erfragen statt raten.

6. **Entscheidungen nachtragen:** Steht etwas unter „Entscheidungen", daran
   erinnern, es auch an der projektspezifischen Stelle nachzuziehen (z. B.
   Projektplan §11.C / Entscheidungslog). **Das Journal ist nur der Zeiger**.

7. **Nicht committen/pushen**, außer die Nutzerin/der Nutzer bittet ausdrücklich
   darum (Repo-Regel: Git-Aktionen nur nach Freigabe).

## Default-Vorlage (wenn keine projekt-eigene existiert)

**Team-Modus (Wochen-Datei, ein Abschnitt pro Tag, max. ~8 Zeilen):**
```markdown
## JJJJ-MM-TT · <Wer> (<Std>) / <Wer> (<Std>)

**Fertig:** <Ticket-Keys + Halbsatz>
**Entscheidungen:** <Was → Verweis Plan/Doku §…>
**Wartet auf Kunde:** <Ticket-Keys / seit wann / was angestoßen>
**Hakt:** <Problem + nächster Klärungsschritt>
**Nächster Zug:** A: <Key> · B: <Key>
```
Leere Felder weglassen. Ticket-Keys statt Prosa. Leitfrage: *Was muss mein Ich
von nächster Woche / mein Teampartner wissen?*

**Persönlicher Modus (Tages-Datei, kompakt):**
```markdown
## JJJJ-MM-TT HH:MM — <Aufgabe(n)>
- getan: …
- entschieden: …
- offen / nächster Schritt: …
```

## Regeln

- **Append-only:** bestehende Einträge niemals verändern oder löschen.
- **Zeiger, nicht Source:** Entscheidungen gehören in die Fachdokumentation; das
  Journal verweist nur dorthin.
- **„Wartet auf Kunde" ist das wichtigste Feld** im Team-Modus — dort versanden
  Projekte mit Kundenabhängigkeit.
- **Kein Auto-Commit:** Entwurf zeigen, Git-Aktionen nur nach Freigabe.
- **Markdown-Felder weglassen**, wenn leer — kein „N/A"-Platzhalter.
- **Keine Secrets** ins Journal (auch nicht ins persönliche — es bleibt lokal,
  aber die Disziplin gilt überall).
