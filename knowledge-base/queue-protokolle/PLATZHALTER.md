# Platzhalter — Kategorie `queue-protokolle/`

Diese Datei hält den noch leeren Ordner in Git. Sie trägt kein Wissen und ist deshalb von der
Indexpflicht ausgenommen (`plugins/nc/tests/struktur.test.mjs`).

**Was hierher gehört:** die **committeten Prüfprotokolle** des Kern-Aufstiegslaufs
`/nc:queue-kern` — je Lauf ein Dokument `queue-protokoll-<abteilung>-<YYYY-MM-DD>.md` (der
Abteilungsname im Dateinamen ist der Ledger-Filter des Folgelaufs), darin je geprüfter
Queue-Zeile: Entscheid, Begründung und Ziel-Dokumentpfad. Das Protokoll ist der Beleg, gegen den
der Folgelauf den Merge-Stand hält und die Marker `befördert (PR #n)` / `abgelehnt (PR #n)`
zurückschreibt (Standardprozess [`queue-flow.md`](../standardprozesse/queue-flow.md), Stationen
6 und 8). Es entsteht mit dem ersten realen Lauf — der auswertende Skill `/nc:queue-kern` ist seit
AP-E2 desselben Bauzyklus gebaut und wartet auf diesen Lauf.

**Was nicht hierher gehört:** die Queue selbst (→ `kandidaten-queue/`), Prozessbeschreibungen
(→ `standardprozesse/`), Baupläne (→ `grundwissen/`), Fehler- und Debug-Protokolle
(→ `debugging-findings/`).

**Terminal und append-only im Geist der Protokolle:** Ein geschriebenes Prüfprotokoll wird nie
rückwirkend geändert — ein Irrtum bekommt ein neues Protokoll, das auf das alte verweist.

Sobald das erste Protokoll hier liegt, wird diese Datei gelöscht und die Kategorie in Teil 2 des
`SSOT-Document-Index` mit einer eigenen Tabelle geführt.

*Angelegt 2026-08-16 (Bauplan `2026-08-15-onsite-endstand-nachbau-bauplan.md`, Phase 3 / AP-E1;
Quelle: Onsite.ai-OS `origin/main@5c2c210`, Kategorie `Queue-Protokolle/`, gemappt).*
