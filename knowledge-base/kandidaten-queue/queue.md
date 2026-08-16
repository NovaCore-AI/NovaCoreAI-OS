# Kandidaten-Queue development — Übergangs-Queue im OS-Repo, append-only

> Kandidaten für die Kern-SSOT. Eintrag = Einzeiler + Verweis, nie Volltext
> („Kern verlinkt, Abteilung dokumentiert"). Zeilen werden nie gelöscht; befördert
> wird durch Statuswechsel.
>
> **Übergangszustand:** Die Abteilung `development` liegt heute repo-intern und hat kein eigenes
> Satelliten-Repo. Solange das so ist, ist **diese Datei** ihre Queue (Feld `uebergang` in
> `plugins/nc-development/pflege-auspraegung.json`). Eingebracht wird sie über den **regulären
> Branch/PR-Fluss dieses Repos** — **nicht** über `/nc:queue-abteilung`, das ausschließlich für
> Abteilungs-Satelliten-Klone gilt.
>
> **Format:** verbindlich `plugins/nc/referenz/pflege-auspraegung.md`, Abschnitt 4
> (Queue-Format v1). Fünf Spalten, ISO-Datum, Status `offen` · `befördert (PR #n)` ·
> `abgelehnt (PR #n)`; die einzige erlaubte Transition ist `offen → befördert/abgelehnt`.
> Keine Secrets, Tokens, Kundendaten oder personenbezogenen Pfade — dieses Repo ist öffentlich.

| Datum | Einzeiler | Verweis | erfülltes Kriterium | Status |
|---|---|---|---|---|
| 2026-08-16 | GF3-Eintrag: Ausgelieferter Portkopf trug einen Klarnamen (I9-Verstoß, extern per GLM-Review gefunden, behoben) — Lehre: Rollen-Regel gilt auch für Fußblöcke in plugins/** | debugging-findings/agent-learnings.md (Eintrag 2026-08-16, OS-Repo) | GF3, c | offen |

---

*Angelegt 2026-08-16 durch Claude (Opus 5, Claude Code) auf Weisung Lucas Vöhringer (Bauplan
[`grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md`](../grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md),
Phase 3 / AP-E1). Quelle: Onsite.ai-OS `origin/main@5c2c210`, Queue-Format v1 aus
`plugins/oai/referenz/pflege-auspraegung.md` Abschnitt 4, gemappt (`Kandidaten-Queue/` →
`kandidaten-queue/`). **Bewusste Abweichung vom Vorbild:** Die Beispielzeile des Vorbilds
(„Beispielzeile beim Anlegen entfernen") wird **nicht** übernommen — die Queue startet leer.*
