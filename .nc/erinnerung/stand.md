# Stand (konsolidiert) — 2026-08-17, nach Phase-3-Merge (PR #21)

## Aktueller Arbeitsstand
- **Onsite-Endstand-Nachbau Phase 3 IST ABGESCHLOSSEN UND GEMERGT:** PR #21
  (`34b8c57`, Admin-Merge nach Policy-Blockade) — Queue-Flow AP-E1–E3 +
  Development-Modernisierung AP-F1–F2 komplett auf `main`. Kern **0.10.0**,
  nc-development **0.2.0** (15 Skills / 6 Module). Testsuite **192/191/1** grün,
  Plugin-Validierung dreifach bestanden, CI (6 Jobs + CodeQL) grün.
- Review-Kette vollständig: GLM-5.3 R1+R2, Codex R1+R2 — alle Findings eingearbeitet
  oder begründet abgelehnt; Abnahme-Gate „Kriterienliste v1" durch Merge erfüllt
  (N8.5: Merge = Wortlaut-Abnahme).
- Working Tree sauber bis auf `.nc/` (untracked, gitignore-Entscheidung offen) und
  lokale Hilfsdateien `.nc/pr-body-phase3.md` / `.nc/commit-msg-phase3.txt`.

## Offene Punkte (alle im Register mit Verweis)
- Remote-Branch `feat/onsite-endstand-phase-3` auf origin steht noch (Löschen nicht
  angefragt). Lokaler Branch existiert noch.
- reserve-Tags `nc-0.10.0` / `nc-development-0.2.0` (E4, Einzel-Freigabe Maintainer).
- Queue-Praxisprobe: Dry-Run `/nc:queue-kern` (queue-flow.md §6, nach Merge fahren).
- GF3-Queue-Zeile (erste echte) wartet auf ersten Kern-Aufstiegslauf.
- Onsite-Upstream-Prüfpunkt #59/#61/#62 bleibt bestehen.
- Stehende PR-Freigabe Queue-Flow (queue-flow.md §6) — Maintainer-Entscheid.
- `.nc/` in `.gitignore` aufnehmen (Zustimmung ausstehend).
- @claude-GitHub-Bot ohne Reaktion — Installation prüfen.
- Livetests Executor/Reconciler/PreCompact (Maintainer).
- **Nächster großer Schritt: E7 — gesammeltes Release am Umbau-Ende** (Tags +
  GitHub-Releases + CHANGELOG-Schnitt je Plugin), außerdem Phase-4-/Schluss-Verifikation
  des Bauplans 2026-08-15 prüfen (alle AP A–F durch?).

## Zuletzt getroffene Entscheidungen
- Review-R2-Codex-MAJORs als Skill-Regel-Ergänzungen gelöst (Erstlauf-Pflichten,
  Head-Fallback fail-closed, Baseline) statt Architekturänderung.
- Hook-Sperre: ohne Lock kein Schreibabschnitt (SessionStart still, `--lauf` Exit 1).
- Kriterienliste-Abnahme über Admin-Merge eingelöst (User-Weisung).

## Aktive Branches / PRs
- Kein offener PR. `main` @ `34b8c57`.

## Bekannte Risiken
- Keine neuen. Alt: Remote-Branch-Aufräum-Rückstand.

## Nächster Schritt
- Maintainer-Abgabe: E7-Release-Vorbereitung ODER Aufräumen (Remote-Branch, Tags) —
  User-Entscheidung am Session-Start.
