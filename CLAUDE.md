@AGENTS.md

# CLAUDE.md — NovaCoreAI-OS (Claude-Code-Einstieg)

> **Warum diese Datei existiert:** Claude Code liest beim Sitzungsstart `CLAUDE.md`, nicht
> `AGENTS.md` (Claude-Code-Doku „How Claude remembers your project", Abschnitt AGENTS.md,
> abgerufen 2026-08-25). Die normative Quelle dieses Repos bleibt `AGENTS.md` — die
> Import-Zeile oben lädt sie vollständig, damit Mensch, Claude und Fremd-Harnesses dieselben
> Regeln lesen. Bis 2026-08-25 war `CLAUDE.md` hier un-getrackt; auf jedem frischen Klon fehlte
> damit der Pflicht-Einstieg (Struktur-Paritätsaudit gegen Onsite.ai-OS `a9927b2`).
>
> **Nichts doppelt pflegen:** Regeln, Repo-Karte, Standardzyklus und Abschluss-Checkliste
> stehen **nur** in `AGENTS.md`. Hier steht ausschließlich, was Claude Code als Werkzeug
> betrifft. Persönliche Arbeitsnotizen gehören in `CLAUDE.local.md` (gitignored, wird
> automatisch mitgeladen) — nie hierher.

## Claude Code

- **Prüfzyklus wortgleich** wie in `AGENTS.md` (Glob, nie Verzeichnis-Argument):
  `node --test plugins/nc/tests/*.test.mjs` · `claude plugin validate .` ·
  `claude plugin validate plugins/<name> --strict` je berührtem Plugin.
- **Worktree-Pflicht bei Parallelarbeit:** zweite Session, zweiter Agent oder Nachtschicht
  schreiben nie im Haupt-Checkout — `git worktree add .worktrees/<branch> -b <typ>/<thema>`
  (`.worktrees/` ist gitignored). Vor dem ersten Schreiben `git worktree list` prüfen.
- **Dieses Repo ist das Produkt, nicht die Laufzeit:** Das Kern-Plugin `nc` ist hier nicht
  als `/nc:`-Namespace aufrufbar. Skills des Kerns (`/nc:start`, `/nc:end-session`, …) werden
  hier **gebaut**; wer ihre Prozedur braucht, führt sie nach der jeweiligen `SKILL.md` von
  Hand aus und nimmt kein Ersatz-Kommando (Nachtschicht-Regel R2, Phase I).
- **Hooks des installierten Kerns** (FFG, Start-Gate, Safety-Gate, …) greifen auch beim
  Arbeiten an diesem Repo, wenn `nc` auf der Maschine installiert ist — sie sind Netz, kein
  Hindernis; kein Gate deaktivieren, um schneller zu sein (Regel R4).
- **Wissensarbeit** läuft über die Router `wissen-aendern` / `wissen-planen` /
  `wissen-nachschlagen` / `wissen-protokolle` (Zeiger auf Knoten, nie Volltext-Kopien) und
  den Aktualisierungs-Index für den Änderungsumfang.
