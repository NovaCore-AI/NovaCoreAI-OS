# Onsite-Endstand-Nachbau Phase 3 — Queue-Flow & Development-Plugin (Kern 0.10.0, nc-development 0.2.0)

Vollzug von Bauplan `grundwissen/2026-08-15-onsite-endstand-nachbau-bauplan.md` Phase 3
(AP-E1–E3, AP-F1–F2; Nachträge N6/N8). Basis: `main@489a909` (nach Merge PR #20).

## Was gebaut wurde

### AP-E1 — Queue-Referenz, Kriterienapparat, Formate
- `plugins/nc/referenz/pflege-auspraegung.md`: Schema v1 der `pflege-auspraegung.json`,
  Queue-Format v1 (append-only Fünf-Spalten-Tabelle), **Kriterienliste v1 (Erstfassung)**:
  Kriterien a–d, Gegenkriterien GF1–GF4, No-Duplicate-Regel.
- Standardprozesse `knowledge-base/standardprozesse/queue-flow.md` (acht Stationen,
  QS-Prüfpunkte, 14-Tage-Takt + 1 Tag Versatz) und `kriterien-pflege.md`; Definitionsdokument
  `grundwissen/NovaCore-OS-Kriterienliste-Definition.md`.
- Erste reale Ausprägung `plugins/nc-development/pflege-auspraegung.json`.
- Zwei neue Wissensbasis-Kategorien: `kandidaten-queue/` (Übergangs-Queue `development`) und
  `queue-protokolle/` (Kern-Ledger, heute `PLATZHALTER.md`).
- Prüfbaustein `plugins/nc/tests/queue-os.test.mjs`.

### AP-E2 — Kern-Skills `/nc:queue-abteilung` und `/nc:queue-kern`
- Station 2 liest **nur** `origin/<standardbranch>`; Standardbranch-Divergenz- und
  `behind>0`-Abbruch; Ledger „Befördertes nie re-evaluieren"; Dry-Run; Verdichtungsfall =
  Hand-Marker; Secrets-Preflight; Remote-Identitätsprüfung vor jedem Fetch.
- **Push/PR je Lauf freigabepflichtig** — stehende Freigabe bewusst NICHT portiert
  (offener Maintainer-Entscheid, `queue-flow.md` §6).

### AP-E3 — Fälligkeits-Hook `nc-queue-faelligkeit.js`
- Dritter SessionStart-Hook (kein Gate), 14-Tage-Takt nach Firmenspezifikation N6 statt
  Onsite-Wochentakt, +1 Tag Versatz, fail-open, max. 5 Git-Calls, kein Netz; Lauf-Marker
  `~/.claude/nc/queue-lauf.json`; Registry-Andockpunkte `kernRepoPfad`/`abteilungsRepoPfade`;
  Opt-out `NC_QUEUE_CHECK=off`. 45 Tests (inkl. drei NC-Zusatzproben).
- `/nc:end-session` Schritt 8: Queue-Klassifikation scharf.

### AP-F1/F2 — nc-development-Modernisierung
- Synthese-Bauplan `grundwissen/2026-08-16-nc-development-modernisierung-bauplan.md`
  (Erstanwendung `abteilungs-inhalts-pruefung.md`, zwei unabhängige Prüfläufe, Drift-Matrix
  mit 10 Befunden, Anhänge).
- **Erste ausgelieferte Abteilungs-CLAUDE (Ebene 2)** `development-abteilungs-claude.md`
  inkl. Lese-Verdrahtung in `/nc:start` Schritt 7.
- Vier neue Skills in zwei neuen Modulen: `qs-bugfix`, `qs-abnahme` (Modul `qs`) sowie
  `rel-vorbereitung`, `rel-verifikation` (Modul `rel`, `disable-model-invocation: true`) —
  Abteilung jetzt **15 Skills in 6 Modulen**.
- `workflow.md` +SSOT-Abschnitt, Abteilungs-README, `wzs-blocker-gate`-Jira-Fix,
  Frische-Marker; `nc-sync.md` §6 Sprachregel N6-präzisiert; Nachzüge
  (AGENTS/README/Registry/CHANGELOG/Bumps 0.10.0 + 0.2.0).

## Verifikation

- Testsuite: **192 Tests / 191 bestanden / 1 übersprungen** (POSIX-only) — +52 ggü. Phase 2.
- `claude plugin validate .` / `plugins/nc --strict` / `plugins/nc-development --strict`: bestanden.
- Klarnamen- und Secret-Scan über `plugins/**` und Diff: sauber.

## Review-Kette

1. GLM-5.3 R1: 1 MAJOR (Klarname in ausgeliefertem Fußblock → gefixt), 2 MINOR, 1 NIT — gefixt.
2. Codex R1: 9 MAJOR/6 MINOR — 13 gefixt/dokumentiert, 2 begründet abgelehnt (F5 Onsite-Parität
   per `queue-flow.md` §5; F12 Verteilannahme).
3. Restfixes (claude-netz-bau §4 Ebene-2-Zeile, PLATZHALTER-Wortlaut, CHANGELOG N8.5-Abnahme-
   Wortlaut + Testzahl).
4. **Review-Runde 2** (beide gegen `review-paket-phase3.md`, danach gelöscht):
   GLM-5.3 — 0 BLOCKER/0 MAJOR/3 MINOR/1 NIT, alle eingearbeitet (Hook-Kommentar schemaVersion,
   Vorlage Queue-Kategorien, queue-flow Dry-Run-Präzisierung, Bauplan-Testzahl). Codex —
   0 BLOCKER/**2 MAJOR**/4 MINOR, alle eingearbeitet: (M1) queue-kern-Erstlauf löscht
   `PLATZHALTER.md` und stellt den Index um (als geplante Pflichtänderungen in Schritt 9/10);
   (M2) PR-Body-Fallback für jeden nicht lesbaren Head, fail-closed bei Unklarheit;
   (m3) Dirty-Worktree-Baseline in Schritt 4/10; (m4) Hook schreibt ohne Sperre nie in den
   Read-modify-write-Abschnitt (`--lauf` meldet Exit 1) + Negativprobe; (m5) Sofort-Pfad×GF1-
   Klarstellung in Referenz + `end-session`; (m6) Marker-Identität (Datum + Einzeiler) im
   Wächter + adversariale Gegenprobe. Suite dadurch 192/191/1.

## Abnahme-Gate: Kriterienliste v1 (Maintainer-Abnahme des Wortlauts)

**Der Merge dieses PRs gilt als Abnahme des Wortlauts der Kriterienliste v1**
(`plugins/nc/referenz/pflege-auspraegung.md`, Abschnitt Kriterienliste v1: Kriterien a–d,
Gegenkriterien GF1–GF4, No-Duplicate; Bauplan-Nachtrag N8.5, `kriterien-pflege.md` §2 Schritt 3).
Wer merged, nimmt diesen Wortlaut als verbindlich für alle Abteilungen an.

## Bekannte, gewollte Zustände (keine Findings)

- CHANGELOG bleibt Sammelabschnitt unter `[Unreleased]` (E7 — Tags/Release am Umbau-Ende);
  Versionen 0.10.0/0.2.0 sind trotzdem gebumpt.
- Queue-Skills/Hook laufen heute in den Übergangs-Befund (kein Abteilungs-Satellit) — by design (E1);
  Praxisprobe/Dry-Run als offener Punkt in `queue-flow.md` §6.
- `reserve/*`-Anker-Tags nicht gesetzt (E4 vertagt, Einzel-Freigabe) — Ersatz-Anker E6/N1.
- `.nc/` untracked ohne gitignore-Eintrag (Zustimmung ausstehend).

## Offene Punkte nach Merge (Register)

- reserve-Tags `nc-0.10.0`/`nc-development-0.2.0` (E4, Einzel-Freigabe).
- Queue-Praxisprobe: Dry-Run `/nc:queue-kern` (queue-flow.md §6).
- GF3-Queue-Zeile wartet auf ersten Kern-Aufstiegslauf.
- Onsite #59/#61/#62-Prüfpunkt bleibt bestehen.
- Stehende PR-Freigabe (queue-flow.md §6) — Maintainer-Entscheid.
